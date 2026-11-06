import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { computeTeamScore, rankTeams } from '../../domain/scoring/scoring-leaderboard';
import type { TeamScore, RankedTeam } from '../../domain/models/models';

export interface RaceHeroDto {
  id: string;
  slug: string;
  name: string;
  clubName: string;
  category?: string;
  status: 'running' | 'completed' | 'upcoming';
  statusLabel?: string;
  startAt: string;
  endAt: string;
  location?: string;
  totalAthletes: number;
  totalTeams?: number;
  totalKm: number;
  targetKm?: number;
  totalValidPersonDays: number;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  userParticipation?: {
    isParticipating: boolean;
    teamId?: string;
    teamName?: string;
    role?: string;
    personalKm?: number;
    standing?: string;
    rank?: number;
  };
  topReward: {
    title: string;
    description: string;
    imageUrl: string;
  };
  rulesSummary: {
    distanceRatio: number;
    diligentRatio: number;
    capDays: number;
    rank1FeeVnd: number;
    tiedRank2FeeVnd: number;
    paceFloor: string;
    minDistanceKm: number;
    trailElevationBonus?: string;
  };
}

export interface RaceOverviewDto {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  clubName: string;
  category: string;
  status: 'running' | 'upcoming' | 'completed';
  statusLabel: string;
  startAt: string;
  endAt: string;
  location: string;
  totalAthletes: number;
  totalTeams: number;
  totalKm: number;
  targetKm?: number;
  daysRemaining: number;
  userParticipation: {
    isParticipating: boolean;
    teamId?: string;
    teamName?: string;
    role?: string;
    personalKm?: number;
    standing?: string;
    rank?: number;
  };
  topReward: {
    title: string;
    description: string;
    imageUrl: string;
  };
  rulesSummary: {
    distanceRatio: number;
    diligentRatio: number;
    capDays: number;
    rank1FeeVnd: number;
    tiedRank2FeeVnd: number;
    paceFloor: string;
    minDistanceKm: number;
    trailElevationBonus?: string;
  };
}

export interface TeamLeaderboardItemDto {
  teamId: string;
  name: string;
  rank: number;
  rankLabel: string;
  badge: 'gold' | 'silver';
  totalKm: number;
  diligentDays: number;
  scores: TeamScore;
  expectedFundFeeVnd: number;
  fundLabel: string;
  trend: 'up' | 'down' | 'same';
  membersCount: number;
  captain?: string;
}

export interface TeamLeaderboardDto {
  raceSlug: string;
  raceName: string;
  rankingPolicy: string;
  teams: TeamLeaderboardItemDto[];
  updatedAt: string;
}

export interface IndividualRunnerDto {
  userId: string;
  name: string;
  avatarUrl: string;
  teamId: string;
  teamName: string;
  rank: number;
  totalKm: number;
  diligentDays: number;
  averagePace: string;
  isCurrentUser: boolean;
  rewardBadge?: string;
  trend: 'up' | 'down' | 'same';
  trendDiff: number;
}

export interface IndividualLeaderboardDto {
  raceSlug: string;
  totalParticipants: number;
  topReward: string;
  runners: IndividualRunnerDto[];
  currentUserSummary: IndividualRunnerDto;
  updatedAt: string;
}

export interface TeamMemberDto {
  userId: string;
  name: string;
  role: 'Captain' | 'Vice-Captain' | 'Member';
  km: number;
  diligentDays: number;
  percentOfTeam: number;
  isCurrentUser: boolean;
}

export interface MyTeamSpaceDto {
  teamId: string;
  teamName: string;
  raceSlug: string;
  captain: string;
  rank: number;
  rankLabel: string;
  badge: 'gold' | 'silver';
  totalKm: number;
  targetKm: number;
  progressPercent: number;
  totalMembers: number;
  maxCapacity: number;
  teamInviteCode: string;
  members: TeamMemberDto[];
  cheerFeed: Array<{ id: string; author: string; message: string; timestamp: string }>;
}

