import { readDemoStorage, writeDemoStorage, clearDemoStorageKey } from './demo-session-storage';

export interface DemoPatientSession {
  patientId: string;
  sessionId: string;
  isDemo: boolean;
  patientName: string;
}

const STORAGE_KEY_PATIENT_SESSION = 'tibbak_demo_patient_session_v1';

export function getDemoPatientSession(): DemoPatientSession {
  const defaultSession: DemoPatientSession = {
    patientId: 'pat-1',
    sessionId: 'sess-patient-demo-001',
    isDemo: true,
    patientName: 'محمد أحمد'
  };

  if (typeof window !== 'undefined') {
    const existing = readDemoStorage<DemoPatientSession | null>(STORAGE_KEY_PATIENT_SESSION, null);
    if (existing) return existing;
    writeDemoStorage(STORAGE_KEY_PATIENT_SESSION, defaultSession);
  }

  return defaultSession;
}

export function setDemoPatientSession(patientId: string, patientName: string): DemoPatientSession {
  const session: DemoPatientSession = {
    patientId,
    sessionId: `sess-${patientId}-${Date.now()}`,
    isDemo: true,
    patientName
  };

  if (typeof window !== 'undefined') {
    writeDemoStorage(STORAGE_KEY_PATIENT_SESSION, session);
  }

  return session;
}

export function establishDemoPatientSessionAfterBooking(params: {
  patientId: string;
  patientName: string;
  bookingId?: string;
  caseId?: string;
}): DemoPatientSession {
  return setDemoPatientSession(params.patientId, params.patientName);
}

export function clearDemoPatientSession(): void {
  if (typeof window !== 'undefined') {
    clearDemoStorageKey(STORAGE_KEY_PATIENT_SESSION);
  }
}
