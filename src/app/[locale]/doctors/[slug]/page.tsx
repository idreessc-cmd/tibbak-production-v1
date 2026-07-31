import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctorBySlug } from '@/lib/repositories/doctors';
import { getHospitalById } from '@/lib/repositories/hospitals';
import { mockSpecialties } from '@/data/mock/specialties';
import { mockCities } from '@/data/mock/cities';
import DoctorBookingPanel from '@/components/booking/DoctorBookingPanel';
import { MapPin, Award, CheckCircle, ArrowLeft, Languages, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

interface DoctorDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: DoctorDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isRtl = locale === 'ar';
  const doc = await getDoctorBySlug(slug);
  if (!doc) return {};
  
  return {
    title: isRtl ? `${doc.name_ar} - ملف الطبيب وحجز موعد` : `${doc.name_en} - Doctor Profile & Booking`,
    description: isRtl ? doc.bio_ar : doc.bio_en
  };
}

export default async function DoctorDetailPage({ params, searchParams }: DoctorDetailPageProps) {
  const { locale, slug } = await params;
  const sParams = await searchParams;
  const isDemoMode = sParams?.demo === '1';
  setRequestLocale(locale);
  const isRtl = locale === 'ar';

  const doc = await getDoctorBySlug(slug);
  if (!doc) {
    notFound();
  }

  const spec = mockSpecialties.find(s => s.id === doc.specialty_id);
  const city = mockCities.find(c => c.id === doc.city_id);
  const hospital = doc.hospital_id ? await getHospitalById(doc.hospital_id) : null;

  const tDocs = await getTranslations('doctors');

  return (
    <div className="py-10 bg-slate-50/50 flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 mb-8 transition-colors"
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{isRtl ? 'العودة لنتائج البحث' : 'Back to Search'}</span>
        </Link>

        {/* Doctor Header Banner Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          
          {/* VIP crown badge */}
          {doc.subscriptionPlan === 'vip' && (
            <span className="absolute top-6 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
              ★ {isRtl ? 'طبيب VIP معتمد' : 'VIP Accredited'}
            </span>
          )}

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Avatar Mock */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 text-4xl font-bold flex-shrink-0 shadow-inner">
              {doc.name_en.split(' ').pop()?.charAt(0)}
            </div>

            <div className="text-center md:text-right flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-cairo">
                  {isRtl ? doc.name_ar : doc.name_en}
                </h1>
                {doc.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full mx-auto md:mx-0">
                    <CheckCircle className="h-3.5 w-3.5 fill-blue-50 text-blue-500" />
                    {tDocs('verified')}
                  </span>
                )}
              </div>

              <p className="text-base sm:text-lg font-bold text-teal-650">
                {spec ? (isRtl ? spec.name_ar : spec.name_en) : ''}
              </p>

              <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-semibold">
                {isRtl ? doc.title_ar : doc.title_en}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-3 text-xs sm:text-sm font-bold text-slate-650">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{city ? (isRtl ? city.name_ar : city.name_en) : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-slate-400" />
                  <span>{isRtl ? `خبرة ${doc.experience_years} سنة` : `${doc.experience_years} years experience`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main info (left on LTR, right on RTL) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bio Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                {tDocs('bio')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-cairo font-medium">
                {isRtl ? doc.bio_ar : doc.bio_en}
              </p>
            </div>

            {/* Specialties & Services Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                {isRtl ? 'التخصصات والخدمات العلاجية' : 'Specialties & Medical Services'}
              </h2>
              <div className="space-y-4 font-medium">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">{isRtl ? 'مجالات التركيز الرئيسي:' : 'Primary Focus Areas:'}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-xl text-xs font-bold border border-teal-100/50">
                      {spec ? (isRtl ? spec.name_ar : spec.name_en) : ''}
                    </span>
                    <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-xl text-xs font-semibold">
                      {isRtl ? 'التدخلات الطبية الجراحية الدقيقة' : 'Minimally Invasive Interventions'}
                    </span>
                    <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-xl text-xs font-semibold">
                      {isRtl ? 'الرعاية الوقائية والمتابعة' : 'Preventative Care & Follow-ups'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">{isRtl ? 'الخدمات المتوفرة في العيادة:' : 'Services Offered in Clinic:'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-semibold text-slate-650">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
                      <span>{isRtl ? 'الفحص السريري والاستشارة الشاملة' : 'Clinical Examination & Consultation'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
                      <span>{isRtl ? 'تخطيط وظائف الجسم الحيوي' : 'Vital Functions Diagnostics'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
                      <span>{isRtl ? 'علاجات الحالات الطارئة والمستعصية' : 'Chronic and Emergency Management'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
                      <span>{isRtl ? 'إصدار التقارير الطبية للمرضى الدوليين' : 'Medical Reports for International Patients'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience & Certificates */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                {isRtl ? 'الخبرات العلمية والشهادات' : 'Experience & Certifications'}
              </h2>
              <div className="space-y-4 font-medium">
                <div className="flex gap-4">
                  <div className="w-1 rounded bg-teal-500 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{isRtl ? 'شهادة البورد والأكاديمية' : 'Academic & Board Certificates'}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      {isRtl 
                        ? `حاصل على شهادة البورد في تخصص ${spec ? spec.name_ar : ''}، بالإضافة لزمالات من كليات الطب العالمية.`
                        : `Board Certified Specialist in ${spec ? spec.name_en : ''}, with fellowships from global institutions.`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 rounded bg-slate-300 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{isRtl ? 'مسيرة الخبرة المهنية' : 'Professional Work Journey'}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      {isRtl 
                        ? `خبرة تتجاوز ${doc.experience_years} سنة عمل خلالها في كبرى المستشفيات والمراكز التخصصية التابعة للمؤسسات الطبية المعتمدة في الأردن وخارجها.`
                        : `Exceeding ${doc.experience_years} years of work at major hospitals and specialist centers attached to accredited institutions in Jordan and internationally.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timings & Location Map */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                {isRtl ? 'موقع العيادة ومواعيد العمل' : 'Clinic Location & Timings'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-medium">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700">{isRtl ? 'أوقات الدوام الأسبوعي:' : 'Weekly Work Hours:'}</h3>
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-650 font-bold">
                    <div className="flex justify-between">
                      <span>{isRtl ? 'من السبت إلى الأربعاء' : 'Saturday - Wednesday'}</span>
                      <span className="text-teal-650">09:00 AM - 05:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isRtl ? 'الخميس' : 'Thursday'}</span>
                      <span className="text-teal-650">09:00 AM - 01:00 PM</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{isRtl ? 'الجمعة' : 'Friday'}</span>
                      <span>{isRtl ? 'عطلة نهاية الأسبوع' : 'Weekend Holiday'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700">{isRtl ? 'العنوان الجغرافي:' : 'Physical Address:'}</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {isRtl ? doc.address_ar : doc.address_en}
                  </p>
                  {/* Simulated Map */}
                  <div className="w-full h-28 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold gap-1.5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <MapPin className="h-4 w-4 text-teal-600 animate-bounce" />
                    <span>{isRtl ? 'موقع GPS الافتراضي نشط' : 'Simulated GPS Coordinate Active'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Affiliation Card */}
            {hospital && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                  {tDocs('hospital_affiliation')}
                </h2>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="font-semibold">
                    <h3 className="font-bold text-slate-800">
                      {isRtl ? hospital.name_ar : hospital.name_en}
                    </h3>
                    <Link
                      href={`/hospitals/${hospital.slug}`}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      {isRtl ? 'عرض ملف المستشفى الكامل' : 'View full Hospital Profile'}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Languages Spoken Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                {tDocs('languages')}
              </h2>
              <div className="flex items-center gap-4">
                <Languages className="h-5 w-5 text-gray-450" />
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">العربية (Arabic)</span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">English (الإنجليزية)</span>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-3 mb-4 font-cairo">
                {isRtl ? 'الأسئلة الشائعة حول العيادة' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4 font-semibold">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {isRtl ? 'س. هل يتم قبول التأمين الطبي؟' : 'Q. Does this clinic accept medical insurance?'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {isRtl 
                      ? 'نعم، يقبل الطبيب معظم جهات التأمين الطبي المحلية والدولية، يرجى تزويد موظف الاستقبال ببطاقة التأمين عند الزيارة.'
                      : 'Yes, the doctor accepts most local and international medical insurances. Please present your card upon arrival.'}
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {isRtl ? 'س. كيف يمكن للمرضى الدوليين التنسيق؟' : 'Q. How do international patients coordinate treatment?'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-cairo">
                    {isRtl 
                      ? 'إذا كنت خارج الأردن، يمكنك طلب خطة علاجية وسيقوم فريقنا بالتنسيق المباشر مع عيادة الطبيب مجاناً.'
                      : 'If you are outside Jordan, request coordination and our team will contact this clinic for free.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Widget Sidebar Column */}
          <div className="lg:col-span-1">
            <DoctorBookingPanel doctor={doc} isDemoMode={isDemoMode} />
          </div>

        </div>

      </div>
    </div>
  );
}
