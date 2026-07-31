# Tibbak MVP Final Release Manifest

This manifest documents the exact release identity, specifications, build environment, and release decision for **طبّك (Tibbak)**.

---

## 📌 Release Metadata

- **Application Name**: طبّك | Tibbak
- **Release Identifier**: Tibbak MVP Demo
- **Version**: `0.1.0-mvp`
- **Release Status**: Presentation Release Candidate
- **Release Date**: July 30, 2026

---

## 🛠️ Build & Runtime Environment

- **Node.js Major Version**: `22.x` (Verified with Node `v22.16.0`)
- **Package Manager**: `npm` `v10.9.2` (Lockfile v3)
- **Framework**: Next.js `15.5.22` (Pinned exact release)
- **Primary Overrides**: `postcss` `8.5.25`, `sharp` `0.35.3`
- **Supported Locales**: Arabic (`ar` - Default), English (`en`)
- **Compiled App Routes**: 31 static and SSG routes

---

## 🛡️ Production Security Audit Summary

- **Production-audit status**: **0 Vulnerabilities** (`npm audit --omit=dev`)
- **Handoff Archive Name**: `tibbak-mvp-0.1.0-handoff.zip`
- **Handoff Checksum Sidecar**: `tibbak-mvp-0.1.0-handoff.zip.sha256`
- **Archive Verification**: Final archive integrity is verified through the external sidecar file: `tibbak-mvp-0.1.0-handoff.zip.sha256`
- **Production Vulnerability Summary**:
  - **Critical**: `0`
  - **High**: `0`
  - **Moderate**: `0`
  - **Low**: `0`
  - **Total Production Vulnerabilities**: `0` (100% Clean)

---

## 🚦 Final Release Decision

### **FINAL DECISION: GO FOR RELEASE** 🚀

All critical user journeys, privacy safeguards, subscription/campaign separations, hospital appointment ownership checks, and clean-install builds pass with zero production vulnerabilities.
