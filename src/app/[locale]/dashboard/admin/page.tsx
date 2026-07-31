'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';
import { 
  Doctor, Hospital, Case, Appointment, DoctorSubscriptionPlan,
  VerificationRequest, SponsoredCampaign, SponsoredCampaignStatus, AdminAuditEvent, PrivacyRequest, PrivacyRequestStatus, AdminNotification 
} from '@/types';
import { getAllDoctors } from '@/lib/repositories/doctors';
import { getAllHospitals } from '@/lib/repositories/hospitals';
import { inMemoryCases } from '@/data/mock/cases';
import { inMemoryAppointments } from '@/data/mock/cases';
import { getStatusLabel } from '@/lib/cases/case-status';

// Admin Services
import { 
  getVerificationRequests, 
  updateVerificationStatus, 
  suspendProvider, 
  reactivateProvider, 
  adminChangeDoctorSubscriptionPlan, 
  getPrivacyRequests, 
  resolvePrivacyRequest
} from '@/lib/admin/admin-actions';
import AdminDemoSettings from '@/components/admin/AdminDemoSettings';
import { 
  getSponsoredCampaigns, 
  createSponsoredCampaign, 
  updateSponsoredCampaignStatus
} from '@/lib/campaigns/sponsored-campaigns';
import { 
  getAdminAuditEvents
} from '@/lib/audit/admin-audit-log';

import { 
  Shield, Stethoscope, 
  CheckCircle, XCircle, AlertTriangle, 
  Search, Lock, Bell, ShieldCheck, Sparkles, 
  RotateCcw, FileText, X, Tag
} from 'lucide-react';

type AdminTab = 
  | 'overview' | 'providers' | 'verification' | 'cases_appointments' 
  | 'subscriptions' | 'campaigns' | 'governance' | 'audit_log' | 'demo_settings';

