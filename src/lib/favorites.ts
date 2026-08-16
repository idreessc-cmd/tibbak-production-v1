'use client';

const FAVORITES_KEY = 'tibbak_favorite_doctors_v1';

export function getFavoriteDoctorIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading favorites from localStorage:', e);
    return [];
  }
}

export function isDoctorFavorite(doctorId: string): boolean {
  const ids = getFavoriteDoctorIds();
  return ids.includes(doctorId);
}

export function toggleDoctorFavorite(doctorId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const ids = getFavoriteDoctorIds();
    const index = ids.indexOf(doctorId);
    let updated: string[];
    let isNowFavorite = false;

    if (index >= 0) {
      updated = ids.filter(id => id !== doctorId);
    } else {
      updated = [...ids, doctorId];
      isNowFavorite = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    
    // Dispatch custom window event so reactive components update instantly
    window.dispatchEvent(new CustomEvent('tibbak_favorites_updated', { detail: { doctorId, isNowFavorite } }));
    return isNowFavorite;
  } catch (e) {
    console.error('Error toggling favorite in localStorage:', e);
    return false;
  }
}
