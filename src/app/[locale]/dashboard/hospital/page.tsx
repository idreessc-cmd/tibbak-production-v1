'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getHospitalById, getHospitalDoctors, adminUpdateHospitalStats } from '@/lib/repositories/hospitals';
import { getCasesForHospital } from '@/lib/repositories/cases';
import { Hospital, Doctor, ProviderCaseSummary } from '@/types';
import { 
  Building2, Users, Bed, Activity, Award, Sparkles, Plus, Trash
} from 'lucide-react';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';

export default function HospitalDashboard() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [cases, setCases] = useState<ProviderCaseSummary[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'beds' | 'offers'>('overview');

  // Input states for adjusting stats in real-time
  const [bedsInput, setBedsInput] = useState('');
  const [surgeriesInput, setSurgeriesInput] = useState('');

  // Hospital Offers State
  const [offers, setOffers] = useState([
    { id: '1', title_ar: 'حزمة الفحص القلبي المتكامل بخصم 20%', title_en: 'Cardiology Package Checkup - 20% off', price: 99, status: 'active' },
    { id: '2', title_ar: 'فحص المفاصل الشامل للمرضى الدوليين', title_en: 'Orthopedics & Joint Checkup for Medical Tourists', price: 150, status: 'active' }
  ]);

  const [newOfferAr, setNewOfferAr] = useState('');
  const [newOfferEn, setNewOfferEn] = useState('');
  const [newOfferPrice, setNewOfferPrice] = useState('');

  const loadData = async () => {
    // Simulated Hospital: Farah Specialty Hospital (hosp-2)
    const hosp = await getHospitalById('hosp-2');
    if (hosp) {
      setHospital(hosp);
      setBedsInput(String(hosp.beds_count));
      setSurgeriesInput(String(hosp.surgeries_count));

      const hospDocs = await getHospitalDoctors(hosp.id);
      setDoctors(hospDocs);

      const hospCases = await getCasesForHospital(hosp.id);
      setCases(hospCases);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;
    const ok = await adminUpdateHospitalStats(hospital.id, parseInt(bedsInput) || 0, parseInt(surgeriesInput) || 0);
    if (ok) {
      alert(isRtl ? 'تم تحديث الإحصائيات الفورية' : 'Live statistics updated!');
      loadData();
    }
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferAr || !newOfferEn || !newOfferPrice) return;
    const newOffer = {
      id: String(Date.now()),
      title_ar: newOfferAr,
      title_en: newOfferEn,
      price: parseFloat(newOfferPrice) || 50,
      status: 'active'
    };
    setOffers(prev => [...prev, newOffer]);
    setNewOfferAr('');
    setNewOfferEn('');
    setNewOfferPrice('');
    alert(isRtl ? 'تمت إضافة العرض بنجاح' : 'Special deal published!');
  };

  const handleRemoveOffer = (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
  };

  if (!hospital) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-teal-650 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50/50 flex-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Demo Warning Banner */}
        <DemoDataBanner />
        <DemoSafetyNotice locale={locale} />
        
        {/* Welcome Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-50 border border-teal-100/50 rounded-2xl flex items-center justify-center text-teal-600 flex-shrink-0">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-cairo">
                  {isRtl ? `لوحة تحكم: ${hospital.name_ar}` : `Dashboard: ${hospital.name_en}`}
                </h1>
              </div>
              <p className="text-xs text-slate-455 font-bold mt-1">
                {isRtl ? 'باقة المستشفيات المعتمدة - السياحة العلاجية' : 'Accredited Hospital SaaS Interface'}
              </p>
            </div>
          </div>
          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-xl text-xs font-bold uppercase">
            {hospital.rank}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
            <Bed className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <span className="block text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'إجمالي الأسرة المتاحة' : 'Bed Capacity'}</span>
            <span className="text-2xl font-extrabold text-slate-850">{hospital.beds_count}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
            <Activity className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <span className="block text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'إجمالي العمليات المجدولة' : 'Surgeries Scheduled'}</span>
            <span className="text-2xl font-extrabold text-slate-850">{hospital.surgeries_count}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="block text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'أطباء معتمدون بالمركز' : 'Accredited Doctors'}</span>
            <span className="text-2xl font-extrabold text-slate-850">{doctors.length}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
            <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <span className="block text-[10px] text-slate-400 font-bold uppercase">{isRtl ? 'الاعتمادات والجودة' : 'Accreditations'}</span>
            <span className="text-sm font-extrabold text-slate-700 block mt-1">{isRtl ? 'JCI + HCAC' : 'JCI & HCAC'}</span>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-right py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview' ? 'bg-teal-50 text-teal-700' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>{isRtl ? 'الإحصائيات والسعة' : 'Overview'}</span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`w-full text-right py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'doctors' ? 'bg-teal-50 text-teal-700' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{isRtl ? 'إدارة الأطباء المعتمدين' : 'Accredited Doctors'}</span>
            </button>

            <button
              onClick={() => setActiveTab('beds')}
              className={`w-full text-right py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'beds' ? 'bg-teal-50 text-teal-700' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Bed className="h-4 w-4" />
              <span>{isRtl ? 'الأسرة وجدول العمليات' : 'Beds & Surgeries'}</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`w-full text-right py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'offers' ? 'bg-teal-50 text-teal-700' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isRtl ? 'العروض والخصومات الطبية' : 'Promotional Deals'}</span>
            </button>
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-3">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Simulated live feeds */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-extrabold text-slate-800 font-cairo">
                    {isRtl ? 'الطلبات الدولية الجارية (السياحة العلاجية)' : 'Active International Referrals'}
                  </h3>
                  
                  {cases.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">{isRtl ? 'لا يوجد طلبات دولية واردة هذا الشهر' : 'No international cases this month'}</p>
                  ) : (
                    <div className="space-y-3">
                      {cases.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-650">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{c.patient_name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{c.patient_country} | {c.patient_reason}</span>
                          </div>
                          <Link href={`/cases/${c.id}`} className="text-xs text-teal-600 font-bold hover:underline">
                            {isRtl ? 'فتح المحادثة 🡒' : 'Open Case 🡒'}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* DOCTORS PANEL */}
            {activeTab === 'doctors' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-800 font-cairo">
                    {isRtl ? 'الأطباء المعتمدون وحالتهم بالبوابة' : 'Hospital Staff List'}
                  </h3>
                  <button
                    onClick={() => alert(isRtl ? 'التوجيه لقسم إضافة طبيب جديد...' : 'Linking new staff...')}
                    className="bg-teal-650 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{isRtl ? 'إضافة طبيب' : 'Link Doctor'}</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-50">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="py-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-650">
                      <div>
                        <span className="font-extrabold text-slate-850 block">{isRtl ? doc.name_ar : doc.name_en}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{doc.title_ar}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                          doc.subscriptionPlan === 'vip' ? 'bg-amber-100 text-amber-800' :
                          doc.subscriptionPlan === 'professional' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {doc.subscriptionPlan}
                        </span>
                        <Link href={`/doctors/${doc.slug}`} className="text-xs text-teal-600 hover:underline font-bold">
                          {isRtl ? 'عرض الصفحة' : 'View'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BEDS & SURGERIES PANEL */}
            {activeTab === 'beds' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <h3 className="text-base font-extrabold text-slate-800 font-cairo">
                  {isRtl ? 'تحديث السعة والعمليات في الوقت الفعلي' : 'Real-Time Capacity Management'}
                </h3>

                <form onSubmit={handleUpdateStats} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                      {isRtl ? 'عدد الأسرة الكلي' : 'Beds Capacity Count'}
                    </label>
                    <input
                      type="number"
                      value={bedsInput}
                      onChange={(e) => setBedsInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                      {isRtl ? 'عدد العمليات الجراحية اليوم' : 'Daily Surgeries Count'}
                    </label>
                    <input
                      type="number"
                      value={surgeriesInput}
                      onChange={(e) => setSurgeriesInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-teal-650 hover:bg-teal-700 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-sm col-span-1 sm:col-span-2 text-center"
                  >
                    {isRtl ? 'حفظ التحديثات الفورية' : 'Save Live Data'}
                  </button>
                </form>
              </div>
            )}

            {/* OFFERS PANEL */}
            {activeTab === 'offers' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 font-cairo">
                    {isRtl ? 'العروض الطبية والخصومات الخاصة المنشورة' : 'Manage Promotional Campaigns'}
                  </h3>
                  <p className="text-xs text-slate-450 font-semibold mt-1">
                    {isRtl ? 'تظهر هذه العروض في صفحة المستشفى وفي نتائج البحث لزيادة تدفق المرضى.' : 'Offers appear on your hospital profile page to attract patient leads.'}
                  </p>
                </div>

                {/* Published List */}
                <div className="space-y-3.5">
                  {offers.map((off) => (
                    <div key={off.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-650">
                      <div>
                        <span className="font-extrabold text-slate-850 block">
                          {isRtl ? off.title_ar : off.title_en}
                        </span>
                        <span className="text-xs text-teal-600 font-bold block mt-0.5">
                          {off.price} {isRtl ? 'دينار أردني' : 'JOD'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveOffer(off.id)}
                        className="text-rose-600 hover:text-rose-700 p-1.5 cursor-pointer"
                        title={isRtl ? 'حذف العرض' : 'Delete deal'}
                      >
                        <Trash className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Offer form */}
                <form onSubmit={handleAddOffer} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">{isRtl ? 'إضافة عرض ترويجي جديد:' : 'Add promotional offer:'}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={newOfferAr}
                      onChange={(e) => setNewOfferAr(e.target.value)}
                      placeholder={isRtl ? 'العنوان بالعربية...' : 'Title in Arabic...'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                    <input
                      type="text"
                      required
                      value={newOfferEn}
                      onChange={(e) => setNewOfferEn(e.target.value)}
                      placeholder={isRtl ? 'العنوان بالإنجليزية...' : 'Title in English...'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                    <input
                      type="number"
                      required
                      value={newOfferPrice}
                      onChange={(e) => setNewOfferPrice(e.target.value)}
                      placeholder={isRtl ? 'السعر (د.أ)...' : 'Price in JOD...'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-teal-650 hover:bg-teal-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {isRtl ? 'نشر العرض الطبي' : 'Publish Offer'}
                  </button>
                </form>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
