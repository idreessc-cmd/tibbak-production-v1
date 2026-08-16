import { Doctor } from '@/types';

export interface DoctorOffer {
  enabled: boolean;
  type: 'percentage' | 'fixed';
  value: number;
  startDate?: string; // ISO datetime string
  endDate?: string;   // ISO datetime string
}

export interface EffectivePriceResult {
  basePrice: number;
  effectivePrice: number;
  hasActiveOffer: boolean;
  discountPercentage: number;
  offerEndDate?: string;
  isExpired: boolean;
  isUpcoming: boolean;
}

export interface OfferValidationResult {
  isValid: boolean;
  errors: {
    value?: string;
    dates?: string;
    general?: string;
  };
}

/**
 * Calculates effective consultation price considering active offer status and validity timeframe.
 */
export function getEffectiveDoctorPrice(
  doctor: Doctor,
  overrideOffer?: DoctorOffer
): EffectivePriceResult {
  const basePrice = doctor.consultation_fee_jod;

  // Resolve offer configuration (override or doctor fields)
  let offer: DoctorOffer | null = overrideOffer || null;

  if (!offer && doctor.offer_enabled) {
    offer = {
      enabled: doctor.offer_enabled,
      type: doctor.offer_type || 'percentage',
      value: doctor.offer_value || 0,
      startDate: doctor.offer_start_date,
      endDate: doctor.offer_end_date,
    };
  }

  // Also check local storage if available on client
  if (!offer && typeof window !== 'undefined') {
    const localOffer = getDoctorLocalOffer(doctor.id);
    if (localOffer) {
      offer = localOffer;
    }
  }

  if (!offer || !offer.enabled || offer.value <= 0) {
    return {
      basePrice,
      effectivePrice: basePrice,
      hasActiveOffer: false,
      discountPercentage: 0,
      isExpired: false,
      isUpcoming: false,
    };
  }

  const now = new Date().getTime();
  const startMs = offer.startDate ? new Date(offer.startDate).getTime() : 0;
  const endMs = offer.endDate ? new Date(offer.endDate).getTime() : Infinity;

  const isUpcoming = offer.startDate ? now < startMs : false;
  const isExpired = offer.endDate ? now > endMs : false;

  // Offer is active only if current time is within [startMs, endMs]
  const hasActiveOffer = !isUpcoming && !isExpired;

  if (!hasActiveOffer) {
    return {
      basePrice,
      effectivePrice: basePrice,
      hasActiveOffer: false,
      discountPercentage: 0,
      offerEndDate: offer.endDate,
      isExpired,
      isUpcoming,
    };
  }

  let effectivePrice = basePrice;
  let discountPercentage = 0;

  if (offer.type === 'percentage') {
    const safePercentage = Math.min(99, Math.max(1, offer.value));
    const discountAmount = (basePrice * safePercentage) / 100;
    effectivePrice = Math.max(0, Math.round(basePrice - discountAmount));
    discountPercentage = safePercentage;
  } else if (offer.type === 'fixed') {
    effectivePrice = Math.max(0, Math.min(basePrice - 1, offer.value));
    discountPercentage = Math.max(1, Math.round(((basePrice - effectivePrice) / basePrice) * 100));
  }

  return {
    basePrice,
    effectivePrice,
    hasActiveOffer: true,
    discountPercentage,
    offerEndDate: offer.endDate,
    isExpired: false,
    isUpcoming: false,
  };
}

/**
 * Validates offer input fields according to safety constraints.
 */
export function validateDoctorOffer(offer: DoctorOffer, basePrice: number): OfferValidationResult {
  const errors: OfferValidationResult['errors'] = {};

  // 1. Prevent negative value
  if (offer.value < 0) {
    errors.value = 'لا يمكن أن يكون قيمة العرض بالسالب / Offer value cannot be negative';
  }

  // 2. Prevent discount >= 100%
  if (offer.type === 'percentage' && offer.value >= 100) {
    errors.value = 'نسبة الخصم يجب أن تكون أقل من 100% / Discount percentage must be less than 100%';
  }

  // 3. Prevent fixed offer price >= base fee
  if (offer.type === 'fixed' && offer.value >= basePrice) {
    errors.value = `سعر العرض الثابت يجب أن يكون أقل من سعر الكشفية الأساسي (${basePrice} دينار) / Fixed offer price must be lower than base fee`;
  }

  // 4. Validate dates order (end must be after start)
  if (offer.startDate && offer.endDate) {
    const start = new Date(offer.startDate).getTime();
    const end = new Date(offer.endDate).getTime();
    if (end <= start) {
      errors.dates = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية / End datetime must be after start datetime';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Reads doctor offer from localStorage.
 */
export function getDoctorLocalOffer(doctorId: string): DoctorOffer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`tibbak_doctor_offer_v1_${doctorId}`);
    if (!raw) return null;
    return JSON.parse(raw) as DoctorOffer;
  } catch {
    return null;
  }
}

/**
 * Saves doctor offer to localStorage and notifies reactive listeners.
 */
export function saveDoctorLocalOffer(doctorId: string, offer: DoctorOffer): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`tibbak_doctor_offer_v1_${doctorId}`, JSON.stringify(offer));
    window.dispatchEvent(
      new CustomEvent('tibbak_offer_updated', {
        detail: { doctorId, offer },
      })
    );
  } catch (err) {
    console.error('Failed to save doctor offer:', err);
  }
}
