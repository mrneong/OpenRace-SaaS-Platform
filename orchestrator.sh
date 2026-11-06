#!/usr/bin/env bash

# ==============================================================================
# AI SOFTWARE FACTORY - AUTONOMOUS ORCHESTRATOR
# Cơ chế: Quét cờ trạng thái (Flags) & Quản lý vòng lặp sửa lỗi tự động (State Machine)
# ==============================================================================

set -euo pipefail

# Khởi tạo các đường dẫn thư mục
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTEXT_DIR="${BASE_DIR}/shared_context"
WORKSPACE_DIR="${BASE_DIR}/workspace"
PROMPTS_DIR="${BASE_DIR}/prompts/execution"
INPUTS_DIR="${BASE_DIR}/inputs"

# Thiết lập giới hạn Retry
MAX_RETRIES=3
POLL_INTERVAL=2

# Tạo thư mục nếu chưa tồn tại
mkdir -p "${CONTEXT_DIR}" "${WORKSPACE_DIR}" "${INPUTS_DIR}"

# Hàm cập nhật trạng thái JSON
update_state() {
    local phase="$1"
    local status="$2"
    local retries="$3"
    cat <<EOF > "${CONTEXT_DIR}/FACTORY_STATE.json"
{
  "current_phase": "${phase}",
  "status": "${status}",
  "retry_count": ${retries},
  "max_retries": ${MAX_RETRIES},
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# Hàm chạy một prompt/agent cụ thể
# Lưu ý: Thay đổi lệnh gọi LLM CLI (ví dụ: gemini-cli, cursor, llm) theo môi trường runtime thực tế của bạn
run_agent() {
    local agent_prompt="$1"
    echo -e "\n[ORCHESTRATOR] >>> Kích hoạt Agent: ${agent_prompt}"
    
    if [ ! -f "${agent_prompt}" ]; then
        echo "[ERROR] Không tìm thấy tệp prompt: ${agent_prompt}"
        exit 1
    fi

    # Ví dụ lệnh kích hoạt CLI: llm -s "$(cat "${agent_prompt}")"
    # Giả lập hoặc tích hợp API gọi thực thi prompt tương ứng:
    echo "[ORCHESTRATOR] Đang nạp lệnh từ ${agent_prompt} vào Execution Runtime..."
}

# Hàm chờ xuất hiện tệp cờ
wait_for_flag() {
    local flag_file="$1"
    local phase_name="$2"
    echo -n "[ORCHESTRATOR] Đang đợi hoàn thành ${phase_name} (chờ cờ: $(basename "${flag_file}"))..."
    while [ ! -f "${flag_file}" ]; do
        echo -n "."
        sleep "${POLL_INTERVAL}"
    done
    echo " [ĐÃ XONG]"
}

# ==============================================================================
# BẮT ĐẦU QUY TRÌNH ĐIỀU PHỐI (PIPELINE)
# ==============================================================================

echo "=========================================================="
echo "      AI SOFTWARE FACTORY: KHỞI ĐỘNG CHUỖI TỰ ĐỘNG        "
echo "=========================================================="

# 0. Kiểm tra tài liệu đầu vào
if [ ! -f "${INPUTS_DIR}/SRS.md" ]; then
    echo "[ERROR] Thiếu tài liệu đặc tả ${INPUTS_DIR}/SRS.md để bắt đầu quy trình!"
    exit 1
fi

RETRY_COUNT=0
update_state "INIT" "RUNNING" "${RETRY_COUNT}"

# 1. PHA PHÂN TÍCH YÊU CẦU (01_PO_BA)
update_state "PRD_PHASE" "RUNNING" "${RETRY_COUNT}"
rm -f "${CONTEXT_DIR}/PRD_READY.flag"
run_agent "${PROMPTS_DIR}/01_run_po_ba.md"
wait_for_flag "${CONTEXT_DIR}/PRD_READY.flag" "01_PRODUCT_OWNER_AND_BA"

# 2. PHA THIẾT KẾ HỆ THỐNG (02_SYSTEM_ARCHITECT)
update_state "ARCH_PHASE" "RUNNING" "${RETRY_COUNT}"
rm -f "${CONTEXT_DIR}/ARCH_READY.flag"
run_agent "${PROMPTS_DIR}/02_run_architect.md"
wait_for_flag "${CONTEXT_DIR}/ARCH_READY.flag" "02_SYSTEM_ARCHITECT"

# 3. VÒNG LẶP LẬP TRÌNH VÀ KIỂM THỬ (03_CORE_DEV & 04_QA_AND_TEST)
while true; do
    update_state "DEV_PHASE" "RUNNING" "${RETRY_COUNT}"
    rm -f "${CONTEXT_DIR}/DEV_READY.flag"
    run_agent "${PROMPTS_DIR}/03_run_core_dev.md"
    wait_for_flag "${CONTEXT_DIR}/DEV_READY.flag" "03_CORE_SOFTWARE_ENGINEER"

    # Chuyển tiếp sang QA
    update_state "QA_PHASE" "RUNNING" "${RETRY_COUNT}"
    rm -f "${CONTEXT_DIR}/QA_READY.flag"
    run_agent "${PROMPTS_DIR}/04_run_qa.md"

    # Vòng lặp kiểm tra kết quả QA (chờ QA_READY.flag hoặc QA_FAIL_REPORT.json)
    echo -n "[ORCHESTRATOR] Đang đợi kết quả thẩm định từ 04_QA..."
    while true; do
        if [ -f "${CONTEXT_DIR}/QA_READY.flag" ]; then
            echo " [QA PASS]"
            break 2 # Thoát khỏi toàn bộ vòng lặp Dev-QA
        fi

        if [ -f "${CONTEXT_DIR}/QA_FAIL_REPORT.json" ]; then
            echo " [QA FAIL]"
            RETRY_COUNT=$((RETRY_COUNT + 1))
            
            if [ "${RETRY_COUNT}" -gt "${MAX_RETRIES}" ]; then
                echo -e "\n[CRITICAL ERROR] Quá giới hạn thử lại (${MAX_RETRIES} lần). Dừng hệ thống!"
                update_state "BLOCKED" "FAILED" "${RETRY_COUNT}"
                cat <<EOF > "${CONTEXT_DIR}/CRITICAL_INCIDENT.log"
Incident Report: Vòng lặp kiểm thử thất bại vượt quá số lần tối đa (${MAX_RETRIES}).
Chi tiết lỗi tại: ${CONTEXT_DIR}/QA_FAIL_REPORT.json
Thời gian ghi nhận: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF
                exit 1
            fi
            
            echo "[ORCHESTRATOR] Phát hiện lỗi kiểm thử! Kích hoạt lại Core Dev (Lần thử lại: ${RETRY_COUNT}/${MAX_RETRIES})..."
            update_state "DEV_PHASE_RETRY" "RUNNING" "${RETRY_COUNT}"
            break # Quay lại đầu vòng lặp để Core Dev sửa lỗi
        fi

        echo -n "."
        sleep "${POLL_INTERVAL}"
    done
done

# 4. PHA ĐÓNG GÓI VÀ TÀI LIỆU (05_DEVOPS_DOCS)
update_state "DEVOPS_PHASE" "RUNNING" "${RETRY_COUNT}"
rm -f "${CONTEXT_DIR}/DEPLOYMENT_READY.json"
run_agent "${PROMPTS_DIR}/05_run_devops.md"

echo -n "[ORCHESTRATOR] Chờ DevOps hoàn tất đóng gói và bàn giao..."
while [ ! -f "${CONTEXT_DIR}/DEPLOYMENT_READY.json" ]; do
    echo -n "."
    sleep "${POLL_INTERVAL}"
done
echo " [HOÀN TẤT]"

# 5. KẾT THÚC PIPELINE
update_state "COMPLETED" "SUCCESS" "${RETRY_COUNT}"
echo -e "\n=========================================================="
echo "   QUY TRÌNH HOÀN THÀNH 100%! HỆ THỐNG ĐÃ SẴN SÀNG BÀN GIAO"
echo "=========================================================="