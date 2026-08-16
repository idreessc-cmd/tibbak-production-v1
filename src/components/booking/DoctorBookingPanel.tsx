'use client';

import { Doctor } from '@/types';
import PatientBookingWidget from './PatientBookingWidget';

interface BookingPanelProps {
  doctor: Doctor;
  isDemoMode?: boolean;
}

export default function DoctorBookingPanel({ doctor }: BookingPanelProps) {
  return (
    <div id="booking-widget" className="scroll-mt-6">
      <PatientBookingWidget doctor={doctor} />
    </div>
  );
}
