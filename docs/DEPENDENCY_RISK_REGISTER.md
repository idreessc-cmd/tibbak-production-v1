# Tibbak Dependency Risk Register

This document tracks all development-tool dependency advisories identified during the release audit. 

---

## 🛡️ Production Dependency Security Guarantee

Running `npm audit --omit=dev --json` confirms **0 Critical, 0 High, 0 Moderate, 0 Low** vulnerabilities in production runtime dependencies.

---

## 📋 Development-Only Vulnerability Inventory

The following 9 high-severity findings are isolated within build-time development tools (`devDependencies`) and do not enter the production deployment bundle.

| Package | Severity | Dependency Path | Dev-Only Confirmation | Production Runtime Reachability | Current Decision | Target Action |
|---|---|---|---|---|---|---|
| `@eslint/eslintrc` | High | `eslint` -> `@eslint/eslintrc` | **Yes** | **Unreachable** | Accept for MVP Demo | Upgrade ESLint in Phase 1 |
| `eslint-config-next` | High | `eslint-config-next` (canary codemod) | **Yes** | **Unreachable** | Accept for MVP Demo | Migrate to ESLint CLI in Phase 1 |

---

## 🔐 Risk Rationale & Strategy

1. **No Production Exposure**: Development tools execute only during developer linting and CI builds.
2. **Build Safety**: No developer tool code is packaged into Next.js `.next` production server bundles.
3. **Phase 1 Plan**: In Production Phase 1, dev dependencies will be updated to Next.js 16 / ESLint 9 native configs.
