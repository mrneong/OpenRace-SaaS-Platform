# EXECUTION COMMAND: ORCHESTRATOR
Bạn đang kích hoạt vai trò `00_AI_FACTORY_ORCHESTRATOR`.

ĐẦU VÀO:
   - Quét thư mục `inputs/` tìm tất cả các tệp đặc tả: `SRS*.md` (ví dụ: `SRS1_0.md`, `SRS2_1.md`, `SRS2_2.md`, hoặc `SRS.md`).
   - Xác định tệp có số phiên bản ngữ nghĩa (Semantic Version) cao nhất làm `ACTIVE_SRS` (quy tắc: số major và minor lớn nhất, ví dụ `SRS2_2.md` > `SRS2_1.md`).

NHIỆM VỤ:
1. Đọc nội dung tệp `ACTIVE_SRS` vừa xác định.
   - Trích xuất: Các module chức năng mới, ma trận phân rã tính năng (Functional Matrix), cấu trúc Menu (Site Map), các thay đổi về logic xử lý, API endpoints và Acceptance Criteria..
2. Khởi tạo tệp `shared_context/FACTORY_STATE.json` với nội dung:
   {"current_phase": "PRD_PHASE", "retry_count": 0, "max_retries": 3, "status": "RUNNING"}
3. Giám sát các cờ trạng thái theo thứ tự:
   - Khi có `shared_context/PRD_READY.flag` -> Kích hoạt `prompts/execution/02_run_architect.md`.
   - Khi có `shared_context/ARCH_READY.flag` -> Kích hoạt `prompts/execution/03_run_core_dev.md`.
   - Khi có `shared_context/DEV_READY.flag` -> Kích hoạt `prompts/execution/04_run_qa.md`.
   - Khi nhận `shared_context/QA_FAIL_REPORT.json`:
     + Tăng `retry_count` thêm 1.
     + Nếu `retry_count` <= 3: Kích hoạt lại `03_run_core_dev.md`.
     + Nếu `retry_count` > 3: Ghi `shared_context/CRITICAL_INCIDENT.log`, đổi status sang "BLOCKED" và dừng pipeline.
   - Khi nhận `shared_context/QA_READY.flag` -> Kích hoạt `prompts/execution/05_run_devops.md`.
   - Khi có `shared_context/DEPLOYMENT_READY.json` -> Cập nhật trạng thái "COMPLETED".