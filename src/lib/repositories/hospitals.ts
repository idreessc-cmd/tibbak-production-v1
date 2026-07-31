import { Hospital, Doctor } from '@/types';
import { mockHospitals } from '@/data/mock/hospitals';
import { activeMockDoctors } from './doctors';
import { mockCities } from '@/data/mock/cities';
import { isProviderPubliclyVisible } from '@/lib/providers/provider-availability';

export interface HospitalFilter {
  citySlug?: string;
  searchQuery?: string;
}

export const activeMockHospitals: Hospital[] = [...mockHospitals];

export async function getAllHospitals(filter?: HospitalFilter): Promise<Hospital[]> {
  await new Promise(resolve => setTimeout(resolve, 10));

  let results = activeMockHospitals.filter(h => isProviderPubliclyVisible(h));

  if (filter) {
    if (filter.citySlug) {
      const city = mockCities.find(c => c.slug === filter.citySlug);
      if (city) {
        results = results.filter(h => h.city_id === city.id);
      } else {
        return [];
      }
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase().trim();
      results = results.filter(h => 
        h.name_ar.includes(query) || 
        h.name_en.toLowerCase().includes(query)
      );
    }
  }

  // Sort by package: international first, then premium, then basic
  results.sort((a, b) => {
    const getPackageScore = (rank: 'basic' | 'premium' | 'international') => {
      if (rank === 'international') return 300;
      if (rank === 'premium') return 200;
      return 100;
    };
    return getPackageScore(b.rank) - getPackageScore(a.rank);
  });

  return results;
}

export async function getHospitalBySlug(slug: string): Promise<Hospital | null> {
  await new Promise(resolve => setTimeout(resolve, 10));
  const hosp = activeMockHospitals.find(h => h.slug === slug);
  if (!hosp || !isProviderPubliclyVisible(hosp)) return null;
  return hosp;
}

export async function getHospitalById(id: string): Promise<Hospital | null> {
  const hosp = activeMockHospitals.find(h => h.id === id);
  if (!hosp || !isProviderPubliclyVisible(hosp)) return null;
  return hosp;
}

export function getHospitalByIdIncludingUnavailable(id: string): Hospital | null {
  const hosp = activeMockHospitals.find(h => h.id === id);
  return hosp || null;
}

export async function getHospitalDoctors(hospitalId: string): Promise<Doctor[]> {
  return activeMockDoctors.filter(d => d.hospital_id === hospitalId);
}

// SaaS Admin Operations
export async function adminUpdateHospitalRank(id: string, rank: 'basic' | 'premium' | 'international', packageId: string): Promise<boolean> {
  const hospIdx = activeMockHospitals.findIndex(h => h.id === id);
  if (hospIdx > -1) {
    activeMockHospitals[hospIdx] = { ...activeMockHospitals[hospIdx], rank, package_id: packageId };
    return true;
  }
  return false;
}

export async function adminUpdateHospitalVerification(id: string, isVerified: boolean): Promise<boolean> {
  const hospIdx = activeMockHospitals.findIndex(h => h.id === id);
  if (hospIdx > -1) {
    activeMockHospitals[hospIdx] = { ...activeMockHospitals[hospIdx], is_verified: isVerified };
    return true;
  }
  return false;
}

export async function adminUpdateHospitalStats(id: string, beds: number, surgeries: number): Promise<boolean> {
  const hospIdx = activeMockHospitals.findIndex(h => h.id === id);
  if (hospIdx > -1) {
    activeMockHospitals[hospIdx] = { ...activeMockHospitals[hospIdx], beds_count: beds, surgeries_count: surgeries };
    return true;
  }
  return false;
}
