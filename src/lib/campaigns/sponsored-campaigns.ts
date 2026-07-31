import { SponsoredCampaign, SponsoredCampaignStatus, AdminActionResult } from '@/types';
import { recordAdminAuditEvent } from '@/lib/audit/admin-audit-log';
import { canProviderRunSponsoredCampaign } from '@/lib/providers/provider-availability';
import { getDoctorByIdIncludingUnavailable } from '@/lib/repositories/doctors';
import { getHospitalByIdIncludingUnavailable } from '@/lib/repositories/hospitals';

// Mock store for sponsored placement campaigns
const inMemoryCampaigns: SponsoredCampaign[] = [
  {
    id: 'camp-doc-1-demo',
    providerId: 'doc-1',
    providerType: 'doctor',
    providerNameAr: 'د. فراس الخطيب',
    providerNameEn: 'Dr. Firas Khatib',
    placement: 'search_top',
    startAt: '2026-08-01',
    endAt: '2026-08-31',
    status: 'draft',
    labelAr: 'حملة ترويجية لقسم جراحة العظام (مسودة)',
    labelEn: 'Promotional search campaign (Draft)',
    createdAt: '2026-07-20T08:00:00Z',
    updatedAt: '2026-07-20T08:00:00Z',
    createdBy: 'admin-1',
    reason: 'Pilot sponsored search promotion demo draft',
    isDemo: true
  }
];

export function getSponsoredCampaigns(): SponsoredCampaign[] {
  return [...inMemoryCampaigns];
}

export function isValidCampaignTransition(
  currentStatus: SponsoredCampaignStatus,
  targetStatus: SponsoredCampaignStatus
): boolean {
  if (currentStatus === targetStatus) return true;

  const allowedMap: Record<SponsoredCampaignStatus, SponsoredCampaignStatus[]> = {
    draft: ['scheduled', 'cancelled'], // MUST NOT transition directly draft -> active
    scheduled: ['active', 'cancelled'], // MUST NOT transition directly scheduled -> paused
    active: ['paused', 'ended'],
    paused: ['active', 'ended', 'cancelled'],
    ended: [],     // Terminal
    cancelled: []  // Terminal
  };

  return allowedMap[currentStatus]?.includes(targetStatus) || false;
}

export function isProviderCurrentlySponsored(providerId: string): boolean {
  const now = new Date().toISOString().substring(0, 10);

  // Dynamic live provider lookup
  const doc = getDoctorByIdIncludingUnavailable(providerId);
  const hosp = getHospitalByIdIncludingUnavailable(providerId);
  const provider = doc || hosp;

  if (provider && !canProviderRunSponsoredCampaign(provider)) {
    return false;
  }

  const activeCamp = inMemoryCampaigns.find(c => 
    c.providerId === providerId && 
    c.status === 'active' && 
    c.startAt <= now && 
    c.endAt >= now
  );

  return Boolean(activeCamp);
}

