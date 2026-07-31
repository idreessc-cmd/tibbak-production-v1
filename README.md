# طبّك | Tibbak — MENA Healthcare Marketplace MVP

**Tibbak** is a specialized healthcare marketplace platform engineered for the Middle East and North Africa (MENA) region. It connects patients with verified medical specialists and accredited hospitals for domestic and international care.

---

## 📌 Release Details

- **Release Name**: Tibbak MVP Demo
- **Version**: `0.1.0-mvp`
- **Node.js Requirement**: `22.x` (Tested against Node `v22.16.0`)
- **Framework**: Next.js `15.5.22` (App Router)
- **Supported Locales**: Arabic (`ar` - Default) and English (`en`)

---

## ⚡ Quick Start & Development

```bash
# 1. Clean Installation
npm ci

# 2. Start Local Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🧪 Verification & Build Pipeline

```bash
# Type Safety Verification
npx tsc --noEmit

# Linter Verification
npm run lint

# Production Security Audit
npm audit --omit=dev

# Production Build
npm run build
```

---

## 🔒 Security & Privacy Model

- **Production Security**: `npm audit --omit=dev` reports **0 Critical, 0 High, 0 Moderate, 0 Low** vulnerabilities.
- **Privacy-by-Design**: Contact details (`patient_phone`, `patient_email`, raw attachments) are structurally excluded from provider responses (`ProviderCaseSummary`) and admin views (`AdminCaseOperationalSummary`).
- **Organic Ranking Independence**: Organic search ranking is strictly independent of commercial plan upgrades or paid sponsored campaigns.

---

## 📑 Documentation Index

See [docs/README.md](docs/README.md) for the complete documentation catalog including:
- `FINAL_RELEASE_MANIFEST.md`
- `DEPENDENCY_RISK_REGISTER.md`
- `EXECUTIVE_PRODUCT_BRIEF.md`
- `TECHNICAL_HANDOFF.md`
- `DEMO_PRESENTATION_SCRIPT.md`
- `PRODUCTION_ROADMAP.md`
- `DEPLOYMENT_CHECKLIST.md`
