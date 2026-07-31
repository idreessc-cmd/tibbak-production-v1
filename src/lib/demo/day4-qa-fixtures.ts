import { Appointment, Case } from '@/types';
import { inMemoryAppointments, inMemoryCases } from '@/data/mock/cases';
import { saveScheduleConfig, DoctorScheduleConfig } from '@/lib/repositories/appointment-slots';
import { adminUpdateDoctorSubscriptionPlan } from '@/lib/repositories/doctors';
import { isAppointmentActive } from '@/lib/appointments/appointment-status';

export { isAppointmentActive };

export const QA_INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-qa-confirm',
    case_id: 'CASE-QA-001',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '09:00 AM',
    status: 'requested',
    notes: 'Initial request pending confirmation'
  },
  {
    id: 'apt-qa-reschedule',
    case_id: 'CASE-QA-002',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '10:00 AM',
    status: 'scheduled',
    notes: 'To be rescheduled'
  },
  {
    id: 'apt-qa-conflict-source',
    case_id: 'CASE-QA-003',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '11:30 AM',
    status: 'scheduled',
    notes: 'Attempting move to occupied target slot'
  },
  {
    id: 'apt-qa-conflict-target',
    case_id: 'CASE-QA-004',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '02:00 PM',
    status: 'scheduled',
    notes: 'Occupied target slot'
  },
  {
    id: 'apt-qa-cancel',
    case_id: 'CASE-QA-005',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '03:00 PM',
    status: 'scheduled',
    notes: 'To be cancelled'
  },
  {
    id: 'apt-qa-attended',
    case_id: 'CASE-QA-006',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '04:00 PM',
    status: 'scheduled',
    notes: 'To be marked attended'
  },
  {
    id: 'apt-qa-no-show',
    case_id: 'CASE-QA-007',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '04:30 PM',
    status: 'scheduled',
    notes: 'To be marked no-show'
  },
  {
    id: 'apt-qa-preservation',
    case_id: 'CASE-QA-008',
    doctor_id: 'doc-1',
    date: '2026-07-24',
    time_slot: '10:00 AM',
    status: 'scheduled',
    notes: 'Preservation test booked appointment'
  }
];

