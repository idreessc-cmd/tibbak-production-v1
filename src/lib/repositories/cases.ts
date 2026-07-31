import { 
  Case, Message, Appointment, CaseStatus, CaseStatusHistory, 
  PatientBookingInput, LockedLeadPreview, ProviderCaseAccessResult,
  ProviderCaseSummary, AdminCaseOperationalSummary 
} from '@/types';
import { inMemoryCases, inMemoryMessages, inMemoryAppointments } from '@/data/mock/cases';
import { getDoctorById } from './doctors';
import { isValidStatusTransition, ALL_CASE_STATUSES } from '@/lib/cases/case-status';

const STORAGE_KEY_CASES = 'tibbak_cases_db_v1';
const STORAGE_KEY_MSGS = 'tibbak_msgs_db_v1';
const STORAGE_KEY_APTS = 'tibbak_apts_db_v1';

// Helper: Phone Masking for safe views
export function maskPhone(phone: string): string {
  if (!phone) return '07*******12';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    const lastTwo = digits.slice(-2);
    return `07*******${lastTwo}`;
  }
  return '07*******12';
}

// Contact pattern detection in text messages (Phone, Email, WhatsApp, tel:, mailto:)
export function detectExternalContactPattern(text: string): boolean {
  if (!text) return false;
  const phoneRegex = /(?:\+?962|07)[0-9]{8,9}|[0-9]{10,12}/i;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const whatsappRegex = /wa\.me|whatsapp|واتساب|واتس/i;
  const schemeRegex = /tel:|mailto:/i;
  return phoneRegex.test(text) || emailRegex.test(text) || whatsappRegex.test(text) || schemeRegex.test(text);
}

// Client Session Storage Persistence Wrappers
function loadActiveCases(): Case[] {
  if (typeof window === 'undefined') return [...inMemoryCases];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY_CASES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load session cases', e);
  }
  return [...inMemoryCases];
}

function saveActiveCases(cases: Case[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save session cases', e);
  }
}

function loadActiveMessages(): Message[] {
  if (typeof window === 'undefined') return [...inMemoryMessages];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY_MSGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load session messages', e);
  }
  return [...inMemoryMessages];
}

function saveActiveMessages(msgs: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(msgs));
  } catch (e) {
    console.error('Failed to save session messages', e);
  }
}

function loadActiveAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [...inMemoryAppointments];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY_APTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load session appointments', e);
  }
  return [...inMemoryAppointments];
}

function saveActiveAppointments(apts: Appointment[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY_APTS, JSON.stringify(apts));
  } catch (e) {
    console.error('Failed to save session appointments', e);
  }
}

// Active working memory arrays
export const activeCases: Case[] = loadActiveCases();
export const activeMessages: Message[] = loadActiveMessages();
export const activeAppointments: Appointment[] = loadActiveAppointments();

