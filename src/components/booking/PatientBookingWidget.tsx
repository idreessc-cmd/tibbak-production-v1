'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Doctor, Specialty } from '@/types';
import { 
  getDoctorSlots, 
  bookPatientConsultation, 
  DemoSlot, 
  DemoAppointmentReceipt, 
  getJordanTodayDateString 
} from '@/lib/consultations';
import { getEffectiveDoctorPrice } from '@/lib/offers';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, User, Phone, Check
} from 'lucide-react';

interface PatientBookingWidgetProps {
  doctor: Doctor;
  specialty?: Specialty;
  onBookingSuccess?: (receipt: DemoAppointmentReceipt) => void;
}

export default function PatientBookingWidget({
  doctor,
  specialty,
  onBookingSuccess,
}: PatientBookingWidgetProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [slots, setSlots] = useState<DemoSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('أحمد محمود');
  const [patientPhone, setPatientPhone] = useState('0791234567');
  const [notes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DemoAppointmentReceipt | null>(null);

  const loadSlots = () => {
    if (!doctor || !doctor.id) return;
    const allSlots = getDoctorSlots(doctor.id);
    const today = getJordanTodayDateString();
    // Filter available and booked slots for future/today
    const validSlots = allSlots.filter(s => s.date >= today && s.status !== 'cancelled');
    setSlots(validSlots);
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

  const priceInfo = getEffectiveDoctorPrice(doctor);

  const availableSlots = slots.filter(s => s.status === 'available');
  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSlotId) {
      setErrorMsg(isAr ? 'يرجى اختيار موعد متاح من القائمة' : 'Please select an available slot');
      return;
    }

    if (!patientName.trim() || !patientPhone.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم المريض ورقم الهاتف' : 'Please enter patient name and phone number');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = bookPatientConsultation(
        selectedSlotId,
        doctor,
        specialty,
        patientName,
        patientPhone,
        notes
      );

      setIsSubmitting(false);

      if (!result.success) {
        setErrorMsg(isAr ? result.errorAr! : result.errorEn!);
        loadSlots(); // Refresh slots state
        return;
      }

      setReceipt(result.receipt!);
      if (onBookingSuccess) {
        onBookingSuccess(result.receipt!);
      }
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5 font-cairo dir-auto" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            <span>{isAr ? 'حجز موعد استشارة جديدة' : 'Book New Consultation'}</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isAr ? 'اختر الوقت المناسب وسجل بيانات الحجز المباشر' : 'Select an available slot and enter patient details'}
          </p>
        </div>

        {/* Pricing Badge (Phase 4 Price Logic) */}
        <div className="text-left rtl:text-right bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
          <span className="text-[10px] text-teal-700 font-bold block">{isAr ? 'كشفية العيادة:' : 'Consultation Fee:'}</span>
          {priceInfo.hasActiveOffer ? (
            <div className="flex items-baseline gap-1 font-black text-rose-600 text-xs">
              <span>{priceInfo.effectivePrice} JOD</span>
              <span className="text-[10px] text-slate-400 line-through font-bold">{priceInfo.basePrice}</span>
            </div>
          ) : (
            <span className="text-xs font-black text-teal-800">{priceInfo.basePrice} JOD</span>
          )}
        </div>
      </div>

      {/* Confirmation Receipt View (After Booking) */}
      {receipt ? (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-5 space-y-4 shadow-xs text-slate-900">
          <div className="flex items-center gap-2 text-emerald-800 border-b border-emerald-200/70 pb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-black">{isAr ? 'تم تأكيد طلب الحجز بنجاح!' : 'Booking Confirmed Successfully!'}</h3>
              <p className="text-[11px] text-emerald-700 font-semibold">{isAr ? 'رقم الإيصال: ' : 'Receipt ID: '} {receipt.appointmentId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-slate-500 text-[11px] block">{isAr ? 'الطبيب:' : 'Doctor:'}</span>
              <span className="font-bold text-slate-900">{isAr ? receipt.doctorNameAr : receipt.doctorNameEn}</span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-slate-500 text-[11px] block">{isAr ? 'التخصص:' : 'Specialty:'}</span>
              <span className="font-bold text-slate-900">{isAr ? receipt.specialtyAr : receipt.specialtyEn}</span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-slate-500 text-[11px] block">{isAr ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
              <span className="font-bold text-teal-800">{receipt.date} - {receipt.time}</span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-slate-500 text-[11px] block">{isAr ? 'السعر الكلي:' : 'Total Price:'}</span>
              <span className="font-black text-rose-600">{receipt.effectivePrice} JOD</span>
            </div>

            <div className="col-span-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[11px] block">{isAr ? 'اسم المريض ورقم الهاتف:' : 'Patient Name & Phone:'}</span>
                <span className="font-bold text-slate-900">{receipt.patientName} ({receipt.patientPhone})</span>
              </div>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-lg">
                {isAr ? 'مؤكد' : 'Scheduled'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setReceipt(null);
              setSelectedSlotId(null);
              loadSlots();
            }}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'حجز موعد آخر' : 'Book Another Appointment'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleConfirmBooking} className="space-y-4">
          
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Available Slots Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>{isAr ? 'المواعيد المتاحة:' : 'Available Time Slots:'}</span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {isAr ? `(${availableSlots.length} موعد متوفر)` : `(${availableSlots.length} available)`}
              </span>
            </label>

            {availableSlots.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-center text-xs font-bold space-y-1">
                <p>{isAr ? 'لا توجد مواعيد متاحة حالياً لليوم وغداً' : 'No available slots currently'}</p>
                <p className="text-[11px] text-amber-700 font-semibold">{isAr ? 'يمكن للطبيب إضافة مواعيد جديدة من لوحة التحكم' : 'New slots can be added from doctor dashboard'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs scale-102'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3" />
                        <span>{slot.date}</span>
                      </div>
                      <div className="flex items-center gap-1 font-extrabold">
                        <Clock className="h-3 w-3" />
                        <span>{slot.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Patient Details Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{isAr ? 'اسم المريض بالكامل' : 'Full Patient Name'}</span>
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{isAr ? 'رقم الهاتف' : 'Phone Number'}</span>
              </label>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-teal-600"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedSlotId || availableSlots.length === 0}
              className={`w-full font-black py-3 px-4 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedSlotId && !isSubmitting
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span>{isAr ? 'جاري تأكيد الحجز...' : 'Confirming Booking...'}</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>
                    {selectedSlot 
                      ? (isAr ? `تأكيد حجز موعد (${selectedSlot.date} - ${selectedSlot.time})` : `Confirm Appointment (${selectedSlot.date} - ${selectedSlot.time})`)
                      : (isAr ? 'حدد موعداً للتأكيد' : 'Select a slot to confirm')}
                  </span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