export const QA_INITIAL_CASES: Case[] = [
  {
    id: 'CASE-2026-000154',
    patient_id: 'pat-1',
    doctor_id: 'doc-1',
    hospital_id: 'hosp-1',
    status: 'waiting_doctor',
    created_at: '2026-07-23T10:00:00Z',
    patient_name: 'محمد أحمد',
    patient_phone: '+962 7 9123 4567',
    patient_email: 'mohamed.ahmed@demo.com',
    patient_country: 'الأردن',
    patient_city: 'عمان',
    patient_age: 45,
    patient_gender: 'male',
    patient_reason: 'ألم مستمر في الركبة منذ أسبوعين وصعوبة في صعود الدرج وثني المفصل.',
    patient_files: ['knee_mri_report.pdf', 'blood_test.png']
  },
  {
    id: 'CASE-QA-001',
    patient_id: 'patient-qa-1',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'waiting_doctor',
    created_at: '2026-07-20T08:00:00Z',
    patient_name: 'أحمد محمود القاسم',
    patient_phone: '+962 7 9000 1111',
    patient_email: 'ahmed.qasim@demo.com',
    patient_country: 'الأردن',
    patient_city: 'عمان',
    patient_age: 45,
    patient_gender: 'male',
    patient_reason: 'ألم مفصل الركبة وتأكيد الموعد',
    patient_files: []
  },
  {
    id: 'CASE-QA-002',
    patient_id: 'patient-qa-2',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-21T09:00:00Z',
    patient_name: 'سارة خالد عمر',
    patient_phone: '+962 7 9000 2222',
    patient_email: 'sara.omar@demo.com',
    patient_country: 'الأردن',
    patient_city: 'إربد',
    patient_age: 32,
    patient_gender: 'female',
    patient_reason: 'إعادة جدولة الموعد الأسبوعي',
    patient_files: []
  },
  {
    id: 'CASE-QA-003',
    patient_id: 'patient-qa-3',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-22T10:00:00Z',
    patient_name: 'محمد علي الحنيطي',
    patient_phone: '+962 7 9000 3333',
    patient_email: 'mohamed.huneiti@demo.com',
    patient_country: 'الأردن',
    patient_city: 'عمان',
    patient_age: 50,
    patient_gender: 'male',
    patient_reason: 'اختبار تعارض المواعيد - مصدر',
    patient_files: []
  },
  {
    id: 'CASE-QA-004',
    patient_id: 'patient-qa-4',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-22T11:00:00Z',
    patient_name: 'ليلى طارق المجالي',
    patient_phone: '+962 7 9000 4444',
    patient_email: 'laila.majali@demo.com',
    patient_country: 'الأردن',
    patient_city: 'الكرك',
    patient_age: 29,
    patient_gender: 'female',
    patient_reason: 'اختبار تعارض المواعيد - هدف',
    patient_files: []
  },
  {
    id: 'CASE-QA-005',
    patient_id: 'patient-qa-5',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-23T12:00:00Z',
    patient_name: 'عمر زياد النسور',
    patient_phone: '+962 7 9000 5555',
    patient_email: 'omar.nsour@demo.com',
    patient_country: 'الأردن',
    patient_city: 'السلط',
    patient_age: 38,
    patient_gender: 'male',
    patient_reason: 'إلغاء الموعد مع تحديد السبب',
    patient_files: []
  },
  {
    id: 'CASE-QA-006',
    patient_id: 'patient-qa-6',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-23T13:00:00Z',
    patient_name: 'هدى عبد الله الشوابكة',
    patient_phone: '+962 7 9000 6666',
    patient_email: 'huda.shawabkeh@demo.com',
    patient_country: 'الأردن',
    patient_city: 'مأدبا',
    patient_age: 41,
    patient_gender: 'female',
    patient_reason: 'توثيق حضور الزيارة الطبية',
    patient_files: []
  },
  {
    id: 'CASE-QA-007',
    patient_id: 'patient-qa-7',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-23T14:00:00Z',
    patient_name: 'طارق فيصل الزعبي',
    patient_phone: '+962 7 9000 7777',
    patient_email: 'tariq.zoubi@demo.com',
    patient_country: 'الأردن',
    patient_city: 'الرمثا',
    patient_age: 55,
    patient_gender: 'male',
    patient_reason: 'توثيق عدم حضور المريض',
    patient_files: []
  },
  {
    id: 'CASE-QA-008',
    patient_id: 'patient-qa-8',
    doctor_id: 'doc-1',
    hospital_id: null,
    status: 'appointment_scheduled',
    created_at: '2026-07-23T15:00:00Z',
    patient_name: 'رانية سامي طوالبة',
    patient_phone: '+962 7 9000 8888',
    patient_email: 'rania.tawalbeh@demo.com',
    patient_country: 'الأردن',
    patient_city: 'عمان',
    patient_age: 36,
    patient_gender: 'female',
    patient_reason: 'اختبار حفظ الموعد المسبق عند تعديل الجدول',
    patient_files: []
  }
];

export async function resetDay4Fixtures(): Promise<void> {
  // 1. Reset Appointments
  inMemoryAppointments.length = 0;
  QA_INITIAL_APPOINTMENTS.forEach(apt => {
    inMemoryAppointments.push({ ...apt });
  });

  // 2. Reset Cases
  // Remove existing QA cases and push initial QA cases
  for (let i = inMemoryCases.length - 1; i >= 0; i--) {
    if (inMemoryCases[i].id.startsWith('CASE-QA-')) {
      inMemoryCases.splice(i, 1);
    }
  }
  QA_INITIAL_CASES.forEach(c => {
    inMemoryCases.push({ ...c, status_history: [] });
  });

  // 3. Reset Schedule Config
  const defaultSchedule: DoctorScheduleConfig = {
    doctorId: 'doc-1',
    workingDays: [0, 1, 2, 3, 4, 6],
    startHour: '09:00',
    endHour: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    slotDurationMinutes: 30,
    exceptions: []
  };
  saveScheduleConfig(defaultSchedule);

  // 4. Reset Notifications in sessionStorage
  if (typeof window !== 'undefined') {
    const initialNotifs = [
      { id: 'notif-1', caseId: 'CASE-2026-000154', isLocked: false, titleAr: 'طلب حالة جديدة بحاجة للمراجعة (CASE-2026-000154)', titleEn: 'New case request awaiting review (CASE-2026-000154)', date: 'قبل 10 دقائق', read: false },
      { id: 'notif-2', caseId: 'CASE-2026-000002', isLocked: false, titleAr: 'تم تحديد موعد جديد للمريض سارة أحمد', titleEn: 'New appointment scheduled for patient Sara Ahmad', date: 'قبل ساعة', read: false }
    ];
    sessionStorage.setItem('tibbak_doctor_notifications_v1', JSON.stringify(initialNotifs));
    sessionStorage.setItem('tibbak_doctor_plan_v1', 'free');
  }

  // 5. Reset Doctor Subscription Plan
  await adminUpdateDoctorSubscriptionPlan('doc-1', 'free');
}
