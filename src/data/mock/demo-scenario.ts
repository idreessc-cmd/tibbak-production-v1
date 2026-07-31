import { Case, Message, Appointment } from '@/types';

export interface DemoScenario {
  patient: {
    name_ar: string;
    name_en: string;
    phone: string;
    email: string;
    country_ar: string;
    country_en: string;
    city_ar: string;
    city_en: string;
    age: number;
    gender: 'male' | 'female';
  };
  doctorId: string;
  doctorSlug: string;
  hospitalId: string | null;
  specialtyId: string;
  specialtyNameAr: string;
  specialtyNameEn: string;
  cityId: string;
  cityNameAr: string;
  cityNameEn: string;
  medicalIssueAr: string;
  medicalIssueEn: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFee: number;
  caseId: string;
  caseStatus: 'new' | 'reviewing' | 'waiting_doctor' | 'accepted' | 'appointment_scheduled' | 'completed' | 'closed';
  caseStatusHistory: {
    status: string;
    label_ar: string;
    label_en: string;
    timestamp: string;
  }[];
  messages: Omit<Message, 'id'>[];
  subscriptionTier: 'free' | 'premium' | 'vip';
  leadSource: string;
}

export const demoScenario: DemoScenario = {
  patient: {
    name_ar: 'محمد أحمد',
    name_en: 'Mohammad Ahmad',
    phone: '+962 7 9123 4567',
    email: 'mohammad.ahmad@gmail.com',
    country_ar: 'الأردن',
    country_en: 'Jordan',
    city_ar: 'عمان',
    city_en: 'Amman',
    age: 45,
    gender: 'male'
  },
  doctorId: 'doc-1',
  doctorSlug: 'dr-firas-khatib-1',
  hospitalId: 'hosp-1',
  specialtyId: 'spec-orthopedics',
  specialtyNameAr: 'جراحة العظام والمفاصل',
  specialtyNameEn: 'Orthopedic Surgery',
  cityId: 'city-amman',
  cityNameAr: 'عمان',
  cityNameEn: 'Amman',
  medicalIssueAr: 'ألم مستمر في الركبة منذ أسبوعين وصعوبة في صعود الدرج وثني المفصل.',
  medicalIssueEn: 'Persistent pain in the left knee for two weeks with difficulty climbing stairs and flexing the joint.',
  appointmentDate: '2026-07-24',
  appointmentTime: '10:30 AM',
  consultationFee: 25,
  caseId: 'CASE-2026-000154',
  caseStatus: 'appointment_scheduled',
  caseStatusHistory: [
    { status: 'new', label_ar: 'حالة جديدة', label_en: 'New Case', timestamp: '2026-07-23T10:00:00Z' },
    { status: 'reviewing', label_ar: 'قيد المراجعة لدى المنصة', label_en: 'Reviewing by Platform', timestamp: '2026-07-23T10:10:00Z' },
    { status: 'waiting_doctor', label_ar: 'بانتظار قبول الطبيب', label_en: 'Waiting for Doctor', timestamp: '2026-07-23T10:15:00Z' },
    { status: 'accepted', label_ar: 'تم قبول الحالة من الطبيب', label_en: 'Accepted by Doctor', timestamp: '2026-07-23T10:30:00Z' },
    { status: 'appointment_scheduled', label_ar: 'تمت جدولة الموعد', label_en: 'Appointment Scheduled', timestamp: '2026-07-23T11:00:00Z' }
  ],
  messages: [
    {
      case_id: 'CASE-2026-000154',
      sender_role: 'system',
      text: 'تم إنشاء الحالة بنجاح. ملفات المريض وتفاصيل الكشفية متوفرة للطبيب.',
      type: 'text',
      created_at: '2026-07-23T10:00:00Z'
    },
    {
      case_id: 'CASE-2026-000154',
      sender_role: 'patient',
      text: 'مرحباً دكتور فراس، أرفقت تقرير الرنين المغناطيسي للركبة اليسرى وصورة الأشعة السينية. أرجو مراجعته لمعرفة سبب هذا الألم المستمر منذ أسبوعين.',
      type: 'text',
      created_at: '2026-07-23T10:05:00Z'
    },
    {
      case_id: 'CASE-2026-000154',
      sender_role: 'doctor',
      text: 'أهلاً بك سيد محمد. اطلعت على صور الرنين المغناطيسي، التقرير يظهر وجود تمزق خفيف في الغضروف الهلالي للركبة اليسرى. هل الألم يزداد سوءاً عند القرفصاء أو ثني الركبة بالكامل؟',
      type: 'text',
      created_at: '2026-07-23T10:15:00Z'
    },
    {
      case_id: 'CASE-2026-000154',
      sender_role: 'patient',
      text: 'نعم دكتور، يشتد الألم جداً عند ثني المفصل وعند صعود الدرج، وأشعر أحياناً بفرقعة خفيفة داخل المفصل.',
      type: 'text',
      created_at: '2026-07-23T10:20:00Z'
    }
  ],
  subscriptionTier: 'free',
  leadSource: 'Tibbak Search'
};

// Helper function to map scenario data to structured mock entities
export function getScenarioCase(): Case {
  return {
    id: demoScenario.caseId,
    patient_id: 'pat-1',
    doctor_id: demoScenario.doctorId,
    hospital_id: demoScenario.hospitalId,
    status: 'appointment_scheduled',
    created_at: '2026-07-23T10:00:00Z',
    patient_name: demoScenario.patient.name_ar,
    patient_phone: demoScenario.patient.phone,
    patient_email: demoScenario.patient.email,
    patient_country: demoScenario.patient.country_ar,
    patient_city: demoScenario.patient.city_ar,
    patient_age: demoScenario.patient.age,
    patient_gender: demoScenario.patient.gender,
    patient_reason: demoScenario.medicalIssueAr,
    patient_files: ['knee_mri_report.pdf', 'blood_test.png']
  };
}

export function getScenarioAppointment(): Appointment {
  return {
    id: 'apt-1',
    case_id: demoScenario.caseId,
    doctor_id: demoScenario.doctorId,
    date: demoScenario.appointmentDate,
    time_slot: demoScenario.appointmentTime,
    status: 'scheduled',
    notes: 'ألم في الركبة اليسرى - استشارة ومتابعة أشعة الرنين المغناطيسي'
  };
}
