const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'backend/src/application/use-cases/club-hub.use-case.ts');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update ClubLeader interface
code = code.replace(
  `export interface ClubLeader {
  id: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ';
  avatar: string;
  email: string;
  phone?: string;
}`,
  `export interface ClubLeader {
  id: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ' | string;
  avatar: string;
  email: string;
  phone?: string;
  description?: string;
}`
);

// 2. Update ClubPost interface
code = code.replace(
  `export interface ClubPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  pinned?: boolean;
  category: 'THÔNG BÁO' | 'LỊCH CHẠY' | 'TỔNG KẾT';
}`,
  `export interface ClubPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  pinned?: boolean;
  expiresAt?: string;
  category: 'THÔNG BÁO' | 'LỊCH CHẠY' | 'TỔNG KẾT' | string;
}`
);

// 3. Update initial leaders data to include descriptions and matching the screenshot
code = code.replace(
  `      leaders: [
        {
          id: 'lead-01',
          name: 'Hoàng Văn Minh',
          role: 'CHỦ NHIỆM',
          avatar: 'HM',
          email: 'minh.hoang@sarc.vn',
        },
        {
          id: 'lead-02',
          name: 'Trần Quốc Tuấn',
          role: 'TRƯỞNG BAN CHUYÊN MÔN',
          avatar: 'TT',
          email: 'tuan.tran@sarc.vn',
        },
        {
          id: 'lead-03',
          name: 'Vũ Thị Hạnh',
          role: 'THỦ QUỸ',
          avatar: 'VH',
          email: 'hanh.vu@sarc.vn',
        },
      ],`,
  `      leaders: [
        {
          id: 'lead-01',
          name: 'Hoàng Văn Minh',
          role: 'CHỦ NHIỆM',
          avatar: 'HM',
          email: 'minh.hoang@sarc.vn',
          phone: '0901234567',
          description: 'Điều hành chung & Đối ngoại',
        },
        {
          id: 'lead-02',
          name: 'Trần Quốc Tuấn',
          role: 'TRƯỞNG BAN CHUYÊN MÔN',
          avatar: 'TT',
          email: 'tuan.tran@sarc.vn',
          phone: '0912345678',
          description: 'Huấn luyện & Thẩm định kỷ luật',
        },
        {
          id: 'lead-03',
          name: 'Lê Thu Thảo',
          role: 'THỦ QUỸ',
          avatar: 'LT',
          email: 'thao.le@sarc.vn',
          phone: '0987654321',
          description: 'Quản trị quỹ & Thu nộp VietQR',
        },
      ],`
);

