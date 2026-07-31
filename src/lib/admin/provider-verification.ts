import { 
  VerificationRequest, 
  ProviderVerificationStatus, 
  AdminActionResult 
} from '@/types';
import { recordAdminAuditEvent } from '@/lib/audit/admin-audit-log';
import { activeMockDoctors } from '@/lib/repositories/doctors';

// In-memory Verification Queue
export const inMemoryVerificationQueue: VerificationRequest[] = [
  {
    id: 'verif-doc-1',
    providerId: 'doc-1',
    providerType: 'doctor',
    providerNameAr: 'د. فراس الخطيب',
    providerNameEn: 'Dr. Firas Khatib',
    specialtyOrTypeAr: 'جراحة العظام والمفاصل',
    specialtyOrTypeEn: 'Orthopedic Surgery',
    cityAr: 'عمان',
    cityEn: 'Amman',
    status: 'pending',
    licenseNumber: 'JMC-2024-8841',
    qualificationEvidenceAr: 'شهادة البورد الأردني في جراحة العظام والمفاصل',
    qualificationEvidenceEn: 'Jordanian Board Certificate in Orthopedics',
    submittedAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-07-15T10:00:00Z',
    history: [
      {
        id: 'vhist-1',
        providerId: 'doc-1',
        providerType: 'doctor',
        previousStatus: 'pending',
        newStatus: 'verified',
        actorRole: 'admin',
        actorId: 'admin-1',
        reason: 'License verified via Medical Council database.',
        createdAt: '2026-07-15T10:00:00Z'
      }
    ]
  },
  {
    id: 'verif-doc-2',
    providerId: 'doc-2',
    providerType: 'doctor',
    providerNameAr: 'د. مريم النجار',
    providerNameEn: 'Dr. Maryam Al-Najjar',
    specialtyOrTypeAr: 'طب الأطفال الحديثي الولادة',
    specialtyOrTypeEn: 'Pediatrics',
    cityAr: 'إربد',
    cityEn: 'Irbid',
    status: 'pending',
    licenseNumber: 'JMC-2025-1102',
    qualificationEvidenceAr: 'شهادة الاختصاص العالي من وزارة الصحة',
    qualificationEvidenceEn: 'Higher Specialty Certificate from MOH',
    submittedAt: '2026-07-22T11:30:00Z',
    updatedAt: '2026-07-22T11:30:00Z',
    history: []
  },
  {
    id: 'verif-doc-4',
    providerId: 'doc-4',
    providerType: 'doctor',
    providerNameAr: 'د. سامح الحسيني',
    providerNameEn: 'Dr. Sameh Al-Husseini',
    specialtyOrTypeAr: 'أمراض القلب والشرايين',
    specialtyOrTypeEn: 'Cardiology',
    cityAr: 'عمان',
    cityEn: 'Amman',
    status: 'needs_information',
    licenseNumber: 'JMC-2023-4412',
    qualificationEvidenceAr: 'وثيقة تصريح مزاولة المهن الطبية',
    qualificationEvidenceEn: 'Medical License Document',
    submittedAt: '2026-07-21T14:00:00Z',
    updatedAt: '2026-07-23T08:00:00Z',
    history: [
      {
        id: 'vhist-2',
        providerId: 'doc-4',
        providerType: 'doctor',
        previousStatus: 'pending',
        newStatus: 'needs_information',
        actorRole: 'admin',
        actorId: 'admin-1',
        reason: 'Awaiting updated clinic registration certificate.',
        createdAt: '2026-07-23T08:00:00Z'
      }
    ]
  }
];

export function getVerificationRequests(): VerificationRequest[] {
  return [...inMemoryVerificationQueue];
}

export function isValidVerificationTransition(
  currentStatus: ProviderVerificationStatus,
  targetStatus: ProviderVerificationStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  const allowedMap: Record<ProviderVerificationStatus, ProviderVerificationStatus[]> = {
    pending: ['under_review', 'rejected'],
    under_review: ['verified', 'needs_information', 'rejected'],
    needs_information: ['under_review'],
    verified: [], // Terminal unless explicit admin override
    rejected: []  // Terminal
  };

  return allowedMap[currentStatus]?.includes(targetStatus) || false;
}

