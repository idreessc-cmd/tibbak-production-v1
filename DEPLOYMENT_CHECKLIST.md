# Tibbak Production Deployment & Release Checklist

This guide provides step-by-step instructions for deploying **طبّك (Tibbak)** to production environments (e.g. Vercel, AWS Amplify, Docker, or Node.js SSR hosts).

---

## 🛠️ System Requirements & Environment

- **Node.js**: `>=20.0.0` (Tested & verified against Node `v22.16.0` and `v20.x`).
- **Package Manager**: `npm` `v10.x` or `yarn` / `pnpm`.
- **Framework**: Next.js 15.1.4 (App Router with `next-intl` internationalization).

---

## ⚙️ Environment Variables Setup

Ensure the following environment variables are configured in your hosting provider settings:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=https://tibbak.com
NEXT_PUBLIC_DEFAULT_LOCALE=ar

# Demo Mode Flags (Optional for production presentation)
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

---

## 🚀 Pre-Deployment Quality Checks

Before pushing to production branches, run the following verification pipeline:

```bash
# 1. Type Safety Verification
npx tsc --noEmit

# 2. Linter Verification
npm run lint

# 3. Clean Production Build
npm run build
```

---

## ☁️ Deployment Pipeline Steps (Vercel Example)

1. **Import Repository**: Connect your Git repository to Vercel.
2. **Framework Preset**: Select **Next.js**.
3. **Build Command**: Set to `npm run build`.
4. **Output Directory**: Set to `.next`.
5. **Node Version**: Select **20.x** or **22.x** under Project Settings -> Node.js Version.
6. **Environment Variables**: Add `NEXT_PUBLIC_APP_URL`.
7. **Deploy**: Click Deploy and verify deployment logs.

---

## 🔍 Post-Deployment Smoke Tests

- [x] Verify Arabic root redirect (`/` → `/ar`).
- [x] Verify English route switching (`/en`).
- [x] Test search engine filtering (`/ar/search`).
- [x] Test doctor profile booking modal (`/ar/doctors/dr-firas-khatib`).
- [x] Test patient case ownership guard (`/ar/cases/CASE-2026-000154`).
- [x] Test doctor dashboard appointment authorization (`/ar/dashboard/doctor`).
- [x] Test admin operational audit logs (`/ar/dashboard/admin`).
