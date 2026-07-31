import { 
  PrivacyRequest, 
  PrivacyRequestStatus, 
  AdminActionResult, 
  DoctorSubscriptionPlan 
} from '@/types';
import { recordAdminAuditEvent } from '@/lib/audit/admin-audit-log';
import { adminUpdateDoctorSubscriptionPlan, activeMockDoctors } from '@/lib/repositories/doctors';
import { activeMockHospitals } from '@/lib/repositories/hospitals';
import { pauseCampaignsForProvider } from '@/lib/campaigns/sponsored-campaigns';
import { 
  getVerificationRequests, 
  updateProviderVerification, 
  updateVerificationStatus,
  resetVerificationQueue 
} from '@/lib/admin/provider-verification';

export { getVerificationRequests, updateProviderVerification, updateVerificationStatus, resetVerificationQueue };

// Mock Privacy Requests Queue
const inMemoryPrivacyRequests: PrivacyRequest[] = [
  {
    id: 'priv-001',
    caseId: 'CASE-2026-000154',
    requestType: 'data_export',
    status: 'submitted',
    requesterRole: 'patient',
    descriptionAr: 'طلب تصدير النسخة الآمنة من سجّلات المواعيد السابقة (بيانات آمنة فقط)',
    descriptionEn: 'Request export of safe appointment history logs',
    submittedAt: '2026-07-23T16:00:00Z',
    updatedAt: '2026-07-23T16:00:00Z'
  },
  {
    id: 'priv-002',
    caseId: undefined,
    requestType: 'pii_inquiry',
    status: 'under_review',
    requesterRole: 'patient',
    descriptionAr: 'الاستفسار عن حظر ظهور رقم الهاتف والواتساب للأطباء غير المشاركين',
    descriptionEn: 'Inquiry regarding phone/WhatsApp privacy masking for providers',
    submittedAt: '2026-07-24T10:00:00Z',
    updatedAt: '2026-07-24T11:00:00Z'
  }
];

export function suspendProvider(
  providerId: string, 
  providerType: 'doctor' | 'hospital', 
  category: string, 
  reason: string
): AdminActionResult {
  if (!reason || !reason.trim()) {
    return {
      success: false,
      errorCode: 'REASON_REQUIRED',
      messageAr: 'سبب التوقيف الإداري مطلوب.',
      messageEn: 'Suspension reason is required.'
    };
  }

  if (providerType === 'doctor') {
    const doc = activeMockDoctors.find(d => d.id === providerId);
    if (!doc) {
      return { success: false, errorCode: 'PROVIDER_NOT_FOUND', messageAr: 'مزود الخدمة غير موجود.', messageEn: 'Provider not found.' };
    }
    if (doc.operationalStatus === 'suspended') {
      return { success: false, errorCode: 'PROVIDER_ALREADY_SUSPENDED', messageAr: 'مزود الخدمة موقوف مسبقاً.', messageEn: 'Provider is already suspended.' };
    }

    doc.operationalStatus = 'suspended';
  } else {
    const hosp = activeMockHospitals.find(h => h.id === providerId);
    if (!hosp) {
      return { success: false, errorCode: 'PROVIDER_NOT_FOUND', messageAr: 'المستشفى غير موجود.', messageEn: 'Hospital not found.' };
    }
    if (hosp.operationalStatus === 'suspended') {
      return { success: false, errorCode: 'PROVIDER_ALREADY_SUSPENDED', messageAr: 'المستشفى موقوف مسبقاً.', messageEn: 'Hospital is already suspended.' };
    }

    hosp.operationalStatus = 'suspended';
  }

  // Atomic operation: Auto pause active sponsored campaigns
  const pausedCampaignsCount = pauseCampaignsForProvider(providerId, `Auto-paused due to provider suspension (${category}: ${reason})`);

  recordAdminAuditEvent({
    action: 'provider_suspended',
    entityType: 'provider',
    entityId: providerId,
    beforeSummary: 'OperationalStatus: active',
    afterSummary: `OperationalStatus: suspended (Category: ${category}, Paused Campaigns: ${pausedCampaignsCount})`,
    reason
  });

  return { success: true };
}

