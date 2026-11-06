# EXECUTION COMMAND: DEVOPS & DOCS (V2.1 PACKAGING & DEPLOYMENT)
Bạn đang kích hoạt vai trò `05_DEVOPS_DOCS` cho dự án OpenRace SaaS Platform.

TIÊU CHUẨN ĐÓNG GÓI & TRIỂN KHAI:
- Frontend: Next.js 15 (Standalone output).
- Backend: NestJS (Production build with Node.js 20+ LTS).
- Cơ sở dữ liệu: PostgreSQL 16 (Supabase cloud hoặc PostgreSQL container nội bộ).
- Caching & Queuing: Redis 7.
- Containerization: Docker & Docker Compose.

ĐẦU VÀO:
- Mã nguồn và cấu hình tại `workspace/`.
- Kết quả kiểm thử thành công tại `shared_context/QA_STATUS.json`.

NHIỆM VỤ CHI TIẾT:
1. Đóng gói Container tại `workspace/`:
   - `Dockerfile.frontend`: Multi-stage build tối ưu cho Next.js 15 Standalone mode, giảm thiểu kích thước image.
   - `Dockerfile.backend`: Multi-stage build cho NestJS production, loại bỏ devDependencies, cấu hình non-root user.
   - `docker-compose.yml`: Điều phối toàn bộ các dịch vụ:
     * `backend`: Cổng 3001
     * `frontend`: Cổng 3000
     * `redis`: Cổng 6379 (phục vụ BullMQ và Token Bucket Governor)
     * `postgres`: Cổng 5432 (phục vụ môi trường Local Dev / Offline)

2. Khởi tạo tệp biến môi trường mẫu `.env.example`:
   ```env
   # ==========================================
   # OPENRACE SAAS PLATFORM V2.1 ENVIRONMENT
   # ==========================================

   # 1. Supabase & Database (PostgreSQL 16)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[REF].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # 2. Redis & Queues
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # 3. Strava API & Webhooks
   STRAVA_CLIENT_ID=your_client_id
   STRAVA_CLIENT_SECRET=your_client_secret
   STRAVA_VERIFY_TOKEN=openrace_webhook_secret_token
   STRAVA_WEBHOOK_CALLBACK_URL=https://api.openrace.app/api/webhooks/strava

   # 4. Backend NestJS
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=super_secure_jwt_secret_key_2026
   CORS_ORIGIN=http://localhost:3000

   # 5. Frontend Next.js
   PORT=3000
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```

3. Cập nhật `workspace/README.md`:
   - Hướng dẫn cài đặt phụ thuộc (`npm install`).
   - Hướng dẫn cấu hình kết nối Supabase và chạy migration.
   - Hướng dẫn chạy test tự động với Jest (`npm test`, `npm run test:cov`).
   - Hướng dẫn khởi chạy hệ thống bằng Docker Compose (`docker compose up -d`).

4. Phát tín hiệu nghiệm thu bàn giao:
   - Ghi `shared_context/DEPLOYMENT_READY.json`:
     ```json
     {
       "deployment_ready": true,
       "version": "2.1",
       "stack": {
         "frontend": "Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide Icons)",
         "backend": "NestJS (TypeScript, Clean Architecture)",
         "database": "PostgreSQL 16 on Supabase (RLS)",
         "caching_queue": "Redis 7 & BullMQ",
         "testing": "Jest"
       },
       "timestamp": "<ISO8601>"
     }
     ```
   - Tạo file cờ rỗng `shared_context/DEPLOYMENT_READY.flag`.
