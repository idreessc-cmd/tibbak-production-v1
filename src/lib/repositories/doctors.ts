import { Doctor, DoctorSubscriptionPlan } from '@/types';
import { mockDoctors } from '@/data/mock/doctors';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import { mockHospitals } from '@/data/mock/hospitals';

import { findSpecialtyForQuery } from '@/data/mock/symptom-specialty-map';
import { sortDoctorsOrganic } from '@/lib/search/doctor-organic-ranking';

export interface DoctorFilter {
  specialtySlug?: string;
  citySlug?: string;
  hospitalSlug?: string;
  gender?: 'male' | 'female';
  feesRange?: 'under_20' | '20_40' | 'above_40';
  subscriptionPlan?: DoctorSubscriptionPlan;
  isSponsored?: boolean;
  searchQuery?: string;
  acceptsInsurance?: boolean;
  availableToday?: boolean;
  onlineConsultation?: boolean;
  experienceYears?: '5_plus' | '10_plus' | '20_plus';
}

export interface DoctorSort {
  sortBy?: 'ranking' | 'rating' | 'experience' | 'fees_asc' | 'fees_desc' | 'earliest_date';
}

// In-memory array copy that allows admin operations to persist during session
import { isProviderPubliclyVisible } from '@/lib/providers/provider-availability';

export const activeMockDoctors: Doctor[] = [...mockDoctors];
export const inMemoryDoctors: Doctor[] = activeMockDoctors;

export async function getAllDoctors(filter?: DoctorFilter, sort?: DoctorSort): Promise<Doctor[]> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 30));

  let results = activeMockDoctors.filter(d => isProviderPubliclyVisible(d));

  if (filter) {
    if (filter.specialtySlug) {
      const specialty = mockSpecialties.find(s => s.slug === filter.specialtySlug);
      if (specialty) {
        results = results.filter(d => d.specialty_id === specialty.id);
      } else {
        return [];
      }
    }

    if (filter.citySlug) {
      const city = mockCities.find(c => c.slug === filter.citySlug);
      if (city) {
        results = results.filter(d => d.city_id === city.id);
      } else {
        return [];
      }
    }

    if (filter.hospitalSlug) {
      const hospital = mockHospitals.find(h => h.slug === filter.hospitalSlug);
      if (hospital) {
        results = results.filter(d => d.hospital_id === hospital.id);
      } else {
        return [];
      }
    }

    if (filter.gender) {
      results = results.filter(d => d.gender === filter.gender);
    }

    if (filter.feesRange) {
      if (filter.feesRange === 'under_20') {
        results = results.filter(d => d.consultation_fee_jod < 20);
      } else if (filter.feesRange === '20_40') {
        results = results.filter(d => d.consultation_fee_jod >= 20 && d.consultation_fee_jod <= 40);
      } else if (filter.feesRange === 'above_40') {
        results = results.filter(d => d.consultation_fee_jod > 40);
      }
    }

    if (filter.subscriptionPlan) {
      results = results.filter(d => d.subscriptionPlan === filter.subscriptionPlan);
    }

    if (filter.isSponsored !== undefined) {
      results = results.filter(d => d.isSponsored === filter.isSponsored);
    }

    if (filter.acceptsInsurance) {
      // VIP & Professional doctors support insurance
      results = results.filter(d => d.subscriptionPlan === 'vip' || d.subscriptionPlan === 'professional');
    }

    if (filter.onlineConsultation) {
      // Seed logic: odd indexes have telemedicine
      results = results.filter(d => d.organicSortOrder % 2 === 1);
    }

    if (filter.availableToday) {
      // Verified doctors are available today
      results = results.filter(d => d.is_verified);
    }

    if (filter.experienceYears) {
      if (filter.experienceYears === '5_plus') {
        results = results.filter(d => d.experience_years >= 5);
      } else if (filter.experienceYears === '10_plus') {
        results = results.filter(d => d.experience_years >= 10);
      } else if (filter.experienceYears === '20_plus') {
        results = results.filter(d => d.experience_years >= 20);
      }
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase().trim();
      const symptomMatch = findSpecialtyForQuery(query);
      const mappedSpecId = symptomMatch ? symptomMatch.specialty_id : null;

      const matchingSpecialtyIds = mockSpecialties
        .filter(s => s.name_ar.toLowerCase().includes(query) || s.name_en.toLowerCase().includes(query) || s.slug.includes(query))
        .map(s => s.id);

      results = results.filter(d => 
        d.name_ar.toLowerCase().includes(query) || 
        d.name_en.toLowerCase().includes(query) ||
        d.title_ar.toLowerCase().includes(query) ||
        d.title_en.toLowerCase().includes(query) ||
        d.bio_ar.toLowerCase().includes(query) ||
        d.bio_en.toLowerCase().includes(query) ||
        (mappedSpecId && d.specialty_id === mappedSpecId) ||
        matchingSpecialtyIds.includes(d.specialty_id)
      );
    }
  }

  // Separate sponsored results at top if applicable, then sort organic
  const sponsored = results.filter(d => d.isSponsored);
  const organic = results.filter(d => !d.isSponsored);

  const sortedOrganic = sortDoctorsOrganic(organic, sort);
  const sortedSponsored = sortDoctorsOrganic(sponsored, sort);

  return [...sortedSponsored, ...sortedOrganic];
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  await new Promise(resolve => setTimeout(resolve, 10));
  const doc = activeMockDoctors.find(d => d.slug === slug);
  if (!doc || !isProviderPubliclyVisible(doc)) return null;
  return doc;
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  const doc = activeMockDoctors.find(d => d.id === id);
  if (!doc || !isProviderPubliclyVisible(doc)) return null;
  return doc;
}

