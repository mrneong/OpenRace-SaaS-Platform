const fs = require('fs');

const section46 = `
---

## 46. KIẾN TRÚC KHO LƯU TRỮ GIẢI ĐÃ ĐÓNG BĂNG: BẢNG VÀNG & XUẤT BÁO CÁO LƯU TRỮ (AC-FROZEN-HUB-ACTIONS-01, 02, 03)

### 46.1 Bối Cảnh & Vấn Đề Kỹ Thuật
Tại Tab 2 **Kho Lưu Trữ Giải Đã Đóng Băng (Lịch Sử)** của Admin Race Hub:
1. **Nút "🌟 Xem Bảng Vàng & E-Cert"** gọi hàm \`openRaceLandingModal('mua-9-thu-thach-mua-he-ruc-lua-2026')\` nhưng hàm này chưa từng được định nghĩa trong codebase (gây \`ReferenceError: openRaceLandingModal is not defined\`), làm cho nút hoàn toàn bị tê liệt khi người dùng nhấp vào.
2. **Nút "📊 Xuất Báo Cáo Toàn Giải" & "📊 Xuất Báo Cáo Lưu Trữ"** gọi hàm \`exportRaceExcel(raceId)\`, tuy nhiên hàm này chỉ gửi một HTTP POST và hiện thông báo Toast đơn thuần chứ chưa thực hiện thao tác tải tệp (file download) về thiết bị của người dùng, đồng thời backend chưa có endpoint streaming tệp \`GET /api/races/:id/download-report\`.
3. **Thiếu Modal Bảng Vàng Vinh Danh Giải Đã Đóng Băng**: Chưa có giao diện trình bày số cái đóng băng bảo mật (\`LEDGER-SIG-M9-FROZEN-8F9B2C\`), tổng quỹ thưởng đã giải ngân (15.000.000đ), bảng xếp hạng trao giải và nút mở xem E-Certificate điện tử của từng vận động viên.

### 46.2 Mô Hình Luồng Xử Lý (Sequence Diagram)
\`\`\`mermaid
sequenceDiagram
    actor User as Ban Tổ Chức / VĐV
    participant UI as Giao Diện Admin Hub
    participant Router as Client Script (main.ts)
    participant ModalHoF as Modal Bảng Vàng (#modal-frozen-hall-of-fame)
    participant ModalCert as Modal E-Cert (#modal-finisher-certificate)
    participant Backend as NestJS API / DataStore

    %% Luồng 1: Xem Bảng Vàng & E-Cert
    User->>UI: Nhấp "🌟 Xem Bảng Vàng & E-Cert"
    UI->>Router: openRaceLandingModal(slugOrId)
    Router->>Backend: GET /api/races/:id/hall-of-fame
    Backend-->>Router: JSON (LedgerSig, Giải Ngân, Vô Địch, Danh Sách E-Cert)
    Router->>ModalHoF: Render dữ liệu Bảng Vàng & mở Modal
    ModalHoF-->>User: Hiển thị Bảng Vàng Mùa 9 & chữ ký số cái

    %% Luồng 2: Xem E-Cert cá nhân từ Bảng Vàng
    User->>ModalHoF: Nhấp "📜 Xem E-Cert" của VĐV
    ModalHoF->>Router: openFinisherCertificateModal(athlete, bib, certNo...)
    Router->>ModalCert: Điền thông tin VĐV & mở Modal E-Cert
    ModalCert-->>User: Hiển thị Chứng nhận điện tử có chữ ký số

    %% Luồng 3: Xuất Báo Cáo Excel / CSV
    User->>UI: Nhấp "📊 Xuất Báo Cáo Toàn Giải" / "Lưu Trữ"
    UI->>Router: exportRaceExcel(raceId)
    Router->>Backend: POST /api/races/:id/export-excel
    Backend-->>Router: JSON metadata & downloadUrl (/api/races/:id/download-report)
    Router->>Backend: Browser trigger GET /api/races/:id/download-report
    Backend-->>Router: Stream CSV UTF-8 BOM (\\uFEFF) kẹp Content-Disposition: attachment
    Router-->>User: Tệp Excel/CSV được tải ngay lập tức về máy tính
\`\`\`

### 46.3 Đặc Tả Thành Phần & Giao Diện API

#### A. Data Models & Store Methods
- \`getFrozenHallOfFame(raceId: string)\`:
  - Trả về đối tượng \`FrozenHallOfFameData\` gồm:
    - \`raceId\`, \`raceName\`, \`slug\`, \`ledgerSignature\` (ví dụ: \`LEDGER-SIG-M9-FROZEN-8F9B2C\`)
    - \`closedDate\`: \`01/06/2026 - 30/06/2026\`
    - \`championTeam\`: \`Team Dragons SADC\` (15,420.0 km)
    - \`totalPrizeDisbursed\`: \`15.000.000đ\`
    - \`certificatesIssued\`: 11
    - \`recipients\`: Mảng các VĐV đạt chuẩn hoàn thành nhận chứng nhận điện tử (Họ tên, Mã BIB, Thành tích km, Hạng giải, Số hiệu E-Cert).
- \`generateRaceReportCsv(raceId: string): string\`:
  - Xuất bảng mã CSV hoàn chỉnh chuẩn RFC 4180 có Byte Order Mark UTF-8 (\`\\uFEFF\`) để mở ngay trên Microsoft Excel không bị lỗi phông chữ tiếng Việt.
  - Bao gồm dòng tiêu đề giải đấu, số cái bảo mật, tổng kết cự ly, danh sách đội đua và danh sách vận động viên hoàn thành.

#### B. REST API Endpoints
1. \`GET /api/races/:id/hall-of-fame\`:
   - Trả về dữ liệu Bảng vàng vinh danh và danh sách E-Certificate của giải đấu đã đóng băng.
2. \`GET /api/races/:id/download-report\`:
   - Response Headers:
     - \`Content-Type: text/csv; charset=utf-8\`
     - \`Content-Disposition: attachment; filename="BAO_CAO_GIAI_<SLUG>_<DATE>.csv"\`
   - Body: Chuỗi CSV UTF-8 BOM hoàn chỉnh.

#### C. Giao Diện & Script Phía Client
1. **Modal Bảng Vàng (\`#modal-frozen-hall-of-fame\`)**:
   - Tông màu hoàng gia tím - vàng kim (Purple / Gold gradient) đại diện cho giải đấu đã hoàn thành lịch sử và lưu trữ bất biến.
   - Thẻ hiển thị mã số cái đóng băng bảo mật \`LEDGER-SIG-M9-FROZEN-8F9B2C\`.
   - 4 khối thẻ thống kê: Đội vô địch, Tổng cự ly chung cuộc, Tiền thưởng giải ngân, Số E-Certificates cấp.
   - Bảng danh sách cá nhân đạt giải có nút \`📜 Xem E-Cert\` bấm 1-chạm mở trực tiếp chứng chỉ hoàn thành tương ứng.
2. **Hàm \`openRaceLandingModal(slugOrId)\`**:
   - Nếu là giải đã đóng băng (\`mua-9\`, \`race-season-9\`, \`spring\`, \`dinh-mui\`), mở ngay modal Bảng Vàng \`openFrozenHallOfFameModal(slugOrId)\`.
   - Nếu là giải đang diễn ra hoặc sắp diễn ra, mở modal Landing page giải \`openRaceLandingPageModal(foundId)\`.
3. **Hàm \`exportRaceExcel(raceId)\`**:
   - Thực hiện kiểm tra, gọi POST thông báo xuất báo cáo và lập tức tạo phần tử \`<a href="/api/races/\${target}/download-report" download="...">\` để kích hoạt tải tệp tự động về trình duyệt.
`;

fs.appendFileSync('shared_context/ARCHITECTURE.md', section46, 'utf8');
console.log('ARCHITECTURE.md Section 46 appended successfully');