// 4. Update initial feedPosts to include expiresAt
code = code.replace(
  `      feedPosts: [
        {
          id: 'post-1',
          title: '🔥 Phát động chặng nước rút Mùa 10 Techcombank 2026',
          content: 'Chỉ còn 25 ngày tới đích! Tất cả thành viên chú ý lịch chạy Long Run cuối tuần tại Hồ Tây để tối đa hóa điểm cự ly và giữ vững ngày chuyên cần.',
          author: 'Hoàng Văn Minh (Chủ nhiệm)',
          authorRole: 'CHỦ NHIỆM',
          createdAt: '2026-11-04T08:00:00Z',
          pinned: true,
          category: 'THÔNG BÁO',
        },
        {
          id: 'post-2',
          title: '📅 Lịch chạy nhóm sáng Chủ Nhật tuần này',
          content: 'Địa điểm: Tượng đài Lý Tự Trọng - Vườn hoa Thanh Niên. Khởi hành đúng 05:30. Có pacer dẫn tốc 5:30 và 6:30.',
          author: 'Trần Quốc Tuấn',
          authorRole: 'TRƯỞNG BAN CHUYÊN MÔN',
          createdAt: '2026-11-02T14:30:00Z',
          pinned: false,
          category: 'LỊCH CHẠY',
        },
        {
          id: 'post-3',
          title: '📊 Báo cáo thu chi quỹ CLB tháng 10/2026',
          content: 'Tổng thu tiền phạt và đóng góp thành viên: 12.800.000 VNĐ. Chi tiếp tế nước giải chạy Hồ Tây: 2.450.000 VNĐ. Số dư chuyển kỳ sau: 10.350.000 VNĐ.',
          author: 'Vũ Thị Hạnh',
          authorRole: 'THỦ QUỸ',
          createdAt: '2026-10-31T18:00:00Z',
          pinned: false,
          category: 'TỔNG KẾT',
        },
      ],`,
  `      feedPosts: [
        {
          id: 'post-1',
          title: 'Thông báo chốt tuần thi đấu giải Mùa 10',
          content: 'Các VĐV lưu ý nộp bài chạy tuần trước 23:59:59 Chủ Nhật. Hệ thống sẽ khóa sổ và áp dụng mức phạt 50.000đ cho mỗi VĐV thiếu cự ly tiêu chuẩn 20km.',
          author: 'Hoàng Văn Minh',
          authorRole: 'Chủ nhiệm CLB',
          createdAt: '2026-11-06T08:30:00Z',
          pinned: true,
          expiresAt: '2026-11-15',
          category: 'THÔNG BÁO',
        },
        {
          id: 'post-2',
          title: 'Mở đăng ký giải Trail Ba Vì Challenge',
          content: 'Đã cập nhật thể lệ tính thưởng dốc Trail (+1km cho mỗi 100m elevation gain). Các VĐV tham gia vui lòng đồng bộ tài khoản Strava trước ngày chạy.',
          author: 'Trần Quốc Tuấn',
          authorRole: 'Trưởng Ban Chuyên Môn',
          createdAt: '2026-11-03T09:00:00Z',
          pinned: false,
          expiresAt: '2026-11-30',
          category: 'THÔNG BÁO',
        },
        {
          id: 'post-3',
          title: 'Lịch tập chạy dài Long Run cuối tuần Hồ Tây 21km',
          content: 'Thứ 7 tuần này 05:00 sáng tại Vườn hoa Lạc Long Quân. Pacer hỗ trợ dẫn tốc từ 5:00 đến 6:30, trạm tiếp nước tại km 7 và km 14.',
          author: 'Lê Thu Thảo',
          authorRole: 'Thủ Quỹ & Hậu Cần',
          createdAt: '2026-11-01T15:00:00Z',
          pinned: false,
          expiresAt: '2026-11-08',
          category: 'LỊCH CHẠY',
        },
      ],`
);

