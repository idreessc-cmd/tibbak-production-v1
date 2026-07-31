import { Case, Appointment, CaseStatusHistory } from '@/types';
import { inMemoryAppointments, inMemoryCases } from '@/data/mock/cases';
import { validateAppointmentSlotConflict } from './appointment-slots';
import { 
  canConfirmAppointment, 
  canMarkAppointmentAttended, 
  canMarkAppointmentNoShow 
} from '@/lib/appointments/appointment-status';
import { getDoctorByIdIncludingUnavailable } from './doctors';
import { getHospitalByIdIncludingUnavailable } from './hospitals';
import { getProviderOperationalErrorCode } from '@/lib/providers/provider-availability';
import { checkProviderCaseAccess } from './cases';

export interface ProviderTarget {
  type: 'doctor' | 'hospital';
  id: string;
}

export async function checkProviderCanActOnAppointment(
  appointmentId: string,
  providerTarget: ProviderTarget
): Promise<{ success: boolean; errorCode?: string; appointment?: Appointment; caseRecord?: Case }> {
  const apt = inMemoryAppointments.find(a => a.id === appointmentId);
  if (!apt) {
    return { success: false, errorCode: 'APPOINTMENT_NOT_FOUND' };
  }

  const c = inMemoryCases.find(item => item.id === apt.case_id);
  if (!c) {
    return { success: false, errorCode: 'CASE_NOT_FOUND' };
  }

  const doc = providerTarget.type === 'doctor' ? getDoctorByIdIncludingUnavailable(providerTarget.id) : null;
  const hosp = providerTarget.type === 'hospital' ? getHospitalByIdIncludingUnavailable(providerTarget.id) : null;
  const provider = doc || hosp;

  if (!provider) {
    return { success: false, errorCode: 'PROVIDER_APPOINTMENT_ACCESS_DENIED' };
  }

  const statusErr = getProviderOperationalErrorCode(provider);
  if (statusErr) {
    return { success: false, errorCode: statusErr };
  }

  const isAptOwner = providerTarget.type === 'doctor' 
    ? apt.doctor_id === providerTarget.id 
    : c.hospital_id === providerTarget.id;

  if (!isAptOwner) {
    return { success: false, errorCode: 'PROVIDER_APPOINTMENT_ACCESS_DENIED' };
  }

  const isCaseTargeted = providerTarget.type === 'doctor' 
    ? c.doctor_id === providerTarget.id 
    : c.hospital_id === providerTarget.id;

  if (!isCaseTargeted) {
    return { success: false, errorCode: 'PROVIDER_CASE_ACCESS_DENIED' };
  }

  if (providerTarget.type === 'doctor') {
    const access = await checkProviderCaseAccess(c.id, providerTarget.id);
    if (access.isLocked) {
      return { success: false, errorCode: 'CASE_ACCESS_LOCKED', appointment: apt, caseRecord: c };
    }
  }

  return { success: true, appointment: apt, caseRecord: c };
}

export async function createAppointment(
  caseId: string,
  doctorId: string,
  date: string,
  timeSlot: string,
  notes?: string
): Promise<Appointment> {
  await new Promise(resolve => setTimeout(resolve, 10));

  const newApt: Appointment = {
    id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    case_id: caseId,
    doctor_id: doctorId,
    date,
    time_slot: timeSlot,
    status: 'requested',
    notes
  };

  inMemoryAppointments.push(newApt);
  return newApt;
}

export async function getAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
  return inMemoryAppointments.filter(apt => apt.doctor_id === doctorId);
}

