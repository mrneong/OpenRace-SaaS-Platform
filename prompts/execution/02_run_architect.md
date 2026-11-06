# EXECUTION COMMAND: SYSTEM ARCHITECT (V2.1 ARCHITECTURE & DATA DESIGN)
Bạn đang kích hoạt vai trò `02_SYSTEM_ARCHITECT` cho dự án OpenRace SaaS Platform.

TIÊU CHUẨN KỸ THUẬT BẮT BUỘC (STRICT TECH STACK - CẤM DÙNG PYTHON):
- Frontend: Next.js 15 (App Router, TypeScript, Tailwind CSS v3.4+, Lucide Icons, Shadcn/ui).
- Backend: Node.js với NestJS Framework (TypeScript, Clean Architecture / Hexagonal Architecture).
- Database: PostgreSQL 16 trên Supabase (Prisma ORM hoặc Supabase JS Client, kích hoạt Row-Level Security RLS).
- Caching & Queuing: Redis 7, BullMQ (Webhook Ingestion Queue, Recompute Workers).
- Testing: Jest (ts-jest, coverage >= 80%).

ĐẦU VÀO:
- `shared_context/PRD.md` và `shared_context/PRD.json` (tương ứng với `inputs/SRS2_1.md`).

NHIỆM VỤ CHI TIẾT CỦA ARCHITECT:
1. Thiết kế cấu trúc Monorepo chia tách rõ ràng 2 dịch vụ (`frontend/` và `backend/`) trong `workspace/`:
   - `workspace/frontend/`: Next.js 15 App Router tổ chức theo 10 Cặp màn hình / 20 core screens:
     - `/` (UI-01A Dashboard) & `/me/strava-sync` (UI-01B Sync Logs)
     - `/races` (UI-02A Race Hub) & `/r/[slug]` (UI-02B Arena & SSE Stream)
     - `/activities` (UI-03A Activity Feed) & `/activities/[id]` (UI-03B Audit & Appeal)
     - `/c/[slug]` (UI-04A Club Portal) & `/join/[token]` (UI-04B In-App Detour & Join)
     - `/r/[slug]/my-finance` (UI-05A Debt VietQR) & `/r/[slug]/finance/reconcile` (UI-05B Admin Reconcile)
     - `/clubs/[slug]/races-manage` (UI-06A Race List) & `/clubs/[slug]/races/wizard` (UI-06B 7-Step Wizard)
     - `/r/[slug]/teams` (UI-07A Team Directory) & `/r/[slug]/teams/[id]/manage` (UI-07B Captain Portal)
     - `/community/feed` (UI-08A Social Feed) & `/community/friends` (UI-08B Friends Graph)
     - `/chat` (UI-09A Real-time Chat) & `/clubs/[slug]/banter-settings` (UI-09B Banter Engine Config)
     - `/clubs/[slug]/manage` (UI-10A Club Governance) & `/clubs/[slug]/governance` (UI-10B ERP & Events)
   - `workspace/backend/`: NestJS Framework thiết kế theo Clean / Modular Architecture:
     - `AuthModule` (Supabase Auth / JWT, Contextual RBAC Guards)
     - `StravaGatewayModule` (OAuth2, Token Bucket Governor, Webhook Ingestion, Raw Sync Logs)
     - `RuleEngineModule` (Pipeline 6 bước thuần túy, Sàn Pace 2:45, Thưởng Trail + Max Bonus)
     - `ScoringModule` (Team scoring 50/50, Tied rank 2, SSE Live Stream broadcast)
     - `CyclePenaltyModule` (Weekly target, 6h grace period, Prorate calculation, Warning banners)
     - `FinanceModule` (Immutable ledger, VietQR generation $\le 25$ chars, Payment reconciliation)
     - `TeamManagementModule` (Captain identity customization, Team roster matrix, Reminders)
     - `CommunityModule` (2-way Friendship graph, Social feed, Kudos, Comments)
     - `ChatModule` (WebSockets Gateway, AI PacerBot assistant, 3-tier Banter Engine)
     - `ClubGovernanceModule` (Club bank accounts, Member management, Disciplinary warnings, Events RSVP, Polls, Knowledge base)

2. Thiết kế lược đồ Cơ sở dữ liệu PostgreSQL 16 (Supabase):
   - 18+ Bảng dữ liệu: `users`, `clubs`, `club_payment_accounts`, `club_members`, `races`, `race_rules`, `race_whitelists`, `teams`, `race_participants`, `activities`, `activity_logs`, `appeals`, `ledger_entries`, `penalty_waivers`, `strava_sync_logs`, `friendships`, `kudos`, `comments`, `chat_messages`, `club_events`, `club_polls`, `poll_votes`.
   - Chính sách Row-Level Security (RLS) bảo mật đa khách hàng (`club_id`) và dữ liệu nhạy cảm tài chính.

3. Thiết kế OpenAPI / Swagger RESTful Contracts và SSE Event Schemas cho 20 màn hình.

4. Xuất các file bắt buộc:
   - `shared_context/ARCHITECTURE.md`: Tài liệu kiến trúc toàn diện kèm sơ đồ ERD, Data Dictionary, API Spec và Component Hierarchy.
   - `workspace/init_scaffold.sh`: Script tự động khởi tạo cấu trúc thư mục và cấu hình `package.json`, `tsconfig.json`, `tailwind.config.ts`, `jest.config.ts`.

5. Phát tín hiệu:
   - Tạo file cờ rỗng `shared_context/ARCH_READY.flag`.
