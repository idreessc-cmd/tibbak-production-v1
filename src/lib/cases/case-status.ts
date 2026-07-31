import { CaseStatus } from '@/types';

export interface StatusMeta {
  key: CaseStatus;
  labelAr: string;
  labelEn: string;
  colorClass: string;
  isTerminal: boolean;
}

export const ALL_CASE_STATUSES: Record<CaseStatus, StatusMeta> = {
  new: {
    key: 'new',
    labelAr: 'طلب جديد',
    labelEn: 'New Request',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    isTerminal: false
  },
  under_review: {
    key: 'under_review',
    labelAr: 'قيد المراجعة',
    labelEn: 'Under Review',
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    isTerminal: false
  },
  waiting_doctor: {
    key: 'waiting_doctor',
    labelAr: 'بانتظار رد الطبيب',
    labelEn: 'Awaiting Doctor',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    isTerminal: false
  },
  more_information_required: {
    key: 'more_information_required',
    labelAr: 'مطلوب معلومات إضافية',
    labelEn: 'More Info Required',
    colorClass: 'bg-orange-50 text-orange-800 border-orange-200',
    isTerminal: false
  },
  accepted: {
    key: 'accepted',
    labelAr: 'تم قبول الطلب',
    labelEn: 'Request Accepted',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    isTerminal: false
  },
  appointment_scheduled: {
    key: 'appointment_scheduled',
    labelAr: 'تم تحديد الموعد',
    labelEn: 'Appointment Scheduled',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
    isTerminal: false
  },
  visit_completed: {
    key: 'visit_completed',
    labelAr: 'تمت الزيارة الطبية',
    labelEn: 'Visit Completed',
    colorClass: 'bg-teal-50 text-teal-700 border-teal-200',
    isTerminal: false
  },
  cancelled: {
    key: 'cancelled',
    labelAr: 'ملغى',
    labelEn: 'Cancelled',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
    isTerminal: false
  },
  no_show: {
    key: 'no_show',
    labelAr: 'لم يحضر المريض',
    labelEn: 'No Show',
    colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
    isTerminal: false
  },
  completed: {
    key: 'completed',
    labelAr: 'مكتمل بنجاح',
    labelEn: 'Completed',
    colorClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    isTerminal: false
  },
  closed: {
    key: 'closed',
    labelAr: 'مغلق وأرشيف',
    labelEn: 'Closed & Archived',
    colorClass: 'bg-slate-200 text-slate-700 border-slate-300',
    isTerminal: true
  }
};

export const ALLOWED_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  new: ['under_review', 'waiting_doctor', 'cancelled'],
  under_review: ['more_information_required', 'waiting_doctor', 'accepted', 'cancelled'],
  more_information_required: ['under_review', 'cancelled'],
  waiting_doctor: ['accepted', 'cancelled'],
  accepted: ['appointment_scheduled', 'cancelled'],
  appointment_scheduled: ['visit_completed', 'no_show', 'cancelled'],
  visit_completed: ['completed', 'closed'],
  no_show: ['closed'],
  completed: ['closed'],
  cancelled: ['closed'],
  closed: []
};

export function getStatusLabel(status: CaseStatus, isRtl: boolean): string {
  const meta = ALL_CASE_STATUSES[status];
  if (!meta) return status;
  return isRtl ? meta.labelAr : meta.labelEn;
}

export function isValidStatusTransition(currentStatus: CaseStatus, nextStatus: CaseStatus): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

export function validateCaseStatusTransition(
  currentStatus: CaseStatus, 
  nextStatus: CaseStatus
): { isValid: boolean; errorCode?: string; messageAr?: string; messageEn?: string } {
  if (currentStatus === nextStatus) return { isValid: true };
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return {
      isValid: false,
      errorCode: 'INVALID_STATUS_TRANSITION',
      messageAr: `الانتقال غير مسموح به من حالة (${currentStatus}) إلى حالة (${nextStatus}).`,
      messageEn: `Invalid transition from ${currentStatus} to ${nextStatus}.`
    };
  }
  return { isValid: true };
}

export function getAllowedNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
}