export function createSponsoredCampaign(params: {
  providerId: string;
  providerType: 'doctor' | 'hospital';
  providerNameAr: string;
  providerNameEn: string;
  placement: SponsoredCampaign['placement'];
  startAt: string;
  endAt: string;
  reason?: string;
}): AdminActionResult<SponsoredCampaign> {
  const doc = getDoctorByIdIncludingUnavailable(params.providerId);
  const hosp = getHospitalByIdIncludingUnavailable(params.providerId);
  const provider = doc || hosp;

  if (provider && !canProviderRunSponsoredCampaign(provider)) {
    return {
      success: false,
      errorCode: 'PROVIDER_SUSPENDED',
      messageAr: 'لا يمكن إنشاء أو تفعيل حملة إعلانية لمزود خدمة موقوف أو غير نشط.',
      messageEn: 'Cannot create or activate a campaign for a suspended or inactive provider.'
    };
  }

  const campaign: SponsoredCampaign = {
    id: `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    providerId: params.providerId,
    providerType: params.providerType,
    providerNameAr: params.providerNameAr,
    providerNameEn: params.providerNameEn,
    placement: params.placement,
    startAt: params.startAt,
    endAt: params.endAt,
    status: 'draft', // Initial creation MUST be draft
    labelAr: 'إعلان / sponsored',
    labelEn: 'Sponsored / إعلان',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin-1',
    reason: params.reason || 'Pilot sponsored placement created in draft',
    isDemo: true
  };

  inMemoryCampaigns.push(campaign);

  if (doc) {
    doc.isSponsored = isProviderCurrentlySponsored(doc.id);
  }

  recordAdminAuditEvent({
    action: 'campaign_created',
    entityType: 'campaign',
    entityId: campaign.id,
    beforeSummary: 'Campaign: none',
    afterSummary: `Campaign ${campaign.id} created (Status: draft) for ${campaign.providerNameAr} (${campaign.placement})`,
    reason: params.reason || 'Created pilot sponsored campaign draft'
  });

  return { success: true, data: campaign };
}

export function updateSponsoredCampaignStatus(
  campaignId: string, 
  newStatus: SponsoredCampaignStatus,
  reason?: string
): AdminActionResult<SponsoredCampaign> {
  const idx = inMemoryCampaigns.findIndex(c => c.id === campaignId);
  if (idx === -1) {
    return {
      success: false,
      errorCode: 'CAMPAIGN_NOT_FOUND',
      messageAr: 'الحملة الإعلانية غير موجودة.',
      messageEn: 'Sponsored campaign not found.'
    };
  }

  const prev = inMemoryCampaigns[idx];

  if (!isValidCampaignTransition(prev.status, newStatus)) {
    return {
      success: false,
      errorCode: 'INVALID_CAMPAIGN_TRANSITION',
      messageAr: `انتقال غير مسموح به في حالة الحملة من (${prev.status}) إلى (${newStatus}).`,
      messageEn: `Invalid campaign status transition from ${prev.status} to ${newStatus}.`
    };
  }

  const doc = getDoctorByIdIncludingUnavailable(prev.providerId);
  const hosp = getHospitalByIdIncludingUnavailable(prev.providerId);
  const provider = doc || hosp;

  if (newStatus === 'active' && provider && !canProviderRunSponsoredCampaign(provider)) {
    return {
      success: false,
      errorCode: 'PROVIDER_SUSPENDED',
      messageAr: 'لا يمكن تفعيل حملة إعلانية لمزود خدمة موقوف أو غير نشط.',
      messageEn: 'Cannot activate a campaign for a suspended or inactive provider.'
    };
  }

  const updated: SponsoredCampaign = {
    ...prev,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    reason: reason || prev.reason
  };

  inMemoryCampaigns[idx] = updated;

  if (doc) {
    doc.isSponsored = isProviderCurrentlySponsored(doc.id);
  }

  const actionName = newStatus === 'scheduled' ? 'campaign_scheduled' :
                     newStatus === 'active' ? 'campaign_activated' :
                     newStatus === 'paused' ? 'campaign_paused' :
                     newStatus === 'ended' ? 'campaign_ended' : `campaign_${newStatus}`;

  recordAdminAuditEvent({
    action: actionName,
    entityType: 'campaign',
    entityId: campaignId,
    beforeSummary: `Status: ${prev.status}`,
    afterSummary: `Status: ${newStatus}`,
    reason: reason || `Updated campaign status to ${newStatus}`
  });

  return { success: true, data: updated };
}

export function scheduleSponsoredCampaign(campaignId: string, reason?: string): AdminActionResult<SponsoredCampaign> {
  return updateSponsoredCampaignStatus(campaignId, 'scheduled', reason || 'Scheduled campaign activation date');
}

export function activateSponsoredCampaign(campaignId: string, reason?: string): AdminActionResult<SponsoredCampaign> {
  return updateSponsoredCampaignStatus(campaignId, 'active', reason || 'Activated sponsored campaign placement');
}

export function pauseSponsoredCampaign(campaignId: string, reason?: string): AdminActionResult<SponsoredCampaign> {
  return updateSponsoredCampaignStatus(campaignId, 'paused', reason || 'Paused sponsored campaign');
}

export function endSponsoredCampaign(campaignId: string, reason?: string): AdminActionResult<SponsoredCampaign> {
  return updateSponsoredCampaignStatus(campaignId, 'ended', reason || 'Ended sponsored campaign');
}

export function pauseCampaignsForProvider(providerId: string, reason: string): number {
  let count = 0;
  inMemoryCampaigns.forEach(c => {
    if (c.providerId === providerId && c.status === 'active') {
      c.status = 'paused';
      c.updatedAt = new Date().toISOString();
      c.reason = reason;
      count++;
      recordAdminAuditEvent({
        action: 'campaign_paused',
        entityType: 'campaign',
        entityId: c.id,
        beforeSummary: 'Status: active',
        afterSummary: 'Status: paused (Auto-paused due to provider suspension)',
        reason
      });
    }
  });

  const doc = getDoctorByIdIncludingUnavailable(providerId);
  if (doc) {
    doc.isSponsored = false;
  }

  return count;
}

export function resetSponsoredCampaigns(): void {
  inMemoryCampaigns.length = 0;
  inMemoryCampaigns.push({
    id: 'camp-doc-1-demo',
    providerId: 'doc-1',
    providerType: 'doctor',
    providerNameAr: 'د. فراس الخطيب',
    providerNameEn: 'Dr. Firas Khatib',
    placement: 'search_top',
    startAt: '2026-08-01',
    endAt: '2026-08-31',
    status: 'draft',
    labelAr: 'حملة ترويجية لقسم جراحة العظام (مسودة)',
    labelEn: 'Promotional search campaign (Draft)',
    createdAt: '2026-07-20T08:00:00Z',
    updatedAt: '2026-07-20T08:00:00Z',
    createdBy: 'admin-1',
    reason: 'Pilot sponsored search promotion demo draft',
    isDemo: true
  });
}
