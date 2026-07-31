import { Doctor } from '@/types';

/**
 * Doctor Organic Search Ranking Module
 * 
 * IMPORTANT ARCHITECTURAL RULE:
 * `organicSortOrder` is NOT a paid-placement field. It is used strictly for
 * deterministic editorial correction, data-quality ordering, and tie breaking.
 * 
 * Organic relevance calculation inputs:
 * 1. Query / Specialty / City match
 * 2. Verification status (+50 points)
 * 3. Patient rating (+10 points per rating point)
 * 4. Experience years (+2 points per year)
 * 5. organicSortOrder tie-breaker (- organicSortOrder)
 * 
 * Explicitly EXCLUDED from organic ranking:
 * - `subscriptionPlan` (Free / Professional / VIP)
 * - `isSponsored` (Only affects separate sponsored campaign slot)
 * - `sponsoredUntil`
 * - `package_id`
 */

export interface DoctorSortOptions {
  sortBy?: 'ranking' | 'rating' | 'experience' | 'earliest_date' | 'fees_asc' | 'fees_desc';
}

export function calculateDoctorOrganicScore(doc: Doctor): number {
  let score = 0;

  // 1. Verification bonus
  if (doc.is_verified) {
    score += 50;
  }

  // 2. Rating bonus
  if (doc.rating) {
    score += doc.rating * 10;
  }

  // 3. Experience bonus
  if (doc.experience_years) {
    score += doc.experience_years * 2;
  }

  // 4. Organic sort order tie-breaker
  score -= (doc.organicSortOrder || 0);

  return score;
}

export function sortDoctorsOrganic(doctors: Doctor[], options?: DoctorSortOptions): Doctor[] {
  const sortBy = options?.sortBy || 'ranking';
  const copy = [...doctors];

  copy.sort((a, b) => {
    // Separate sponsored results if needed at caller level, or handle organic sorting here
    if (sortBy === 'ranking') {
      const scoreA = calculateDoctorOrganicScore(a);
      const scoreB = calculateDoctorOrganicScore(b);
      return scoreB - scoreA;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0) || (a.organicSortOrder || 0) - (b.organicSortOrder || 0);
    }
    if (sortBy === 'experience') {
      return (b.experience_years || 0) - (a.experience_years || 0) || (a.organicSortOrder || 0) - (b.organicSortOrder || 0);
    }
    if (sortBy === 'earliest_date') {
      return (a.first_available_date || '').localeCompare(b.first_available_date || '') || (a.organicSortOrder || 0) - (b.organicSortOrder || 0);
    }
    if (sortBy === 'fees_asc') {
      return (a.consultation_fee_jod || 0) - (b.consultation_fee_jod || 0) || (a.organicSortOrder || 0) - (b.organicSortOrder || 0);
    }
    if (sortBy === 'fees_desc') {
      return (b.consultation_fee_jod || 0) - (a.consultation_fee_jod || 0) || (a.organicSortOrder || 0) - (b.organicSortOrder || 0);
    }
    return (a.organicSortOrder || 0) - (b.organicSortOrder || 0);
  });

  return copy;
}
