'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { getDemoPatientSession } from '@/lib/demo/demo-patient-session';
import { 
  getCaseById, getPatientOwnedCase, getMessagesForCase, sendMessage, 
  getGatedCaseDetails, updateCaseStatus, 
  detectExternalContactPattern 
} from '@/lib/repositories/cases';
import { Case, Message, CaseStatus, ProviderCaseAccessResult, ProviderCaseSummary } from '@/types';
import { 
  Send, FileText, Paperclip, Mic, ArrowLeft, ShieldAlert, Sparkles, 
  User, Calendar, Phone, Mail, FolderOpen, Play, Square, Globe, 
  Loader2, Clock, AlertTriangle, ShieldCheck, Lock, ArrowUpRight 
} from 'lucide-react';
import DemoDataBanner from '@/components/shared/DemoDataBanner';
import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';

import { 
  ALL_CASE_STATUSES, getStatusLabel, getAllowedNextStatuses 
} from '@/lib/cases/case-status';

export default function CaseChatPage() {
  const params = useParams();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const id = params.id as string;
  
  // Active role simulator: patient, free_doctor, premium_doctor
  const [demoRole, setDemoRole] = useState<'patient' | 'free_doctor' | 'premium_doctor'>('patient');

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<ProviderCaseSummary | Case | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contactWarning, setContactWarning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Access control result
  const [accessResult, setAccessResult] = useState<ProviderCaseAccessResult | null>(null);

  // Audio / uploader simulators
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      if (demoRole === 'patient') {
        const session = getDemoPatientSession();
        const ownRes = await getPatientOwnedCase(id, session.patientId);
        if (ownRes.success && ownRes.caseData && isMounted) {
          setCaseData(ownRes.caseData);
          setAccessResult({
            access: 'granted',
            gatedDetails: { caseData: ownRes.caseData, isLocked: false }
          });
          const msgs = await getMessagesForCase(id);
          setMessages(msgs);
        } else if (isMounted) {
          setCaseData(null);
          setAccessResult(null);
        }
      } else {
        const c = await getCaseById(id);
        if (c && isMounted) {
          setCaseData(c);
          const docIdToUse = demoRole === 'free_doctor' ? 'doc-1' : 'doc-10';
          const res = await getGatedCaseDetails(id, docIdToUse);
          if (res.success) {
            setAccessResult(res.accessResult);
            if (res.accessResult.access === 'granted') {
              const msgs = await getMessagesForCase(id, docIdToUse);
              setMessages(msgs);
            } else {
              setMessages([]);
            }
          } else {
            setAccessResult(null);
            setMessages([]);
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    loadData();
    return () => { isMounted = false; };
  }, [id, demoRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStatusChange = async (nextStatus: CaseStatus) => {
    if (!caseData) return;
    setUpdatingStatus(true);
    const actorRole = demoRole === 'patient' ? 'patient' : 'doctor';
    const docIdToUse = demoRole === 'free_doctor' ? 'doc-1' : 'doc-10';

    try {
      await updateCaseStatus(caseData.id, nextStatus, actorRole, docIdToUse, `Status updated to ${nextStatus}`);
      const updated = await getCaseById(id);
      if (updated) {
        setCaseData(updated);
        const res = await getGatedCaseDetails(id, docIdToUse);
        if (res.success) {
          setAccessResult(res.accessResult);
          if (res.accessResult.access === 'granted') {
            const msgs = await getMessagesForCase(id, docIdToUse);
            setMessages(msgs);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Access denied';
      alert(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !caseData) return;

    if (detectExternalContactPattern(newMessage)) {
      setContactWarning(true);
      return;
    }

    setContactWarning(false);
    const senderRole = demoRole === 'patient' ? 'patient' : 'doctor';
    const docIdToUse = demoRole === 'free_doctor' ? 'doc-1' : 'doc-10';

    try {
      const msg = await sendMessage(caseData.id, senderRole, newMessage.trim(), 'text', undefined, docIdToUse);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');

      if (demoRole === 'patient') {
        setTimeout(async () => {
          const reply = await sendMessage(
            caseData.id,
            'doctor',
            isRtl 
              ? 'مرحباً، تم استلام رسالتك وتوثيقها داخل نظام الحالة. سأقوم بمراجعة التقارير المرفقة والرد عليك.'
              : 'Hello, your message is registered inside Tibbak. I will review your logs and reply.',
            'text'
          );
          setMessages(prev => [...prev, reply]);
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Access denied';
      alert(msg);
    }
  };

  const handleSendVoice = async () => {
    if (!caseData) return;
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      const senderRole = demoRole === 'patient' ? 'patient' : 'doctor';
      const docIdToUse = demoRole === 'free_doctor' ? 'doc-1' : 'doc-10';
      try {
        const msg = await sendMessage(
          caseData.id,
          senderRole,
          isRtl ? `تسجيل صوتي استشاري (${recordSeconds} ثانية)` : `Voice message (${recordSeconds}s)`,
          'voice',
          'voice_recording.mp3',
          docIdToUse
        );
        setMessages(prev => [...prev, msg]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Access denied';
        alert(msg);
      }
    }
  };

  const handleSimulatedFileUpload = () => {
    if (!caseData) return;
    setUploadingFile(true);
    const docIdToUse = demoRole === 'free_doctor' ? 'doc-1' : 'doc-10';
    setTimeout(async () => {
      const senderRole = demoRole === 'patient' ? 'patient' : 'doctor';
      try {
        const msg = await sendMessage(
          caseData.id,
          senderRole,
          isRtl ? 'تقرير الفحص المخبري المرفق.pdf' : 'Lab_Report_Attached.pdf',
          'pdf',
          'uploaded_report.pdf',
          docIdToUse
        );
        setMessages(prev => [...prev, msg]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Access denied';
        alert(msg);
      } finally {
        setUploadingFile(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3 font-cairo">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500">{isRtl ? 'جاري تحميل غرفة المحادثة والمتابعة المشفرة...' : 'Loading secure case room...'}</p>
      </div>
    );
  }

  if (!caseData || !accessResult) {
    return (
      <div className="py-16 text-center font-cairo">
        <ShieldAlert className="h-14 w-14 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-800">{isRtl ? 'الحالة غير موجودة' : 'Case not found'}</h3>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LOCKED CASE SAFE PREVIEW VIEW (When Free Doctor exceeds lead limit)
  // --------------------------------------------------------------------------
  if (accessResult.access === 'locked') {
    const { preview } = accessResult;

    return (
      <div className="flex-1 flex flex-col bg-slate-50 font-cairo text-right rtl:text-right ltr:text-left">
        
        {/* Role Switcher */}
        <div className="bg-slate-900 px-6 py-2.5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold shadow-md">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>{isRtl ? 'محاكاة أدوار العرض (SaaS Sandbox - Lead Access Guard):' : 'SaaS Role Simulator:'}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDemoRole('patient')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-extrabold ${
                demoRole === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isRtl ? 'واجهة المريض' : 'Patient View'}
            </button>
            <button
              onClick={() => setDemoRole('free_doctor')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-extrabold ${
                demoRole === 'free_doctor' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isRtl ? 'طبيب مجاني (مغلق)' : 'Free Doctor (Locked)'}
            </button>
            <button
              onClick={() => setDemoRole('premium_doctor')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-extrabold ${
                demoRole === 'premium_doctor' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isRtl ? 'طبيب مميز (مفتوح)' : 'Premium Doctor (Unlocked)'}
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl w-full px-4 py-12 space-y-6">
          
          <DemoDataBanner />

          {/* Locked Lead Safe Preview Card */}
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 shadow-lg text-center space-y-6">
            
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black tracking-widest text-amber-800 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {isRtl ? 'حالة مقيدة - تجاوز حد الباقة المجانية' : 'Gated Lead - Free Limit Exceeded'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {preview.caseId}
              </h2>
            </div>

            {/* Localized Upgrade Copy */}
            <div className="p-4 bg-amber-50 border border-amber-150 rounded-2xl max-w-lg mx-auto text-xs font-extrabold text-amber-900 leading-relaxed">
              <p>
                {isRtl 
                  ? 'لقد وصلت إلى الحد المتاح في الباقة المجانية. قم بالترقية لفتح حالات إضافية والتواصل معها داخل طبّك.'
                  : 'You have reached the Free plan case limit. Upgrade to open additional cases and communicate with them inside Tibbak.'}
              </p>
              <p className="text-[10px] opacity-80 mt-1 font-medium">
                {isRtl 
                  ? 'ملاحظة: الترقية تتيح التواصل التفاعلي المباشر داخل المنصة فقط، ولا تمنح أرقام هواتف خارجية.'
                  : 'Note: Upgrading unlocks interactive communication inside the platform only.'}
              </p>
            </div>

            {/* Safe Fields Only Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-md mx-auto grid grid-cols-2 gap-3 text-xs font-bold text-slate-700 text-right rtl:text-right ltr:text-left">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black">{isRtl ? 'التخصص المطلوب:' : 'Specialty:'}</span>
                <span>{isRtl ? preview.specialtyNameAr : preview.specialtyNameEn}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black">{isRtl ? 'المدينة:' : 'City:'}</span>
                <span>{isRtl ? preview.cityNameAr : preview.cityNameEn}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black">{isRtl ? 'الفئة العمرية:' : 'Age Range:'}</span>
                <span>{preview.ageRange} سنة</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-black">{isRtl ? 'الجنس:' : 'Gender:'}</span>
                <span>{preview.gender === 'male' ? (isRtl ? 'ذكر' : 'Male') : (isRtl ? 'أنثى' : 'Female')}</span>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="pt-2">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 px-8 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                <span>{isRtl ? 'ترقية الاشتراك إلى الباقة المتميزة' : 'Upgrade to Premium Plan'}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // GRANTED CASE ROOM VIEW (When Access is Allowed)
  // --------------------------------------------------------------------------
  const { caseData: activeCase } = accessResult.gatedDetails;
  const allStatusesList = Object.values(ALL_CASE_STATUSES);
  const currentStatusIdx = allStatusesList.findIndex(s => s.key === activeCase.status);
  const allowedNextTransitions = getAllowedNextStatuses(activeCase.status);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-cairo text-right rtl:text-right ltr:text-left">
      
      {/* Demonstration Role Switcher Banner */}
      <div className="bg-slate-900 px-6 py-2.5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold shadow-md relative z-30">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>{isRtl ? 'محاكاة أدوار العرض للمستثمرين (SaaS Sandbox):' : 'SaaS Role Simulator:'}</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setDemoRole('patient')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-extrabold ${
              demoRole === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isRtl ? 'واجهة المريض' : 'Patient View'}
          </button>
          <button
            onClick={() => setDemoRole('free_doctor')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-extrabold ${
              demoRole === 'free_doctor' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isRtl ? 'طبيب باقة مجانية' : 'Free Doctor'}
          </button>
          <button
            onClick={() => setDemoRole('premium_doctor')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-extrabold ${
              demoRole === 'premium_doctor' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isRtl ? 'طبيب باقة مميزة' : 'Premium Doctor'}
          </button>
        </div>
      </div>

      <DemoSafetyNotice locale={locale} className="mx-6 mt-3" />

      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-teal-600 uppercase tracking-wider">{isRtl ? 'رقم الحالة الطبية:' : 'Case ID:'}</span>
                <span className="text-xl font-black text-slate-900">{activeCase.id}</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {isRtl ? `الشكوى: ${activeCase.patient_reason}` : `Reason: ${activeCase.patient_reason}`}
              </p>
            </div>

            {/* Provider Actions */}
            {demoRole !== 'patient' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">{isRtl ? 'الانتقال المسموح:' : 'Allowed Transition:'}</span>
                {allowedNextTransitions.length === 0 ? (
                  <span className="text-[10px] font-extrabold text-slate-400 italic">{isRtl ? 'مرحلة نهائية مغلقة' : 'Terminal state'}</span>
                ) : (
                  allowedNextTransitions.map((nextSt) => (
                    <button
                      key={nextSt}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(nextSt)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 cursor-pointer border border-teal-150"
                    >
                      {getStatusLabel(nextSt, isRtl)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Stepper Pipeline */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {isRtl ? 'خط سير الحالة (11 مراحل - Jira Workflow Stepper):' : 'Complete 11-Stage Case Workflow Pipeline:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-1.5">
              {allStatusesList.map((stepItem, idx) => {
                const isActive = stepItem.key === activeCase.status;
                const isPassed = currentStatusIdx >= 0 && idx <= currentStatusIdx;

                return (
                  <div
                    key={stepItem.key}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isActive ? 'bg-teal-600 text-white border-teal-600 font-black shadow-xs scale-105' :
                      isPassed ? 'bg-teal-50 text-teal-800 border-teal-150 font-bold' : 'bg-slate-50 text-slate-400 border-slate-100 font-medium opacity-60'
                    }`}
                  >
                    <div className="text-[9px] truncate">{idx + 1}. {isRtl ? stepItem.labelAr : stepItem.labelEn}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Left Panel */}
          <div className="w-full lg:w-80 bg-white rounded-3xl border border-slate-100 p-5 flex flex-col justify-between shadow-xs space-y-6">
            <div className="space-y-5">
              
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <Link href="/search" className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                  <span>{isRtl ? 'الرجوع للبحث' : 'Back'}</span>
                </Link>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
                  {getStatusLabel(activeCase.status, isRtl)}
                </span>
              </div>

              {/* Patient Demographics */}
              <div className="space-y-3 text-xs font-bold text-slate-700">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{isRtl ? 'تفاصيل المريض (مشفرة):' : 'Patient Demographics:'}</span>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{isRtl ? 'الاسم:' : 'Name:'} <strong className="text-slate-900">{activeCase.patient_name}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{isRtl ? 'الهاتف (مخفي):' : 'Phone (masked):'} <strong className="text-teal-700 font-mono">07*******12</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{isRtl ? 'البريد (مخفي):' : 'Email (masked):'} <strong className="text-slate-800 font-mono">••••••••@tibbak-patient.com</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{isRtl ? `العمر: ${activeCase.patient_age} سنة` : `Age: ${activeCase.patient_age}`}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span>{activeCase.patient_country}، {activeCase.patient_city}</span>
                </div>
              </div>

              {/* Attachments */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5 text-teal-600" />
                  <span>{isRtl ? 'المرفقات الطبية' : 'Attached Records'}</span>
                </span>
                
                {!('patient_files' in activeCase) || !activeCase.patient_files || activeCase.patient_files.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic">{isRtl ? 'لا يوجد ملفات مرفقة' : 'No attachments'}</p>
                ) : (
                  <div className="space-y-1">
                    {activeCase.patient_files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-700">
                        <FileText className="h-3.5 w-3.5 text-rose-500" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline Log */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-teal-600" />
                  <span>{isRtl ? 'سجل الحركات والتحديثات (Timeline):' : 'Status History:'}</span>
                </span>

                <div className="space-y-2">
                  {(activeCase.status_history || []).map((hist) => (
                    <div key={hist.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] font-semibold text-slate-600 space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{getStatusLabel(hist.newStatus, isRtl)}</span>
                        <span>{hist.actorRole}</span>
                      </div>
                      <span className="block opacity-75">{new Date(hist.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Chatroom */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-100 flex flex-col justify-between shadow-xs overflow-hidden min-h-[500px]">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-sm">
                  {demoRole === 'patient' ? (isRtl ? 'طبيب' : 'Dr') : (isRtl ? 'مريض' : 'Pt')}
                </div>
                <div>
                  <span className="block text-sm font-black text-slate-900">
                    {demoRole === 'patient' ? (isRtl ? 'مستشار طبّك المعالج (د. فراس الخطيب)' : 'Dr. Firas Khatib') : activeCase.patient_name}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isRtl ? 'محادثة مغلقة ومحمية داخل طبّك' : 'In-Platform Encrypted Chat'}</span>
                  </span>
                </div>
              </div>

              <DemoDataBanner compact={true} />
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[400px]">
              {messages.map((msg) => {
                const isMe = (demoRole === 'patient' && msg.sender_role === 'patient') ||
                             (demoRole !== 'patient' && msg.sender_role === 'doctor');
                const isSystem = msg.sender_role === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-1.5 text-[10px] font-extrabold text-slate-600">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      isMe ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {msg.sender_role === 'patient' ? (isRtl ? 'م' : 'P') : (isRtl ? 'ط' : 'D')}
                    </div>
                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs font-bold leading-relaxed ${
                      isMe 
                        ? 'bg-teal-600 text-white rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none'
                    }`}>
                      {msg.type === 'text' && <p className="font-semibold">{msg.text}</p>}
                      
                      {msg.type === 'voice' && (
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          <span>{msg.text}</span>
                        </div>
                      )}

                      {msg.type === 'pdf' && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-rose-500" />
                          <span>{msg.text}</span>
                        </div>
                      )}
                      
                      <span className="block text-[8px] opacity-70 mt-1 text-left rtl:text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
              
              {contactWarning && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-2xl text-xs font-extrabold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>{isRtl ? 'للحفاظ على خصوصيتك، يجب أن يبقى التواصل داخل طبّك ولا يمنح مشاركة أرقام الهواتف الخارجية.' : 'For your privacy, communication must remain inside Tibbak.'}</span>
                </div>
              )}

              {isRecording && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-xl flex items-center justify-between text-xs font-extrabold border border-red-150">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-red-600 fill-red-600 animate-pulse" />
                    <span>{isRtl ? 'جاري تسجيل رسالة صوتية...' : 'Recording voice message...'}</span>
                  </div>
                  <span>{recordSeconds}s</span>
                </div>
              )}

              <form onSubmit={handleSendText} className="flex gap-2 items-center">
                
                <button
                  type="button"
                  disabled={uploadingFile}
                  onClick={handleSimulatedFileUpload}
                  className="bg-white border border-slate-200 hover:border-teal-500 p-2.5 rounded-xl transition-all cursor-pointer text-slate-600 flex-shrink-0"
                >
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </button>

                <input
                  type="text"
                  disabled={isRecording}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (contactWarning) setContactWarning(false);
                  }}
                  placeholder={
                    isRecording 
                      ? (isRtl ? 'التسجيل الصوتي نشط...' : 'Voice recording active...') 
                      : (isRtl ? 'اكتب رسالة مشفرة داخل المنصة...' : 'Type a secure message...')
                  }
                  className="flex-1 bg-white border border-slate-200 text-slate-800 text-xs font-extrabold rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />

                <button
                  type="button"
                  onClick={handleSendVoice}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-white border border-slate-200 hover:border-teal-500 text-slate-600'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  disabled={isRecording}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all cursor-pointer flex-shrink-0 shadow-xs"
                >
                  <Send className="h-4 w-4" />
                </button>

              </form>

              <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold px-1">
                <span>{isRtl ? 'الأمان: تشفير المحادثات وحجب وسائط الاتصال المباشرة' : 'Privacy: Direct contacts strictly masked'}</span>
                <span>{isRtl ? 'الوساطة الحصرية: منصة طبّك' : 'Exclusive Channel: Tibbak Platform'}</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
