'use client';

import { useState } from 'react';
import { executeDemoEnvironmentReset } from '@/lib/demo/admin-demo-reset';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AdminDemoSettingsProps {
  isDemoMode: boolean;
  isRtl: boolean;
  onResetComplete: () => void;
}

export default function AdminDemoSettings({ isDemoMode, isRtl, onResetComplete }: AdminDemoSettingsProps) {
  const [confirmModal, setConfirmModal] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState(false);

  if (!isDemoMode) {
    return null;
  }

  const handleConfirmReset = () => {
    const success = executeDemoEnvironmentReset(true);
    if (success) {
      setConfirmModal(false);
      setResetDoneNotice(true);
      onResetComplete();
      setTimeout(() => setResetDoneNotice(false), 4000);
    }
  };

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {isRtl ? 'إعدادات وإعادة ضبط العرض التجريبي (Demo=1 Only)' : 'Demo Environment Reset Settings (Demo=1 Only)'}
          </h3>
          <p className="text-xs text-slate-600 font-semibold">
            {isRtl ? 'تتيح إعادة ضبط المحاكاة والتراخيص والحملات والسجلات لقيم الاختبار الابتدائية.' : 'Restore verification queue, campaigns, operational status, and logs to baseline QA fixtures.'}
          </p>
        </div>
      </div>

      {resetDoneNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{isRtl ? 'تمت إعادة ضبط جميع بيانات وقواعد إدارة النظام التجريبية بنجاح.' : 'Admin demo environment reset successfully.'}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setConfirmModal(true)}
        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>{isRtl ? 'إعادة ضبط بيانات العرض التجريبي' : 'Reset demo data'}</span>
      </button>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 text-right rtl:text-right ltr:text-left">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <h4 className="font-black text-slate-900 text-lg">
                {isRtl ? 'تأكيد إعادة ضبط البيانات' : 'Confirm Demo Environment Reset'}
              </h4>
            </div>

            <p className="text-xs font-semibold text-slate-600 leading-relaxed">
              {isRtl 
                ? 'هل أنت تأكد من رغبتك في إعادة ضبط جميع بيانات مزودي الخدمات، طلبات التوثيق، والحملات وسجلات التدقيق إلى الحالة الابتدائية لمرحلة الاختبار؟'
                : 'Are you sure you want to restore all provider operational statuses, verification queues, campaigns, and audit logs to QA baseline fixtures?'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-extrabold cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold cursor-pointer"
              >
                {isRtl ? 'تأكيد إعادة الضبط' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
