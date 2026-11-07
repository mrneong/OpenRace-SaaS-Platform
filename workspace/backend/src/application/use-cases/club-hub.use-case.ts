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
  DynamicRaceSetupConfig,
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
  statusClass?: string;
  period: string;
  participantsCount: number;
  participants?: number;
  totalDistanceKm: number;
  km?: string;
  championTeam?: string;
  targetKmPerCycle: number;
  targetKm?: number;
  minKmPerRun?: number;
  prizeFund?: number;
  penaltyRule?: string;
  desc?: string;
  scope?: 'club' | 'community';
  isEnrolled?: boolean;
  bibNumber?: string;
  daysRemaining?: number;
  landingPage?: RaceLandingPageConfig;
  coverGradient?: string;
  icon?: string;
  personalStats?: any;
  results?: any;
  prizes?: any;
  penalties?: any;
  certificates?: any;
}

export interface RaceLandingPageConfig {
  slogan: string;
  countdownTargetDate: string;
  virtualMedals: Array<{ title: string; type: 'gold' | 'silver' | 'bronze' | 'finisher'; desc: string; icon: string }>;
  routeMap: { title: string; distance: string; elevationGain: string; checkpoints: string[]; mapSvgType: string };
}

export interface EnrolledClubItem {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  teamId: string;
  teamName: string;
  role: string;
  memberCount: number;
  logoUrl?: string;
  isActive: boolean;
}

