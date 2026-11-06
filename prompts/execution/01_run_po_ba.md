# EXECUTION COMMAND: PO & BA AGENT (V2.1 FULL SPECIFICATION)
Bạn đang kích hoạt vai trò `01_PRODUCT_OWNER_AND_BA` cho dự án OpenRace SaaS Platform.

TIÊU CHUẨN KỸ THUẬT CỐ ĐỊNH (STRICT TECH STACK - CẤM DÙNG PYTHON):
- Frontend: Next.js 15 (App Router, TypeScript, Tailwind CSS v3.4+, Lucide Icons, Shadcn/ui).
- Backend: Node.js với NestJS Framework (TypeScript, Clean/Modular Architecture).
- Database: PostgreSQL 16 trên Supabase (Prisma ORM hoặc Supabase JS Client, RLS).
- Testing: Jest (Unit test & Integration test với ts-jest, coverage >= 80%).

TÀI LIỆU ĐẦU VÀO ĐƯỢC CHỌN (ACTIVE_SRS):
- `inputs/SRS2_1.md` (Phiên bản 2.1: Full Community, Dual-Screen Architecture & Club Governance).

NHIỆM VỤ CHI TIẾT CỦA BA:
1. Đọc và phân tích toàn diện `inputs/SRS2_1.md`:
   - Trích xuất 10 Cặp màn hình chức năng (20 Màn hình lõi: UI-01A đến UI-10B).
   - Phân rã Ma trận phân quyền ngữ cảnh (Contextual RBAC) cho 5 vai trò: Super Admin (`SA`), Club Admin (`CA`), Team Leader (`TL`), Runner/Member (`RN`), Guest.
   - Bóc tách chi tiết 6 Bộ công cụ quản lý chuyên biệt (Dedicated Management Portals):
     1. Personal Management Portal (`/me`)
     2. Team Management Portal (`/r/{slug}/teams/{id}/manage`)
     3. Race Operations Portal (`/races/{slug}/admin`)
     4. Club Operations Portal (`/clubs/{slug}/manage`)
     5. Community Hub (`/community`)
     6. Super Admin Portal (`/admin`)
   - Đặc tả Cây Menu điều hướng toàn sàn chuẩn Lucide Icons và Tailwind CSS classes.
   - Trích xuất toàn bộ quy tắc Rule Engine 2.1: Pipeline thẩm định 6 bước, Sàn pace kỹ thuật 2:45 min/km, Công thức thưởng Trail leo dốc có trần `max_bonus_km_per_activity`, 2 chiến lược tính điểm đội (Tổng điểm vs Bình quân), chu kỳ tuần, thời gian ân hạn 6 giờ, tính tỷ lệ `prorate`, và sổ nợ VietQR động ($\le 25$ ký tự).
   - Trích xuất danh mục các tính năng mạng xã hội: Đồ thị bạn bè 2 chiều, Kudos, Bình luận, Kênh chat WebSockets, AI PacerBot và Banter Engine trêu chọc thi đua.
   - Trích xuất phân hệ ERP điều hành CLB: Quản lý tài khoản VietQR BIN CLB, Cảnh báo kỷ luật thành viên, Lịch sự kiện/buổi chạy Offline có RSVP & Check-in, Biểu quyết nội bộ (Polls), Kho giáo án tri thức.

2. Xuất bản tài liệu chuẩn hóa vào `shared_context/`:
   - `shared_context/PRD.md`: Bản đặc tả yêu cầu chi tiết, bao quát toàn bộ 20 màn hình, luồng nghiệp vụ, biểu mẫu, quy tắc thẩm định và trải nghiệm người dùng.
   - `shared_context/PRD.json`: Cấu trúc JSON chuẩn hóa chứa toàn bộ các tiêu chí nghiệm thu Acceptance Criteria (từ AC-001 đến AC-042+) định dạng Gherkin phục vụ trực tiếp cho QA Automation kiểm thử tự động.

3. Phát tín hiệu hoàn thành:
   - Tạo file cờ rỗng `shared_context/PRD_READY.flag`.