export async function confirmAppointment(
  appointmentId: string,
  actorTarget: ProviderTarget
): Promise<{ 
  success: boolean; 
  appointment?: Appointment; 
  caseStatus?: string; 
  historyEvents?: CaseStatusHistory[]; 
  errorCode?: string; 
  messageAr?: string; 
  messageEn?: string 
}> {
  const auth = await checkProviderCanActOnAppointment(appointmentId, actorTarget);
  if (!auth.success) {
    return {
      success: false,
      errorCode: auth.errorCode,
      messageAr: auth.errorCode === 'PROVIDER_SUSPENDED' ? 'الطبيب موقوف تشغيلياً.' : 'غير مصرح لك بإجراء تغيير على هذا الموعد.',
      messageEn: auth.errorCode === 'PROVIDER_SUSPENDED' ? 'Provider is suspended.' : 'Unauthorized to act on this appointment.'
    };
  }

  const aptIdx = inMemoryAppointments.findIndex(a => a.id === appointmentId);
  const currentApt = inMemoryAppointments[aptIdx];

  // Domain rule validation BEFORE state mutation
  const check = canConfirmAppointment(currentApt);
  if (!check.allowed) {
    return {
      success: false,
      errorCode: check.errorCode,
      messageAr: check.messageAr,
      messageEn: check.messageEn
    };
  }

  const c = inMemoryCases.find(item => item.id === currentApt.case_id);

  // Prepare status history events for canonical two-step transition: waiting_doctor -> accepted -> appointment_scheduled
  const now = new Date().toISOString();
  const historyEvents: CaseStatusHistory[] = [];

  if (c) {
    const actorId = currentApt.doctor_id || 'doc-1';

    if (c.status === 'waiting_doctor') {
      // Step 1: waiting_doctor -> accepted
      const acceptedEvent: CaseStatusHistory = {
        id: `hist-1-${Date.now()}`,
        caseId: c.id,
        previousStatus: 'waiting_doctor',
        newStatus: 'accepted',
        actorRole: 'doctor',
        actorId,
        createdAt: now,
        reason: 'Appointment request accepted'
      };

      // Step 2: accepted -> appointment_scheduled
      const scheduledEvent: CaseStatusHistory = {
        id: `hist-2-${Date.now()}`,
        caseId: c.id,
        previousStatus: 'accepted',
        newStatus: 'appointment_scheduled',
        actorRole: 'doctor',
        actorId,
        createdAt: now,
        reason: 'Appointment confirmed and scheduled'
      };

      historyEvents.push(acceptedEvent, scheduledEvent);

      // Perform atomic mutation
      c.status = 'appointment_scheduled';
      if (!c.status_history) c.status_history = [];
      c.status_history.push(acceptedEvent, scheduledEvent);
    } else {
      // Direct transition from another valid status (e.g. accepted -> appointment_scheduled)
      const scheduledEvent: CaseStatusHistory = {
        id: `hist-${Date.now()}`,
        caseId: c.id,
        previousStatus: c.status,
        newStatus: 'appointment_scheduled',
        actorRole: 'doctor',
        actorId,
        createdAt: now,
        reason: 'Appointment confirmed by doctor'
      };
      historyEvents.push(scheduledEvent);

      c.status = 'appointment_scheduled';
      if (!c.status_history) c.status_history = [];
      c.status_history.push(scheduledEvent);
    }
  }

  // Atomically persist appointment update
  inMemoryAppointments[aptIdx] = { 
    ...currentApt, 
    status: 'scheduled',
    notes: currentApt.notes || 'Confirmed by doctor'
  };

  return { 
    success: true, 
    appointment: inMemoryAppointments[aptIdx], 
    caseStatus: 'appointment_scheduled',
    historyEvents 
  };
}

export async function rescheduleAppointment(
  appointmentId: string,
  newDate: string,
  newTimeSlot: string,
  actorTarget: ProviderTarget
): Promise<{ success: boolean; appointment?: Appointment; errorCode?: string }> {
  const auth = await checkProviderCanActOnAppointment(appointmentId, actorTarget);
  if (!auth.success) return { success: false, errorCode: auth.errorCode };

  const aptIdx = inMemoryAppointments.findIndex(a => a.id === appointmentId);
  const targetApt = inMemoryAppointments[aptIdx];

  // Validate Slot Availability (rescheduling requested or scheduled appointment)
  if (targetApt.doctor_id) {
    const isConflicting = validateAppointmentSlotConflict(targetApt.doctor_id, newDate, newTimeSlot, targetApt.id);
    if (isConflicting) {
      return { success: false, errorCode: 'APPOINTMENT_SLOT_UNAVAILABLE' };
    }
  }

  // Perform reschedule
  inMemoryAppointments[aptIdx] = {
    ...targetApt,
    date: newDate,
    time_slot: newTimeSlot
  };

  const updatedApt = inMemoryAppointments[aptIdx];

  // Record status history event
  const c = inMemoryCases.find(item => item.id === updatedApt.case_id);
  if (c) {
    if (!c.status_history) c.status_history = [];
    c.status_history.push({
      id: `hist-${Date.now()}`,
      caseId: c.id,
      previousStatus: c.status,
      newStatus: c.status,
      actorRole: 'doctor',
      actorId: updatedApt.doctor_id || 'doc-1',
      createdAt: new Date().toISOString(),
      reason: `Rescheduled to ${newDate} ${newTimeSlot}`
    });
  }

  return { success: true, appointment: updatedApt };
}

