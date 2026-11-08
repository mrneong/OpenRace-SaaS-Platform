const fs = require('fs');

const prdPath = 'shared_context/PRD.json';
const prd = JSON.parse(fs.readFileSync(prdPath, 'utf8'));

prd.version = 'v3.32.0-PROD';
prd.updated_at = new Date().toISOString();

const newAcs = [
  {
    id: "AC-USER-AUTH-REGISTER-01",
    category: "User Management & Authentication",
    title: "Thành Viên Đăng Ký Tài Khoản Mới (Email & Password Registration)",
    description: "Cho phép người dùng mới đăng ký tài khoản thành viên với Họ tên, Email, Mật khẩu, Số điện thoại, Giới tính và Ngày sinh qua Modal/Form Đăng ký #modal-auth-gateway. Hỗ trợ kiểm tra hợp lệ email, mật khẩu tối thiểu 6 ký tự, ngăn chặn đăng ký trùng lặp và tự động tạo tài khoản với vai trò VĐV (Runner).",
    priority: "CRITICAL",
    status: "PLANNED",
    verification: "Gọi POST /api/auth/register hoặc bấm nút [Đăng Ký] trên UI tạo thành công tài khoản mới, cấp phiên đăng nhập và chuyển sang luồng hoàn thiện hồ sơ."
  },
  {
    id: "AC-USER-AUTH-GOOGLE-02",
    category: "User Management & Authentication",
    title: "Đăng Nhập Nhanh 1-Chạm Bằng Google (Google OAuth 2.0 Integration)",
    description: "Tích hợp nút đăng nhập chuẩn thương hiệu Google (Đăng nhập bằng Google / Tiếp tục với Google có Google G logo đa màu) trên cả form đăng nhập và đăng ký. Xử lý flow xác thực Google OAuth 2.0: tự động trích xuất Tên, Email Google và Avatar, tạo tài khoản tự động nếu chưa có, cấp phiên đăng nhập và chuyển hướng thông minh.",
    priority: "CRITICAL",
    status: "PLANNED",
    verification: "Bấm nút [Đăng nhập bằng Google] hoặc gọi POST /api/auth/google xác thực thành công, lưu provider=GOOGLE, cập nhật avatar và họ tên VĐV trên Header, đồng thời kích hoạt Onboarding cho user mới."
  },
  {
    id: "AC-USER-PROFILE-ONBOARDING-03",
    category: "Member Profile & Athletic Onboarding",
    title: "Tạo & Hoàn Thiện Hồ Sơ Thành Viên VĐV (Athlete Profile Wizard)",
    description: "Cung cấp Wizard tạo hồ sơ vận động viên sau khi đăng ký hoặc từ quản lý hồ sơ: chọn cỡ áo thi đấu CLB (Size S/M/L/XL/XXL), cự ly sở trường (5km, 10km, 21km Half Marathon, 42km Full Marathon, 70km Ultra Trail), Pace trung bình (phút/km), và thông tin liên hệ khẩn cấp (Họ tên & SĐT người thân). Dữ liệu được lưu trữ an toàn và đồng bộ vào hồ sơ cá nhân.",
    priority: "CRITICAL",
    status: "PLANNED",
    verification: "Điền và lưu form hồ sơ tại POST /api/me/profile/onboarding hoặc Wizard bước 1; thông số cỡ áo, cự ly và pace được lưu trữ chính xác trong hồ sơ VĐV."
  },
  {
    id: "AC-USER-CLUB-JOIN-ONBOARDING-04",
    category: "Club Enrollment & Community Integration",
    title: "Chọn & Đăng Ký Tham Gia Câu Lạc Bộ Trong Onboarding (Club & Squad Enrollment)",
    description: "Cho phép thành viên mới duyệt danh sách các Câu Lạc Bộ uy tín (CLB SARC, HRC, Da Nang Runners, Saigon Trail), chọn CLB mong muốn và đăng ký tham gia Đội thi đấu (Team Phoenix, Team Tigers, Đội Rồng...). Hệ thống tự động ghi nhận hội viên, cập nhật số lượng CLB đã tham gia và đồng bộ ngay vào Header Club Switcher dropdown.",
    priority: "CRITICAL",
    status: "PLANNED",
    verification: "Chọn CLB và Đội thi đấu trong Wizard bước 2 hoặc gọi POST /api/me/clubs/enroll; hội viên được thêm vào CLB, huy hiệu số lượng CLB trên Header cập nhật tức thì."
  },
  {
    id: "AC-USER-RACE-JOIN-ONBOARDING-05",
    category: "Tournament Participation & BIB Allocation",
    title: "Đăng Ký Tham Gia Giải Chạy Mở & Cấp BIB Tự Động (Race Enrollment)",
    description: "Cho phép VĐV lựa chọn các giải chạy đang mở đăng ký (Mùa 10 Run to Techcombank, SARC Trail Challenge Ba Vì, Heritage Ekiden), chọn bảng đấu / cự ly, bấm [⚡ Tham Gia Giải Ngay]. Hệ thống tự động phân bổ số BIB điện tử (e.g. BIB-205), đưa giải đấu vào Hub 'Giải Đấu Của Tôi' (my-races) và sẵn sàng cho việc ghi nhận bài chạy hợp lệ.",
    priority: "CRITICAL",
    status: "PLANNED",
    verification: "Chọn giải và bấm đăng ký tại Wizard bước 3 hoặc gọi POST /api/me/races/enroll; giải đấu được ghi nhận trong danh sách tham gia của VĐV với số BIB hợp lệ."
  },
  {
    id: "AC-USER-ADMIN-MANAGEMENT-06",
    category: "User Administration & Operations Governance",
    title: "Màn Hình Quản Trị User & Thành Viên Nền Tảng (User Administration Hub)",
    description: "Cung cấp giao diện quản trị người dùng toàn diện trong phân hệ Quản Trị Hệ Thống / Ban Điều Hành: hiển thị bảng danh sách toàn bộ VĐV và thành viên mới đăng ký, xem chi tiết phương thức đăng nhập (Google OAuth / Local), trạng thái hồ sơ VĐV (Cỡ áo, Cự ly), CLB và Giải chạy đã tham gia; hỗ trợ tìm kiếm theo tên/email, lọc theo vai trò và thao tác 1-chạm Khóa/Mở Khóa tài khoản.",
    priority: "HIGH",
    status: "PLANNED",
    verification: "Điều hướng tới mục Quản Trị User trên Sidebar hoặc gọi GET /api/admin/users; bảng hiển thị đầy đủ danh sách thành viên với cột Auth Provider, Hồ sơ, CLB, Giải và các nút thao tác tương tác."
  }
];

// Append if not present
newAcs.forEach(newAc => {
  if (!prd.acceptance_criteria.some(ac => ac.id === newAc.id)) {
    prd.acceptance_criteria.push(newAc);
  }
});

fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2), 'utf8');
console.log(`Updated PRD.json to v3.32.0-PROD with ${prd.acceptance_criteria.length} total ACs.`);
