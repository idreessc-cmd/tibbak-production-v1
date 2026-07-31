import { resetDay4Fixtures } from './day4-qa-fixtures';
import { setDemoPatientSession } from './demo-patient-session';
import { writeDemoStorage } from './demo-session-storage';
import { adminUpdateDoctorSubscriptionPlan, resetDoctorOrganicRankingFixtures } from '@/lib/repositories/doctors';
import { reactivateProvider, resetPrivacyRequests } from '@/lib/admin/admin-actions';
import { resetAdminAuditFixtures } from '@/lib/audit/admin-audit-log';
import { resetVerificationQueue } from '@/lib/admin/provider-verification';
import { resetSponsoredCampaigns } from '@/lib/campaigns/sponsored-campaigns';

export interface FinalDemoResetResult {
  success: boolean;
  timestamp: string;
  patientSessionEstablished: boolean;
  casesResetCount: number;
  appointmentsResetCount: number;
  providersResetCount: number;
}

// 1. Storage Envelope Clearing Function (MUST RUN FIRST BEFORE WRITING BASELINE DATA)
export function resetDemoStorageEnvelopes(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('tibbak_cases_db_v1');
    sessionStorage.removeItem('tibbak_apts_db_v1');
    sessionStorage.removeItem('tibbak_msgs_db_v1');
    sessionStorage.removeItem('tibbak_demo_patient_session_v1');
    sessionStorage.removeItem('tibbak_admin_notifications_v1');
    sessionStorage.removeItem('tibbak_doctor_notifications_v1');
    sessionStorage.removeItem('tibbak_doctor_schedule_v1');
  }
}

// Dedicated Modular Reset Helpers
export function resetCaseAppointmentFixtures(): void {
  resetDay4Fixtures();
}

export function resetMessageFixtures(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('tibbak_msgs_db_v1');
  }
}

export async function resetSubscriptionFixtures(): Promise<void> {
  await adminUpdateDoctorSubscriptionPlan('doc-1', 'free');
}

export function resetProviderOperationalFixtures(): void {
  reactivateProvider('doc-1', 'doctor', 'Demo reset to active baseline');
  reactivateProvider('hosp-1', 'hospital', 'Demo reset to active baseline');
}

export function resetVerificationFixtures(): void {
  resetVerificationQueue();
}

export function resetSponsoredCampaignFixtures(): void {
  resetSponsoredCampaigns();
}

export function resetPrivacyRequestFixtures(): void {
  resetPrivacyRequests();
}

export function resetOrganicRankingFixtures(): void {
  resetDoctorOrganicRankingFixtures();
}

export function resetPatientSessionFixture(): void {
  setDemoPatientSession('pat-1', 'محمد أحمد');
}

export function resetAdminNotificationFixtures(): void {
  const baselineAdminNotifs = [
    {
      id: 'notif-admin-1',
      titleAr: 'طلب توثيق جديد من د. مريم النجار',
      titleEn: 'New verification request from Dr. Maryam Al-Najjar',
      timestamp: '2026-07-22T11:30:00Z',
      isRead: false
    }
  ];
  writeDemoStorage('tibbak_admin_notifications_v1', baselineAdminNotifs);
}

export function resetDoctorNotificationFixtures(): void {
  const baselineNotifications = [
    {
      id: 'notif-1',
      doctorId: 'doc-1',
      title: 'طلب استشارة جديد',
      message: 'وصلتك حالة استشارة عظام جديدة بانتظار المراجعة',
      timestamp: new Date().toISOString(),
      isRead: false
    }
  ];
  writeDemoStorage('tibbak_doctor_notifications_v1', baselineNotifications);
}

export function resetDoctorScheduleFixtures(): void {
  const baselineSchedule = {
    doctorId: 'doc-1',
    availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
  };
  writeDemoStorage('tibbak_doctor_schedule_v1', baselineSchedule);
}

export function executeFinalDemoReset(): FinalDemoResetResult {
  if (typeof window === 'undefined') {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      patientSessionEstablished: false,
      casesResetCount: 0,
      appointmentsResetCount: 0,
      providersResetCount: 0
    };
  }

  // STEP 1: Clear expired and mutable demo storage envelopes FIRST
  resetDemoStorageEnvelopes();

  // STEP 2: Reset in-memory cases and appointments
  resetCaseAppointmentFixtures();

  // STEP 3: Reset messages database envelope
  resetMessageFixtures();

  // STEP 4: Reset doctor subscription plan
  resetSubscriptionFixtures();

  // STEP 5: Reset provider operational statuses
  resetProviderOperationalFixtures();

  // STEP 6: Reset verification requests queue
  resetVerificationFixtures();

  // STEP 7: Reset sponsored placement campaigns
  resetSponsoredCampaignFixtures();

  // STEP 8: Reset privacy requests queue
  resetPrivacyRequestFixtures();

  // STEP 9: Reset organic ranking & rating
  resetOrganicRankingFixtures();

  // STEP 10: Write patient demo session
  resetPatientSessionFixture();

  // STEP 11: Write admin notification envelope
  resetAdminNotificationFixtures();

  // STEP 12: Write doctor notification envelope
  resetDoctorNotificationFixtures();

  // STEP 13: Write doctor schedule envelope
  resetDoctorScheduleFixtures();

  // STEP 14: Reset Admin audit trail LAST to clear any reset-operation log entries
  resetAdminAuditFixtures();

  return {
    success: true,
    timestamp: new Date().toISOString(),
    patientSessionEstablished: true,
    casesResetCount: 5,
    appointmentsResetCount: 2,
    providersResetCount: 2
  };
}
