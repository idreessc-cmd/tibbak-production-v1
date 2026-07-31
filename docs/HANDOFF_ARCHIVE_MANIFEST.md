# Tibbak Handoff Archive Manifest

This document records the exact manifest of files and directories included in the official release package **`tibbak-mvp-0.1.0-handoff.zip`**.

---

## 📌 Archive Metadata & Integrity
- **Archive Name**: `tibbak-mvp-0.1.0-handoff.zip`
- **Sidecar File**: `tibbak-mvp-0.1.0-handoff.zip.sha256`
- **Integrity Statement**: Final archive integrity is verified through the external sidecar file: `tibbak-mvp-0.1.0-handoff.zip.sha256`

---

## 📁 Included File & Directory Manifest

### 1. Root Configuration & Project Files
- `package.json` — Project metadata, pinned `next@15.5.22` dependency, overrides, and scripts.
- `package-lock.json` — Lockfile v3 reproducible dependency tree.
- `README.md` — Project overview, installation, quality check, and build instructions.
- `RELEASE_NOTES.md` — Version 0.1.0-mvp release notes and feature summaries.
- `PRODUCTION_ROADMAP.md` — Multi-phase migration roadmap (MVP vs Phase 1-3).
- `DEPLOYMENT_CHECKLIST.md` — Production deployment checklist and hosting setup instructions.
- `.env.example` — Safe environment variable placeholders.
- `next.config.ts` — Next.js configuration.
- `tsconfig.json` — TypeScript configuration.
- `tailwind.config.ts` — TailwindCSS configuration.
- `postcss.config.mjs` — PostCSS configuration.
- `eslint.config.mjs` — ESLint flat configuration.
- `middleware.ts` — `next-intl` locale routing middleware.
- `next-env.d.ts` — Next.js TypeScript definitions.

### 2. Application Source Code (`src/`)
- `src/app/[locale]/` — All 31 application routes (Arabic & English).
- `src/components/` — UI components (admin, booking, doctor, hospital, search, layout).
- `src/lib/` — Domain modules (appointments, audit, bookings, demo, providers, repositories, search, subscriptions).
- `src/types/` — TypeScript domain types, DTO contracts, and compile-time assertions.
- `src/data/` — Fictional mock baseline data datasets.
- `src/i18n/` — Routing and locale configuration.

### 3. Localization & Assets (`messages/`, `public/`)
- `messages/ar.json` & `messages/en.json` — Complete translation dictionaries.
- `public/` — Public static assets and icons.

### 4. Technical Documentation (`docs/`)
- `docs/README.md` — Master documentation index.
- `docs/FINAL_RELEASE_MANIFEST.md` — Release identity, specs, and Go decision.
- `docs/HANDOFF_ARCHIVE_MANIFEST.md` — Archive file inventory and checksum record.
- `docs/DEPENDENCY_RISK_REGISTER.md` — Development-only dependency risk register.
- `docs/EXECUTIVE_PRODUCT_BRIEF.md` — Executive brief, value proposition, and revenue models.
- `docs/TECHNICAL_HANDOFF.md` — Technical handoff and architecture guide.
- `docs/DEMO_PRESENTATION_SCRIPT.md` — Executive & full demo presentation scripts.
- `docs/DAY6_RELEASE_HARDENING_AUDIT.md` — Day 6 release security audit.
- `docs/CLIENT_STORAGE_AUDIT.md` — Client storage data classification & expiry.
- `docs/ACCESSIBILITY_AUDIT.md` — WCAG 2.1 AA manual testing evidence.
- `docs/ROUTE_INVENTORY.md` — 31-route application inventory.
- `docs/DEMO_RESET_MATRIX.md` — QA fixture and demo reset matrix.
- `docs/RELEASE_CHECKLIST.md` — Pre-release verification checklist.

---

## 🚫 Excluded Files & Folders

- `node_modules/`
- `.next/`
- `.git/`
- `.env` / `.env.local`
- Local logs and temporary build artifacts
