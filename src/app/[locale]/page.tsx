import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllDoctors } from '@/lib/repositories/doctors';
import { getAllHospitals } from '@/lib/repositories/hospitals';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import SearchBar from '@/components/home/SearchBar';
import MobileHeroSearch from '@/components/home/MobileHeroSearch';
import QuickSearchFilters from '@/components/home/QuickSearchFilters';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { 
  ShieldCheck, CheckCircle, ChevronRight, Award, MapPin, 
  Calendar, Lock, Heart, Building2 
} from 'lucide-react';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isRtl = locale === 'ar';

  // Load featured content from repositories
  const allDoctors = await getAllDoctors();
  const featuredDoctors = allDoctors.slice(0, 3);

  const allHospitals = await getAllHospitals();
  const featuredHospitals = allHospitals.slice(0, 2);

  const heroHeadlineAr = 'ابحث عن الطبيب المناسب وابدأ رحلتك العلاجية بأمان';
  const heroHeadlineEn = 'Find the right doctor and begin your care journey safely';
  
  const heroSubAr = 'قارن الأطباء، اختر الموعد، وأرسل طلبك وتابع حالتك من داخل طبّك.';
  const heroSubEn = 'Compare doctors, choose an appointment, submit your request, and follow your case inside Tibbak.';

  return (
    <div className="flex flex-col w-full pb-20">
      
      {/* Mobile Top Area: Search -> Quick Filters (Mobile Only) */}
      <div className="md:hidden bg-slate-50/50 pt-3 pb-4 px-4 border-b border-slate-100 space-y-3">
        <MobileHeroSearch />
        <QuickSearchFilters />
      </div>

      {/* Desktop Hero Section (Desktop Only) */}
      <section className="hidden md:block relative bg-gradient-to-b from-teal-50/60 via-white to-transparent pt-10 pb-16 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-150 font-cairo">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            <span>{isRtl ? 'منصة إدارة رحلة المريض والاشتراكات الطبية' : 'Patient Journey & Healthcare Platform'}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight font-cairo">
            {isRtl ? heroHeadlineAr : heroHeadlineEn}
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-semibold font-cairo">
            {isRtl ? heroSubAr : heroSubEn}
          </p>

          {/* Desktop Booking.com Style Unified Search Bar */}
          <div className="pt-2">
            <SearchBar 
              specialties={mockSpecialties}
              cities={mockCities}
            />
          </div>

          {/* Quick Hero Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 font-cairo">
            <a
              href="#search-bar"
              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-sm text-sm transition-all"
            >
              {isRtl ? 'ابحث الآن' : 'Search now'}
            </a>
            <a
              href="#how-it-works"
              className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-sm transition-all"
            >
              {isRtl ? 'كيف تعمل المنصة؟' : 'How Tibbak works'}
            </a>
          </div>

        </div>
      </section>

      {/* Reusable Demo Banner Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <DemoDataBanner />
      </div>

      {/* Specialties Grid */}
      <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-cairo">
            {isRtl ? 'التخصصات الطبية الأكثر طلباً' : 'Popular Medical Specialties'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium font-cairo">
            {isRtl ? 'اختر التخصص الطبي المناسب للوصول إلى استشاريين وأخصائيين معتمدين' : 'Select a specialty to browse verified consultants'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 font-cairo">
          {mockSpecialties.slice(0, 5).map((spec) => (
            <Link
              key={spec.id}
              href={`/search?specialty=${spec.slug}`}
              className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl border border-slate-100 hover:border-teal-500/40 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <Heart className="h-6 w-6" />
              </div>
              <span className="text-sm font-extrabold text-slate-800 group-hover:text-teal-600 transition-colors">
                {isRtl ? spec.name_ar : spec.name_en}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-14 bg-slate-50/50 border-y border-slate-100/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-cairo">
                {isRtl ? 'أطباء معتمدون ومتميزون' : 'Featured Verified Doctors'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium font-cairo mt-1">
                {isRtl ? 'قارن الأطباء حسب سنوات الخبرة، التقييمات، ورتب الحضور' : 'Compare specialists by experience, rating, and verified tier'}
              </p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-1.5 text-xs font-extrabold text-teal-600 hover:text-teal-700 font-cairo"
            >
              <span>{isRtl ? 'تصفح كافة الأطباء' : 'View All Doctors'}</span>
              <ChevronRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-cairo">
            {featuredDoctors.map((doc) => {
              const spec = mockSpecialties.find(s => s.id === doc.specialty_id);
              const city = mockCities.find(c => c.id === doc.city_id);

              return (
                <div key={doc.id} className="flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all relative">
                  
                  {doc.isSponsored && (
                    <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm">
                      {isRtl ? 'إعلان' : 'Sponsored'}
                    </span>
                  )}
                  {doc.subscriptionPlan === 'vip' && (
                    <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-sm">
                      ★ {isRtl ? 'باقة VIP' : 'VIP Plan'}
                    </span>
                  )}
                  {doc.subscriptionPlan === 'professional' && (
                    <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-teal-600 text-white shadow-sm">
                      {isRtl ? 'طبيب مهني' : 'Professional'}
                    </span>
                  )}

                  {/* Doctor Card Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 text-2xl font-black flex-shrink-0">
                        {doc.name_en.split(' ').pop()?.charAt(0)}
                      </div>
                      <div className="text-right rtl:text-right ltr:text-left">
                        <div className="flex items-center gap-1">
                          <h3 className="font-extrabold text-slate-800 text-base hover:text-teal-600 transition-colors">
                            {isRtl ? doc.name_ar : doc.name_en}
                          </h3>
                          {doc.is_verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-50" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-teal-600 mt-0.5">
                          {spec ? (isRtl ? spec.name_ar : spec.name_en) : ''}
                        </p>
                        <p className="text-[11px] text-slate-450 font-semibold mt-1">
                          {isRtl ? doc.title_ar : doc.title_en}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{city ? (isRtl ? city.name_ar : city.name_en) : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-slate-400" />
                        <span>{isRtl ? `خبرة ${doc.experience_years} سنة` : `${doc.experience_years} yrs exp`}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-right rtl:text-right ltr:text-left">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">{isRtl ? 'الكشفية' : 'Fee'}</span>
                        <div className="text-base font-black text-teal-600">{doc.consultation_fee_jod} {isRtl ? 'د.أ' : 'JOD'}</div>
                      </div>

                      <Link
                        href={`/doctors/${doc.slug}`}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 px-5 rounded-2xl transition-all text-xs shadow-sm"
                      >
                        {isRtl ? 'عرض الملف والحجز' : 'View & Book'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Hospitals Section */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-cairo">
                {isRtl ? 'مستشفيات ومراكز طبية معتمدة' : 'Accredited Hospitals & Centers'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium font-cairo mt-1">
                {isRtl ? 'مؤسسات صحية تقدم خدمات علاجية متكاملة وسياحة علاجية' : 'Leading healthcare institutions providing comprehensive care'}
              </p>
            </div>
            <Link
              href="/search?service=hospital"
              className="flex items-center gap-1.5 text-xs font-extrabold text-teal-600 hover:text-teal-700 font-cairo"
            >
              <span>{isRtl ? 'تصفح المستشفيات' : 'View Hospitals'}</span>
              <ChevronRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-cairo">
            {featuredHospitals.map((hosp) => {
              const city = mockCities.find(c => c.id === hosp.city_id);

              return (
                <div key={hosp.id} className="flex flex-col sm:flex-row bg-slate-50/50 rounded-3xl border border-slate-100 p-6 gap-5 hover:shadow-md transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black flex-shrink-0">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div className="flex-1 space-y-2 text-right rtl:text-right ltr:text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {isRtl ? hosp.name_ar : hosp.name_en}
                      </h3>
                      {hosp.is_verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{city ? (isRtl ? city.name_ar : city.name_en) : ''}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {isRtl ? hosp.description_ar : hosp.description_en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Tibbak Works (3-Step Section) */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-cairo">
              {isRtl ? 'كيف تعمل منصة طبّك؟' : 'How Tibbak Works'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold font-cairo">
              {isRtl ? 'مسار بسيط ومنظم يضمن خصوصية وحفظ بيانات المريض من البداية إلى نهاية العلاج' : 'A simple 3-step platform journey connecting patients safely'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-4">
              <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                1
              </div>
              <h3 className="font-extrabold text-slate-800 text-base font-cairo">
                {isRtl ? '1. ابحث وقارن' : '1. Search and compare'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold font-cairo">
                {isRtl 
                  ? 'ابحث حسب العرض المرضي، التخصص، أو اسم الطبيب. قارن الأطباء حسب سنوات الخبرة، التقييمات، وسعر الكشفية.'
                  : 'Search by medical problem, specialty, or doctor name. Compare specialists by experience, rating, and fee.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                2
              </div>
              <h3 className="font-extrabold text-slate-800 text-base font-cairo">
                {isRtl ? '2. اختر الموعد' : '2. Choose an appointment'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold font-cairo">
                {isRtl 
                  ? 'حدد التاريخ والوقت المناسب لك، وأدخل تفاصيل الحالة وأرفق التقارير الطبية بشكل آمن.'
                  : 'Select a suitable date and time, fill in your case summary, and securely attach medical reports.'}
              </p>
            </div>

            <div className="flex flex-col items-center text-center bg-slate-50/50 p-8 rounded-3xl border border-slate-100 space-y-4">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                3
              </div>
              <h3 className="font-extrabold text-slate-800 text-base font-cairo">
                {isRtl ? '3. تابع حالتك داخل طبّك' : '3. Follow your case inside Tibbak'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold font-cairo">
                {isRtl 
                  ? 'تواصل مع الطبيب من داخل المنصة عبر غرفة المحادثة المشفرة دون الحاجة لتبادل أرقام الهواتف الشخصية.'
                  : 'Communicate directly with your doctor inside the platform using our encrypted case chat room.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Restrained Trust Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3 font-cairo">
            <span className="text-xs font-black text-teal-400 uppercase tracking-wider">{isRtl ? 'معايير الأمان والوساطة' : 'Platform Trust Principles'}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isRtl ? 'لماذا يعتمد المرضى والأطباء على طبّك؟' : 'Why Patients and Doctors Rely on Tibbak'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-cairo">
            <div className="bg-slate-800/60 border border-slate-700/40 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{isRtl ? 'ملفات طبيب موثقة' : 'Verified Doctor Profiles'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {isRtl 
                  ? 'يتم فحص المؤهلات والترخيص الطبي لجميع الأطباء المسجلين بالمنصة قبل منح الشارة المعتمدة.'
                  : 'Medical licenses and board certifications are reviewed before issuing verified badges.'}
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/40 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{isRtl ? 'أسعار ومواعيد واضحة' : 'Transparent Fees & Availability'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {isRtl 
                  ? 'تظهر قيمة الكشفية وأول موعد متاح بوضوح دون أي رسوم خفية قبل الحجز.'
                  : 'Consultation fees and first available appointment dates are clearly presented upfront.'}
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/40 p-6 rounded-3xl space-y-3">
              <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{isRtl ? 'التواصل حائل داخل المنصة' : 'In-Platform Communication'}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {isRtl 
                  ? 'لا يتم إفشاء أرقام الهواتف أو البريد الشخصي في الصفحات العامة لضمان أعلى مستويات الخصوصية.'
                  : 'No personal phone numbers or direct contact details are shown on public pages.'}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
