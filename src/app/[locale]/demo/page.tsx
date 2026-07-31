'use client';

import { use, useState } from 'react';
import { Link } from '@/i18n/routing';
import { 
  Sparkles, Stethoscope, Shield, Search, 
  ArrowLeft, ArrowRight, FileText 
} from 'lucide-react';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { demoScenario } from '@/data/mock/demo-scenario';
import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';

interface DemoPageProps {
  params: Promise<{ locale: string }>;
}

export default function DemoPage({ params }: DemoPageProps) {
  const { locale } = use(params);
  const isRtl = locale === 'ar';
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title_ar: 'البحث الموثق (Booking.com)',
      title_en: 'Booking-Style Search',
      desc_ar: 'يبدأ المريض رحلته بالبحث عن تخصص العظام في مدينة عمان.',
      desc_en: 'Patient begins by searching for Orthopedics in Amman.'
    },
    {
      id: 2,
      title_ar: 'مقارنة واختيار الطبيب',
      title_en: 'Compare & Select Profile',
      desc_ar: 'يتصفح الملف الحصري لـ د. فراس الخطيب ويراجع التقييمات وسنوات الخبرة دون العثور على أرقام هواتف مباشرة.',
      desc_en: 'Compares Dr. Firas Khatib profile showing no direct public contact numbers.'
    },
    {
      id: 3,
      title_ar: 'نموذج الحجز الطبي الآمن',
      title_en: 'Interactive Booking Wizard',
      desc_ar: 'يسجل المريض محمد أحمد حالته واصفاً (ألم الركبة منذ أسبوعين) ويرفع ملفاته الطبية بمؤشر رفع آمن.',
      desc_en: 'Patient records condition and uploads medical files with safe mock indicator.'
    },
    {
      id: 4,
      title_ar: 'صفحة تابع حالتك للخصوصية',
      title_en: 'Patient Privacy Status Tracker',
      desc_ar: 'يتبع المريض حالة طلبه والتأكيد على حجب وسائط التواصل المباشرة خارج نطاق المنصة.',
      desc_en: 'Patient monitors request status while verifying communication privacy.'
    },
    {
      id: 5,
      title_ar: 'لوحة تحكم الطبيب المعالج',
      title_en: 'Doctor CRM & Lock Simulator',
      desc_ar: 'يراجع الطبيب الحجوزات والتحويلات ويقوم بمحاكاة انتهاء الباقة لرؤية حجب البيانات.',
      desc_en: 'Doctor views metrics, and simulates subscription expiration to test gated lead details.'
    },
    {
      id: 6,
      title_ar: 'لوحة تحكم أدمن المنصة',
      title_en: 'Global Admin ERP & CMS',
      desc_ar: 'يتحكم الأدمن بترتيب ظهور الأطباء، توثيق الحسابات، كوبونات الخصم، وتحديث محتوى الصفحة الرئيسية.',
      desc_en: 'Global admin adjusts search ranks, verifications, coupons, and updates home page CMS.'
    }
  ];

  return (
    <div className="py-12 bg-slate-50/50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-extrabold font-cairo">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isRtl ? 'بوابة استعراض المستثمرين والشركاء' : 'Investor & Partner Presentation Portal'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 font-cairo flex items-center justify-center gap-3">
            <span>{isRtl ? 'طبّك' : 'Tibbak'}</span>
            <span className="text-teal-600 font-normal">|</span>
            <span className="text-teal-600">{isRtl ? 'دليل ومسار المريض المتكامل' : 'Patient Journey SaaS Platform'}</span>
          </h1>
          <DemoSafetyNotice locale={locale} className="max-w-2xl mx-auto" />
        </div>

        {/* Reusable Alert Banner */}
        <DemoDataBanner />

        {/* Demo Scenario Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4 text-right rtl:text-right ltr:text-left">
            <h3 className="text-lg font-black text-slate-800 font-cairo border-b border-slate-100 pb-3">
              {isRtl ? 'سيناريو العرض التجريبي الموحد' : 'Canonical Presentation Scenario'}
            </h3>
            <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-650 font-cairo">
              <p>📌 <strong className="text-slate-800">{isRtl ? 'المريض:' : 'Patient:'}</strong> {isRtl ? demoScenario.patient.name_ar : demoScenario.patient.name_en}</p>
              <p>📌 <strong className="text-slate-800">{isRtl ? 'العرض المرضي:' : 'Complaint:'}</strong> {isRtl ? demoScenario.medicalIssueAr : demoScenario.medicalIssueEn}</p>
              <p>📌 <strong className="text-slate-800">{isRtl ? 'الطبيب المستهدف:' : 'Doctor:'}</strong> د. فراس الخطيب ({isRtl ? demoScenario.specialtyNameAr : demoScenario.specialtyNameEn} - عمان)</p>
              <p>📌 <strong className="text-slate-800">{isRtl ? 'معرف الحالة الثابت:' : 'Demo Case ID:'}</strong> <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-teal-700">{demoScenario.caseId}</code></p>
              <p>📌 <strong className="text-slate-800">{isRtl ? 'موعد الحجز:' : 'Appointment:'}</strong> {demoScenario.appointmentDate} @ {demoScenario.appointmentTime}</p>
            </div>
          </div>
          
          {/* Action Links Grid */}
          <div className="flex flex-col gap-3.5">
            <Link 
              href={`/search?specialty=${demoScenario.specialtyId}&city=${demoScenario.cityId}&demo=1`}
              className="flex items-center justify-between bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer text-sm font-cairo"
            >
              <span className="flex items-center gap-2">
                <Search className="h-4.5 w-4.5" />
                <span>{isRtl ? '1. ابدأ تجربة المريض (البحث والحجز)' : '1. Begin Patient Demo (Search & Book)'}</span>
              </span>
              {isRtl ? <ArrowLeft className="h-4.5 w-4.5" /> : <ArrowRight className="h-4.5 w-4.5" />}
            </Link>

            <Link 
              href={`/cases/${demoScenario.caseId}`}
              className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer text-sm font-cairo"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5" />
                <span>{isRtl ? '2. افتح غرفة المحادثة المشفرة' : '2. Open Secure Case Chatroom'}</span>
              </span>
              {isRtl ? <ArrowLeft className="h-4.5 w-4.5" /> : <ArrowRight className="h-4.5 w-4.5" />}
            </Link>

            <Link 
              href="/dashboard/doctor"
              className="flex items-center justify-between bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer text-sm font-cairo"
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="h-4.5 w-4.5" />
                <span>{isRtl ? '3. افتح لوحة تحكم الطبيب' : '3. Open Doctor Dashboard'}</span>
              </span>
              {isRtl ? <ArrowLeft className="h-4.5 w-4.5" /> : <ArrowRight className="h-4.5 w-4.5" />}
            </Link>

            <Link 
              href="/dashboard/admin"
              className="flex items-center justify-between bg-slate-900 hover:bg-black text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer text-sm font-cairo"
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5" />
                <span>{isRtl ? '4. افتح بوابة إدارة المنصة' : '4. Open Admin Dashboard'}</span>
              </span>
              {isRtl ? <ArrowLeft className="h-4.5 w-4.5" /> : <ArrowRight className="h-4.5 w-4.5" />}
            </Link>
          </div>
        </div>

        {/* Step Indicator workflow map */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-800 font-cairo text-right rtl:text-right ltr:text-left">
            🗺️ {isRtl ? 'تتبع خطوات الرحلة المتكاملة للمريض وعيادة SaaS' : 'Tibbak End-to-End Workflow Map'}
          </h3>
          
          {/* Horizontal Steps Selection */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 border-b border-slate-100 pb-4">
            {steps.map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveStep(st.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold font-cairo transition-all cursor-pointer ${
                  activeStep === st.id 
                    ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-150' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {isRtl ? `خطوة ${st.id}` : `Step ${st.id}`}
              </button>
            ))}
          </div>

          {/* Active Step Details */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-right rtl:text-right ltr:text-left">
            <div className="space-y-1">
              <span className="text-[10px] text-teal-600 font-extrabold uppercase font-cairo">{isRtl ? 'المرحلة النشطة' : 'Active Flow Step'}</span>
              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base font-cairo">
                {isRtl ? steps[activeStep - 1].title_ar : steps[activeStep - 1].title_en}
              </h4>
              <p className="text-xs text-slate-500 font-medium font-cairo max-w-xl leading-relaxed mt-1">
                {isRtl ? steps[activeStep - 1].desc_ar : steps[activeStep - 1].desc_en}
              </p>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-400 font-mono">{activeStep} / 6</span>
              <button 
                onClick={() => setActiveStep(prev => prev < 6 ? prev + 1 : 1)}
                className="bg-white border border-slate-200 hover:border-teal-500 p-2 rounded-xl transition-all cursor-pointer text-slate-650"
              >
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
