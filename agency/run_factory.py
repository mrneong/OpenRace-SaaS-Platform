import os
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROMPTS_DIR = BASE_DIR / "system_prompts"
SHARED_CONTEXT = BASE_DIR / "shared_context"

def load_prompt(agent_filename: str) -> str:
    with open(PROMPTS_DIR / agent_filename, "r", encoding="utf-8") as f:
        return f.read()

def run_pipeline(user_goal: str):
    print(f"[*] Khởi động AI Factory cho mục tiêu: {user_goal}")
    
    # 1. Giai đoạn Phân tích
    print("\n[Phase 1] 01_PO_AGENT: Soạn thảo PRD...")
    # Gọi Agent qua Antigravity API / LLM SDK
    # Output ghi vào SHARED_CONTEXT / "PRD.md"
    
    # 2. Giai đoạn Kiến trúc
    print("\n[Phase 2] 02_ARCH_AGENT: Thiết kế hệ thống...")
    # Đọc PRD.md -> Tạo ARCHITECTURE.md
    
    # 3. Giai đoạn Sinh mã nguồn
    print("\n[Phase 3] 03_DEV_AGENT: Viết mã nguồn vào workspace/...")
    # Tự động ghi file vào workspace/
    
    # 4. Giai đoạn Kiểm thử tự động trên Antigravity
    print("\n[Phase 4] 04_QA_AGENT: Chạy Unit Tests trong Sandbox...")
    # Antigravity terminal execution -> pytest/npm test
    
    print("\n[✓] Hoàn tất pipeline. Kiểm tra mã nguồn trong thư mục workspace/!")

if __name__ == "__main__":
    goal = input("Nhập yêu cầu phần mềm cần phát triển: ")
    if goal.strip():
        run_pipeline(goal)