export function reactivateProvider(
  providerId: string, 
  providerType: 'doctor' | 'hospital', 
  reason: string
): AdminActionResult {
  if (!reason || !reason.trim()) {
    return {
      success: false,
      errorCode: 'REASON_REQUIRED',
      messageAr: 'سبب إعادة التفعيل مطلوب.',
      messageEn: 'Reactivation reason is required.'
    };
  }

  if (providerType === 'doctor') {
    const doc = activeMockDoctors.find(d => d.id === providerId);
    if (!doc) {
      return { success: false, errorCode: 'PROVIDER_NOT_FOUND', messageAr: 'مزود الخدمة غير موجود.', messageEn: 'Provider not found.' };
    }
    if (doc.operationalStatus === 'active') {
      return { success: false, errorCode: 'PROVIDER_ALREADY_ACTIVE', messageAr: 'مزود الخدمة نشط مسبقاً.', messageEn: 'Provider is already active.' };
    }

    doc.operationalStatus = 'active';
  } else {
    const hosp = activeMockHospitals.find(h => h.id === providerId);
    if (!hosp) {
      return { success: false, errorCode: 'PROVIDER_NOT_FOUND', messageAr: 'المستشفى غير موجود.', messageEn: 'Hospital not found.' };
    }
    if (hosp.operationalStatus === 'active') {
      return { success: false, errorCode: 'PROVIDER_ALREADY_ACTIVE', messageAr: 'المستشفى نشط مسبقاً.', messageEn: 'Hospital is already active.' };
    }

    hosp.operationalStatus = 'active';
  }

  recordAdminAuditEvent({
    action: 'provider_reactivated',
    entityType: 'provider',
    entityId: providerId,
    beforeSummary: 'OperationalStatus: suspended',
    afterSummary: 'OperationalStatus: active (Campaigns NOT auto-resumed)',
    reason
  });

  return { success: true };
}

export async function adminChangeDoctorSubscriptionPlan(
  doctorId: string, 
  newPlan: DoctorSubscriptionPlan, 
  reason?: string
): Promise<AdminActionResult> {
  const doc = activeMockDoctors.find(d => d.id === doctorId);
  if (!doc) {
    return { success: false, errorCode: 'DOCTOR_NOT_FOUND', messageAr: 'الطبيب غير موجود.', messageEn: 'Doctor not found.' };
  }

  const prevPlan = doc.subscriptionPlan;
  if (prevPlan === newPlan) {
    return { success: false, errorCode: 'SAME_SUBSCRIPTION_PLAN', messageAr: 'الطبيب مشترك مسبقاً في هذه الباقة.', messageEn: 'Doctor is already on this plan.' };
  }

  await adminUpdateDoctorSubscriptionPlan(doctorId, newPlan);

  recordAdminAuditEvent({
    action: 'subscription_plan_changed',
    entityType: 'subscription',
    entityId: doctorId,
    beforeSummary: `Plan: ${prevPlan} (${doc.name_ar})`,
    afterSummary: `Plan: ${newPlan}`,
    reason: reason || `Admin updated plan from ${prevPlan} to ${newPlan}`
  });

  return { success: true };
}

export function updateDoctorEditorialOrder(
  doctorId: string, 
  newOrder: number, 
  reason: string
): AdminActionResult {
  const doc = activeMockDoctors.find(d => d.id === doctorId);
  if (!doc) {
    return { success: false, errorCode: 'DOCTOR_NOT_FOUND', messageAr: 'الطبيب غير موجود.', messageEn: 'Doctor not found.' };
  }

  const prevOrder = doc.organicSortOrder;
  doc.organicSortOrder = newOrder;

  recordAdminAuditEvent({
    action: 'editorial_sort_order_changed',
    entityType: 'ranking',
    entityId: doctorId,
    beforeSummary: `organicSortOrder: ${prevOrder} (${doc.name_ar})`,
    afterSummary: `organicSortOrder: ${newOrder}`,
    reason: `Editorial adjustment: ${reason}`
  });

  return { success: true };
}

