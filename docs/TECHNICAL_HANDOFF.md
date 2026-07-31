# Technical Handoff Document — طبّك (Tibbak)

This document provides complete technical specifications, repository architecture, and code layout guidelines for developers maintaining **Tibbak**.

---

## 🏗️ Architecture Overview

- **Framework**: Next.js 15.1 (App Router) with `next-intl` localization.
- **Language**: TypeScript (`npx tsc --noEmit` clean).
- **Styling**: TailwindCSS with RTL/LTR directional support.
- **State Pattern**: Repository pattern with central demo storage envelopes (`readDemoStorage` / `writeDemoStorage`).

---

## 📂 Core Folder Structure

```
src/
├── app/[locale]/             # App Router pages (ar/en routes)
│   ├── cases/[id]/           # Patient case chat room page
│   ├── dashboard/
│   │   ├── admin/            # Admin operations dashboard
│   │   ├── doctor/           # Doctor portal dashboard
│   │   └── hospital/         # Hospital management dashboard
│   ├── doctors/              # Doctor directory & profile pages
│   └── search/               # Organic & sponsored search engine
├── components/               # React UI components
├── lib/
│   ├── appointments/         # Appointment status state machine
│   ├── audit/                # Append-only audit logger
│   ├── bookings/             # Atomic completeDemoBooking service
│   ├── demo/                 # Demo session storage & QA reset utilities
│   ├── providers/            # Provider operational status & availability rules
│   └── repositories/         # Cases, Bookings, Doctors, Hospitals repositories
└── types/                    # Core TypeScript domain types & DTO assertions
```

---

## 🔒 Privacy DTO Contracts

- **`ProviderCaseSummary`**: Structurally omits `patient_phone`, `patient_email`, `patient_files`, `attachments`, `maskedPhone`, `maskedEmail`.
- **`AdminCaseOperationalSummary`**: Structurally omits `patient_name`, `patient_reason`, `patient_phone`, `patient_email`, `messages`, `patient_files`, `attachments`.
- **`ProviderAttachmentMetadata`**: Contains safe metadata (`id`, `fileName`, `mimeType`, `sizeBytes`, `uploadedAt`, `category`) without raw files, base64, or storage paths.

---

## ⚡ Deployment & Quality Commands

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Lint Check
npm run lint

# 3. Clean Build
npm run build
```