export interface AthleteRacePortfolio {
  athleteId: string;
  athleteName: string;
  teamName: string;
  totalEnrolledRaces: number;
  totalContributedKm: number;
  medals: string;
  completionRate: number;
  diligenceDays: number;
  totalPrizes: number;
  totalPenalties: number;
  penaltiesSettled: boolean;
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
    },
    'hrc-hanoi': {
      id: 'club-hrc-hanoi',
      slug: 'hrc-hanoi',
      name: 'Câu Lạc Bộ Chạy Bộ Hà Nội (Hanoi Runners Club)',
      shortName: 'CLB Hà Nội HRC',
      slogan: 'Chinh phục từng dặm bay - Kết nối ngàn chân chạy',
      description: 'Cộng đồng chạy bộ hàng đầu thủ đô với các buổi Long Run quanh Hồ Tây và các giải marathon lớn.',
      coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=200&auto=format&fit=crop',
      foundedYear: 2019,
      totalMembers: 250,
      totalCumulativeKm: 98400.0,
      kmStats: {
        allTime: 98400.0,
        thisYear: 41200.0,
        thisMonth: 8900.0,
      },
      totalRacesHeld: 24,
      activeRacesCount: 2,
      leaders: [
        {
          id: 'hrc-lead-01',
          name: 'Đặng Tuấn Anh',
          role: 'CHỦ NHIỆM',
          avatar: 'TA',
          email: 'tuananh@hrc.vn',
          phone: '0908889999',
          description: 'Chủ nhiệm HRC',
        }
      ],
      feedPosts: [
        {
          id: 'hrc-post-1',
          title: '🔥 Long run Hồ Tây đón bình minh sáng Thứ Bảy',
          content: 'Tập trung tại tượng đài Lý Tự Trọng lúc 5:00 sáng. Cự ly 15km - 21km.',
          author: 'Đặng Tuấn Anh',
          authorRole: 'CHỦ NHIỆM',
          createdAt: '2026-11-05T08:00:00Z',
          pinned: true,
          category: 'LỊCH CHẠY',
        }
      ]
    },
    'danang-runners': {
      id: 'club-danang-runners',
      slug: 'danang-runners',
      name: 'Câu Lạc Bộ Đà Nẵng Runners (Danang Coastal Runners)',
      shortName: 'CLB Đà Nẵng',
      slogan: 'Sóng Biển Nâng Bước Chân - Vươn Tầm Bản Lĩnh',
      description: 'CLB chạy bộ ven biển Đà Nẵng, kết hợp chạy Road Mỹ Khê và Trail Bán Đảo Sơn Trà.',
      coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      logoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=200&auto=format&fit=crop',
      foundedYear: 2022,
      totalMembers: 120,
      totalCumulativeKm: 46200.0,
      kmStats: {
        allTime: 46200.0,
        thisYear: 20100.0,
        thisMonth: 4300.0,
      },
      totalRacesHeld: 8,
      activeRacesCount: 1,
      leaders: [
        {
          id: 'dn-lead-01',
          name: 'Phan Bảo Quốc',
          role: 'CHỦ NHIỆM',
          avatar: 'BQ',
          email: 'quoc.phan@danangrunners.vn',
          phone: '0905556677',
          description: 'Điều hành Danang Runners',
        }
      ],
      feedPosts: [
        {
          id: 'dn-post-1',
          title: '🌊 Chạy ngắm bình minh cung đường biển Hoàng Sa - Võ Nguyên Giáp',
          content: 'Lộ trình 10km dọc bãi biển Mỹ Khê đón gió biển sáng Chủ Nhật.',
          author: 'Phan Bảo Quốc',
          authorRole: 'CHỦ NHIỆM',
          createdAt: '2026-11-04T12:00:00Z',
          pinned: true,
          category: 'THÔNG BÁO',
        }
      ]
    }
  };

  private athleteClubsList: EnrolledClubItem[] = [
    {
      id: 'club-sarc-sadc',
      slug: 'sarc-sadc',
      name: 'Câu Lạc Bộ Chạy Bộ SARC',
      shortName: 'CLB SARC',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      role: 'ĐỘI TRƯỞNG',
      memberCount: 48,
      logoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&auto=format&fit=crop',
      isActive: true,
    },
    {
      id: 'club-hrc-hanoi',
      slug: 'hrc-hanoi',
      name: 'CLB Chạy Bộ Hà Nội (Hanoi Runners Club)',
      shortName: 'CLB Hà Nội HRC',
      teamId: 'team-westlake',
      teamName: 'Team Hồ Tây Strats',
      role: 'RUNNER',
      memberCount: 250,
      logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=200&auto=format&fit=crop',
      isActive: false,
    },
    {
      id: 'club-danang-runners',
      slug: 'danang-runners',
      name: 'CLB Đà Nẵng Runners (Danang Coastal Runners)',
      shortName: 'CLB Đà Nẵng',
      teamId: 'team-sontra',
      teamName: 'Team Sơn Trà Trail',
      role: 'RUNNER',
      memberCount: 120,
      logoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=200&auto=format&fit=crop',
      isActive: false,
    },
  ];

  constructor(store: InMemoryDataStore) {
    this.store = store;
  }

  /**
   * Automatically compute member count & accumulated KM breakdown (Toàn bộ, Trong năm, Trong tháng)
   */
  computeClubAutoMetrics(slug: string): { totalMembers: number; kmStats: ClubKmStats } {
    if (slug === 'hrc-hanoi') {
      return {
        totalMembers: 250,
        kmStats: {
          allTime: 98400.0,
          thisYear: 41200.0,
          thisMonth: 8900.0,
        }
      };
    }
    if (slug === 'danang-runners') {
      return {
        totalMembers: 120,
        kmStats: {
          allTime: 46200.0,
          thisYear: 20100.0,
          thisMonth: 4300.0,
        }
      };
    }
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
   * [4.2] Club Races State & Directory (Live / Upcoming / Archived)
   */
  private clubRacesDataState: Record<'live' | 'upcoming' | 'archived', ClubRaceItem[]> = {
    live: [
      {
        id: 'race-season-10',
        slug: 'season-10-run-to-techcombank',
        name: 'Mùa 10 Run to Techcombank 2026',
        status: 'live',
        statusText: 'ĐANG DIỄN RA',
        statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        scope: 'club',
        isEnrolled: true,
        bibNumber: '108',
        daysRemaining: 23,
        coverGradient: 'from-orange-500 to-amber-600',
        icon: '🏆',
        period: '01/11/2026 - 30/11/2026',
        participantsCount: 48,
        participants: 48,
        totalDistanceKm: 3170.0,
        km: '3,170.0 km',
        targetKmPerCycle: 20.0,
        targetKm: 4000.0,
        desc: 'Giải chạy tích lũy điểm cự ly & chuyên cần tranh cúp SARC vô địch.',
        minKmPerRun: 3.0,
        prizeFund: 11000000,
        penaltyRule: '50.000đ/lần thiếu km tuần',
        personalStats: {
          athleteName: 'Nguyễn Văn A',
          completedKm: 125.0,
          targetKm: 150.0,
          rank: 1,
          avgPace: '5:15',
          diligentDays: 18,
          prizeEarned: 1000000,
          penaltyAssessed: 50000,
          penaltySettled: true,
          certificateId: 'SARC-FINISHER-2026-NVA01',
        },
        landingPage: {
          slogan: 'Bứt Phá Giới Hạn - Hướng Đến Đỉnh Cao Techcombank Marathon 2026',
          countdownTargetDate: '2026-11-30T23:59:59Z',
          virtualMedals: [
            { title: 'Cúp Vàng Đồng Đội', type: 'gold', desc: 'Dành cho đội vô địch cự ly & chuyên cần', icon: '🏆' },
            { title: 'Huy Chương Vàng Vua Cự Ly', type: 'gold', desc: 'Vinh danh chân chạy bứt phá số 1', icon: '🥇' },
            { title: 'Huy Chương Bạc Chiến Binh', type: 'silver', desc: 'Top 3 VĐV kiên định và bền bỉ', icon: '🥈' },
            { title: 'Huy Chương Finisher Điện Tử', type: 'finisher', desc: 'Chứng nhận hoàn thành toàn giải hợp lệ', icon: '🎖️' }
          ],
          routeMap: {
            title: 'Cung đường di sản Hồ Tây & Cầu Nhật Tân',
            distance: '42.195 km',
            elevationGain: '+40m',
            checkpoints: ['Tượng đài Lý Tự Trọng', 'Phủ Tây Hồ', 'Cầu Nhật Tân', 'Vườn Hoa Thanh Niên'],
            mapSvgType: 'road'
          }
        }
      },
      {
        id: 'race-trail-bavi',
        slug: 'sarc-trail-challenge-bavi-2026',
        name: 'SARC Trail Challenge Ba Vì 2026',
        status: 'live',
        statusText: 'ĐANG DIỄN RA',
        statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        scope: 'community',
        isEnrolled: true,
        bibNumber: '042',
        daysRemaining: 18,
        coverGradient: 'from-emerald-600 to-teal-700',
        icon: '⛰️',
        period: '01/11/2026 - 25/11/2026',
        participantsCount: 64,
        participants: 64,
        totalDistanceKm: 4280.0,
        km: '4,280.0 km',
        targetKmPerCycle: 25.0,
        targetKm: 5000.0,
        desc: 'Thử thách chạy địa hình dốc núi Vườn Quốc Gia Ba Vì 2026, leo dốc D+ tính điểm thưởng gấp đôi.',
        minKmPerRun: 5.0,
        prizeFund: 18000000,
        penaltyRule: '60.000đ/lần thiếu km tuần',
        personalStats: {
          athleteName: 'Nguyễn Văn A',
          completedKm: 42.0,
          targetKm: 50.0,
          rank: 2,
          avgPace: '6:15',
          diligentDays: 12,
          prizeEarned: 500000,
          penaltyAssessed: 0,
          penaltySettled: true,
          certificateId: 'SARC-TRAIL-2026-NVA02',
        },
        landingPage: {
          slogan: 'Chinh Phục Đỉnh Vua - Thử Thách Địa Hình Rừng Nguyên Sinh Ba Vì',
          countdownTargetDate: '2026-11-25T23:59:59Z',
          virtualMedals: [
            { title: 'Cúp Vô Địch Trail Master', type: 'gold', desc: 'Chiến thắng địa hình dốc núi VQG Ba Vì', icon: '⛰️' },
            { title: 'Vua Leo Dốc Đỉnh Vua', type: 'gold', desc: 'Thành tích leo dốc D+ xuất sắc nhất', icon: '👑' },
            { title: 'Huy Chương Finisher Dốc Núi', type: 'finisher', desc: 'Vượt qua trọn vẹn 25km trail rừng', icon: '🎖️' }
          ],
          routeMap: {
            title: 'Cung đường dốc núi VQG Ba Vì',
            distance: '25.0 km',
            elevationGain: '+650m D+',
            checkpoints: ['Cổng Vườn Quốc Gia', 'Cốt 400', 'Đồi Thông', 'Đền Thượng Đỉnh Vua'],
            mapSvgType: 'trail'
          }
        }
      },
      {
        id: 'race-vpbank-2026',
        slug: 'vpbank-hanoi-marathon-prep-2026',
        name: 'VPBank Hanoi Marathon Prep 2026',
        status: 'live',
        statusText: 'ĐANG DIỄN RA',
        statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        scope: 'community',
        isEnrolled: false,
        daysRemaining: 23,
        coverGradient: 'from-blue-600 to-indigo-700',
        icon: '🏃',
        period: '10/11/2026 - 30/11/2026',
        participantsCount: 120,
        participants: 120,
        totalDistanceKm: 8950.0,
        km: '8,950.0 km',
        targetKmPerCycle: 30.0,
        targetKm: 12000.0,
        desc: 'Giải chạy cộng đồng liên kết toàn miền Bắc khởi động trước thềm giải chạy quốc tế VPBank Hanoi Marathon.',
        minKmPerRun: 5.0,
        prizeFund: 25000000,
        penaltyRule: 'Quy chế Ban tổ chức VPBank Marathon',
        landingPage: {
          slogan: 'Khởi Động Năng Lượng - Chạy Vì Một Việt Nam Thịnh Vượng',
          countdownTargetDate: '2026-11-30T23:59:59Z',
          virtualMedals: [
            { title: 'Huy Chương Vàng Half Marathon', type: 'gold', desc: 'Dẫn đầu cự ly 21km', icon: '🥇' },
            { title: 'Kỷ Niệm Chương Prep Runner', type: 'finisher', desc: 'Hoàn thành bước đệm marathon', icon: '🎖️' }
          ],
          routeMap: {
            title: 'Cung đường trung tâm thủ đô Hà Nội',
            distance: '21.1 km',
            elevationGain: '+20m',
            checkpoints: ['Hồ Hoàn Kiếm', 'Nhà Hát Lớn', 'Lăng Bác', 'Phố Cổ'],
            mapSvgType: 'road'
          }
        }
      },
    ],
    upcoming: [
      {
        id: 'race-vnexpress-hue',
        slug: 'vnexpress-marathon-hue-2027',
        name: 'VnExpress Marathon Huế 2027',
        status: 'upcoming',
        statusText: 'SẮP KHỞI TRANH',
        statusClass: 'bg-purple-50 text-purple-700 border-purple-200',
        scope: 'community',
        isEnrolled: false,
        coverGradient: 'from-purple-600 to-pink-600',
        icon: '🏰',
        period: '15/03/2027 - 20/03/2027',
        participantsCount: 80,
        participants: 80,
        totalDistanceKm: 0.0,
        km: '0.0 km',
        targetKmPerCycle: 25.0,
        targetKm: 8000.0,
        desc: 'Giải marathon cung đường cố đô Huế với sự tham gia của hàng nghìn chân chạy cả nước.',
        minKmPerRun: 5.0,
        prizeFund: 30000000,
        penaltyRule: 'Quy chế tính giờ chip điện tử RFID',
      },
      {
        id: 'race-ny-2027',
        slug: 'sarc-new-year-half-marathon-2027',
        name: 'SARC Chào Xuân Đinh Mùi 2027',
        status: 'upcoming',
        statusText: 'SẮP KHỞI TRANH',
        statusClass: 'bg-amber-50 text-amber-700 border-amber-200',
        scope: 'club',
        isEnrolled: false,
        coverGradient: 'from-sky-500 to-blue-600',
        icon: '🌸',
        period: '01/01/2027 - 15/01/2027',
        participantsCount: 28,
        participants: 28,
        totalDistanceKm: 0.0,
        km: '0.0 km',
        targetKmPerCycle: 25.0,
        targetKm: 2500.0,
        desc: 'Giải mở màn năm mới 2027 với cự ly bán marathon đồng hành cùng cộng đồng.',
        minKmPerRun: 5.0,
        prizeFund: 6000000,
        penaltyRule: '30.000đ/lần thiếu km',
      },
    ],
    archived: [
      {
        id: 'race-season-09',
        slug: 'season-09-summer-challenge-2026',
        name: 'Mùa 9 Thử Thách Mùa Hè Rực Lửa 2026',
        status: 'archived',
        statusText: 'ĐÃ KẾT THÚC',
        statusClass: 'bg-slate-100 text-slate-700 border-slate-200',
        scope: 'club',
        isEnrolled: true,
        bibNumber: '088',
        daysRemaining: 0,
        coverGradient: 'from-slate-600 to-slate-800',
        icon: '🔥',
        period: '01/06/2026 - 30/06/2026',
        participantsCount: 52,
        participants: 52,
        totalDistanceKm: 15420.0,
        km: '15,420.0 km',
        championTeam: 'Team Dragons SADC',
        targetKmPerCycle: 20.0,
        targetKm: 15000.0,
        desc: 'Giải mùa hè hoàn thành với kỷ lục cự ly toàn CLB đạt trên 15.000 km.',
        minKmPerRun: 3.0,
        prizeFund: 15000000,
        penaltyRule: '50.000đ/lần thiếu km tuần',
        personalStats: {
          athleteName: 'Nguyễn Văn A',
          completedKm: 355.0,
          targetKm: 300.0,
          rank: 2,
          avgPace: '5:10',
          diligentDays: 24,
          prizeEarned: 4500000,
          penaltyAssessed: 0,
          penaltySettled: true,
          certificateId: 'SARC-FINISHER-2026-00088',
        },
        landingPage: {
          slogan: 'Thử Thách Mùa Hè Rực Lửa - Về Đích Vinh Quang',
          countdownTargetDate: '2026-06-30T23:59:59Z',
          virtualMedals: [
            { title: 'Cúp Mùa Hè Rực Lửa', type: 'gold', desc: 'Team Dragons SADC Vô Địch', icon: '🔥' }
          ],
          routeMap: {
            title: 'Cung đường hè rực lửa',
            distance: '15,000 km',
            elevationGain: '+50m',
            checkpoints: ['Vườn hoa', 'Hồ Tây', 'Công viên Thống Nhất'],
            mapSvgType: 'road'
          }
        }
      },
    ],
  };

  /**
   * [AC-MULTI-CLUB-01] Get all clubs the athlete is currently enrolled in
   */
  getAthleteClubs(athleteId: string = 'user-01'): EnrolledClubItem[] {
    return this.athleteClubsList;
  }

  /**
   * [AC-MULTI-CLUB-01] Switch the athlete's active club context
   */
  switchActiveClub(athleteId: string = 'user-01', clubSlug: string): { activeClub: EnrolledClubItem; clubProfile: ClubProfileView; activeClubId: string } {
    const targetClub = this.athleteClubsList.find(c =>
      c.slug === clubSlug ||
      c.id === clubSlug ||
      (clubSlug === 'club-hrc' && (c.slug === 'hrc-hanoi' || c.id === 'club-hrc-hanoi')) ||
      (clubSlug === 'club-sarc' && (c.slug === 'sarc-sadc' || c.id === 'club-sarc-sadc')) ||
      (clubSlug === 'club-danang' && (c.slug === 'danang-runners' || c.id === 'club-danang-runners'))
    );
    if (!targetClub) {
      throw new Error(`Club with slug ${clubSlug} not found in athlete memberships.`);
    }
    this.athleteClubsList.forEach(c => {
      c.isActive = (c.id === targetClub.id);
    });
    const profile = this.getClubProfile(targetClub.slug);
    return {
      activeClub: targetClub,
      activeClubId: (clubSlug === 'club-hrc' || clubSlug === 'club-sarc' || clubSlug === 'club-danang') ? clubSlug : targetClub.id,
      clubProfile: profile,
    };
  }

  /**
   * [AC-MULTI-CLUB-02] Allocate activity to a specific club
   */
  allocateActivityToClub(activity: any, targetClubSlug: string): any {
    const targetClub = this.athleteClubsList.find(c => c.slug === targetClubSlug) || this.athleteClubsList[0];
    return {
      ...activity,
      clubSlug: targetClub.slug,
      clubName: targetClub.name,
      allocatedAt: new Date().toISOString(),
      status: 'ALLOCATED_TO_CLUB'
    };
  }

  /**
   * [AC-MY-RACES-01] Get 'Giải Đấu Của Tôi' (My Enrolled Races)
   */
  getAthleteMyRaces(athleteId: string = 'user-01'): ClubRaceItem[] {
    const allRaces = [
      ...this.clubRacesDataState.live,
      ...this.clubRacesDataState.upcoming,
      ...this.clubRacesDataState.archived,
    ];
    return allRaces.filter(r => r.isEnrolled);
  }

  /**
   * [AC-MY-RACES-02] Smart Activity Race Suggestion
   */
  getSmartActivityRaceSuggestion(activity: { distanceKm: number; isTrail?: boolean; elevationGainM?: number; title?: string }): { suggestedRaceId: string; raceName: string; reason: string; bonusNote?: string } {
    if (activity.isTrail || (activity.elevationGainM && activity.elevationGainM >= 100)) {
      return {
        suggestedRaceId: 'race-trail-bavi',
        raceName: 'SARC Trail Challenge Ba Vì 2026',
        reason: 'Bài chạy có đặc điểm địa hình leo dốc phù hợp thể lệ Trail Ba Vì',
        bonusNote: '+2.0 km cự ly thưởng tích lũy leo dốc D+'
      };
    }
    if (activity.distanceKm >= 3.0) {
      return {
        suggestedRaceId: 'race-season-10',
        raceName: 'Mùa 10 Run to Techcombank 2026',
        reason: 'Cự ly đạt chuẩn tối thiểu >= 3.0 km của giải chạy chính vụ',
        bonusNote: 'Tính điểm chuyên cần & tiến độ tuần'
      };
    }
    return {
      suggestedRaceId: 'race-season-10',
      raceName: 'Mùa 10 Run to Techcombank 2026',
      reason: 'Đề xuất mặc định cho giải đấu đang diễn ra của CLB'
    };
  }

  /**
   * [AC-RACE-LANDING-01 & 02] Get Public Tournament Landing Page
   */
  getRaceLandingPage(raceId: string, athleteId: string = 'user-01'): { race: ClubRaceItem; isPersonalized: boolean; countdown: { days: number; hours: number; mins: number; secs: number; targetDate: string }; athleteData?: any } {
    const allRaces = [
      ...this.clubRacesDataState.live,
      ...this.clubRacesDataState.upcoming,
      ...this.clubRacesDataState.archived,
    ];
    const race = allRaces.find(r => r.id === raceId) || allRaces[0];
    const isEnrolled = !!race.isEnrolled;
    return {
      race,
      isPersonalized: isEnrolled,
      countdown: {
        days: race.daysRemaining !== undefined ? race.daysRemaining : 23,
        hours: 14,
        mins: 35,
        secs: 20,
        targetDate: race.landingPage?.countdownTargetDate || '2026-11-30T23:59:59Z',
      },
      athleteData: isEnrolled ? {
        athleteId,
        athleteName: 'Nguyễn Văn A',
        bibNumber: race.bibNumber || '108',
        teamName: 'Team Phoenix SARC',
        personalProgressKm: race.personalStats?.completedKm || 125.0,
        personalTargetKm: race.personalStats?.targetKm || 150.0,
        rank: race.personalStats?.rank || 1,
        teammatesCount: 18
      } : undefined
    };
  }

  /**
   * [4.2] Get Club Races Directory (Live / Upcoming / Archived)
   */
  getClubRaces(slug: string): Record<'live' | 'upcoming' | 'archived', ClubRaceItem[]> {
    return {
      live: this.clubRacesDataState.live.filter(r => (r.scope || 'club') === 'club'),
      upcoming: this.clubRacesDataState.upcoming.filter(r => (r.scope || 'club') === 'club'),
      archived: this.clubRacesDataState.archived.filter(r => (r.scope || 'club') === 'club'),
    };
  }

  /**
   * [AC-ATHLETE-PORTFOLIO-01] Get Athlete Race Portfolio Summary
   */
  getAthleteRacePortfolio(athleteId: string = 'user-01'): AthleteRacePortfolio {
    const allRaces = [
      ...this.clubRacesDataState.live,
      ...this.clubRacesDataState.upcoming,
      ...this.clubRacesDataState.archived,
    ];
    const enrolledRaces = allRaces.filter(r => r.isEnrolled);
    const totalContributedKm = enrolledRaces.reduce((sum, r) => sum + (r.personalStats?.completedKm || 0), 0);
    const totalPrizes = enrolledRaces.reduce((sum, r) => sum + (r.personalStats?.prizeEarned || 0), 0);
    const totalPenalties = enrolledRaces.reduce((sum, r) => sum + (r.personalStats?.penaltyAssessed || 0), 0);

    return {
      athleteId,
      athleteName: 'Nguyễn Văn A',
      teamName: 'Team Phoenix SARC',
      totalEnrolledRaces: enrolledRaces.length,
      totalContributedKm: totalContributedKm > 0 ? totalContributedKm : 198.5,
      medals: '1 Finisher Vàng, 2 Bạc, King of Trail',
      completionRate: 94.2,
      diligenceDays: 42,
      totalPrizes: totalPrizes > 0 ? totalPrizes : 6000000,
      totalPenalties: totalPenalties > 0 ? totalPenalties : 50000,
      penaltiesSettled: true,
    };
  }

  /**
   * [AC-ATHLETE-PORTFOLIO-02] Filter Races by Scope & Enrollment
   */
  getAthleteRaces(filter: 'enrolled' | 'live' | 'archived' | 'all'): ClubRaceItem[] {
    const allRaces = [
      ...this.clubRacesDataState.live,
      ...this.clubRacesDataState.upcoming,
      ...this.clubRacesDataState.archived,
    ];
    if (filter === 'enrolled') {
      return allRaces.filter(r => r.isEnrolled);
    }
    if (filter === 'live') {
      return allRaces.filter(r => r.status === 'live');
    }
    if (filter === 'archived') {
      return allRaces.filter(r => r.status === 'archived');
    }
    return allRaces;
  }

  /**
   * [AC-ATHLETE-PORTFOLIO-05] Enroll Athlete into Race (1-Click Instant Enrollment)
   */
  enrollAthleteInRace(athleteId: string = 'user-01', raceId: string): { success: boolean; race: ClubRaceItem; portfolio: AthleteRacePortfolio } {
    const allRaces = [
      ...this.clubRacesDataState.live,
      ...this.clubRacesDataState.upcoming,
      ...this.clubRacesDataState.archived,
    ];
    const race = allRaces.find(r => r.id === raceId);
    if (!race) {
      throw new Error(`Race not found: ${raceId}`);
    }
    race.isEnrolled = true;
    race.bibNumber = race.bibNumber || '245';
    race.daysRemaining = race.daysRemaining !== undefined ? race.daysRemaining : 25;
    if (!race.personalStats) {
      race.personalStats = {
        athleteName: 'Nguyễn Văn A',
        completedKm: 0.0,
        targetKm: race.targetKmPerCycle || 20.0,
        rank: race.participantsCount + 1,
        avgPace: '--:--',
        diligentDays: 0,
        prizeEarned: 0,
        penaltyAssessed: 0,
        penaltySettled: true,
        certificateId: `SARC-FINISHER-PENDING-${race.id}`,
      };
    }
    race.participantsCount = (race.participantsCount || 40) + 1;
    race.participants = race.participantsCount;

    return {
      success: true,
      race,
      portfolio: this.getAthleteRacePortfolio(athleteId),
    };
  }

  /**
   * [4.2] Create a new internal club race
   */
  createClubRace(slug: string, raceData: Partial<ClubRaceItem>): ClubRaceItem {
    const newRace: ClubRaceItem = {
      id: raceData.id || `race-${Date.now()}`,
      slug: raceData.slug || `race-${Date.now()}`,
      name: raceData.name || 'Giải Thi Đấu Nội Bộ CLB Mới',
      status: (raceData.status as any) || 'live',
      statusText: raceData.statusText || (raceData.status === 'upcoming' ? 'SẮP KHỞI TRANH' : 'ĐANG DIỄN RA'),
      statusClass: raceData.statusClass || 'bg-emerald-50 text-emerald-700 border-emerald-200',
      scope: raceData.scope || 'club',
      isEnrolled: raceData.isEnrolled !== undefined ? raceData.isEnrolled : true,
      bibNumber: raceData.bibNumber || '108',
      daysRemaining: raceData.daysRemaining !== undefined ? raceData.daysRemaining : 25,
      personalStats: raceData.personalStats || {
        athleteName: 'Nguyễn Văn A',
        completedKm: 25.0,
        targetKm: raceData.targetKmPerCycle || 20.0,
        rank: 1,
        avgPace: '5:20',
        diligentDays: 4,
        prizeEarned: 0,
        penaltyAssessed: 0,
        penaltySettled: true,
        certificateId: `SARC-FINISHER-${raceData.id || Date.now()}`,
      },
      period: raceData.period || '01/11/2026 - 30/11/2026',
      participantsCount: raceData.participantsCount || raceData.participants || 40,
      participants: raceData.participants || raceData.participantsCount || 40,
      totalDistanceKm: raceData.totalDistanceKm || 0,
      km: raceData.km || '0.0 km',
      targetKmPerCycle: raceData.targetKmPerCycle || 20.0,
      targetKm: raceData.targetKm || 2000.0,
      desc: raceData.desc || 'Giải thi đấu phong trào nội bộ.',
      minKmPerRun: raceData.minKmPerRun || 3.0,
      prizeFund: raceData.prizeFund || 5000000,
      penaltyRule: raceData.penaltyRule || '50.000đ/lần thiếu km tuần',
    };

    if (newRace.status === 'upcoming') {
      this.clubRacesDataState.upcoming.unshift(newRace);
    } else if (newRace.status === 'archived') {
      this.clubRacesDataState.archived.unshift(newRace);
    } else {
      this.clubRacesDataState.live.unshift(newRace);
    }

    return newRace;
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
    targetChannel?: 'all' | 'zalo' | 'in_app' | 'email';
    senderName?: string;
    channels?: string[];
    deliveryCount?: number;
  }): ClubBroadcastMessage {
    if (!msg.title || !msg.content) {
      throw new Error('Tiêu đề và nội dung thông báo không được để trống.');
    }
    return this.store.sendClubBroadcast(msg);
  }

  /**
   * Lock weekly season ledger with 2-step security confirmation
   */
  lockSeasonWeek(weekNumber: number = 20, confirmed: boolean = true): { week: number; isLocked: boolean; lockedAt: string; totalKm: number; penalizedRunnersCount?: number; totalPenaltyVnd?: number } {
    return this.store.lockSeasonWeek(weekNumber, confirmed);
  }

  /**
   * [AC-CLUB-DASH-PULSE-02] Get Club Pulse Analytics (Heatmap 7x4 & Churn Risk Watchlist)
   */
  getClubPulseAnalytics(clubId: string = 'club-sarc-sadc') {
    return this.store.getClubPulseAnalytics(clubId);
  }

  /**
   * [AC-CLUB-DASH-PULSE-02] Remind At-Risk Runner with 1-touch notification
   */
  remindChurnRunner(runnerId: string, channel: string = 'zalo') {
    return this.store.remindChurnRunner(runnerId, channel);
  }

  /**
   * [AC-CLUB-DASH-ROLE-04] Get Dynamic Role-Based Perspective Configuration
   */
  getClubRolePerspective(role: string = 'president') {
    return this.store.getClubRolePerspective(role);
  }

  // ==========================================
  // [AC-RACE-WIZARD-STEP1..05] DYNAMIC SETUP WIZARD & MASTER CATALOGS
  // ==========================================
  getRaceWizardCatalogs() {
    return this.store.getRaceWizardCatalogs();
  }

  createDynamicRace(config: Partial<DynamicRaceSetupConfig>): DynamicRaceSetupConfig {
    return this.store.createDynamicRace(config);
  }

  getDynamicRaceSetup(raceIdOrSlug: string): DynamicRaceSetupConfig {
    return this.store.getDynamicRaceSetup(raceIdOrSlug);
  }

  calculateRaceAwards(raceIdOrSlug: string) {
    return this.store.calculateRaceAwards(raceIdOrSlug);
  }
}