export function getPrivacyRequests(): PrivacyRequest[] {
  return [...inMemoryPrivacyRequests];
}

export function isValidPrivacyRequestTransition(
  currentStatus: PrivacyRequestStatus,
  targetStatus: PrivacyRequestStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  const allowedMap: Record<PrivacyRequestStatus, PrivacyRequestStatus[]> = {
    submitted: ['under_review'],
    under_review: ['completed', 'rejected'],
    completed: [], // Terminal
    rejected: []   // Terminal
  };

  return allowedMap[currentStatus]?.includes(targetStatus) || false;
}

export function resolvePrivacyRequest(
  requestId: string, 
  newStatus: PrivacyRequestStatus, 
  reason?: string
): AdminActionResult<PrivacyRequest> {
  const idx = inMemoryPrivacyRequests.findIndex(r => r.id === requestId);
  if (idx === -1) {
    return { success: false, errorCode: 'PRIVACY_REQUEST_NOT_FOUND', messageAr: 'طلب الخصوصية غير موجود.', messageEn: 'Privacy request not found.' };
  }

  const prev = inMemoryPrivacyRequests[idx];

  // Validate state machine transition FIRST
  if (!isValidPrivacyRequestTransition(prev.status, newStatus)) {
    return {
      success: false,
      errorCode: 'INVALID_PRIVACY_REQUEST_TRANSITION',
      messageAr: `انتقال غير مسموح به لطلب الخصوصية من (${prev.status}) إلى (${newStatus}).`,
      messageEn: `Invalid privacy request status transition from ${prev.status} to ${newStatus}.`
    };
  }

  if ((newStatus === 'completed' || newStatus === 'rejected') && (!reason || !reason.trim())) {
    return {
      success: false,
      errorCode: 'REASON_REQUIRED',
      messageAr: 'سبب معالجة طلب الخصوصية مطلوب.',
      messageEn: 'Reason is required for resolving privacy request.'
    };
  }

  const defaultReason = newStatus === 'completed'
    ? 'تمت محاكاة إكمال طلب تصدير البيانات لأغراض العرض التجريبي. لم يتم إنشاء أو إرسال تصدير حقيقي. (The data export request was marked complete as a demo simulation. No real export was generated or delivered.)'
    : `Privacy request status updated to ${newStatus}`;

  const updated: PrivacyRequest = {
    ...prev,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    resolutionReason: reason || prev.resolutionReason || defaultReason
  };

  inMemoryPrivacyRequests[idx] = updated;

  recordAdminAuditEvent({
    action: `privacy_request_${newStatus}`,
    entityType: 'privacy',
    entityId: requestId,
    beforeSummary: `Status: ${prev.status}`,
    afterSummary: `Status: ${newStatus}`,
    reason: reason || defaultReason
  });

  return { success: true, data: updated };
}

export function resetPrivacyRequests(): void {
  inMemoryPrivacyRequests.length = 0;
  inMemoryPrivacyRequests.push(
    {
      id: 'priv-001',
      caseId: 'CASE-2026-000154',
      requestType: 'data_export',
      status: 'submitted',
      requesterRole: 'patient',
      descriptionAr: 'طلب تصدير النسخة الآمنة من سجّلات المواعيد السابقة (بيانات آمنة فقط)',
      descriptionEn: 'Request export of safe appointment history logs',
      submittedAt: '2026-07-23T16:00:00Z',
      updatedAt: '2026-07-23T16:00:00Z'
    },
    {
      id: 'priv-002',
      caseId: undefined,
      requestType: 'pii_inquiry',
      status: 'under_review',
      requesterRole: 'patient',
      descriptionAr: 'الاستفسار عن حظر ظهور رقم الهاتف والواتساب للأطباء غير المشاركين',
      descriptionEn: 'Inquiry regarding phone/WhatsApp privacy masking for providers',
      submittedAt: '2026-07-24T10:00:00Z',
      updatedAt: '2026-07-24T11:00:00Z'
    }
  );
}
