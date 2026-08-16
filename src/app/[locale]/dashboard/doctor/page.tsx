'use client';

import { useState, useEffect, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getDoctorById, adminUpdateDoctorSubscriptionPlan } from '@/lib/repositories/doctors';
import { getCasesForDoctor } from '@/lib/repositories/cases';
import { 
  getAppointmentsForDoctor, 
  confirmAppointment, 
  rescheduleAppointment, 
  cancelAppointment, 
  markAppointmentAttended, 
  markAppointmentNoShow 
} from '@/lib/repositories/bookings';
import { 
  loadScheduleConfig, 
  saveScheduleConfig, 
  validateScheduleConfig, 
  addScheduleException, 
  DoctorScheduleConfig 
} from '@/lib/repositories/appointment-slots';
import { 
  getDoctorEntitlements, 
  isCaseAccessibleForDoctor 
} from '@/lib/subscriptions/doctor-entitlements';
import { resetDay4Fixtures } from '@/lib/demo/day4-qa-fixtures';
import { Doctor, Appointment, DoctorSubscriptionPlan, ProviderCaseSummary } from '@/types';
import { 
  TrendingUp, MessageSquare, Clock, Eye, 
  Calendar, Briefcase, Award, Sparkles, AlertCircle, Filter, Search, 
  X, Check, RotateCcw, Bell, UserCheck, CheckCircle2, HelpCircle, 
  CalendarX, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';
import { getStatusLabel } from '@/lib/cases/case-status';
import DoctorOfferControls from '@/components/dashboard/DoctorOfferControls';
import DoctorScheduleManager from '@/components/dashboard/DoctorScheduleManager';
import { Tag } from 'lucide-react';

const STORAGE_KEY_DOCTOR_PLAN = 'tibbak_doctor_plan_v1';
const STORAGE_KEY_NOTIFS = 'tibbak_doctor_notifications_v1';

interface NotificationItem {
  id: string;
  caseId?: string;
  isLocked?: boolean;
  titleAr: string;
  titleEn: string;
  date: string;
  read: boolean;
}

function DoctorDashboardContent() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === '1' || searchParams.get('qa') === '1';

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [cases, setCases] = useState<ProviderCaseSummary[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<DoctorScheduleConfig | null>(null);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'appointments' | 'schedule' | 'analytics' | 'profile' | 'subscription' | 'offers'>('overview');

  // Complete Case filtering & search states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'accessible' | 'locked'>('all');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Notifications dropdown with session persistence
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'notif-1', caseId: 'CASE-2026-000154', isLocked: false, titleAr: 'طلب حالة جديدة بحاجة للمراجعة (CASE-2026-000154)', titleEn: 'New case request awaiting review (CASE-2026-000154)', date: 'قبل 10 دقائق', read: false },
    { id: 'notif-2', caseId: 'CASE-2026-000002', isLocked: false, titleAr: 'تم تحديد موعد جديد للمريض سارة أحمد', titleEn: 'New appointment scheduled for patient Sara Ahmad', date: 'قبل ساعة', read: false },
    { id: 'notif-3', caseId: 'CASE-2026-000004', isLocked: true, titleAr: 'تنبيه: حالة مقيدة جديدة بانتظار ترقية الباقة', titleEn: 'Alert: New locked lead awaiting plan upgrade', date: 'قبل يوم', read: true }
  ]);
  const [lockedNotifAlert, setLockedNotifAlert] = useState<string | null>(null);

  // Schedule Editor form states
  const [workingDays, setWorkingDays] = useState<number[]>([0, 1, 2, 3, 4, 6]); // Sun-Thu + Sat
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(30);
  const [newLeaveDate, setNewLeaveDate] = useState<string>('');
  const [scheduleSaveSuccess, setScheduleSaveSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Appointment Actions state
  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('2026-07-25');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState<string>('10:00 AM');
  const [appointmentActionResult, setAppointmentActionResult] = useState<{ success: boolean; message: string; errorCode?: string } | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState<string>('');

  // Upgrade / Reset simulation message
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null);

  const loadData = async () => {
    let doc = await getDoctorById('doc-1');
    if (doc && typeof window !== 'undefined') {
      const savedPlan = sessionStorage.getItem(STORAGE_KEY_DOCTOR_PLAN) as DoctorSubscriptionPlan;
      if (savedPlan) {
        doc = { ...doc, subscriptionPlan: savedPlan };
      }

      // Load persistent notifications
      try {
        const savedNotifs = sessionStorage.getItem(STORAGE_KEY_NOTIFS);
        if (savedNotifs) {
          setNotifications(JSON.parse(savedNotifs));
        }
      } catch (e) {
        console.error('Failed loading notifications', e);
      }
    }

    if (doc) {
      setDoctor(doc);
      
      const docCases = await getCasesForDoctor(doc.id);
      setCases(docCases);
      
      const docApts = await getAppointmentsForDoctor(doc.id);
      setAppointments(docApts);

      const sched = loadScheduleConfig(doc.id);
      setScheduleConfig(sched);
      setWorkingDays(sched.workingDays);
      setStartHour(sched.startHour);
      setEndHour(sched.endHour);
      setBreakStart(sched.breakStart);
      setBreakEnd(sched.breakEnd);
      setSlotDurationMinutes(sched.slotDurationMinutes || 30);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveNotificationsState = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(newNotifs));
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotificationsState(updated);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotificationsState(updated);
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    handleMarkNotificationRead(notif.id);
    if (notif.isLocked) {
      setLockedNotifAlert(
        isRtl 
          ? 'هذه الحالة مقيدة لأنك وصلت إلى الحد الأقصى للباقة المجانية. يرجى الترقية للوصول إلى تفاصيل الحالة.'
          : 'This lead is locked because you reached the Free plan limit. Upgrade to access full lead details.'
      );
    } else if (notif.caseId) {
      setActiveTab('cases');
    }
  };

  const handleSimulatedUpgrade = async (newPlan: DoctorSubscriptionPlan) => {
    if (!doctor) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_DOCTOR_PLAN, newPlan);
    }
    await adminUpdateDoctorSubscriptionPlan(doctor.id, newPlan);
    
    setSimulatedNotice(
      isRtl 
        ? 'تمت محاكاة الترقية إلى الباقة المهنية. يمكنك الآن فتح جميع الحالات وإدارتها.'
        : 'The upgrade to the Professional plan has been simulated. All cases are now accessible.'
    );

    loadData();
  };

  const handleSimulatedResetToFree = async () => {
    if (!doctor) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_DOCTOR_PLAN, 'free');
    }
    await adminUpdateDoctorSubscriptionPlan(doctor.id, 'free');

    setSimulatedNotice(
      isRtl
        ? 'تمت إعادة ضبط الاشتراك إلى الباقة المجانية لتسهيل اختبار القيود.'
        : 'Subscription reset to Free plan for testing.'
    );

    loadData();
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);
    setScheduleSaveSuccess(false);

    if (!doctor) return;

    const proposedConfig: DoctorScheduleConfig = {
      doctorId: doctor.id,
      workingDays,
      startHour,
      endHour,
      breakStart,
      breakEnd,
      slotDurationMinutes,
      exceptions: scheduleConfig?.exceptions || []
    };

    const validation = validateScheduleConfig(proposedConfig);
    if (!validation.isValid) {
      setScheduleError(isRtl ? validation.messageAr! : validation.messageEn!);
      return;
    }

    saveScheduleConfig(proposedConfig);
    setScheduleConfig(proposedConfig);
    setScheduleSaveSuccess(true);
    setTimeout(() => setScheduleSaveSuccess(false), 3000);
  };

  const handleAddLeaveDate = () => {
    if (!newLeaveDate || !scheduleConfig || !doctor) return;
    setScheduleError(null);

    const result = addScheduleException(scheduleConfig, newLeaveDate);
    if (!result.isValid) {
      setScheduleError(isRtl ? result.messageAr! : result.messageEn!);
      return;
    }

    saveScheduleConfig(result.updatedConfig!);
    setScheduleConfig(result.updatedConfig!);
    setNewLeaveDate('');
    setScheduleSaveSuccess(true);
    setTimeout(() => setScheduleSaveSuccess(false), 3000);
  };

  const handleRemoveLeaveDate = (dateToRemove: string) => {
    if (!scheduleConfig || !doctor) return;
    const updated: DoctorScheduleConfig = {
      ...scheduleConfig,
      exceptions: scheduleConfig.exceptions.filter(d => d !== dateToRemove)
    };
    saveScheduleConfig(updated);
    setScheduleConfig(updated);
  };

  // Complete Appointment Actions handlers
  const handleConfirmApt = async (aptId: string) => {
    setAppointmentActionResult(null);
    const res = await confirmAppointment(aptId, { type: 'doctor', id: 'doc-1' });
    if (!res.success) {
      setAppointmentActionResult({
        success: false,
        errorCode: res.errorCode,
        message: (isRtl ? res.messageAr : res.messageEn) || (isRtl ? 'فشل تأكيد الموعد.' : 'Failed to confirm appointment.')
      });
    } else {
      setAppointmentActionResult({
        success: true,
        message: isRtl ? 'تم تأكيد الموعد وتحديث حالة الملف بنجاح (appointment_scheduled).' : 'Appointment confirmed and scheduled (appointment_scheduled).'
      });
      loadData();
    }
  };

  const handleRescheduleSubmit = async (aptId: string) => {
    setAppointmentActionResult(null);
    const res = await rescheduleAppointment(aptId, rescheduleDate, rescheduleTimeSlot, { type: 'doctor', id: 'doc-1' });
    if (!res.success) {
      setAppointmentActionResult({
        success: false,
        errorCode: res.errorCode,
        message: isRtl ? 'الموعد المحدد مشغول بموعد آخر. (APPOINTMENT_SLOT_UNAVAILABLE)' : 'The selected slot is occupied. (APPOINTMENT_SLOT_UNAVAILABLE)'
      });
    } else {
      setAppointmentActionResult({
        success: true,
        message: isRtl ? `تم إعادة جدولة الموعد إلى ${rescheduleDate} الساعة ${rescheduleTimeSlot}` : `Rescheduled to ${rescheduleDate} at ${rescheduleTimeSlot}`
      });
      setRescheduleAptId(null);
      loadData();
    }
  };

  const handleCancelApt = async (aptId: string) => {
    setAppointmentActionResult(null);
    const reason = cancelReasonInput.trim() || 'Cancelled by doctor';
    const res = await cancelAppointment(aptId, reason, 'doctor', { type: 'doctor', id: 'doc-1' });
    if (res.success) {
      setAppointmentActionResult({
        success: true,
        message: isRtl ? 'تم إلغاء الموعد وتوثيق السبب في سجل الحالة.' : 'Appointment cancelled and reason recorded.'
      });
      setCancelReasonInput('');
      loadData();
    }
  };

  const handleMarkAttended = async (aptId: string) => {
    setAppointmentActionResult(null);
    const res = await markAppointmentAttended(aptId, { type: 'doctor', id: 'doc-1' });
    if (!res.success) {
      setAppointmentActionResult({
        success: false,
        errorCode: res.errorCode,
        message: (isRtl ? res.messageAr : res.messageEn) || (isRtl ? 'فشل تسجيل الحضور.' : 'Failed to mark attended.')
      });
    } else {
      setAppointmentActionResult({
        success: true,
        message: isRtl ? 'تم توثيق حضور المريض واكتمال الزيارة (visit_completed).' : 'Marked visit attended (visit_completed).'
      });
      loadData();
    }
  };

  const handleMarkNoShow = async (aptId: string) => {
    setAppointmentActionResult(null);
    const res = await markAppointmentNoShow(aptId, { type: 'doctor', id: 'doc-1' });
    if (!res.success) {
      setAppointmentActionResult({
        success: false,
        errorCode: res.errorCode,
        message: (isRtl ? res.messageAr : res.messageEn) || (isRtl ? 'فشل تسجيل عدم الحضور.' : 'Failed to mark no-show.')
      });
    } else {
      setAppointmentActionResult({
        success: true,
        message: isRtl ? 'تم تسجيل عدم حضور المريض (no_show).' : 'Marked patient no-show (no_show).'
      });
      loadData();
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setAccessFilter('all');
    setDateStart('');
    setDateEnd('');
    setUnreadOnly(false);
    setSearchQuery('');
  };

  if (!doctor) {
    return (
      <div className="py-20 text-center font-cairo">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs font-bold text-slate-500">{isRtl ? 'جاري تحميل لوحة تحكم الطبيب...' : 'Loading doctor dashboard...'}</p>
      </div>
    );
  }

  const entitlements = getDoctorEntitlements(doctor.subscriptionPlan);
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Overview metrics calculations
  const newCasesCount = cases.filter(c => c.status === 'new').length;
  const awaitingReviewCount = cases.filter(c => c.status === 'under_review' || c.status === 'waiting_doctor').length;
  const upcomingAptsCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedVisitsCount = cases.filter(c => c.status === 'visit_completed' || c.status === 'completed').length;

  // Strict Filtered Cases Logic
  const filteredCases = cases.filter((c, idx) => {
    const isAccessible = isCaseAccessibleForDoctor(idx, doctor.subscriptionPlan);

    // 1. Filter by Access State
    if (accessFilter === 'accessible' && !isAccessible) return false;
    if (accessFilter === 'locked' && isAccessible) return false;

    // 2. Filter by Status
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;

    // 3. Filter by Unread / New
    if (unreadOnly && c.status !== 'new' && c.status !== 'under_review') return false;

    // 4. Filter by Date Range
    if (dateStart && new Date(c.created_at) < new Date(dateStart)) return false;
    if (dateEnd && new Date(c.created_at) > new Date(dateEnd + 'T23:59:59')) return false;

    // 5. Search Query: Search ONLY Case ID, Safe Patient Name, Specialty
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = c.id.toLowerCase().includes(q);
      const matchSpec = (c.lead_source || '').toLowerCase().includes(q);
      const matchName = isAccessible ? c.patient_name.toLowerCase().includes(q) : false;
      return matchId || matchSpec || matchName;
    }

    return true;
  });

  return (
    <div className="flex-1 bg-slate-50 font-cairo text-right rtl:text-right ltr:text-left py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header & Demo Banner */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isRtl ? `أهلاً بك، ${doctor.name_ar}` : `Welcome, ${doctor.name_en}`}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  doctor.subscriptionPlan === 'vip' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  doctor.subscriptionPlan === 'professional' ? 'bg-teal-100 text-teal-900 border border-teal-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {entitlements.nameAr}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1 mb-2">
                {isRtl ? 'لوحة تحكم الطبيب وإدارة طلبات المرضى والمواعيد' : 'Doctor Control Panel & Case Management'}
              </p>
              <DemoSafetyNotice locale={locale} />
            </div>

            {/* Notification Bell & Upgrade Quick Action */}
            <div className="flex items-center gap-3 relative">
              
              {/* Notification Center Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer relative"
                  title={isRtl ? 'مركز التنبيهات' : 'Notification Center'}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute left-0 rtl:left-0 ltr:right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-150 shadow-xl z-50 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-black text-xs text-slate-900">{isRtl ? 'مركز التنبيهات' : 'Notifications'}</h4>
                      {unreadNotifCount > 0 && (
                        <button 
                          onClick={handleMarkAllNotificationsRead} 
                          className="text-[10px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          {isRtl ? 'تحديد الكل كقروء' : 'Mark all read'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold text-center py-4">{isRtl ? 'لا توجد تنبيهات جديدة' : 'No new notifications'}</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                              n.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-teal-50/70 border-teal-150 text-slate-800 font-bold hover:bg-teal-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="leading-snug">{isRtl ? n.titleAr : n.titleEn}</p>
                              {n.isLocked && <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />}
                            </div>
                            <span className="text-[9px] opacity-70 block mt-1">{n.date}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* QA Reset Utility Button (Visible ONLY when demo/qa parameter is present) */}
              {isDemoMode && (
                <button
                  onClick={async () => {
                    await resetDay4Fixtures();
                    await loadData();
                    setSimulatedNotice(isRtl ? 'تمت إعادة ضبط بيانات العرض التجريبي بنجاح.' : 'Demo data reset successfully.');
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title={isRtl ? 'إعادة ضبط بيانات العرض التجريبي' : 'Reset demo data'}
                >
                  <RotateCcw className="h-4 w-4 text-indigo-600" />
                  <span>{isRtl ? 'إعادة ضبط بيانات العرض التجريبي' : 'Reset demo data'}</span>
                </button>
              )}

              {/* Upgrade or Reset Quick Action */}
              {doctor.subscriptionPlan === 'free' ? (
                <button
                  onClick={() => handleSimulatedUpgrade('professional')}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isRtl ? 'محاكاة الترقية للمهنية' : 'Simulate Professional Upgrade'}</span>
                </button>
              ) : (
                <button
                  onClick={handleSimulatedResetToFree}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="h-4 w-4 text-slate-500" />
                  <span>{isRtl ? 'إعادة ضبط للباقة المجانية' : 'Reset to Free Plan'}</span>
                </button>
              )}

            </div>

          </div>

          <DemoDataBanner />

          {/* Simulation Notice Banner */}
          {simulatedNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-extrabold flex justify-between items-center">
              <span>{simulatedNotice}</span>
              <button onClick={() => setSimulatedNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Locked Notification Alert Modal */}
          {lockedNotifAlert && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <span>{lockedNotifAlert}</span>
              </div>
              <button onClick={() => setLockedNotifAlert(null)} className="text-amber-800 font-bold cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Navigation Bar Tabs */}
          <div className="flex overflow-x-auto gap-2 pt-2 border-t border-slate-100 scrollbar-none">
            {[
              { key: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: TrendingUp },
              { key: 'cases', labelAr: 'الحالات والطلبات', labelEn: 'Cases & Pipeline', icon: Briefcase },
              { key: 'appointments', labelAr: 'المواعيد والزيارات', labelEn: 'Appointments', icon: Calendar },
              { key: 'schedule', labelAr: 'إدارة الجدول', labelEn: 'Schedule', icon: Clock },
              { key: 'offers', labelAr: 'العروض والأسعار', labelEn: 'Offers & Discounts', icon: Tag },
              { key: 'analytics', labelAr: 'التحليلات ومعدل التحويل', labelEn: 'Analytics', icon: Eye },
              { key: 'profile', labelAr: 'الملف الشخصي', labelEn: 'Profile Completeness', icon: UserCheck },
              { key: 'subscription', labelAr: 'الاشتراك والباقات', labelEn: 'Subscription', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* ================================================================== */}
        {/* TAB 1: OVERVIEW TAB                                                */}
        {/* ================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Operational Value Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { titleAr: 'طلبات الحالات الجديدة', titleEn: 'New Requests', value: newCasesCount, subAr: 'بيانات تجريبية', color: 'text-teal-600 bg-teal-50' },
                { titleAr: 'بانتظار المراجعة', titleEn: 'Awaiting Review', value: awaitingReviewCount, subAr: 'بيانات تجريبية', color: 'text-amber-600 bg-amber-50' },
                { titleAr: 'مواعيد قادمة', titleEn: 'Scheduled Appointments', value: upcomingAptsCount, subAr: 'بيانات تجريبية', color: 'text-blue-600 bg-blue-50' },
                { titleAr: 'زيارات مكتملة', titleEn: 'Completed Visits', value: completedVisitsCount, subAr: 'بيانات تجريبية', color: 'text-emerald-600 bg-emerald-50' },
                { titleAr: 'مشاهدات الملف', titleEn: 'Profile Views', value: '1,420', subAr: 'بيانات محاكاة', color: 'text-purple-600 bg-purple-50' },
                { titleAr: 'معدل تحويل المواعيد', titleEn: 'Conversion Rate', value: '28.5%', subAr: 'معدل الأداء', color: 'text-indigo-600 bg-indigo-50' }
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-1 shadow-xs">
                  <span className="text-[10px] font-black text-slate-400 block">{isRtl ? card.titleAr : card.titleEn}</span>
                  <div className="text-xl font-black text-slate-900">{card.value}</div>
                  <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md ${card.color}`}>
                    {card.subAr}
                  </span>
                </div>
              ))}
            </div>

            {/* High Priority Action Required Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span>{isRtl ? 'يتطلب إجراء عاجل (Action Required)' : 'Action Required'}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{isRtl ? 'قائمة مهام العيادة اليومية' : 'Daily Task List'}</span>
              </div>

              <div className="space-y-3">
                {/* Item 1: Unanswered Case */}
                <div className="p-4 bg-amber-50/60 border border-amber-150 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-bold">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {isRtl ? 'طلب جديد بحاجة للمراجعة' : 'New Request Needs Review'}
                    </span>
                    <h4 className="text-slate-900 font-black">CASE-2026-000154 — {isRtl ? 'ألم الركبة المستمر' : 'Knee Pain'}</h4>
                    <p className="text-slate-500 font-medium text-[11px]">{isRtl ? 'تم التقديم قبل ساعتين من عمان' : 'Submitted 2 hours ago from Amman'}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('cases')}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {isRtl ? 'مراجعة وقبول الطلب' : 'Review & Accept Request'}
                  </button>
                </div>

                {/* Item 2: Free Limit Reached Alert */}
                {doctor.subscriptionPlan === 'free' && (
                  <div className="p-4 bg-purple-50/60 border border-purple-150 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-bold">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                        {isRtl ? 'تنبيه حد الاشتراك' : 'Subscription Limit Alert'}
                      </span>
                      <h4 className="text-slate-900 font-black">{isRtl ? 'وصلت إلى حد 3 حالات مجانية لهذا الشهر' : 'Reached 3 Free cases limit'}</h4>
                      <p className="text-slate-500 font-medium text-[11px]">{isRtl ? 'هناك حالات إضافية مقيدة بانتظار الترقية' : 'Additional gated leads awaiting upgrade'}</p>
                    </div>
                    <button 
                      onClick={() => handleSimulatedUpgrade('professional')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                    >
                      {isRtl ? 'محاكاة ترقية الباقة' : 'Simulate Plan Upgrade'}
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: CASES & PIPELINE TAB                                       */}
        {/* ================================================================== */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="font-black text-sm text-slate-900">{isRtl ? 'تصفية وحصر الحالات' : 'Case Filters'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">
                    {isRtl ? `عرض ${filteredCases.length} من أصل ${cases.length} حالة` : `Showing ${filteredCases.length} of ${cases.length} cases`}
                  </span>
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-rose-600 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isRtl ? 'إعادة ضبط الفلاتر' : 'Clear All'}</span>
                  </button>
                </div>
              </div>

              {/* Filters Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold">
                
                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">{isRtl ? 'حالة الطلب:' : 'Status:'}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 w-full focus:outline-none"
                  >
                    <option value="all">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
                    <option value="new">{isRtl ? 'جديدة (New)' : 'New'}</option>
                    <option value="under_review">{isRtl ? 'قيد المراجعة (Review)' : 'Under Review'}</option>
                    <option value="accepted">{isRtl ? 'مقبولة (Accepted)' : 'Accepted'}</option>
                    <option value="appointment_scheduled">{isRtl ? 'موعد محدد (Scheduled)' : 'Scheduled'}</option>
                    <option value="completed">{isRtl ? 'مكتملة (Completed)' : 'Completed'}</option>
                  </select>
                </div>

                {/* Access State Filter */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">{isRtl ? 'حالة الوصول:' : 'Access State:'}</label>
                  <select
                    value={accessFilter}
                    onChange={(e) => setAccessFilter(e.target.value as typeof accessFilter)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 w-full focus:outline-none"
                  >
                    <option value="all">{isRtl ? 'الكل (Accessible & Locked)' : 'All Leads'}</option>
                    <option value="accessible">{isRtl ? 'حالات متاحة فقط (Accessible)' : 'Accessible Only'}</option>
                    <option value="locked">{isRtl ? 'حالات مقيدة فقط (Locked)' : 'Locked Only'}</option>
                  </select>
                </div>

                {/* Date Range Start */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">{isRtl ? 'من تاريخ:' : 'From Date:'}</label>
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 w-full focus:outline-none"
                  />
                </div>

                {/* Date Range End */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">{isRtl ? 'إلى تاريخ:' : 'To Date:'}</label>
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2 px-3 w-full focus:outline-none"
                  />
                </div>

              </div>

              {/* Search Bar & Unread Checkbox */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 text-slate-400 absolute right-3 rtl:right-3 ltr:left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isRtl ? 'بحث برقم الحالة أو اسم المريض المصرح...' : 'Search Case ID or Safe Patient Name...'}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl py-2 pr-9 rtl:pr-9 ltr:pl-9 pl-3 w-full focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <span>{isRtl ? 'عرض الطلبات الجديدة والجيل الجديد فقط' : 'Unread / New cases only'}</span>
                </label>
              </div>

            </div>

            {/* Cases Pipeline List */}
            <div className="space-y-4">
              {filteredCases.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 shadow-xs">
                  <CalendarX className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="text-base font-black text-slate-800">{isRtl ? 'لا توجد حالات تطابق الفلاتر المحددة' : 'No cases match selected filters'}</h4>
                  <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                    {isRtl ? 'جرّب تغيير خيارات البحث أو التارخ أو اضغط على إلغاء الفلاتر لاستعادة القائمة.' : 'Try adjusting search terms or date range to view active cases.'}
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {isRtl ? 'إلغاء جميع الفلاتر' : 'Clear All Filters'}
                  </button>
                </div>
              ) : (
                filteredCases.map((c, idx) => {
                  const isAccessible = isCaseAccessibleForDoctor(idx, doctor.subscriptionPlan);

                  if (!isAccessible) {
                    {/* LOCKED LEAD CARD PREVIEW */}
                    return (
                      <div key={c.id} className="bg-amber-50/60 border-2 border-amber-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-2 text-right rtl:text-right ltr:text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                              {isRtl ? 'حالة مقيدة - تجاوز حد الباقة المجانية' : 'Locked Lead - Free Limit Exceeded'}
                            </span>
                            <span className="text-sm font-black text-slate-900">{c.id}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-700">
                            {isRtl ? 'التخصص: جراحة العظام والمفاصل | الفئة العمرية: 30-39 سنة | المدينة: عمان' : 'Specialty: Orthopedics | Age: 30-39 | City: Amman'}
                          </div>
                          <p className="text-xs text-amber-900 font-extrabold">
                            {isRtl 
                              ? 'لقد وصلت إلى الحد المتاح في الباقة المجانية (3 من 3). قم بالترقية لفتح حالات إضافية والتواصل معها داخل طبّك.'
                              : 'You have reached the Free plan case limit. Upgrade to open additional cases.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSimulatedUpgrade('professional')}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>{isRtl ? 'ترقية الاشتراك لفتح الحالة' : 'Upgrade Plan to Unlock'}</span>
                        </button>
                      </div>
                    );
                  }

                  {/* ACCESSIBLE CASE CARD */}
                  return (
                    <div key={c.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{c.id}</span>
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-150">
                            {getStatusLabel(c.status, isRtl)}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
                          <span>{isRtl ? `المريض: ${c.patient_name}` : `Patient: ${c.patient_name}`}</span>
                          <span>{isRtl ? `العمر: ${c.patient_age} | المدينة: ${c.patient_city}` : `Age: ${c.patient_age} | City: ${c.patient_city}`}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500">
                          {isRtl ? `الشكوى: ${c.patient_reason}` : `Reason: ${c.patient_reason}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                          href={`/cases/${c.id}`}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{isRtl ? 'فتح محادثة الحالة' : 'Open Case Chat'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: APPOINTMENTS TAB                                            */}
        {/* ================================================================== */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isRtl ? 'جدول المواعيد والزيارات اليومية' : 'Appointments & Visits Control'}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {isRtl ? 'تأكيد المواعيد، إعادة الجدولة، تسجيل الحضور أو الغياب' : 'Confirm, reschedule, mark attended, or mark no-show'}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {isRtl ? `إجمالي المواعيد: ${appointments.length}` : `Total: ${appointments.length}`}
              </span>
            </div>

            {/* Action Result Feedback Banner */}
            {appointmentActionResult && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
                appointmentActionResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2">
                  {appointmentActionResult.success ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-rose-600" />}
                  <span>{appointmentActionResult.message}</span>
                </div>
                <button onClick={() => setAppointmentActionResult(null)} className="font-black cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3 text-xs font-bold">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-black text-sm">{apt.date} • {apt.time_slot}</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${
                          apt.status === 'requested' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          apt.status === 'scheduled' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          apt.status === 'completed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          apt.status === 'no_show' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {apt.status === 'requested' ? (isRtl ? 'بانتظار التأكيد' : 'Awaiting Confirmation') :
                           apt.status === 'scheduled' ? (isRtl ? 'مؤكد / محدد' : 'Scheduled') :
                           apt.status === 'completed' ? (isRtl ? 'زيارة مكتملة' : 'Completed') :
                           apt.status === 'no_show' ? (isRtl ? 'لم يحضر المريض' : 'No Show') :
                           (isRtl ? 'ملغى' : 'Cancelled')}
                        </span>
                      </div>
                      <p className="text-slate-600 font-bold">{isRtl ? `رقم الموعد: ${apt.id} | رقم الحالة: ${apt.case_id}` : `Apt ID: ${apt.id} | Case ID: ${apt.case_id}`}</p>
                    </div>

                    {/* Reschedule inline toggle */}
                    <button
                      onClick={() => setRescheduleAptId(rescheduleAptId === apt.id ? null : apt.id)}
                      className="text-xs text-teal-700 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'إعادة جدولة الموعد' : 'Reschedule Slot'}</span>
                    </button>
                  </div>

                  {/* Inline Reschedule Control Panel */}
                  {rescheduleAptId === apt.id && (
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                      <h5 className="font-black text-slate-900 text-xs">{isRtl ? 'إعادة جدولة الموعد إلى خانة زمنية جديدة:' : 'Reschedule to new date and time:'}</h5>
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-0.5">{isRtl ? 'التاريخ الجديد:' : 'New Date:'}</label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold mb-0.5">{isRtl ? 'الوقت الجديد:' : 'New Time:'}</label>
                          <select
                            value={rescheduleTimeSlot}
                            onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                            className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold focus:outline-none"
                          >
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM (Occupied)</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-2 pt-4">
                          <button
                            onClick={() => handleRescheduleSubmit(apt.id)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-4 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                          >
                            {isRtl ? 'حفظ الموعد الجديد' : 'Save Rescheduled Slot'}
                          </button>
                          <button
                            onClick={() => setRescheduleAptId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
                          >
                            {isRtl ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleConfirmApt(apt.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'تأكيد الموعد' : 'Confirm'}</span>
                    </button>

                    <button
                      onClick={() => handleMarkAttended(apt.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'تسجيل حضور المريض' : 'Mark Attended'}</span>
                    </button>

                    <button
                      onClick={() => handleMarkNoShow(apt.id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'تسجيل عدم حضور (No-Show)' : 'Mark No-Show'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder={isRtl ? 'سبب الإلغاء...' : 'Cancellation reason...'}
                        value={cancelReasonInput}
                        onChange={(e) => setCancelReasonInput(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl py-1.5 px-2 text-xs focus:outline-none w-36"
                      />
                      <button
                        onClick={() => handleCancelApt(apt.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer text-xs"
                      >
                        {isRtl ? 'إلغاء الموعد' : 'Cancel'}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* ================================================================== */}
        {/* TAB 4: SCHEDULE & APPOINTMENTS MANAGEMENT TAB                       */}
        {/* ================================================================== */}
        {activeTab === 'schedule' && (
          <DoctorScheduleManager doctor={doctor} />
        )}

        {/* ================================================================== */}
        {/* TAB 5: ANALYTICS TAB                                               */}
        {/* ================================================================== */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'تحليلات الأداء ومعدل تحويل الحالات' : 'Performance Analytics'}</h3>
              <p className="text-xs text-slate-500 font-bold mt-1 leading-relaxed">
                {isRtl 
                  ? 'هذه أرقام تجريبية لأغراض العرض، وليست نتائج تشغيلية حقيقية.'
                  : 'These are mock numbers for demo purposes, not real operational metrics.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-150 space-y-1">
                <span className="text-xs font-black text-teal-800 block">{isRtl ? 'معدل الاستجابة الأولية' : 'Average Response Time'}</span>
                <div className="text-2xl font-black text-slate-900">42 {isRtl ? 'دقيقة' : 'mins'}</div>
                <span className="text-[10px] text-teal-700 font-bold">{isRtl ? 'أسرع بـ 15% من معدل التخصص' : '15% faster than specialty avg'}</span>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-150 space-y-1">
                <span className="text-xs font-black text-amber-800 block">{isRtl ? 'نسبة تحويل الطلبات إلى مواعيد' : 'Lead to Appointment Conversion'}</span>
                <div className="text-2xl font-black text-slate-900">28.5%</div>
                <span className="text-[10px] text-amber-700 font-bold">{isRtl ? 'بيانات محاكاة تجريبية' : 'Demo funnel metric'}</span>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-150 space-y-1">
                <span className="text-xs font-black text-purple-800 block">{isRtl ? 'معدل اكتمال الزيارات' : 'Visit Attendance Rate'}</span>
                <div className="text-2xl font-black text-slate-900">92.0%</div>
                <span className="text-[10px] text-purple-700 font-bold">{isRtl ? 'معدل الحضور بالموعد' : 'Attendance metric'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: OFFERS & PRICING TAB                                        */}
        {/* ================================================================== */}
        {activeTab === 'offers' && (
          <DoctorOfferControls doctor={doctor} />
        )}

        {/* ================================================================== */}
        {/* TAB 6: PROFILE COMPLETENESS TAB                                    */}
        {/* ================================================================== */}
        {activeTab === 'profile' && (() => {
          const evaluatedFields = [
            { nameAr: 'السيرة الذاتية الطبية', nameEn: 'Medical Biography', ok: Boolean(doctor.bio_ar && doctor.bio_en) },
            { nameAr: 'المسمى الوظيفي والشهادات', nameEn: 'Job Title & Credentials', ok: Boolean(doctor.title_ar && doctor.title_en) },
            { nameAr: 'سنوات الخبرة الطبية', nameEn: 'Years of Experience', ok: Boolean(doctor.experience_years > 0) },
            { nameAr: 'رسوم الكشفية', nameEn: 'Consultation Fee', ok: Boolean(doctor.consultation_fee_jod > 0) },
            { nameAr: 'عنوان العيادة والموقع', nameEn: 'Clinic Address', ok: Boolean(doctor.address_ar && doctor.address_en) },
            { nameAr: 'المحافظة والمدينة', nameEn: 'City & District', ok: Boolean(doctor.city_id) },
            { nameAr: 'التخصص الطبي الرئيسية', nameEn: 'Medical Specialty', ok: Boolean(doctor.specialty_id) },
            { nameAr: 'الارتباط بالمستشفى', nameEn: 'Hospital Affiliation', ok: Boolean(doctor.hospital_id) },
            { nameAr: 'اللغات المتقنة', nameEn: 'Spoken Languages', ok: Boolean(doctor.languages && doctor.languages.length > 0) },
            { nameAr: 'أقرب موعد متاح', nameEn: 'First Available Slot', ok: Boolean(doctor.first_available_date) }
          ];

          const totalFields = evaluatedFields.length;
          const completedCount = evaluatedFields.filter(f => f.ok).length;
          const percentage = Math.round((completedCount / totalFields) * 100);

          return (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">{isRtl ? 'اكتمال الملف الطبي للعيادة' : 'Profile Completeness'}</h3>
                  <span className="text-xs font-bold text-slate-400">
                    {isRtl ? `${completedCount} من ${totalFields} حقول مكتملة` : `${completedCount} of ${totalFields} fields completed`}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-black text-teal-700">{percentage}%</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-700">
                {evaluatedFields.map((field, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      field.ok ? 'bg-emerald-50/60 border-emerald-150 text-emerald-950' : 'bg-amber-50/60 border-amber-150 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {field.ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <HelpCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      )}
                      <span>{isRtl ? field.nameAr : field.nameEn}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      field.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {field.ok ? (isRtl ? 'مكتمل' : 'Completed') : (isRtl ? 'بحاجة لإكمال' : 'Needs Action')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ================================================================== */}
        {/* TAB 7: SUBSCRIPTION & UPGRADE TAB                                  */}
        {/* ================================================================== */}
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">{isRtl ? 'باقة الاشتراك والتحكم في المزايا' : 'Subscription & Plan Features'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-bold">{isRtl ? 'الباقة الحالية:' : 'Current Plan:'}</span>
                <span className="text-sm font-black text-teal-600">{entitlements.nameAr}</span>
              </div>
            </div>

            {/* Plans Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Free Plan Card */}
              <div className={`p-6 rounded-3xl border text-right rtl:text-right ltr:text-left space-y-4 ${
                doctor.subscriptionPlan === 'free' ? 'border-2 border-teal-600 bg-teal-50/20' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div>
                  <h4 className="text-base font-black text-slate-900">{isRtl ? 'الباقة المجانية (Free)' : 'Free Plan'}</h4>
                  <div className="text-2xl font-black text-slate-900 mt-1">0 JOD <span className="text-xs font-bold text-slate-400">/ شهرياً</span></div>
                </div>
                <ul className="space-y-2 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? '3 حالات مجانية شهرياً' : '3 free cases monthly'}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'محادثة مشفرة تفاعلية' : 'Encrypted messaging'}</li>
                  <li className="flex items-center gap-1.5"><X className="h-4 w-4 text-rose-400" /> {isRtl ? 'حجب المرفقات والمستندات' : 'Attachments disabled'}</li>
                </ul>
              </div>

              {/* Professional Plan Card */}
              <div className={`p-6 rounded-3xl border text-right rtl:text-right ltr:text-left space-y-4 ${
                doctor.subscriptionPlan === 'professional' ? 'border-2 border-teal-600 bg-teal-50/20' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div>
                  <h4 className="text-base font-black text-slate-900">{isRtl ? 'الباقة المهنية (Professional)' : 'Professional Plan'}</h4>
                  <div className="text-2xl font-black text-slate-900 mt-1">29 JOD <span className="text-xs font-bold text-slate-400">/ شهرياً</span></div>
                </div>
                <ul className="space-y-2 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'حالات غير محدودة' : 'Unlimited cases'}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'فتح الملفات والمرفقات' : 'Attachments enabled'}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'تحليلات تحويل المواعيد' : 'Analytics & conversion'}</li>
                </ul>
                <button
                  onClick={() => handleSimulatedUpgrade('professional')}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-2xl shadow-xs cursor-pointer"
                >
                  {isRtl ? 'محاكاة ترقية الباقة المهنية' : 'Simulate Professional Upgrade'}
                </button>
              </div>

              {/* VIP Plan Card */}
              <div className={`p-6 rounded-3xl border text-right rtl:text-right ltr:text-left space-y-4 ${
                doctor.subscriptionPlan === 'vip' ? 'border-2 border-teal-600 bg-teal-50/20' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div>
                  <h4 className="text-base font-black text-slate-900">{isRtl ? 'الباقة المتميزة (VIP)' : 'VIP Plan'}</h4>
                  <div className="text-2xl font-black text-slate-900 mt-1">59 JOD <span className="text-xs font-bold text-slate-400">/ شهرياً</span></div>
                </div>
                <ul className="space-y-2 text-xs font-bold text-slate-700">
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'جميع مزايا الباقة المهنية' : 'All Professional tools'}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'شارة إعلان ترويجية مميزة' : 'Boosted sponsored badge'}</li>
                  <li className="flex items-center gap-1.5"><Check className="h-4 w-4 text-teal-600" /> {isRtl ? 'دعم فني مباشر على مدار الساعة' : '24/7 Priority support'}</li>
                </ul>
                <button
                  onClick={() => handleSimulatedUpgrade('vip')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl shadow-xs cursor-pointer"
                >
                  {isRtl ? 'محاكاة ترقية باقة VIP' : 'Simulate VIP Upgrade'}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">جاري تحميل لوحة التحكم...</div>}>
      <DoctorDashboardContent />
    </Suspense>
  );
}