// Repository Level Access Control Helper
export async function checkProviderCaseAccess(caseId: string, doctorId: string): Promise<{ isLocked: boolean; reason?: string }> {
  const originalCase = activeCases.find(c => c.id === caseId);
  if (!originalCase) return { isLocked: true, reason: 'CASE_NOT_FOUND' };

  const doctor = await getDoctorById(doctorId);
  if (!doctor) return { isLocked: false };

  const isFree = doctor.subscriptionPlan === 'free';
  if (!isFree) return { isLocked: false };

  // Sort doctor cases chronologically
  const doctorCases = activeCases
    .filter(c => c.doctor_id === doctorId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const caseIndex = doctorCases.findIndex(c => c.id === caseId);
  
  // Free plan receives max 3 leads (indexes 0, 1, 2). 4th lead (index >= 3) is LOCKED
  if (caseIndex >= 3) {
    return { isLocked: true, reason: 'CASE_ACCESS_LOCKED' };
  }

  return { isLocked: false };
}

// Generator for Case IDs reading both seeded and session-persisted cases
export function generateNextCaseId(isDemoPath?: boolean): string {
  if (isDemoPath) {
    return 'CASE-2026-000154';
  }

  let maxNum = 154;
  activeCases.forEach(c => {
    const match = c.id.match(/CASE-2026-(\d+)/);
    if (match && match[1]) {
      const n = parseInt(match[1], 10);
      if (n > maxNum && c.id !== 'CASE-2026-000154') {
        maxNum = n;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(6, '0');
  return `CASE-2026-${nextNum}`;
}

import { getDoctorByIdIncludingUnavailable } from './doctors';
import { getHospitalByIdIncludingUnavailable } from './hospitals';
import { canProviderReceiveNewCases, getProviderOperationalErrorCode } from '@/lib/providers/provider-availability';
import { AuthorizedCaseAttachmentsResult } from '@/types';

export function toSafeProviderCaseSummary(c: Case): ProviderCaseSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { patient_phone, patient_email, patient_files, attachments, ...safe } = c;
  return safe;
}

import { ProviderAttachmentMetadata } from '@/types';

export function toSafeAdminCaseOperationalSummary(c: Case): AdminCaseOperationalSummary {
  return {
    id: c.id,
    doctor_id: c.doctor_id,
    hospital_id: c.hospital_id,
    specialty: 'Orthopedic Surgery',
    city: c.patient_city || 'Amman',
    status: c.status,
    created_at: c.created_at,
    last_activity_at: c.created_at,
    lead_source: c.lead_source || 'organic_search',
    access_state: 'accessible',
    response_sla_state: 'on_time',
    consent_present: !!c.consent_record,
    attachment_count: c.attachments ? c.attachments.length : (c.patient_files ? c.patient_files.length : 0)
  };
}

export async function checkProviderOwnsOrTargetsCase(
  caseId: string, 
  providerId: string, 
  providerType: 'doctor' | 'hospital' = 'doctor'
): Promise<{ success: boolean; errorCode?: string; caseData?: Case }> {
  const c = activeCases.find(item => item.id === caseId);
  if (!c) {
    return { success: false, errorCode: 'CASE_NOT_FOUND' };
  }

  const doc = providerType === 'doctor' ? getDoctorByIdIncludingUnavailable(providerId) : null;
  const hosp = providerType === 'hospital' ? getHospitalByIdIncludingUnavailable(providerId) : null;
  const provider = doc || hosp;

  if (!provider) {
    return { success: false, errorCode: 'PROVIDER_CASE_ACCESS_DENIED' };
  }

  const statusErr = getProviderOperationalErrorCode(provider);
  if (statusErr) {
    return { success: false, errorCode: statusErr };
  }

  const isTargeted = providerType === 'doctor' ? c.doctor_id === providerId : c.hospital_id === providerId;
  if (!isTargeted) {
    return { success: false, errorCode: 'PROVIDER_CASE_ACCESS_DENIED' };
  }

  if (providerType === 'doctor') {
    const access = await checkProviderCaseAccess(caseId, providerId);
    if (access.isLocked) {
      return { success: false, errorCode: 'CASE_ACCESS_LOCKED', caseData: c };
    }
  }

  return { success: true, caseData: c };
}

export async function getCasesForDoctor(doctorId: string): Promise<ProviderCaseSummary[]> {
  await new Promise(resolve => setTimeout(resolve, 10));
  return activeCases.filter(c => c.doctor_id === doctorId).map(toSafeProviderCaseSummary);
}

export async function getCasesForHospital(hospitalId: string): Promise<ProviderCaseSummary[]> {
  await new Promise(resolve => setTimeout(resolve, 10));
  return activeCases.filter(c => c.hospital_id === hospitalId).map(toSafeProviderCaseSummary);
}

export async function getCaseById(caseId: string): Promise<ProviderCaseSummary | null> {
  const c = activeCases.find(item => item.id === caseId);
  return c ? toSafeProviderCaseSummary(c) : null;
}

// Patient Case Ownership Guard: Enforces authorized patient session access
export async function getPatientOwnedCase(
  caseId: string, 
  patientSessionId?: string
): Promise<{ success: boolean; caseData?: Case; errorCode?: string }> {
  await new Promise(resolve => setTimeout(resolve, 10));
  
  if (!patientSessionId || !patientSessionId.trim()) {
    return {
      success: false,
      errorCode: 'PATIENT_AUTH_REQUIRED'
    };
  }

  const c = activeCases.find(item => item.id === caseId);
  if (!c) {
    return {
      success: false,
      errorCode: 'CASE_NOT_FOUND'
    };
  }

  // Fictional demo session validation: Strict match against case patient_id
  const isOwner = c.patient_id === patientSessionId;
  
  if (!isOwner) {
    return {
      success: false,
      errorCode: 'PATIENT_CASE_ACCESS_DENIED'
    };
  }

  return {
    success: true,
    caseData: c
  };
}

export async function getPatientFullCaseById(caseId: string): Promise<Case | null> {
  const res = await getPatientOwnedCase(caseId, 'pat-1');
  return res.success ? res.caseData || null : null;
}

// Guarded Attachment Repository Access Control returning AuthorizedCaseAttachmentsResult
export async function getCaseAttachmentsForProvider(
  caseId: string, 
  providerId: string,
  providerType: 'doctor' | 'hospital' = 'doctor'
): Promise<AuthorizedCaseAttachmentsResult> {
  const auth = await checkProviderOwnsOrTargetsCase(caseId, providerId, providerType);
  if (!auth.success) {
    const errCode = (auth.errorCode as 'CASE_NOT_FOUND' | 'PROVIDER_CASE_ACCESS_DENIED' | 'PROVIDER_SUSPENDED' | 'CASE_ACCESS_LOCKED' | 'ATTACHMENTS_NOT_INCLUDED') || 'PROVIDER_CASE_ACCESS_DENIED';
    return {
      success: false,
      errorCode: errCode,
      attachments: []
    };
  }

  if (providerType === 'doctor') {
    const doc = getDoctorByIdIncludingUnavailable(providerId);
    if (!doc || doc.subscriptionPlan === 'free') {
      return {
        success: false,
        errorCode: 'ATTACHMENTS_NOT_INCLUDED',
        attachments: []
      };
    }
  }

  const originalCase = activeCases.find(c => c.id === caseId);
  const rawAttachments = originalCase?.attachments || [];
  const safeMetadata: ProviderAttachmentMetadata[] = rawAttachments.map(att => ({
    id: att.id,
    fileName: att.name,
    mimeType: att.mimeType || 'application/pdf',
    sizeBytes: att.sizeBytes || 1024 * 256,
    uploadedAt: att.uploadedAt,
    category: 'medical_record'
  }));

  return {
    success: true,
    caseId,
    attachments: safeMetadata
  };
}

// Repository Enforcement: Reading messages requires granted access & provider target authorization
export async function getMessagesForCase(caseId: string, doctorId?: string): Promise<Message[]> {
  if (doctorId) {
    const auth = await checkProviderOwnsOrTargetsCase(caseId, doctorId, 'doctor');
    if (!auth.success) {
      throw new Error(auth.errorCode || 'PROVIDER_CASE_ACCESS_DENIED');
    }
  }

  return activeMessages.filter(m => m.case_id === caseId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

// Repository Enforcement: Sending message requires granted access & provider target authorization
export async function sendMessage(
  caseId: string,
  senderRole: 'patient' | 'doctor' | 'system',
  text: string,
  type: 'text' | 'image' | 'pdf' | 'voice',
  fileUrl?: string,
  doctorId?: string
): Promise<Message> {
  if (senderRole === 'doctor' && doctorId) {
    const auth = await checkProviderOwnsOrTargetsCase(caseId, doctorId, 'doctor');
    if (!auth.success) {
      throw new Error(auth.errorCode || 'PROVIDER_CASE_ACCESS_DENIED');
    }
  }

  const newMsg: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    case_id: caseId,
    sender_role: senderRole,
    text,
    type,
    file_url: fileUrl,
    created_at: new Date().toISOString()
  };
  activeMessages.push(newMsg);
  saveActiveMessages(activeMessages);
  return newMsg;
}

// Status workflow update helper with repository-level access enforcement
export async function updateCaseStatus(
  caseId: string,
  newStatus: CaseStatus,
  actorRole: 'patient' | 'doctor' | 'system' | 'admin',
  actorId: string,
  reason?: string
): Promise<Case | null> {
  if (actorRole === 'doctor') {
    const auth = await checkProviderOwnsOrTargetsCase(caseId, actorId, 'doctor');
    if (!auth.success) {
      throw new Error(auth.errorCode || 'PROVIDER_CASE_ACCESS_DENIED');
    }
  }

  const caseIdx = activeCases.findIndex(c => c.id === caseId);
  if (caseIdx === -1) return null;

  const currentCase = activeCases[caseIdx];
  const previousStatus = currentCase.status;

  if (actorRole !== 'admin' && !isValidStatusTransition(previousStatus, newStatus)) {
    console.warn(`Invalid status transition from ${previousStatus} to ${newStatus}`);
    return null;
  }

  const updatedCase: Case = {
    ...currentCase,
    status: newStatus,
    status_history: [
      ...(currentCase.status_history || []),
      {
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        previousStatus,
        newStatus,
        actorRole,
        actorId,
        createdAt: new Date().toISOString(),
        reason
      }
    ]
  };

  activeCases[caseIdx] = updatedCase;
  saveActiveCases(activeCases);

  await sendMessage(
    caseId,
    'system',
    `تم تحديث حالة الطلب إلى: [${ALL_CASE_STATUSES[newStatus]?.labelAr || newStatus}] بواسطة (${actorRole}).`,
    'text'
  );

  return updatedCase;
}

export type GatedCaseDetailsResult =
  | { success: true; accessResult: ProviderCaseAccessResult }
  | { success: false; errorCode: 'CASE_NOT_FOUND' | 'PROVIDER_CASE_ACCESS_DENIED' | 'PROVIDER_SUSPENDED' | 'PROVIDER_INACTIVE' | 'PROVIDER_ARCHIVED' | 'CASE_ACCESS_LOCKED' };

// SaaS Repository Access Control: Returns Typed GatedCaseDetailsResult
export async function getGatedCaseDetails(caseId: string, doctorId: string): Promise<GatedCaseDetailsResult> {
  const originalCase = activeCases.find(c => c.id === caseId);
  if (!originalCase) {
    return { success: false, errorCode: 'CASE_NOT_FOUND' };
  }

  const auth = await checkProviderOwnsOrTargetsCase(caseId, doctorId, 'doctor');
  if (!auth.success) {
    return { 
      success: false, 
      errorCode: (auth.errorCode as 'PROVIDER_CASE_ACCESS_DENIED' | 'PROVIDER_SUSPENDED' | 'PROVIDER_INACTIVE' | 'PROVIDER_ARCHIVED') || 'PROVIDER_CASE_ACCESS_DENIED' 
    };
  }

  const access = await checkProviderCaseAccess(caseId, doctorId);

  // IF LOCKED: Return ONLY LockedLeadPreview! No phone, email, patient name, or medical details!
  if (access.isLocked) {
    const ageVal = originalCase.patient_age || 35;
    const lowerAge = Math.floor(ageVal / 10) * 10;
    const ageRangeStr = `${lowerAge}-${lowerAge + 9}`;

    const preview: LockedLeadPreview = {
      caseId: originalCase.id,
      specialtyNameAr: 'جراحة العظام والمفاصل',
      specialtyNameEn: 'Orthopedic Surgery',
      cityNameAr: originalCase.patient_city || 'عمان',
      cityNameEn: 'Amman',
      serviceType: 'clinic',
      receivedAt: originalCase.created_at,
      ageRange: ageRangeStr,
      gender: originalCase.patient_gender || 'male',
      generalCategoryAr: 'استشارة عظام ومفاصل',
      generalCategoryEn: 'Orthopedic Consultation',
      isLocked: true
    };

    return {
      success: true,
      accessResult: {
        access: 'locked',
        preview,
        remainingLimit: 0
      }
    };
  }

  // IF GRANTED: Return safe ProviderCaseSummary DTO (structurally excluding contact fields)
  return {
    success: true,
    accessResult: {
      access: 'granted',
      gatedDetails: {
        caseData: toSafeProviderCaseSummary(originalCase),
        isLocked: false
      }
    }
  };
}

// Check for Appointment Conflicts at Repository Level
export function validateAppointmentSlotConflict(
  providerId: string,
  date: string,
  timeSlot: string
): boolean {
  return activeAppointments.some(
    apt => apt.doctor_id === providerId &&
           apt.date === date &&
           apt.time_slot === timeSlot &&
           apt.status !== 'cancelled'
  );
}

// Reset/Upsert canonical demo case to avoid duplicate IDs
export function upsertCanonicalDemoCase(inputCase: Case): Case {
  const existingIdx = activeCases.findIndex(c => c.id === 'CASE-2026-000154');
  if (existingIdx > -1) {
    activeCases[existingIdx] = inputCase;
  } else {
    activeCases.push(inputCase);
  }
  saveActiveCases(activeCases);

  const cleanedMsgs = activeMessages.filter(m => m.case_id !== 'CASE-2026-000154');
  cleanedMsgs.push({
    id: 'msg-demo-init',
    case_id: 'CASE-2026-000154',
    sender_role: 'system',
    text: 'تم إرسال طلبك برقم CASE-2026-000154 وهو بانتظار مراجعة الطبيب.',
    type: 'text',
    created_at: new Date().toISOString()
  });
  
  activeMessages.length = 0;
  activeMessages.push(...cleanedMsgs);
  saveActiveMessages(activeMessages);

  return inputCase;
}

export async function createCase(
  input: PatientBookingInput
): Promise<{ success: boolean; caseRecord?: Case; appointment?: Appointment; errorCode?: string; message?: string }> {
  
  const providerId = input.doctor_id || input.hospital_id;
  if (!providerId) {
    return {
      success: false,
      errorCode: 'INVALID_PROVIDER',
      message: 'تعذر تحديد مقدم الخدمة الطبية المطلوب.'
    };
  }

  // Enforce operational availability for doctors
  if (input.doctor_id) {
    const doc = getDoctorByIdIncludingUnavailable(input.doctor_id);
    if (doc && !canProviderReceiveNewCases(doc)) {
      const code = doc.operationalStatus === 'suspended' ? 'PROVIDER_SUSPENDED' :
                   doc.operationalStatus === 'inactive' ? 'PROVIDER_INACTIVE' : 'PROVIDER_ARCHIVED';
      return {
        success: false,
        errorCode: code,
        message: 'مزود الخدمة موقوف تشغيلياً ولا يمكن استقبال طلبات جديدة حالياً.'
      };
    }
  }

  // Enforce operational availability for hospitals
  if (input.hospital_id) {
    const hosp = getHospitalByIdIncludingUnavailable(input.hospital_id);
    if (hosp && !canProviderReceiveNewCases(hosp)) {
      const code = hosp.operationalStatus === 'suspended' ? 'PROVIDER_SUSPENDED' :
                   hosp.operationalStatus === 'inactive' ? 'PROVIDER_INACTIVE' : 'PROVIDER_ARCHIVED';
      return {
        success: false,
        errorCode: code,
        message: 'المستشفى موقوف تشغيلياً ولا يمكن استقبال طلبات جديدة حالياً.'
      };
    }
  }

  if (!input.consent_agreed) {
    return {
      success: false,
      errorCode: 'CONSENT_REQUIRED',
      message: 'يجب الموافقة الصريحة على شروط معالجة البيانات قبل إرسال الطلب.'
    };
  }

  if (!input.patient_name || input.patient_name.trim().length < 2) {
    return {
      success: false,
      errorCode: 'INVALID_NAME',
      message: 'يرجى إدخال اسم المريض بشكل صحيح.'
    };
  }

  if (!input.patient_phone || input.patient_phone.trim().length < 8) {
    return {
      success: false,
      errorCode: 'INVALID_PHONE',
      message: 'يرجى إدخال رقم هاتف صحيح للتأكيد والتنبيهات.'
    };
  }

  if (!input.patient_reason || input.patient_reason.trim().length < 5) {
    return {
      success: false,
      errorCode: 'INVALID_REASON',
      message: 'يرجى توضيح سبب الزيارة أو وصف الأعراض باختصار.'
    };
  }

  if (validateAppointmentSlotConflict(providerId, input.appointment_date, input.appointment_time)) {
    return {
      success: false,
      errorCode: 'APPOINTMENT_SLOT_UNAVAILABLE',
      message: 'الموعد المحدد حُجز بالفعل لعيادة هذا الطبيب. يرجى اختيار وقت أو تاريخ آخر.'
    };
  }

  const newCaseId = generateNextCaseId(input.is_demo_path);

  const initialStatusHistory: CaseStatusHistory[] = [
    {
      id: `hist-${Date.now()}-1`,
      caseId: newCaseId,
      previousStatus: null,
      newStatus: 'new',
      actorRole: 'patient',
      actorId: `patient-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reason: 'Case submitted'
    }
  ];

  const nowIso = new Date().toISOString();

  const newCase: Case = {
    id: newCaseId,
    patient_id: `patient-${Date.now()}`,
    doctor_id: input.doctor_id,
    hospital_id: input.hospital_id,
    status: 'new',
    status_history: initialStatusHistory,
    created_at: nowIso,
    lead_source: input.is_demo_path ? 'Tibbak Demo Portal' : 'Tibbak Search Engine',
    patient_name: input.patient_name,
    patient_phone: maskPhone(input.patient_phone),
    patient_email: `${input.patient_name.toLowerCase().replace(/\s+/g, '')}@tibbak-patient.com`,
    patient_country: input.patient_country || 'الأردن',
    patient_city: input.patient_city || 'عمان',
    patient_age: input.patient_age || 35,
    patient_gender: input.patient_gender || 'male',
    patient_reason: input.patient_reason,
    patient_files: input.patient_files || [],
    consent_record: {
      agreed: true,
      timestamp: nowIso,
      locale: 'ar',
      consent_text: 'أوافق على معالجة البيانات التي أدخلتها ومشاركتها داخل منصة طبّك مع الطبيب...'
    }
  };

  if (input.is_demo_path) {
    upsertCanonicalDemoCase(newCase);
  } else {
    activeCases.push(newCase);
    saveActiveCases(activeCases);
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    case_id: newCaseId,
    doctor_id: providerId,
    date: input.appointment_date,
    time_slot: input.appointment_time,
    status: 'scheduled',
    notes: input.patient_reason
  };

  const existingAptIdx = activeAppointments.findIndex(a => a.case_id === newCaseId);
  if (existingAptIdx > -1) {
    activeAppointments[existingAptIdx] = newAppointment;
  } else {
    activeAppointments.push(newAppointment);
  }
  saveActiveAppointments(activeAppointments);

  await sendMessage(
    newCaseId,
    'system',
    `تم إرسال طلبك برقم ${newCaseId} وهو بانتظار مراجعة الطبيب.`,
    'text'
  );

  return {
    success: true,
    caseRecord: newCase,
    appointment: newAppointment
  };
}

export async function getAllCasesAdminOperationalSummary(): Promise<AdminCaseOperationalSummary[]> {
  await new Promise(resolve => setTimeout(resolve, 10));
  return activeCases.map(toSafeAdminCaseOperationalSummary);
}
