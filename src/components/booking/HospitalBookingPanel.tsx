'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { User, Phone, Globe, MapPin, ClipboardList, Upload, CheckCircle2, Loader2, Sparkles, Building2 } from 'lucide-react';
import { Hospital } from '@/types';
import { completeDemoBooking } from '@/lib/bookings/complete-demo-booking';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface HospitalBookingPanelProps {
  hospital: Hospital;
}

export default function HospitalBookingPanel({ hospital }: HospitalBookingPanelProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lock body scroll when modal is open & handle Escape key
  useBodyScrollLock(isModalOpen, () => setIsModalOpen(false));
  const [step, setStep] = useState(1);
  const [caseId, setCaseId] = useState('');

  // Step 2 states (demographics)
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientCountry, setPatientCountry] = useState(isRtl ? 'الأردن' : 'Jordan');
  const [patientCity, setPatientCity] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [patientReason, setPatientReason] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileName = file.name;
      setUploadedFiles(prev => [...prev, fileName]);
      
      // Simulate file upload progress
      setFileProgress(prev => ({ ...prev, [fileName]: 0 }));
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setFileProgress(prev => ({ ...prev, [fileName]: progress }));
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone || !patientReason) {
      alert(isRtl ? 'يرجى تعبئة الحقول المطلوبة الأساسية' : 'Please fill required fields');
      return;
    }

    setStep(2); // In hospital booking, we skip date/time picker (Step 1 is demographics directly)

    // Execute atomic completeDemoBooking
    setTimeout(async () => {
      try {
        const result = await completeDemoBooking({
          hospitalId: hospital.id,
          serviceType: 'hospital',
          patientName,
          patientPhone,
          patientCountry,
          patientCity: patientCity || (isRtl ? 'عمان' : 'Amman'),
          patientAge: parseInt(patientAge, 10) || 30,
          patientGender,
          patientReason,
          patientFiles: uploadedFiles,
          consentAgreed: true,
          isDemoPath: true
        });

        if (result.success && result.caseRecord) {
          setCaseId(result.caseRecord.id);
          setStep(3);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  const resetWizard = () => {
    setIsModalOpen(false);
    setStep(1);
    setCaseId('');
    setPatientName('');
    setPatientPhone('');
    setPatientReason('');
    setUploadedFiles([]);
  };

  return (
    <>
      {/* Sidebar Sticky card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md space-y-6 sticky top-24">
        <div className="pb-4 border-b border-slate-50 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {isRtl ? 'الرعاية الاستشفائية' : 'Admission Program'}
          </span>
          <span className="text-xl font-extrabold text-slate-800">
            {isRtl ? 'تنسيق علاج مباشر' : 'Direct Treatment Coordination'}
          </span>
        </div>

        {/* Dynamic Meta Info */}
        <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-650">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4.5 w-4.5 text-slate-400" />
            <span>{isRtl ? 'غرف عمليات وأسرة متاحة' : 'Operating wards active'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Globe className="h-4.5 w-4.5 text-slate-400" />
            <span>{isRtl ? 'استقبال وتنسيق للمرضى الدوليين' : 'International medical tourism active'}</span>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="h-4.5 w-4.5" />
          <span className="text-base">{isRtl ? 'طلب خطة علاجية' : 'Request Treatment Plan'}</span>
        </button>
      </div>

      {/* Hospital Booking Wizard Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div className="text-right">
                <h3 className="font-extrabold text-slate-800 text-base font-cairo">
                  {isRtl ? 'تقديم طلب علاج وتنسيق طبي' : 'Submit Treatment Plan Request'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {isRtl ? `لدى مستشفى: ${hospital.name_ar}` : `With: ${hospital.name_en}`}
                </p>
              </div>
              {step !== 2 && (
                <button
                  onClick={resetWizard}
                  className="text-xs font-bold text-slate-405 hover:text-slate-600"
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              )}
            </div>

            {/* Wizard Body content */}
            <div className="p-6">
              
              {/* STEP 1: Demographics Form */}
              {step === 1 && (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                        <User className="h-3.5 w-3.5 text-teal-600" />
                        <span>{isRtl ? 'اسم المريض الكامل (مطلوب)' : 'Full Name (Required)'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder={isRtl ? 'مثال: أحمد عبد الله الخطيب' : 'e.g. Ahmad Abdullah'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                        <Phone className="h-3.5 w-3.5 text-teal-600" />
                        <span>{isRtl ? 'رقم الهاتف للتواصل (مطلوب)' : 'Phone Number (Required)'}</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+962 7 9000 0000"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:bg-white focus:outline-none text-left"
                      />
                    </div>

                    {/* Country & City */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                        <Globe className="h-3.5 w-3.5 text-teal-600" />
                        <span>{isRtl ? 'دولة الإقامة' : 'Country'}</span>
                      </label>
                      <input
                        type="text"
                        value={patientCountry}
                        onChange={(e) => setPatientCountry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                        <MapPin className="h-3.5 w-3.5 text-teal-600" />
                        <span>{isRtl ? 'المدينة' : 'City'}</span>
                      </label>
                      <input
                        type="text"
                        value={patientCity}
                        onChange={(e) => setPatientCity(e.target.value)}
                        placeholder={isRtl ? 'مثال: الرياض' : 'e.g. Riyadh'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Age & Gender */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                        {isRtl ? 'العمر' : 'Age'}
                      </label>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="38"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                        {isRtl ? 'الجنس' : 'Gender'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPatientGender('male')}
                          className={`py-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            patientGender === 'male'
                              ? 'bg-teal-50 border-teal-500 text-teal-700'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {isRtl ? 'ذكر' : 'Male'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPatientGender('female')}
                          className={`py-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            patientGender === 'female'
                              ? 'bg-teal-50 border-teal-500 text-teal-700'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {isRtl ? 'أنثى' : 'Female'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reason for Treatment request */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                      <ClipboardList className="h-3.5 w-3.5 text-teal-600" />
                      <span>{isRtl ? 'تفاصيل التشخيص والتقارير الطبية المطلوبة (مطلوب)' : 'Diagnostic Details (Required)'}</span>
                    </label>
                    <textarea
                      required
                      value={patientReason}
                      onChange={(e) => setPatientReason(e.target.value)}
                      placeholder={isRtl ? 'يرجى وصف الحالة الطبية بالتفصيل، والعملية المطلوبة للتقييم...' : 'Describe medical condition...'}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-805 focus:bg-white focus:outline-none font-cairo"
                    ></textarea>
                  </div>

                  {/* File Upload uploader */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                      {isRtl ? 'أرفق تقارير طبية وتخطيطات أشعة (مستحسن للتشخيص)' : 'Attach medical reports (Recommended)'}
                    </label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 transition-colors rounded-2xl p-5 text-center cursor-pointer relative bg-slate-50/50">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,image/*"
                      />
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-extrabold text-slate-700">
                        {isRtl ? 'اسحب وأفلت تقريرك هنا أو اضغط للتحميل' : 'Drag & drop records here or browse'}
                      </p>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {uploadedFiles.map((file) => (
                          <div key={file} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-700">
                            <span>{file}</span>
                            <div className="flex items-center gap-2">
                              {fileProgress[file] < 100 ? (
                                <span>{fileProgress[file]}%</span>
                              ) : (
                                <span className="text-emerald-600">{isRtl ? 'مرفق' : 'Attached'}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit footer */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-end">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
                    >
                      {isRtl ? 'إرسال طلب خطة العلاج' : 'Submit Treatment Plan'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Loading State */}
              {step === 2 && (
                <div className="py-8 text-center space-y-4">
                  <Loader2 className="h-12 w-12 text-teal-650 animate-spin mx-auto" />
                  <h4 className="font-extrabold text-slate-800 text-sm font-cairo">
                    {isRtl ? 'جاري تسجيل الحالة وإرسال الملفات بأمان...' : 'Registering case & uploads securely...'}
                  </h4>
                </div>
              )}

              {/* STEP 3: Success Confirmation */}
              {step === 3 && (
                <div className="py-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner animate-scale-up">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-extrabold text-slate-800 text-xl font-cairo">
                      {isRtl ? 'تم تسجيل حالة المستشفى بنجاح!' : 'Hospital Case Registered!'}
                    </h4>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl inline-block mt-3 text-sm font-extrabold text-slate-800 tracking-wider">
                      {caseId}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-md mx-auto mt-4 font-cairo">
                      {isRtl 
                        ? 'تم إنشاء الملف الطبي وحفظه. سيتواصل فريق التنسيق الطبي للمستشفى معك قريباً جداً عبر المحادثة المغلقة المنشأة بالأسفل لتحديد الأسرة وخطة العلاج.'
                        : 'Your secure hospital case has been established. The medical coordination staff will contact you shortly inside the secure chatroom below.'}
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        router.push(`/cases/${caseId}`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-8 rounded-2xl transition-all shadow-md text-sm cursor-pointer"
                    >
                      {isRtl ? 'فتح المحادثة الطبية للمستشفى' : 'Open Hospital Chatroom'}
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
