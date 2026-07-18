import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllHospitals } from '@/lib/repositories/hospitals';
import { mockCities } from '@/data/mock/cities';
import { mockDoctors } from '@/data/mock/doctors';
import HospitalsFilterPanel from '@/components/hospitals/HospitalsFilterPanel';
import { MapPin, CheckCircle, SearchX, Building, Star, Award } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  return {
    title: isRtl ? 'أفضل المستشفيات والمراكز الطبية بالأردن - منصة طبّك' : 'Top Hospitals & Medical Centers in Jordan - Tabibak',
    description: isRtl
      ? 'تصفح وقارن بين المستشفيات والمدن والمراكز الطبية الرائدة في الأردن المعتمدة دولياً للسياحة العلاجية.'
      : 'Browse and compare leading internationally accredited hospitals and medical centers in Jordan for medical tourism.',
  };
}

interface HospitalsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    city?: string;
  }>;
}

export default async function HospitalsPage({ params, searchParams }: HospitalsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = locale === 'ar';

  const tCommon = await getTranslations('common');

  const queries = await searchParams;
  const filter = {
    searchQuery: queries.search,
    citySlug: queries.city,
  };

  const hospitals = await getAllHospitals(filter);

  return (
    <div className="py-10 bg-slate-50/50 flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-right">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            {isRtl ? 'المستشفيات والمراكز الطبية بالأردن' : 'Hospitals & Medical Centers in Jordan'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-cairo">
            {isRtl
              ? 'تصفح أفضل وجهات الاستشفاء والمستشفيات المعتمدة وخدماتها للمرضى المحليين والدوليين.'
              : 'Explore the best medical tourism destinations, accredited hospitals, and international patient care.'}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <HospitalsFilterPanel cities={mockCities} />
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-6">
            {hospitals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                <SearchX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">
                  {isRtl ? 'لم يتم العثور على مستشفيات' : 'No Hospitals Found'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isRtl 
                    ? 'جرب البحث باسم آخر أو محافظة أخرى.'
                    : 'Try checking other search queries or cities.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {hospitals.map((hosp, i) => {
                  const city = mockCities.find(c => c.id === hosp.city_id);
                  const affiliatedDocs = mockDoctors.filter(d => d.hospital_id === hosp.id);
                  const rating = (4.5 + ((i * 7) % 5) / 10).toFixed(1);

                  // Mock departments/services based on hospital
                  const departments = isRtl 
                    ? ['طوارئ 24/7', 'مركز القلب والأوعية', 'قسم العظام', 'مختبرات متكاملة']
                    : ['24/7 Emergency', 'Cardiology Center', 'Orthopedics', 'Advanced Labs'];

                  const accreditations = hosp.is_verified 
                    ? (isRtl ? ['اعتماد JCI الدولي', 'مجلس اعتماد المؤسسات HCAC'] : ['JCI Accredited', 'HCAC Certified'])
                    : (isRtl ? ['ترخيص وزارة الصحة'] : ['MOH Licensed']);

                  return (
                    <div key={hosp.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row relative p-6 gap-6">
                      
                      {/* Logo and Cover representation */}
                      <div className="w-full md:w-48 h-32 md:h-auto bg-gradient-to-br from-teal-600/10 to-cyan-600/10 rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-50 flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 border border-slate-100">
                          <Building className="h-8 w-8 text-teal-600" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-600 text-white px-2.5 py-0.5 rounded-full">
                          {hosp.rank}
                        </span>
                      </div>

                      {/* Content Block */}
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h2 className="font-extrabold text-slate-800 text-xl hover:text-teal-600 transition-colors">
                                  <Link href={`/hospitals/${hosp.slug}`}>
                                    {isRtl ? hosp.name_ar : hosp.name_en}
                                  </Link>
                                </h2>
                                {hosp.is_verified && (
                                  <span className="bg-blue-500 text-white p-0.5 rounded-full border border-white shadow-sm" title={tCommon('verified')}>
                                    <CheckCircle className="h-3.5 w-3.5 fill-white text-blue-500" />
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                <span>{city ? (isRtl ? city.name_ar : city.name_en) : ''}</span>
                              </div>
                            </div>

                            {/* Ratings block */}
                            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl text-amber-800 border border-amber-100/50">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-bold">{rating}</span>
                            </div>
                          </div>

                          <p className="text-sm text-slate-500 line-clamp-2 mt-3 leading-relaxed font-medium">
                            {isRtl ? hosp.description_ar : hosp.description_en}
                          </p>

                          {/* Accreditations & Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {accreditations.map((acc, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                <Award className="h-3 w-3" />
                                {acc}
                              </span>
                            ))}
                            {hosp.accepts_international_patients && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100/50">
                                {isRtl ? 'يقبل مرضى دوليين' : 'Accepts International Patients'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-50">
                          
                          {/* Services / Departments */}
                          <div className="flex flex-wrap gap-2">
                            {departments.map((dept, idx) => (
                              <span key={idx} className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                                {dept}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 justify-between sm:justify-end flex-shrink-0">
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isRtl ? 'الأطباء المعتمدين' : 'Accredited Staff'}</div>
                              <div className="text-sm font-extrabold text-teal-600">
                                {affiliatedDocs.length > 0 ? `${affiliatedDocs.length} ${isRtl ? 'أطباء' : 'Doctors'}` : (isRtl ? 'متاح بالطلب' : 'On Demand')}
                              </div>
                            </div>
                            <Link
                              href={`/hospitals/${hosp.slug}`}
                              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
                            >
                              {isRtl ? 'عرض التفاصيل والعيادات' : 'View Details'}
                            </Link>
                          </div>

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
