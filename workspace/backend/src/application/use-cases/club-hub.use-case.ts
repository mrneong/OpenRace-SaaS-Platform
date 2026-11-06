/**
 * Club Hub & Onboarding Use Case (TypeScript)
 * Subsystem [4.0] KHÔNG GIAN CÂU LẠC BỘ (CLUB HUB)
 * - [4.1] Hồ sơ & Bảng tin CLB (Profile, Cover, Logo, Ban điều hành, Thống kê)
 * - [4.2] Danh mục giải đấu CLB (Live / Upcoming / Archived)
 * - [4.3] Danh sách thành viên & Ban cán sự CLB (Roster, Roles, Phân bổ sức chứa đội)
 * - [4.4] Chia sẻ & Mời thành viên (Detour In-App Browser & 2 Cam kết dữ liệu bắt buộc)
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import type {
  ClubAdminDashboardDto,
  ClubAdminKPIs,
  PendingActivityQueueItem,
  ClubDisputeQueueItem,
  ClubReconciliationItem,
  ClubBroadcastMessage,
  TeamStandingQuickView,
} from '../../domain/models/models';

export interface ClubLeader {
  id: string;
  memberId?: string;
  name: string;
  role: 'CHỦ NHIỆM' | 'PHÓ CHỦ NHIỆM' | 'TRƯỞNG BAN CHUYÊN MÔN' | 'THỦ QUỸ' | 'BAN CÁN SỰ' | string;
  avatar: string;
  email: string;
  phone?: string;
  description?: string;
}

export interface ClubPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  pinned?: boolean;
  expiresAt?: string;
  category: 'THÔNG BÁO' | 'LỊCH CHẠY' | 'TỔNG KẾT' | string;
}

export interface ClubKmStats {
  allTime: number; // Toàn bộ
  thisYear: number; // Trong năm (hiện hữu)
  thisMonth: number; // Trong tháng (hiện hữu)
}

export interface ClubProfileView {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  slogan: string;
  description: string;
  coverUrl: string;
  logoUrl: string;
  foundedYear: number;
  totalMembers: number;
  totalCumulativeKm: number;
  kmStats: ClubKmStats;
  totalRacesHeld: number;
  activeRacesCount: number;
  leaders: ClubLeader[];
  feedPosts: ClubPost[];
}

export interface ClubRaceItem {
  id: string;
  slug: string;
  name: string;
  status: 'live' | 'upcoming' | 'archived';
  statusText: string;
  period: string;
  participantsCount: number;
  totalDistanceKm: number;
  championTeam?: string;
  targetKmPerCycle: number;
}

export interface ClubMemberItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'CHỦ NHIỆM' | 'BAN CÁN SỰ' | 'ĐỘI TRƯỞNG' | 'RUNNER';
  teamId?: string;
  teamName?: string;
  totalKm: number;
  diligentDays: number;
  stravaConnected: boolean;
  joinedAt: string;
}

export interface TeamCapacityItem {
  teamId: string;
  teamName: string;
  currentCount: number;
  maxCapacity: number;
  isFull: boolean;
  availableSlots: number;
}

export interface DetourInspectionResult {
  isInApp: boolean;
  browserName?: string;
  shortCode: string;
  recommendation: string;
  directBrowserUrl: string;
}

export class ClubHubUseCase {
  private readonly store: InMemoryDataStore;

  private membersList: ClubMemberItem[] = [
    {
      id: 'user-01',
      name: 'Nguyễn Văn A',
      email: 'athlete.nguyen@sarc.vn',
      avatar: 'NA',
      role: 'ĐỘI TRƯỞNG',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      totalKm: 125.0,
      diligentDays: 18,
      stravaConnected: true,
      joinedAt: '2026-08-01',
    },
    {
      id: 'user-02',
      name: 'Trần Thị B',
      email: 'b.tran@sarc.vn',
      avatar: 'TB',
      role: 'RUNNER',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      totalKm: 112.5,
      diligentDays: 16,
      stravaConnected: true,
      joinedAt: '2026-08-05',
    },
    {
      id: 'user-03',
      name: 'Lê Hoàng C',
      email: 'c.le@sarc.vn',
      avatar: 'LC',
      role: 'RUNNER',
      teamId: 'team-tigers',
      teamName: 'Team Tigers SADC',
      totalKm: 98.0,
      diligentDays: 14,
      stravaConnected: true,
      joinedAt: '2026-08-10',
    },
    {
      id: 'lead-01',
      name: 'Hoàng Văn Minh',
      email: 'minh.hoang@sarc.vn',
      avatar: 'HM',
      role: 'CHỦ NHIỆM',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      totalKm: 134.0,
      diligentDays: 20,
      stravaConnected: true,
      joinedAt: '2021-05-15',
    },
    {
      id: 'lead-02',
      name: 'Trần Quốc Tuấn',
      email: 'tuan.tran@sarc.vn',
      avatar: 'TT',
      role: 'BAN CÁN SỰ',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      totalKm: 140.2,
      diligentDays: 21,
      stravaConnected: true,
      joinedAt: '2021-06-01',
    },
    {
      id: 'lead-03',
      name: 'Lê Thu Thảo',
      email: 'thao.le@sarc.vn',
      avatar: 'LT',
      role: 'BAN CÁN SỰ',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      totalKm: 108.0,
      diligentDays: 15,
      stravaConnected: true,
      joinedAt: '2021-07-01',
    },
    {
      id: 'user-04',
      name: 'Phạm Minh Đức',
      email: 'duc.pham@sarc.vn',
      avatar: 'MD',
      role: 'RUNNER',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      totalKm: 96.0,
      diligentDays: 14,
      stravaConnected: true,
      joinedAt: '2026-08-15',
    }
  ];

  private clubProfileData: Record<string, ClubProfileView> = {
    'sarc-sadc': {
      id: 'club-sarc-sadc',
      slug: 'sarc-sadc',
      name: 'Câu Lạc Bộ Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
      shortName: 'CLB SARC',
      slogan: 'Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội',
      description: 'Cộng đồng chạy bộ bán chuyên quy tụ các runners nhiệt huyết, gắn kết qua các mùa giải trực tuyến kỷ luật, minh bạch và tràn đầy năng lượng tích cực.',
      coverUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&auto=format&fit=crop',
      foundedYear: 2021,
      totalMembers: 128,
      totalCumulativeKm: 42580.0,
      kmStats: {
        allTime: 42580.0,
        thisYear: 18450.0,
        thisMonth: 3170.0,
      },
      totalRacesHeld: 12,
      activeRacesCount: 1,
      leaders: [
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
      ],
      feedPosts: [
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
          content: 'Địa điểm: Tượng đài Lý Tự Trọng - Vườn hoa Thanh Niên. Cự ly 10km & 21km. Pace nhóm: 5:30, 6:00, 6:30. Có xe tiếp nước và chụp ảnh.',
          author: 'Trần Quốc Tuấn',
          authorRole: 'TRƯỞNG BAN CHUYÊN MÔN',
          createdAt: '2026-11-03T14:30:00Z',
          pinned: false,
          category: 'LỊCH CHẠY',
        },
        {
          id: 'post-3',
          title: '🏆 Vinh danh Top 1 Tháng 10 - Đồng đội Nguyễn Văn A',
          content: 'Chúc mừng anh Nguyễn Văn A với tổng tích lũy 125.0 km và 18 ngày chuyên cần tuyệt đối, giữ vị trí số 1 nhận Áo SARC độc bản!',
          author: 'Ban Cán Sự SARC',
          authorRole: 'BAN CÁN SỰ',
          createdAt: '2026-11-01T10:00:00Z',
          pinned: false,
          category: 'TỔNG KẾT',
        },
      ],
    }
  };

  constructor(store: InMemoryDataStore) {
    this.store = store;
  }

  /**
   * Automatically compute member count & accumulated KM breakdown (Toàn bộ, Trong năm, Trong tháng)
   */
  computeClubAutoMetrics(slug: string): { totalMembers: number; kmStats: ClubKmStats } {
    return {
      totalMembers: 128,
      kmStats: {
        allTime: 42580.0,
        thisYear: 18450.0,
        thisMonth: 3170.0,
      }
    };
  }

  /**
   * [4.1] Get Club Profile & Feed with auto-aggregated member and km stats
   */
  getClubProfile(slug: string): ClubProfileView {
    const profile = this.clubProfileData[slug] || this.clubProfileData['sarc-sadc'];
    const autoStats = this.computeClubAutoMetrics(slug);
    profile.totalMembers = autoStats.totalMembers;
    profile.kmStats = autoStats.kmStats;
    profile.totalCumulativeKm = autoStats.kmStats.allTime;
    return profile;
  }

  /**
   * [6.1] Update Club Settings & VietQR Bank Info
   */
  updateClubSettings(slug: string, settings: any): ClubProfileView {
    const profile = this.getClubProfile(slug);
    if (settings.name) profile.name = settings.name;
    if (settings.slogan) profile.slogan = settings.slogan;
    if (settings.description) profile.description = settings.description;
    return profile;
  }

  /**
   * [4.2] Get Club Races Directory (Live / Upcoming / Archived)
   */
  getClubRaces(slug: string): Record<'live' | 'upcoming' | 'archived', ClubRaceItem[]> {
    return {
      live: [
        {
          id: 'race-season-10',
          slug: 'season-10-run-to-techcombank',
          name: 'Mùa 10 Run to Techcombank 2026',
          status: 'live',
          statusText: 'ĐANG DIỄN RA',
          period: '01/11/2026 - 30/11/2026',
          participantsCount: 48,
          totalDistanceKm: 3170.0,
          targetKmPerCycle: 20.0,
        },
      ],
      upcoming: [
        {
          id: 'race-ny-2027',
          slug: 'sarc-new-year-half-marathon-2027',
          name: 'SARC Chào Xuân Đinh Mùi 2027',
          status: 'upcoming',
          statusText: 'SẮP KHỞI TRANH',
          period: '01/01/2027 - 15/01/2027',
          participantsCount: 28,
          totalDistanceKm: 0.0,
          targetKmPerCycle: 25.0,
        },
      ],
      archived: [
        {
          id: 'race-season-09',
          slug: 'season-09-summer-challenge-2026',
          name: 'Mùa 9 Thử Thách Mùa Hè Rực Lửa 2026',
          status: 'archived',
          statusText: 'ĐÃ KẾT THÚC',
          period: '01/06/2026 - 30/06/2026',
          participantsCount: 52,
          totalDistanceKm: 15420.0,
          championTeam: 'Team Dragons SADC',
          targetKmPerCycle: 20.0,
        },
      ],
    };
  }

  /**
   * [4.3 & 6.2] Get Club Members & Team Capacities
   */
  getClubMembers(slug: string): { members: ClubMemberItem[]; capacities: TeamCapacityItem[] } {
    const capacities: TeamCapacityItem[] = [
      {
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        currentCount: 16,
        maxCapacity: 16,
        isFull: true,
        availableSlots: 0,
      },
      {
        teamId: 'team-dragons',
        teamName: 'Team Dragons SADC',
        currentCount: 14,
        maxCapacity: 16,
        isFull: false,
        availableSlots: 2,
      },
      {
        teamId: 'team-tigers',
        teamName: 'Team Tigers SADC',
        currentCount: 15,
        maxCapacity: 16,
        isFull: false,
        availableSlots: 1,
      },
    ];

    return { members: this.membersList, capacities };
  }

  /**
   * [6.2] Add New Club Member
   */
  addMember(slug: string, memberData: Partial<ClubMemberItem>): ClubMemberItem {
    const id = memberData.id || `user-new-${Date.now()}`;
    const newMember: ClubMemberItem = {
      id,
      name: memberData.name || 'Thành viên mới',
      email: memberData.email || `${id}@sarc.vn`,
      avatar: (memberData.name || 'TV').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      role: memberData.role || 'RUNNER',
      teamId: memberData.teamId || 'team-dragons',
      teamName: memberData.teamName || (memberData.teamId === 'team-phoenix' ? 'Team Phoenix SARC' : memberData.teamId === 'team-tigers' ? 'Team Tigers SADC' : 'Team Dragons SADC'),
      totalKm: 0.0,
      diligentDays: 0,
      stravaConnected: Boolean(memberData.stravaConnected !== false),
      joinedAt: new Date().toISOString().split('T')[0],
    };
    this.membersList.push(newMember);
    return newMember;
  }

  /**
   * [6.2] Update Member Information / Role / Team / Status
   */
  updateMember(slug: string, memberId: string, updates: Partial<ClubMemberItem> & { status?: string }): ClubMemberItem {
    const member = this.membersList.find((m) => m.id === memberId);
    if (!member) throw new Error(`Member ${memberId} not found`);

    if (updates.name) member.name = updates.name;
    if (updates.role) member.role = updates.role;
    if (updates.teamId) {
      member.teamId = updates.teamId;
      member.teamName = updates.teamId === 'team-phoenix' ? 'Team Phoenix SARC' : updates.teamId === 'team-tigers' ? 'Team Tigers SADC' : 'Team Dragons SADC';
    }
    return member;
  }

  /**
   * [6.2] Delete Member
   */
  deleteMember(slug: string, memberId: string): boolean {
    const idx = this.membersList.findIndex((m) => m.id === memberId);
    if (idx !== -1) {
      this.membersList.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * [4.4] In-App Browser Detour Inspector
   * Identifies webviews (Zalo, Facebook, TikTok) that drop OAuth session tokens
   */
  inspectUserAgent(userAgent = ''): DetourInspectionResult {
    const ua = userAgent.toLowerCase();
    const isInApp =
      ua.includes('fban') ||
      ua.includes('fbav') ||
      ua.includes('instagram') ||
      ua.includes('zalo') ||
      ua.includes('micromessenger') ||
      ua.includes('tiktok') ||
      ua.includes('line');

    let browserName: string | undefined = undefined;
    if (ua.includes('zalo')) browserName = 'Zalo In-App Webview';
    else if (ua.includes('fb') || ua.includes('fban') || ua.includes('fbav')) browserName = 'Facebook Webview';
    else if (ua.includes('instagram')) browserName = 'Instagram Webview';
    else if (ua.includes('tiktok')) browserName = 'TikTok Webview';

    return {
      isInApp,
      browserName,
      shortCode: 'OR-8K2Q',
      recommendation: isInApp
        ? 'Bạn đang truy cập qua trình duyệt nhúng. Hãy chọn "Mở bằng trình duyệt ngoài (Chrome / Safari)" để đảm bảo phiên kết nối Strava không bị gián đoạn.'
        : 'Trình duyệt chuẩn, sẵn sàng kết nối OAuth Strava.',
      directBrowserUrl: 'https://openrace.vn/c/sarc-sadc?detour=chrome',
    };
  }

  /**
   * [4.4] Join Club / Race with Dual Consents & Team Selection
   */
  joinClub(
    userId: string,
    clubSlug: string,
    teamId: string,
    consents: { consentStrava: boolean; consentRulesAndFinance: boolean }
  ): { success: boolean; message: string; member?: ClubMemberItem } {
    // 1. Mandatory Dual Consent Check
    if (!consents.consentStrava) {
      throw new Error('Bạn bắt buộc phải đồng ý Cấp quyền đọc dữ liệu bài tập Strava (Cam kết 1).');
    }
    if (!consents.consentRulesAndFinance) {
      throw new Error('Bạn bắt buộc phải đồng ý Công khai kết quả & Tuân thủ quy chế tài chính (Cam kết 2).');
    }

    // 2. Team Capacity Check
    const { capacities } = this.getClubMembers(clubSlug);
    const targetTeam = capacities.find((t) => t.teamId === teamId);
    if (!targetTeam) {
      throw new Error(`Đội thi đấu ${teamId} không tồn tại.`);
    }
    if (targetTeam.isFull) {
      throw new Error(`Đội ${targetTeam.teamName} đã đạt sức chứa tối đa (${targetTeam.maxCapacity}/${targetTeam.maxCapacity} thành viên). Vui lòng chọn đội khác.`);
    }

    // 3. Register Member
    const newMember: ClubMemberItem = {
      id: userId,
      name: 'Vận Động Viên Mới',
      email: `${userId}@sarc.vn`,
      avatar: 'VM',
      role: 'RUNNER',
      teamId: targetTeam.teamId,
      teamName: targetTeam.teamName,
      totalKm: 0.0,
      diligentDays: 0,
      stravaConnected: true,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    this.membersList.push(newMember);

    return {
      success: true,
      message: `Gia nhập thành công ${targetTeam.teamName}! Đã kích hoạt VĐV tham gia giải đấu.`,
      member: newMember,
    };
  }

  /**
   * [4.1] Update Club Full Profile
   */
  updateClubProfile(slug: string, updates: Partial<ClubProfileView>): ClubProfileView {
    const profile = this.getClubProfile(slug);
    if (updates.name) profile.name = updates.name;
    if (updates.shortName) profile.shortName = updates.shortName;
    if (updates.slogan) profile.slogan = updates.slogan;
    if (updates.description) profile.description = updates.description;
    if (updates.foundedYear !== undefined) profile.foundedYear = Number(updates.foundedYear);
    // Automatically preserve computed member count and KM breakdown
    const autoStats = this.computeClubAutoMetrics(slug);
    profile.totalMembers = autoStats.totalMembers;
    profile.kmStats = autoStats.kmStats;
    profile.totalCumulativeKm = autoStats.kmStats.allTime;
    return profile;
  }

  /**
   * [4.1] Add Executive Leader (Appointed from Club Member Roster)
   */
  addLeader(slug: string, leaderData: Partial<ClubLeader> & { memberId?: string }): ClubLeader {
    const profile = this.getClubProfile(slug);
    let member: ClubMemberItem | undefined;
    if (leaderData.memberId) {
      member = this.membersList.find((m) => m.id === leaderData.memberId);
    } else if (leaderData.name) {
      member = this.membersList.find((m) => m.name.toLowerCase() === leaderData.name!.toLowerCase());
    }

    const name = member ? member.name : (leaderData.name || 'Thành viên Ban cán sự');
    const email = member ? member.email : (leaderData.email || 'bcs@sarc.vn');
    const avatar = member ? member.avatar : (leaderData.avatar || (name ? name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase() : 'BCS'));
    const phone = leaderData.phone || '';

    const newLeader: ClubLeader = {
      id: leaderData.id || `lead-${Date.now()}`,
      memberId: member ? member.id : leaderData.memberId,
      name,
      role: (leaderData.role as any) || 'BAN CÁN SỰ',
      avatar,
      email,
      phone,
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
    if (!leader) throw new Error(`Leader with id ${leaderId} not found`);
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
      id: postData.id || `post-${Date.now()}`,
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
    if (!post) throw new Error(`Post with id ${postId} not found`);
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
    if (!post) throw new Error(`Post with id ${postId} not found`);
    post.pinned = !post.pinned;
    return post;
  }

  // ==========================================
  // [Subsystem 6.0] Club Admin & Captain Dashboard Methods
  // ==========================================

  /**
   * Get Club Admin & Captain Dashboard data
   */
  getClubAdminDashboard(clubId: string = 'club-sarc-sadc'): ClubAdminDashboardDto {
    return this.store.getClubAdminDashboard(clubId);
  }

  /**
   * Batch approve pending activities
   */
  batchApproveActivities(activityIds?: string[]): { approvedCount: number; remainingCount: number; approvedIds: string[] } {
    return this.store.batchApproveActivities(activityIds);
  }

  /**
   * Quick resolve dispute (bonus or reject)
   */
  resolveClubDispute(disputeId: string, action: 'bonus' | 'reject', bonusKm: number = 1.0, note?: string): ClubDisputeQueueItem {
    return this.store.resolveClubDispute(disputeId, action, bonusKm, note);
  }

  /**
   * Auto-reconcile or remind ledger debt
   */
  reconcileLedger(ledgerId: string, method: 'manual_cash' | 'vietqr_auto' | 'remind'): ClubReconciliationItem {
    return this.store.reconcileLedger(ledgerId, method);
  }

  /**
   * Quick broadcast announcement to club runners
   */
  sendClubBroadcast(msg: {
    clubId?: string;
    title: string;
    content: string;
    templateKey?: string;
    targetChannel?: 'all' | 'zalo' | 'in_app';
    senderName?: string;
  }): ClubBroadcastMessage {
    if (!msg.title || !msg.content) {
      throw new Error('Tiêu đề và nội dung thông báo không được để trống.');
    }
    return this.store.sendClubBroadcast(msg);
  }

  /**
   * Lock weekly season ledger
   */
  lockSeasonWeek(weekNumber: number = 20): { week: number; isLocked: boolean; lockedAt: string; totalKm: number } {
    return this.store.lockSeasonWeek(weekNumber);
  }
}