export async function cancelAppointment(
  appointmentId: string, 
  reason?: string,
  actorRole: 'patient' | 'doctor' | 'system' | 'admin' = 'doctor',
  actorTarget?: ProviderTarget
): Promise<{ success: boolean; appointment?: Appointment; errorCode?: string }> {
  if (actorRole === 'doctor' && actorTarget) {
    const auth = await checkProviderCanActOnAppointment(appointmentId, actorTarget);
    if (!auth.success) return { success: false, errorCode: auth.errorCode };
  }

  const aptIdx = inMemoryAppointments.findIndex(a => a.id === appointmentId);
  if (aptIdx > -1) {
    inMemoryAppointments[aptIdx] = { 
      ...inMemoryAppointments[aptIdx], 
      status: 'cancelled',
      notes: reason || inMemoryAppointments[aptIdx].notes 
    };
    const apt = inMemoryAppointments[aptIdx];

    const c = inMemoryCases.find(item => item.id === apt.case_id);
    if (c) {
      const prevStatus = c.status;
      c.status = 'cancelled';
      if (!c.status_history) c.status_history = [];
      c.status_history.push({
        id: `hist-${Date.now()}`,
        caseId: c.id,
        previousStatus: prevStatus,
        newStatus: 'cancelled',
        actorRole: 'doctor',
        actorId: apt.doctor_id || 'doc-1',
        createdAt: new Date().toISOString(),
        reason: reason || 'Cancelled by doctor'
      });
    }
    return { success: true, appointment: apt };
  }
  return { success: false, errorCode: 'APPOINTMENT_NOT_FOUND' };
}

export async function markAppointmentAttended(
  appointmentId: string,
  actorTarget: ProviderTarget
): Promise<{ success: boolean; appointment?: Appointment; errorCode?: string; messageAr?: string; messageEn?: string }> {
  const auth = await checkProviderCanActOnAppointment(appointmentId, actorTarget);
  if (!auth.success) return { success: false, errorCode: auth.errorCode };

  const aptIdx = inMemoryAppointments.findIndex(a => a.id === appointmentId);
  const targetApt = inMemoryAppointments[aptIdx];

  const check = canMarkAppointmentAttended(targetApt);
  if (!check.allowed) {
    return {
      success: false,
      errorCode: check.errorCode,
      messageAr: check.messageAr,
      messageEn: check.messageEn
    };
  }

  inMemoryAppointments[aptIdx] = { ...targetApt, status: 'completed' };
  const apt = inMemoryAppointments[aptIdx];

  const c = inMemoryCases.find(item => item.id === apt.case_id);
  if (c) {
    const prevStatus = c.status;
    c.status = 'visit_completed';
    if (!c.status_history) c.status_history = [];
    c.status_history.push({
      id: `hist-${Date.now()}`,
      caseId: c.id,
      previousStatus: prevStatus,
      newStatus: 'visit_completed',
      actorRole: 'doctor',
      actorId: apt.doctor_id || 'doc-1',
      createdAt: new Date().toISOString(),
      reason: 'Patient attended appointment visit'
    });
  }
  return { success: true, appointment: apt };
}

export async function markAppointmentNoShow(
  appointmentId: string,
  actorTarget: ProviderTarget
): Promise<{ success: boolean; appointment?: Appointment; errorCode?: string; messageAr?: string; messageEn?: string }> {
  const auth = await checkProviderCanActOnAppointment(appointmentId, actorTarget);
  if (!auth.success) return { success: false, errorCode: auth.errorCode };

  const aptIdx = inMemoryAppointments.findIndex(a => a.id === appointmentId);
  const targetApt = inMemoryAppointments[aptIdx];

  const check = canMarkAppointmentNoShow(targetApt);
  if (!check.allowed) {
    return {
      success: false,
      errorCode: check.errorCode,
      messageAr: check.messageAr,
      messageEn: check.messageEn
    };
  }

  inMemoryAppointments[aptIdx] = { ...targetApt, status: 'no_show', notes: 'Patient no-show' };
  const apt = inMemoryAppointments[aptIdx];

  const c = inMemoryCases.find(item => item.id === apt.case_id);
  if (c) {
    const prevStatus = c.status;
    c.status = 'no_show';
    if (!c.status_history) c.status_history = [];
    c.status_history.push({
      id: `hist-${Date.now()}`,
      caseId: c.id,
      previousStatus: prevStatus,
      newStatus: 'no_show',
      actorRole: 'doctor',
      actorId: apt.doctor_id || 'doc-1',
      createdAt: new Date().toISOString(),
      reason: 'Patient did not attend scheduled appointment'
    });
  }
  return { success: true, appointment: apt };
}
