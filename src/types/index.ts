import { ProviderOperationalStatus } from './admin';

export type UserRole = 'patient' | 'doctor' | 'hospital' | 'admin';
export type DoctorSubscriptionPlan = 'free' | 'professional' | 'vip';
export type HospitalRank = 'basic' | 'premium' | 'international';
export type ProviderType = 'doctor' | 'hospital';

export interface ProviderTarget {
  provider_type: ProviderType;
  provider_id: string;
}

export type CaseStatus = 
  | 'new'
  | 'under_review'
  | 'waiting_doctor'
  | 'more_information_required'
  | 'accepted'
  | 'appointment_scheduled'
  | 'visit_completed'
  | 'cancelled'
  | 'no_show'
  | 'completed'
  | 'closed';

export type MessageType = 'text' | 'image' | 'pdf' | 'voice';
export type AppointmentStatus = 'requested' | 'scheduled' | 'cancelled' | 'completed' | 'no_show';

export interface LockedLeadPreview {
  caseId: string;
  specialtyNameAr: string;
  specialtyNameEn: string;
  cityNameAr: string;
  cityNameEn: string;
  serviceType: 'clinic' | 'online' | 'hospital' | 'medical-tourism';
  receivedAt: string;
  ageRange: string;
  gender: 'male' | 'female';
  generalCategoryAr: string;
  generalCategoryEn: string;
  isLocked: true;
}

export interface GatedCaseDetails {
  caseData: ProviderCaseSummary | Case;
  isLocked: false;
}

export type ProviderCaseAccessResult = 
  | { access: 'granted'; gatedDetails: GatedCaseDetails }
  | { access: 'locked'; preview: LockedLeadPreview; remainingLimit: number };

export interface Specialty {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
}

export interface City {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
}

export interface Package {
  id: string;
  name_ar: string;
  name_en: string;
  role: 'doctor' | 'hospital';
  price_monthly: number;
  lead_limit: number; // e.g. 3 for free, -1 for unlimited
  features_ar: string[];
  features_en: string[];
}

export interface Hospital {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  city_id: string;
  address_ar: string;
  address_en: string;
  description_ar: string;
  description_en: string;
  is_verified: boolean;
  rank: HospitalRank;
  package_id: string;
  beds_count: number;
  surgeries_count: number;
  accreditations_ar: string[];
  accreditations_en: string[];
  operationalStatus: ProviderOperationalStatus; // Required administrative status
}

export interface Doctor {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  specialty_id: string;
  city_id: string;
  hospital_id: string | null;
  title_ar: string;
  title_en: string;
  bio_ar: string;
  bio_en: string;
  experience_years: number;
  consultation_fee_jod: number;
  rating: number;
  reviews_count: number;
  patients_count: number;
  is_verified: boolean;
  gender?: 'male' | 'female';
  
  // Core Required Commercial & Ranking Fields
  subscriptionPlan: DoctorSubscriptionPlan; // Canonical subscription plan
  isSponsored: boolean;                     // Explicit promotional campaign badge flag
  sponsoredUntil?: string | null;            // Campaign expiration date
  organicSortOrder: number;                 // Deterministic tie-breaker (NOT paid rank)
  operationalStatus: ProviderOperationalStatus; // Required administrative status

  package_id: string;
  languages: string[];
  address_ar: string;
  address_en: string;
  first_available_date: string; // e.g. "2026-07-24"

  // Phase 4 Doctor Offer Fields (Demo/Local State)
  offer_enabled?: boolean;
  offer_type?: 'percentage' | 'fixed';
  offer_value?: number;
  offer_start_date?: string; // ISO datetime string
  offer_end_date?: string;   // ISO datetime string
}

export interface CaseStatusHistory {
  id: string;
  caseId: string;
  previousStatus: CaseStatus | null;
  newStatus: CaseStatus;
  actorRole: 'patient' | 'doctor' | 'system' | 'admin';
  actorId: string;
  createdAt: string;
  reason?: string;
}

export interface ConsentRecord {
  agreed: boolean;
  timestamp: string;
  locale: string;
  consent_text: string;
}

export interface CaseAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface Case {
  id: string; // Format: CASE-2026-XXXXXX
  patient_id: string;
  doctor_id: string | null;
  hospital_id: string | null;
  status: CaseStatus;
  status_history?: CaseStatusHistory[];
  created_at: string;
  lead_source?: string;
  
  // Patient Details
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_country: string;
  patient_city: string;
  patient_age: number;
  patient_gender: 'male' | 'female';
  patient_reason: string;
  patient_files: string[];
  attachments?: CaseAttachment[];
  consent_record?: ConsentRecord;
}

/**
 * Safe Provider-facing Case DTO (structurally excludes patient phone, email, and attachment files)
 */
export interface ProviderCaseSummary {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  hospital_id: string | null;
  status: CaseStatus;
  status_history?: CaseStatusHistory[];
  created_at: string;
  lead_source?: string;
  