export function updateProviderVerification(
  requestId: string,
  targetStatus: ProviderVerificationStatus,
  reason?: string
): AdminActionResult<VerificationRequest> {
  const idx = inMemoryVerificationQueue.findIndex(r => r.id === requestId);
  if (idx === -1) {
    return {
      success: false,
      errorCode: 'VERIFICATION_REQUEST_NOT_FOUND',
      messageAr: 'طلب التحقق غير موجود.',
      messageEn: 'Verification request not found.'
    };
  }

  const req = inMemoryVerificationQueue[idx];
  const currentStatus = req.status;

  if (targetStatus === 'rejected' && (!reason || !reason.trim())) {
    return {
      success: false,
      errorCode: 'REASON_REQUIRED',
      messageAr: 'سبب رفض التوثيق مطلوب.',
      messageEn: 'Reason is required for rejecting verification.'
    };
  }

  if (!isValidVerificationTransition(currentStatus, targetStatus)) {
    return {
      success: false,
      errorCode: 'INVALID_VERIFICATION_TRANSITION',
      messageAr: `انتقال غير مسموح به من حالة (${currentStatus}) إلى (${targetStatus}).`,
      messageEn: `Invalid verification status transition from ${currentStatus} to ${targetStatus}.`
    };
  }

  const historyEvent = {
    id: `vhist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    providerId: req.providerId,
    providerType: req.providerType,
    previousStatus: currentStatus,
    newStatus: targetStatus,
    actorRole: 'admin' as const,
    actorId: 'admin-1',
    reason: reason || `Updated verification status to ${targetStatus}`,
    createdAt: new Date().toISOString()
  };

  const updatedReq: VerificationRequest = {
    ...req,
    status: targetStatus,
    updatedAt: new Date().toISOString(),
    history: [...req.history, historyEvent]
  };

  inMemoryVerificationQueue[idx] = updatedReq;

  // Sync is_verified on doctor record
  if (req.providerType === 'doctor') {
    const doc = activeMockDoctors.find(d => d.id === req.providerId);
    if (doc) {
      doc.is_verified = (targetStatus === 'verified');
    }
  }

  recordAdminAuditEvent({
    action: `verification_${targetStatus}`,
    entityType: 'verification',
    entityId: req.providerId,
    beforeSummary: `Status: ${currentStatus} (${req.providerNameAr})`,
    afterSummary: `Status: ${targetStatus}`,
    reason: reason || `Updated verification status to ${targetStatus}`
  });

  return { success: true, data: updatedReq };
}

export const updateVerificationStatus = updateProviderVerification;

export function resetVerificationQueue(): void {
  inMemoryVerificationQueue.length = 0;
  inMemoryVerificationQueue.push(
    {
      id: 'verif-doc-1',
      providerId: 'doc-1',
      providerType: 'doctor',
      providerNameAr: 'د. فراس الخطيب',
      providerNameEn: 'Dr. Firas Khatib',
      specialtyOrTypeAr: 'جراحة العظام والمفاصل',
      specialtyOrTypeEn: 'Orthopedic Surgery',
      cityAr: 'عمان',
      cityEn: 'Amman',
      status: 'pending',
      licenseNumber: 'JMC-2024-8841',
      qualificationEvidenceAr: 'شهادة البورد الأردني في جراحة العظام والمفاصل',
      qualificationEvidenceEn: 'Jordanian Board Certificate in Orthopedics',
      submittedAt: '2026-07-15T09:00:00Z',
      updatedAt: '2026-07-15T10:00:00Z',
      history: []
    },
    {
      id: 'verif-doc-2',
      providerId: 'doc-2',
      providerType: 'doctor',
      providerNameAr: 'د. مريم النجار',
      providerNameEn: 'Dr. Maryam Al-Najjar',
      specialtyOrTypeAr: 'طب الأطفال الحديثي الولادة',
      specialtyOrTypeEn: 'Pediatrics',
      cityAr: 'إربد',
      cityEn: 'Irbid',
      status: 'pending',
      licenseNumber: 'JMC-2025-1102',
      qualificationEvidenceAr: 'شهادة الاختصاص العالي من وزارة الصحة',
      qualificationEvidenceEn: 'Higher Specialty Certificate from MOH',
      submittedAt: '2026-07-22T11:30:00Z',
      updatedAt: '2026-07-22T11:30:00Z',
      history: []
    }
  );
}
