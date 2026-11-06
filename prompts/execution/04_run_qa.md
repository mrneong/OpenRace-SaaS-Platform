# EXECUTION COMMAND: QA & TEST AUTOMATION (V2.1 TEST SUITES & VERIFICATION)
Bạn đang kích hoạt vai trò `04_QA_AND_TEST_AUTOMATION` cho dự án OpenRace SaaS Platform.

TIÊU CHUẨN KIỂM THỬ BẮT BUỘC:
- Công cụ: Jest (Unit test & Integration test cho cả Frontend và Backend).
- Ngưỡng đạt chuẩn: Pass 100% test cases, Code Coverage >= 80%, và 0 lỗi JavaScript Console trong trình duyệt.

ĐẦU VÀO:
- Mã nguồn và test suites tại `workspace/` (NestJS backend & Next.js frontend).
- Danh sách Acceptance Criteria chuẩn Gherkin tại `shared_context/PRD.json`.

NHIỆM VỤ KIỂM THỬ TOÀN DIỆN:
1. Chạy Linter và Jest Test Runner:
   - `npm run lint` kiểm tra chuẩn cú pháp TypeScript.
   - `npm run test:cov` (hoặc `npx jest --coverage`) chạy toàn bộ các test suite.

2. Đối soát 100% các tiêu chí nghiệm thu Acceptance Criteria (AC-001 đến AC-042+) từ PRD:
   - `AC-001 -> AC-007`: Rule Engine (Chuẩn 5km, Dưới cự ly tối thiểu, Pace > trần có/không Trail Gain, Sàn Pace 2:45 min/km vi phạm `PACE_IMPLAUSIBLE`, Giới hạn ngày, Chống trùng lặp).
   - `AC-008`: Chu kỳ tuần & Phạt tuần (Tính tỷ lệ Prorate, ân hạn 6 giờ, cảnh báo $< 48$h).
   - `AC-009`: Bảng xếp hạng Đội (Tỷ lệ 50/50 Cự ly & Chuyên cần trần 140 ngày, Đội Hạng 1 vs Đồng Hạng 2).
   - `AC-010`: Tài chính & VietQR (Bậc quỹ 100k/200k, sinh mã VietQR nội dung $\le 25$ ký tự).
   - `AC-011`: Webhook Ingestion (Phản hồi nhanh $< 200$ms, Token Bucket, Raw sync logs).
   - `AC-012 -> AC-017`: Khiếu nại, Đối soát nộp quỹ, Cấp miễn trừ phạt, Vòng đời giải đấu, Recompute toàn sàn.
   - `AC-020 -> AC-034`: Kiểm thử 20 màn hình giao diện (Cặp 1 đến Cặp 10), Breadcrumb banner, Sub-nav pills switcher, Single Screen isolation, Modal nghiệp vụ, In-App browser detour, Đồng thuận kép.
   - `AC-035 -> AC-042`: V2 Community & Governance:
     * Tự phục vụ ngắt/nối Strava & Raw sync logs.
     * 3 Phạm vi giải đấu (Nội bộ, Cộng đồng, Chỉ định Whitelist) & Khóa sĩ số.
     * Quyền năng Đội trưởng (Đổi tên đội, Avatar cờ hiệu, Roster matrix, Đôn đốc thi đua).
     * Mạng xã hội: Đồ thị bạn bè 2 chiều, Kudos, Bình luận, Real-time Chat WebSockets, Banter Engine.
     * Điều hành CLB ERP: Cài đặt VietQR BIN CLB, Quản trị thành viên, Cảnh báo kỷ luật, Buổi chạy Offline RSVP/Check-in, Biểu quyết nội bộ, Kho giáo án tri thức.

3. Điều phối trạng thái:
   - NẾU PASS 100% & Coverage >= 80%:
     + Ghi `shared_context/QA_STATUS.json`:
       ```json
       {
         "status": "PASS",
         "test_engine": "Jest",
         "total_tests": "<number>",
         "passed": "<number>",
         "coverage_percentage": "<percent>",
         "verified_version": "2.1",
         "browser_console_errors": 0
       }
       ```
     + Xóa `shared_context/DEV_READY.flag`.
     + Tạo file rỗng `shared_context/QA_READY.flag`.
   - NẾU FAIL:
     + Trích xuất chính xác tên test case fail, file nguồn, line number và stack trace.
     + Ghi `shared_context/QA_FAIL_REPORT.json` chi tiết nguyên nhân.
     + Xóa `shared_context/DEV_READY.flag` để chuyển giao lại cho Core Engineer sửa lỗi.
