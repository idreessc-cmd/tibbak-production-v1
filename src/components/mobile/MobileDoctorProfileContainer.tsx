'use client';

import { useRef } from 'react';
import { Doctor, Specialty, City, Hospital } from '@/types';
import MobileDoctorProfileTop from './MobileDoctorProfileTop';
import MobileDoctorProfileBody from './MobileDoctorProfileBody';
import DoctorBookingPanel from '@/components/booking/DoctorBookingPanel';

interface MobileDoctorProfileContainerProps {
  doctor: Doctor;
  specialty?: Specialty;
  city?: City;
  hospital?: Hospital | null;
  isDemoMode?: boolean;
}

export default function MobileDoctorProfileContainer({
  doctor,
  specialty,
  city,
  hospital,
  isDemoMode,
}: MobileDoctorProfileContainerProps) {
  const bookingRef = useRef<HTMLDivElement>(null);

  const handleBookClick = () => {
    if (bookingRef.current) {
      bookingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="md:hidden space-y-2">
      {/* 1. Mobile Top Section (Header, Avatar, Name, Specialty, Verified, Rating, Fee, Earliest Date, Favorite, Book CTA) */}
      <MobileDoctorProfileTop
        doctor={doctor}
        specialty={specialty}
        city={city}
        onBookClick={handleBookClick}
      />

      {/* 2. Mobile Doctor Information Body (Shallow Order: Bio -> Qualifications -> Services -> Languages -> Hospital -> Location -> Reviews) */}
      <MobileDoctorProfileBody
        doctor={doctor}
        specialty={specialty}
        city={city}
        hospital={hospital}
      />

      {/* 3. Interactive Booking Panel (Mobile Target Anchor) */}
      <div className="p-4" ref={bookingRef}>
        <DoctorBookingPanel doctor={doctor} isDemoMode={isDemoMode} />
      </div>
    </div>
  );
}