  // Safe Patient Details (NO patient_phone, patient_email, patient_files, attachments, maskedPhone, maskedEmail)
  patient_name: string;
  patient_country: string;
  patient_city: string;
  patient_age: number;
  patient_gender: 'male' | 'female';
  patient_reason: string;
  consent_record?: ConsentRecord;
}

/**
 * Safe Provider Attachment Metadata DTO (No raw files, base64, storage paths, bucket credentials, or contact info)
 */
export interface ProviderAttachmentMetadata {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  category: string;
}

/**
 * Guarded Authorized Attachments Result Type
 */
export type AuthorizedCaseAttachmentsResult =
  | {
      success: true;
      caseId: string;
      attachments: ProviderAttachmentMetadata[];
    }
  | {
      success: false;
      errorCode:
        | 'CASE_NOT_FOUND'
        | 'PROVIDER_CASE_ACCESS_DENIED'
        | 'PROVIDER_SUSPENDED'
        | 'CASE_ACCESS_LOCKED'
        | 'ATTACHMENTS_NOT_INCLUDED';
      attachments: [];
    };

/**
 * Safe Operational Admin Case DTO (structurally excludes all patient personal data, medical narrative, message text, files, and contact fields)
 */
export interface AdminCaseOperationalSummary {
  id: string;
  doctor_id: string | null;
  hospital_id: string | null;
  specialty: string;
  city: string;
  status: CaseStatus;
  created_at: string;
  last_activity_at?: string;
  lead_source?: string;
  access_state: 'accessible' | 'locked';
  response_sla_state: 'on_time' | 'delayed';
  appointment_status?: string;
  consent_present: boolean;
  attachment_count: number;
}

/**
 * Compile-time assertion ensuring contact, narrative, and attachment fields DO NOT exist on safe DTO types
 */
export type AssertNoContactField<T, K extends string> = K extends keyof T ? never : true;
export type TestProviderCaseSummaryPhone = AssertNoContactField<ProviderCaseSummary, 'patient_phone'>;
export type TestProviderCaseSummaryEmail = AssertNoContactField<ProviderCaseSummary, 'patient_email'>;
export type TestProviderCaseSummaryFiles = AssertNoContactField<ProviderCaseSummary, 'patient_files'>;
export type TestProviderCaseSummaryAttachments = AssertNoContactField<ProviderCaseSummary, 'attachments'>;

export type TestAdminCaseSummaryName = AssertNoContactField<AdminCaseOperationalSummary, 'patient_name'>;
export type TestAdminCaseSummaryReason = AssertNoContactField<AdminCaseOperationalSummary, 'patient_reason'>;
export type TestAdminCaseSummaryPhone = AssertNoContactField<AdminCaseOperationalSummary, 'patient_phone'>;
export type TestAdminCaseSummaryEmail = AssertNoContactField<AdminCaseOperationalSummary, 'patient_email'>;
export type TestAdminCaseSummaryFiles = AssertNoContactField<AdminCaseOperationalSummary, 'patient_files'>;
export type TestAdminCaseSummaryAttachments = AssertNoContactField<AdminCaseOperationalSummary, 'attachments'>;
export type TestAdminCaseSummaryMessages = AssertNoContactField<AdminCaseOperationalSummary, 'messages'>;
export type TestAdminCaseSummaryMessageText = AssertNoContactField<AdminCaseOperationalSummary, 'message_text'>;

export type TestLockedLeadPreviewPhone = AssertNoContactField<LockedLeadPreview, 'patient_phone'>;
export type TestLockedLeadPreviewEmail = AssertNoContactField<LockedLeadPreview, 'patient_email'>;

export interface Message {
  id: string;
  case_id: string;
  sender_role: 'patient' | 'doctor' | 'system';
  sender_display_name?: string;
  text: string;
  type: MessageType;
  file_url?: string;
  created_at: string;
  is_read?: boolean;
}

export interface AppointmentSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  isAvailable: boolean;
  isBooked?: boolean;
  reasonUnavailable?: string;
}

export interface Appointment {
  id: string;
  case_id: string;
  doctor_id: string | null;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  notes?: string;
}

export interface PatientBookingInput {
  doctor_id: string | null;
  hospital_id: string | null;
  service_type: 'clinic' | 'online' | 'hospital' | 'medical-tourism';
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_phone: string;
  patient_country: string;
  patient_city: string;
  patient_age: number;
  patient_gender: 'male' | 'female';
  patient_reason: string;
  patient_files: string[];
  consent_agreed: boolean;
  is_demo_path?: boolean;
}

export interface BookingDraft extends PatientBookingInput {
  step: number;
  selected_slot?: AppointmentSlot;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider_id: string | null;
}

export interface InternationalRequest {
  id: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  target_type: 'doctor' | 'hospital' | 'general';
  doctor_id: string | null;
  hospital_id: string | null;
  patient_name: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  condition_description: string;
  specialty_id: string;
  budget_range: string | null;
  needs_hotel: boolean;
  needs_translator: boolean;
  needs_airport_pickup: boolean;
  consent_to_share: boolean;
}

export * from './admin';