export function getDoctorByIdIncludingUnavailable(id: string): Doctor | null {
  const doc = activeMockDoctors.find(d => d.id === id);
  return doc || null;
}

// SaaS Admin Operations
export function resetDoctorOrganicRankingFixtures(): void {
  const docIdx = activeMockDoctors.findIndex(d => d.id === 'doc-1');
  if (docIdx > -1) {
    activeMockDoctors[docIdx].rating = 4.9;
    activeMockDoctors[docIdx].organicSortOrder = 1;
  }
}

export async function adminUpdateDoctorOrganicSortOrder(id: string, sortOrder: number): Promise<boolean> {
  const docIdx = activeMockDoctors.findIndex(d => d.id === id);
  if (docIdx > -1) {
    activeMockDoctors[docIdx] = { ...activeMockDoctors[docIdx], organicSortOrder: sortOrder };
    return true;
  }
  return false;
}

export async function adminUpdateDoctorSubscriptionPlan(id: string, plan: DoctorSubscriptionPlan, packageId?: string): Promise<boolean> {
  const docIdx = activeMockDoctors.findIndex(d => d.id === id);
  if (docIdx > -1) {
    const pkg = packageId || (plan === 'free' ? 'pkg-free-1' : plan === 'professional' ? 'pkg-pro-1' : 'pkg-vip-1');
    activeMockDoctors[docIdx] = { 
      ...activeMockDoctors[docIdx], 
      subscriptionPlan: plan,
      package_id: pkg 
    };
    return true;
  }
  return false;
}

export async function adminUpdateDoctorVerification(id: string, isVerified: boolean): Promise<boolean> {
  const docIdx = activeMockDoctors.findIndex(d => d.id === id);
  if (docIdx > -1) {
    activeMockDoctors[docIdx] = { ...activeMockDoctors[docIdx], is_verified: isVerified };
    return true;
  }
  return false;
}

export async function adminToggleDoctorStatus(id: string): Promise<boolean> {
  // We can simulate suspending a doctor by altering their name or setting flag.
  // Let's toggle is_verified or suffix a tag to simulate status suspension
  const docIdx = activeMockDoctors.findIndex(d => d.id === id);
  if (docIdx > -1) {
    // If name contains (Suspended) we restore it, otherwise we suspend it
    const doc = activeMockDoctors[docIdx];
    if (doc.name_en.includes('(Suspended)')) {
      activeMockDoctors[docIdx] = {
        ...doc,
        name_en: doc.name_en.replace(' (Suspended)', ''),
        name_ar: doc.name_ar.replace(' (موقوف)', '')
      };
    } else {
      activeMockDoctors[docIdx] = {
        ...doc,
        name_en: doc.name_en + ' (Suspended)',
        name_ar: doc.name_ar + ' (موقوف)'
      };
    }
    return true;
  }
  return false;
}
