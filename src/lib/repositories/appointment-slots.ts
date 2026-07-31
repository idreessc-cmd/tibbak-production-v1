import { AppointmentSlot } from '@/types';
import { inMemoryAppointments } from '@/data/mock/cases';

export interface DoctorScheduleConfig {
  doctorId: string;
  workingDays: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  startHour: string; // e.g. "09:00"
  endHour: string; // e.g. "17:00"
  breakStart: string; // e.g. "13:00"
  breakEnd: string; // e.g. "14:00"
  slotDurationMinutes: number; // 30
  exceptions: string[]; // YYYY-MM-DD dates for holidays/leave
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayNameAr: string;
  dayNameEn: string;
  isClosed: boolean;
  isFullyBooked: boolean;
  slots: AppointmentSlot[];
}

const STORAGE_KEY_SCHEDULE = 'tibbak_schedule_config_v1';

const DEFAULT_SCHEDULE: DoctorScheduleConfig = {
  doctorId: 'doc-1',
  workingDays: [0, 1, 2, 3, 4, 6], // Sun, Mon, Tue, Wed, Thu, Sat (Friday 5 closed)
  startHour: '09:00',
  endHour: '17:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  slotDurationMinutes: 30,
  exceptions: []
};

export function loadScheduleConfig(doctorId: string): DoctorScheduleConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_SCHEDULE, doctorId };
  try {
    const saved = sessionStorage.getItem(`${STORAGE_KEY_SCHEDULE}_${doctorId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.workingDays)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load schedule config', e);
  }
  return { ...DEFAULT_SCHEDULE, doctorId };
}

export function saveScheduleConfig(config: DoctorScheduleConfig): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`${STORAGE_KEY_SCHEDULE}_${config.doctorId}`, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save schedule config', e);
  }
}

export function validateScheduleConfig(config: DoctorScheduleConfig): { isValid: boolean; errorCode?: string; messageAr?: string; messageEn?: string } {
  if (config.startHour >= config.endHour) {
    return {
      isValid: false,
      errorCode: 'INVALID_WORKING_HOURS',
      messageAr: 'وقت إغلاق العيادة يجب أن يكون بعد وقت الفتح.',
      messageEn: 'Closing time must be after opening time.'
    };
  }

  if (config.breakStart >= config.breakEnd) {
    return {
      isValid: false,
      errorCode: 'INVALID_BREAK_HOURS',
      messageAr: 'وقت نهاية الاستراحة يجب أن يكون بعد وقت بدايتها.',
      messageEn: 'Break end time must be after break start time.'
    };
  }

  if (config.breakStart < config.startHour || config.breakEnd > config.endHour) {
    return {
      isValid: false,
      errorCode: 'BREAK_OUTSIDE_WORKING_HOURS',
      messageAr: 'وقت الاستراحة يجب أن يكون ضمن ساعات العمل الرسمية.',
      messageEn: 'Break hours must be within official working hours.'
    };
  }

  return { isValid: true };
}

export function addScheduleException(
  config: DoctorScheduleConfig, 
  exceptionDate: string,
  type: 'leave' | 'working_hours' = 'leave'
): { isValid: boolean; updatedConfig?: DoctorScheduleConfig; errorCode?: string; messageAr?: string; messageEn?: string } {
  if (config.exceptions.includes(exceptionDate)) {
    const isLeave = type === 'leave';
    return {
      isValid: false,
      errorCode: 'DUPLICATE_EXCEPTION_DATE',
      messageAr: isLeave ? 'تمت إضافة هذا التاريخ كإجازة مسبقاً.' : 'تمت إضافة استثناء لساعات العمل لهذا التاريخ مسبقاً.',
      messageEn: isLeave ? 'This date has already been added as a holiday/leave date.' : 'A working hours exception has already been added for this date.'
    };
  }

  const updatedConfig: DoctorScheduleConfig = {
    ...config,
    exceptions: [...config.exceptions, exceptionDate]
  };

  return { isValid: true, updatedConfig };
}

import { isAppointmentActive } from '@/lib/appointments/appointment-status';

export function validateAppointmentSlotConflict(
  doctorId: string, 
  date: string, 
  timeSlot: string,
  excludeAppointmentId?: string
): boolean {
  const existingApt = inMemoryAppointments.find(
    apt => apt.doctor_id === doctorId && 
           apt.date === date && 
           apt.time_slot === timeSlot && 
           isAppointmentActive(apt) &&
           (excludeAppointmentId ? apt.id !== excludeAppointmentId : true)
  );
  return Boolean(existingApt);
}

export function getUpcomingDates(baseDateStr: string): string[] {
  const baseDate = new Date(baseDateStr);
  const dates: string[] = [];

  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate.getTime() + i * 86400000);
    dates.push(d.toISOString().split('T')[0]);
  }

  return dates;
}

import { isProviderBookable } from '@/lib/providers/provider-availability';
import { getDoctorByIdIncludingUnavailable } from './doctors';

export function getSlotsForDoctorAndDate(doctorId: string, dateStr: string): DayAvailability {
  const doc = getDoctorByIdIncludingUnavailable(doctorId);
  const config = loadScheduleConfig(doctorId);
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();

  const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayNameAr = dayNamesAr[dayOfWeek] || '';
  const dayNameEnStr = dayNamesEn[dayOfWeek] || '';

  // Check provider bookability (e.g. suspended providers return zero slots)
  const isBookable = doc ? isProviderBookable(doc) : true;
  const isClosedDay = !isBookable || !config.workingDays.includes(dayOfWeek) || config.exceptions.includes(dateStr);

  if (isClosedDay) {
    return {
      date: dateStr,
      dayNameAr,
      dayNameEn: dayNameEnStr,
      isClosed: true,
      isFullyBooked: false,
      slots: []
    };
  }

  const isFullyBooked = dateStr.endsWith('27');

  const baseSlots: { time: string; available: boolean; reason?: string }[] = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false, reason: 'حجز سابق / Booked' },
    { time: '11:30 AM', available: true },
    { time: '01:30 PM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:30 PM', available: false, reason: 'استراحة العيادة / Clinic Break' },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: true }
  ];

  const slots: AppointmentSlot[] = baseSlots.map((s, idx) => ({
    id: `slot-${dateStr}-${idx}`,
    date: dateStr,
    time: s.time,
    isAvailable: isFullyBooked ? false : s.available,
    isBooked: !s.available,
    reasonUnavailable: isFullyBooked ? 'كامل المواعيد محجوزة / Fully Booked' : s.reason
  }));

  return {
    date: dateStr,
    dayNameAr,
    dayNameEn: dayNameEnStr,
    isClosed: false,
    isFullyBooked,
    slots
  };
}
