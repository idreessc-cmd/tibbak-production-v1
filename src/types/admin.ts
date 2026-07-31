export type ProviderType = 'doctor' | 'hospital';

export type ProviderVerificationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'needs_information';

export type ProviderOperationalStatus =
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'archived';

export type SponsoredCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'ended'
  | 'cancelled';

export type PrivacyRequestType = 'data_export' | 'deletion' | 'consent_withdrawal' | 'pii_inquiry';
export type PrivacyRequestStatus = 'submitted' | 'under_review' | 'completed' | 'rejected';

export interface VerificationHistoryEvent {
  id: string;
  providerId: string;
  providerType: ProviderType;
  previousStatus: ProviderVerificationStatus;
  newStatus: ProviderVerificationStatus;
  actorRole: 'admin';
  actorId: string;
  reason?: string;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  providerId: string;
  providerType: ProviderType;
  providerNameAr: string;
  providerNameEn: string;
  specialtyOrTypeAr: string;
  specialtyOrTypeEn: string;
  cityAr: string;
  cityEn: string;
  status: ProviderVerificationStatus;
  licenseNumber: string; // Fictional license metadata
  qualificationEvidenceAr: string;
  qualificationEvidenceEn: string;
  submittedAt: string;
  updatedAt: string;
  history: VerificationHistoryEvent[];
}

export interface SponsoredCampaign {
  id: string;
  providerId: string;
  providerType: ProviderType;
  providerNameAr: string;
  providerNameEn: string;
  placement: 'search_top' | 'home_featured' | 'specialty_banner';
  startAt: string;
  endAt: string;
  status: SponsoredCampaignStatus;
  labelAr: string;
  labelEn: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reason?: string;
  isDemo: boolean;
}

export interface AdminAuditEvent {
  id: string;
  actorRole: 'admin';
  actorId: string;
  action: string;
  entityType: 'provider' | 'verification' | 'subscription' | 'campaign' | 'privacy' | 'ranking' | 'system';
  entityId: string;
  beforeSummary: string;
  afterSummary: string;
  reason?: string;
  createdAt: string;
  isDemo: boolean;
}

export interface PrivacyRequest {
  id: string;
  caseId?: string;
  requestType: PrivacyRequestType;
  status: PrivacyRequestStatus;
  requesterRole: 'patient' | 'provider' | 'system';
  descriptionAr: string;
  descriptionEn: string;
  submittedAt: string;
  updatedAt: string;
  resolutionReason?: string;
}

export interface AdminNotification {
  id: string;
  type: 'verification' | 'suspension' | 'subscription' | 'campaign' | 'privacy' | 'system';
  titleAr: string;
  titleEn: string;
  targetSection: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export interface AdminActionResult<T = unknown> {
  success: boolean;
  data?: T;
  errorCode?: string;
  messageAr?: string;
  messageEn?: string;
}
