import { setRequestLocale } from 'next-intl/server';
import { getAllDoctors, DoctorFilter, DoctorSort } from '@/lib/repositories/doctors';
import { DoctorSubscriptionPlan } from '@/types';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import SearchResultsContainer from '@/components/search/SearchResultsContainer';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  return {
    title: isRtl ? 'الأطباء المعتمدون - طبّك' : 'Verified Doctors - Tibbak',
    description: isRtl 
      ? 'استعرض جميع الأطباء المعتمدين، قارن الكشفيات والتقييمات، واحجز موعدك بسهولة.'
      : 'Browse verified doctors in Jordan, compare consultation fees and ratings.'
  };
}

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    city?: string;
    service?: string;
    gender?: string;
    fees?: string;
    insurance?: string;
    available?: string;
    online?: string;
    experience?: string;
    subscriptionPlan?: string;
    plan?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = locale === 'ar';

  const queries = await searchParams;

  // Resolve search filters
  const filter: DoctorFilter = {
    searchQuery: queries.q,
    specialtySlug: queries.specialty,
    citySlug: queries.city,
    gender: queries.gender as 'male' | 'female',
    feesRange: queries.fees as 'under_20' | '20_40' | 'above_40' | undefined,
    subscriptionPlan: (queries.subscriptionPlan || queries.plan) as DoctorSubscriptionPlan | undefined,
    acceptsInsurance: queries.insurance === 'true',
    availableToday: queries.available === 'true',
    onlineConsultation: queries.service === 'online' || queries.online === 'true',
    experienceYears: queries.experience as '5_plus' | '10_plus' | '20_plus' | undefined,
  };

  const sort: DoctorSort = {
    sortBy: (queries.sort as DoctorSort['sortBy']) || 'ranking',
  };

  // Requirement 2 & 3: If no query, returns ALL doctors
  const doctors = await getAllDoctors(filter, sort);

  const activeSpecialty = mockSpecialties.find(s => s.slug === queries.specialty);
  const activeCity = mockCities.find(c => c.slug === queries.city);

  let headerTitle = isRtl ? 'جميع الأطباء المعتمدين' : 'All Verified Doctors';
  if (activeSpecialty && activeCity) {
    headerTitle = isRtl 
      ? `أطباء ${activeSpecialty.name_ar} في ${activeCity.name_ar}`
      : `${activeSpecialty.name_en} Doctors in ${activeCity.name_en}`;
  } else if (activeSpecialty) {
    headerTitle = isRtl 
      ? `أطباء ${activeSpecialty.name_ar} في الأردن`
      : `${activeSpecialty.name_en} Doctors in Jordan`;
  } else if (activeCity) {
    headerTitle = isRtl 
      ? `الأطباء المتوفرون في ${activeCity.name_ar}`
      : `Doctors available in ${activeCity.name_en}`;
  } else if (queries.q) {
    headerTitle = isRtl ? `نتائج البحث عن: ${queries.q}` : `Search results for: ${queries.q}`;
  }

  return (
    <div className="py-2 sm:py-8 bg-slate-50/50 min-h-screen flex flex-col justify-between">
      {/* Mobile Top Search & Filter Header (Mobile Only) */}
      <SearchResultsContainer
        doctors={doctors}
        specialties={mockSpecialties}
        cities={mockCities}
        headerTitle={headerTitle}
        currentQueries={queries}
        isRtl={isRtl}
      />

    </div>
  );
}
