import { DoctorSubscriptionPlan } from '@/types';
import { getDoctorEntitlements } from './doctor-entitlements';

export type DoctorAccessErrorCode = 
  | 'CASE_LIMIT_REACHED'
  | 'ATTACHMENTS_NOT_INCLUDED'
  | 'ADVANCED_ANALYTICS_NOT_INCLUDED'
  | 'FULL_SCHEDULE_NOT_INCLUDED'
  | 'PROMOTIONAL_TOOLS_NOT_INCLUDED'
  | 'STAFF_USERS_NOT_INCLUDED';

export interface DoctorAccessCheckResult {
  allowed: boolean;
  errorCode?: DoctorAccessErrorCode;
  errorMessageAr?: string;
  errorMessageEn?: string;
}

export function checkCaseAccess(caseIndex: number, plan: DoctorSubscriptionPlan): DoctorAccessCheckResult {
  const entitlements = getDoctorEntitlements(plan);
  if (entitlements.monthlyCaseLimit !== -1 && caseIndex >= entitlements.monthlyCaseLimit) {
    return {
      allowed: false,
      errorCode: 'CASE_LIMIT_REACHED',
      errorMessageAr: 'تم الوصول إلى الحد الأقصى للحالات المجانية (3 حالات). يرجى الترقية إلى الباقة المهنية لفتح هذه الحالة.',
      errorMessageEn: 'Monthly Free plan limit reached (3 cases). Upgrade to Professional to unlock this case.'
    };
  }
  return { allowed: true };
}

export function checkAttachmentAccess(plan: DoctorSubscriptionPlan): DoctorAccessCheckResult {
  const entitlements = getDoctorEntitlements(plan);
  if (!entitlements.canOpenAttachments) {
    return {
      allowed: false,
      errorCode: 'ATTACHMENTS_NOT_INCLUDED',
      errorMessageAr: 'فتح المرفقات والتقارير الطبية غير متاح في الباقة المجانية. ترقية الباقة مطلوبة.',
      errorMessageEn: 'Opening medical attachments is not included in the Free plan. Upgrade required.'
    };
  }
  return { allowed: true };
}

export function checkAdvancedAnalyticsAccess(plan: DoctorSubscriptionPlan): DoctorAccessCheckResult {
  const entitlements = getDoctorEntitlements(plan);
  if (!entitlements.canViewAdvancedAnalytics) {
    return {
      allowed: false,
      errorCode: 'ADVANCED_ANALYTICS_NOT_INCLUDED',
      errorMessageAr: 'التحليلات المتقدمة ومحمع التحويل غير متاحة في الباقة المجانية.',
      errorMessageEn: 'Advanced funnel analytics are not included in the Free plan.'
    };
  }
  return { allowed: true };
}

export function checkFullScheduleAccess(plan: DoctorSubscriptionPlan): DoctorAccessCheckResult {
  const entitlements = getDoctorEntitlements(plan);
  if (!entitlements.canManageSchedule) {
    return {
      allowed: false,
      errorCode: 'FULL_SCHEDULE_NOT_INCLUDED',
      errorMessageAr: 'إدارة الجدول المتقدمة والاستراحات غير متاحة في باقتك الحالية.',
      errorMessageEn: 'Full schedule & break management is not included in your current plan.'
    };
  }
  return { allowed: true };
}

export function checkPromotionalToolsAccess(plan: DoctorSubscriptionPlan): DoctorAccessCheckResult {
  const entitlements = getDoctorEntitlements(plan);
  if (!entitlements.canUsePromotionalTools) {
    return {
      allowed: false,
      errorCode: 'PROMOTIONAL_TOOLS_NOT_INCLUDED',
      errorMessageAr: 'أدوات الحملات الترويجية متاحة فقط لمشتركي الباقة المتميزة VIP.',
      errorMessageEn: 'Promotional campaign tools are available exclusively to VIP subscribers.'
    };
  }
  return { allowed: true };
}

export function checkStaffUsersAccess(plan: DoctorSubscriptionPlan): DoctorAccessCheckResult {
  const entitlements = getDoctorEntitlements(plan);
  if (!entitlements.canAddStaffUsers) {
    return {
      allowed: false,
      errorCode: 'STAFF_USERS_NOT_INCLUDED',
      errorMessageAr: 'إضافة مساعدين أو طاقم للعيادة متاح بدءاً من الباقة المهنية.',
      errorMessageEn: 'Adding staff members is included starting from the Professional plan.'
    };
  }
  return { allowed: true };
}
