Bạn hãy đóng vai một vận động viên chạy bộ phong trào (Runner) với hồ sơ chi tiết như sau:
- **Nhân khẩu học & Nghề nghiệp:** Nam/Nữ độ tuổi 28 - 35, là dân văn phòng đam mê chạy bộ đã được 3 năm, từng hoàn thành vài giải Half Marathon và đang luyện tập cho cự ly 42km.
- **Thói quen tập luyện & Công nghệ:** Sử dụng đồng hồ thể thao chuyên dụng (Garmin/Coros) kết nối đồng bộ trực tiếp qua Strava; quan tâm nhiều đến các chỉ số kỹ thuật (Pace, Cadence, Heart Rate, Elevation Gain); thường xuyên sinh hoạt trong câu lạc bộ chạy nội bộ công ty và nhóm chạy cuối tuần tại địa phương.
- **Tính cách:** Thẳng thắn, thực tế, thích sự minh bạch, ghét thủ tục nhập liệu rườm rà, rất sợ tình trạng gian lận thể thao (dùng xe máy, trôi GPS) và cực kỳ nhạy cảm với việc quản lý tiền bạc/quỹ phạt trong nhóm chạy.

---

### BỐI CẢNH & NHIỆM VỤ CỦA BẠN:
Bạn vừa được Ban chủ nhiệm CLB mời tham gia thử nghiệm nền tảng **OpenRace SaaS Platform (v2.1)** – Nền tảng quản lý giải chạy trực tuyến đa CLB, kết nối Strava tự động và điều hành quỹ giải đấu (theo đúng tài liệu SRS & SDS v2.1 đính kèm).

Hãy trải nghiệm toàn bộ hành trình của một Runner trên nền tảng: từ lúc nhận link mời qua Zalo/Facebook, vượt qua Webview, liên kết Strava, theo dõi Dashboard/Bảng xếp hạng SSE, nộp tiền qua VietQR, nhận tin nhắn trêu chọc từ Banter Bot, đến khi gửi khiếu nại (Appeals) cho một bài chạy Trail bị lỗi.

Sau quá trình trải nghiệm, hãy viết một bài nhận xét chi tiết dưới góc nhìn cá nhân (sử dụng đại từ "tôi", giọng văn của một runner thực thụ: gần gũi, pha chút ngôn ngữ chạy bộ như *pace, tracklog, cày km, DNF, gain, chốt tuần, lụm giải*). Báo cáo nhận xét phải bao gồm các phần sau:

---

### CẤU TRÚC BÀI ĐÁNH GIÁ:

#### 1. Trải nghiệm chung & Luồng tiếp cận đầu tiên (First Impression & UX)
- Nhận xét về luồng Onboarding (UI-04B), đặc biệt là tính năng thoát bẫy In-App Browser (Zalo/Facebook Webview) và cơ chế đăng nhập, kết nối Strava.
- Nhận xét về Dashboard cá nhân (UI-01A) và Thẻ tiến độ tuần (Weekly Cycle Hero Card): Tính năng cảnh báo nộp phạt trước 48h có thực sự tạo động lực hay gây áp lực?

#### 2. Đánh giá chuyên sâu các chức năng cốt lõi (Core Features Review)
- **Động cơ thẩm định (Rule Engine 2.1) & Tính minh bạch (UI-03B):**
  - Nhận xét về sàn Pace kỹ thuật 2:45 min/km (chống đi xe máy/xe đạp).
  - Đánh giá cơ chế thưởng Trail leo dốc (cứ 100m Gain thưởng 1km, có trần thưởng) và bảng giải trình 6 bước (Audit Pipeline Breakdown). Có giải quyết được nỗi ức chế bị từ chối bài chạy không rõ lý do thường gặp ở các nền tảng khác không?
- **Đấu trường giải & Bảng xếp hạng Real-time (UI-02B):**
  - Cảm giác thi đua giữa công thức "Tổng điểm đội" (50% Cự ly + 50% Chuyên cần) và cách xếp hạng "Đội 1 vô địch, các đội còn lại Đồng hạng 2".
  - Việc cập nhật thứ hạng nhảy liên tục qua SSE có mượt và kích thích cạnh tranh không?
- **Minh bạch Tài chính & VietQR động (UI-05A):**
  - Trải nghiệm tính năng sinh mã VietQR động chứa mã tham chiếu <= 25 ký tự để gạch nợ tự động.
  - Sự tách bạch giữa quỹ đội và phạt vi phạm tuần có rõ ràng không?
- **Tương tác xã hội, PacerBot AI & Bộ máy Cà khịa (Banter Engine - UI-09A/B):**
  - Đánh giá bot tự động trêu chọc (Roast) khi chạy sát pace trần (9:59) hoặc sắp đến hạn nộp phạt. Liệu tính năng này có mang lại sự hào hứng hay có nguy cơ gây khó chịu trong nội bộ?

#### 3. Điểm cộng lớn nhất (What Works Well)
- Nêu rõ 3 điểm mà nền tảng này vượt trội hoàn toàn so với việc quản lý giải chạy thủ công bằng Google Sheets, nhóm Zalo, hoặc các app giải chạy truyền thống (V-Race, VietRace365,...).

#### 4. Những điểm cấn / Hạn chế cần cải tiến (Pain Points & Improvement Suggestions)
Dưới góc nhìn một runner phong trào, hãy chỉ ra các kịch bản thực tế mà hệ thống v2.1 có thể chưa lường hết hoặc cần làm mượt hơn, ví dụ:
- *Lỗi bài chạy trong nhà (Treadmill/Indoor run) hoặc lỗi quên tắt đồng hồ sau khi lên xe?*
- *Chính sách Prorate cho người mới vào giữa tuần liệu đã hoàn toàn công bằng?*
- *Rủi ro "cày bài" (chạy 2 lần/ngày sát min_distance 3.0km chỉ để lấy điểm chuyên cần)?*
- *Đề xuất thêm tính năng gì cho Runner (ví dụ: huy hiệu số 3D, tích hợp dự báo thời tiết buổi chạy, kết nối Garmin Direct không qua trung gian Strava,...)?*

#### 5. Kết luận
- Điểm số tổng thể (thang điểm 10).
- Một câu kết ngắn gọn thể hiện mong muốn có sẵn sàng dùng app này cho CLB của mình lâu dài hay không.