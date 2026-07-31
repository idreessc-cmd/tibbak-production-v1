import { Appointment, AppointmentStatus } from '@/types';

export interface AppointmentStatusMeta {
  key: AppointmentStatus;
  labelAr: string;
  labelEn: string;
  colorClass: string;
  isActive: boolean;
}

export const ALL_APPOINTMENT_STATUSES: Record<AppointmentStatus, AppointmentStatusMeta> = {
  requested: {
    key: 'requested',
    labelAr: 'بانتظار التأكيد',
    labelEn: 'Awaiting Confirmation',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    isActive: true
  },
  scheduled: {
    key: 'scheduled',
    labelAr: 'مؤكد ومحدد',
    labelEn: 'Scheduled',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    isActive: true
  },
  cancelled: {
    key: 'cancelled',
    labelAr: 'ملغى',
    labelEn: 'Cancelled',
    colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
    isActive: false
  },
  completed: {
    key: 'completed',
    labelAr: 'زيارة مكتملة',
    labelEn: 'Completed',
    colorClass: 'bg-blue-50 text-blue-800 border-blue-200',
    isActive: false
  },
  no_show: {
    key: 'no_show',
    labelAr: 'لم يحضر المريض',
    labelEn: 'No Show',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    isActive: false
  }
};

/**
 * Returns true if an appointment is active (reserving a schedule slot).
 * Both 'requested' and 'scheduled' appointments reserve slots to protect against double bookings.
 */
export function isAppointmentActive(appointment?: Appointment | null): boolean {
  if (!appointment) return false;
  return appointment.status === 'requested' || appointment.status === 'scheduled';
}

export function canConfirmAppointment(appointment?: Appointment | null): { allowed: boolean; errorCode?: string; messageAr?: string; messageEn?: string } {
  if (!appointment) {
    return { allowed: false, errorCode: 'APPOINTMENT_NOT_FOUND', messageAr: 'الموعد غير موجود.', messageEn: 'Appointment not found.' };
  }
  if (appointment.status === 'scheduled') {
    return { allowed: false, errorCode: 'APPOINTMENT_ALREADY_CONFIRMED', messageAr: 'الموعد مؤكد ومحدد مسبقاً.', messageEn: 'Appointment is already confirmed and scheduled.' };
  }
  if (appointment.status === 'cancelled' || appointment.status === 'completed' || appointment.status === 'no_show') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: `لا يمكن تأكيد موعد حالته (${appointment.status}).`, messageEn: `Cannot confirm an appointment with status (${appointment.status}).` };
  }
  return { allowed: true };
}

export function canRescheduleAppointment(appointment?: Appointment | null): boolean {
  if (!appointment) return false;
  return appointment.status === 'requested' || appointment.status === 'scheduled';
}

export function canCancelAppointment(appointment?: Appointment | null): boolean {
  if (!appointment) return false;
  return appointment.status === 'requested' || appointment.status === 'scheduled';
}

export function canMarkAppointmentAttended(appointment?: Appointment | null): { allowed: boolean; errorCode?: string; messageAr?: string; messageEn?: string } {
  if (!appointment) {
    return { allowed: false, errorCode: 'APPOINTMENT_NOT_FOUND', messageAr: 'الموعد غير موجود.', messageEn: 'Appointment not found.' };
  }
  if (appointment.status === 'requested') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: 'يجب تأكيد الموعد وتحديده أولاً قبل تسجيل الحضور.', messageEn: 'Appointment must be confirmed and scheduled before marking attended.' };
  }
  if (appointment.status === 'completed') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: 'الزيارة مكتملة مسبقاً.', messageEn: 'Visit already marked completed.' };
  }
  if (appointment.status === 'cancelled' || appointment.status === 'no_show') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: `لا يمكن تسجيل حضور موعد حالته (${appointment.status}).`, messageEn: `Cannot mark attended for appointment with status (${appointment.status}).` };
  }
  return { allowed: true };
}

export function canMarkAppointmentNoShow(appointment?: Appointment | null): { allowed: boolean; errorCode?: string; messageAr?: string; messageEn?: string } {
  if (!appointment) {
    return { allowed: false, errorCode: 'APPOINTMENT_NOT_FOUND', messageAr: 'الموعد غير موجود.', messageEn: 'Appointment not found.' };
  }
  if (appointment.status === 'requested') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: 'يجب تأكيد الموعد وتحديده أولاً قبل تسجيل عدم الحضور.', messageEn: 'Appointment must be confirmed and scheduled before marking no-show.' };
  }
  if (appointment.status === 'no_show') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: 'تم تسجيل عدم الحضور مسبقاً.', messageEn: 'No-show already marked.' };
  }
  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    return { allowed: false, errorCode: 'INVALID_APPOINTMENT_TRANSITION', messageAr: `لا يمكن تسجيل عدم حضور موعد حالته (${appointment.status}).`, messageEn: `Cannot mark no-show for appointment with status (${appointment.status}).` };
  }
  return { allowed: true };
}

export function getAppointmentStatusLabel(status: AppointmentStatus, isRtl: boolean): string {
  const meta = ALL_APPOINTMENT_STATUSES[status];
  if (!meta) return status;
  return isRtl ? meta.labelAr : meta.labelEn;
}
