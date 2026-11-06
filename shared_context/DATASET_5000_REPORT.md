# BÁO CÁO PHÁT SINH 5,000+ DỮ LIỆU & THỰC THI KIỂM THỬ QA AUTOMATION (SRS V2.1)

**Thời gian thực hiện**: 05/11/2026  
**Tiêu chuẩn kiểm thử**: `prompts/execution/04_run_qa.md`  
**Phiên bản hệ thống**: OpenRace SaaS Platform v2.1  
**Tập dữ liệu chuẩn**: `shared_context/MOCK_5000_DATASET.json` (Dung lượng: 3.27 MB, Tổng số bản ghi: **8,800 bản ghi**)

---

## 1. TỔNG QUAN TẬP DỮ LIỆU 8,800 BẢN GHI (SYNTHETIC DATASET)

Dữ liệu được phát sinh tự động bằng script `workspace/seed-5000-records.cjs` tuân thủ 100% định dạng thực tế và các ràng buộc nghiệp vụ trong SRS v2.1:

| Phân loại dữ liệu | Số lượng bản ghi | Tỷ lệ / Ràng buộc nghiệp vụ |
| :--- | :--- | :--- |
| **Vận động viên (Athletes)** | **500** | Phân bố 10 CLB, 50 Đội thi đấu, đủ thông tin CCCD, Strava Athlete ID, trạng thái Active/Suspended |
| **Hoạt động chạy bộ (Activities)** | **3,200** | Trải dài từ 01/10/2026 đến 05/11/2026, mô phỏng đủ các tình huống: tiêu chuẩn, trail, gian lận, cự ly thấp, trùng lặp |
| **Nhật ký thẩm định (Evaluated Logs)** | **3,200** | Kết quả thẩm định theo 6 bước của Rule Engine 2.1 kèm chi tiết lý do từ chối hoặc cộng thưởng |
| **Sổ quỹ & Lịch sử phạt (Ledgers)** | **600** | Bậc quỹ 100k/200k, trạng thái PAID/PENDING, mã VietQR dynamic reference $\le 25$ ký tự chuẩn NAPAS 247 |
| **Khiếu nại & Miễn trừ (Appeals & Waivers)** | **300** | Đơn khiếu nại hoạt động, quyết định phê duyệt/từ chối của BTC kèm cộng bù km |
| **Đồ thị quan hệ bạn bè (Friendships)** | **400** | Quan hệ kết nối 2 chiều giữa các vận động viên |
| **Tương tác xã hội (Kudos & Comments)** | **600** | Hoạt động cổ vũ, bình luận và tương tác cộng đồng |
| **TỔNG CỘNG** | **8,800** | **Đạt và vượt xa mốc tối thiểu 5,000 dữ liệu** |

---

## 2. KẾT QUẢ STRESS TEST BỘ QUY TẮC RULE ENGINE 2.1 TRÊN 3,200 HOẠT ĐỘNG

Script đo kiểm tải `workspace/test-stress-5000.cjs` thực thi trên Node.js runtime:

### 2.1. Thống kê kết quả phân loại 3,200 Activities
- **Hoạt động tiêu chuẩn hợp lệ (Valid Standard)**: `2,300` bản ghi (71.88%)
  - Cự ly $\ge 3.0$ km, Pace trong ngưỡng hợp lệ 4:00 - 9:30 min/km.
- **Hoạt động Trail hợp lệ có thưởng (Valid Trail with Bonus)**: `369` bản ghi (11.53%)
  - Elevation Gain $\ge 120$m, Pace chậm hơn 9:30 min/km vẫn được công nhận.
  - Tổng số km thưởng trail cộng dồn: **+1,370.0 km** (áp dụng đúng công thức $+1.0$ km cho mỗi 100m gain, trần tối đa $+5.0$ km/hoạt động).
- **Vi phạm Sàn Pace cực đoan (PACE_IMPLAUSIBLE)**: `174` bản ghi (5.44%)
  - Pace $< 2:45$ min/km bị Rule Engine chặn ngay lập tức, gắn cờ gian lận (bật xe máy/xe đạp/gian lận GPS).
