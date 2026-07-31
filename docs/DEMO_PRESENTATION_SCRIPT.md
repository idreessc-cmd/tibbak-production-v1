# Tibbak MVP Demo Presentation Script (8–12 Minutes)

This script provides a step-by-step presentation narrative for demonstrating the **طبّك (Tibbak)** MVP to stakeholders, investors, or evaluators.

---

## ⏱️ Timeline Overview

- **0:00 – 1:30**: Introduction & Core Value Proposition
- **1:30 – 3:30**: Patient Discovery, Search & Profile Inspection
- **3:30 – 5:00**: Booking Wizard & Case Creation
- **5:00 – 6:30**: Doctor Dashboard, Entitlement Gating & In-Platform Chat
- **6:30 – 8:00**: Admin Governance, Operational Status & Audit Log
- **8:00 – 9:30**: Privacy Model & Sponsorship Separation
- **9:30 – 11:00**: Technical Architecture & Deployment Readiness

---

## 🎬 Detailed Presentation Steps & Talking Points

### Step 1: Introduction & Homepage (0:00 – 1:30)
- **Route**: `http://localhost:3000/ar?demo=1`
- **Action**: Open home page in Arabic. Point out header navigation, language switcher, and demo banner.
- **Talking Point**: *"Welcome to Tibbak (طبّك), the specialized healthcare marketplace connecting patients in Jordan and the MENA region with top doctors and accredited hospitals. Notice our clean, modern design supporting full Arabic RTL and English LTR."*

### Step 2: Patient Search & Discovery (1:30 – 3:30)
- **Route**: `http://localhost:3000/ar/search?demo=1`
- **Action**: Type `"ألم بالركبة"` (Knee pain) in search box. Highlight autocomplete listing Orthopedic Surgery (`جراحة العظام والمفاصل`). Click Dr. Firas Al-Khatib.
- **Talking Point**: *"Patients can search by symptoms, specialties, or doctor names. Notice our verified badges, explicit sponsored campaign tags (`إعلان`), and accepted insurance badges. Crucially, direct patient contact details like phone or email are completely hidden from public pages."*

### Step 3: Booking Wizard & Case Creation (3:30 – 5:00)
- **Route**: `http://localhost:3000/ar/doctors/dr-firas-khatib?demo=1`
- **Action**: Click "حجز موعد" (Book Appointment). Select service, select date & slot, enter patient details, agree to consent, submit.
- **Talking Point**: *"The 4-step booking wizard creates a new case with initial status `waiting_doctor` and an appointment with status `requested`. Notice the generated incremental Case ID `CASE-2026-XXXXXX`."*

### Step 4: Doctor Dashboard & Entitlements (5:00 – 6:30)
- **Route**: `http://localhost:3000/ar/dashboard/doctor?demo=1`
- **Action**: Switch to Free Doctor persona (`doc-1`). Show first 3 cases accessible, 4th case locked with `CASE_ACCESS_LOCKED` prompt. Confirm appointment.
- **Talking Point**: *"In the Doctor Dashboard, free doctors get up to 3 lead details before encountering a plan lock. When a doctor confirms an appointment, our system executes an atomic transaction transitioning appointment status from `requested` to `scheduled` and case status to `accepted` then `appointment_scheduled`."*

### Step 5: Admin Governance & Audit Log (6:30 – 8:00)
- **Route**: `http://localhost:3000/ar/dashboard/admin?demo=1`
- **Action**: Show Verification Queue, Provider Operational Status, Sponsored Campaigns, and Audit Log. Suspend doctor `doc-3` and observe auto-pausing of active campaigns.
- **Talking Point**: *"Our Admin Panel gives platform operators total control over provider verification, operational status (active/suspended), subscription tiers, and sponsored campaigns. All admin actions generate append-only audit events with zero patient PII."*

### Step 6: Privacy Model & Sponsorship Separation (8:00 – 9:30)
- **Talking Point**: *"Tibbak enforces strict domain separation: subscription plans dictate internal features and case access limits, while sponsored placement campaigns dictate promotional search badges without altering organic quality rankings."*

### Step 7: Closing & Deployment Readiness (9:30 – 11:00)
- **Talking Point**: *"Tibbak is production-ready, featuring 31 static and SSG routes, complete TypeScript type safety, zero ESLint warnings, and WCAG 2.1 AA accessibility compliance."*

---

## 🛠️ Presenter Recovery Steps
- If demo state becomes dirty or unexpected: Navigate to Admin Dashboard (`/ar/dashboard/admin?demo=1`), switch to **Demo Settings** tab, click **Reset demo data**, and confirm. All baseline QA fixtures will be restored instantly.
