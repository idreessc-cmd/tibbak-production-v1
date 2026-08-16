'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Doctor } from '@/types';
import { 
  getDoctorSlots, 
  createDoctorSlot, 
  updateDoctorSlotStatus, 
  DemoSlot, 
  getJordanTodayDateString 
} from '@/lib/consultations';
import { 
  Calendar, Plus, CheckCircle2, XCircle, AlertCircle, User, CheckCircle
} from 'lucide-react';

interface DoctorScheduleManagerProps {
  doctor: Doctor;
}

export default function DoctorScheduleManager({ doctor }: DoctorScheduleManagerProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [slots, setSlots] = useState<DemoSlot[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'booked' | 'completed' | 'cancelled'>('all');

  // Form states for creating new slot
  const [newDate, setNewDate] = useState<string>(getJordanTodayDateString());
  const [newTime, setNewTime] = useState<string>('10:00 AM');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);

  const loadSlots = () => {
    if (!doctor || !doctor.id) return;
    const list = getDoctorSlots(doctor.id);
    setSlots(list);
  };

  useEffect(() => {
    if (!doctor || !doctor.id) return;
    loadSlots();

    const handleSlotUpdate = () => {
      loadSlots();
    };

    window.addEventListener('tibbak_slots_updated', handleSlotUpdate);
    return () => window.removeEventListener('tibbak_slots_updated', handleSlotUpdate);
  }, [doctor?.id]);

  if (!doctor || !doctor.id) {
    return null;
  }

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const res = createDoctorSlot(doctor.id, newDate, newTime);
    if (!res.success) {
      setCreateError(isAr ? res.errorAr! : res.errorEn!);
      return;
    }

    setCreateSuccess(true);
    setTimeout(() => setCreateSuccess(false), 3000);
    loadSlots();
  };

  const handleStatusChange = (slotId: string, newStatus: 'completed' | 'cancelled') => {
    updateDoctorSlotStatus(doctor.id, slotId, newStatus);
    loadSlots();
  };

  // Grouping slots by status for count metrics
  const availableCount = slots.filter(s => s.status === 'available').length;
  const bookedCount = slots.filter(s => s.status === 'booked').length;
  const completedCount = slots.filter(s => s.status === 'completed').length;
  const cancelledCount = slots.filter(s => s.status === 'cancelled').length;

  const filteredSlots = slots.filter(s => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            <span>{isAr ? 'إدارة المواعيد والجدول الزمني للعيادة' : 'Appointments & Schedule Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isAr ? 'إضافة مواعيد متاح حجزها ومتابعة سجل الحجوزات المكتملة والملغاة' : 'Create available slots and manage booked/completed/cancelled appointments'}
          </p>
        </div>
      </div>

      {/* 1. Create New Slot Form */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-teal-600" />
          <span>{isAr ? 'إضافة موعد متاح جديد' : 'Create New Available Slot'}</span>
        </h3>

        {createError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-2.5 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        {createSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-2.5 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{isAr ? 'تم إضافة الموعد المتاح بنجاح!' : 'New slot added successfully!'}</span>
          </div>
        )}

        <form onSubmit={handleCreateSlot} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              {isAr ? 'التاريخ' : 'Date'}
            </label>
            <input
              type="date"
              required
              min={getJordanTodayDateString()}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              {isAr ? 'الوقت' : 'Time'}
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-600"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="09:30 AM">09:30 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="10:30 AM">10:30 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="01:00 PM">01:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2 px-4 rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{isAr ? 'إضافة الموعد' : 'Add Slot'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Group Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        {[
          { key: 'all', labelAr: 'الكل', labelEn: 'All', count: slots.length },
          { key: 'available', labelAr: 'متاح', labelEn: 'Available', count: availableCount },
          { key: 'booked', labelAr: 'محجوز', labelEn: 'Booked', count: bookedCount },
          { key: 'completed', labelAr: 'مكتمل', labelEn: 'Completed', count: completedCount },
          { key: 'cancelled', labelAr: 'ملغى', labelEn: 'Cancelled', count: cancelledCount },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key as typeof activeFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === tab.key
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
              activeFilter === tab.key ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Slots List */}
      {filteredSlots.length === 0 ? (
        <div className="py-8 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl border border-slate-100">
          <p>{isAr ? 'لا توجد مواعيد طائفة في هذا التبويب' : 'No slots found in this filter'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSlots.map((slot) => {
            return (
              <div 
                key={slot.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{slot.date}</span>
                    <span className="text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      {slot.time}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      slot.status === 'available' ? 'bg-emerald-100 text-emerald-900' :
                      slot.status === 'booked' ? 'bg-blue-100 text-blue-900' :
                      slot.status === 'completed' ? 'bg-purple-100 text-purple-900' :
                      'bg-rose-100 text-rose-900'
                    }`}>
                      {slot.status === 'available' ? (isAr ? 'متاح' : 'Available') :
                       slot.status === 'booked' ? (isAr ? 'محجوز' : 'Booked') :
                       slot.status === 'completed' ? (isAr ? 'مكتمل' : 'Completed') :
                       (isAr ? 'ملغى' : 'Cancelled')}
                    </span>
                  </div>

                  {slot.patientName && (
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{isAr ? 'المريض:' : 'Patient:'} {slot.patientName}</span>
                      {slot.patientPhone && (
                        <span className="text-slate-400 font-normal">({slot.patientPhone})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {slot.status === 'booked' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(slot.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAr ? 'تأكيد الاكتمال' : 'Mark Completed'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(slot.id, 'cancelled')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>{isAr ? 'إلغاء الموعد' : 'Cancel'}</span>
                      </button>
                    </>
                  )}

                  {slot.status === 'available' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(slot.id, 'cancelled')}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-extrabold hover:underline cursor-pointer"
                    >
                      {isAr ? 'إلغاء الإتاحة' : 'Cancel Slot'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
