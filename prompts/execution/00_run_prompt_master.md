### COMMAND: EXECUTE 00_PROMPT_MASTER

Hãy kích hoạt vai trò `00_PROMPT_MASTER` để đồng bộ toàn bộ hệ thống prompt theo tài liệu đặc tả phiên bản mới nhất:

1. QUÉT & XÁC ĐỊNH PHIÊN BẢN (VERSION DISCOVERY):
   - Quét thư mục `inputs/` tìm tất cả các tệp đặc tả: `SRS*.md` (ví dụ: `SRS1_0.md`, `SRS2_1.md`, `SRS2_2.md`, hoặc `SRS.md`).
   - Xác định tệp có số phiên bản ngữ nghĩa (Semantic Version) cao nhất làm `ACTIVE_SRS` (quy tắc: số major và minor lớn nhất, ví dụ `SRS2_2.md` > `SRS2_1.md`).

2. PHÂN TÍCH THAY ĐỔI & RÀ SOÁT YÊU CẦU:
   - Đọc chi tiết nội dung tệp `ACTIVE_SRS` vừa xác định.
   - Trích xuất: Các module chức năng mới, ma trận phân rã tính năng (Functional Matrix), cấu trúc Menu (Site Map), các thay đổi về logic xử lý, API endpoints và Acceptance Criteria.

3. KHÓA CỨNG TIÊU CHUẨN KỸ THUẬT (STRICT TECH STACK - CẤM DÙNG PYTHON):
   - Frontend: Next.js (App Router, TypeScript, Tailwind CSS, Lucide Icons).
   - Backend: Node.js với NestJS Framework (TypeScript, Clean/Modular Architecture).
   - Database: PostgreSQL trên Supabase (Prisma ORM hoặc Supabase JS Client).
   - Testing: Jest (cho cả backend và frontend, coverage >= 80%).

4. CẬP NHẬT ĐỒNG BỘ TOÀN BỘ PROMPT THỰC THI (`prompts/execution/`):
   - `01_run_po_ba.md`: Bổ sung chỉ dẫn BA phân rã Menu Tree (Lucide Icons, Tailwind CSS), Function Specifications và xuất `PRD.md` + `PRD.json`.
   - `02_run_architect.md`: Cập nhật schema Supabase PostgreSQL, cấu trúc module NestJS và Next.js App Router theo các tính năng mới.
   - `03_run_core_dev.md`: Cập nhật danh sách các module NestJS, DTOs và UI components cần viết mã nguồn (TypeScript) và Unit Test.
   - `04_run_qa.md`: Cập nhật test suites Jest bám sát danh sách Acceptance Criteria mới.
   - `05_run_devops.md`: Cập nhật cấu hình Docker, biến môi trường `.env.example` và README.

5. XUẤT BÁO CÁO VÀ PHÁT TÍN HIỆU CỜ:
   - Ghi file `shared_context/VERSION_MANIFEST.json` ghi nhận phiên bản SRS đã chọn và danh sách prompt đã đồng bộ.
   - Tạo file cờ rỗng `shared_context/PROMPTS_SYNCED.flag` để thông báo hoàn thành giai đoạn đồng bộ.