// 5. Append management methods to ClubHubUseCase
const methodsToAdd = `
  /**
   * [4.1] Update Club Full Profile
   */
  updateClubProfile(slug: string, updates: Partial<ClubProfileView>): ClubProfileView {
    const profile = this.getClubProfile(slug);
    if (updates.name) profile.name = updates.name;
    if (updates.shortName) profile.shortName = updates.shortName;
    if (updates.slogan) profile.slogan = updates.slogan;
    if (updates.description) profile.description = updates.description;
    if (updates.totalMembers !== undefined) profile.totalMembers = Number(updates.totalMembers);
    if (updates.totalCumulativeKm !== undefined) profile.totalCumulativeKm = Number(updates.totalCumulativeKm);
    if (updates.foundedYear !== undefined) profile.foundedYear = Number(updates.foundedYear);
    return profile;
  }

  /**
   * [4.1] Add Executive Leader
   */
  addLeader(slug: string, leaderData: Partial<ClubLeader>): ClubLeader {
    const profile = this.getClubProfile(slug);
    const newLeader: ClubLeader = {
      id: leaderData.id || \`lead-\${Date.now()}\`,
      name: leaderData.name || 'Thành viên Ban cán sự',
      role: (leaderData.role as any) || 'BAN CÁN SỰ',
      avatar: leaderData.avatar || (leaderData.name ? leaderData.name.split(' ').map(n=>n[0]).slice(-2).join('').toUpperCase() : 'BCS'),
      email: leaderData.email || 'bcs@sarc.vn',
      phone: leaderData.phone || '',
      description: leaderData.description || 'Điều hành & Hỗ trợ hoạt động CLB'
    };
    profile.leaders.push(newLeader);
    return newLeader;
  }

  /**
   * [4.1] Update Executive Leader
   */
  updateLeader(slug: string, leaderId: string, updates: Partial<ClubLeader>): ClubLeader {
    const profile = this.getClubProfile(slug);
    const leader = profile.leaders.find(l => l.id === leaderId);
    if (!leader) throw new Error(\`Leader with id \${leaderId} not found\`);
    if (updates.name) leader.name = updates.name;
    if (updates.role) leader.role = updates.role as any;
    if (updates.description) leader.description = updates.description;
    if (updates.email) leader.email = updates.email;
    if (updates.phone) leader.phone = updates.phone;
    if (updates.avatar) leader.avatar = updates.avatar;
    return leader;
  }

  /**
   * [4.1] Delete Executive Leader
   */
  deleteLeader(slug: string, leaderId: string): boolean {
    const profile = this.getClubProfile(slug);
    const index = profile.leaders.findIndex(l => l.id === leaderId);
    if (index === -1) return false;
    profile.leaders.splice(index, 1);
    return true;
  }

  /**
   * [4.1] Add Announcement Post
   */
  addPost(slug: string, postData: Partial<ClubPost>): ClubPost {
    const profile = this.getClubProfile(slug);
    const newPost: ClubPost = {
      id: postData.id || \`post-\${Date.now()}\`,
      title: postData.title || 'Thông báo mới',
      content: postData.content || '',
      author: postData.author || 'Ban Cán Sự CLB',
      authorRole: postData.authorRole || 'Ban Cán Sự',
      createdAt: postData.createdAt || new Date().toISOString(),
      pinned: Boolean(postData.pinned),
      expiresAt: postData.expiresAt || '',
      category: (postData.category as any) || 'THÔNG BÁO'
    };
    if (newPost.pinned) {
      profile.feedPosts.unshift(newPost);
    } else {
      profile.feedPosts.push(newPost);
    }
    return newPost;
  }

  /**
   * [4.1] Update Announcement Post
   */
  updatePost(slug: string, postId: string, updates: Partial<ClubPost>): ClubPost {
    const profile = this.getClubProfile(slug);
    const post = profile.feedPosts.find(p => p.id === postId);
    if (!post) throw new Error(\`Post with id \${postId} not found\`);
    if (updates.title) post.title = updates.title;
    if (updates.content) post.content = updates.content;
    if (updates.category) post.category = updates.category as any;
    if (updates.author) post.author = updates.author;
    if (updates.authorRole) post.authorRole = updates.authorRole;
    if (updates.expiresAt !== undefined) post.expiresAt = updates.expiresAt;
    if (updates.pinned !== undefined) post.pinned = Boolean(updates.pinned);
    return post;
  }

  /**
   * [4.1] Delete Announcement Post
   */
  deletePost(slug: string, postId: string): boolean {
    const profile = this.getClubProfile(slug);
    const index = profile.feedPosts.findIndex(p => p.id === postId);
    if (index === -1) return false;
    profile.feedPosts.splice(index, 1);
    return true;
  }

  /**
   * [4.1] Toggle Pin Announcement Post
   */
  togglePinPost(slug: string, postId: string): ClubPost {
    const profile = this.getClubProfile(slug);
    const post = profile.feedPosts.find(p => p.id === postId);
    if (!post) throw new Error(\`Post with id \${postId} not found\`);
    post.pinned = !post.pinned;
    return post;
  }
`;

// Insert before the last closing brace of ClubHubUseCase
const lastBraceIdx = code.lastIndexOf('}');
code = code.slice(0, lastBraceIdx) + methodsToAdd + '\n}\n';

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated club-hub.use-case.ts with all management methods!');