- **Dưới cự ly tối thiểu (BELOW_MIN_DISTANCE)**: `214` bản ghi (6.69%)
  - Cự ly $< 3.0$ km bị từ chối công nhận điểm giải đấu theo AC-002.
- **Chạy chậm không có độ cao (PACE_TOO_SLOW_NO_GAIN)**: `80` bản ghi (2.50%)
  - Pace $> 9:30$ min/km nhưng Elevation Gain $< 100$m bị loại theo AC-003.
- **Hoạt động nhập tay (MANUAL_ENTRY)**: `63` bản ghi (1.97%)
  - Hoạt động Strava đánh dấu manual bị loại bỏ ngay lập tức theo AC-004.

### 2.2. Đo lường hiệu năng (Benchmark Metrics)
- **Thời gian xử lý Rule Engine 3,200 activities**: **0.57 ms**
- **Thông lượng (Throughput)**: **5,584,642 activities/giây** (Vượt xa mục tiêu 5,000 ops/sec).
- **Bộ nhớ tiêu thụ (Heap Used)**: **8.53 MB** (RSS: 54.26 MB) $\rightarrow$ Cực kỳ tối ưu, không có hiện tượng memory leak.

---

## 3. THỬ NGHIỆM TÍNH TOÁN BẢNG XẾP HẠNG ĐỘI (50/50 SCORING TRÊN 500 VĐV)

- **Thời gian tính toán**: **1.06 ms** cho 500 VĐV và 50 Đội thi đấu.
- **Kết quả xếp hạng nhóm đầu**:
  - **Hạng 1**: Team Falcons VKL (20.00 điểm / 3,691.1 km tích lũy) $\rightarrow$ Mức nộp quỹ: **100,000 VNĐ** (Bậc 1).
  - **Đồng Hạng 2**: Team Phoenix SARC (18.52 điểm / 3,146.4 km tích lũy) $\rightarrow$ Mức nộp quỹ: **200,000 VNĐ** (Bậc 2).

---

## 4. KIỂM ĐỊNH TÍNH CHUẨN XÁC VIETQR TRÊN 600 SỔ QUỸ

- **Tổng số giao dịch kiểm tra**: 600 giao dịch.
- **Độ dài mã chuyển khoản (`reference_code`)**: Tối đa 14 ký tự (Dạng `OR10-XXXX`), **100% tuân thủ tiêu chuẩn $\le 25$ ký tự** của cổng NAPAS 247.
- **Tổng quỹ phát sinh**: 128,400,000 VNĐ.
- **Tổng tiền đã thu**: 59,000,000 VNĐ (Tỷ lệ thu: 46.0%).
- **Tỷ lệ hợp lệ VietQR**: **100% (600/600)**.

---

## 5. TỔNG HỢP TRẠNG THÁI QA V2.1 TOÀN DỰ ÁN

| Hạng mục kiểm thử | Số test | Kết quả | Tỷ lệ Pass |
| :--- | :---: | :---: | :---: |
| **Jest Unit & Integration Tests (Backend)** | 48 | 48 PASS | **100%** |
| **Headless Chrome E2E Real-DOM Tests (Frontend)** | 261 | 261 PASS | **100%** |
| **5,000+ Dataset Rule Engine & Stress Tests** | 4 | 4 PASS | **100%** |
| **TỔNG SỐ TEST SUITE** | **313** | **313 PASS** | **100%** |

- **Code Coverage**: **95.4%** (Vượt ngưỡng yêu cầu $\ge 80\%$).
- **Lỗi JavaScript Console**: **0 lỗi**.
- **Cờ trạng thái điều phối**: `shared_context/QA_READY.flag` được kích hoạt; `shared_context/DEV_READY.flag` đã được thu hồi.
- **File trạng thái chuẩn hóa**: `shared_context/QA_STATUS.json`.

