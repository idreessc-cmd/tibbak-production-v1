import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllDoctors, DoctorFilter, DoctorSort } from '@/lib/repositories/doctors';
import { DoctorSubscriptionPlan } from '@/types';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import SearchFilterSidebar from '@/components/booking/SearchFilterSidebar';
import SearchBar from '@/components/home/SearchBar';
import DoctorCardItem from '@/components/search/DoctorCardItem';
import { SearchX, ChevronRight, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  return {
    title: isRtl ? 'البحث عن الأطباء والمستشفيات - طبّك' : 'Search Doctors & Hospitals - Tibbak',
    description: isRtl 
      ? 'قارن الأطباء حسب الخبرة والتقييم وسعر الكشفية واحجز موعدك بسهولة من داخل طبّك.'
      : 'Search and compare doctors by experience, rating, and fee in Jordan.'
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

  const doctors = await getAllDoctors(filter, sort);

  // Active filter metadata resolution
  const activeSpecialty = mockSpecialties.find(s => s.slug === queries.specialty);
  const activeCity = mockCities.find(c => c.slug === queries.city);

  // Compute active query title banner
  let headerTitle = isRtl ? 'نتائج البحث عن الأطباء' : 'Doctor Search Results';
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
  }

  // Active Filter Chips
  const activeChips: { key: string; label: string; removeUrl: string }[] = [];
  
  const createRemoveUrl = (keyToRemove: string) => {
    const p = new URLSearchParams();
    Object.entries(queries).forEach(([k, v]) => {
      if (k !== keyToRemove && v) p.set(k, v);
    });
    const qs = p.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  };

  if (queries.q) {
    activeChips.push({
      key: 'q',
      label: `${isRtl ? 'البحث:' : 'Query:'} ${queries.q}`,
      removeUrl: createRemoveUrl('q')
    });
  }
  if (activeSpecialty) {
    activeChips.push({
      key: 'specialty',
      label: `${isRtl ? 'التخصص:' : 'Specialty:'} ${isRtl ? activeSpecialty.name_ar : activeSpecialty.name_en}`,
      removeUrl: createRemoveUrl('specialty')
    });
  }
  if (activeCity) {
    activeChips.push({
      key: 'city',
      label: `${isRtl ? 'المدينة:' : 'City:'} ${isRtl ? activeCity.name_ar : activeCity.name_en}`,
      removeUrl: createRemoveUrl('city')
    });
  }
  if (queries.insurance === 'true') {
    activeChips.push({
      key: 'insurance',
      label: isRtl ? 'يقبل التأمين' : 'Accepts Insurance',
      removeUrl: createRemoveUrl('insurance')
    });
  }
  if (queries.online === 'true' || queries.service === 'online') {
    activeChips.push({
      key: 'online',
      label: isRtl ? 'استشارة عن بعد' : 'Teleconsultation',
      removeUrl: createRemoveUrl('service')
    });
  }

  return (
    <div className="py-8 bg-slate-50/50 flex-1 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 font-cairo">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            {isRtl ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="text-slate-800 font-extrabold">{isRtl ? 'نتائج البحث الطبي' : 'Search Results'}</span>
        </nav>

        {/* Compact Search Bar Refinement Container */}
        <div id="search-bar" className="bg-white p-3 rounded-3xl border border-slate-100 shadow-xs">
          <SearchBar 
            specialties={mockSpecialties}
            cities={mockCities}
            initialQuery={queries.q || ''}
            initialSpecialty={queries.specialty || ''}
            initialCity={queries.city || ''}
            initialService={queries.service || 'clinic'}
          />
        </div>

        {/* Header Results Summary Banner */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-right rtl:text-right ltr:text-left">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {isRtl 
                  ? `تم العثور على ${doctors.length} طبيب يطابق نتائج بحثك المحددة`
                  : `Found ${doctors.length} doctors matching your search criteria`
                }
              </p>
            </div>

            {activeChips.length > 0 && (
              <Link 
                href="/search"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-600 hover:text-teal-700 bg-teal-50 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isRtl ? 'إعادة تعيين الكل' : 'Clear all filters'}</span>
              </Link>
            )}
          </div>

          {/* Removable Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {isRtl ? 'الفلاتر النشطة:' : 'Active Filters:'}
              </span>
              {activeChips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.removeUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <span>{chip.label}</span>
                  <span className="text-slate-400 hover:text-slate-600 font-bold">×</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilterSidebar
              specialties={mockSpecialties}
              cities={mockCities}
            />
          </div>

          {/* Right Column: Listing Cards */}
          <div className="lg:col-span-3 space-y-4">
            {doctors.length === 0 ? (
              /* Polished No-Results Empty State */
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs space-y-6">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <SearchX className="h-8 w-8" />
                </div>
                
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-slate-800">
                    {isRtl ? 'لم نجد أطباء مطابقين لبحثك.' : 'No doctors matched your criteria.'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {isRtl 
                      ? 'يمكنك تجربة إزالة الفلاتر المحددة، أو اختيار مدينة أخرى، أو البحث بدون تقييدات للحصول على نتائج أوسع.'
                      : 'Try broadening your filters, clearing price constraints, or selecting all governorates.'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    href="/search"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-xs transition-all"
                  >
                    {isRtl ? 'إزالة جميع الفلاتر' : 'Clear all filters'}
                  </Link>
                  <Link
                    href="/search?city=city-amman"
                    className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all"
                  >
                    {isRtl ? 'البحث في مدينة عمان' : 'Search in Amman'}
                  </Link>
                  {activeSpecialty && (
                    <Link
                      href={`/search?specialty=${activeSpecialty.slug}`}
                      className="bg-slate-100 text-slate-800 hover:bg-slate-200 font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      {isRtl ? `عرض جميع أطباء ${activeSpecialty.name_ar}` : `View all ${activeSpecialty.name_en} doctors`}
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Doctor Card Listing */
              <div className="space-y-4">
                {doctors.map((doc) => {
                  const spec = mockSpecialties.find(s => s.id === doc.specialty_id);
                  const city = mockCities.find(c => c.id === doc.city_id);

                  return (
                    <DoctorCardItem
                      key={doc.id}
                      doctor={doc}
                      specialty={spec}
                      city={city}
                      isRtl={isRtl}
                    />
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
