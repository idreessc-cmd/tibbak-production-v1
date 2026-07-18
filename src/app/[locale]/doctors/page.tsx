import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllDoctors } from '@/lib/repositories/doctors';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import { mockHospitals } from '@/data/mock/hospitals';
import DoctorsFilterPanel from '@/components/doctors/DoctorsFilterPanel';
import { MapPin, Award, CheckCircle, SearchX, Star, ShieldCheck, Video, Calendar, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';

// Dynamic SEO metadata loading
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  return {
    title: isRtl ? 'دليل الأطباء والاستشاريين بالأردن - منصة طبّك' : 'Doctors & Consultants Directory in Jordan - Tabibak',
    description: isRtl
      ? 'ابحث وقارن بين نخبة من الأطباء والاستشاريين في الأردن. تصفح الكشفية، الخبرات، والتقييم واحجز موعدك.'
      : 'Find and compare top accredited doctors and consultants in Jordan. Browse experience, consultation fees, and ratings.',
  };
}

interface DoctorsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    specialty?: string;
    city?: string;
    hospital?: string;
    gender?: string;
    fees?: string;
    insurance?: string;
    available?: string;
    online?: string;
    experience?: string;
    sort?: string;
  }>;
}

export default async function DoctorsPage({ params, searchParams }: DoctorsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = locale === 'ar';

  const t = await getTranslations('doctors');
  const tCommon = await getTranslations('common');

  // Resolve search and sorting queries from searchParams
  const queries = await searchParams;
  
  const filter = {
    searchQuery: queries.search,
    specialtySlug: queries.specialty,
    citySlug: queries.city,
    hospitalSlug: queries.hospital,
    gender: queries.gender as 'male' | 'female',
    feesRange: queries.fees as 'under_20' | '20_40' | 'above_40' | undefined,
    acceptsInsurance: queries.insurance === 'true',
    availableToday: queries.available === 'true',
    onlineConsultation: queries.online === 'true',
    experienceYears: queries.experience as '5_plus' | '10_plus' | '20_plus' | undefined,
  };

  const sort = {
    sortBy: queries.sort as 'ranking' | 'rating' | 'experience' | 'fees_asc' | 'fees_desc' | undefined,
  };

  const doctors = await getAllDoctors(filter, sort);

  return (
    <div className="py-10 bg-slate-50/50 flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-right">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Search Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <DoctorsFilterPanel specialties={mockSpecialties} cities={mockCities} />
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-6">
            {doctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <SearchX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">{t('no_doctors')}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isRtl 
                    ? 'جرب تغيير فلاتر البحث أو استخدام كلمات مفتاحية أخرى.'
                    : 'Try clearing your filters or searching for something else.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doc) => {
                  const spec = mockSpecialties.find(s => s.id === doc.specialty_id);
                  const city = mockCities.find(c => c.id === doc.city_id);
                  const hosp = doc.hospital_id ? mockHospitals.find(h => h.id === doc.hospital_id) : null;

                  return (
                    <div key={doc.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row gap-6 relative">
                      
                      {/* Badge in corner */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {doc.rank === 'vip' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm gold-crown-glow">
                            ★ {isRtl ? 'VIP أولـوية' : 'VIP Priority'}
                          </span>
                        )}
                        {doc.rank === 'premium' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-500 text-white shadow-sm">
                            {isRtl ? 'مميـز' : 'Premium'}
                          </span>
                        )}
                      </div>

                      {/* Left: Avatar & Languages */}
                      <div className="flex flex-col items-center md:items-start text-center md:text-right gap-3 flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-50 border border-teal-100/50 flex items-center justify-center text-teal-600 text-3xl font-extrabold shadow-sm relative">
                          {doc.full_name_en.split(' ').pop()?.charAt(0)}
                          {doc.is_verified && (
                            <span className="absolute -bottom-1.5 -right-1.5 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-md" title={tCommon('verified')}>
                              <CheckCircle className="h-4.5 w-4.5 fill-white text-blue-500" />
                            </span>
                          )}
                        </div>
                        
                        {/* Rating representation */}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-slate-800">{doc.rating}</span>
                          <span className="text-xs text-slate-400 font-medium">({isRtl ? '٤٥ تقييم' : '45 reviews'})</span>
                        </div>
                      </div>

                      {/* Middle: Doctor Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-xl hover:text-teal-600 transition-colors">
                            <Link href={`/doctors/${doc.slug}`}>
                              {isRtl ? doc.full_name_ar : doc.full_name_en}
                            </Link>
                          </h3>
                          <p className="text-sm font-bold text-teal-600 mt-0.5">
                            {spec ? (isRtl ? spec.name_ar : spec.name_en) : ''}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                            {isRtl ? doc.title_ar : doc.title_en}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-slate-50 text-xs sm:text-sm font-semibold text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{city ? (isRtl ? city.name_ar : city.name_en) : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-slate-400" />
                            <span>{t('experience_years', { years: doc.experience_years })}</span>
                          </div>
                          {hosp && (
                            <div className="flex items-center gap-1.5 col-span-2">
                              <span className="text-slate-400">{isRtl ? 'المستشفى:' : 'Hospital:'}</span>
                              <Link href={`/hospitals/${hosp.slug}`} className="text-teal-600 hover:underline">
                                {isRtl ? hosp.name_ar : hosp.name_en}
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Badges and Attributes */}
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {doc.accepts_international_patients && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                              {t('international_badge')}
                            </span>
                          )}
                          {(doc.rank === 'vip' || doc.rank === 'premium') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {isRtl ? 'يقبل التأمين' : 'Accepts Insurance'}
                            </span>
                          )}
                          {doc.accepts_consultation && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100/50">
                              <Video className="h-3.5 w-3.5" />
                              {isRtl ? 'استشارة مرئية' : 'Online Consult'}
                            </span>
                          )}
                          {doc.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100/50">
                              <Calendar className="h-3.5 w-3.5" />
                              {isRtl ? 'متاح اليوم' : 'Available Today'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Booking Summary & Action Buttons */}
                      <div className="flex flex-col justify-between items-center md:items-end text-center md:text-right md:border-l md:border-slate-100 md:pl-6 md:rtl:border-l-0 md:rtl:border-r md:rtl:pl-0 md:rtl:pr-6 gap-4 flex-shrink-0 min-w-[160px]">
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('fees_label')}</div>
                          <div className="text-2xl font-extrabold text-teal-600 mt-1">
                            {doc.consultation_fee_jod} <span className="text-sm font-semibold">{tCommon('jod')}</span>
                          </div>
                        </div>

                        <div className="space-y-2 w-full">
                          <Link
                            href={`/doctors/${doc.slug}`}
                            className="block w-full text-center bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-5 rounded-2xl transition-all text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <span>{isRtl ? 'احجز موعداً' : 'Book Appointment'}</span>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                          
                          <Link
                            href={`/doctors/${doc.slug}#details`}
                            className="block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-5 rounded-2xl transition-all text-xs border border-slate-150"
                          >
                            {t('details_btn')}
                          </Link>
                        </div>
                      </div>

                    </div>
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
