export interface DemoStorageEnvelope<T> {
  version: number;
  createdAt: string;
  expiresAt: string;
  data: T;
}

const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function writeDemoStorage<T>(key: string, data: T, customExpiryMs: number = DEFAULT_EXPIRY_MS): void {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const envelope: DemoStorageEnvelope<T> = {
      version: 1,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + customExpiryMs).toISOString(),
      data
    };
    sessionStorage.setItem(key, JSON.stringify(envelope));
  } catch (e) {
    console.error(`Failed to write demo storage key ${key}`, e);
  }
}

export function readDemoStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'expiresAt' in parsed && 'data' in parsed) {
      const envelope = parsed as DemoStorageEnvelope<T>;
      const expiresAt = new Date(envelope.expiresAt).getTime();
      if (Date.now() > expiresAt) {
        console.warn(`Demo storage key ${key} has expired. Clearing and using fallback.`);
        sessionStorage.removeItem(key);
        return fallback;
      }
      return envelope.data;
    }
    // Legacy support for un-enveloped raw storage values
    return parsed as T;
  } catch (e) {
    console.error(`Failed to read demo storage key ${key}`, e);
    return fallback;
  }
}

export function clearDemoStorageKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to clear demo storage key ${key}`, e);
  }
}

export function clearExpiredDemoStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToClear: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('tibbak_')) {
        const raw = sessionStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.expiresAt && Date.now() > new Date(parsed.expiresAt).getTime()) {
              keysToClear.push(key);
            }
          } catch {
            // Non-JSON key
          }
        }
      }
    }
    keysToClear.forEach(k => sessionStorage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear expired demo storage', e);
  }
}