function AdminDashboardContent() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === '1' || searchParams.get('qa') === '1';

  // Navigation state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Repositories & State Stores
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [campaigns, setCampaigns] = useState<SponsoredCampaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditEvent[]>([]);
  const [privacyReqs, setPrivacyReqs] = useState<PrivacyRequest[]>([]);

  // Action Notice Banner
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Filters state
  const [providerSearch, setProviderSearch] = useState('');
  const [providerTypeFilter, setProviderTypeFilter] = useState<'all' | 'doctor' | 'hospital'>('all');
  const [verifFilter, setVerifFilter] = useState<string>('all');
  const [opsFilter, setOpsFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [auditEntityFilter, setAuditEntityFilter] = useState('all');

  // Modal / Form States
  const [suspendModalProvider, setSuspendModalProvider] = useState<Doctor | null>(null);
  const [suspendCategory, setSuspendCategory] = useState('Verification issue');
  const [suspendReason, setSuspendReason] = useState('');

  const [newCampaignDoctorId, setNewCampaignDoctorId] = useState('doc-1');
  const [newCampaignPlacement, setNewCampaignPlacement] = useState<'search_top' | 'home_featured' | 'specialty_banner'>('search_top');

  const [selectedAuditLog, setSelectedAuditLog] = useState<AdminAuditEvent | null>(null);

  // Admin Notifications Dropdown
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState<AdminNotification[]>([
    { id: 'anotif-1', type: 'verification', titleAr: 'طلب توثيق جديد من د. مريم النجار (إربد)', titleEn: 'New verification request from Dr. Maryam Al-Najjar (Irbid)', targetSection: 'verification', read: false, createdAt: 'قبل 15 دقيقة' },
    { id: 'anotif-2', type: 'privacy', titleAr: 'طلب خصوصية جديد (CASE-2026-000154)', titleEn: 'New privacy inquiry for CASE-2026-000154', targetSection: 'governance', read: false, createdAt: 'قبل ساعة' },
    { id: 'anotif-3', type: 'campaign', titleAr: 'تنبيه: أداء حملة ترويجية تجريبية نشطة', titleEn: 'Alert: Active pilot sponsored campaign performance', targetSection: 'campaigns', read: true, createdAt: 'قبل يوم' }
  ]);

  const loadAllData = useCallback(async () => {
    const docs = await getAllDoctors();
    const hosps = await getAllHospitals();
    setDoctors([...docs]);
    setHospitals([...hosps]);
    setCases([...inMemoryCases]);
    setAppointments([...inMemoryAppointments]);
    setVerifications(getVerificationRequests());
    setCampaigns(getSponsoredCampaigns());
    setAuditLogs(getAdminAuditEvents({ searchQuery: auditSearch, action: auditActionFilter, entityType: auditEntityFilter }));
    setPrivacyReqs(getPrivacyRequests());
  }, [auditSearch, auditActionFilter, auditEntityFilter]);

  useEffect(() => {
    loadAllData();
  }, [activeTab, loadAllData]);

  // Admin Action Wrappers
  const handleApproveVerification = (reqId: string) => {
    const res = updateVerificationStatus(reqId, 'verified', 'Verified official Medical Council license and Board credentials.');
    if (res.success) {
      setAdminNotice({ type: 'success', message: isRtl ? 'تم قبول توثيق مزود الخدمة وتسجيل الحدث في سجل التدقيق.' : 'Provider verification approved and audit event recorded.' });
      loadAllData();
    }
  };

  const handleRejectVerification = (reqId: string) => {
    const reason = prompt(isRtl ? 'يرجى كتابة سبب الرفض:' : 'Enter rejection reason:', 'Unverifiable credentials');
    if (reason) {
      const res = updateVerificationStatus(reqId, 'rejected', reason);
      if (res.success) {
        setAdminNotice({ type: 'error', message: isRtl ? 'تم رفض طلب التوثيق وتسجيل السبب.' : 'Verification rejected with reason recorded.' });
        loadAllData();
      }
    }
  };

  const handleRequestMoreInfo = (reqId: string) => {
    const reason = prompt(isRtl ? 'المعلومات المطلوبة:' : 'Enter requested information details:', 'Need updated clinic license document');
    if (reason) {
      const res = updateVerificationStatus(reqId, 'needs_information', reason);
      if (res.success) {
        setAdminNotice({ type: 'info', message: isRtl ? 'تم طلب معلومات إضافية من مزود الخدمة.' : 'Requested additional information from provider.' });
        loadAllData();
      }
    }
  };

  const handleExecuteSuspend = () => {
    if (!suspendModalProvider) return;
    const res = suspendProvider(suspendModalProvider.id, 'doctor', suspendCategory, suspendReason || 'Operational policy review');
    if (res.success) {
      setAdminNotice({ type: 'error', message: isRtl ? `تم توقيف الطبيب ${suspendModalProvider.name_ar} وإخفاؤه من نتائج البحث العام.` : `Provider ${suspendModalProvider.name_en} suspended and hidden from public search.` });
      setSuspendModalProvider(null);
      setSuspendReason('');
      loadAllData();
    }
  };

  const handleReactivate = (docId: string) => {
    const res = reactivateProvider(docId, 'doctor', 'Reactivated by admin after review');
    if (res.success) {
      setAdminNotice({ type: 'success', message: isRtl ? 'تم إعادة تفعيل الطبيب وإعادته لنتائج البحث المتاحة.' : 'Provider reactivated and restored to public search.' });
      loadAllData();
    }
  };

  const handleChangePlan = async (docId: string, newPlan: DoctorSubscriptionPlan) => {
    const res = await adminChangeDoctorSubscriptionPlan(docId, newPlan, 'Admin manually updated pilot plan tier');
    if (res.success) {
      setAdminNotice({ type: 'success', message: isRtl ? `تم تغيير الباقة إلى (${newPlan}) وتحديث الصلاحيات (محاكاة فقط - لا يوجد دفع حقيقي).` : `Subscription changed to (${newPlan}) and entitlements updated (Simulation only - no real charge).` });
      loadAllData();
    }
  };

  const handleCreateCampaign = () => {
    const doc = doctors.find(d => d.id === newCampaignDoctorId);
    if (!doc) return;

    const res = createSponsoredCampaign({
      providerId: doc.id,
      providerType: 'doctor',
      providerNameAr: doc.name_ar,
      providerNameEn: doc.name_en,
      placement: newCampaignPlacement,
      startAt: new Date().toISOString().substring(0, 10),
      endAt: '2026-08-31',
      reason: 'Admin activated pilot sponsored campaign'
    });

    if (!res.success) {
      setAdminNotice({ type: 'error', message: (isRtl ? res.messageAr : res.messageEn) || 'Failed to create campaign.' });
    } else {
      setAdminNotice({ type: 'success', message: isRtl ? `تم تفعيل الحملة الإعلانية للطبيب ${doc.name_ar} وإظهار شارة (إعلان) على بطاقة الطبيب.` : `Campaign activated for ${doc.name_en} and (Sponsored) badge rendered.` });
      loadAllData();
    }
  };

  const handleToggleCampaignStatus = (campId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    const res = updateSponsoredCampaignStatus(campId, newStatus as SponsoredCampaignStatus, 'Toggled by admin');
    if (!res.success) {
      setAdminNotice({ type: 'error', message: (isRtl ? res.messageAr : res.messageEn) || 'Failed to update campaign.' });
    } else {
      setAdminNotice({ type: 'success', message: isRtl ? `تم تحديث حالة الحملة الإعلانية إلى (${newStatus}).` : `Updated campaign status to (${newStatus}).` });
      loadAllData();
    }
  };

  const handleResolvePrivacyReq = (reqId: string, status: PrivacyRequestStatus) => {
    const res = resolvePrivacyRequest(reqId, status, 'Resolved by privacy admin');
    if (res.success) {
      setAdminNotice({ type: 'success', message: isRtl ? 'تم تحديث حالة طلب الخصوصية وتوثيقه في سجل التدقيق.' : 'Privacy request status updated and logged.' });
      loadAllData();
    }
  };

  // Filtered Provider Registry List
  const filteredDoctors = doctors.filter(doc => {
    if (providerTypeFilter === 'hospital') return false;
    if (verifFilter === 'verified' && !doc.is_verified) return false;
    if (verifFilter === 'unverified' && doc.is_verified) return false;
    if (opsFilter === 'active' && doc.operationalStatus === 'suspended') return false;
    if (opsFilter === 'suspended' && doc.operationalStatus !== 'suspended') return false;
    if (planFilter !== 'all' && doc.subscriptionPlan !== planFilter) return false;

    if (providerSearch.trim()) {
      const q = providerSearch.toLowerCase().trim();
      const matchId = doc.id.toLowerCase().includes(q);
      const matchName = doc.name_ar.toLowerCase().includes(q) || doc.name_en.toLowerCase().includes(q);
      const matchCity = doc.city_id.toLowerCase().includes(q);
      return matchId || matchName || matchCity;
    }
    return true;
  });

  const unreadNotifCount = adminNotifs.filter(n => !n.read).length;

  return (
    <div className="flex-1 bg-slate-50 font-cairo text-right rtl:text-right ltr:text-left py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header & Demo Notice Banner */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-7 w-7 text-indigo-600" />
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isRtl ? 'لوحة عمليات وإدارة شبكة طبّك (Tibbak Admin)' : 'Tibbak Admin Operations & Governance Panel'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {isRtl ? 'إدارة توثيق المزودين، الاشتراكات، الحملات الإعلانية، الخصوصية وسجل التدقيق' : 'Provider verification, subscriptions, sponsored campaigns, privacy & audit logs'}
              </p>
            </div>

            {/* Notification Bell & Demo Settings Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all relative cursor-pointer"
                  title={isRtl ? 'تنبيهات الإدارة' : 'Admin Notifications'}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifMenu && (
                  <div className="absolute left-0 rtl:left-0 ltr:right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-slate-100 p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black text-slate-900">{isRtl ? 'تنبيهات العمليات الإدارية' : 'Admin Operations Notifications'}</h4>
                      <button
                        onClick={() => setAdminNotifs(adminNotifs.map(n => ({ ...n, read: true })))}
                        className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer"
                      >
                        {isRtl ? 'تحديد الكل كقروء' : 'Mark all read'}
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {adminNotifs.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setAdminNotifs(adminNotifs.map(x => x.id === n.id ? { ...x, read: true } : x));
                            setActiveTab(n.targetSection as AdminTab);
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                            n.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-indigo-50/70 border-indigo-150 text-slate-800 font-bold hover:bg-indigo-50'
                          }`}
                        >
                          <p className="leading-snug">{isRtl ? n.titleAr : n.titleEn}</p>
                          <span className="text-[9px] opacity-70 block mt-1">{n.createdAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isDemoMode && (
                <button
                  onClick={() => setActiveTab('demo_settings')}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 text-indigo-600" />
                  <span>{isRtl ? 'إعدادات وإعادة ضبط العرض التجريبي' : 'Demo settings & reset'}</span>
                </button>
              )}
            </div>
          </div>

          <DemoDataBanner />

          {/* Admin Simulation Disclaimer Notice */}
          <DemoSafetyNotice locale={locale} className="mb-2" />
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isRtl 
                ? 'هذه لوحة إدارة تجريبية بدون نظام مصادقة إنتاجي. جميع الإجراءات محاكاة ببيانات وهمية لأغراض التقييم والتشغيل.'
                : 'This is a demo admin dashboard without production authentication. All actions are simulations using fictional data for presentation purposes.'}
            </p>
          </div>
        </div>

        {/* Global Action Result Feedback Notice */}
        {adminNotice && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
            adminNotice.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' :
            adminNotice.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-900' :
            'bg-blue-50 border border-blue-200 text-blue-900'
          }`}>
            <div className="flex items-center gap-2">
              {adminNotice.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              {adminNotice.type === 'error' && <XCircle className="h-5 w-5 text-rose-600" />}
              {adminNotice.type === 'info' && <ShieldCheck className="h-5 w-5 text-blue-600" />}
              <span>{adminNotice.message}</span>
            </div>
            <button onClick={() => setAdminNotice(null)} className="font-black cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          {[
            { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: Shield },
            { id: 'providers', labelAr: 'مقدمو الخدمة', labelEn: 'Providers', icon: Stethoscope },
            { id: 'verification', labelAr: 'طلبات التحقق', labelEn: 'Verification Requests', icon: ShieldCheck },
            { id: 'cases_appointments', labelAr: 'الحالات والمواعيد', labelEn: 'Cases & Appointments', icon: FileText },
            { id: 'subscriptions', labelAr: 'الاشتراكات', labelEn: 'Subscriptions', icon: Sparkles },
            { id: 'campaigns', labelAr: 'الحملات الإعلانية', labelEn: 'Sponsored Campaigns', icon: Tag },
            { id: 'governance', labelAr: 'الحوكمة والخصوصية', labelEn: 'Governance & Privacy', icon: Lock },
            { id: 'audit_log', labelAr: 'سجل التدقيق', labelEn: 'Audit Log', icon: FileText },
            ...(isDemoMode ? [{ id: 'demo_settings', labelAr: 'إعدادات العرض التجريبي', labelEn: 'Demo Settings', icon: RotateCcw }] : [])
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* TAB 1: OVERVIEW SECTION                                             */}
        {/* ================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-xs font-bold text-indigo-900">
              <span>{isRtl ? 'بيانات تجريبية لأغراض العرض وليست بيانات تشغيلية حقيقية.' : 'Fictional demo data for presentation purposes, not real operating data.'}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg">{isRtl ? 'مستندة إلى السجلات المحسوبة' : 'Calculated Mock Metrics'}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { titleAr: 'إجمالي الأطباء', titleEn: 'Total Doctors', val: doctors.length, color: 'text-indigo-600' },
                { titleAr: 'الأطباء الموثقون', titleEn: 'Verified Doctors', val: doctors.filter(d => d.is_verified).length, color: 'text-emerald-600' },
                { titleAr: 'طلبات التحقق المعلقة', titleEn: 'Pending Verification', val: verifications.filter(v => v.status === 'pending' || v.status === 'under_review').length, color: 'text-amber-600' },
                { titleAr: 'المزودون الموقوفون', titleEn: 'Suspended Providers', val: doctors.filter(d => d.operationalStatus === 'suspended').length, color: 'text-rose-600' },
                { titleAr: 'المستشفيات الشريكة', titleEn: 'Partner Hospitals', val: hospitals.length, color: 'text-blue-600' },
                { titleAr: 'إجمالي الحالات', titleEn: 'Total Cases', val: cases.length, color: 'text-purple-600' },
                { titleAr: 'حالات بانتظار رد الطبيب', titleEn: 'Awaiting Doctor', val: cases.filter(c => c.status === 'waiting_doctor').length, color: 'text-orange-600' },
                { titleAr: 'المواعيد المطلوبة', titleEn: 'Requested Appointments', val: appointments.filter(a => a.status === 'requested').length, color: 'text-amber-700' },
                { titleAr: 'المواعيد المؤكدة', titleEn: 'Scheduled Appointments', val: appointments.filter(a => a.status === 'scheduled').length, color: 'text-emerald-700' },
                { titleAr: 'الاشتراكات النشطة', titleEn: 'Active Subscriptions', val: doctors.filter(d => d.subscriptionPlan !== 'free').length, color: 'text-teal-600' },
                { titleAr: 'الحملات الإعلانية النشطة', titleEn: 'Active Ad Campaigns', val: campaigns.filter(c => c.status === 'active').length, color: 'text-amber-600' },
                { titleAr: 'طلبات الخصوصية', titleEn: 'Privacy Inquiries', val: privacyReqs.length, color: 'text-slate-600' }
              ].map((card, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">{isRtl ? card.titleAr : card.titleEn}</span>
                  <span className={`text-2xl sm:text-3xl font-black ${card.color}`}>{card.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: PROVIDERS REGISTRY                                          */}
        {/* ================================================================== */}
        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{isRtl ? 'سجل الأطباء والمستشفيات المزودة للخدمة' : 'Doctors & Hospitals Provider Registry'}</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'بحث وتصفية مزودي الخدمة وتغيير حالة التوثيق والتوقيف' : 'Search and filter providers, manage verification and suspension'}</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{isRtl ? `عدد النتائج المعروضة: ${filteredDoctors.length}` : `Visible: ${filteredDoctors.length}`}</span>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{isRtl ? 'نوع المزود:' : 'Provider Type:'}</label>
                <select value={providerTypeFilter} onChange={e => setProviderTypeFilter(e.target.value as 'all' | 'doctor' | 'hospital')} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none">
                  <option value="all">{isRtl ? 'الجميع' : 'All'}</option>
                  <option value="doctor">{isRtl ? 'أطباء فقط' : 'Doctors Only'}</option>
                  <option value="hospital">{isRtl ? 'مستشفيات' : 'Hospitals'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{isRtl ? 'البحث عن مزود:' : 'Search Provider:'}</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute right-3 top-2.5 text-slate-400 rtl:right-3 ltr:left-3" />
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={e => setProviderSearch(e.target.value)}
                    placeholder={isRtl ? 'الاسم، المعرف، المدينة...' : 'Name, ID, City...'}
                    className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 rtl:pr-9 ltr:pl-9 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{isRtl ? 'حالة التوثيق:' : 'Verification:'}</label>
                <select value={verifFilter} onChange={e => setVerifFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none">
                  <option value="all">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="verified">{isRtl ? 'موثق فقط' : 'Verified Only'}</option>
                  <option value="unverified">{isRtl ? 'غير موثق' : 'Unverified'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{isRtl ? 'الحالة التشغيلية:' : 'Operational Status:'}</label>
                <select value={opsFilter} onChange={e => setOpsFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none">
                  <option value="all">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="active">{isRtl ? 'نشط فقط' : 'Active Only'}</option>
                  <option value="suspended">{isRtl ? 'موقوف' : 'Suspended'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">{isRtl ? 'باقة الاشتراك:' : 'Subscription Plan:'}</label>
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none">
                  <option value="all">{isRtl ? 'جميع الباقات' : 'All Plans'}</option>
                  <option value="free">Free (مجانية)</option>
                  <option value="professional">Professional (مهنية)</option>
                  <option value="vip">VIP (كبار الشخصيات)</option>
                </select>
              </div>
            </div>

            {/* Provider Cards / List */}
            <div className="space-y-3">
              {filteredDoctors.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 font-bold text-xs">{isRtl ? 'لا يوجد مزودو خدمة يطابقون خيارات التصفية' : 'No providers match selected filters'}</div>
              ) : (
                filteredDoctors.map(doc => {
                  const isSuspended = doc.operationalStatus === 'suspended';
                  return (
                    <div key={doc.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                      isSuspended ? 'bg-rose-50/40 border-rose-200 opacity-90' : 'bg-white border-slate-150 shadow-xs'
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900">{isRtl ? doc.name_ar : doc.name_en}</span>
                          <span className="text-[10px] font-bold text-slate-400">({doc.id})</span>
                          {doc.is_verified && <span title={isRtl ? 'طبيب موثق' : 'Verified Doctor'}><ShieldCheck className="h-4 w-4 text-emerald-600" /></span>}
                          {isSuspended && <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md">{isRtl ? 'موقوف تشغيلياً' : 'SUSPENDED'}</span>}
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${
                            doc.subscriptionPlan === 'vip' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            doc.subscriptionPlan === 'professional' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {doc.subscriptionPlan.toUpperCase()}
                          </span>
                          {doc.isSponsored && <span className="bg-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md">{isRtl ? 'إعلان' : 'Sponsored'}</span>}
                        </div>
                        <p className="text-xs font-bold text-slate-500">{isRtl ? `المدينة: ${doc.city_id} | الترتيب المعياري: ${doc.organicSortOrder}` : `City: ${doc.city_id} | Organic Sort: ${doc.organicSortOrder}`}</p>
                      </div>

                      {/* Admin Operational Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        {isSuspended ? (
                          <button
                            onClick={() => handleReactivate(doc.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            {isRtl ? 'إعادة التفعيل' : 'Reactivate'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModalProvider(doc)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            {isRtl ? 'توقيف تشغيلي' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Modal: Provider Suspension Form */}
        {suspendModalProvider && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-black text-rose-900">{isRtl ? `توقيف مزود الخدمة: ${suspendModalProvider.name_ar}` : `Suspend Provider: ${suspendModalProvider.name_en}`}</h4>
                <button onClick={() => setSuspendModalProvider(null)} className="cursor-pointer font-black"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-slate-500 mb-1">{isRtl ? 'فئة سبب التوقيف:' : 'Suspension Category:'}</label>
                  <select value={suspendCategory} onChange={e => setSuspendCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:outline-none">
                    <option value="Verification issue">{isRtl ? 'مشكلة في التوثيق أو الترخيص' : 'Verification or license issue'}</option>
                    <option value="Profile policy issue">{isRtl ? 'مخالفة سياسات الملف الشخصي' : 'Profile policy violation'}</option>
                    <option value="Repeated operational issue">{isRtl ? 'ملاحظات تواصل مكررة' : 'Repeated operational issue'}</option>
                    <option value="Provider request">{isRtl ? 'بناءً على طلب الطبيب' : 'Provider request'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">{isRtl ? 'تفاصيل أسباب الإجراء (للتوثيق الإداري):' : 'Reason details (for audit log):'}</label>
                  <textarea
                    value={suspendReason}
                    onChange={e => setSuspendReason(e.target.value)}
                    placeholder={isRtl ? 'يرجى كتابة أسباب التوقيف الإداري...' : 'Enter suspension audit rationale...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 h-20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleExecuteSuspend} className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex-1 cursor-pointer">{isRtl ? 'تأكيد التوقيف' : 'Confirm Suspension'}</button>
                <button onClick={() => setSuspendModalProvider(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: VERIFICATION QUEUE                                          */}
        {/* ================================================================== */}
        {activeTab === 'verification' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'قائمة طلبات توثيق الأطباء والترخيص' : 'Provider License Verification Queue'}</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'مراجعة أدلة الترخيص، القبول، الرفض أو طلب معلومات إضافية' : 'Review credentials, approve, reject, or request information'}</p>
            </div>

            <div className="space-y-4">
              {verifications.map(req => (
                <div key={req.id} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/60 space-y-3 text-xs font-bold">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{isRtl ? req.providerNameAr : req.providerNameEn}</span>
                        <span className="text-[10px] text-slate-400">({req.providerId})</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${
                          req.status === 'verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          req.status === 'needs_information' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 font-bold mt-0.5">{isRtl ? `التخصص: ${req.specialtyOrTypeAr} | المدينة: ${req.cityAr}` : `Specialty: ${req.specialtyOrTypeEn} | City: ${req.cityEn}`}</p>
                    </div>

                    <span className="text-[10px] text-slate-400">{isRtl ? `تاريخ الطلب: ${req.submittedAt.substring(0, 10)}` : `Submitted: ${req.submittedAt.substring(0, 10)}`}</span>
                  </div>

                  <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-150">
                    <p className="text-slate-700"><strong>{isRtl ? 'رقم الترخيص الإرشادي:' : 'License Meta:'}</strong> {req.licenseNumber}</p>
                    <p className="text-slate-700"><strong>{isRtl ? 'مستند التوثيق المقدم:' : 'Qualification Evidence:'}</strong> {isRtl ? req.qualificationEvidenceAr : req.qualificationEvidenceEn}</p>
                  </div>

                  {/* Workflow Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {req.status !== 'verified' && (
                      <button onClick={() => handleApproveVerification(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-xs">
                        {isRtl ? 'قبول التوثيق (Approve)' : 'Approve'}
                      </button>
                    )}
                    {req.status !== 'needs_information' && (
                      <button onClick={() => handleRequestMoreInfo(req.id)} className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-xs">
                        {isRtl ? 'طلب معلومات إضافية' : 'Request Info'}
                      </button>
                    )}
                    {req.status !== 'rejected' && (
                      <button onClick={() => handleRejectVerification(req.id)} className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-xs">
                        {isRtl ? 'رفض التوثيق' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: CASES & APPOINTMENTS OPERATIONS                            */}
        {/* ================================================================== */}
        {activeTab === 'cases_appointments' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'المراقبة التشغيلية للحالات والمواعيد' : 'Cases & Appointments Operational Health'}</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'عرض البيانات الإدارية العامة بدون كشف أرقام الهواتف أو البريد الإكتروني أو الرسائل الخاصة' : 'Safe operational summaries with ZERO exposure of patient phone, email, or private messages'}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-xs text-slate-900">{isRtl ? 'سجل الحالات والطلبات الطبية التشغيلية:' : 'Operational Medical Cases Queue:'}</h4>
              <div className="space-y-3">
                {cases.map(c => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-bold">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{c.id}</span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-150">{getStatusLabel(c.status, isRtl)}</span>
                      </div>
                      <p className="text-slate-600 font-bold">{isRtl ? `المحافطة: ${c.patient_city} | العمر: ${c.patient_age} | تاريخ الطلب: ${c.created_at.substring(0, 10)}` : `City: ${c.patient_city} | Age: ${c.patient_age} | Date: ${c.created_at.substring(0, 10)}`}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>{isRtl ? 'الخصوصية محمية - لا يتوفر هاتف/بريد' : 'Privacy Protected - No PII Exposed'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: SUBSCRIPTIONS ADMINISTRATION                               */}
        {/* ================================================================== */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'إدارة باقات اشتراك المزودين والتسجير التجريبي' : 'Provider Subscriptions & Pilot Pricing'}</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'أسعار تجريبية لفترة الاختبار - محاكاة تغيير الباقة دون تأثر الترتيب المعياري' : 'Indicative pilot pricing - simulate plan changes without altering organic rank'}</p>
            </div>

            <div className="space-y-4">
              {doctors.map(doc => (
                <div key={doc.id} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-bold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{isRtl ? doc.name_ar : doc.name_en}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${
                        doc.subscriptionPlan === 'vip' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        doc.subscriptionPlan === 'professional' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {doc.subscriptionPlan.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-500 font-bold">{isRtl ? `الترتيب المعياري: ${doc.organicSortOrder} (لا يتأثر بالترقية)` : `Organic Rank: ${doc.organicSortOrder} (Unchanged by upgrade)`}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => handleChangePlan(doc.id, 'free')} className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer text-xs ${doc.subscriptionPlan === 'free' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>Free (0 JOD)</button>
                    <button onClick={() => handleChangePlan(doc.id, 'professional')} className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer text-xs ${doc.subscriptionPlan === 'professional' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>Pro (29 JOD)</button>
                    <button onClick={() => handleChangePlan(doc.id, 'vip')} className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer text-xs ${doc.subscriptionPlan === 'vip' ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>VIP (59 JOD)</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 6: SPONSORED CAMPAIGN ADMINISTRATION                           */}
        {/* ================================================================== */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'إدارة الحملات الإعلانية الترويجية المستقلة' : 'Standalone Sponsored Campaigns Engine'}</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'الحملات الإعلانية نظام ترويجي منفصل عن باقات الاشتراك والترتيب المعياري' : 'Ad campaigns are completely independent of subscription tiers or organic rank'}</p>
            </div>

            {/* Campaign Creation Panel */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3 text-xs font-bold">
              <h4 className="font-black text-amber-900">{isRtl ? 'إنشاء حملة إعلانية ترويجية جديدة لمزود خدمة:' : 'Create New Pilot Sponsored Campaign:'}</h4>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">{isRtl ? 'اختيار الطبيب:' : 'Select Doctor:'}</label>
                  <select value={newCampaignDoctorId} onChange={e => setNewCampaignDoctorId(e.target.value)} className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none">
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{isRtl ? d.name_ar : d.name_en} ({d.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">{isRtl ? 'موقع الظهور الإعلاني:' : 'Ad Placement:'}</label>
                  <select value={newCampaignPlacement} onChange={e => setNewCampaignPlacement(e.target.value as 'search_top' | 'home_featured' | 'specialty_banner')} className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none">
                    <option value="search_top">{isRtl ? 'أعلى نتائج البحث (Search Top)' : 'Search Top'}</option>
                    <option value="home_featured">{isRtl ? 'الصفحة الرئيسية المميزة (Home Featured)' : 'Home Featured'}</option>
                    <option value="specialty_banner">{isRtl ? 'بانر التخصص (Specialty Banner)' : 'Specialty Banner'}</option>
                  </select>
                </div>

                <div className="flex items-end pt-4">
                  <button onClick={handleCreateCampaign} className="bg-amber-600 hover:bg-amber-700 text-white font-black px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs">
                    {isRtl ? 'تفعيل الحملة الآن' : 'Activate Campaign'}
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign List */}
            <div className="space-y-3">
              {campaigns.map(camp => (
                <div key={camp.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-bold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{isRtl ? camp.providerNameAr : camp.providerNameEn}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                        camp.status === 'active' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {camp.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-500">{isRtl ? `موقع الظهور: ${camp.placement} | تاريخ البدء: ${camp.startAt} | الانتهاء: ${camp.endAt}` : `Placement: ${camp.placement} | Start: ${camp.startAt} | End: ${camp.endAt}`}</p>
                  </div>

                  <button
                    onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    {camp.status === 'active' ? (isRtl ? 'إيقاف مؤقت' : 'Pause') : (isRtl ? 'إعادة تفعيل' : 'Resume')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 7: GOVERNANCE & PRIVACY                                        */}
        {/* ================================================================== */}
        {activeTab === 'governance' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'حوكمة الخصوصية ومتابعة طلبات البيانات' : 'Privacy Governance & Consent Records'}</h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'هذه أدوات عرض تجريبية ولا تمثل نظام امتثال قانوني أو تنظيمي نهائي.' : 'These are demonstration tools and do not represent a final legal or regulatory compliance system.'}</p>
            </div>

            <div className="space-y-4">
              {privacyReqs.map(req => (
                <div key={req.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-bold">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{req.id}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-150">{req.status.toUpperCase()}</span>
                    </div>
                    <p className="text-slate-600">{isRtl ? req.descriptionAr : req.descriptionEn}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status !== 'completed' && (
                      <button onClick={() => handleResolvePrivacyReq(req.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs">
                        {isRtl ? 'إغلاق الطلب' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 8: AUDIT LOG                                                   */}
        {/* ================================================================== */}
        {activeTab === 'audit_log' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{isRtl ? 'سجل التدقيق الإداري غير القابل للتعديل' : 'Append-Only Admin Audit Log'}</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{isRtl ? 'توثيق غير قابل للتعديل لجميع العمليات الإدارية والتوثيقات والاشتراكات' : 'Immutable audit trail for all administrative actions, verifications, and subscriptions'}</p>
              </div>
              <span className="text-xs font-bold text-slate-500">{isRtl ? `إجمالي السجلات: ${auditLogs.length}` : `Total Events: ${auditLogs.length}`}</span>
            </div>

            {/* Audit Log Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs font-bold">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{isRtl ? 'بحث في السجل:' : 'Search Audit:'}</label>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder={isRtl ? 'المعرف، الإجراء، السبب...' : 'ID, action, reason...'}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{isRtl ? 'تصفية حسب الإجراء:' : 'Action Filter:'}</label>
                <select value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2 focus:outline-none">
                  <option value="all">{isRtl ? 'جميع الإجراءات' : 'All Actions'}</option>
                  <option value="provider_verification_approved">Verification Approved</option>
                  <option value="provider_suspended">Provider Suspended</option>
                  <option value="subscription_plan_changed">Subscription Changed</option>
                  <option value="campaign_created">Campaign Created</option>
                  <option value="demo_data_reset">Demo Reset</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">{isRtl ? 'نوع الكيان (Entity):' : 'Entity Type:'}</label>
                <select value={auditEntityFilter} onChange={e => setAuditEntityFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl p-2 focus:outline-none">
                  <option value="all">{isRtl ? 'جميع الكيانات' : 'All Entities'}</option>
                  <option value="verification">Verification</option>
                  <option value="subscription">Subscription</option>
                  <option value="campaign">Campaign</option>
                  <option value="provider">Provider</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log.id} onClick={() => setSelectedAuditLog(log)} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-slate-100/70 transition-all cursor-pointer text-xs font-bold space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-indigo-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.createdAt.substring(0, 19).replace('T', ' ')}</span>
                  </div>
                  <p className="text-slate-800"><strong>Before:</strong> {log.beforeSummary} → <strong>After:</strong> {log.afterSummary}</p>
                  <p className="text-slate-500 text-[10px]"><strong>Reason:</strong> {log.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Audit Log Drawer */}
        {selectedAuditLog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-black text-slate-900">{isRtl ? `تفاصيل سجل التدقيق: ${selectedAuditLog.id}` : `Audit Log Detail: ${selectedAuditLog.id}`}</h4>
                <button onClick={() => setSelectedAuditLog(null)} className="cursor-pointer font-black"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-700">
                <p><strong>Action:</strong> {selectedAuditLog.action}</p>
                <p><strong>Actor Role:</strong> {selectedAuditLog.actorRole} ({selectedAuditLog.actorId})</p>
                <p><strong>Entity Type:</strong> {selectedAuditLog.entityType} ({selectedAuditLog.entityId})</p>
                <p><strong>Before:</strong> {selectedAuditLog.beforeSummary}</p>
                <p><strong>After:</strong> {selectedAuditLog.afterSummary}</p>
                <p><strong>Audit Rationale:</strong> {selectedAuditLog.reason}</p>
                <p><strong>Timestamp:</strong> {selectedAuditLog.createdAt}</p>
              </div>

              <button onClick={() => setSelectedAuditLog(null)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-black py-2.5 rounded-xl text-xs cursor-pointer">
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 9: DEMO SETTINGS (VISIBLE ONLY WHEN ?demo=1 IS PRESENT)       */}
        {/* ================================================================== */}
        {activeTab === 'demo_settings' && isDemoMode && (
          <AdminDemoSettings isDemoMode={isDemoMode} isRtl={isRtl} onResetComplete={loadAllData} />
        )}

      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">جاري تحميل لوحة عمليات الإدارة...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
