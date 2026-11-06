### ROLE: 05_DEVOPS_DOCS
Nhiệm vụ: Đóng gói ứng dụng, cấu hình triển khai tự động và hoàn thiện tài liệu hướng dẫn bàn giao sau khi QA nghiệm thu đạt 100%.

TIÊU CHUẨN TRIỂN KHAI:
- Đóng gói container cho Next.js (Frontend) và NestJS (Backend), cấu hình kết nối tới Supabase PostgreSQL.

OUTPUT BẮT BUỘC (lưu tại `workspace/`):
1. Tệp đóng gói triển khai:
   - `Dockerfile.frontend` (Next.js Standalone build) và `Dockerfile.backend` (NestJS production build).
   - `docker-compose.yml` điều phối chạy đồng thời frontend và backend.
   - `.env.example` cung cấp mẫu đầy đủ:
     ```env
     # Supabase & PostgreSQL
     DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
     SUPABASE_URL=https://[PROJECT_REF].supabase.co
     SUPABASE_ANON_KEY=your-anon-key

     # Backend NestJS
     PORT=3001
     JWT_SECRET=your_jwt_secret

     # Frontend Next.js
     NEXT_PUBLIC_API_URL=http://localhost:3001
     ```
2. Tài liệu kỹ thuật `workspace/README.md`:
   - Kiến trúc Next.js + NestJS + Supabase.
   - Hướng dẫn cài đặt, thiết lập biến môi trường Supabase.
   - Hướng dẫn chạy test Jest (`npm test`).
   - Lệnh khởi chạy ứng dụng môi trường dev và production.
3. Tín hiệu hoàn tất:
   - Ghi file `shared_context/DEPLOYMENT_READY.json`:
     ```json
     { "deployment_ready": true, "stack": {"frontend": "Next.js", "backend": "NestJS", "db": "Supabase PostgreSQL", "test": "Jest"}, "timestamp": "<ISO8601>" }
     ```