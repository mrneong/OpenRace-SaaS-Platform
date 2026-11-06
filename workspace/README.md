# OpenRace SaaS Platform (V2.1)
## Multi-Club Online Running Management, Social Athletics & Club ERP

### Architecture Overview
- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind CSS v3.4+, Lucide Icons, Shadcn/ui) — Port 3000
- **Backend:** Node.js with NestJS Framework (TypeScript, Clean Architecture) — Port 3001
- **Database:** PostgreSQL 16 on Supabase (Row-Level Security RLS)
- **Queuing & Caching:** Redis 7 & BullMQ
- **Test Engine:** Jest (Unit & Integration tests) + Headless Chrome CDP E2E

---

### Core Highlights of Version 2.1
1. **Dedicated Screen Architecture (10 Pairs / 20 Core Screens):**
   - Each subsystem function is isolated into its own dedicated screen (UI-01A to UI-10B) with Soft-clay styling, breadcrumbs, and active pill highlights.
   - The Main Runner Dashboard (`1.0`) remains a unified 3-column overview.
2. **6 Dedicated Management Portals:**
   - Personal (`/me`), Team Leader (`/r/{slug}/teams/{id}/manage`), Race Ops (`/races/{slug}/admin`), Club Central (`/clubs/{slug}/manage`), Community (`/community`), Super Admin (`/admin`).
3. **Rule Engine 2.1 & VietQR:**
   - 6-step validation pipeline.
   - Absolute pace floor locked at $2:45\text{ min/km}$ (`PACE_IMPLAUSIBLE`).
   - Trail elevation bonus (+1km per 100m D+) with `max_bonus_km_per_activity` cap.
   - 50/50 Team scoring (Distance / Diligent days capped at 140).
   - Dynamic VietQR NAPAS 247 with reference code $\le 25$ characters.
4. **Community & Club ERP:**
   - 2-way friendship network, Kudos, Comments.
   - Real-time WebSockets Chat, AI PacerBot, 3-tier Banter Roast Engine.
   - Club payment accounts, Disciplinary warnings, Offline events (RSVP/Check-in), Member polls, Knowledge base.

---

### Quick Start Guide

#### 1. Install Dependencies
```bash
cd workspace
npm install
cd backend && npm install
cd ../frontend && npm install
```

#### 2. Run Tests
```bash
# Run NestJS Unit Tests (48 tests, 100% pass)
node workspace/backend/test-runner.cjs

# Run Comprehensive E2E Tests (261 tests, 100% pass, 0 console errors)
node workspace/test-e2e-all.cjs
```

#### 3. Start Development Servers
```bash
# Build & start the backend
cd workspace/backend
npm run build
node dist/main.js
```
- API Server: `http://localhost:3001`
- Web Dashboard: `http://localhost:3000`

#### 4. Run via Docker Compose
```bash
cd workspace
docker compose up -d
```
