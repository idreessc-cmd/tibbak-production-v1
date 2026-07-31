import { Case, Appointment } from '@/types';
import { createCase } from '@/lib/repositories/cases';
import { getDoctorByIdIncludingUnavailable } from '@/lib/repositories/doctors';
import { getHospitalByIdIncludingUnavailable } from '@/lib/repositories/hospitals';
import { getProviderOperationalErrorCode } from '@/lib/providers/provider-availability';
import { establishDemoPatientSessionAfterBooking, DemoPatientSession } from '@/lib/demo/demo-patient-session';

export interface CompleteDemoBookingParams {
  doctorId?: string | null;
  hospitalId?: string | null;
  serviceType: 'hospital' | 'clinic' | 'online' | 'medical-tourism';
  appointmentDate?: string;
  appointmentTime?: string;
  patientName: string;
  patientPhone: string;
  patientCountry?: string;
  patientCity?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  patientReason?: string;
  patientFiles?: string[];
  consentAgreed?: boolean;
  isDemoPath?: boolean;
}

export interface CompleteDemoBookingResult {
  success: boolean;
  errorCode?: string;
  message?: string;
  caseRecord?: Case;
  appointment?: Appointment;
  patientSession?: DemoPatientSession;
}

export async function completeDemoBooking(
  params: CompleteDemoBookingParams
): Promise<CompleteDemoBookingResult> {
  // 1. Validate provider operational availability prior to any creation
  const doc = params.doctorId ? getDoctorByIdIncludingUnavailable(params.doctorId) : null;
  const hosp = params.hospitalId ? getHospitalByIdIncludingUnavailable(params.hospitalId) : null;
  const provider = doc || hosp;

  if (!provider) {
    return { success: false, errorCode: 'PROVIDER_NOT_FOUND', message: 'Target provider not found' };
  }

  const statusErr = getProviderOperationalErrorCode(provider);
  if (statusErr) {
    return { success: false, errorCode: statusErr, message: `Provider is currently ${provider.operationalStatus}` };
  }

  // 2. Execute case & appointment creation
  const result = await createCase({
    doctor_id: params.doctorId || null,
    hospital_id: params.hospitalId || null,
    service_type: params.serviceType,
    appointment_date: params.appointmentDate || new Date().toISOString().split('T')[0],
    appointment_time: params.appointmentTime || '10:00 AM',
    patient_name: params.patientName,
    patient_phone: params.patientPhone,
    patient_country: params.patientCountry || 'Jordan',
    patient_city: params.patientCity || 'Amman',
    patient_age: params.patientAge || 35,
    patient_gender: params.patientGender || 'male',
    patient_reason: params.patientReason || '',
    patient_files: params.patientFiles || [],
    consent_agreed: params.consentAgreed ?? true,
    is_demo_path: params.isDemoPath ?? true
  });

  if (!result.success || !result.caseRecord) {
    return {
      success: false,
      errorCode: result.errorCode || 'BOOKING_FAILED',
      message: result.message || 'Failed to create case'
    };
  }

  // 3. Atomically establish patient session upon successful creation
  const session = establishDemoPatientSessionAfterBooking({
    patientId: result.caseRecord.patient_id,
    patientName: result.caseRecord.patient_name,
    caseId: result.caseRecord.id,
    bookingId: result.appointment?.id
  });

  return {
    success: true,
    caseRecord: result.caseRecord,
    appointment: result.appointment,
    patientSession: session
  };
}