export interface LiveStreamEventDto {
  type: 'activity_verified' | 'rank_change' | 'milestone_reached' | 'strava_synced' | 'finance_settled' | 'appeal_created' | 'appeal_endorsed' | string;
  athleteName: string;
  teamName: string;
  distanceKm: number;
  message: string;
  timestamp: string;
}

export class RaceArenaUseCase {
  private liveStreamListeners: Map<string, Set<any>> = new Map();

  private racesData: Record<string, any> = {
    'season-10-run-to-techcombank': {
      id: 'race-season-10',
      slug: 'season-10-run-to-techcombank',
      name: 'Mùa 10 Run to Techcombank 2026 – SADC/SARC',
      shortName: 'Mùa 10 Run to Techcombank 2026',
      clubName: 'SARC (Saigon Athletics Running Club)',
      category: 'Road & Phong Trào Tính Điểm',
      status: 'running' as const,
      statusLabel: 'Đang diễn ra',
      startAt: '2026-11-01T00:00:00Z',
      endAt: '2026-11-30T23:59:59Z',
      location: 'Toàn quốc (Đồng bộ Strava)',
      totalAthletes: 48,
      totalTeams: 3,
      totalKm: 3170.0,
      totalValidPersonDays: 348,
      userParticipation: {
        isParticipating: true,
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        role: 'Captain',
        personalKm: 125.0,
        standing: '#1 Dẫn đầu',
        rank: 1,
      },
      topReward: {
        title: 'Áo thi đấu CLB SARC độc bản 2026',
        description: 'Dành riêng cho Top 1 cá nhân xuất sắc nhất giải đấu',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=200&fit=crop',
      },
      rulesSummary: {
        distanceRatio: 50,
        diligentRatio: 50,
        capDays: 140,
        rank1FeeVnd: 100000,
        tiedRank2FeeVnd: 200000,
        paceFloor: '2:45',
        minDistanceKm: 3.0,
      },
      teams: [
        { teamId: 'team-phoenix', name: 'Team Phoenix SARC', totalKm: 1250.0, teamDays: 118, membersCount: 16, captain: 'Nguyễn Văn A', trend: 'same' as const },
        { teamId: 'team-dragons', name: 'Team Dragons SADC', totalKm: 1000.0, teamDays: 150, membersCount: 16, captain: 'Trần Thị B', trend: 'same' as const },
        { teamId: 'team-tigers', name: 'Team Tigers SADC', totalKm: 920.0, teamDays: 129, membersCount: 16, captain: 'Lê Hoàng C', trend: 'same' as const },
      ],
      runners: [
        { userId: 'user-01', name: 'Nguyễn Văn A', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', rank: 1, totalKm: 125.0, diligentDays: 18, averagePace: '5:15', isCurrentUser: true, rewardBadge: '👑 Dẫn đầu nhận Áo thi đấu SARC độc bản', trend: 'same', trendDiff: 0 },
        { userId: 'user-02', name: 'Trần Thị B', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', teamId: 'team-dragons', teamName: 'Team Dragons SADC', rank: 2, totalKm: 118.0, diligentDays: 16, averagePace: '5:24', isCurrentUser: false, trend: 'up', trendDiff: 1 },
        { userId: 'user-03', name: 'Lê Hoàng C', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', teamId: 'team-tigers', teamName: 'Team Tigers SADC', rank: 3, totalKm: 105.0, diligentDays: 15, averagePace: '5:32', isCurrentUser: false, trend: 'down', trendDiff: 1 },
        { userId: 'user-04', name: 'Phạm Minh Đức', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces', teamId: 'team-dragons', teamName: 'Team Dragons SADC', rank: 4, totalKm: 96.0, diligentDays: 14, averagePace: '5:40', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-05', name: 'Hoàng Kim Dung', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces', teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', rank: 5, totalKm: 88.5, diligentDays: 12, averagePace: '5:45', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-06', name: 'Đặng Tuấn Kiệt', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces', teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', rank: 6, totalKm: 78.0, diligentDays: 11, averagePace: '5:50', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-07', name: 'Vũ Hải Nam', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces', teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', rank: 7, totalKm: 72.0, diligentDays: 10, averagePace: '6:00', isCurrentUser: false, trend: 'same', trendDiff: 0 },
      ],
      myTeamMembers: [
        { userId: 'user-01', name: 'Nguyễn Văn A', role: 'Captain', km: 125.0, diligentDays: 18, percentOfTeam: 10.0, isCurrentUser: true },
        { userId: 'user-05', name: 'Hoàng Kim Dung', role: 'Vice-Captain', km: 88.5, diligentDays: 12, percentOfTeam: 7.1, isCurrentUser: false },
        { userId: 'user-06', name: 'Đặng Tuấn Kiệt', role: 'Member', km: 78.0, diligentDays: 11, percentOfTeam: 6.2, isCurrentUser: false },
        { userId: 'user-07', name: 'Vũ Hải Nam', role: 'Member', km: 72.0, diligentDays: 10, percentOfTeam: 5.8, isCurrentUser: false },
        { userId: 'user-08', name: 'Ngô Thanh Tùng', role: 'Member', km: 68.0, diligentDays: 9, percentOfTeam: 5.4, isCurrentUser: false },
        { userId: 'user-09', name: 'Phan Thùy Trang', role: 'Member', km: 65.0, diligentDays: 9, percentOfTeam: 5.2, isCurrentUser: false },
      ],
      inviteCode: 'PHOENIX-SARC-TEAM'
    },

    'sarc-trail-challenge-bavi-2026': {
      id: 'race-trail-bavi-2026',
      slug: 'sarc-trail-challenge-bavi-2026',
      name: 'SARC Trail Challenge Ba Vì 2026',
      shortName: 'SARC Trail Challenge Ba Vì 2026',
      clubName: 'SARC Trail Division',
      category: 'Địa Hình & Thưởng Dốc Trail',
      status: 'running' as const,
      statusLabel: 'Đang diễn ra',
      startAt: '2026-10-15T00:00:00Z',
      endAt: '2026-12-31T23:59:59Z',
      location: 'Vườn Quốc Gia Ba Vì & Núi đồi tự do',
      totalAthletes: 64,
      totalTeams: 4,
      totalKm: 4890.5,
      totalValidPersonDays: 512,
      userParticipation: {
        isParticipating: true,
        teamId: 'team-dragons-trail',
        teamName: 'Dragons Trail',
        role: 'Thành viên',
        personalKm: 42.0,
        standing: 'Đồng hạng 2',
        rank: 2,
      },
      topReward: {
        title: 'Kỷ niệm chương Vàng Ultra Ba Vì & Áo gió SARC Pro Series',
        description: 'Dành riêng cho cá nhân xuất sắc nhất trên cung đường mòn Ba Vì',
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
      },
      rulesSummary: {
        distanceRatio: 60,
        diligentRatio: 40,
        capDays: 140,
        rank1FeeVnd: 150000,
        tiedRank2FeeVnd: 250000,
        paceFloor: '3:15',
        minDistanceKm: 5.0,
        trailElevationBonus: '+1.0 km cho mỗi 100m elevation gain (D+)',
      },
      teams: [
        { teamId: 'team-phoenix-mountain', name: 'Phoenix Mountain SARC', totalKm: 1480.0, teamDays: 135, membersCount: 16, captain: 'Hoàng Kim Dung', trend: 'up' as const },
        { teamId: 'team-dragons-trail', name: 'Dragons Trail', totalKm: 1210.5, teamDays: 128, membersCount: 16, captain: 'Phạm Minh Đức', trend: 'same' as const },
        { teamId: 'team-tigers-trail', name: 'Tigers Trail', totalKm: 1120.0, teamDays: 120, membersCount: 16, captain: 'Lê Hoàng C', trend: 'same' as const },
        { teamId: 'team-bavi-ultra', name: 'Ba Vì Ultra Runners', totalKm: 1080.0, teamDays: 115, membersCount: 16, captain: 'Vũ Hải Nam', trend: 'down' as const },
      ],
      runners: [
        { userId: 'user-05', name: 'Hoàng Kim Dung', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces', teamId: 'team-phoenix-mountain', teamName: 'Phoenix Mountain SARC', rank: 1, totalKm: 145.0, diligentDays: 19, averagePace: '5:45', isCurrentUser: false, rewardBadge: '👑 Dẫn đầu nhận Kỷ niệm chương Vàng Ultra Ba Vì', trend: 'same', trendDiff: 0 },
        { userId: 'user-04', name: 'Phạm Minh Đức', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces', teamId: 'team-dragons-trail', teamName: 'Dragons Trail', rank: 2, totalKm: 122.0, diligentDays: 17, averagePace: '5:40', isCurrentUser: false, trend: 'up', trendDiff: 1 },
        { userId: 'user-02', name: 'Trần Thị B', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', teamId: 'team-dragons-trail', teamName: 'Dragons Trail', rank: 3, totalKm: 110.5, diligentDays: 16, averagePace: '5:35', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-01', name: 'Nguyễn Văn A', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', teamId: 'team-dragons-trail', teamName: 'Dragons Trail', rank: 4, totalKm: 42.0, diligentDays: 8, averagePace: '6:10', isCurrentUser: true, trend: 'same', trendDiff: 0 },
        { userId: 'user-06', name: 'Đặng Tuấn Kiệt', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces', teamId: 'team-tigers-trail', teamName: 'Tigers Trail', rank: 5, totalKm: 38.0, diligentDays: 7, averagePace: '6:30', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-07', name: 'Vũ Hải Nam', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces', teamId: 'team-bavi-ultra', teamName: 'Ba Vì Ultra Runners', rank: 6, totalKm: 35.0, diligentDays: 6, averagePace: '6:45', isCurrentUser: false, trend: 'same', trendDiff: 0 },
      ],
      myTeamMembers: [
        { userId: 'user-04', name: 'Phạm Minh Đức', role: 'Captain', km: 122.0, diligentDays: 17, percentOfTeam: 10.1, isCurrentUser: false },
        { userId: 'user-02', name: 'Trần Thị B', role: 'Vice-Captain', km: 110.5, diligentDays: 16, percentOfTeam: 9.1, isCurrentUser: false },
        { userId: 'user-01', name: 'Nguyễn Văn A', role: 'Member', km: 42.0, diligentDays: 8, percentOfTeam: 3.5, isCurrentUser: true },
        { userId: 'user-10', name: 'Lê Hải Đăng', role: 'Member', km: 95.0, diligentDays: 14, percentOfTeam: 7.8, isCurrentUser: false },
        { userId: 'user-11', name: 'Vũ Bích Hạnh', role: 'Member', km: 88.0, diligentDays: 13, percentOfTeam: 7.3, isCurrentUser: false },
      ],
      inviteCode: 'DRAGONS-TRAIL-BAVI'
    },

    'vpbank-hanoi-marathon-prep-2026': {
      id: 'race-vpbank-prep',
      slug: 'vpbank-hanoi-marathon-prep-2026',
      name: 'VPBank Hanoi Marathon Prep 2026',
      shortName: 'VPBank Hanoi Marathon Prep 2026',
      clubName: 'Hanoi Runners Union & SARC',
      category: 'Tích Lũy Tốc Độ & Long Run Hồ Tây',
      status: 'running' as const,
      statusLabel: 'Đang diễn ra',
      startAt: '2026-10-01T00:00:00Z',
      endAt: '2026-12-20T23:59:59Z',
      location: 'Hà Nội (Hồ Tây, Phố Cổ)',
      totalAthletes: 36,
      totalTeams: 3,
      totalKm: 2450.0,
      totalValidPersonDays: 270,
      userParticipation: {
        isParticipating: true,
        teamId: 'team-tigers-speed',
        teamName: 'Tigers Speed',
        role: 'Thành viên',
        personalKm: 68.0,
        standing: 'Đồng hạng 2',
        rank: 2,
      },
      topReward: {
        title: 'Vé xuất phát VIP Marathon 2026 & Đai chạy bộ cao cấp',
        description: 'Vinh danh cá nhân dẫn đầu giai đoạn luyện tốc độ',
        imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&h=200&fit=crop',
      },
      rulesSummary: {
        distanceRatio: 70,
        diligentRatio: 30,
        capDays: 140,
        rank1FeeVnd: 100000,
        tiedRank2FeeVnd: 150000,
        paceFloor: '3:00',
        minDistanceKm: 5.0,
      },
      teams: [
        { teamId: 'team-hanoi-fast', name: 'Hanoi Fast Striders', totalKm: 980.0, teamDays: 88, membersCount: 12, captain: 'Lê Hoàng C', trend: 'up' as const },
        { teamId: 'team-tigers-speed', name: 'Tigers Speed', totalKm: 810.0, teamDays: 80, membersCount: 12, captain: 'Đặng Tuấn Kiệt', trend: 'same' as const },
        { teamId: 'team-old-quarter', name: 'Old Quarter Runners', totalKm: 660.0, teamDays: 74, membersCount: 12, captain: 'Ngô Thanh Tùng', trend: 'same' as const },
      ],
      runners: [
        { userId: 'user-03', name: 'Lê Hoàng C', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', teamId: 'team-hanoi-fast', teamName: 'Hanoi Fast Striders', rank: 1, totalKm: 115.0, diligentDays: 17, averagePace: '4:55', isCurrentUser: false, rewardBadge: '👑 Dẫn đầu nhận Vé VIP Marathon 2026', trend: 'same', trendDiff: 0 },
        { userId: 'user-01', name: 'Nguyễn Văn A', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', teamId: 'team-tigers-speed', teamName: 'Tigers Speed', rank: 2, totalKm: 68.0, diligentDays: 11, averagePace: '5:10', isCurrentUser: true, trend: 'same', trendDiff: 0 },
        { userId: 'user-06', name: 'Đặng Tuấn Kiệt', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces', teamId: 'team-tigers-speed', teamName: 'Tigers Speed', rank: 3, totalKm: 65.0, diligentDays: 10, averagePace: '5:18', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-02', name: 'Trần Thị B', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', teamId: 'team-old-quarter', teamName: 'Old Quarter Runners', rank: 4, totalKm: 62.0, diligentDays: 9, averagePace: '5:25', isCurrentUser: false, trend: 'same', trendDiff: 0 },
      ],
      myTeamMembers: [
        { userId: 'user-06', name: 'Đặng Tuấn Kiệt', role: 'Captain', km: 65.0, diligentDays: 10, percentOfTeam: 8.0, isCurrentUser: false },
        { userId: 'user-01', name: 'Nguyễn Văn A', role: 'Member', km: 68.0, diligentDays: 11, percentOfTeam: 8.4, isCurrentUser: true },
        { userId: 'user-12', name: 'Bùi Đức Anh', role: 'Member', km: 75.0, diligentDays: 11, percentOfTeam: 9.3, isCurrentUser: false },
      ],
      inviteCode: 'TIGERS-SPEED-VPBANK'
    },

    'vnexpress-marathon-hue-2027': {
      id: 'race-vm-hue-2027',
      slug: 'vnexpress-marathon-hue-2027',
      name: 'VnExpress Marathon Cố Đô Huế 2027',
      shortName: 'VnExpress Marathon Cố Đô Huế 2027',
      clubName: 'Huế Heritage Runners & Liên Minh SARC',
      category: 'Giải Chạy Du Lịch Cố Đô',
      status: 'upcoming' as const,
      statusLabel: 'Sắp diễn ra',
      startAt: '2027-03-15T00:00:00Z',
      endAt: '2027-04-30T23:59:59Z',
      location: 'Thành phố Huế, Thừa Thiên Huế',
      totalAthletes: 24,
      totalTeams: 2,
      totalKm: 0.0,
      targetKm: 5000.0,
      totalValidPersonDays: 0,
      userParticipation: {
        isParticipating: false,
        standing: 'Chưa tham gia (Mở đăng ký)',
      },
      topReward: {
        title: 'Huy chương mạ bạc men lam Huế & Vé máy bay tài trợ',
        description: 'Vinh danh đoàn thể thao có thành tích xuất sắc nhất',
        imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&h=200&fit=crop',
      },
      rulesSummary: {
        distanceRatio: 50,
        diligentRatio: 50,
        capDays: 140,
        rank1FeeVnd: 100000,
        tiedRank2FeeVnd: 200000,
        paceFloor: '2:45',
        minDistanceKm: 3.0,
      },
      teams: [
        { teamId: 'team-huong-giang', name: 'Hương Giang Striders', totalKm: 0.0, teamDays: 0, membersCount: 12, captain: 'Phan Thùy Trang', trend: 'same' as const },
        { teamId: 'team-ngu-binh', name: 'Ngự Bình Runners', totalKm: 0.0, teamDays: 0, membersCount: 12, captain: 'Vũ Hải Nam', trend: 'same' as const },
      ],
      runners: [
        { userId: 'user-09', name: 'Phan Thùy Trang', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', teamId: 'team-huong-giang', teamName: 'Hương Giang Striders', rank: 1, totalKm: 0.0, diligentDays: 0, averagePace: '0:00', isCurrentUser: false, trend: 'same', trendDiff: 0 },
        { userId: 'user-07', name: 'Vũ Hải Nam', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces', teamId: 'team-ngu-binh', teamName: 'Ngự Bình Runners', rank: 2, totalKm: 0.0, diligentDays: 0, averagePace: '0:00', isCurrentUser: false, trend: 'same', trendDiff: 0 },
      ],
      myTeamMembers: [
        { userId: 'user-09', name: 'Phan Thùy Trang', role: 'Captain', km: 0.0, diligentDays: 0, percentOfTeam: 0, isCurrentUser: false },
        { userId: 'user-07', name: 'Vũ Hải Nam', role: 'Member', km: 0.0, diligentDays: 0, percentOfTeam: 0, isCurrentUser: false },
      ],
      inviteCode: 'HUE-HERITAGE-2027'
    }
  };

  private teamCheers = [
    { id: 'c-1', author: 'Nguyễn Văn A (Captain)', message: 'Toàn đội duy trì phong độ nhé! Cự ly đang dẫn đầu toàn giải!', timestamp: '10 phút trước' },
    { id: 'c-2', author: 'Hoàng Kim Dung', message: 'Sáng mai 5h Hồ Tây chạy tiếp nhé mọi người ơi!', timestamp: '25 phút trước' },
    { id: 'c-3', author: 'Đặng Tuấn Kiệt', message: 'Đã hoàn thành bài chạy 10km sáng nay, điểm chuyên cần +1!', timestamp: '1 giờ trước' },
  ];

  constructor(private dataStore: InMemoryDataStore) {}

  /**
   * Get all races overview with user participation status
   */
  getAllRacesOverview(currentUserId = 'user-01'): RaceOverviewDto[] {
    return Object.values(this.racesData).map((race) => {
      const endAt = new Date(race.endAt);
      const now = new Date();
      const diffMs = Math.max(0, endAt.getTime() - now.getTime());
      const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      return {
        id: race.id,
        slug: race.slug,
        name: race.name,
        shortName: race.shortName,
        clubName: race.clubName,
        category: race.category,
        status: race.status,
        statusLabel: race.statusLabel,
        startAt: race.startAt,
        endAt: race.endAt,
        location: race.location,
        totalAthletes: race.totalAthletes,
        totalTeams: race.totalTeams,
        totalKm: race.totalKm,
        targetKm: race.targetKm,
        daysRemaining,
        userParticipation: race.userParticipation,
        topReward: race.topReward,
        rulesSummary: race.rulesSummary,
      };
    });
  }

  /**
   * [2.1] Get Hero Banner details & Race metrics
   */
  getRaceHero(slug = 'season-10-run-to-techcombank'): RaceHeroDto {
    const race = this.racesData[slug] || this.racesData['season-10-run-to-techcombank'];
    const endAt = new Date(race.endAt);
    const now = new Date();
    const diffMs = Math.max(0, endAt.getTime() - now.getTime());
    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutesRemaining = Math.floor((diffMs / (1000 * 60)) % 60);
    const secondsRemaining = Math.floor((diffMs / 1000) % 60);

    return {
      id: race.id,
      slug: race.slug,
      name: race.name,
      clubName: race.clubName,
      category: race.category,
      status: race.status,
      statusLabel: race.statusLabel,
      startAt: race.startAt,
      endAt: race.endAt,
      location: race.location,
      totalAthletes: race.totalAthletes,
      totalTeams: race.totalTeams,
      totalKm: race.totalKm,
      targetKm: race.targetKm,
      totalValidPersonDays: race.totalValidPersonDays,
      daysRemaining,
      hoursRemaining,
      minutesRemaining,
      secondsRemaining,
      userParticipation: race.userParticipation,
      topReward: race.topReward,
      rulesSummary: race.rulesSummary,
    };
  }

  /**
   * [2.2] Get Team Leaderboard with Rank 1 and Tied Rank 2
   */
  getTeamLeaderboard(slug = 'season-10-run-to-techcombank'): TeamLeaderboardDto {
    const race = this.racesData[slug] || this.racesData['season-10-run-to-techcombank'];
    const rawTeams = race.teams || [];
    const maxKm = Math.max(1, ...rawTeams.map((t: any) => t.totalKm));

    const scoredTeams = rawTeams.map((team: any) => {
      const scores = computeTeamScore(team.totalKm, maxKm, team.teamDays, race.rulesSummary?.capDays || 140);
      return {
        teamId: team.teamId,
        name: team.name,
        totalKm: team.totalKm,
        teamDays: team.teamDays,
        scores,
        membersCount: team.membersCount,
        captain: team.captain,
        trend: team.trend || 'same',
      };
    });

    const ranked = rankTeams(scoredTeams, 'top1_then_tied_second');

    const resultTeams: TeamLeaderboardItemDto[] = ranked.map((r, index) => {
      const isTop1 = r.rank === 1;
      const rank1Fee = race.rulesSummary?.rank1FeeVnd || 100000;
      const tiedFee = race.rulesSummary?.tiedRank2FeeVnd || 200000;

      return {
        teamId: r.teamId,
        name: r.name,
        rank: r.rank,
        rankLabel: isTop1 ? 'Hạng 1 (Vô Địch Dẫn Đầu)' : 'Đồng Hạng 2',
        badge: isTop1 ? 'gold' : 'silver',
        totalKm: r.totalKm,
        diligentDays: r.teamDays,
        scores: r.scores,
        expectedFundFeeVnd: isTop1 ? rank1Fee : tiedFee,
        fundLabel: isTop1 ? `${rank1Fee.toLocaleString('vi-VN')}đ/người (Quỹ Vô Địch)` : `${tiedFee.toLocaleString('vi-VN')}đ/người (Quỹ Đồng Hạng 2)`,
        trend: (r as any).trend || 'same',
        membersCount: (r as any).membersCount || 16,
        captain: (r as any).captain,
      };
    });

    return {
      raceSlug: race.slug,
      raceName: race.shortName || race.name,
      rankingPolicy: 'top1_then_tied_second',
      teams: resultTeams,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * [2.3] Get Individual Leaderboard with Top 1 Reward & Sticky Self Row
   */
  getIndividualLeaderboard(slug = 'season-10-run-to-techcombank', currentUserId = 'user-01'): IndividualLeaderboardDto {
    const race = this.racesData[slug] || this.racesData['season-10-run-to-techcombank'];
    const rawRunners = race.runners || [];
    const sorted = [...rawRunners].sort((a: any, b: any) => b.totalKm - a.totalKm);

    const updatedRunners = sorted.map((runner: any, index) => {
      const rank = index + 1;
      const isTop1 = rank === 1;
      return {
        ...runner,
        rank,
        isCurrentUser: runner.userId === currentUserId,
        rewardBadge: isTop1 ? (runner.rewardBadge || `👑 Dẫn đầu: ${race.topReward.title}`) : undefined,
      };
    });

    const currentUserSummary = updatedRunners.find((r) => r.isCurrentUser) || updatedRunners[0] || {
      userId: currentUserId,
      name: 'Nguyễn Văn A',
      avatarUrl: '',
      teamId: '',
      teamName: 'Chưa tham gia',
      rank: 99,
      totalKm: 0,
      diligentDays: 0,
      averagePace: '0:00',
      isCurrentUser: true,
      trend: 'same' as const,
      trendDiff: 0,
    };

    return {
      raceSlug: race.slug,
      totalParticipants: updatedRunners.length,
      topReward: race.topReward.title,
      runners: updatedRunners,
      currentUserSummary,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * [2.4] Get My Team Space
   */
  getMyTeamSpace(slug = 'season-10-run-to-techcombank', userId = 'user-01'): MyTeamSpaceDto {
    const race = this.racesData[slug] || this.racesData['season-10-run-to-techcombank'];
    const teamLeaderboard = this.getTeamLeaderboard(slug);

    const targetTeamId = race.userParticipation?.teamId || 'team-phoenix';
    const myTeam: any = teamLeaderboard.teams.find((t) => t.teamId === targetTeamId) || teamLeaderboard.teams[0] || {
      teamId: 'team-default',
      name: 'Chưa chọn đội',
      rank: 1,
      rankLabel: 'Hạng 1',
      badge: 'gold' as const,
      totalKm: 0,
      captain: 'Nguyễn Văn A',
    };

    const teamMembers: TeamMemberDto[] = race.myTeamMembers || [];
    const targetKm = 1500.0;
    const progressPercent = Math.min(100, Math.round((myTeam.totalKm / targetKm) * 1000) / 10);

    return {
      teamId: myTeam.teamId,
      teamName: myTeam.name,
      raceSlug: race.slug,
      captain: `${myTeam.captain || teamMembers[0]?.name || 'Nguyễn Văn A'} (Đội trưởng)`,
      rank: myTeam.rank,
      rankLabel: myTeam.rankLabel,
      badge: myTeam.badge,
      totalKm: myTeam.totalKm,
      targetKm,
      progressPercent,
      totalMembers: teamMembers.length,
      maxCapacity: 16,
      teamInviteCode: race.inviteCode || 'OPRACE-TEAM',
      members: teamMembers,
      cheerFeed: this.teamCheers,
    };
  }

  /**
   * Post a cheer message
   */
  postCheer(author: string, message: string): void {
    this.teamCheers.unshift({
      id: `c-${Date.now()}`,
      author,
      message,
      timestamp: 'Vừa xong',
    });
  }

  /**
   * [2.5] Live Stream SSE handling
   */
  addStreamClient(slug: string, res: any): void {
    if (!this.liveStreamListeners.has(slug)) {
      this.liveStreamListeners.set(slug, new Set());
    }
    this.liveStreamListeners.get(slug)?.add(res);

    const initialEvent: LiveStreamEventDto = {
      type: 'activity_verified',
      athleteName: 'Hệ thống',
      teamName: 'OpenRace Live',
      distanceKm: 0,
      message: 'Kết nối SSE Đấu trường trực tiếp thành công!',
      timestamp: new Date().toISOString(),
    };
    res.write(`data: ${JSON.stringify({ event: 'snapshot', data: initialEvent })}\n\n`);
  }

  removeStreamClient(slug: string, res: any): void {
    this.liveStreamListeners.get(slug)?.delete(res);
  }

  broadcastLiveEvent(slug: string, event: LiveStreamEventDto): void {
    const clients = this.liveStreamListeners.get(slug);
    if (clients) {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      clients.forEach((res) => {
        try {
          res.write(data);
        } catch (e) {
          clients.delete(res);
        }
      });
    }
  }
}
