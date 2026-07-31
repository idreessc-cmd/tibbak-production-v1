# Tibbak Production Migration Roadmap

This document outlines the multi-phase roadmap for transitioning **طبّك (Tibbak)** from the presentation MVP demo to full production infrastructure.

---

## 📍 Current Phase: MVP Presentation Demo

- **Data Layer**: In-memory repository simulation with 24-hour expiration envelopes (`sessionStorage`).
- **Authentication**: Simulated demo session helpers (`setDemoPatientSession`).
- **Payment & SMS**: Fictional UI state triggers (`?demo=1`).
- **Security**: Client-side entitlement guards and DTO type assertions. Production dependency audit is **100% Clean (0 vulnerabilities)**.

---

## 🚀 Production Phase 1: Core Backend & Database Infrastructure

- **Database**: Transition to Supabase PostgreSQL database.
- **Row-Level Security (RLS)**: Enforce provider case access and patient ownership via PostgreSQL RLS policies.
- **Authentication**: Integrate Supabase Auth (JWT tokens, passwordless SMS/email OTP).
- **Secure File Storage**: Supabase Storage buckets with signed private URLs for medical records.
- **Backend Repositories**: Replace in-memory arrays with server-side API routes and PostgreSQL queries.

---

## 💳 Production Phase 2: Commercial & Operations Automation

- **Payments**: Integrate Stripe / Tap Payments for subscription upgrades and campaign funding.
- **Real Messaging & SMS**: Integrate Twilio / Unifonic for SMS notifications and WhatsApp appointment reminders.
- **Hospital Organization Accounts**: Multi-user staff role management for accredited hospitals.

---

## 📱 Production Phase 3: Mobile & Enterprise Scaling

- **Mobile Applications**: React Native / Flutter mobile applications for patients and doctors.
- **Advanced Medical Tourism**: End-to-end flight, hotel, and hospital concierge integration.
- **Analytics & Moderation**: Enterprise reporting and AI-assisted content moderation.
