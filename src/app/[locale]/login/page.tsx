'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { setDemoPatientSession } from '@/lib/demo/demo-patient-session';

import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';

export default function LoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const router = useRouter();
  const isAr = locale === 'ar';

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'hospital' | 'admin'>('patient');
  const [notification, setNotification] = useState<string | null>(null);

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'hospital' | 'admin') => {
    setSelectedRole(role);
    if (role === 'patient') {
      setDemoPatientSession('pat-1', 'محمد أحمد');
    }
    setNotification(
      isAr 
        ? `تم محاكاة تسجيل الدخول بدور: [${role === 'patient' ? 'مريض' : role === 'doctor' ? 'طبيب' : role === 'hospital' ? 'مستشفى' : 'مدير النظام'}]`
        : `Simulated login as: [${role}]`
    );
  };

  const handleNavigate = () => {
    if (selectedRole === 'doctor') {
      router.push(`/${locale}/dashboard/doctor?demo=1`);
    } else if (selectedRole === 'hospital') {
      router.push(`/${locale}/dashboard/hospital?demo=1`);
    } else if (selectedRole === 'admin') {
      router.push(`/${locale}/dashboard/admin?demo=1`);
    } else {
      router.push(`/${locale}/cases/CASE-2026-000154?demo=1`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
            ط
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAr ? 'تسجيل الدخول التجريبي' : 'Demo Session Login'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isAr 
              ? 'اختر نوع الحساب لمعاينة لوحات التحكم والخدمات التجريبية'
              : 'Select account role to preview interactive dashboards & services'}
          </p>
        </div>

        <DemoSafetyNotice locale={locale} className="mb-6" />

        {notification && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-medium">
            {notification}
          </div>
        )}

        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => handleRoleSelect('patient')}
            className={`w-full p-4 rounded-xl border text-right flex items-center justify-between transition-all ${
              selectedRole === 'patient'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">👤</span>
              <div>
                <div className="text-sm">{isAr ? 'مريض (محمد أحمد)' : 'Patient (Mohammad)'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{isAr ? 'متابعة الطلبات وتأكيد الحجوزات' : 'View cases & booking requests'}</div>
              </div>
            </div>
            {selectedRole === 'patient' && <span className="text-blue-600">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('doctor')}
            className={`w-full p-4 rounded-xl border text-right flex items-center justify-between transition-all ${
              selectedRole === 'doctor'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">🩺</span>
              <div>
                <div className="text-sm">{isAr ? 'طبيب (د. فراس الخطيب)' : 'Doctor (Dr. Firas)'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{isAr ? 'إدارة الاستشارات والحجوزات والباقة' : 'Manage consultations & leads'}</div>
              </div>
            </div>
            {selectedRole === 'doctor' && <span className="text-blue-600">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('hospital')}
            className={`w-full p-4 rounded-xl border text-right flex items-center justify-between transition-all ${
              selectedRole === 'hospital'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">🏥</span>
              <div>
                <div className="text-sm">{isAr ? 'مستشفى (مركز الحسين الطبي)' : 'Hospital (KHMC)'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{isAr ? 'متابعة طلبات المواعيد التشغيلية' : 'Manage hospital appointments'}</div>
              </div>
            </div>
            {selectedRole === 'hospital' && <span className="text-blue-600">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`w-full p-4 rounded-xl border text-right flex items-center justify-between transition-all ${
              selectedRole === 'admin'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">⚙️</span>
              <div>
                <div className="text-sm">{isAr ? 'مدير المنصة (الإدارة)' : 'Platform Admin'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{isAr ? 'إدارة التوثيق والحملات والرصد التشغيلي' : 'Manage verifications & campaigns'}</div>
              </div>
            </div>
            {selectedRole === 'admin' && <span className="text-blue-600">✓</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNavigate}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-center block"
        >
          {isAr ? 'الدخول إلى لوحة التحكم المختارة' : 'Enter Selected Dashboard'}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <Link
            href={`/${locale}/search`}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            {isAr ? '← العودة إلى البحث عن الأطباء' : '← Back to Doctor Search'}
          </Link>
        </div>
      </div>
    </div>
  );
}
