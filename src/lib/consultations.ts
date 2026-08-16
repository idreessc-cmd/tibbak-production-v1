import { Doctor, Specialty } from '@/types';
import { getEffectiveDoctorPrice } from '@/lib/offers';

export interface DemoSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM" or "10:00 AM"
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  patientName?: string;
  patientPhone?: string;
  notes?: string;
  createdAt: string;
  bookedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface DemoAppointmentReceipt {
  appointmentId: string;
  slotId: string;
  doctorId: string;
  doctorNameAr: string;
  doctorNameEn: string;
  specialtyAr: string;
  specialtyEn: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  basePrice: number;
  effectivePrice: number;
  hasActiveOffer: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

/**
 * Gets Jordan/Asia-Amman current date in YYYY-MM-DD format
 */
export function getJordanTodayDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Amman',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Generates default demo slots for testing if none exist in localStorage
 */
export function getDefaultDemoSlots(doctorId: string): DemoSlot[] {
  const today = getJordanTodayDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const nextDayDate = new Date();
  nextDayDate.setDate(nextDayDate.getDate() + 2);
  const nextDay = nextDayDate.toISOString().split('T')[0];

  return [
    { id: `slot-${doctorId}-1`, doctorId, date: today, time: '10:00 AM', status: 'available', createdAt: new Date().toISOString() },
    { id: `slot-${doctorId}-2`, doctorId, date: today, time: '11:30 AM', status: 'available', createdAt: new Date().toISOString() },
    { id: `slot-${doctorId}-3`, doctorId, date: today, time: '04:00 PM', status: 'available', createdAt: new Date().toISOString() },
    { id: `slot-${doctorId}-4`, doctorId, date: tomorrow, time: '09:30 AM', status: 'available', createdAt: new Date().toISOString() },
    { id: `slot-${doctorId}-5`, doctorId, date: tomorrow, time: '01:00 PM', status: 'available', createdAt: new Date().toISOString() },
    { id: `slot-${doctorId}-6`, doctorId, date: nextDay, time: '11:00 AM', status: 'available', createdAt: new Date().toISOString() },
  ];
}

/**
 * Reads all slots for a doctor from localStorage
 */
export function getDoctorSlots(doctorId: string): DemoSlot[] {
  if (typeof window === 'undefined') return getDefaultDemoSlots(doctorId);
  try {
    const raw = localStorage.getItem(`tibbak_demo_slots_v1_${doctorId}`);
    if (!raw) {
      const defaultSlots = getDefaultDemoSlots(doctorId);
      localStorage.setItem(`tibbak_demo_slots_v1_${doctorId}`, JSON.stringify(defaultSlots));
      return defaultSlots;
    }
    return JSON.parse(raw) as DemoSlot[];
  } catch {
    return getDefaultDemoSlots(doctorId);
  }
}

/**
 * Saves doctor slots to localStorage
 */
export function saveDoctorSlots(doctorId: string, slots: DemoSlot[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tibbak_demo_slots_v1_${doctorId}`, JSON.stringify(slots));
    window.dispatchEvent(new CustomEvent('tibbak_slots_updated', { detail: { doctorId, slots } }));
  } catch (err) {
    console.error('Failed to save slots:', err);
  }
}

/**
 * Creates a new available slot with validation rules (no past slots, no duplicates)
 */
export function createDoctorSlot(
  doctorId: string,
  date: string,
  time: string
): { success: boolean; errorAr?: string; errorEn?: string; slot?: DemoSlot } {
  const today = getJordanTodayDateString();

  // 1. Prevent past dates
  if (date < today) {
    return {
      success: false,
      errorAr: 'لا يمكن إضافة موعد في تاريخ قديم / Past dates are not allowed',
      errorEn: 'Past dates are not allowed',
    };
  }

  const currentSlots = getDoctorSlots(doctorId);

  // 2. Prevent duplicate/overlapping slots
  const exists = currentSlots.some(s => s.date === date && s.time === time && s.status !== 'cancelled');
  if (exists) {
    return {
      success: false,
      errorAr: 'يوجد موعد مضاف مسبقاً بنفس اليوم والوقت / Duplicate slot exists for this date and time',
      errorEn: 'Duplicate slot exists for this date and time',
    };
  }

  const newSlot: DemoSlot = {
    id: `slot-${doctorId}-${Date.now()}`,
    doctorId,
    date,
    time,
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  const updated = [newSlot, ...currentSlots];
  saveDoctorSlots(doctorId, updated);

  return { success: true, slot: newSlot };
}

/**
 * Books a patient consultation with double-booking prevention and effective offer pricing
 */
export function bookPatientConsultation(
  slotId: string,
  doctor: Doctor,
  specialty?: Specialty,
  patientName: string = 'أحمد محمود',
  patientPhone: string = '0791234567',
  notes?: string
): { success: boolean; errorAr?: string; errorEn?: string; receipt?: DemoAppointmentReceipt } {
  const slots = getDoctorSlots(doctor.id);
  const slotIndex = slots.findIndex(s => s.id === slotId);

  if (slotIndex === -1) {
    return {
      success: false,
      errorAr: 'الموعد المحدد غير موجود / Selected slot not found',
      errorEn: 'Selected slot not found',
    };
  }

  const targetSlot = slots[slotIndex];

  // Double booking prevention check!
  if (targetSlot.status !== 'available') {
    return {
      success: false,
      errorAr: 'عذراً! هذا الموعد تم حجزه مسبقاً من قِبل مريض آخر / Double booking prevented! Slot is already booked',
      errorEn: 'Double booking prevented! Slot is already booked',
    };
  }

  // Calculate effective price using Phase 4 offer logic
  const priceInfo = getEffectiveDoctorPrice(doctor);

  // Update slot status to booked
  slots[slotIndex] = {
    ...targetSlot,
    status: 'booked',
    patientName,
    patientPhone,
    notes,
    bookedAt: new Date().toISOString(),
  };

  saveDoctorSlots(doctor.id, slots);

  const receipt: DemoAppointmentReceipt = {
    appointmentId: `apt-receipt-${Date.now()}`,
    slotId: targetSlot.id,
    doctorId: doctor.id,
    doctorNameAr: doctor.name_ar,
    doctorNameEn: doctor.name_en,
    specialtyAr: specialty ? specialty.name_ar : 'طب عام',
    specialtyEn: specialty ? specialty.name_en : 'General Medicine',
    date: targetSlot.date,
    time: targetSlot.time,
    patientName,
    patientPhone,
    basePrice: priceInfo.basePrice,
    effectivePrice: priceInfo.effectivePrice,
    hasActiveOffer: priceInfo.hasActiveOffer,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  // Save receipt in localStorage
  saveAppointmentReceipt(receipt);

  return { success: true, receipt };
}

/**
 * Updates slot status (completed / cancelled) for doctor dashboard
 */
export function updateDoctorSlotStatus(
  doctorId: string,
  slotId: string,
  newStatus: 'completed' | 'cancelled'
): boolean {
  const slots = getDoctorSlots(doctorId);
  const index = slots.findIndex(s => s.id === slotId);
  if (index === -1) return false;

  const current = slots[index];
  slots[index] = {
    ...current,
    status: newStatus,
    ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
    ...(newStatus === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {}),
  };

  saveDoctorSlots(doctorId, slots);
  return true;
}

/**
 * Saves receipt to localStorage for history visibility
 */
export function saveAppointmentReceipt(receipt: DemoAppointmentReceipt): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('tibbak_demo_appointment_receipts_v1');
    const list: DemoAppointmentReceipt[] = raw ? JSON.parse(raw) : [];
    list.unshift(receipt);
    localStorage.setItem('tibbak_demo_appointment_receipts_v1', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('tibbak_appointments_updated', { detail: { receipt } }));
  } catch (err) {
    console.error('Failed to save receipt:', err);
  }
}

/**
 * Reads saved receipts from localStorage
 */
export function getSavedAppointmentReceipts(): DemoAppointmentReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('tibbak_demo_appointment_receipts_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
