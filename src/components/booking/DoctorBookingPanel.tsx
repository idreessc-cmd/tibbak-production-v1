'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { 
  Calendar, MapPin, Upload, 
  ChevronRight, CheckCircle2, Loader2, Sparkles, CreditCard, 
  AlertCircle, FileText, Edit3, X 
} from 'lucide-react';
import { Doctor, AppointmentSlot } from '@/types';
import { getUpcomingDates, getSlotsForDoctorAndDate } from '@/lib/repositories/appointment-slots';
import { completeDemoBooking } from '@/lib/bookings/complete-demo-booking';
import { DemoSafetyNotice } from '@/components/shared/DemoSafetyNotice';

interface BookingPanelProps {
  doctor: Doctor;
  isDemoMode?: boolean;
}

export default function DoctorBookingPanel({ doctor, isDemoMode = false }: BookingPanelProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: Slot, 2: Info, 3: Files & Consent, 4: Review, 5: Success
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdCaseId, setCreatedCaseId] = useState('');

  // Step 1 states
  const availableDates = getUpcomingDates(doctor.first_available_date);
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || doctor.first_available_date);
  const dayAvailability = getSlotsForDoctorAndDate(doctor.id, selectedDate);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(
    dayAvailability.slots.find(s => s.isAvailable) || null
  );
  const [serviceType, setServiceType] = useState<'clinic' | 'online'>('clinic');

  // Step 2 states (demographics)
  const [patientName, setPatientName] = useState(isDemoMode ? 'محمد أحمد' : '');
  const [patientPhone, setPatientPhone] = useState(isDemoMode ? '+962 7 9123 4567' : '');
  const [patientCountry] = useState(isRtl ? 'الأردن' : 'Jordan');
  const [patientCity, setPatientCity] = useState(isRtl ? 'عمان' : 'Amman');
  const [patientAge, setPatientAge] = useState(isDemoMode ? '42' : '35');
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [patientReason, setPatientReason] = useState(isDemoMode ? 'ألم مستمر في الركبة منذ أسبوعين' : '');

  // Step 3 states (files & consent)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; sizeBytes: number }[]>([]);
  const [fileError, setFileError] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  const consentTextAr = 'أوافق على معالجة البيانات التي أدخلتها ومشاركتها داخل منصة طبّك مع الطبيب الذي اخترته لغرض مراجعة طلبي وإدارة الموعد، وأفهم أن التواصل سيبقى داخل المنصة.';
  const consentTextEn = 'I agree to the processing of the information I entered and its use inside Tibbak with the selected doctor for reviewing my request and managing the appointment. I understand that communication will remain inside the platform.';

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const newDayAvail = getSlotsForDoctorAndDate(doctor.id, date);
    const firstAvail = newDayAvail.slots.find(s => s.isAvailable);
    setSelectedSlot(firstAvail || null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Client-side file type validation
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setFileError(isRtl ? 'نوع الملف غير مدعوم. المسموح: PDF, JPG, PNG' : 'Invalid file type. Allowed: PDF, JPG, PNG');
        return;
      }

      // Client-side file size validation (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError(isRtl ? 'حجم الملف يتجاوز الحد الأقصى (5 ميجابايت)' : 'File size exceeds 5MB limit');
        return;
      }

      setUploadedFiles(prev => [...prev, { name: file.name, sizeBytes: file.size }]);
    }
  };

  const handleConfirmBooking = async () => {
    if (!consentAgreed) {
      setErrorMessage(isRtl ? 'يجب موافقتك على شروط المعالجة والخصوصية' : 'Consent is required');
      return;
    }
    if (!selectedSlot || !selectedSlot.isAvailable) {
      setErrorMessage(isRtl ? 'يرجى اختيار موعد متاح' : 'Please select an available slot');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await completeDemoBooking({
        doctorId: doctor.id,
        hospitalId: doctor.hospital_id,
        serviceType: serviceType as 'clinic' | 'online',
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot.time,
        patientName,
        patientPhone,
        patientCountry,
        patientCity,
        patientAge: parseInt(patientAge, 10) || 35,
        patientGender,
        patientReason,
        patientFiles: uploadedFiles.map(f => f.name),
        consentAgreed,
        isDemoPath: isDemoMode
      });

      if (result.success && result.caseRecord) {
        setCreatedCaseId(result.caseRecord.id);
        setStep(5); // Success step
      } else {
        setErrorMessage(result.message || (isRtl ? 'تعذر إنشاء الطلب' : 'Booking failed'));
        if (result.errorCode === 'APPOINTMENT_SLOT_UNAVAILABLE') {
          setStep(1); // Return patient to slot selection
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error occurred';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setIsModalOpen(false);
    setStep(1);
    setErrorMessage('');
    setCreatedCaseId('');
  };

  return (
    <>
      {/* Sidebar Sticky card Above-The-Fold */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 sticky top-24 font-cairo text-right rtl:text-right ltr:text-left">
        
        {/* Header Price & Status */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {isRtl ? 'رسوم الاستشارة والكشفية' : 'Consultation Fee'}
            </span>
            <span className="text-3xl font-black text-teal-600">
              {doctor.consultation_fee_jod} <span className="text-xs font-extrabold text-slate-500">{isRtl ? 'د.أ' : 'JOD'}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl block">
              {isRtl ? 'حاوية موعد متاحة' : 'Slots Available'}
            </span>
          </div>
        </div>

        {/* Dynamic Booking Meta Info */}
        <div className="space-y-3 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{isRtl ? 'أول موعد متاح:' : 'Earliest slot:'} {doctor.first_available_date}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{isRtl ? `العيادة: ${doctor.address_ar}` : `Clinic: ${doctor.address_en}`}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <span>{isRtl ? 'الدفع معزز ومحفوظ داخل المنصة' : 'Pay via platform billing'}</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Sparkles className="h-4.5 w-4.5" />
          <span>{isRtl ? 'احجز موعدًا' : 'Book Appointment'}</span>
        </button>

        {/* Secondary Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold py-3 px-6 rounded-2xl transition-all text-xs border border-slate-200 cursor-pointer"
        >
          {isRtl ? 'ابدأ طلبًا طبيًا' : 'Start a medical request'}
        </button>
      </div>

      {/* 4-Step Booking Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-cairo">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up text-right rtl:text-right ltr:text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  {isRtl ? 'طلب موعد واستشارة طبية آمنة' : 'Book a Secure Medical Case'}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5 mb-2">
                  {isRtl ? `الطبيب: ${doctor.name_ar} | ${doctor.consultation_fee_jod} د.أ` : `With ${doctor.name_en} | ${doctor.consultation_fee_jod} JOD`}
                </p>
                <DemoSafetyNotice locale={locale} />
              </div>
              {step < 5 && (
                <button
                  onClick={resetWizard}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Stepper Breadcrumbs (Steps 1 to 4) */}
            {step < 5 && (
              <div className="bg-slate-100/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-400 overflow-x-auto">
                <span className={step === 1 ? 'text-teal-600 font-black' : ''}>1. الموعد</span>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                <span className={step === 2 ? 'text-teal-600 font-black' : ''}>2. البيانات</span>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                <span className={step === 3 ? 'text-teal-600 font-black' : ''}>3. المرفقات والتعهد</span>
                <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                <span className={step === 4 ? 'text-teal-600 font-black' : ''}>4. التأكيد</span>
              </div>
            )}

            {/* Wizard Body Content */}
            <div className="p-6">
              
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-150 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1 — SERVICE AND APPOINTMENT */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Service Type Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {isRtl ? 'نوع الخدمة المطلوب:' : 'Service Type:'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setServiceType('clinic')}
                        className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          serviceType === 'clinic'
                            ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isRtl ? 'زيارة عيادة الطبيب' : 'Clinic Visit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setServiceType('online')}
                        className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          serviceType === 'online'
                            ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isRtl ? 'استشارة أونلاين مرئية' : 'Online Consultation'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {isRtl ? 'اختر التكلفة والتاريخ المتاح:' : 'Select Available Date:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {availableDates.map((d) => {
                        const dayAvail = getSlotsForDoctorAndDate(doctor.id, d);
                        const isSelected = selectedDate === d;

                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleDateChange(d)}
                            disabled={dayAvail.isClosed}
                            className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer relative ${
                              dayAvail.isClosed ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed' :
                              isSelected ? 'bg-teal-50 border-teal-600 text-teal-700 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Calendar className="h-4 w-4 mx-auto mb-1 opacity-70" />
                            <span className="block text-[11px] font-black">{dayAvail.dayNameAr}</span>
                            <span className="block text-[10px] opacity-70 mt-0.5">{d}</span>
                            {dayAvail.isClosed && <span className="text-[9px] text-rose-600 block mt-1">{isRtl ? 'مغلق' : 'Closed'}</span>}
                            {dayAvail.isFullyBooked && <span className="text-[9px] text-amber-600 block mt-1">{isRtl ? 'مكتمل' : 'Full'}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {!dayAvailability.isClosed && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'اختر وقت الموعد المتوفر:' : 'Available Time Slots:'}
                      </label>
                      {dayAvailability.slots.length === 0 || dayAvailability.isFullyBooked ? (
                        <div className="p-3 bg-amber-50 rounded-2xl text-xs font-bold text-amber-800 border border-amber-100 text-center">
                          {isRtl ? 'جميع مواعيد هذا اليوم مكتملة. يرجى اختيار تاريخ آخر.' : 'All slots fully booked for this date.'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {dayAvailability.slots.map((s) => {
                            const isSelected = selectedSlot?.id === s.id;

                            return (
                              <button
                                key={s.id}
                                type="button"
                                disabled={!s.isAvailable}
                                onClick={() => setSelectedSlot(s)}
                                className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all ${
                                  !s.isAvailable ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed' :
                                  isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                                }`}
                              >
                                <span>{s.time}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 1 Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500">
                      <span>{isRtl ? 'رسوم الكشفية:' : 'Fee:'} </span>
                      <span className="text-teal-600 font-black">{doctor.consultation_fee_jod} د.أ</span>
                    </div>

                    <button
                      type="button"
                      disabled={!selectedSlot || !selectedSlot.isAvailable}
                      onClick={() => setStep(2)}
                      className={`bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        (!selectedSlot || !selectedSlot.isAvailable) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-xs'
                      }`}
                    >
                      <span>{isRtl ? 'الخطوة التالية' : 'Next Step'}</span>
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 2 — PATIENT INFORMATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'اسم المريض الكامل (مطلوب)' : 'Full Name (Required)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder={isRtl ? 'مثال: محمد أحمد' : 'e.g. Mohammad Ahmad'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'رقم الهاتف للتأكيد (مطلوب)' : 'Phone Number (Required)'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+962 7 9123 4567"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-teal-500 text-left rtl:text-right"
                      />
                      <span className="text-[9px] text-slate-400 block">{isRtl ? 'يُستخدم لإشعارات المنصة وتأكيد الموعد فقط (مخفي عن الطبيب)' : 'Used for platform updates only (masked for doctor)'}</span>
                    </div>

                    {/* City & Country */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        {isRtl ? 'المدينة / المحافظة' : 'City / Governorate'}
                      </label>
                      <input
                        type="text"
                        value={patientCity}
                        onChange={(e) => setPatientCity(e.target.value)}
                        placeholder={isRtl ? 'عمان' : 'Amman'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          {isRtl ? 'العمر' : 'Age'}
                        </label>
                        <input
                          type="number"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          {isRtl ? 'الجنس' : 'Gender'}
                        </label>
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value as 'male' | 'female')}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                        >
                          <option value="male">{isRtl ? 'ذكر' : 'Male'}</option>
                          <option value="female">{isRtl ? 'أنثى' : 'Female'}</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Reason for visit */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {isRtl ? 'سبب الزيارة أو وصف الأعراض (مطلوب)' : 'Reason for Visit (Required)'}
                    </label>
                    <textarea
                      required
                      value={patientReason}
                      onChange={(e) => setPatientReason(e.target.value)}
                      placeholder={isRtl ? 'أدخل تفاصيل الشكوى الطبية باختصار...' : 'Describe symptoms or reasons...'}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Step 2 Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {isRtl ? 'رجوع للموعد' : 'Back to slot'}
                    </button>

                    <button
                      type="button"
                      disabled={!patientName || !patientPhone || !patientReason}
                      onClick={() => setStep(3)}
                      className={`bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        (!patientName || !patientPhone || !patientReason) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-xs'
                      }`}
                    >
                      <span>{isRtl ? 'الخطوة التالية' : 'Next Step'}</span>
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3 — FILES AND CONSENT */}
              {step === 3 && (
                <div className="space-y-5">
                  
                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      {isRtl ? 'مرفقات وتقارير طبية اختيارية (PDF, JPG, PNG - حد أقصى 5MB)' : 'Medical Reports Upload (PDF, JPG, PNG - Max 5MB)'}
                    </label>
                    
                    <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 transition-colors relative">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,image/jpeg,image/png,image/jpg"
                      />
                      <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-extrabold text-slate-700 block">
                        {isRtl ? 'اضغط لاختيار ملف من جهازك' : 'Click to select medical file'}
                      </span>
                    </div>

                    {fileError && (
                      <p className="text-xs font-bold text-rose-600">{fileError}</p>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {uploadedFiles.map((f, idx) => (
                          <div key={idx} className="bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-teal-600" />
                              <span>{f.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{(f.sizeBytes / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mandatory Consent Checkbox */}
                  <div className="p-4 bg-amber-50/60 border border-amber-150 rounded-2xl space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => setConsentAgreed(e.target.checked)}
                        className="rounded border-amber-300 text-teal-600 focus:ring-teal-500 h-4 w-4 mt-0.5"
                      />
                      <span className="text-xs font-bold text-slate-800 leading-relaxed">
                        {isRtl ? consentTextAr : consentTextEn}
                      </span>
                    </label>

                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200/50 text-[10px] font-extrabold text-amber-900">
                      <a href="#" onClick={(e) => { e.preventDefault(); alert(isRtl ? 'سياسة الخصوصية...' : 'Privacy Policy...'); }} className="underline hover:text-teal-700">
                        {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
                      </a>
                      <span>•</span>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert(isRtl ? 'الإخلاء الطبي...' : 'Medical Disclaimer...'); }} className="underline hover:text-teal-700">
                        {isRtl ? 'إخلاء المسؤولية الطبية' : 'Medical Disclaimer'}
                      </a>
                      <span>•</span>
                      <span>{isRtl ? 'بيانات توضيحية تجريبية' : 'Demo data scenario'}</span>
                    </div>
                  </div>

                  {/* Step 3 Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {isRtl ? 'رجوع للبيانات' : 'Back to info'}
                    </button>

                    <button
                      type="button"
                      disabled={!consentAgreed}
                      onClick={() => setStep(4)}
                      className={`bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        !consentAgreed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-xs'
                      }`}
                    >
                      <span>{isRtl ? 'مراجعة وتأكيد الطلب' : 'Review & Confirm'}</span>
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 4 — REVIEW AND CONFIRM */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 text-xs font-bold text-slate-700">
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span>{isRtl ? 'الطبيب:' : 'Doctor:'} {doctor.name_ar}</span>
                      <span className="text-teal-600 font-black">{doctor.consultation_fee_jod} د.أ</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>{isRtl ? 'تاريخ الموعد:' : 'Date:'} <span className="font-extrabold">{selectedDate}</span></div>
                      <div>{isRtl ? 'وقت الموعد:' : 'Time:'} <span className="font-extrabold">{selectedSlot?.time}</span></div>
                      <div>{isRtl ? 'اسم المريض:' : 'Patient:'} <span className="font-extrabold">{patientName}</span></div>
                      <div>{isRtl ? 'رقم الهاتف (مخفي):' : 'Phone (masked):'} <span className="font-extrabold">07*******12</span></div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="block text-[10px] font-black text-slate-400 uppercase">{isRtl ? 'سبب الزيارة:' : 'Reason:'}</span>
                      <p className="mt-0.5 font-semibold text-slate-800">{patientReason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-teal-600 hover:underline cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'تعديل الموعد والبيانات' : 'Edit appointment or details'}</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {isRtl ? 'رجوع' : 'Back'}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleConfirmBooking}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-black px-8 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{isRtl ? 'جاري التشفير وإرسال الطلب...' : 'Submitting request...'}</span>
                        </>
                      ) : (
                        <span>{isRtl ? 'تأكيد الحجز وإنشاء الحالة' : 'Confirm Request & Open Case'}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 — SUCCESS STATE */}
              {step === 5 && (
                <div className="py-6 text-center space-y-5 animate-scale-up">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 text-xl">
                      {isRtl ? 'تم إرسال طلبك، وهو بانتظار مراجعة الطبيب.' : 'Your request has been submitted and is awaiting doctor review.'}
                    </h4>
                    <div className="inline-block bg-teal-50 border border-teal-150 px-4 py-1.5 rounded-2xl text-xs font-black text-teal-800 tracking-wider">
                      {createdCaseId}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        router.push(`/cases/${createdCaseId}`);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
                    >
                      {isRtl ? 'متابعة الحالة' : 'Follow the case'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        router.push('/search');
                      }}
                      className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-extrabold px-6 py-3 rounded-2xl text-xs transition-all cursor-pointer"
                    >
                      {isRtl ? 'العودة إلى البحث' : 'Back to search'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
