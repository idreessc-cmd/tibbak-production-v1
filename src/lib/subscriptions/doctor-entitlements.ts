import { DoctorSubscriptionPlan } from '@/types';

export interface PlanEntitlements {
  plan: DoctorSubscriptionPlan;
  nameAr: string;
  nameEn: string;
  monthlyCaseLimit: number; // 3 for Free, -1 for unlimited
  priceMonthlyJod: number;
  priceNoteAr: string;
  priceNoteEn: string;
  canOpenAttachments: boolean;
  canManageSchedule: boolean;
  canViewBasicAnalytics: boolean;
  canViewAdvancedAnalytics: boolean;
  canAddStaffUsers: boolean;
  canUsePromotionalTools: boolean;
  supportLevelAr: string;
  supportLevelEn: string;
}

const ENTITLEMENTS_MAP: Record<DoctorSubscriptionPlan, PlanEntitlements> = {
  free: {
    plan: 'free',
    nameAr: 'الباقة المجانية (Free)',
    nameEn: 'Free Plan',
    monthlyCaseLimit: 3,
    priceMonthlyJod: 0,
    priceNoteAr: 'مجاناً خلال فترة التجربة',
    priceNoteEn: 'Free during the pilot',
    canOpenAttachments: false,
    canManageSchedule: true,
    canViewBasicAnalytics: true,
    canViewAdvancedAnalytics: false,
    canAddStaffUsers: false,
    canUsePromotionalTools: false,
    supportLevelAr: 'دعم أساسي خلال فترة التجربة',
    supportLevelEn: 'Basic support during the pilot'
  },
  professional: {
    plan: 'professional',
    nameAr: 'الباقة المهنية (Professional)',
    nameEn: 'Professional Plan',
    monthlyCaseLimit: -1, // Unlimited for demo
    priceMonthlyJod: 29,
    priceNoteAr: 'سعر تجريبي إسترشادي: 29 د.أ/شهر',
    priceNoteEn: 'Indicative pilot price: 29 JOD/mo',
    canOpenAttachments: true,
    canManageSchedule: true,
    canViewBasicAnalytics: true,
    canViewAdvancedAnalytics: true,
    canAddStaffUsers: true,
    canUsePromotionalTools: false,
    supportLevelAr: 'أولوية في الدعم خلال ساعات العمل خلال فترة التجربة',
    supportLevelEn: 'Priority support during business hours during the pilot'
  },
  vip: {
    plan: 'vip',
    nameAr: 'الباقة المتميزة (VIP)',
    nameEn: 'VIP Plan',
    monthlyCaseLimit: -1, // Unlimited for demo
    priceMonthlyJod: 59,
    priceNoteAr: 'سعر تجريبي إسترشادي: 59 د.أ/شهر',
    priceNoteEn: 'Indicative pilot price: 59 JOD/mo',
    canOpenAttachments: true,
    canManageSchedule: true,
    canViewBasicAnalytics: true,
    canViewAdvancedAnalytics: true,
    canAddStaffUsers: true,
    canUsePromotionalTools: true, // Campaign tool eligibility
    supportLevelAr: 'أولوية في الدعم خلال ساعات العمل خلال فترة التجربة',
    supportLevelEn: 'Priority support during business hours during the pilot'
  }
};

export function getDoctorEntitlements(plan: DoctorSubscriptionPlan): PlanEntitlements {
  return ENTITLEMENTS_MAP[plan] || ENTITLEMENTS_MAP.free;
}

export function isCaseAccessibleForDoctor(caseIndex: number, plan: DoctorSubscriptionPlan): boolean {
  const entitlements = getDoctorEntitlements(plan);
  if (entitlements.monthlyCaseLimit === -1) return true;
  return caseIndex < entitlements.monthlyCaseLimit;
}

export const PRIVACY_ENTITLEMENT_STATEMENT_EN = "Internal case access and in-platform communication entitlements change with plan.";
export const PRIVACY_ENTITLEMENT_STATEMENT_AR = "تتغير صلاحيات الوصول للطلبات الداخلية والتواصل داخل المنصة حسب الباقة.";
