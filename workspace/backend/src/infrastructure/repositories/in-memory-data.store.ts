/**
 * In-Memory Data Store simulating Supabase PostgreSQL with RLS semantics
 */

import type {
  Activity,
  EvaluationResult,
  SystemUser,
  SystemRole,
  SystemConfigCategory,
  SystemConfigParameter,
  PlatformConfig,
  CustomPlatformParam,
  HeartRateZone,
  TrainingLoadRecovery,
  RunningShoe,
  NutritionPlanInput,
  NutritionPlanResult,
  DigitalBadge,
  RunnerMilestonesStreak,
  ClubAdminKPIs,
  PendingActivityQueueItem,
  ClubDisputeQueueItem,
  ClubReconciliationItem,
  ClubBroadcastMessage,
  TeamStandingQuickView,
  ClubAdminDashboardDto,
  OpenRaceAdminItem,
  ClubPulseAnalyticsDto,
  ChurnRiskRunnerItem,
  HeatmapBlockItem,
  PortalRoleId,
  PortalRoleDefinition,
  NavigationMenuItem,
  NavigationGroup,
  UserNavigationContext,
  RaceSelectorItem,
  RaceKpiSummary,
  RaceDailyDistancePoint,
  RaceActivityTypeDistribution,
  RaceTeamStanding,
  RaceIndividualLeader,
  RaceSuspiciousViolationQueueItem,
  RaceDashboardOverviewDto,
  RaceExportReportDto,
  ParticipantScope,
  ScoringMethod,
  IndividualRankingCriteria,
  TeamRankingMethod,
  AwardCategoryItem,
  AutoCalculatedAwardWinner,
  DynamicRaceSetupConfig,
  DeepPartial,
  RaceTemplatePreset,
  AdminRaceHubItem,
  AdminRaceHubResponse,
  ClubProfileConfig,
  ClubBankAccountItem,
  TournamentFinancialRules,
  ClubMemberRole,
  ClubMemberMatrixItem,
  ClubInviteCodeItem,
  UnifiedClubCommandCenterResponse,
  RaceCapacityStats,
  TournamentHubSummary,
  TechnicalModerationDashboard,
  FinancialTreasuryLedger,
  StravaQuotaBurnRateDto,
  DlqSurgeryItemDto,
  DlqPayloadPatchRequestDto,
  WebhookReplayResponseDto,
  TenantHealthItemDto,
  TenantHealthMatrixDto,
  TenantFreezeToggleDto,
  ScopedRecomputeRequestDto,
  ScopedRecomputeProgressDto,
  HourlyConcurrencyHeatmapItemDto,
  TrafficVisitorMetricsDto,
  PartnerUptimeItemDto,
  PartnerApiKeyDto,
  GenerateApiKeyRequestDto,
  PartnerEcosystemDto,
  SaasBillingIntelligenceDto,
  SecurityAnomalyDto,
  ImmutableAuditLogDto,
  SecurityAuditHubDto
} from '../../domain/models/models';
import * as crypto from 'crypto';

export interface WebhookEventRecord {
  id: string;
  source: string;
  eventKey: string;
  payload: any;
  receivedAt: string;
  status: 'QUEUED' | 'PROCESSED';
}

export interface AppealRecord {
  id: string;
  raceId: string;
  userId: string;
  athleteName?: string;
  activityId: string;
  activityTitle?: string;
  distanceKm?: number;
  reason: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'APPROVED' | 'REJECTED';
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ParticipantLedgerRecord {
  participantId: string;
  userId: string;
  athleteName: string;
  teamId: string;
  teamName: string;
  rank: number;
  baseContributionVnd: number;
  penaltyVnd: number;
  totalDueVnd: number;
  paidVnd: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentReference: string;
  lastUpdated: string;
}

export interface PenaltyWaiverRecord {
  id: string;
  raceId: string;
  cycleId: string;
  userId: string;
  reason: string;
  grantedBy: string;
  grantedAt: string;
}

export interface AuditRecord {
  id: string;
  action: string;
  actorId: string;
  details: any;
  timestamp: string;
}

export class InMemoryDataStore {
  public activities: Map<string, Activity> = new Map();
  public webhookEvents: WebhookEventRecord[] = [];
  public raceLogs: Map<string, EvaluationResult> = new Map();
  public appeals: Map<string, AppealRecord> = new Map();
  public participantLedgers: Map<string, ParticipantLedgerRecord> = new Map();
  public penaltyWaivers: PenaltyWaiverRecord[] = [];
  public manualAdjustments: any[] = [];
  public auditLogs: AuditRecord[] = [];
  public raceStatus: Record<string, string> = {
    'race-season-10': 'running',
  };

  // System Administration & IAM Maps
  public systemUsers: Map<string, SystemUser> = new Map();
  public systemRoles: Map<string, SystemRole> = new Map();
  public systemCatalogs: Map<string, SystemConfigCategory> = new Map();
  public systemConfigs: Map<string, SystemConfigParameter> = new Map();
  public platformConfig!: PlatformConfig;

  // Pro Runner Dashboard & Equipment Maps
  public runningShoes: Map<string, RunningShoe> = new Map();
  public trainingLoads: Map<string, TrainingLoadRecovery> = new Map();
  public runnerMilestones: Map<string, RunnerMilestonesStreak> = new Map();

  // Club Admin & Captain Dashboard Maps
  public clubPendingActivities: Map<string, PendingActivityQueueItem> = new Map();
  public clubDisputes: Map<string, ClubDisputeQueueItem> = new Map();
  public clubReconciliations: Map<string, ClubReconciliationItem> = new Map();
  public clubBroadcasts: ClubBroadcastMessage[] = [];
  public clubSeasonWeekLocked: Record<number, { isLocked: boolean; lockedAt: string; totalKm: number }> = {};

  // Multi-Selection Tournament Dashboard Maps
  public racesMap: Map<string, RaceSelectorItem> = new Map();
  public raceDashboardsMap: Map<string, RaceDashboardOverviewDto> = new Map();
  public dynamicRaceSetups: Map<string, DynamicRaceSetupConfig> = new Map();
  public raceTemplates: Map<string, RaceTemplatePreset> = new Map();

  // [AC-CLUB-COMMAND-CENTER-01 to 04] All-in-One Command Center State
  public clubProfileConfig: ClubProfileConfig = {
    id: 'club-sarc',
    name: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
    slogan: 'Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội',
    description: 'Cộng đồng chạy bộ rèn luyện sức khỏe, kỷ luật và kết nối tương trợ lẫn nhau trên mọi cung đường.',
    logoUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=120',
    bankBin: '970407',
    bankName: 'Techcombank',
    bankAccountNumber: '1903688899901',
    bankAccountName: 'CLB CHAY BO SARC',
    vietQrQuickUrl: 'https://img.vietqr.io/image/970407-1903688899901-compact2.png?amount=0&addInfo=QUY%20CLB%20SARC&accountName=CLB%20CHAY%20BO%20SARC',
    bankAccounts: [
      {
        id: 'bank-acc-01',
        bankBin: '970422',
        bankName: 'MBBank Quân Đội',
        accountNumber: '0988889999',
        accountName: 'CLB CHAY PHU DONG SARC',
        isDefault: true,
        notes: 'Tài khoản quỹ chính nhận tiền phạt & đóng góp giải'
      },
      {
        id: 'bank-acc-02',
        bankBin: '970407',
        bankName: 'Techcombank',
        accountNumber: '1903688899901',
        accountName: 'CLB CHAY BO SARC',
        isDefault: false,
        notes: 'Tài khoản chi tiêu & quỹ sinh hoạt định kỳ CLB'
      },
      {
        id: 'bank-acc-03',
        bankBin: '970436',
        bankName: 'Vietcombank',
        accountNumber: '0011004567890',
        accountName: 'QUY DU PHONG SARC',
        isDefault: false,
        notes: 'Tài khoản quỹ thiện nguyện & tiếp sức đường đua'
      }
    ],
    totalActiveMembers: 128,
    pendingCount: 2,
    activeCodesCount: 2
  };
  public clubMemberMatrix: Map<string, ClubMemberMatrixItem> = new Map();
  public clubInviteCodes: Map<string, ClubInviteCodeItem> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    this.platformConfig = {
      appName: 'OpenRace',
      brandTag: 'SAAS',
      slogan: 'Nền Tảng Thể Thao & Vận Hành Giải Chạy Doanh Nghiệp Toàn Diện',
      version: 'v3.2.1 Enterprise',
      logoPreset: 'bolt',
      logoUrl: '',
      copyright: 'OpenRace Technology Corp © 2026',
      defaultTheme: 'mantis',
      colorMode: 'light',
      language: 'vi-VN',
      timezone: 'Asia/Ho_Chi_Minh',
      distanceUnit: 'km',
      currency: 'VND',
      supportEmail: 'support@openrace.vn',
      hotline: '1900 6868 (8:00 - 22:00)',
      tosUrl: 'https://openrace.vn/legal/terms',
      privacyUrl: 'https://openrace.vn/legal/privacy',
      gdprExportEnabled: true,
      stravaAutoSync: true,
      wearablesApi: true,
      vietqrAutoReconcile: true,
      weeklyCutoffSchedule: '23:59:59 Chủ Nhật hàng tuần',
      hardAntiCheatFloorPaceMinKm: 2.25,
      autoTrimVehicleTailDefault: true,
      autoTrimSpeedThresholdKmh: 25.0,
      webhookDlqMaxRetries: 3,
      customParameters: [
        {
          id: 'cfg-cust-01',
          key: 'PLATFORM_MULTI_TENANCY',
          name: 'Chế độ Đa Doanh Nghiệp (Multi-Tenancy)',
          value: 'true',
          description: 'Cho phép phân tách không gian dữ liệu độc lập giữa các CLB và doanh nghiệp',
          status: 'ACTIVE',
        },
        {
          id: 'cfg-cust-02',
          key: 'MAX_ATHLETES_PER_CLUB',
          name: 'Giới Hạn Thành Viên CLB Tiêu Chuẩn',
          value: '1000',
          description: 'Số lượng VĐV tối đa cho mỗi CLB đăng ký gói Enterprise',
          status: 'ACTIVE',
        },
      ],
      updatedAt: new Date().toISOString(),
      updatedBy: 'Hệ Thống',
    };

    // Seed sample appeal
    const appeal1: AppealRecord = {
      id: 'app-1001',
      raceId: 'race-season-10',
      userId: 'user-02',
      athleteName: 'Trần Thị B',
      activityId: 'act-strava-7788',
      activityTitle: 'Chạy Trail Đền Gióng Sóc Sơn',
      distanceKm: 6.0,
      reason: 'Đoạn leo dốc dốc đá GPS mất tín hiệu 200m dẫn đến pace 12:15, tổng gain 260m đạt chuẩn Trail',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    };
    this.appeals.set(appeal1.id, appeal1);

    // Seed participant ledgers
    this.participantLedgers.set('p-01', {
      participantId: 'p-01',
      userId: 'user-01',
      athleteName: 'Nguyễn Văn A',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      rank: 1,
      baseContributionVnd: 100000,
      penaltyVnd: 0,
      totalDueVnd: 100000,
      paidVnd: 100000,
      status: 'PAID',
      paymentReference: 'OR10-P01-A',
      lastUpdated: new Date().toISOString(),
    });

    this.participantLedgers.set('p-02', {
      participantId: 'p-02',
      userId: 'user-02',
      athleteName: 'Trần Thị B',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      rank: 2,
      baseContributionVnd: 200000,
      penaltyVnd: 50000,
      totalDueVnd: 250000,
      paidVnd: 0,
      status: 'UNPAID',
      paymentReference: 'OR10-P02-B',
      lastUpdated: new Date().toISOString(),
    });

    this.participantLedgers.set('p-03', {
      participantId: 'p-03',
      userId: 'user-03',
      athleteName: 'Lê Hoàng C',
      teamId: 'team-tigers',
      teamName: 'Team Tigers SADC',
      rank: 2,
      baseContributionVnd: 200000,
      penaltyVnd: 0,
      totalDueVnd: 200000,
      paidVnd: 0,
      status: 'UNPAID',
      paymentReference: 'OR10-P03-C',
      lastUpdated: new Date().toISOString(),
    });

    // Seed audit log
    this.auditLogs.push({
      id: 'aud-001',
      action: 'SYSTEM_BOOTSTRAP',
      actorId: 'system',
      details: { message: 'OpenRace SaaS Engine initialized with Supabase Schema' },
      timestamp: new Date().toISOString(),
    });

    // Seed activities for user-01 (Nguyen Van A)
    this.activities.set('act-000076', {
      id: 'act-000076',
      userId: 'user-01',
      stravaActivityId: 'strava-889976',
      sportType: 'Run',
      distanceM: 5200,
      movingTimeS: 1800,
      elapsedTimeS: 1850,
      elevationGainM: 15,
      startAt: new Date(Date.now() - 3600000 * 2),
      status: 'active',
    });

    this.activities.set('act-000075', {
      id: 'act-000075',
      userId: 'user-01',
      stravaActivityId: 'strava-889975',
      sportType: 'TrailRun',
      distanceM: 8000,
      movingTimeS: 3600,
      elapsedTimeS: 3700,
      elevationGainM: 260,
      startAt: new Date(Date.now() - 3600000 * 24),
      status: 'active',
    });

    this.activities.set('act-000074', {
      id: 'act-000074',
      userId: 'user-01',
      stravaActivityId: 'strava-889974',
      sportType: 'Run',
      distanceM: 10000,
      movingTimeS: 3300,
      elapsedTimeS: 3400,
      elevationGainM: 20,
      startAt: new Date(Date.now() - 3600000 * 48),
      status: 'active',
    });

    this.activities.set('act-000073', {
      id: 'act-000073',
      userId: 'user-01',
      stravaActivityId: 'strava-889973',
      sportType: 'Run',
      distanceM: 2400,
      movingTimeS: 750,
      elapsedTimeS: 800,
      elevationGainM: 5,
      startAt: new Date(Date.now() - 3600000 * 72),
      status: 'active',
    });

    this.activities.set('act-000072', {
      id: 'act-000072',
      userId: 'user-01',
      stravaActivityId: 'strava-889972',
      sportType: 'Run',
      distanceM: 6000,
      movingTimeS: 900, // 2:30 min/km -> Pace violation (< 2:45)
      elapsedTimeS: 920,
      elevationGainM: 10,
      startAt: new Date(Date.now() - 3600000 * 96),
      status: 'active',
    });

    // Seed System Administration IAM & Setup Catalogs
    this.seedSystemAdminData();

    // Seed Pro Runner Equipment, Training Load, Milestones
    this.seedProRunnerData();

    // Seed Club Admin & Captain Dashboard
    this.seedClubAdminData();

    // Seed Multi-Selection Tournament Dashboard
    this.seedRaceDashboardData();

    // Seed Dynamic Race Setup Configs & Catalog Presets
    this.seedDynamicRaceSetups();

    // Seed All-in-One Club Command Center Data
    this.seedClubCommandCenterData();
  }

  private seedSystemAdminData(): void {
    // 1. Seed Roles
    const roles: SystemRole[] = [
      {
        id: 'role-super-admin',
        code: 'SUPER_ADMIN',
        name: 'Tổng Quản Trị Hệ Thống',
        description: 'Toàn quyền cấu hình nền tảng, quản lý người dùng, phân quyền RBAC và danh mục thiết lập',
        permissions: ['users.all', 'roles.all', 'configs.all', 'activities.all', 'appeals.all', 'finance.all', 'audit.all'],
        isSystemDefault: true,
        status: 'ACTIVE',
        userCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
      {
        id: 'role-club-admin',
        code: 'CLUB_ADMIN',
        name: 'Quản Trị Viên CLB',
        description: 'Quản lý câu lạc bộ, giải đấu nội bộ, duyệt khiếu nại bài chạy và danh sách thành viên',
        permissions: ['club.manage', 'race.manage', 'appeals.manage', 'members.manage', 'finance.view'],
        isSystemDefault: true,
        status: 'ACTIVE',
        userCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
      {
        id: 'role-team-leader',
        code: 'TEAM_LEADER',
        name: 'Đội Trưởng Thi Đấu',
        description: 'Quản lý thành viên đội, phân bổ chiến thuật cự ly tuần, gửi khiếu nại bài chạy của đội',
        permissions: ['teams.manage', 'appeals.create', 'feed.post', 'chat.manage'],
        isSystemDefault: true,
        status: 'ACTIVE',
        userCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
      {
        id: 'role-race-director',
        code: 'RACE_DIRECTOR',
        name: 'Giám Đốc Giải Đấu',
        description: 'Chỉ huy chuyên môn, ban hành thể lệ thi đấu, thẩm định dốc Trail và cấp chứng nhận Finisher',
        permissions: ['race.manage', 'rules.config', 'certificates.issue', 'appeals.manage'],
        isSystemDefault: true,
        status: 'ACTIVE',
        userCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
      {
        id: 'role-runner-athlete',
        code: 'RUNNER_ATHLETE',
        name: 'Vận Động Viên (Runner)',
        description: 'Đồng bộ Strava/Garmin/Coros, ghi nhận bài chạy hợp lệ, xem BXH và thanh toán đóng góp',
        permissions: ['activities.sync', 'activities.view', 'finance.pay', 'appeals.create', 'feed.view'],
        isSystemDefault: true,
        status: 'ACTIVE',
        userCount: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
      {
        id: 'role-auditor',
        code: 'AUDITOR',
        name: 'Kiểm Toán Viên Kỹ Thuật',
        description: 'Giám sát vi phạm thể lệ, kiểm tra tốc độ phương tiện cơ giới và đối soát sổ nợ VietQR',
        permissions: ['audit.view', 'finance.audit', 'telemetry.view', 'reports.export'],
        isSystemDefault: true,
        status: 'ACTIVE',
        userCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
      {
        id: 'role-custom-referee',
        code: 'REFEREE_OFFICIAL',
        name: 'Trọng Tài Giám Sát Đường Chạy',
        description: 'Giám sát trực tiếp thông số GPS, nhịp tim Treadmill và kích hoạt công cụ Auto-Trim xe máy',
        permissions: ['activities.autotrim', 'activities.verify', 'appeals.view'],
        isSystemDefault: false,
        status: 'ACTIVE',
        userCount: 0,
        createdAt: '2026-02-15T00:00:00.000Z',
        updatedAt: '2026-11-06T18:00:00.000Z',
      },
    ];
    roles.forEach(r => this.systemRoles.set(r.id, r));

    // 2. Seed Users
    const users: SystemUser[] = [
      {
        id: 'usr-001',
        username: 'nguyenvana',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@openrace.vn',
        phone: '0901234567',
        roleId: 'role-super-admin',
        roleName: 'Tổng Quản Trị Hệ Thống',
        clubId: 'club-sarc',
        clubName: 'Sài Gòn Athletes Running Club (SARC)',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'ACTIVE',
        createdAt: '2026-01-10T08:00:00.000Z',
        lastLoginAt: '2026-11-06T18:30:00.000Z',
        updatedAt: '2026-11-06T18:30:00.000Z',
      },
      {
        id: 'usr-002',
        username: 'tranthib',
        fullName: 'Trần Thị B',
        email: 'tranthib@openrace.vn',
        phone: '0902345678',
        roleId: 'role-club-admin',
        roleName: 'Quản Trị Viên CLB',
        clubId: 'club-sarc',
        clubName: 'Sài Gòn Athletes Running Club (SARC)',
        teamId: 'team-dragons',
        teamName: 'Team Dragons SADC',
        status: 'ACTIVE',
        createdAt: '2026-01-15T09:00:00.000Z',
        lastLoginAt: '2026-11-06T17:15:00.000Z',
        updatedAt: '2026-11-06T17:15:00.000Z',
      },
      {
        id: 'usr-003',
        username: 'lehoangc',
        fullName: 'Lê Hoàng C',
        email: 'lehoangc@openrace.vn',
        phone: '0903456789',
        roleId: 'role-team-leader',
        roleName: 'Đội Trưởng Thi Đấu',
        clubId: 'club-sarc',
        clubName: 'Sài Gòn Athletes Running Club (SARC)',
        teamId: 'team-tigers',
        teamName: 'Team Tigers SADC',
        status: 'ACTIVE',
        createdAt: '2026-01-20T10:00:00.000Z',
        lastLoginAt: '2026-11-06T16:00:00.000Z',
        updatedAt: '2026-11-06T16:00:00.000Z',
      },
      {
        id: 'usr-004',
        username: 'phamminhduc',
        fullName: 'Phạm Minh Đức',
        email: 'duc.pham@openrace.vn',
        phone: '0904567890',
        roleId: 'role-race-director',
        roleName: 'Giám Đốc Giải Đấu',
        clubId: 'club-sarc',
        clubName: 'Sài Gòn Athletes Running Club (SARC)',
        status: 'ACTIVE',
        createdAt: '2026-02-01T08:30:00.000Z',
        lastLoginAt: '2026-11-05T14:20:00.000Z',
        updatedAt: '2026-11-05T14:20:00.000Z',
      },
      {
        id: 'usr-005',
        username: 'hoangkimdung',
        fullName: 'Hoàng Kim Dung',
        email: 'dung.hoang@audit.openrace.vn',
        phone: '0905678901',
        roleId: 'role-auditor',
        roleName: 'Kiểm Toán Viên Kỹ Thuật',
        status: 'ACTIVE',
        createdAt: '2026-02-10T11:00:00.000Z',
        lastLoginAt: '2026-11-06T11:45:00.000Z',
        updatedAt: '2026-11-06T11:45:00.000Z',
      },
      {
        id: 'usr-006',
        username: 'dangtuankiet',
        fullName: 'Đặng Tuấn Kiệt',
        email: 'kiet.dang@athlete.vn',
        phone: '0906789012',
        roleId: 'role-runner-athlete',
        roleName: 'Vận Động Viên (Runner)',
        clubId: 'club-sarc',
        clubName: 'SARC',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'ACTIVE',
        createdAt: '2026-03-01T14:00:00.000Z',
        lastLoginAt: '2026-11-06T18:10:00.000Z',
        updatedAt: '2026-11-06T18:10:00.000Z',
      },
      {
        id: 'usr-007',
        username: 'vuhainam',
        fullName: 'Vũ Hải Nam',
        email: 'nam.vu@athlete.vn',
        phone: '0907890123',
        roleId: 'role-runner-athlete',
        roleName: 'Vận Động Viên (Runner)',
        clubId: 'club-sarc',
        clubName: 'SARC',
        teamId: 'team-dragons',
        teamName: 'Team Dragons SADC',
        status: 'ACTIVE',
        createdAt: '2026-03-05T15:00:00.000Z',
        lastLoginAt: '2026-11-06T15:20:00.000Z',
        updatedAt: '2026-11-06T15:20:00.000Z',
      },
      {
        id: 'usr-008',
        username: 'ngoducthang',
        fullName: 'Ngô Đức Thắng',
        email: 'thang.ngo@temp.vn',
        phone: '0908901234',
        roleId: 'role-runner-athlete',
        roleName: 'Vận Động Viên (Runner)',
        clubId: 'club-sarc',
        clubName: 'SARC',
        teamId: 'team-tigers',
        teamName: 'Team Tigers SADC',
        status: 'DEACTIVATED',
        createdAt: '2026-03-10T09:00:00.000Z',
        lastLoginAt: '2026-10-15T08:00:00.000Z',
        updatedAt: '2026-10-15T08:00:00.000Z',
      },
    ];
    users.forEach(u => this.systemUsers.set(u.id, u));

    // 3. Seed Config Catalogs (4 Major Categories)
    const catalogs: SystemConfigCategory[] = [
      {
        id: 'cat-pace-rules',
        code: 'CATALOG_PACE_RULES',
        name: 'Bộ 1: Quy Chuẩn Hoạt Động & Pace',
        description: 'Kiểm soát cự ly tối thiểu, ngưỡng pace hợp lệ, tỉ lệ bù dốc Trail, chống gian lận và quy tắc chạy máy',
        icon: '🏃',
        parameterCount: 8,
      },
      {
        id: 'cat-finance-gateway',
        code: 'CATALOG_FINANCE_GATEWAY',
        name: 'Bộ 2: Tài Chính & Ngân Hàng VietQR',
        description: 'Tài khoản quỹ giải thụ hưởng, mức đóng góp phân tầng, phạt chu kỳ tuần và định dạng memo VietQR',
        icon: '💳',
        parameterCount: 7,
      },
      {
        id: 'cat-wearables-integration',
        code: 'CATALOG_WEARABLES_INTEGRATION',
        name: 'Bộ 3: Tích Hợp API & Thiết Bị Đeo',
        description: 'Hạn mức Strava API, Webhook endpoints Garmin / Coros, tần suất đồng bộ nền và secret key bảo mật',
        icon: '⌚',
        parameterCount: 6,
      },
      {
        id: 'cat-race-lifecycle',
        code: 'CATALOG_RACE_LIFECYCLE',
        name: 'Bộ 4: Thông Số Vận Hành & Mùa Giải',
        description: 'Chỉ tiêu chu kỳ tuần, thời gian ân hạn thứ Hai, sĩ số tối đa mỗi đội và cơ chế tính điểm xếp hạng',
        icon: '🏆',
        parameterCount: 7,
      },
      {
        id: 'cat-athlete-tiers',
        code: 'CATALOG_ATHLETE_TIERS',
        name: 'Bộ 5: Nhóm Phân Loại Vận Động Viên (Athlete Tiers)',
        description: 'Chuẩn hóa phân loại trình độ & phòng ban VĐV: Pro Athlete, Fun Run, Newbie Rookie, Khối Văn Phòng, Khối Nhà Máy',
        icon: '🏃‍♂️',
        parameterCount: 5,
      },
      {
        id: 'cat-team-allocation-rules',
        code: 'CATALOG_TEAM_ALLOCATION_RULES',
        name: 'Bộ 6: Quy Chế Phân Bổ Đội Hình (Squad Allocation)',
        description: 'Thuật toán chia đội tự động, cân bằng trình độ Pace, phân chia phòng ban và tiếp nhận Free-Agent',
        icon: '👥',
        parameterCount: 4,
      },
      {
        id: 'cat-terrain-scoring-factors',
        code: 'CATALOG_TERRAIN_SCORING_FACTORS',
        name: 'Bộ 7: Hệ Số Quy Đổi Điểm Địa Hình (Terrain Multipliers)',
        description: 'Hệ số điểm/cự ly cho Đường bằng (Road), Địa hình leo dốc (Trail), Chạy máy (Treadmill) và Sân vận động (Track)',
        icon: '⛰️',
        parameterCount: 4,
      },
      {
        id: 'cat-anti-cheat-rules',
        code: 'CATALOG_ANTI_CHEAT_RULES',
        name: 'Bộ 8: Tham Số Chống Gian Lận Chuẩn (Anti-Cheat Engine)',
        description: 'Khóa sàn tốc độ tuyệt đối, lọc đuôi xe máy Auto-Trim, chặn GPS giả mạo và kiểm tra nhịp tim liên tục',
        icon: '🛡️',
        parameterCount: 4,
      },
      {
        id: 'cat-standard-awards',
        code: 'CATALOG_STANDARD_AWARDS',
        name: 'Bộ 9: Hạng Mục Giải Thưởng Tiêu Chuẩn (Standard Awards)',
        description: 'Cơ cấu giải thưởng cá nhân Nam/Nữ, giải tập thể Đồng Đội, giải Chuyên Cần Streak Hero và Vua Leo Dốc Trail D+',
        icon: '🥇',
        parameterCount: 5,
      },
    ];
    catalogs.forEach(c => this.systemCatalogs.set(c.code, c));

    // 4. Seed Config Parameters across 4 Catalogs
    const configs: SystemConfigParameter[] = [
      // BỘ 1: QUY CHUẨN HOẠT ĐỘNG & PACE
      {
        id: 'cfg-pace-001',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'MIN_DISTANCE_KM',
        name: 'Cự ly tối thiểu hợp lệ',
        value: '3.0',
        unit: 'km',
        dataType: 'number',
        description: 'Bài chạy phải đạt tối thiểu từ cự ly này trở lên mới được hệ thống ghi nhận',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-002',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'PACE_MIN_BOUND',
        name: 'Pace nhanh nhất cho phép',
        value: '4.00',
        unit: 'min/km',
        dataType: 'number',
        description: 'Ngưỡng tốc độ chạy đường bằng tối đa cho phép (4:00 min/km)',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-003',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'PACE_MAX_BOUND',
        name: 'Pace chậm nhất cho phép',
        value: '10.00',
        unit: 'min/km',
        dataType: 'number',
        description: 'Ngưỡng tốc độ chậm nhất đường bằng (10:00 min/km), nếu vượt quá phải có dốc Trail để bù',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-004',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'SYSTEM_PACE_FLOOR',
        name: 'Khóa chống gian lận tuyệt đối',
        value: '2.75',
        unit: 'min/km',
        dataType: 'number',
        description: 'Khóa cứng hệ thống: Bất kỳ bài chạy nào nhanh hơn 2:45 min/km đều bị loại bỏ ngay lập tức',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-005',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'TRAIL_GAIN_MIN_M',
        name: 'Cao độ tối thiểu quy tắc Trail',
        value: '100.0',
        unit: 'm D+',
        dataType: 'number',
        description: 'Độ cao tích lũy D+ tối thiểu để được kích hoạt cơ chế tính thưởng dốc leo núi',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-006',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'AUTOTRIM_MAX_SPEED_KMH',
        name: 'Ngưỡng phát hiện đi xe máy',
        value: '25.0',
        unit: 'km/h',
        dataType: 'number',
        description: 'Vận tốc vượt quá 25 km/h ở đoạn đuôi sẽ kích hoạt thuật toán Auto-Trim cắt bỏ tự động',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-007',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'TREADMILL_MIN_HR_BPM',
        name: 'Nhịp tim tối thiểu chạy máy',
        value: '120',
        unit: 'bpm',
        dataType: 'number',
        description: 'Bài tập Treadmill trong nhà phải ghi nhận nhịp tim liên tục trung bình từ 120 bpm trở lên',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-pace-008',
        catalogCode: 'CATALOG_PACE_RULES',
        key: 'MAX_ACTIVITIES_PER_DAY',
        name: 'Số bài chạy tối đa/ngày',
        value: '2',
        unit: 'bài',
        dataType: 'number',
        description: 'Giới hạn số hoạt động được tích lũy điểm số tối đa mỗi vận động viên trong một ngày dương lịch',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },

      // BỘ 2: TÀI CHÍNH & NGÂN HÀNG VIETQR
      {
        id: 'cfg-fin-001',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'VIETQR_BANK_BIN',
        name: 'Mã BIN ngân hàng thụ hưởng',
        value: '970422',
        unit: 'BIN',
        dataType: 'string',
        description: 'Mã định danh ngân hàng Quân Đội (MBBank) theo quy chuẩn VietQR Napas247',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-fin-002',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'VIETQR_ACCOUNT_NO',
        name: 'Số tài khoản quỹ giải đấu',
        value: '0988889999',
        unit: 'STK',
        dataType: 'string',
        description: 'Số tài khoản ngân hàng tiếp nhận tiền đóng góp và tiền phạt giải chạy',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-fin-003',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'VIETQR_ACCOUNT_NAME',
        name: 'Tên chủ tài khoản thụ hưởng',
        value: 'CLB CHAY PHU DONG SARC',
        unit: 'Tên',
        dataType: 'string',
        description: 'Tên pháp nhân/chủ tài khoản hiển thị trên màn hình xác nhận chuyển khoản',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-fin-004',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'CYCLE_PENALTY_VND',
        name: 'Mức phạt thiếu chỉ tiêu tuần',
        value: '50000',
        unit: 'VND',
        dataType: 'number',
        description: 'Số tiền phạt quy định cho mỗi chu kỳ tuần mà vận động viên không hoàn thành đủ số km',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-fin-005',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'CONTRIBUTION_TIER1_VND',
        name: 'Mức đóng góp Đội Hạng 1',
        value: '100000',
        unit: 'VND',
        dataType: 'number',
        description: 'Số tiền đóng góp liên hoan tổng kết của các vận động viên thuộc đội vô địch (Rank 1)',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-fin-006',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'CONTRIBUTION_TIER_OTHER_VND',
        name: 'Mức đóng góp Đội Hạng khác',
        value: '200000',
        unit: 'VND',
        dataType: 'number',
        description: 'Số tiền đóng góp liên hoan tổng kết của các vận động viên thuộc đội đồng hạng 2',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-fin-007',
        catalogCode: 'CATALOG_FINANCE_GATEWAY',
        key: 'VIETQR_MEMO_PREFIX',
        name: 'Tiền tố cú pháp chuyển khoản',
        value: 'SARC',
        unit: 'Prefix',
        dataType: 'string',
        description: 'Cú pháp nội dung nạp tiền tự động: SARC + MÃ_VĐV (Ví dụ: SARC P02 B)',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },

      // BỘ 3: TÍCH HỢP API & THIẾT BỊ ĐEO
      {
        id: 'cfg-api-001',
        catalogCode: 'CATALOG_WEARABLES_INTEGRATION',
        key: 'STRAVA_RATE_LIMIT_15M',
        name: 'Hạn mức Strava API (15 phút)',
        value: '100',
        unit: 'req/15m',
        dataType: 'number',
        description: 'Số lượt yêu cầu tối đa gửi đến Strava Developer API trong mỗi cửa sổ 15 phút',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-api-002',
        catalogCode: 'CATALOG_WEARABLES_INTEGRATION',
        key: 'STRAVA_RATE_LIMIT_DAILY',
        name: 'Hạn mức Strava API (Ngày)',
        value: '1000',
        unit: 'req/ngày',
        dataType: 'number',
        description: 'Tổng số lượt gọi Strava API tối đa cho phép mỗi ngày trước khi kích hoạt hàng đợi',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-api-003',
        catalogCode: 'CATALOG_WEARABLES_INTEGRATION',
        key: 'GARMIN_WEBHOOK_URL',
        name: 'Endpoint Webhook Garmin Connect',
        value: '/api/webhooks/garmin',
        unit: 'URI',
        dataType: 'string',
        description: 'Đường dẫn tiếp nhận tín hiệu đẩy trực tiếp bài chạy từ Garmin Health & Training API',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-api-004',
        catalogCode: 'CATALOG_WEARABLES_INTEGRATION',
        key: 'COROS_OPEN_API_URL',
        name: 'Endpoint Webhook COROS Cloud',
        value: '/api/webhooks/coros',
        unit: 'URI',
        dataType: 'string',
        description: 'Đường dẫn tiếp nhận dữ liệu FIT/GPX tự động từ hạ tầng COROS Open Cloud API',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-api-005',
        catalogCode: 'CATALOG_WEARABLES_INTEGRATION',
        key: 'BACKGROUND_SYNC_INTERVAL_MIN',
        name: 'Chu kỳ đồng bộ nền',
        value: '15',
        unit: 'phút',
        dataType: 'number',
        description: 'Khoảng thời gian Worker tự động quét và đối chiếu các hoạt động mới',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-api-006',
        catalogCode: 'CATALOG_WEARABLES_INTEGRATION',
        key: 'WEBHOOK_SECRET_KEY',
        name: 'Khóa bảo mật Webhook Secret',
        value: 'whsec_openrace_prod_2026',
        unit: 'Secret',
        dataType: 'string',
        description: 'Khóa bí mật dùng để xác thực chữ ký HMAC SHA-256 từ các đối tác thiết bị đeo',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },

      // BỘ 4: THÔNG SỐ VẬN HÀNH & MÙA GIẢI
      {
        id: 'cfg-race-001',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'WEEKLY_TARGET_KM',
        name: 'Chỉ tiêu cự ly chu kỳ tuần',
        value: '20.0',
        unit: 'km',
        dataType: 'number',
        description: 'Số km chuẩn mỗi vận động viên cần hoàn thành trong chu kỳ tuần (Thứ Hai -> Chủ Nhật)',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-race-002',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'MONDAY_GRACE_HOURS',
        name: 'Thời gian ân hạn sáng thứ Hai',
        value: '6',
        unit: 'giờ',
        dataType: 'number',
        description: 'Số giờ cho phép đồng bộ bù các bài chạy đêm Chủ Nhật (hết hạn lúc 06:00 sáng Thứ Hai)',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-race-003',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'TEAM_MAX_MEMBERS',
        name: 'Sĩ số tối đa mỗi đội thi đấu',
        value: '16',
        unit: 'runners',
        dataType: 'number',
        description: 'Số lượng thành viên tối đa được phép ghi danh vào một đội thi đấu trong mùa giải',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-race-004',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'TEAM_CAP_DAYS',
        name: 'Giới hạn tổng ngày siêng năng đội',
        value: '140',
        unit: 'ngày',
        dataType: 'number',
        description: 'Trần số ngày siêng năng tích lũy của toàn đội để hạn chế lệch điểm giữa các tuần',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-race-005',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'TOP1_REWARD_TITLE',
        name: 'Hiện vật trao thưởng Đội Vô Địch',
        value: 'Áo thi đấu CLB SARC',
        unit: 'Tên',
        dataType: 'string',
        description: 'Tên hiện vật vinh danh trao cho toàn bộ thành viên của Đội đoạt ngôi vô địch',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-race-006',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'SCORING_STRATEGY',
        name: 'Công thức tính điểm mùa giải',
        value: 'sum_team_v1',
        unit: 'Code',
        dataType: 'string',
        description: 'Chiến lược tính điểm chuẩn: Kết hợp tổng km hợp lệ và số ngày siêng năng có trọng số',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-race-007',
        catalogCode: 'CATALOG_RACE_LIFECYCLE',
        key: 'DEFAULT_TIMEZONE',
        name: 'Múi giờ vận hành hệ thống',
        value: 'Asia/Ho_Chi_Minh',
        unit: 'TZ',
        dataType: 'string',
        description: 'Múi giờ chuẩn UTC+7 áp dụng cho chu kỳ tuần, chốt sổ phạt và xếp hạng real-time',
        status: 'ACTIVE',
        updatedAt: '2026-11-06T18:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },

      // BỘ 5: NHÓM PHÂN LOẠI VẬN ĐỘNG VIÊN (ATHLETE TIERS)
      {
        id: 'cfg-tier-001',
        catalogCode: 'CATALOG_ATHLETE_TIERS',
        key: 'TIER_PRO',
        name: 'Hạng Pro / Elite',
        value: 'Pace < 4:30 min/km, cự ly >= 50km/tuần',
        unit: 'Chuẩn',
        dataType: 'string',
        description: 'VĐV có thành tích cao, thành viên nòng cốt dẫn dắt đội hình thi đấu tốc độ',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-tier-002',
        catalogCode: 'CATALOG_ATHLETE_TIERS',
        key: 'TIER_FUN_RUN',
        name: 'Hạng Fun Run / Phong Trào',
        value: 'Pace 5:00 - 7:30 min/km, cự ly 20-35km/tuần',
        unit: 'Chuẩn',
        dataType: 'string',
        description: 'VĐV phong trào duy trì sức khỏe và chuyên cần tích lũy cự ly hàng ngày',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-tier-003',
        catalogCode: 'CATALOG_ATHLETE_TIERS',
        key: 'TIER_NEWBIE',
        name: 'Hạng Newbie / Nhập Môn',
        value: 'Người mới tập chạy, bài tập >= 3.0km',
        unit: 'Chuẩn',
        dataType: 'string',
        description: 'Thành viên mới cần theo dõi thích nghi nhịp tim và xây dựng thói quen chạy',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-tier-004',
        catalogCode: 'CATALOG_ATHLETE_TIERS',
        key: 'TIER_OFFICE',
        name: 'Khối Văn Phòng / Back Office',
        value: 'Khối gián tiếp: CNTT, Nhân sự, Kế toán, Vận hành',
        unit: 'Khối',
        dataType: 'string',
        description: 'Phân nhóm theo khối văn phòng để tổ chức thi đua gắn kết nội bộ',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-tier-005',
        catalogCode: 'CATALOG_ATHLETE_TIERS',
        key: 'TIER_PLANT',
        name: 'Khối Nhà Máy / Xưởng Trực Tiếp',
        value: 'Khối trực tiếp: Phân xưởng, Sản xuất, Kỹ thuật bảo trì',
        unit: 'Khối',
        dataType: 'string',
        description: 'Phân nhóm thi đua thể thao khối sản xuất công trường',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },

      // BỘ 6: QUY CHẾ PHÂN BỔ ĐỘI HÌNH (SQUAD ALLOCATION RULES)
      {
        id: 'cfg-alloc-001',
        catalogCode: 'CATALOG_TEAM_ALLOCATION_RULES',
        key: 'ALLOC_BALANCED_PACE',
        name: 'Cân bằng Pace trung bình (Snake Draft)',
        value: 'Sắp xếp danh sách theo Pace rồi phân bổ ziczac',
        unit: 'Thuật toán',
        dataType: 'string',
        description: 'Thuật toán tự động dàn đều các chân chạy Pro và Newbie vào các đội để cân bằng sức mạnh',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-alloc-002',
        catalogCode: 'CATALOG_TEAM_ALLOCATION_RULES',
        key: 'ALLOC_DEPARTMENT',
        name: 'Phân bổ theo phòng ban / khối',
        value: 'Giữ nguyên cơ cấu phòng ban trực thuộc',
        unit: 'Quy tắc',
        dataType: 'string',
        description: 'Tất cả thành viên cùng đơn vị phòng ban tự động được gom thành 1 đội đua độc lập',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-alloc-003',
        catalogCode: 'CATALOG_TEAM_ALLOCATION_RULES',
        key: 'ALLOC_FREE_AGENT',
        name: 'Cơ chế VĐV tự do (Free-Agent Round Robin)',
        value: 'VĐV cá nhân tự do được gán xoay vòng vào các đội thiếu quân số',
        unit: 'Cơ chế',
        dataType: 'string',
        description: 'Hỗ trợ VĐV đăng ký tự do tham gia không bị lẻ loi, hệ thống tự bù vào các đội',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },
      {
        id: 'cfg-alloc-004',
        catalogCode: 'CATALOG_TEAM_ALLOCATION_RULES',
        key: 'ALLOC_CAPACITY_LIMITS',
        name: 'Giới hạn quy mô đội hình',
        value: 'Min: 5 - Max: 10 VĐV/team',
        unit: 'VĐV/team',
        dataType: 'string',
        description: 'Ngưỡng quân số tối thiểu và tối đa để đội được công nhận hợp lệ',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Trần Thị B',
      },

      // BỘ 7: HỆ SỐ QUY ĐỔI ĐIỂM ĐỊA HÌNH (TERRAIN SCORING MULTIPLIERS)
      {
        id: 'cfg-terr-001',
        catalogCode: 'CATALOG_TERRAIN_SCORING_FACTORS',
        key: 'FACTOR_ROAD',
        name: 'Hệ số địa hình Road (Đường bằng)',
        value: '1.0',
        unit: 'x',
        dataType: 'number',
        description: 'Hệ số quy chuẩn 1 km Road = 1.0 điểm thực tế',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-terr-002',
        catalogCode: 'CATALOG_TERRAIN_SCORING_FACTORS',
        key: 'FACTOR_TRAIL',
        name: 'Hệ số địa hình Trail (Leo dốc / Địa hình)',
        value: '1.5',
        unit: 'x',
        dataType: 'number',
        description: 'Hệ số ưu tiên dốc: 1 km Trail = 1.5 điểm + thưởng dốc theo cao độ D+',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-terr-003',
        catalogCode: 'CATALOG_TERRAIN_SCORING_FACTORS',
        key: 'FACTOR_TREADMILL',
        name: 'Hệ số máy chạy Treadmill trong nhà',
        value: '0.8',
        unit: 'x',
        dataType: 'number',
        description: 'Hệ số chạy máy: 1 km Treadmill = 0.8 điểm (yêu cầu nhịp tim >= 120 bpm)',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-terr-004',
        catalogCode: 'CATALOG_TERRAIN_SCORING_FACTORS',
        key: 'FACTOR_TRACK',
        name: 'Hệ số chạy Track sân vận động',
        value: '1.1',
        unit: 'x',
        dataType: 'number',
        description: 'Hệ số chạy vòng tròn trên sân vận động tiêu chuẩn 400m',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },

      // BỘ 8: THAM SỐ CHỐNG GIAN LẬN CHUẨN (ANTI-CHEAT RULES)
      {
        id: 'cfg-anti-001',
        catalogCode: 'CATALOG_ANTI_CHEAT_RULES',
        key: 'HARD_PACE_FLOOR',
        name: 'Khóa sàn tốc độ tuyệt đối',
        value: '2:45',
        unit: 'min/km',
        dataType: 'string',
        description: 'Bài chạy có pace < 2:45 min/km tự động bị gắn cờ vi phạm hoặc loại bỏ ngay lập tức',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-anti-002',
        catalogCode: 'CATALOG_ANTI_CHEAT_RULES',
        key: 'AUTOTRIM_MOTOR_SPEED',
        name: 'Ngưỡng phát hiện đi xe máy',
        value: '25.0',
        unit: 'km/h',
        dataType: 'number',
        description: 'Vận tốc vượt quá 25 km/h ở đoạn đuôi sẽ kích hoạt thuật toán Auto-Trim',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-anti-003',
        catalogCode: 'CATALOG_ANTI_CHEAT_RULES',
        key: 'TRAIL_ELEVATION_BONUS',
        name: 'Mức thưởng dốc Trail D+',
        value: '1.0',
        unit: 'km/100m D+',
        dataType: 'number',
        description: 'Cộng thêm 1.0 km hoặc 10 điểm cho mỗi 100m độ cao D+ tích lũy',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },
      {
        id: 'cfg-anti-004',
        catalogCode: 'CATALOG_ANTI_CHEAT_RULES',
        key: 'MIN_VALID_DISTANCE',
        name: 'Cự ly tối thiểu hợp lệ',
        value: '3.0',
        unit: 'km',
        dataType: 'number',
        description: 'Bài chạy < 3.0 km không đủ tiêu chuẩn tích lũy vào giải',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Nguyễn Văn A',
      },

      // BỘ 9: HẠNG MỤC GIẢI THƯỞNG TIÊU CHUẨN (STANDARD AWARDS)
      {
        id: 'cfg-award-001',
        catalogCode: 'CATALOG_STANDARD_AWARDS',
        key: 'AWARD_TOP_MALE',
        name: 'Top 3 Cá Nhân Nam Xuất Sắc',
        value: 'Hạng 1: 3.000.000đ, Hạng 2: 2.000.000đ, Hạng 3: 1.000.000đ',
        unit: 'VND',
        dataType: 'string',
        description: 'Vinh danh 3 chân chạy Nam có tổng tích lũy cự ly/điểm cao nhất giải',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-award-002',
        catalogCode: 'CATALOG_STANDARD_AWARDS',
        key: 'AWARD_TOP_FEMALE',
        name: 'Top 3 Cá Nhân Nữ Xuất Sắc',
        value: 'Hạng 1: 3.000.000đ, Hạng 2: 2.000.000đ, Hạng 3: 1.000.000đ',
        unit: 'VND',
        dataType: 'string',
        description: 'Vinh danh 3 chân chạy Nữ có tổng tích lũy cự ly/điểm cao nhất giải',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-award-003',
        catalogCode: 'CATALOG_STANDARD_AWARDS',
        key: 'AWARD_TOP_TEAMS',
        name: 'Top 3 Đội Đồng Đội Vô Địch Toàn Đoàn',
        value: 'Cúp Vô Địch + 5.000.000đ / 3.000.000đ / 2.000.000đ',
        unit: 'VND',
        dataType: 'string',
        description: 'Vinh danh 3 tập thể đội có thành tích toàn đoàn xuất sắc nhất',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-award-004',
        catalogCode: 'CATALOG_STANDARD_AWARDS',
        key: 'AWARD_STREAK_HERO',
        name: 'Giải Chuyên Cần Bền Bỉ (Streak Hero)',
        value: 'Huy Chương Vàng Chuyên Cần + 1.500.000đ',
        unit: 'VND',
        dataType: 'string',
        description: 'Trao cho VĐV duy trì chuỗi ngày chạy liên tục dài nhất trong mùa giải',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
      {
        id: 'cfg-award-005',
        catalogCode: 'CATALOG_STANDARD_AWARDS',
        key: 'AWARD_KING_OF_TRAIL',
        name: 'Giải Vua Leo Dốc (King of Trail D+)',
        value: 'Kỷ Niệm Chương Trail King + 1.500.000đ',
        unit: 'VND',
        dataType: 'string',
        description: 'Trao cho VĐV tích lũy độ cao leo núi D+ lớn nhất giải',
        status: 'ACTIVE',
        updatedAt: '2026-11-07T08:00:00.000Z',
        updatedBy: 'Phạm Minh Đức',
      },
    ];
    configs.forEach(cfg => this.systemConfigs.set(cfg.id, cfg));
  }

  saveWebhookEvent(source: string, eventKey: string, payload: any): WebhookEventRecord {
    const existing = this.webhookEvents.find((e) => e.eventKey === eventKey);
    if (existing) return existing;

    const record: WebhookEventRecord = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      source,
      eventKey,
      payload,
      receivedAt: new Date().toISOString(),
      status: 'QUEUED',
    };
    this.webhookEvents.push(record);
    return record;
  }

  saveActivity(activity: Activity): void {
    this.activities.set(activity.id, activity);
  }

  getActivity(id: string): Activity | undefined {
    return this.activities.get(id);
  }

  saveEvaluationLog(log: EvaluationResult): void {
    this.raceLogs.set(`${log.raceId}:${log.activityId}`, log);
  }

  getEvaluationLog(raceId: string, activityId: string): EvaluationResult | undefined {
    return this.raceLogs.get(`${raceId}:${activityId}`);
  }

  createAppeal(
    raceId: string,
    userId: string,
    activityId: string,
    reason: string,
    athleteName?: string,
    distanceKm?: number
  ): AppealRecord {
    const id = `app-${Date.now()}`;
    const appeal: AppealRecord = {
      id,
      raceId,
      userId,
      athleteName: athleteName || 'Vận động viên',
      activityId,
      distanceKm: distanceKm || 5.0,
      reason,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    this.appeals.set(id, appeal);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'APPEAL_CREATED',
      actorId: userId,
      details: { appealId: id, raceId, activityId, reason },
      timestamp: new Date().toISOString(),
    });

    return appeal;
  }

  approveAppeal(appealId: string, adminId: string, note: string): AppealRecord {
    const appeal = this.appeals.get(appealId);
    if (!appeal) throw new Error(`Appeal ${appealId} not found`);

    appeal.status = 'APPROVED';
    appeal.resolvedBy = adminId;
    appeal.resolutionNote = note;
    appeal.resolvedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'APPEAL_APPROVED',
      actorId: adminId,
      details: { appealId, note },
      timestamp: new Date().toISOString(),
    });

    return appeal;
  }

  rejectAppeal(appealId: string, adminId: string, note: string): AppealRecord {
    const appeal = this.appeals.get(appealId);
    if (!appeal) throw new Error(`Appeal ${appealId} not found`);

    appeal.status = 'REJECTED';
    appeal.resolvedBy = adminId;
    appeal.resolutionNote = note;
    appeal.resolvedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'APPEAL_REJECTED',
      actorId: adminId,
      details: { appealId, note },
      timestamp: new Date().toISOString(),
    });

    return appeal;
  }

  settleParticipantPayment(participantId: string, adminId: string, note?: string): ParticipantLedgerRecord {
    const record = this.participantLedgers.get(participantId);
    if (!record) throw new Error(`Participant ledger ${participantId} not found`);

    record.paidVnd = record.totalDueVnd;
    record.status = 'PAID';
    record.lastUpdated = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'FINANCE_PAYMENT_CONFIRMED',
      actorId: adminId,
      details: { participantId, athleteName: record.athleteName, settledAmount: record.totalDueVnd, note },
      timestamp: new Date().toISOString(),
    });

    return record;
  }

  grantPenaltyWaiver(raceId: string, cycleId: string, userId: string, reason: string, adminId: string): PenaltyWaiverRecord {
    const record: PenaltyWaiverRecord = {
      id: `wvr-${Date.now()}`,
      raceId,
      cycleId,
      userId,
      reason,
      grantedBy: adminId,
      grantedAt: new Date().toISOString(),
    };
    this.penaltyWaivers.push(record);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'PENALTY_WAIVER_GRANTED',
      actorId: adminId,
      details: record,
      timestamp: new Date().toISOString(),
    });

    return record;
  }

  updateRaceStatus(raceId: string, status: string, adminId: string): string {
    this.raceStatus[raceId] = status;
    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'RACE_STATUS_UPDATED',
      actorId: adminId,
      details: { raceId, newStatus: status },
      timestamp: new Date().toISOString(),
    });
    return status;
  }

  addManualAdjustment(
    raceId: string,
    userId: string,
    activityId: string,
    adjType: string,
    reason: string,
    adminId: string
  ): void {
    const record = {
      id: `adj-${Date.now()}`,
      raceId,
      userId,
      activityId,
      type: adjType,
      reason,
      approvedBy: adminId,
      createdAt: new Date().toISOString(),
    };
    this.manualAdjustments.push(record);
    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'MANUAL_ADJUSTMENT',
      actorId: adminId,
      details: record,
      timestamp: new Date().toISOString(),
    });
  }

  // ==========================================
  // SYSTEM ADMINISTRATION IAM & CATALOG METHODS
  // ==========================================

  // --- 1. USER MANAGEMENT ---
  getSystemUsers(filter?: { status?: string; roleId?: string; search?: string }): SystemUser[] {
    let list = Array.from(this.systemUsers.values());
    if (filter) {
      if (filter.status && filter.status !== 'ALL') {
        list = list.filter(u => u.status === filter.status);
      }
      if (filter.roleId && filter.roleId !== 'ALL') {
        list = list.filter(u => u.roleId === filter.roleId);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(u =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
        );
      }
    }
    return list;
  }

  getSystemUserById(id: string): SystemUser | undefined {
    return this.systemUsers.get(id);
  }

  createSystemUser(data: Partial<SystemUser>, actorId: string = 'system'): SystemUser {
    const id = data.id || `usr-${Date.now().toString().slice(-6)}`;
    const role = data.roleId ? this.systemRoles.get(data.roleId) : undefined;
    const user: SystemUser = {
      id,
      username: data.username || `user_${Date.now().toString().slice(-4)}`,
      fullName: data.fullName || 'Người Dùng Mới',
      email: data.email || `${id}@openrace.vn`,
      phone: data.phone || '',
      roleId: data.roleId || 'role-runner-athlete',
      roleName: role ? role.name : (data.roleName || 'Vận Động Viên (Runner)'),
      clubId: data.clubId || 'club-sarc',
      clubName: data.clubName || 'Sài Gòn Athletes Running Club (SARC)',
      teamId: data.teamId || '',
      teamName: data.teamName || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.systemUsers.set(id, user);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'SYSTEM_USER_CREATED',
      actorId,
      details: { userId: id, username: user.username, role: user.roleName },
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  updateSystemUser(id: string, data: Partial<SystemUser>, actorId: string = 'system'): SystemUser {
    const existing = this.systemUsers.get(id);
    if (!existing) throw new Error(`User with ID ${id} not found`);

    if (data.roleId && data.roleId !== existing.roleId) {
      const role = this.systemRoles.get(data.roleId);
      if (role) {
        existing.roleId = role.id;
        existing.roleName = role.name;
      }
    }

    if (data.fullName !== undefined) existing.fullName = data.fullName;
    if (data.email !== undefined) existing.email = data.email;
    if (data.phone !== undefined) existing.phone = data.phone;
    if (data.clubId !== undefined) existing.clubId = data.clubId;
    if (data.clubName !== undefined) existing.clubName = data.clubName;
    if (data.teamId !== undefined) existing.teamId = data.teamId;
    if (data.teamName !== undefined) existing.teamName = data.teamName;
    if (data.status !== undefined) existing.status = data.status;
    existing.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'SYSTEM_USER_UPDATED',
      actorId,
      details: { userId: id, updatedFields: data },
      timestamp: new Date().toISOString(),
    });

    return existing;
  }

  toggleSystemUserStatus(id: string, actorId: string = 'system', reason?: string): SystemUser {
    const user = this.systemUsers.get(id);
    if (!user) throw new Error(`User with ID ${id} not found`);

    // Non-destructive soft deactivation / reactivation: NEVER deletes record or linked race activities
    const previousStatus = user.status;
    user.status = user.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    user.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: user.status === 'DEACTIVATED' ? 'SYSTEM_USER_DEACTIVATED' : 'SYSTEM_USER_REACTIVATED',
      actorId,
      details: {
        userId: id,
        previousStatus,
        newStatus: user.status,
        reason: reason || 'Soft status toggle (no data deleted)',
      },
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  // --- 2. ROLE & PERMISSION MANAGEMENT (RBAC) ---
  getSystemRoles(): SystemRole[] {
    return Array.from(this.systemRoles.values());
  }

  getSystemRoleById(id: string): SystemRole | undefined {
    return this.systemRoles.get(id);
  }

  createSystemRole(data: Partial<SystemRole>, actorId: string = 'system'): SystemRole {
    const id = data.id || `role-${Date.now().toString().slice(-6)}`;
    const role: SystemRole = {
      id,
      code: (data.code || `ROLE_${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: data.name || 'Vai Trò Mới',
      description: data.description || '',
      permissions: data.permissions || ['activities.view'],
      isSystemDefault: false,
      status: 'ACTIVE',
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.systemRoles.set(id, role);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'SYSTEM_ROLE_CREATED',
      actorId,
      details: { roleId: id, code: role.code, name: role.name },
      timestamp: new Date().toISOString(),
    });

    return role;
  }

  updateSystemRole(id: string, data: Partial<SystemRole>, actorId: string = 'system'): SystemRole {
    const existing = this.systemRoles.get(id);
    if (!existing) throw new Error(`Role with ID ${id} not found`);

    if (data.name !== undefined) existing.name = data.name;
    if (data.description !== undefined) existing.description = data.description;
    if (data.permissions !== undefined) existing.permissions = data.permissions;
    if (data.status !== undefined) existing.status = data.status;
    existing.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'SYSTEM_ROLE_UPDATED',
      actorId,
      details: { roleId: id, updatedFields: data },
      timestamp: new Date().toISOString(),
    });

    return existing;
  }

  toggleSystemRoleStatus(id: string, actorId: string = 'system'): SystemRole {
    const role = this.systemRoles.get(id);
    if (!role) throw new Error(`Role with ID ${id} not found`);

    // Non-destructive soft deactivation
    const previousStatus = role.status;
    role.status = role.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    role.updatedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: role.status === 'DEACTIVATED' ? 'SYSTEM_ROLE_DEACTIVATED' : 'SYSTEM_ROLE_REACTIVATED',
      actorId,
      details: { roleId: id, previousStatus, newStatus: role.status },
      timestamp: new Date().toISOString(),
    });

    return role;
  }

  // --- 3. SYSTEM MASTER DATA & CONFIG CATALOGS ---
  getSystemCatalogs(): SystemConfigCategory[] {
    const catalogs = Array.from(this.systemCatalogs.values());
    // Update live parameterCount
    catalogs.forEach(cat => {
      const count = Array.from(this.systemConfigs.values()).filter(c => c.catalogCode === cat.code).length;
      cat.parameterCount = count;
    });
    return catalogs;
  }

  getSystemConfigs(catalogCode?: string): SystemConfigParameter[] {
    let list = Array.from(this.systemConfigs.values());
    if (catalogCode && catalogCode !== 'ALL') {
      list = list.filter(c => c.catalogCode === catalogCode);
    }
    return list;
  }

  createSystemConfig(data: Partial<SystemConfigParameter>, actorId: string = 'system'): SystemConfigParameter {
    const id = data.id || `cfg-${Date.now().toString().slice(-6)}`;
    const config: SystemConfigParameter = {
      id,
      catalogCode: data.catalogCode || 'CATALOG_PACE_RULES',
      key: (data.key || `PARAM_${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: data.name || 'Thông số mới',
      value: data.value !== undefined ? String(data.value) : '',
      unit: data.unit || '',
      dataType: data.dataType || 'string',
      description: data.description || '',
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
    };
    this.systemConfigs.set(id, config);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'SYSTEM_CONFIG_CREATED',
      actorId,
      details: { configId: id, key: config.key, catalog: config.catalogCode, value: config.value },
      timestamp: new Date().toISOString(),
    });

    return config;
  }

  updateSystemConfig(id: string, data: Partial<SystemConfigParameter>, actorId: string = 'system'): SystemConfigParameter {
    const existing = this.systemConfigs.get(id);
    if (!existing) throw new Error(`Config with ID ${id} not found`);

    if (data.name !== undefined) existing.name = data.name;
    if (data.value !== undefined) existing.value = String(data.value);
    if (data.unit !== undefined) existing.unit = data.unit;
    if (data.dataType !== undefined) existing.dataType = data.dataType;
    if (data.description !== undefined) existing.description = data.description;
    if (data.status !== undefined) existing.status = data.status;
    existing.updatedAt = new Date().toISOString();
    existing.updatedBy = actorId;

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'SYSTEM_CONFIG_UPDATED',
      actorId,
      details: { configId: id, key: existing.key, updatedFields: data },
      timestamp: new Date().toISOString(),
    });

    return existing;
  }

  toggleSystemConfigStatus(id: string, actorId: string = 'system'): SystemConfigParameter {
    const config = this.systemConfigs.get(id);
    if (!config) throw new Error(`Config with ID ${id} not found`);

    // Non-destructive soft deactivation: preserved in catalog with status DEACTIVATED
    const previousStatus = config.status;
    config.status = config.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    config.updatedAt = new Date().toISOString();
    config.updatedBy = actorId;

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: config.status === 'DEACTIVATED' ? 'SYSTEM_CONFIG_DEACTIVATED' : 'SYSTEM_CONFIG_REACTIVATED',
      actorId,
      details: { configId: id, key: config.key, previousStatus, newStatus: config.status },
      timestamp: new Date().toISOString(),
    });

    return config;
  }

  // ==========================================
  // [AC-PLATFORM-CONFIG-01..04] PLATFORM CONFIGURATION & BRANDING
  // ==========================================
  getPlatformConfig(): PlatformConfig {
    return { ...this.platformConfig };
  }

  updatePlatformConfig(updates: Partial<PlatformConfig>, actorId: string = 'system'): PlatformConfig {
    this.platformConfig = {
      ...this.platformConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
    };
    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'PLATFORM_CONFIG_UPDATED',
      actorId,
      details: updates,
      timestamp: new Date().toISOString(),
    });
    return { ...this.platformConfig };
  }

  toggleCustomPlatformParam(paramId: string, actorId: string = 'system'): PlatformConfig {
    const param = this.platformConfig.customParameters.find(p => p.id === paramId);
    if (param) {
      param.status = param.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      this.platformConfig.updatedAt = new Date().toISOString();
      this.platformConfig.updatedBy = actorId;
      this.auditLogs.push({
        id: `aud-${Date.now()}`,
        action: param.status === 'DEACTIVATED' ? 'PLATFORM_PARAM_DEACTIVATED' : 'PLATFORM_PARAM_REACTIVATED',
        actorId,
        details: { paramId, key: param.key, status: param.status },
        timestamp: new Date().toISOString(),
      });
    }
    return { ...this.platformConfig };
  }

  addCustomPlatformParam(param: Partial<CustomPlatformParam>, actorId: string = 'system'): PlatformConfig {
    const id = param.id || `cfg-cust-${Date.now().toString().slice(-4)}`;
    const newParam: CustomPlatformParam = {
      id,
      key: (param.key || `PARAM_${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: param.name || 'Tham số tùy chỉnh mới',
      value: param.value || '',
      description: param.description || '',
      status: 'ACTIVE',
    };
    this.platformConfig.customParameters.push(newParam);
    this.platformConfig.updatedAt = new Date().toISOString();
    this.platformConfig.updatedBy = actorId;
    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'PLATFORM_PARAM_CREATED',
      actorId,
      details: newParam,
      timestamp: new Date().toISOString(),
    });
    return { ...this.platformConfig };
  }

  // --- 4. PRO RUNNER PERFORMANCE, EQUIPMENT & MILESTONES ---

  private seedProRunnerData(): void {
    // 1. Seed Shoes for user-01
    const shoes: RunningShoe[] = [
      {
        id: 'shoe-01',
        userId: 'user-01',
        brand: 'Nike',
        name: 'Nike Alphafly 3 Proto',
        category: 'race_day',
        categoryLabel: 'Giày thi đấu Carbon',
        currentDistanceKm: 420.5,
        maxDistanceKm: 600.0,
        isDefault: true,
        status: 'ACTIVE',
        warningLevel: 'CAUTION',
        percentUsed: 70.1,
        purchaseDate: '2026-03-15',
        notes: 'Giày race chính thức cho giải Techcombank HM/FM',
        createdAt: '2026-03-15T08:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shoe-02',
        userId: 'user-01',
        brand: 'Adidas',
        name: 'Adidas Adios Pro 3',
        category: 'race_day',
        categoryLabel: 'Giày thi đấu Carbon',
        currentDistanceKm: 585.0,
        maxDistanceKm: 600.0,
        isDefault: false,
        status: 'WARNING_REPLACE',
        warningLevel: 'REPLACE',
        percentUsed: 97.5,
        purchaseDate: '2025-10-10',
        notes: 'Đế Lightstrike Pro đã mòn mép ngoài, cần thay thế tránh chấn thương khớp gối',
        createdAt: '2025-10-10T08:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shoe-03',
        userId: 'user-01',
        brand: 'Asics',
        name: 'Asics Novablast 4',
        category: 'daily_trainer',
        categoryLabel: 'Daily Trainer / Phục Hồi',
        currentDistanceKm: 180.0,
        maxDistanceKm: 800.0,
        isDefault: false,
        status: 'ACTIVE',
        warningLevel: 'SAFE',
        percentUsed: 22.5,
        purchaseDate: '2026-07-20',
        notes: 'Đệm FF Blast+ êm ái cho các bài Easy Run hồi phục',
        createdAt: '2026-07-20T08:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shoe-04',
        userId: 'user-01',
        brand: 'Saucony',
        name: 'Saucony Endorphin Speed 3',
        category: 'tempo_interval',
        categoryLabel: 'Tempo / Biến Tốc Interval',
        currentDistanceKm: 310.0,
        maxDistanceKm: 700.0,
        isDefault: false,
        status: 'ACTIVE',
        warningLevel: 'SAFE',
        percentUsed: 44.3,
        purchaseDate: '2026-05-01',
        notes: 'Đĩa nylon trợ lực linh hoạt cho các bài tempo giữa tuần',
        createdAt: '2026-05-01T08:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    ];
    shoes.forEach(s => this.runningShoes.set(s.id, s));

    // 2. Seed Training Load & Recovery for user-01
    const trainingLoad: TrainingLoadRecovery = {
      athleteId: 'user-01',
      trainingStatus: 'Productive',
      trainingStatusLabel: '🟢 Hiệu quả (Productive)',
      loadRatio: 1.14,
      loadRatioStatus: 'optimal',
      acuteLoad: 685,
      chronicLoad: 600,
      recoveryHours: 18,
      vo2Max: 52.4,
      vo2MaxFitnessCategory: 'Rất tốt (Top 5% cùng lứa tuổi)',
      predictedRaceTimes: {
        race5k: '21:45',
        race10k: '45:30',
        halfMarathon21k: '01:42:15',
        marathon42k: '03:36:20',
      },
      hrZonesLast7Days: [
        { zone: 1, name: 'Zone 1 (Phục hồi)', rangeBpm: '< 130 bpm', minutesLast7Days: 35, percentage: 12.3 },
        { zone: 2, name: 'Zone 2 (Hiếu khí/Base)', rangeBpm: '130 - 149 bpm', minutesLast7Days: 150, percentage: 52.6 },
        { zone: 3, name: 'Zone 3 (Tempo)', rangeBpm: '150 - 165 bpm', minutesLast7Days: 65, percentage: 22.8 },
        { zone: 4, name: 'Zone 4 (Ngưỡng Lactic)', rangeBpm: '166 - 179 bpm', minutesLast7Days: 25, percentage: 8.8 },
        { zone: 5, name: 'Zone 5 (Yếm khí/VO2 Max)', rangeBpm: '> 180 bpm', minutesLast7Days: 10, percentage: 3.5 },
      ],
      lastSyncAt: new Date().toISOString(),
      sourceDevice: 'Garmin Forerunner 965',
    };
    this.trainingLoads.set(trainingLoad.athleteId, trainingLoad);

    // 3. Seed Runner Milestones & Streak for user-01
    const milestones: RunnerMilestonesStreak = {
      athleteId: 'user-01',
      currentStreakDays: 14,
      longestStreakDays: 28,
      seasonTotalKm: 921.5,
      nextMilestoneKm: 1000.0,
      remainingKmToMilestone: 78.5,
      milestoneProgressPercent: 92.2,
      milestoneTitle: 'Cột Mốc 1,000 KM Toàn Mùa Giải 2026',
      recentBadges: [
        {
          id: 'badge-hm',
          code: 'HM_SUB_145',
          title: '🏅 Finisher 21K Sub-1:45',
          category: 'RACE',
          icon: '🏅',
          description: 'Hoàn thành cự ly Half Marathon dưới 1 giờ 45 phút tại SARC Challenge',
          achievedAt: '2026-10-25',
          rarity: 'EPIC',
          verificationHash: 'OR-CERT-HM-948271',
        },
        {
          id: 'badge-speed',
          code: 'SUB4_10K',
          title: '⚡ Sub-4 10K Speedster',
          category: 'DISTANCE',
          icon: '⚡',
          description: 'Duy trì vận tốc Pace < 4:00/km trên quãng đường 10 km',
          achievedAt: '2026-11-01',
          rarity: 'RARE',
          verificationHash: 'OR-CERT-SPD-482019',
        },
        {
          id: 'badge-trail',
          code: 'TRAIL_BAVI',
          title: '🏔️ Chinh Phục Dốc Ba Vì',
          category: 'TRAIL',
          icon: '🏔️',
          description: 'Vượt tổng độ cao dốc tích lũy Elevation Gain > 800m',
          achievedAt: '2026-10-18',
          rarity: 'EPIC',
          verificationHash: 'OR-CERT-TRL-774412',
        },
        {
          id: 'badge-streak',
          code: 'STREAK_14D',
          title: '🔥 Chiến Binh Chuỗi 14 Ngày',
          category: 'STREAK',
          icon: '🔥',
          description: 'Duy trì liên tục 14 ngày chạy bộ hợp lệ không ngắt quãng',
          achievedAt: '2026-11-06',
          rarity: 'LEGENDARY',
          verificationHash: 'OR-CERT-STRK-140028',
        },
      ],
    };
    this.runnerMilestones.set(milestones.athleteId, milestones);
  }

  // Running Shoe Operations
  getRunningShoes(userId: string = 'user-01'): RunningShoe[] {
    return Array.from(this.runningShoes.values()).filter(s => s.userId === userId);
  }

  createRunningShoe(userId: string, data: Partial<RunningShoe>): RunningShoe {
    const id = data.id || `shoe-${Date.now().toString().slice(-6)}`;
    const maxKm = Number(data.maxDistanceKm) || 600;
    const currentKm = Number(data.currentDistanceKm) || 0;
    const percentUsed = Math.round((currentKm / maxKm) * 1000) / 10;
    let warningLevel: 'SAFE' | 'CAUTION' | 'REPLACE' = 'SAFE';
    if (percentUsed >= 90) warningLevel = 'REPLACE';
    else if (percentUsed >= 70) warningLevel = 'CAUTION';

    // If marked default, unset default from all other shoes of this user
    if (data.isDefault) {
      for (const s of this.runningShoes.values()) {
        if (s.userId === userId) s.isDefault = false;
      }
    }

    const shoe: RunningShoe = {
      id,
      userId,
      brand: data.brand || 'Khác',
      name: data.name || 'Giày Chạy Bộ Mới',
      category: data.category || 'daily_trainer',
      categoryLabel: data.categoryLabel || (data.category === 'race_day' ? 'Giày thi đấu Carbon' : 'Daily Trainer'),
      currentDistanceKm: currentKm,
      maxDistanceKm: maxKm,
      isDefault: data.isDefault !== undefined ? data.isDefault : false,
      status: percentUsed >= 90 ? 'WARNING_REPLACE' : 'ACTIVE',
      warningLevel,
      percentUsed,
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.runningShoes.set(id, shoe);
    return shoe;
  }

  updateRunningShoe(id: string, data: Partial<RunningShoe>): RunningShoe {
    const existing = this.runningShoes.get(id);
    if (!existing) throw new Error(`Shoe with ID ${id} not found`);

    if (data.name !== undefined) existing.name = data.name;
    if (data.brand !== undefined) existing.brand = data.brand;
    if (data.category !== undefined) existing.category = data.category;
    if (data.categoryLabel !== undefined) existing.categoryLabel = data.categoryLabel;
    if (data.currentDistanceKm !== undefined) existing.currentDistanceKm = Number(data.currentDistanceKm);
    if (data.maxDistanceKm !== undefined) existing.maxDistanceKm = Number(data.maxDistanceKm);
    if (data.notes !== undefined) existing.notes = data.notes;
    if (data.status !== undefined) existing.status = data.status;

    existing.percentUsed = Math.round((existing.currentDistanceKm / existing.maxDistanceKm) * 1000) / 10;
    if (existing.percentUsed >= 90) {
      existing.warningLevel = 'REPLACE';
      if (existing.status !== 'RETIRED') existing.status = 'WARNING_REPLACE';
    } else if (existing.percentUsed >= 70) {
      existing.warningLevel = 'CAUTION';
    } else {
      existing.warningLevel = 'SAFE';
    }
    existing.updatedAt = new Date().toISOString();

    return existing;
  }

  setDefaultShoe(userId: string, shoeId: string): RunningShoe {
    const target = this.runningShoes.get(shoeId);
    if (!target) throw new Error(`Shoe with ID ${shoeId} not found`);
    if (target.userId !== userId) throw new Error(`Unauthorized shoe access`);

    for (const s of this.runningShoes.values()) {
      if (s.userId === userId) {
        s.isDefault = (s.id === shoeId);
        s.updatedAt = new Date().toISOString();
      }
    }
    return target;
  }

  // Training Load Operations
  getTrainingLoad(userId: string = 'user-01'): TrainingLoadRecovery {
    let load = this.trainingLoads.get(userId);
    if (!load) {
      this.seedProRunnerData();
      load = this.trainingLoads.get(userId)!;
    }
    return load;
  }

  refreshTrainingLoad(userId: string = 'user-01'): TrainingLoadRecovery {
    let load = this.trainingLoads.get(userId);
    if (!load) {
      this.seedProRunnerData();
      load = this.trainingLoads.get(userId)!;
    }
    load.lastSyncAt = new Date().toISOString();
    load.acuteLoad = Math.round(680 + Math.random() * 20);
    load.chronicLoad = 600;
    load.loadRatio = Math.round((load.acuteLoad / load.chronicLoad) * 100) / 100;
    load.recoveryHours = Math.max(0, Math.round(16 + Math.random() * 6));
    load.trainingStatus = load.loadRatio > 1.3 ? 'Overreaching' : (load.loadRatio >= 0.8 ? 'Productive' : 'Recovery');
    load.trainingStatusLabel = load.trainingStatus === 'Productive'
      ? '🟢 Hiệu quả (Productive)'
      : (load.trainingStatus === 'Overreaching' ? '🔴 Cảnh báo Quá tải (Overreaching)' : '🟡 Phục hồi (Recovery)');
    return load;
  }

  // Runner Milestones Operations
  getMilestones(userId: string = 'user-01'): RunnerMilestonesStreak {
    let m = this.runnerMilestones.get(userId);
    if (!m) {
      this.seedProRunnerData();
      m = this.runnerMilestones.get(userId)!;
    }
    return m;
  }

  // ==========================================
  // [Subsystem 6.0] Club Admin & Captain Dashboard Operations
  // ==========================================

  public seedClubAdminData(): void {
    // 1. Pending Batch Activities (5 activities as requested)
    const pendingList: PendingActivityQueueItem[] = [
      {
        id: 'ACT_000075',
        athleteId: 'user-01',
        athleteName: 'Nguyễn Văn A',
        athleteAvatar: 'NA',
        teamName: 'Team Phoenix SARC',
        sportType: 'TrailRun',
        distanceKm: 8.0,
        movingTimeMinutes: 60,
        paceMinPerKm: '7:30 /km',
        elevationGainM: 260,
        heartRateAvgBpm: 152,
        syncSource: 'Garmin Direct',
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        validityVerdict: 'Hợp lệ - Dốc đạt chuẩn Trail 260m (Đã qua kiểm định Auto-Gain)',
        status: 'pending',
        selected: true,
      },
      {
        id: 'ACT_000076',
        athleteId: 'user-02',
        athleteName: 'Trần Thị B',
        athleteAvatar: 'TB',
        teamName: 'Team Dragons SADC',
        sportType: 'Treadmill',
        distanceKm: 5.2,
        movingTimeMinutes: 30,
        paceMinPerKm: '5:46 /km',
        elevationGainM: 15,
        heartRateAvgBpm: 148,
        syncSource: 'Strava',
        submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        validityVerdict: 'Hợp lệ - Nhịp tim Treadmill liên tục (HR Avg 148 bpm, không ngắt quãng)',
        status: 'pending',
        selected: true,
      },
      {
        id: 'ACT_000077',
        athleteId: 'user-03',
        athleteName: 'Lê Hoàng C',
        athleteAvatar: 'LC',
        teamName: 'Team Tigers SADC',
        sportType: 'Run',
        distanceKm: 12.0,
        movingTimeMinutes: 64,
        paceMinPerKm: '5:20 /km',
        elevationGainM: 40,
        heartRateAvgBpm: 155,
        syncSource: 'Coros Direct',
        submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        validityVerdict: 'Hợp lệ - GPS ngoài trời chuẩn xác, sải chân ổn định',
        status: 'pending',
        selected: true,
      },
      {
        id: 'ACT_000078',
        athleteId: 'user-05',
        athleteName: 'Hoàng Kim Dung',
        athleteAvatar: 'KD',
        teamName: 'Team Phoenix SARC',
        sportType: 'Run',
        distanceKm: 4.5,
        movingTimeMinutes: 28,
        paceMinPerKm: '6:13 /km',
        elevationGainM: 10,
        heartRateAvgBpm: 135,
        syncSource: 'Strava',
        submittedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
        validityVerdict: 'Hợp lệ - Đã tự động cắt bỏ đuôi xe máy 250m',
        status: 'pending',
        selected: true,
      },
      {
        id: 'ACT_000079',
        athleteId: 'user-06',
        athleteName: 'Đặng Tuấn Kiệt',
        athleteAvatar: 'TK',
        teamName: 'Team Phoenix SARC',
        sportType: 'Run',
        distanceKm: 6.0,
        movingTimeMinutes: 35,
        paceMinPerKm: '5:50 /km',
        elevationGainM: 20,
        heartRateAvgBpm: 142,
        syncSource: 'Garmin Direct',
        submittedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
        validityVerdict: 'Hợp lệ - Nhịp tim Zone 3 đạt chuẩn bài chạy tích lũy',
        status: 'pending',
        selected: true,
      },
    ];

    this.clubPendingActivities.clear();
    pendingList.forEach((item) => this.clubPendingActivities.set(item.id, item));

    // 2. Open Disputes (1 dispute overdue > 24h as requested)
    const dispute1: ClubDisputeQueueItem = {
      id: 'DISP_2026_001',
      activityId: 'ACT_000073',
      athleteId: 'user-03',
      athleteName: 'Lê Hoàng C',
      teamName: 'Team Tigers SADC',
      originalDistanceKm: 2.4,
      appealReason: 'Bị lỗi mất sóng GPS khi chạy qua đoạn hầm chung cư Royal City ngắt quãng. Đồng hồ Garmin đo thực tế 3.4km. Kính đề nghị Ban Điều Hành xem xét công nhận đạt mốc tối thiểu 3km.',
      hoursOpen: 26.5,
      isOverdue: true,
      status: 'open',
    };
    this.clubDisputes.clear();
    this.clubDisputes.set(dispute1.id, dispute1);

    // 3. Reconciliations (1 overdue member debt > 3 days)
    const rec1: ClubReconciliationItem = {
      id: 'LEDG_001',
      memberId: 'user-04',
      memberName: 'Phạm Minh Đức',
      teamName: 'Team Dragons SADC',
      amountVnd: 50000,
      reason: 'Phạt trễ tiến độ tuần 19 (<15km)',
      daysOverdue: 4,
      status: 'unpaid',
      vietQrUrl: 'https://img.vietqr.io/image/970422-0901234567-compact2.png?amount=50000&addInfo=OR10%20PMD4%20PHAT',
    };
    this.clubReconciliations.clear();
    this.clubReconciliations.set(rec1.id, rec1);

    // 4. Default Broadcast Message / Seed
    this.clubBroadcasts = [
      {
        id: 'BCST_001',
        clubId: 'club-sarc-sadc',
        title: 'Nhắc nhở chốt cự ly trước 23:59 Chủ Nhật',
        content: '📢 **THÔNG BÁO KHẨN TỪ BAN ĐIỀU HÀNH CLB SARC**\nNhắc nhở toàn thể 48 VĐV chốt cự ly tuần 20 trước **23:59 tối Chủ Nhật hôm nay**! Hiện tỷ lệ hoàn thành CLB đang ở mức 68.5% (dưới chỉ tiêu 70%). Hãy xỏ giày hoàn tất tối thiểu 3km để không bị phạt quỹ!',
        templateKey: 'sunday_deadline',
        targetChannel: 'all',
        senderName: 'Hoàng Văn Minh (Chủ nhiệm)',
        sentAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        deliveryCount: 48,
      },
    ];
  }

  getClubAdminDashboard(clubId: string = 'club-sarc-sadc'): ClubAdminDashboardDto {
    if (this.clubPendingActivities.size === 0) {
      this.seedClubAdminData();
    }

    const pendingList = Array.from(this.clubPendingActivities.values()).filter(a => a.status === 'pending');
    const disputesList = Array.from(this.clubDisputes.values());
    const reconciliationsList = Array.from(this.clubReconciliations.values());
    const openDisputes = disputesList.filter(d => d.status === 'open');
    const overdueDisputes = openDisputes.filter(d => d.hoursOpen > 24);

    const unpaidReconciliations = reconciliationsList.filter(r => r.status === 'unpaid');
    const outstandingDebt = unpaidReconciliations.reduce((sum, r) => sum + r.amountVnd, 0);
    const hasOverdueDebt = unpaidReconciliations.some(r => r.daysOverdue > 3);

    const weeklyCompletionRate = 68.5; // Under 70% threshold

    const kpis: ClubAdminKPIs = {
      memberCount: 48,
      targetMembers: 50,
      treasuryCollectedVnd: 4800000,
      treasuryTargetVnd: 5000000,
      pendingReviewCount: pendingList.length,
      pendingReviewWarning: pendingList.length > 10,
      outstandingDebtVnd: outstandingDebt,
      outstandingDebtWarning: hasOverdueDebt,
      penaltyCount: 0,
      openDisputesCount: openDisputes.length,
      openDisputesWarning: overdueDisputes.length > 0,
      weeklyCompletionRatePercent: weeklyCompletionRate,
      weeklyCompletionWarning: weeklyCompletionRate < 70,
    };

    const teamStandings: TeamStandingQuickView[] = [
      {
        rank: 1,
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        captainName: 'Nguyễn Văn A',
        completionRatePercent: 87.5,
        totalKm: 1250.0,
        activeRunnersCount: 16,
        maxRunnersCount: 16,
        status: 'leading',
        statusBadge: '🟢 Dẫn đầu',
      },
      {
        rank: 2,
        teamId: 'team-dragons',
        teamName: 'Team Dragons SADC',
        captainName: 'Trần Quốc Tuấn',
        completionRatePercent: 75.0,
        totalKm: 1120.0,
        activeRunnersCount: 16,
        maxRunnersCount: 16,
        status: 'contending',
        statusBadge: '🟡 Bám đuổi',
      },
      {
        rank: 3,
        teamId: 'team-pegasus',
        teamName: 'Team Pegasus SARC',
        captainName: 'Lê Thu Thảo',
        completionRatePercent: 62.5,
        totalKm: 980.0,
        activeRunnersCount: 16,
        maxRunnersCount: 18,
        status: 'chasing',
        statusBadge: '🟠 Cần bứt phá',
      },
    ];

    return {
      clubId,
      clubName: 'CLB SARC',
      seasonName: 'Mùa 10 Run to Techcombank 2026',
      seasonStatus: 'Đang chạy (Tuần 20)',
      currentWeek: 20,
      kpis,
      pendingActivities: pendingList,
      disputes: disputesList,
      reconciliations: reconciliationsList,
      teamStandings,
      recentBroadcasts: this.clubBroadcasts,
      openRaces: this.openRacesList,
      pulseAnalytics: this.getClubPulseAnalytics(clubId),
      churnWatchlist: this.churnWatchlistStore,
    };
  }

  private churnWatchlistStore: ChurnRiskRunnerItem[] = [
    {
      id: 'churn-1',
      athleteName: 'Hoàng Văn Em',
      teamName: 'Team Phoenix SARC',
      inactiveDays: 16,
      lastActivityDate: '22/10/2026',
      riskLevel: 'high',
      reason: 'Chùng bước sau giải HM (0 bài tuần 19-20)',
      phone: '0912***456',
      status: 'pending_reminder',
    },
    {
      id: 'churn-2',
      athleteName: 'Đỗ Thị Hoa',
      teamName: 'Team Dragons SADC',
      inactiveDays: 18,
      lastActivityDate: '20/10/2026',
      riskLevel: 'critical',
      reason: 'Nguy cơ bỏ giải (không đồng bộ Strava 18 ngày)',
      phone: '0983***789',
      status: 'pending_reminder',
    },
    {
      id: 'churn-3',
      athleteName: 'Nguyễn Tiến Đạt',
      teamName: 'Team Pegasus SARC',
      inactiveDays: 15,
      lastActivityDate: '23/10/2026',
      riskLevel: 'medium',
      reason: 'Chấn thương cơ nhẹ, cần động viên hồi phục',
      phone: '0904***112',
      status: 'pending_reminder',
    },
    {
      id: 'churn-4',
      athleteName: 'Vũ Thu Trang',
      teamName: 'Team Phoenix SARC',
      inactiveDays: 21,
      lastActivityDate: '17/10/2026',
      riskLevel: 'critical',
      reason: 'Công tác xa không mang đồng hồ chạy bộ',
      phone: '0977***334',
      status: 'reminded',
    },
  ];

  private openRacesList: OpenRaceAdminItem[] = [
    {
      id: 'race-trail-bavi',
      name: 'SARC Trail Challenge Ba Vì 2026',
      scope: 'community',
      status: 'live',
      statusText: 'ĐANG DIỄN RA',
      enrolledCount: 64,
      totalSlots: 80,
      fillRatePercent: 80.0,
      endDate: '25/11/2026',
      daysRemaining: 18,
      landingSlug: 'sarc-trail-challenge-ba-vi-2026',
    },
    {
      id: 'race-season-10',
      name: 'Mùa 10 Run to Techcombank 2026',
      scope: 'club',
      status: 'live',
      statusText: 'ĐANG DIỄN RA',
      enrolledCount: 48,
      totalSlots: 50,
      fillRatePercent: 96.0,
      endDate: '30/11/2026',
      daysRemaining: 23,
      landingSlug: 'season-10-run-to-techcombank',
    },
    {
      id: 'race-ny-2027',
      name: 'SARC Chào Xuân Đinh Mùi 2027',
      scope: 'club',
      status: 'upcoming',
      statusText: 'SẮP KHỞI TRANH',
      enrolledCount: 28,
      totalSlots: 60,
      fillRatePercent: 46.7,
      endDate: '15/01/2027',
      daysRemaining: 69,
      landingSlug: 'sarc-new-year-half-marathon-2027',
    },
  ];

  getClubPulseAnalytics(clubId: string = 'club-sarc-sadc'): ClubPulseAnalyticsDto {
    return {
      totalActiveRunners: 128,
      totalWeeklyRuns: 512,
      peakHours: 'Thứ Bảy & Chủ Nhật (05:00 - 07:30)',
      daysHeader: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'],
      blocks: [
        { timeBlock: '05:00 - 08:00 (Sáng sớm)', dailyCounts: [32, 28, 35, 30, 42, 58, 62] },
        { timeBlock: '11:00 - 13:00 (Trưa)', dailyCounts: [4, 6, 5, 4, 8, 12, 10] },
        { timeBlock: '17:00 - 20:00 (Chiều tối)', dailyCounts: [25, 29, 31, 28, 38, 45, 40] },
        { timeBlock: '20:00 - 23:00 (Đêm)', dailyCounts: [8, 10, 9, 12, 14, 15, 12] },
      ],
      churnWatchlist: this.churnWatchlistStore,
    };
  }

  remindChurnRunner(runnerId: string, channel: string = 'zalo'): ChurnRiskRunnerItem {
    const item = this.churnWatchlistStore.find(r => r.id === runnerId);
    if (!item) throw new Error(`Runner with id ${runnerId} not found in churn watchlist`);
    item.status = 'reminded';
    return item;
  }

  getClubRolePerspective(role: string = 'president') {
    const validRole = ['president', 'technical', 'treasurer'].includes(role) ? role : 'president';
    const roleConfigs: Record<string, { roleName: string; roleTitle: string; primaryFocus: string; priorityWidgets: string[] }> = {
      president: {
        roleName: 'president',
        roleTitle: 'Chủ Nhiệm CLB',
        primaryFocus: 'Tài chính, Tăng trưởng thành viên & Báo cáo tổng thể',
        priorityWidgets: ['widget-kpis', 'widget-pulse-analytics', 'widget-open-races', 'widget-team-standings'],
      },
      technical: {
        roleName: 'technical',
        roleTitle: 'Trưởng Ban Chuyên Môn',
        primaryFocus: 'Hàng đợi kiểm duyệt bài chạy, Giải quyết khiếu nại cự ly & Theo dõi chùng bước',
        priorityWidgets: ['widget-urgent-review-queue', 'widget-dispute-resolver', 'widget-churn-risk', 'widget-pulse-analytics'],
      },
      treasurer: {
        roleName: 'treasurer',
        roleTitle: 'Thủ Quỹ CLB',
        primaryFocus: 'Đối soát tự động Dynamic VietQR, Sổ nợ quỹ / phạt & Chốt sổ tuần',
        priorityWidgets: ['widget-reconciliation-queue', 'widget-kpis', 'widget-lock-week', 'widget-broadcast-hub'],
      },
    };
    return roleConfigs[validRole];
  }

  batchApproveActivities(activityIds?: string[]): { approvedCount: number; remainingCount: number; approvedIds: string[] } {
    const idsToApprove = activityIds && activityIds.length > 0
      ? activityIds
      : Array.from(this.clubPendingActivities.values()).filter(a => a.status === 'pending').map(a => a.id);

    const approvedIds: string[] = [];
    idsToApprove.forEach(id => {
      const act = this.clubPendingActivities.get(id);
      if (act) {
        act.status = 'approved';
        approvedIds.push(id);
      }
    });

    const remainingCount = Array.from(this.clubPendingActivities.values()).filter(a => a.status === 'pending').length;
    return {
      approvedCount: approvedIds.length,
      remainingCount,
      approvedIds,
    };
  }

  resolveClubDispute(disputeId: string, action: 'bonus' | 'reject', bonusKm: number = 1.0, note?: string): ClubDisputeQueueItem {
    const dispute = this.clubDisputes.get(disputeId);
    if (!dispute) throw new Error(`Dispute ${disputeId} not found`);

    if (action === 'bonus') {
      dispute.status = 'resolved_bonus';
      dispute.bonusKmGranted = bonusKm;
      dispute.resolutionNote = note || `Đã cộng bù +${bonusKm}km theo giải trình tín hiệu GPS hầm Royal City.`;
    } else {
      dispute.status = 'rejected';
      dispute.resolutionNote = note || 'Giữ nguyên từ chối theo quy chế tối thiểu 3km của giải đấu.';
    }
    dispute.resolvedAt = new Date().toISOString();
    return dispute;
  }

  reconcileLedger(ledgerId: string, method: 'manual_cash' | 'vietqr_auto' | 'remind'): ClubReconciliationItem {
    const item = this.clubReconciliations.get(ledgerId);
    if (!item) throw new Error(`Ledger item ${ledgerId} not found`);

    if (method === 'manual_cash' || method === 'vietqr_auto') {
      item.status = 'paid';
      item.settledAt = new Date().toISOString();
    } else if (method === 'remind') {
      item.status = 'reminded';
      item.lastRemindedAt = new Date().toISOString();
    }
    return item;
  }

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
    const rawChannels = msg.channels || (msg.targetChannel === 'all' ? ['zalo', 'in_app', 'email'] : [msg.targetChannel || 'zalo']);
    const newBroadcast: ClubBroadcastMessage = {
      id: `BCST_${Date.now()}`,
      clubId: msg.clubId || 'club-sarc-sadc',
      title: msg.title,
      content: msg.content,
      templateKey: msg.templateKey,
      targetChannel: (msg.targetChannel as any) || 'all',
      senderName: msg.senderName || 'Ban Điều Hành SARC',
      sentAt: new Date().toISOString(),
      deliveryCount: msg.deliveryCount || 48,
      sentChannels: rawChannels,
    };
    this.clubBroadcasts.unshift(newBroadcast);
    return newBroadcast;
  }

  lockSeasonWeek(weekNumber: number = 20, confirmed: boolean = true): { week: number; isLocked: boolean; lockedAt: string; totalKm: number; penalizedRunnersCount?: number; totalPenaltyVnd?: number } {
    if (!confirmed) {
      throw new Error('Yêu cầu xác nhận 2 bước an toàn để chốt sổ tuần.');
    }
    this.clubSeasonWeekLocked[weekNumber] = {
      isLocked: true,
      lockedAt: new Date().toISOString(),
      totalKm: 3350.0,
    };
    return {
      week: weekNumber,
      isLocked: true,
      lockedAt: this.clubSeasonWeekLocked[weekNumber].lockedAt,
      totalKm: 3350.0,
      penalizedRunnersCount: 3,
      totalPenaltyVnd: 150000,
    };
  }

  // ==========================================
  // [Navigation Subsystem] Role-Based Navigation & Menu Portals
  // ==========================================

  private userActivePortalRole: Record<string, PortalRoleId> = {
    'user-01': 'all',
    'default': 'runner'
  };

  private portalRoleDefinitions: PortalRoleDefinition[] = [
    {
      id: 'runner',
      label: 'Vận Động Viên (Runner Portal)',
      shortLabel: 'Runner Portal',
      icon: '🏃',
      description: 'Chỉ tiêu tuần, tiến độ cá nhân, đồng bộ thiết bị & giải đấu',
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'club',
      label: 'Câu Lạc Bộ & Đội (Club Space)',
      shortLabel: 'Không Gian CLB',
      icon: '🤝',
      description: 'Không gian CLB, Đội thi đấu, Mạng xã hội Kudos & AI PacerBot',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'captain',
      label: 'Ban Điều Hành CLB (Club Admin & Captain)',
      shortLabel: 'Ban Điều Hành CLB',
      icon: '⚡',
      description: 'Quản trị thành viên, thể lệ, duyệt bài chạy & đối soát quỹ VietQR',
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'admin',
      label: 'Quản Trị Nền Tảng (Super Admin)',
      shortLabel: 'Super Admin',
      icon: '🛡️',
      description: 'Giám sát hạ tầng, Webhook queue, IAM RBAC & Cấu hình toàn sàn',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'all',
      label: 'Tất Cả Phân Hệ (All Portals)',
      shortLabel: 'Tất Cả Phân Hệ',
      icon: '🌐',
      description: 'Góc nhìn mở rộng toàn diện cả 4 phân hệ chức năng',
      badgeColor: 'bg-slate-700'
    }
  ];

  private navigationGroups: NavigationGroup[] = [
    {
      id: 'group-runner',
      roleId: 'runner',
      title: 'Phân Hệ: Dành Cho Vận Động Viên (Runner Portal)',
      shortTitle: 'VẬN ĐỘNG VIÊN',
      description: 'Thành viên tham gia chạy bộ, theo dõi tiến độ cá nhân, đồng bộ thiết bị và tương tác giải đấu',
      badge: 'Cá Nhân',
      items: [
        {
          id: 'nav-runner-dashboard',
          title: 'Tổng Quan',
          subtitle: 'Chỉ tiêu tuần, tiến độ cá nhân, thẻ giải đấu hiện tại, thao tác nhanh',
          tabId: 'dashboard',
          icon: '⊞',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-activities-all',
          title: 'Toàn bộ bài chạy',
          subtitle: 'Toàn bộ bài chạy cá nhân, đồng bộ Strava & thiết bị',
          tabId: 'activities-all',
          icon: '⚡',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-activities-filter',
          title: 'Lọc theo giải đấu',
          subtitle: 'Bộ lọc chuyên sâu theo chặng và từng giải đấu',
          tabId: 'activities-filter',
          icon: '🔍',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-activities-inspection',
          title: 'Chi tiết thẩm định & Trail',
          subtitle: 'Thẩm định AI, Trail D+, Treadmill và AI auto-trim',
          tabId: 'activities-inspection',
          icon: '⛰️',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-activities-appeals',
          title: 'Trung tâm khiếu nại',
          subtitle: 'Gửi yêu cầu xem xét lại bài chạy và GPS dispute',
          tabId: 'activities-appeals',
          icon: '⚖️',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-arena',
          title: 'Bảng Xếp Hạng',
          subtitle: 'Hero đếm ngược, Bảng xếp hạng đội, BXH cá nhân, luồng SSE live',
          tabId: 'arena',
          icon: '🏆',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-devices',
          title: 'Kết Nối Thiết Bị',
          subtitle: 'Quản lý Strava OAuth, kết nối Garmin/Coros trực tiếp, nhật ký sync',
          tabId: 'strava-sync',
          icon: '⌚',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-debt',
          title: 'Sổ nợ & Đóng quỹ',
          subtitle: 'Quản lý sổ nợ quỹ cá nhân, cú pháp Dynamic VietQR',
          tabId: 'athlete-debt',
          icon: '💳',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-profile',
          title: 'Hồ sơ cá nhân & GDPR',
          subtitle: 'Cập nhật thông tin định danh, tùy chọn xuất JSON & GDPR',
          tabId: 'athlete-profile',
          icon: '👤',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        },
        {
          id: 'nav-runner-theme',
          title: 'Tùy chọn giao diện',
          subtitle: 'Tùy chỉnh giao diện Mantis UI và chế độ hiển thị',
          tabId: 'theme-preferences',
          icon: '🎨',
          badge: '',
          badgeColor: '',
          roles: ['runner', 'all']
        }
      ]
    },
    {
      id: 'group-club',
      roleId: 'club',
      title: 'Phân Hệ: Dành Cho Câu Lạc Bộ & Đội (Club & Team Space)',
      shortTitle: 'CÂU LẠC BỘ & ĐỘI',
      description: 'VĐV sinh hoạt chung trong CLB, tham gia đội đua nội bộ, kết nối mạng xã hội và hoạt động tập thể',
      badge: 'SARC',
      items: [
        {
          id: 'nav-club-feed',
          title: 'Hồ sơ & Bảng tin CLB',
          subtitle: 'Hồ sơ câu lạc bộ, bảng tin chung thành viên, danh sách ban cán sự và tin tức',
          tabId: 'club-feed',
          icon: '🏛️',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-races',
          title: 'Giải thi đấu nội bộ CLB',
          subtitle: 'Danh mục các giải chạy nội bộ & mở rộng, bảng kết quả, tiền thưởng và chứng nhận',
          tabId: 'club-races',
          icon: '🏆',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-members',
          title: 'Thành viên & Cơ cấu đội',
          subtitle: 'Danh bạ thành viên, cơ cấu phân bổ đội hình Phoenix, Tigers, Dragons',
          tabId: 'club-members',
          icon: '👥',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-invites',
          title: 'Mời TV & Chống In-App',
          subtitle: 'Mã mời thông minh, cơ chế chống mở in-app browser Zalo/Facebook và bảo vệ OAuth',
          tabId: 'club-invites',
          icon: '🛡️',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-myteams',
          title: 'Đội Của Tôi',
          subtitle: 'Thông tin đội đua nội bộ Team Phoenix SARC, danh sách thành viên & Đội trưởng',
          tabId: 'teams',
          icon: '👥',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-social',
          title: 'Bảng Tin & Kudos',
          subtitle: 'Dòng thời gian hoạt động của thành viên, thả Kudos, bình luận, chat trực tiếp',
          tabId: 'social',
          icon: '💬',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-pacerbot',
          title: 'Trợ Lý AI',
          subtitle: 'Chat với AI PacerBot hỏi lịch trình, tra cứu quy chế, tư vấn giáo án',
          tabId: 'chat',
          icon: '🤖',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        },
        {
          id: 'nav-club-governance',
          title: 'Hoạt Động & Biểu Quyết',
          subtitle: 'Tham gia điểm danh sự kiện (RSVP) và bỏ phiếu khảo sát Ban điều hành',
          tabId: 'governance',
          icon: '🗳️',
          badge: '',
          badgeColor: '',
          roles: ['club', 'all']
        }
      ]
    },
    {
      id: 'group-captain',
      roleId: 'captain',
      title: 'Phân Hệ: Dành Cho Ban Điều Hành Câu Lạc Bộ (Club Admin & Captain Portal)',
      shortTitle: 'BAN ĐIỀU HÀNH CLB',
      description: 'Đội trưởng, Thủ quỹ, Ban quản trị CLB chịu trách nhiệm vận hành giải, duyệt thành viên và tài chính',
      badge: 'Captain & Admin',
      items: [
        {
          id: 'nav-captain-profile-manage',
          title: 'Hồ Sơ & Ban Cán Sự CLB',
          subtitle: 'Quản lý thông tin CLB, Khẩu hiệu tôn chỉ, cơ cấu Ban cán sự và Bảng tin thông báo',
          tabId: 'club-profile-manage',
          icon: '🏛️',
          badge: '',
          badgeColor: '',
          roles: ['captain', 'admin', 'all']
        },
        {
          id: 'nav-captain-members',
          title: 'Thành Viên',
          subtitle: 'Duyệt/Khóa thành viên, cấp mã mời chống In-App, thiết lập hạn dùng',
          tabId: 'club-manage',
          icon: '👥',
          badge: '',
          badgeColor: '',
          roles: ['captain', 'all']
        },
        {
          id: 'nav-captain-raceops',
          title: 'Thiết Lập Giải',
          subtitle: 'Wizard thể lệ (Khóa mốc giờ, cự ly tối thiểu), phân bổ đội hình, miễn phạt tuần',
          tabId: 'rules',
          icon: '⚙️',
          badge: '',
          badgeColor: '',
          roles: ['captain', 'all']
        },
        {
          id: 'nav-captain-batch',
          title: 'Kiểm Duyệt Bài',
          subtitle: 'Dashboard Ban Điều Hành, hàng đợi duyệt Trail D+, Treadmill HR, cắt đuôi xe máy',
          tabId: 'club-admin',
          icon: '⚡',
          badge: '',
          badgeColor: '',
          roles: ['captain', 'all']
        },
        {
          id: 'nav-captain-finance',
          title: 'Tài Chính & Quỹ',
          subtitle: 'Cấu hình VietQR BIN, theo dõi sổ nợ quỹ toàn CLB, đối soát dòng tiền tự động',
          tabId: 'club-admin',
          sectionId: 'reconciliation-queue-container',
          icon: '💰',
          badge: '',
          badgeColor: '',
          roles: ['captain', 'all']
        },
        {
          id: 'nav-captain-broadcast',
          title: 'Truyền Thông & Chốt Tuần',
          subtitle: 'Gửi thông báo đẩy Broadcast toàn CLB, chốt giải đấu & đóng băng dữ liệu',
          tabId: 'club-admin',
          sectionId: 'admin-broadcast-section',
          icon: '📢',
          badge: '',
          badgeColor: '',
          roles: ['captain', 'all']
        }
      ]
    },
    {
      id: 'group-admin',
      roleId: 'admin',
      title: 'Phân Hệ: Dành Cho Nhà Quản Trị Nền Tảng (Super Admin / System Admin)',
      shortTitle: 'QUẢN TRỊ NỀN TẢNG',
      description: 'Quản trị viên cấp cao vận hành toàn bộ hệ thống SaaS, hạ tầng kỹ thuật và đa thuê bao',
      badge: 'Root / Super Admin',
      items: [
        {
          id: 'nav-admin-quota',
          title: 'Strava Quota & Burn Rate',
          subtitle: 'Dự báo thời điểm API quota chạm trần, Multi-App Token Rotation & Smart Polling',
          tabId: 'ops-quota',
          icon: '⚡',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-dlq',
          title: 'Webhook & Phẫu Thuật DLQ',
          subtitle: 'Phẫu thuật dữ liệu DLQ, chỉnh sửa payload JSON, gắn cờ lỗi & Replay từng gói tin',
          tabId: 'ops-dlq',
          icon: '🩺',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-tenants',
          title: 'Quản Lý Tenants CLB',
          subtitle: 'Giám sát toàn cảnh Tenant, cảnh báo CPU/Storage, phân tầng tài nguyên Gold/Silver/Bronze',
          tabId: 'ops-tenants',
          icon: '🏢',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-recompute',
          title: 'Recompute Có Phạm Vi',
          subtitle: 'Tính toán lại bảng xếp hạng có phạm vi (Scoped Recompute), mô phỏng trước Dry-run',
          tabId: 'ops-recompute',
          icon: '🔄',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-traffic',
          title: 'Lưu Lượng & Heatmap 24h',
          subtitle: 'Bản đồ nhiệt truy cập 24 giờ, giám sát đỉnh tải sáng sớm & cảnh báo nghẽn DB',
          tabId: 'ops-traffic',
          icon: '📊',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-partners',
          title: 'Đối Tác & Uptime SLA',
          subtitle: 'Quản lý đối tác API bên thứ 3, bảng cam kết SLA 99.9% & API Key Generator',
          tabId: 'ops-partners',
          icon: '🤝',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-billing',
          title: 'Kinh Doanh & SaaS MRR',
          subtitle: 'Doanh thu định kỳ MRR/ARR, theo dõi dòng tiền SaaS & cảnh báo gia hạn Tenant',
          tabId: 'ops-billing',
          icon: '💰',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-security',
          title: 'An Ninh & Audit SHA-256',
          subtitle: 'Sổ cái kiểm toán bất biến SHA-256 Merkle Hash, phát hiện xâm nhập & khóa khẩn cấp',
          tabId: 'ops-security',
          icon: '🛡️',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-iam',
          title: 'Phân Quyền (RBAC)',
          subtitle: 'Quản lý danh mục người dùng toàn sàn, ma trận phân quyền truy cập',
          tabId: 'system-admin',
          sectionId: 'sys-tab-users',
          icon: '🛡️',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        },
        {
          id: 'nav-admin-configs',
          title: 'Tham Số Hệ Thống',
          subtitle: 'Cấu hình 4 bộ danh mục thông số hệ thống dùng chung cho tất cả các tenant',
          tabId: 'system-admin',
          sectionId: 'sys-tab-catalogs',
          icon: '📋',
          badge: '',
          badgeColor: '',
          roles: ['admin', 'all']
        }
      ]
    }
  ];

  getPortalRoles(): PortalRoleDefinition[] {
    return [...this.portalRoleDefinitions];
  }

  getNavigationGroups(): NavigationGroup[] {
    return JSON.parse(JSON.stringify(this.navigationGroups));
  }

  getUserNavigationContext(userId: string = 'user-01'): UserNavigationContext {
    const activeRole: PortalRoleId = this.userActivePortalRole[userId] || this.userActivePortalRole['user-01'] || 'all';
    let filteredGroups: NavigationGroup[];

    if (activeRole === 'all') {
      filteredGroups = this.navigationGroups;
    } else {
      filteredGroups = this.navigationGroups.filter(g => g.roleId === activeRole);
    }

    const totalMenuItems = this.navigationGroups.reduce((acc, g) => acc + g.items.length, 0);

    return {
      userId,
      userName: 'Nguyễn Văn A',
      userRole: 'CLUB_ADMIN',
      activeRole,
      availableRoles: this.getPortalRoles(),
      groups: filteredGroups,
      totalMenuItems
    };
  }

  setUserActivePortalRole(userId: string = 'user-01', role: PortalRoleId): { success: boolean; activeRole: PortalRoleId; groupCount: number } {
    const validRoles: PortalRoleId[] = ['runner', 'club', 'captain', 'admin', 'all'];
    const chosenRole = validRoles.includes(role) ? role : 'all';
    this.userActivePortalRole[userId] = chosenRole;

    const groupCount = chosenRole === 'all'
      ? this.navigationGroups.length
      : this.navigationGroups.filter(g => g.roleId === chosenRole).length;

    return {
      success: true,
      activeRole: chosenRole,
      groupCount
    };
  }
  // ==========================================
  // [Race Dashboard] Multi-Selection Tournament Ecosystem Methods
  // ==========================================

  public seedRaceDashboardData(): void {
    // 1. Race 1: Mùa 10 - SARC Summer Race (Road to Techcombank 2026)
    const race1: RaceSelectorItem = {
      id: 'race-season-10',
      slug: 'season-10-run-to-techcombank',
      name: 'Mùa 10 - SARC Summer Race (Road to Techcombank 2026)',
      season: 'Mùa 10',
      clubId: 'club-sarc',
      clubName: 'Sài Gòn Athletes Running Club (SARC)',
      status: 'running',
      statusBadge: 'Đang diễn ra',
      startDate: '2026-05-01',
      endDate: '2026-07-31',
      participantsCount: 128,
      teamsCount: 8,
      totalKm: 15420.5,
      targetKm: 20000.0,
      isUserJoined: true,
      userRank: 1,
      bannerUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80'
    };

    const kpi1: RaceKpiSummary = {
      raceId: 'race-season-10',
      raceName: race1.name,
      totalAthletes: 128,
      totalTeams: 8,
      athletesByClubOrTeam: [
        { name: 'Team Phoenix SARC', count: 16 },
        { name: 'Team Dragons SARC', count: 16 },
        { name: 'Team Pegasus SARC', count: 16 },
        { name: 'Team Tigers SARC', count: 16 },
        { name: 'Team Eagles SARC', count: 16 },
        { name: 'Team Wolves SARC', count: 16 },
        { name: 'Team Lions SARC', count: 16 },
        { name: 'Team Falcons SARC', count: 16 }
      ],
      totalAccumulatedKm: 15420.5,
      targetKm: 20000.0,
      progressPercent: 77.1,
      completionRatePercent: 84.5,
      totalPrizePoolVnd: 25000000,
      totalPenaltiesVnd: 3200000,
      unpaidDebtVnd: 450000
    };

    const daily1: RaceDailyDistancePoint[] = [
      { date: '2026-06-01', dayOfWeek: 'Thứ 2', distanceKm: 1840.5, isPeakDay: false, activityCount: 112 },
      { date: '2026-06-02', dayOfWeek: 'Thứ 3', distanceKm: 2120.0, isPeakDay: false, activityCount: 120 },
      { date: '2026-06-03', dayOfWeek: 'Thứ 4', distanceKm: 1950.2, isPeakDay: false, activityCount: 110 },
      { date: '2026-06-04', dayOfWeek: 'Thứ 5', distanceKm: 2040.8, isPeakDay: false, activityCount: 118 },
      { date: '2026-06-05', dayOfWeek: 'Thứ 6', distanceKm: 1980.0, isPeakDay: false, activityCount: 115 },
      { date: '2026-06-06', dayOfWeek: 'Thứ 7 (Long Run)', distanceKm: 2850.5, isPeakDay: true, activityCount: 126 },
      { date: '2026-06-07', dayOfWeek: 'CN (Peak Day)', distanceKm: 3420.5, isPeakDay: true, activityCount: 128 }
    ];

    const dist1: RaceActivityTypeDistribution = {
      roadKm: 10485.9,
      roadPercent: 68.0,
      trailKm: 3392.5,
      trailPercent: 22.0,
      treadmillKm: 1542.1,
      treadmillPercent: 10.0,
      totalActivities: 829
    };

    const teams1: RaceTeamStanding[] = [
      { rank: 1, teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', medal: 'GOLD', medalIcon: '🥇', totalKm: 2840.5, activeRunners: 16, completionRate: 100.0 },
      { rank: 2, teamId: 'team-dragons', teamName: 'Team Dragons SARC', medal: 'SILVER', medalIcon: '🥈', totalKm: 2680.2, activeRunners: 16, completionRate: 96.5 },
      { rank: 3, teamId: 'team-pegasus', teamName: 'Team Pegasus SARC', medal: 'BRONZE', medalIcon: '🥉', totalKm: 2410.8, activeRunners: 15, completionRate: 92.0 },
      { rank: 4, teamId: 'team-tigers', teamName: 'Team Tigers SARC', medal: 'HONOR', medalIcon: '🎖️', totalKm: 2150.0, activeRunners: 14, completionRate: 88.0 },
      { rank: 5, teamId: 'team-eagles', teamName: 'Team Eagles SARC', medal: 'HONOR', medalIcon: '🎖️', totalKm: 1980.5, activeRunners: 13, completionRate: 84.0 }
    ];

    const ind1: RaceIndividualLeader[] = [
      { rank: 1, userId: 'user-01', athleteName: 'Nguyễn Văn A', teamName: 'Team Phoenix SARC', totalKm: 342.5, activitiesCount: 31, avgPace: '4:45', streakDays: 28 },
      { rank: 2, userId: 'user-02', athleteName: 'Trần Thị B', teamName: 'Team Dragons SARC', totalKm: 318.0, activitiesCount: 28, avgPace: '5:10', streakDays: 26 },
      { rank: 3, userId: 'user-03', athleteName: 'Lê Hoàng C', teamName: 'Team Pegasus SARC', totalKm: 295.4, activitiesCount: 25, avgPace: '4:30', streakDays: 24 },
      { rank: 4, userId: 'user-04', athleteName: 'Phạm Minh D', teamName: 'Team Phoenix SARC', totalKm: 280.0, activitiesCount: 24, avgPace: '5:15', streakDays: 22 },
      { rank: 5, userId: 'user-05', athleteName: 'Đỗ Anh E', teamName: 'Team Dragons SARC', totalKm: 264.2, activitiesCount: 22, avgPace: '5:00', streakDays: 21 },
      { rank: 6, userId: 'user-06', athleteName: 'Vũ Quỳnh F', teamName: 'Team Tigers SARC', totalKm: 250.8, activitiesCount: 21, avgPace: '5:40', streakDays: 20 },
      { rank: 7, userId: 'user-07', athleteName: 'Hoàng Văn G', teamName: 'Team Eagles SARC', totalKm: 238.5, activitiesCount: 20, avgPace: '5:25', streakDays: 19 },
      { rank: 8, userId: 'user-08', athleteName: 'Bùi Thị H', teamName: 'Team Phoenix SARC', totalKm: 225.0, activitiesCount: 19, avgPace: '5:50', streakDays: 18 },
      { rank: 9, userId: 'user-09', athleteName: 'Ngô Minh I', teamName: 'Team Dragons SARC', totalKm: 212.4, activitiesCount: 18, avgPace: '5:35', streakDays: 17 },
      { rank: 10, userId: 'user-10', athleteName: 'Đinh Tuấn K', teamName: 'Team Pegasus SARC', totalKm: 204.6, activitiesCount: 17, avgPace: '5:12', streakDays: 16 }
    ];

    const viol1: RaceSuspiciousViolationQueueItem[] = [
      {
        id: 'viol-s10-01',
        raceId: 'race-season-10',
        activityId: 'act-strava-7788',
        userId: 'user-02',
        athleteName: 'Trần Thị B',
        date: '2026-06-06',
        distanceKm: 12.5,
        pace: '2:10 min/km',
        elevationGainM: 45,
        flagType: 'MOTORBIKE_SPEED',
        flagBadge: 'Tốc Độ Xe Máy (Đã Auto-Trim)',
        details: 'Phân tích GPS 1.5km cuối có vận tốc 34km/h và cadence < 90spm. Hệ thống đã cắt đuôi phương tiện.',
        status: 'PENDING_REFEREE'
      },
      {
        id: 'viol-s10-02',
        raceId: 'race-season-10',
        activityId: 'act-strava-8899',
        userId: 'user-05',
        athleteName: 'Đỗ Anh E',
        date: '2026-06-05',
        distanceKm: 8.2,
        pace: '5:45 min/km',
        elevationGainM: 850,
        flagType: 'SUSPICIOUS_TRAIL_GAIN',
        flagBadge: 'Dốc Trail Bất Thường',
        details: 'Độ dốc leo 850m gain trong 40 phút sai lệch so với mô hình độ cao số trắc địa Ba Vì.',
        status: 'PENDING_REFEREE'
      },
      {
        id: 'viol-s10-03',
        raceId: 'race-season-10',
        activityId: 'act-strava-9911',
        userId: 'user-03',
        athleteName: 'Lê Hoàng C',
        date: '2026-06-04',
        distanceKm: 10.0,
        pace: '4:30 min/km',
        elevationGainM: 12,
        flagType: 'OVERLAPPING_TIME',
        flagBadge: 'Trùng Khớp Thời Gian',
        details: 'Thời gian bài chạy 06:15 trùng với một hoạt động máy chạy bộ khác đã nộp.',
        status: 'PENDING_REFEREE'
      },
      {
        id: 'viol-s10-04',
        raceId: 'race-season-10',
        activityId: 'act-strava-9922',
        userId: 'user-04',
        athleteName: 'Phạm Minh D',
        date: '2026-06-03',
        distanceKm: 5.0,
        pace: '5:15 min/km',
        elevationGainM: 0,
        flagType: 'IMPLAUSIBLE_PACE',
        flagBadge: 'Treadmill Thiếu HR',
        details: 'Bài chạy máy trong nhà thiếu tín hiệu nhịp tim liên tục (HR < 120 bpm) theo quy chế.',
        status: 'PENDING_REFEREE'
      }
    ];

    const dash1: RaceDashboardOverviewDto = {
      raceInfo: race1,
      kpis: kpi1,
      dailyAnalytics: daily1,
      activityDistribution: dist1,
      top5Teams: teams1,
      top10Individuals: ind1,
      violationQueue: viol1,
      lastUpdated: new Date().toISOString()
    };

    // 2. Race 2: Mùa 9 - Run to Techcombank 2025 (Chung Kết Toàn Mùa)
    const race2: RaceSelectorItem = {
      id: 'race-season-09',
      slug: 'season-09-run-to-techcombank',
      name: 'Mùa 9 - Run to Techcombank 2025 (Chung Kết)',
      season: 'Mùa 9',
      clubId: 'club-sarc',
      clubName: 'Sài Gòn Athletes Running Club (SARC)',
      status: 'completed',
      statusBadge: 'Đã kết thúc',
      startDate: '2025-08-01',
      endDate: '2025-11-30',
      participantsCount: 96,
      teamsCount: 6,
      totalKm: 18940.0,
      targetKm: 18000.0,
      isUserJoined: true,
      userRank: 2,
      bannerUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80'
    };

    const kpi2: RaceKpiSummary = {
      raceId: 'race-season-09',
      raceName: race2.name,
      totalAthletes: 96,
      totalTeams: 6,
      athletesByClubOrTeam: [
        { name: 'Team Dragons SARC', count: 16 },
        { name: 'Team Phoenix SARC', count: 16 },
        { name: 'Team Pegasus SARC', count: 16 },
        { name: 'Team Tigers SARC', count: 16 },
        { name: 'Team Eagles SARC', count: 16 },
        { name: 'Team Wolves SARC', count: 16 }
      ],
      totalAccumulatedKm: 18940.0,
      targetKm: 18000.0,
      progressPercent: 105.2,
      completionRatePercent: 92.0,
      totalPrizePoolVnd: 18000000,
      totalPenaltiesVnd: 1800000,
      unpaidDebtVnd: 0
    };

    const daily2: RaceDailyDistancePoint[] = [
      { date: '2025-11-24', dayOfWeek: 'Thứ 2', distanceKm: 2100.0, isPeakDay: false, activityCount: 88 },
      { date: '2025-11-25', dayOfWeek: 'Thứ 3', distanceKm: 2350.0, isPeakDay: false, activityCount: 92 },
      { date: '2025-11-26', dayOfWeek: 'Thứ 4', distanceKm: 2280.0, isPeakDay: false, activityCount: 90 },
      { date: '2025-11-27', dayOfWeek: 'Thứ 5', distanceKm: 2410.0, isPeakDay: false, activityCount: 94 },
      { date: '2025-11-28', dayOfWeek: 'Thứ 6', distanceKm: 2500.0, isPeakDay: false, activityCount: 95 },
      { date: '2025-11-29', dayOfWeek: 'Thứ 7 (Long Run)', distanceKm: 3400.0, isPeakDay: true, activityCount: 96 },
      { date: '2025-11-30', dayOfWeek: 'CN (Final Day)', distanceKm: 3900.0, isPeakDay: true, activityCount: 96 }
    ];

    const dist2: RaceActivityTypeDistribution = {
      roadKm: 14015.6,
      roadPercent: 74.0,
      trailKm: 3409.2,
      trailPercent: 18.0,
      treadmillKm: 1515.2,
      treadmillPercent: 8.0,
      totalActivities: 912
    };

    const teams2: RaceTeamStanding[] = [
      { rank: 1, teamId: 'team-dragons', teamName: 'Team Dragons SARC', medal: 'GOLD', medalIcon: '🥇', totalKm: 3420.0, activeRunners: 16, completionRate: 100.0 },
      { rank: 2, teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', medal: 'SILVER', medalIcon: '🥈', totalKm: 3380.5, activeRunners: 16, completionRate: 98.5 },
      { rank: 3, teamId: 'team-pegasus', teamName: 'Team Pegasus SARC', medal: 'BRONZE', medalIcon: '🥉', totalKm: 3150.0, activeRunners: 16, completionRate: 94.0 },
      { rank: 4, teamId: 'team-tigers', teamName: 'Team Tigers SARC', medal: 'HONOR', medalIcon: '🎖️', totalKm: 2890.0, activeRunners: 15, completionRate: 89.0 },
      { rank: 5, teamId: 'team-eagles', teamName: 'Team Eagles SARC', medal: 'HONOR', medalIcon: '🎖️', totalKm: 2650.0, activeRunners: 14, completionRate: 85.0 }
    ];

    const ind2: RaceIndividualLeader[] = [
      { rank: 1, userId: 'user-02', athleteName: 'Trần Thị B', teamName: 'Team Dragons SARC', totalKm: 412.0, activitiesCount: 36, avgPace: '4:55', streakDays: 32 },
      { rank: 2, userId: 'user-01', athleteName: 'Nguyễn Văn A', teamName: 'Team Phoenix SARC', totalKm: 395.2, activitiesCount: 34, avgPace: '4:42', streakDays: 30 },
      { rank: 3, userId: 'user-03', athleteName: 'Lê Hoàng C', teamName: 'Team Pegasus SARC', totalKm: 368.0, activitiesCount: 31, avgPace: '4:35', streakDays: 28 },
      { rank: 4, userId: 'user-05', athleteName: 'Đỗ Anh E', teamName: 'Team Dragons SARC', totalKm: 340.5, activitiesCount: 29, avgPace: '5:02', streakDays: 25 },
      { rank: 5, userId: 'user-04', athleteName: 'Phạm Minh D', teamName: 'Team Phoenix SARC', totalKm: 325.0, activitiesCount: 27, avgPace: '5:20', streakDays: 24 }
    ];

    const dash2: RaceDashboardOverviewDto = {
      raceInfo: race2,
      kpis: kpi2,
      dailyAnalytics: daily2,
      activityDistribution: dist2,
      top5Teams: teams2,
      top10Individuals: ind2,
      violationQueue: [],
      lastUpdated: '2025-11-30T23:59:59.000Z'
    };

    // 3. Race 3: Giải Chạy Nội Bộ Quý 3 SARC 2026
    const race3: RaceSelectorItem = {
      id: 'race-internal-q3',
      slug: 'sarc-internal-q3-2026',
      name: 'Giải Chạy Nội Bộ Quý 3 SARC 2026',
      season: 'Nội Bộ Q3',
      clubId: 'club-sarc',
      clubName: 'Sài Gòn Athletes Running Club (SARC)',
      status: 'running',
      statusBadge: 'Đang diễn ra',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      participantsCount: 64,
      teamsCount: 4,
      totalKm: 8420.0,
      targetKm: 12000.0,
      isUserJoined: true,
      userRank: 3,
      bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'
    };

    const kpi3: RaceKpiSummary = {
      raceId: 'race-internal-q3',
      raceName: race3.name,
      totalAthletes: 64,
      totalTeams: 4,
      athletesByClubOrTeam: [
        { name: 'Team Phoenix SARC', count: 16 },
        { name: 'Team Dragons SARC', count: 16 },
        { name: 'Team Pegasus SARC', count: 16 },
        { name: 'Team Tigers SARC', count: 16 }
      ],
      totalAccumulatedKm: 8420.0,
      targetKm: 12000.0,
      progressPercent: 70.2,
      completionRatePercent: 78.5,
      totalPrizePoolVnd: 12000000,
      totalPenaltiesVnd: 950000,
      unpaidDebtVnd: 200000
    };

    const daily3: RaceDailyDistancePoint[] = [
      { date: '2026-07-01', dayOfWeek: 'Thứ 4', distanceKm: 1100.0, isPeakDay: false, activityCount: 52 },
      { date: '2026-07-02', dayOfWeek: 'Thứ 5', distanceKm: 1250.0, isPeakDay: false, activityCount: 56 },
      { date: '2026-07-03', dayOfWeek: 'Thứ 6', distanceKm: 1180.0, isPeakDay: false, activityCount: 54 },
      { date: '2026-07-04', dayOfWeek: 'Thứ 7 (Long Run)', distanceKm: 2350.0, isPeakDay: true, activityCount: 62 },
      { date: '2026-07-05', dayOfWeek: 'CN (Peak Day)', distanceKm: 2540.0, isPeakDay: true, activityCount: 64 }
    ];

    const dist3: RaceActivityTypeDistribution = {
      roadKm: 5052.0,
      roadPercent: 60.0,
      trailKm: 2105.0,
      trailPercent: 25.0,
      treadmillKm: 1263.0,
      treadmillPercent: 15.0,
      totalActivities: 412
    };

    const teams3: RaceTeamStanding[] = [
      { rank: 1, teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', medal: 'GOLD', medalIcon: '🥇', totalKm: 2350.0, activeRunners: 16, completionRate: 92.0 },
      { rank: 2, teamId: 'team-dragons', teamName: 'Team Dragons SARC', medal: 'SILVER', medalIcon: '🥈', totalKm: 2210.0, activeRunners: 16, completionRate: 88.5 },
      { rank: 3, teamId: 'team-pegasus', teamName: 'Team Pegasus SARC', medal: 'BRONZE', medalIcon: '🥉', totalKm: 2020.0, activeRunners: 15, completionRate: 82.0 },
      { rank: 4, teamId: 'team-tigers', teamName: 'Team Tigers SARC', medal: 'HONOR', medalIcon: '🎖️', totalKm: 1840.0, activeRunners: 14, completionRate: 76.0 }
    ];

    const ind3: RaceIndividualLeader[] = [
      { rank: 1, userId: 'user-01', athleteName: 'Nguyễn Văn A', teamName: 'Team Phoenix SARC', totalKm: 245.0, activitiesCount: 22, avgPace: '4:48', streakDays: 20 },
      { rank: 2, userId: 'user-02', athleteName: 'Trần Thị B', teamName: 'Team Dragons SARC', totalKm: 232.0, activitiesCount: 21, avgPace: '5:05', streakDays: 19 },
      { rank: 3, userId: 'user-03', athleteName: 'Lê Hoàng C', teamName: 'Team Pegasus SARC', totalKm: 215.5, activitiesCount: 19, avgPace: '4:35', streakDays: 18 }
    ];

    const dash3: RaceDashboardOverviewDto = {
      raceInfo: race3,
      kpis: kpi3,
      dailyAnalytics: daily3,
      activityDistribution: dist3,
      top5Teams: teams3,
      top10Individuals: ind3,
      violationQueue: [
        {
          id: 'viol-q3-01',
          raceId: 'race-internal-q3',
          activityId: 'act-strava-6622',
          userId: 'user-05',
          athleteName: 'Đỗ Anh E',
          date: '2026-07-04',
          distanceKm: 7.5,
          pace: '2:25 min/km',
          elevationGainM: 15,
          flagType: 'MOTORBIKE_SPEED',
          flagBadge: 'Tốc Độ Xe Máy',
          details: 'Pace 2:25 min/km vi phạm sàn pace tối thiểu 2:45 min/km của giải.',
          status: 'PENDING_REFEREE'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    // 4. Race 4: SARC Trail Challenge Ba Vì 2026
    const race4: RaceSelectorItem = {
      id: 'race-trail-bavi',
      slug: 'sarc-trail-challenge-bavi-2026',
      name: 'SARC Trail Challenge Ba Vì 2026 (Chinh Phục Núi Vua)',
      season: 'Trail 2026',
      clubId: 'club-sarc',
      clubName: 'Sài Gòn Athletes Running Club (SARC)',
      status: 'running',
      statusBadge: 'Đang diễn ra',
      startDate: '2026-06-15',
      endDate: '2026-08-15',
      participantsCount: 52,
      teamsCount: 4,
      totalKm: 6850.0,
      targetKm: 10000.0,
      isUserJoined: true,
      userRank: 2,
      bannerUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    };

    const kpi4: RaceKpiSummary = {
      raceId: 'race-trail-bavi',
      raceName: race4.name,
      totalAthletes: 52,
      totalTeams: 4,
      athletesByClubOrTeam: [
        { name: 'Team Pegasus SARC', count: 14 },
        { name: 'Team Phoenix SARC', count: 14 },
        { name: 'Team Dragons SARC', count: 12 },
        { name: 'Team Tigers SARC', count: 12 }
      ],
      totalAccumulatedKm: 6850.0,
      targetKm: 10000.0,
      progressPercent: 68.5,
      completionRatePercent: 75.0,
      totalPrizePoolVnd: 10000000,
      totalPenaltiesVnd: 800000,
      unpaidDebtVnd: 150000
    };

    const daily4: RaceDailyDistancePoint[] = [
      { date: '2026-06-15', dayOfWeek: 'Thứ 2', distanceKm: 820.0, isPeakDay: false, activityCount: 38 },
      { date: '2026-06-16', dayOfWeek: 'Thứ 3', distanceKm: 940.0, isPeakDay: false, activityCount: 42 },
      { date: '2026-06-17', dayOfWeek: 'Thứ 4', distanceKm: 890.0, isPeakDay: false, activityCount: 40 },
      { date: '2026-06-18', dayOfWeek: 'Thứ 5', distanceKm: 960.0, isPeakDay: false, activityCount: 44 },
      { date: '2026-06-19', dayOfWeek: 'Thứ 6', distanceKm: 920.0, isPeakDay: false, activityCount: 41 },
      { date: '2026-06-20', dayOfWeek: 'Thứ 7 (Summit Day)', distanceKm: 1120.0, isPeakDay: true, activityCount: 48 },
      { date: '2026-06-21', dayOfWeek: 'CN (Summit Peak)', distanceKm: 1200.0, isPeakDay: true, activityCount: 50 }
    ];

    const dist4: RaceActivityTypeDistribution = {
      roadKm: 1027.5,
      roadPercent: 15.0,
      trailKm: 5480.0,
      trailPercent: 80.0,
      treadmillKm: 342.5,
      treadmillPercent: 5.0,
      totalActivities: 345
    };

    const teams4: RaceTeamStanding[] = [
      { rank: 1, teamId: 'team-pegasus', teamName: 'Team Pegasus SARC', medal: 'GOLD', medalIcon: '🥇', totalKm: 2150.0, activeRunners: 14, completionRate: 88.0 },
      { rank: 2, teamId: 'team-phoenix', teamName: 'Team Phoenix SARC', medal: 'SILVER', medalIcon: '🥈', totalKm: 1980.0, activeRunners: 14, completionRate: 82.5 },
      { rank: 3, teamId: 'team-dragons', teamName: 'Team Dragons SARC', medal: 'BRONZE', medalIcon: '🥉', totalKm: 1420.0, activeRunners: 12, completionRate: 74.0 },
      { rank: 4, teamId: 'team-tigers', teamName: 'Team Tigers SARC', medal: 'HONOR', medalIcon: '🎖️', totalKm: 1300.0, activeRunners: 12, completionRate: 70.0 }
    ];

    const ind4: RaceIndividualLeader[] = [
      { rank: 1, userId: 'user-03', athleteName: 'Lê Hoàng C', teamName: 'Team Pegasus SARC', totalKm: 280.0, activitiesCount: 22, avgPace: '6:15', streakDays: 20 },
      { rank: 2, userId: 'user-01', athleteName: 'Nguyễn Văn A', teamName: 'Team Phoenix SARC', totalKm: 260.0, activitiesCount: 20, avgPace: '6:30', streakDays: 18 },
      { rank: 3, userId: 'user-02', athleteName: 'Trần Thị B', teamName: 'Team Dragons SARC', totalKm: 220.0, activitiesCount: 18, avgPace: '6:45', streakDays: 16 }
    ];

    const dash4: RaceDashboardOverviewDto = {
      raceInfo: race4,
      kpis: kpi4,
      dailyAnalytics: daily4,
      activityDistribution: dist4,
      top5Teams: teams4,
      top10Individuals: ind4,
      violationQueue: [],
      lastUpdated: new Date().toISOString()
    };

    // Store in maps
    this.racesMap.set(race1.id, race1);
    this.racesMap.set(race1.slug, race1);
    this.raceDashboardsMap.set(race1.id, dash1);
    this.raceDashboardsMap.set(race1.slug, dash1);

    this.racesMap.set(race2.id, race2);
    this.racesMap.set(race2.slug, race2);
    this.raceDashboardsMap.set(race2.id, dash2);
    this.raceDashboardsMap.set(race2.slug, dash2);

    this.racesMap.set(race3.id, race3);
    this.racesMap.set(race3.slug, race3);
    this.raceDashboardsMap.set(race3.id, dash3);
    this.raceDashboardsMap.set(race3.slug, dash3);

    this.racesMap.set(race4.id, race4);
    this.racesMap.set(race4.slug, race4);
    this.raceDashboardsMap.set(race4.id, dash4);
    this.raceDashboardsMap.set(race4.slug, dash4);
  }

  public getRacesForSelector(): RaceSelectorItem[] {
    if (this.racesMap.size === 0) {
      this.seedRaceDashboardData();
    }
    // Return unique by id
    const unique = new Map<string, RaceSelectorItem>();
    for (const r of this.racesMap.values()) {
      unique.set(r.id, r);
    }
    return Array.from(unique.values());
  }

  public getRaceDashboardOverview(raceIdOrSlug: string = 'race-season-10'): RaceDashboardOverviewDto {
    if (this.raceDashboardsMap.size === 0) {
      this.seedRaceDashboardData();
    }
    let found = this.raceDashboardsMap.get(raceIdOrSlug);
    if (!found) {
      // Try search by slug or id
      for (const [key, dto] of this.raceDashboardsMap.entries()) {
        if (dto.raceInfo.id === raceIdOrSlug || dto.raceInfo.slug === raceIdOrSlug) {
          found = dto;
          break;
        }
      }
    }
    if (!found) {
      found = this.raceDashboardsMap.get('race-season-10') || this.raceDashboardsMap.get('season-10-run-to-techcombank')!;
    }
    return JSON.parse(JSON.stringify(found));
  }

  public exportRaceReport(raceIdOrSlug: string = 'race-season-10', generatedBy: string = 'Nguyễn Văn A (Admin)'): RaceExportReportDto {
    const dash = this.getRaceDashboardOverview(raceIdOrSlug);
    const race = dash.raceInfo;

    // Build CSV content
    const csvRows: string[] = [];
    csvRows.push('--- BÁO CÁO TỔNG KẾT GIẢI ĐẤU (OPENRACE SAAS PLATFORM) ---');
    csvRows.push(`Giải Đấu: ${race.name}`);
    csvRows.push(`Mùa Giải: ${race.season} | Thời Gian: ${race.startDate} - ${race.endDate}`);
    csvRows.push(`Tổng Cự Ly Toàn Giải: ${dash.kpis.totalAccumulatedKm.toFixed(1)} km / Mục Tiêu: ${dash.kpis.targetKm.toFixed(1)} km (${dash.kpis.progressPercent}%)`);
    csvRows.push(`Tổng VĐV Tham Gia: ${dash.kpis.totalAthletes} | Tỷ Lệ Hoàn Thành: ${dash.kpis.completionRatePercent}%`);
    csvRows.push(`Quỹ Thưởng: ${dash.kpis.totalPrizePoolVnd.toLocaleString('vi-VN')} VND | Tiền Phạt Quy Chế: ${dash.kpis.totalPenaltiesVnd.toLocaleString('vi-VN')} VND`);
    csvRows.push('');
    csvRows.push('--- BẢNG XẾP HẠNG ĐỘI ĐUA (TOP TEAMS) ---');
    csvRows.push('Hạng,Huy Chương,Tên Đội Đua,Tổng KM,Sĩ Số Chạy,Tỷ Lệ Hoàn Thành');
    for (const t of dash.top5Teams) {
      csvRows.push(`${t.rank},${t.medalIcon} ${t.medal},${t.teamName},${t.totalKm.toFixed(1)},${t.activeRunners},${t.completionRate}%`);
    }
    csvRows.push('');
    csvRows.push('--- DANH SÁCH VẬN ĐỘNG VIÊN FINISHER XUẤT SẮC (TOP INDIVIDUALS) ---');
    csvRows.push('Hạng,Họ Và Tên,Đội Đua,Tổng KM Tích Lũy,Số Bài Chạy,Pace Trung Bình,Chuỗi Ngày');
    for (const ind of dash.top10Individuals) {
      csvRows.push(`${ind.rank},${ind.athleteName},${ind.teamName},${ind.totalKm.toFixed(1)},${ind.activitiesCount},${ind.avgPace},${ind.streakDays} ngày`);
    }
    csvRows.push('');
    csvRows.push('--- NHẬT KÝ KIỂM ĐỊNH & VI PHẠM TRỌNG TÀI (GOVERNANCE AUDIT LOG) ---');
    csvRows.push('Mã Kiểm Định,VĐV,Cự Ly,Pace,Độ Dốc Gain,Loại Nghi Vấn,Chi Tiết Thẩm Định,Trạng Thái');
    for (const v of dash.violationQueue) {
      csvRows.push(`${v.id},${v.athleteName},${v.distanceKm} km,${v.pace},${v.elevationGainM}m,${v.flagBadge},"${v.details}",${v.status}`);
    }

    return {
      raceId: race.id,
      raceName: race.name,
      generatedAt: new Date().toISOString(),
      generatedBy,
      finishersCount: dash.kpis.totalAthletes,
      teamsRankings: dash.top5Teams,
      individualRankings: dash.top10Individuals,
      auditLogsSummary: {
        totalAudited: dash.activityDistribution.totalActivities,
        pendingViolations: dash.violationQueue.length,
        approvedAppeals: 12
      },
      csvFinisherContent: csvRows.join(String.fromCharCode(10))
    };
  }

  public incrementRaceDistance(raceIdOrSlug: string = 'race-season-10', deltaKm: number = 0.5): number {
    const dash = this.getRaceDashboardOverview(raceIdOrSlug);
    const newTotal = Number((dash.kpis.totalAccumulatedKm + deltaKm).toFixed(2));
    dash.kpis.totalAccumulatedKm = newTotal;
    dash.kpis.progressPercent = Number(((newTotal / dash.kpis.targetKm) * 100).toFixed(1));
    dash.raceInfo.totalKm = newTotal;

    this.raceDashboardsMap.set(dash.raceInfo.id, dash);
    this.raceDashboardsMap.set(dash.raceInfo.slug, dash);
    this.racesMap.set(dash.raceInfo.id, dash.raceInfo);
    this.racesMap.set(dash.raceInfo.slug, dash.raceInfo);

    return newTotal;
  }

  // ==========================================
  // [AC-RACE-WIZARD-STEP1..05] DYNAMIC RACE SETUP WIZARD & MASTER CATALOGS
  // ==========================================

  public seedDynamicRaceSetups(): void {
    const defaultRace1: DynamicRaceSetupConfig = {
      id: 'race-season-10',
      name: 'Mùa 10 Run to Techcombank 2026',
      slug: 'sarc-season-10-techcombank',
      landingUrl: 'https://openrace.vn/g/sarc-season-10-techcombank',
      scope: 'INTERNAL_CLUB',
      scopeLabel: 'Nội bộ CLB Phoenix SARC',
      registrationWindow: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        isOpen: false
      },
      raceWindow: {
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        isLive: true
      },
      bannerVisuals: {
        bannerUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200',
        logoUrl: '🏆',
        slogan: 'Chinh phục cự ly - Bứt phá giới hạn cùng SARC',
        countdownEnabled: true
      },
      teamCapacity: {
        minRunners: 5,
        maxRunners: 18,
        allowFreeAgent: true,
        allocationRule: 'BALANCED_PACE'
      },
      memberTiers: ['PRO_ATHLETE', 'FUN_RUNNER', 'NEWBIE_ROOKIE', 'OFFICE_TIER'],
      scoringModel: {
        method: 'PACE_WEIGHTED',
        minDistanceKm: 3.0,
        paceGate: { min: '3:30', max: '9:30' },
        tournamentCustomizations: {
          minDistanceKm: 3.0,
          paceGate: '3:30 - 9:30',
          trailElevationBonus: true,
          teamRankingFormula: 'TOTAL_AGGREGATE'
        },
        platformInherited: {
          hardAntiCheatFloorPaceMinKm: 2.25,
          autoTrimVehicleTail: true,
          wearablesSyncPolicy: 'Strava / Garmin / Coros + DLQ'
        },
        terrainFactors: { road: 1.0, trail: 1.5, treadmill: 0.8, track: 1.1 },
        antiCheatRules: { paceFloor: '2:15', autoTrimTail: true, maxSingleRunKm: 42.2 },
        elevationBonus: { enabled: true, bonusKmPer100mGain: 1.0 },
        streakBonusPercent: 20,
        trailGainMinM: 100,
        treadmillMinHrBpm: 120,
        maxActivitiesPerDay: 2
      },
      rankingMechanics: {
        individualCriteria: 'TOTAL_DISTANCE',
        teamRankingMethod: 'TOTAL_AGGREGATE',
        topActiveNCount: 5
      },
      awardStructure: {
        categories: [
          {
            id: 'cat-aw-top-team',
            categoryName: 'Top 3 Đội Đồng Đội Toàn Đoàn',
            targetType: 'TEAM',
            rankCount: 3,
            cashPrizes: { rank1: 5000000, rank2: 3000000, rank3: 2000000 },
            prizeValueVnd: 10000000,
            prizeDescription: 'Cúp Vô Địch + 5.000.000đ (Nhất), 3.000.000đ (Nhì), 2.000.000đ (Ba)',
            trophyIncluded: true,
            hallOfFameShowcase: true
          },
          {
            id: 'cat-aw-top-male',
            categoryName: 'Top 3 Cá Nhân Nam Xuất Sắc',
            targetType: 'INDIVIDUAL_MALE',
            rankCount: 3,
            cashPrizes: { rank1: 3000000, rank2: 2000000, rank3: 1000000 },
            prizeValueVnd: 6000000,
            prizeDescription: 'Huy chương Vàng/Bạc/Đồng NFT + 3M/2M/1M VNĐ',
            medalType: 'nft_electronic',
            nftMetadataHash: 'sha256:4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
            antiCounterfeitProof: 'NFT-METADATA-VALIDATED',
            antiCounterfeitTokenId: 'NFT-SARC-2026-MALE-01',
            hallOfFameShowcase: true
          },
          {
            id: 'cat-aw-top-female',
            categoryName: 'Top 3 Cá Nhân Nữ Xuất Sắc',
            targetType: 'INDIVIDUAL_FEMALE',
            rankCount: 3,
            cashPrizes: { rank1: 3000000, rank2: 2000000, rank3: 1000000 },
            prizeValueVnd: 6000000,
            prizeDescription: 'Huy chương Vàng/Bạc/Đồng NFT Nữ + 3M/2M/1M VNĐ',
            medalType: 'nft_electronic',
            nftMetadataHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            antiCounterfeitProof: 'NFT-METADATA-VALIDATED',
            antiCounterfeitTokenId: 'NFT-SARC-2026-FEMALE-01',
            hallOfFameShowcase: true
          },
          {
            id: 'cat-aw-streak-hero',
            categoryName: 'Chiến Binh Chuyên Cần (Streak Hero)',
            targetType: 'STREAK',
            rankCount: 1,
            cashPrizes: { rank1: 1500000, rank2: 0, rank3: 0 },
            prizeValueVnd: 1500000,
            prizeDescription: 'Kỷ niệm chương gỗ Pơmu + 1.500.000đ',
            medalType: 'special_trophy',
            hallOfFameShowcase: true
          },
          {
            id: 'cat-aw-trail-king',
            categoryName: 'Vua Leo Dốc (King of Trail D+)',
            targetType: 'TRAIL_ELEVATION',
            rankCount: 1,
            cashPrizes: { rank1: 1500000, rank2: 0, rank3: 0 },
            prizeValueVnd: 1500000,
            prizeDescription: 'Kỷ niệm chương Trail King + 1.500.000đ',
            medalType: 'special_trophy',
            hallOfFameShowcase: true
          }
        ],
        autoCalculateWinners: true,
        autoTriggerOnRaceEnd: true,
        hallOfFameActive: false,
        antiCheatReconciled: true
      },
      financialRules: {
        clubBankAccountId: 'bank-acc-01',
        bankBin: '970422',
        bankName: 'MBBank Quân Đội',
        accountNumber: '0988889999',
        accountName: 'CLB CHAY PHU DONG SARC',
        memoPrefix: 'SARC',
        cyclePenaltyVnd: 50000,
        contributionTier1Vnd: 100000,
        contributionTierOtherVnd: 200000
      },
      status: 'published',
      createdAt: '2026-10-01T08:00:00.000Z'
    };

    const defaultRace2: DynamicRaceSetupConfig = {
      id: 'race-trail-bavi',
      name: 'SARC Trail Challenge Ba Vì 2026',
      slug: 'sarc-trail-challenge-ba-vi-2026',
      landingUrl: 'https://openrace.vn/g/sarc-trail-challenge-ba-vi-2026',
      scope: 'OPEN_COMMUNITY',
      scopeLabel: 'Cộng đồng mở rộng',
      registrationWindow: {
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        isOpen: true
      },
      raceWindow: {
        startDate: '2026-12-16',
        endDate: '2026-12-31',
        isLive: false
      },
      bannerVisuals: {
        bannerUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200',
        logoUrl: '⛰️',
        slogan: 'Chinh phục đỉnh Ba Vì - Đón chào nắng ấm mùa đông',
        countdownEnabled: true
      },
      teamCapacity: {
        minRunners: 3,
        maxRunners: 12,
        allowFreeAgent: true,
        allocationRule: 'FREE_AGENT_ROUND_ROBIN'
      },
      memberTiers: ['PRO_ATHLETE', 'FUN_RUNNER', 'PLANT_TIER'],
      scoringModel: {
        method: 'PACE_WEIGHTED',
        minDistanceKm: 3.0,
        paceGate: { min: '4:00', max: '12:00' },
        tournamentCustomizations: {
          minDistanceKm: 3.0,
          paceGate: '4:00 - 12:00',
          trailElevationBonus: true,
          teamRankingFormula: 'AVERAGE_PER_RUNNER'
        },
        platformInherited: {
          hardAntiCheatFloorPaceMinKm: 2.25,
          autoTrimVehicleTail: true,
          wearablesSyncPolicy: 'Strava / Garmin / Coros + DLQ'
        },
        terrainFactors: { road: 1.0, trail: 1.8, treadmill: 0.7, track: 1.0 },
        antiCheatRules: { paceFloor: '2:15', autoTrimTail: true, maxSingleRunKm: 70.0 },
        elevationBonus: { enabled: true, bonusKmPer100mGain: 1.2 },
        streakBonusPercent: 25,
        trailGainMinM: 100,
        treadmillMinHrBpm: 120,
        maxActivitiesPerDay: 2
      },
      rankingMechanics: {
        individualCriteria: 'TOTAL_SCORE',
        teamRankingMethod: 'AVERAGE_PER_RUNNER',
        topActiveNCount: 5
      },
      awardStructure: {
        categories: [
          { id: 'cat-aw-trail-champ', categoryName: 'Quán Quân Trail Ba Vì Nam/Nữ', targetType: 'INDIVIDUAL_MALE', rankCount: 3, prizeValueVnd: 4000000, prizeDescription: 'Kỷ niệm chương gỗ Pơmu + 4.000.000đ' },
          { id: 'cat-aw-trail-team', categoryName: 'Đội Khám Phá Xuất Sắc', targetType: 'TEAM', rankCount: 3, prizeValueVnd: 6000000, prizeDescription: 'Bảng vàng vinh danh + 6.000.000đ' }
        ],
        autoCalculateWinners: true
      },
      financialRules: {
        clubBankAccountId: 'bank-acc-01',
        bankBin: '970422',
        bankName: 'MBBank Quân Đội',
        accountNumber: '0988889999',
        accountName: 'CLB CHAY PHU DONG SARC',
        memoPrefix: 'BAVITRAIL',
        cyclePenaltyVnd: 50000,
        contributionTier1Vnd: 100000,
        contributionTierOtherVnd: 200000
      },
      status: 'published',
      createdAt: '2026-11-01T08:00:00.000Z'
    };

    this.dynamicRaceSetups.set(defaultRace1.id, defaultRace1);
    this.dynamicRaceSetups.set(defaultRace1.slug, defaultRace1);
    this.dynamicRaceSetups.set(defaultRace2.id, defaultRace2);
    this.dynamicRaceSetups.set(defaultRace2.slug, defaultRace2);

    // Seed Standard Race Templates (AC-RACE-SETUP-TEMPLATES-02)
    const tmplMonthly: RaceTemplatePreset = {
      id: 'tmpl-monthly-run',
      name: 'Mẫu Giải Chạy Tháng Nội Bộ (Monthly Internal Run)',
      description: 'Tích lũy cự ly bền bỉ toàn CLB, hệ số Road 1.0x, khóa sàn 2:45, Top Active 5 VĐV nòng cốt, cơ cấu giải 25.000.000đ kèm Cúp Vô Địch và Bảng Vàng.',
      icon: '🏃',
      badge: 'Nội Bộ CLB',
      targetType: 'MONTHLY_INTERNAL',
      usageCount: 14,
      config: JSON.parse(JSON.stringify(defaultRace1))
    };

    const tmplTrail: RaceTemplatePreset = {
      id: 'tmpl-trail-dplus',
      name: 'Mẫu Giải Trail D+ Chuyên Sâu (Trail & Mountain Elevation D+)',
      description: 'Giải chạy địa hình leo dốc nhân hệ số ITRA Trail 1.5x, thưởng +1.0km cho mỗi 100m D+, vinh danh Vua Leo Dốc (King of Trail D+) và mở rộng cộng đồng.',
      icon: '⛰️',
      badge: 'Cộng Đồng Trail',
      targetType: 'TRAIL_ELEVATION',
      usageCount: 8,
      config: JSON.parse(JSON.stringify(defaultRace2))
    };

    const tmplEkiden: RaceTemplatePreset = {
      id: 'tmpl-ekiden-relay',
      name: 'Mẫu Giải Ekiden Tiếp Sức CLB (Ekiden Relay Challenge)',
      description: 'Thi đấu đồng đội tiếp sức 6-10 VĐV/team, tính điểm trung bình trên từng runner thực tế (AVERAGE_PER_RUNNER), khóa sàn 2:45 min/km, Cúp Vô Địch Toàn Đoàn.',
      icon: '🎽',
      badge: 'Đồng Đội Ekiden',
      targetType: 'EKIDEN_RELAY',
      usageCount: 5,
      config: {
        name: 'Giải Ekiden Tiếp Sức CLB SARC Mùa 1',
        scope: 'INTERNAL_CLUB',
        teamCapacity: { minRunners: 6, maxRunners: 10, allowFreeAgent: true, allocationRule: 'BALANCED_PACE' },
        scoringModel: {
          method: 'PACE_WEIGHTED',
          terrainFactors: { road: 1.0, trail: 1.2, treadmill: 0.8, track: 1.1 },
          antiCheatRules: { paceFloor: '2:45', autoTrimTail: true, maxSingleRunKm: 42.2 },
          elevationBonus: { enabled: true, bonusKmPer100mGain: 1.0 },
          streakBonusPercent: 15
        },
        rankingMechanics: {
          individualCriteria: 'TOTAL_DISTANCE',
          teamRankingMethod: 'AVERAGE_PER_RUNNER',
          topActiveNCount: 6
        },
        awardStructure: JSON.parse(JSON.stringify(defaultRace1.awardStructure))
      }
    };

    this.raceTemplates.set(tmplMonthly.id, tmplMonthly);
    this.raceTemplates.set(tmplTrail.id, tmplTrail);
    this.raceTemplates.set(tmplEkiden.id, tmplEkiden);
  }

  public getRaceWizardCatalogs() {
    const athleteTiers = this.getSystemConfigs('CATALOG_ATHLETE_TIERS');
    const teamAllocationRules = this.getSystemConfigs('CATALOG_TEAM_ALLOCATION_RULES');
    const terrainScoring = this.getSystemConfigs('CATALOG_TERRAIN_SCORING_FACTORS');
    const antiCheatRules = this.getSystemConfigs('CATALOG_ANTI_CHEAT_RULES');
    const standardAwards = this.getSystemConfigs('CATALOG_STANDARD_AWARDS');

    return {
      athleteTiers,
      teamAllocationRules,
      terrainScoring,
      antiCheatRules,
      standardAwards,
      totalStandardCatalogs: 5,
      allMasterCatalogs: this.getSystemCatalogs(),
      platformInheritedDefaults: {
        hardAntiCheatFloorPaceMinKm: 2.25,
        hardFloorLabel: '2:15 min/km (Khóa an toàn sinh học nền tảng)',
        autoTrimVehicleTail: true,
        autoTrimDescription: 'AI Auto-Trim tự động cắt đuôi xe cơ giới (> 25 km/h)',
        wearablesSyncPolicy: 'Strava / Garmin / Coros + Webhook DLQ Realtime'
      },
      smartPresets: {
        roadRace: {
          minDistanceKm: 3.0,
          paceMin: '3:30',
          paceMax: '9:30',
          trailElevationBonusEnabled: false,
          label: 'Chạy Đường Nhựa (Road Race)'
        },
        trailChallenge: {
          minDistanceKm: 3.0,
          paceMin: '4:00',
          paceMax: '12:00',
          trailElevationBonusEnabled: true,
          label: 'Chạy Địa Hình (Trail Challenge)'
        },
        funRun: {
          minDistanceKm: 1.5,
          paceMin: '5:00',
          paceMax: '9:00',
          trailElevationBonusEnabled: false,
          label: 'Phong Trào Vui Vẻ (Fun Run)'
        }
      },
      clubBankAccounts: this.clubProfileConfig.bankAccounts || [],
      financialRulesDefaults: {
        cyclePenaltyVnd: 50000,
        contributionTier1Vnd: 100000,
        contributionTierOtherVnd: 200000,
        defaultMemoPrefix: 'SARC'
      }
    };
  }

  public getClubBankAccounts(): ClubBankAccountItem[] {
    return this.clubProfileConfig.bankAccounts || [];
  }

  public addClubBankAccount(account: Omit<ClubBankAccountItem, 'id'>): ClubBankAccountItem {
    if (!this.clubProfileConfig.bankAccounts) {
      this.clubProfileConfig.bankAccounts = [];
    }
    const newAcc: ClubBankAccountItem = {
      id: `bank-acc-${Date.now()}`,
      ...account
    };
    if (newAcc.isDefault) {
      this.clubProfileConfig.bankAccounts.forEach(a => { a.isDefault = false; });
    }
    this.clubProfileConfig.bankAccounts.push(newAcc);
    return newAcc;
  }

  public createDynamicRace(input: Partial<DynamicRaceSetupConfig>): DynamicRaceSetupConfig {
    const id = input.id || `race-dyn-${Date.now()}`;
    const name = input.name || 'Giải Chạy Thử Thách Mới 2027';
    const slug = input.slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const landingUrl = input.landingUrl || `https://openrace.vn/g/${slug}`;

    const newConfig: DynamicRaceSetupConfig = {
      id,
      name,
      slug,
      landingUrl,
      scope: input.scope || 'INTERNAL_CLUB',
      scopeLabel: input.scopeLabel || (input.scope === 'OPEN_COMMUNITY' ? 'Cộng đồng mở rộng' : input.scope === 'DESIGNATED_INVITE' ? 'Chỉ định Whitelist' : 'Nội bộ CLB Phoenix SARC'),
      registrationWindow: input.registrationWindow || {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        isOpen: true
      },
      raceWindow: input.raceWindow || {
        startDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        isLive: false
      },
      bannerVisuals: input.bannerVisuals || {
        bannerUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200',
        logoUrl: '🏆',
        slogan: 'Bứt phá giới hạn - Nâng tầm sải bước',
        countdownEnabled: true
      },
      teamCapacity: input.teamCapacity || {
        minRunners: 5,
        maxRunners: 10,
        allowFreeAgent: true,
        allocationRule: 'BALANCED_PACE'
      },
      memberTiers: input.memberTiers || ['PRO_ATHLETE', 'FUN_RUNNER', 'NEWBIE_ROOKIE'],
      scoringModel: input.scoringModel || {
        method: 'PACE_WEIGHTED',
        minDistanceKm: 3.0,
        paceGate: { min: '3:30', max: '9:30' },
        tournamentCustomizations: {
          minDistanceKm: 3.0,
          paceGate: '3:30 - 9:30',
          trailElevationBonus: true
        },
        platformInherited: {
          hardAntiCheatFloorPaceMinKm: 2.25,
          autoTrimVehicleTail: true,
          wearablesSyncPolicy: 'Strava / Garmin / Coros + DLQ'
        },
        terrainFactors: { road: 1.0, trail: 1.5, treadmill: 0.8, track: 1.1 },
        antiCheatRules: { paceFloor: '2:15', autoTrimTail: true, maxSingleRunKm: 42.2 },
        elevationBonus: { enabled: true, bonusKmPer100mGain: 1.0 },
        streakBonusPercent: 20,
        trailGainMinM: input.scoringModel?.trailGainMinM || 100,
        treadmillMinHrBpm: input.scoringModel?.treadmillMinHrBpm || 120,
        maxActivitiesPerDay: input.scoringModel?.maxActivitiesPerDay || 2
      },
      rankingMechanics: input.rankingMechanics || {
        individualCriteria: 'TOTAL_DISTANCE',
        teamRankingMethod: 'TOTAL_AGGREGATE',
        topActiveNCount: 5
      },
      awardStructure: input.awardStructure || {
        categories: [
          { id: 'aw-team', categoryName: 'Top 3 Đội Đồng Đội', targetType: 'TEAM', rankCount: 3, prizeValueVnd: 5000000, prizeDescription: 'Cúp + 5.000.000đ' },
          { id: 'aw-male', categoryName: 'Top 3 Cá Nhân Nam', targetType: 'INDIVIDUAL_MALE', rankCount: 3, prizeValueVnd: 3000000, prizeDescription: 'Huy chương + 3.000.000đ' },
          { id: 'aw-female', categoryName: 'Top 3 Cá Nhân Nữ', targetType: 'INDIVIDUAL_FEMALE', rankCount: 3, prizeValueVnd: 3000000, prizeDescription: 'Huy chương + 3.000.000đ' },
          { id: 'aw-streak', categoryName: 'Chiến Binh Chuyên Cần', targetType: 'STREAK', rankCount: 1, prizeValueVnd: 1500000, prizeDescription: 'Huy hiệu Streak Hero' },
          { id: 'aw-trail', categoryName: 'Vua Leo Dốc Trail D+', targetType: 'TRAIL_ELEVATION', rankCount: 1, prizeValueVnd: 1500000, prizeDescription: 'Kỷ niệm chương D+ Master' }
        ],
        autoCalculateWinners: true
      },
      financialRules: input.financialRules || {
        clubBankAccountId: 'bank-acc-01',
        bankBin: '970422',
        bankName: 'MBBank Quân Đội',
        accountNumber: '0988889999',
        accountName: 'CLB CHAY PHU DONG SARC',
        memoPrefix: (input.slug ? input.slug.split('-')[0].toUpperCase() : 'SARC'),
        cyclePenaltyVnd: 50000,
        contributionTier1Vnd: 100000,
        contributionTierOtherVnd: 200000
      },
      status: input.status || 'published',
      createdAt: new Date().toISOString()
    };

    this.dynamicRaceSetups.set(newConfig.id, newConfig);
    this.dynamicRaceSetups.set(newConfig.slug, newConfig);

    // Also add to racesMap for global selector dropdown & race lists
    const selectorItem: RaceSelectorItem = {
      id: newConfig.id,
      slug: newConfig.slug,
      name: newConfig.name,
      season: 'Mùa 2027',
      clubId: 'club-sarc',
      clubName: 'Sài Gòn Athletes Running Club (SARC)',
      status: newConfig.raceWindow.isLive ? 'running' : 'upcoming',
      statusBadge: newConfig.raceWindow.isLive ? '🟢 Đang diễn ra' : '🟡 Sắp diễn ra',
      startDate: newConfig.raceWindow.startDate,
      endDate: newConfig.raceWindow.endDate,
      participantsCount: 0,
      teamsCount: 0,
      totalKm: 0,
      targetKm: 1000,
      isUserJoined: false,
      bannerUrl: newConfig.bannerVisuals.bannerUrl
    };
    this.racesMap.set(selectorItem.id, selectorItem);
    this.racesMap.set(selectorItem.slug, selectorItem);

    return newConfig;
  }

  public updateDynamicRace(raceIdOrSlug: string, updateData: DeepPartial<DynamicRaceSetupConfig>): DynamicRaceSetupConfig {
    if (this.dynamicRaceSetups.size === 0) {
      this.seedDynamicRaceSetups();
    }
    const existing = this.dynamicRaceSetups.get(raceIdOrSlug) ||
      Array.from(this.dynamicRaceSetups.values()).find(r => r.id === raceIdOrSlug || r.slug === raceIdOrSlug);

    if (!existing) {
      throw new Error(`Race not found: ${raceIdOrSlug}`);
    }

    const updated: DynamicRaceSetupConfig = {
      ...existing,
      ...updateData,
      id: existing.id,
      slug: updateData.slug || existing.slug,
      name: updateData.name || existing.name,
      scope: updateData.scope || existing.scope,
      scopeLabel: updateData.scopeLabel || existing.scopeLabel,
      landingUrl: updateData.landingUrl || `https://openrace.vn/g/${updateData.slug || existing.slug}`,
      registrationWindow: { ...existing.registrationWindow, ...(updateData.registrationWindow || {}) },
      raceWindow: { ...existing.raceWindow, ...(updateData.raceWindow || {}) },
      bannerVisuals: { ...existing.bannerVisuals, ...(updateData.bannerVisuals || {}) },
      teamCapacity: { ...existing.teamCapacity, ...(updateData.teamCapacity || {}) },
      memberTiers: updateData.memberTiers || existing.memberTiers,
      scoringModel: {
        ...existing.scoringModel,
        ...(updateData.scoringModel || {}),
        platformInherited: {
          ...existing.scoringModel.platformInherited,
          ...(updateData.scoringModel?.platformInherited || {})
        },
        tournamentCustomizations: {
          ...existing.scoringModel.tournamentCustomizations,
          ...(updateData.scoringModel?.tournamentCustomizations || {})
        },
        antiCheatRules: {
          ...existing.scoringModel.antiCheatRules,
          ...(updateData.scoringModel?.antiCheatRules || {})
        },
        terrainFactors: {
          ...existing.scoringModel.terrainFactors,
          ...(updateData.scoringModel?.terrainFactors || {})
        }
      },
      financialRules: { ...existing.financialRules, ...(updateData.financialRules || {}) },
      rankingMechanics: { ...existing.rankingMechanics, ...(updateData.rankingMechanics || {}) },
      awardStructure: {
        ...existing.awardStructure,
        ...(updateData.awardStructure || {}),
        categories: (updateData.awardStructure?.categories as any) || existing.awardStructure.categories
      }
    } as any as DynamicRaceSetupConfig;

    this.dynamicRaceSetups.set(updated.id, updated);
    this.dynamicRaceSetups.set(updated.slug, updated);

    // Sync to racesMap
    const mapItem = this.racesMap.get(updated.id);
    if (mapItem) {
      mapItem.name = updated.name;
      mapItem.slug = updated.slug;
      mapItem.startDate = updated.raceWindow.startDate;
      mapItem.endDate = updated.raceWindow.endDate;
      if (updated.bannerVisuals?.bannerUrl) mapItem.bannerUrl = updated.bannerVisuals.bannerUrl;
      this.racesMap.set(updated.id, mapItem);
      this.racesMap.set(updated.slug, mapItem);
    }

    return updated;
  }

  public getDynamicRaceSetup(raceIdOrSlug: string): DynamicRaceSetupConfig {
    if (this.dynamicRaceSetups.size === 0) {
      this.seedDynamicRaceSetups();
    }
    const found = this.dynamicRaceSetups.get(raceIdOrSlug);
    if (found) return JSON.parse(JSON.stringify(found));
    // Fallback to first race
    const first = Array.from(this.dynamicRaceSetups.values())[0];
    return JSON.parse(JSON.stringify(first));
  }

  public calculateRaceAwards(raceIdOrSlug: string): {
    success: boolean;
    raceId: string;
    raceName: string;
    winnersCount: number;
    frozenAt: string;
    totalCashDisbursedVnd: number;
    digitalSignatureLedger: string;
    winners: AutoCalculatedAwardWinner[];
  } {
    const config = this.getDynamicRaceSetup(raceIdOrSlug);
    const nowIso = new Date().toISOString();
    const ledgerSig = `LEDGER-SIG-${Date.now().toString(16).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const winners: AutoCalculatedAwardWinner[] = [
      {
        categoryId: 'aw-team-1',
        categoryName: 'Top 3 Đội Đồng Đội Toàn Đoàn',
        targetType: 'TEAM',
        rank: 1,
        winnerName: 'Team Phoenix SARC',
        winnerTeam: 'Phoenix SARC',
        scoreOrDistance: '1,420.0 km (Pace 5:15)',
        prizeDescription: 'Cúp Vô Địch Toàn Đoàn mạ vàng + 5.000.000đ Quỹ Đội',
        cashPrizeVnd: 5000000,
        medalType: 'special_trophy',
        nftMetadataHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        antiCounterfeitTokenId: 'NFT-SARC-2026-TEAM-01',
        certificateNumber: 'CERT-SARC-2026-S10-T01',
        digitalSignatureSha256: 'SIG-SHA256-4A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-T01',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-team-2',
        categoryName: 'Top 3 Đội Đồng Đội Toàn Đoàn',
        targetType: 'TEAM',
        rank: 2,
        winnerName: 'Team Dragons SADC',
        winnerTeam: 'Dragons SADC',
        scoreOrDistance: '980.5 km (Pace 5:28)',
        prizeDescription: 'Cúp Bạc Tập Thể + 3.000.000đ Quỹ Đội',
        cashPrizeVnd: 3000000,
        medalType: 'silver',
        nftMetadataHash: 'sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
        antiCounterfeitTokenId: 'NFT-SARC-2026-TEAM-02',
        certificateNumber: 'CERT-SARC-2026-S10-T02',
        digitalSignatureSha256: 'SIG-SHA256-5B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-T02',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-team-3',
        categoryName: 'Top 3 Đội Đồng Đội Toàn Đoàn',
        targetType: 'TEAM',
        rank: 3,
        winnerName: 'Team Pegasus SARC',
        winnerTeam: 'Pegasus SARC',
        scoreOrDistance: '770.0 km (Pace 5:40)',
        prizeDescription: 'Cúp Đồng Tập Thể + 2.000.000đ Quỹ Đội',
        cashPrizeVnd: 2000000,
        medalType: 'bronze',
        nftMetadataHash: 'sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        antiCounterfeitTokenId: 'NFT-SARC-2026-TEAM-03',
        certificateNumber: 'CERT-SARC-2026-S10-T03',
        digitalSignatureSha256: 'SIG-SHA256-6C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-T03',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-male-1',
        categoryName: 'Top 3 Cá Nhân Nam Xuất Sắc',
        targetType: 'INDIVIDUAL_MALE',
        rank: 1,
        winnerName: 'Nguyễn Văn A',
        winnerTeam: 'Team Phoenix SARC',
        scoreOrDistance: '142.5 km (Pace 4:45)',
        prizeDescription: 'Huy Chương Vàng NFT Điện Tử + 3.000.000đ Tiền Thưởng',
        cashPrizeVnd: 3000000,
        medalType: 'gold',
        nftMetadataHash: 'sha256:4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
        antiCounterfeitTokenId: 'NFT-SARC-2026-MALE-01',
        certificateNumber: 'CERT-SARC-2026-S10-M01',
        digitalSignatureSha256: 'SIG-SHA256-7D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-M01',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-male-2',
        categoryName: 'Top 3 Cá Nhân Nam Xuất Sắc',
        targetType: 'INDIVIDUAL_MALE',
        rank: 2,
        winnerName: 'Lê Hoàng C',
        winnerTeam: 'Team Dragons SADC',
        scoreOrDistance: '130.0 km (Pace 4:52)',
        prizeDescription: 'Huy Chương Bạc NFT Điện Tử + 2.000.000đ Tiền Thưởng',
        cashPrizeVnd: 2000000,
        medalType: 'silver',
        nftMetadataHash: 'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        antiCounterfeitTokenId: 'NFT-SARC-2026-MALE-02',
        certificateNumber: 'CERT-SARC-2026-S10-M02',
        digitalSignatureSha256: 'SIG-SHA256-8E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-M02',
        hallOfFameShowcase: false,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-male-3',
        categoryName: 'Top 3 Cá Nhân Nam Xuất Sắc',
        targetType: 'INDIVIDUAL_MALE',
        rank: 3,
        winnerName: 'Bùi Tuấn F',
        winnerTeam: 'Team Pegasus SARC',
        scoreOrDistance: '115.0 km (Pace 5:05)',
        prizeDescription: 'Huy Chương Đồng NFT Điện Tử + 1.000.000đ Tiền Thưởng',
        cashPrizeVnd: 1000000,
        medalType: 'bronze',
        nftMetadataHash: 'sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        antiCounterfeitTokenId: 'NFT-SARC-2026-MALE-03',
        certificateNumber: 'CERT-SARC-2026-S10-M03',
        digitalSignatureSha256: 'SIG-SHA256-9F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-M03',
        hallOfFameShowcase: false,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-female-1',
        categoryName: 'Top 3 Cá Nhân Nữ Xuất Sắc',
        targetType: 'INDIVIDUAL_FEMALE',
        rank: 1,
        winnerName: 'Trần Thị B',
        winnerTeam: 'Team Phoenix SARC',
        scoreOrDistance: '120.0 km (Pace 5:10)',
        prizeDescription: 'Huy Chương Vàng NFT Điện Tử Nữ + 3.000.000đ Tiền Thưởng',
        cashPrizeVnd: 3000000,
        medalType: 'gold',
        nftMetadataHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        antiCounterfeitTokenId: 'NFT-SARC-2026-FEMALE-01',
        certificateNumber: 'CERT-SARC-2026-S10-F01',
        digitalSignatureSha256: 'SIG-SHA256-0A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-F01',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-female-2',
        categoryName: 'Top 3 Cá Nhân Nữ Xuất Sắc',
        targetType: 'INDIVIDUAL_FEMALE',
        rank: 2,
        winnerName: 'Hoàng Thị E',
        winnerTeam: 'Team Dragons SADC',
        scoreOrDistance: '105.0 km (Pace 5:25)',
        prizeDescription: 'Huy Chương Bạc NFT Điện Tử Nữ + 2.000.000đ Tiền Thưởng',
        cashPrizeVnd: 2000000,
        medalType: 'silver',
        nftMetadataHash: 'sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        antiCounterfeitTokenId: 'NFT-SARC-2026-FEMALE-02',
        certificateNumber: 'CERT-SARC-2026-S10-F02',
        digitalSignatureSha256: 'SIG-SHA256-1B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-F02',
        hallOfFameShowcase: false,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-female-3',
        categoryName: 'Top 3 Cá Nhân Nữ Xuất Sắc',
        targetType: 'INDIVIDUAL_FEMALE',
        rank: 3,
        winnerName: 'Đỗ Thu G',
        winnerTeam: 'Team Pegasus SARC',
        scoreOrDistance: '98.0 km (Pace 5:35)',
        prizeDescription: 'Huy Chương Đồng NFT Điện Tử Nữ + 1.000.000đ Tiền Thưởng',
        cashPrizeVnd: 1000000,
        medalType: 'bronze',
        nftMetadataHash: 'sha256:3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d',
        antiCounterfeitTokenId: 'NFT-SARC-2026-FEMALE-03',
        certificateNumber: 'CERT-SARC-2026-S10-F03',
        digitalSignatureSha256: 'SIG-SHA256-2C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-F03',
        hallOfFameShowcase: false,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-streak-hero',
        categoryName: 'Giải Chuyên Cần Bền Bỉ (Streak Hero)',
        targetType: 'STREAK',
        rank: 1,
        winnerName: 'Nguyễn Văn A',
        winnerTeam: 'Team Phoenix SARC',
        scoreOrDistance: '18 Ngày Liên Tiếp (20 Tuần)',
        prizeDescription: 'Kỷ Niệm Chương Gỗ Pơmu Độc Bản + 1.500.000đ Tiền Thưởng',
        cashPrizeVnd: 1500000,
        medalType: 'special_trophy',
        nftMetadataHash: 'sha256:2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6',
        antiCounterfeitTokenId: 'NFT-SARC-2026-STREAK-01',
        certificateNumber: 'CERT-SARC-2026-S10-ST01',
        digitalSignatureSha256: 'SIG-SHA256-3D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-ST01',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      },
      {
        categoryId: 'aw-trail-king',
        categoryName: 'Giải Vua Leo Dốc (King of Trail D+)',
        targetType: 'TRAIL_ELEVATION',
        rank: 1,
        winnerName: 'Trần Thị B',
        winnerTeam: 'Team Phoenix SARC',
        scoreOrDistance: '+260m D+ Trail Ba Vì (8.0 km)',
        prizeDescription: 'Kỷ Niệm Chương Trail King + 1.500.000đ Tiền Thưởng',
        cashPrizeVnd: 1500000,
        medalType: 'special_trophy',
        nftMetadataHash: 'sha256:18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4',
        antiCounterfeitTokenId: 'NFT-SARC-2026-TRAIL-01',
        certificateNumber: 'CERT-SARC-2026-S10-TR01',
        digitalSignatureSha256: 'SIG-SHA256-4E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F',
        verificationQrUrl: 'https://openrace.vn/verify/cert/CERT-SARC-2026-S10-TR01',
        hallOfFameShowcase: true,
        certifiedBy: 'Ban Tổ Chức SARC & Ban Trọng Tài OpenRace',
        awardedAt: nowIso
      }
    ];

    const totalCashDisbursedVnd = winners.reduce((sum, w) => sum + (w.cashPrizeVnd || 0), 0);

    config.calculatedWinners = winners;
    config.status = 'frozen';
    config.updatedAt = nowIso;
    if (config.awardStructure) {
      config.awardStructure.hallOfFameActive = true;
      config.awardStructure.antiCheatReconciled = true;
    }
    config.frozenLedger = {
      isFrozen: true,
      frozenAt: nowIso,
      totalCashDisbursedVnd,
      certificatesIssuedCount: winners.length,
      digitalSignatureLedger: ledgerSig
    };

    this.dynamicRaceSetups.set(config.id, config);
    this.dynamicRaceSetups.set(config.slug, config);

    return {
      success: true,
      raceId: config.id,
      raceName: config.name,
      winnersCount: winners.length,
      totalCashDisbursedVnd,
      digitalSignatureLedger: ledgerSig,
      frozenAt: nowIso,
      winners
    };
  }

  // ====================================================
  // [AC-RACE-SETUP-HUB-01 & AC-RACE-SETUP-TEMPLATES-02]
  // Admin Race Hub & Templates Store Methods
  // ====================================================

  public getAdminRaceHub(): AdminRaceHubResponse {
    if (this.raceTemplates.size === 0) {
      this.seedDynamicRaceSetups();
    }

    const activeAndUpcoming: AdminRaceHubItem[] = [
      {
        id: 'race-season-10',
        name: 'Mùa 10 Run to Techcombank 2026 – SADC/SARC',
        slug: 'sarc-season-10-techcombank',
        landingUrl: 'https://openrace.vn/g/sarc-season-10-techcombank',
        scope: 'INTERNAL_CLUB',
        scopeLabel: 'Nội Bộ CLB SARC',
        status: 'live',
        statusLabel: 'Đang Diễn Ra (Live)',
        statusColor: 'emerald',
        raceDates: '01/11/2026 – 30/11/2026',
        runnersCount: 48,
        totalDistanceKm: 3170.0,
        totalPrizeVnd: 25000000,
        qrCodeUrl: 'https://openrace.vn/qr/sarc-season-10-techcombank.svg',
        quickActions: {
          canViewLanding: true,
          canEditWizard: true,
          canExportExcel: true,
          canFreeze: true
        }
      },
      {
        id: 'race-trail-bavi',
        name: 'SARC Trail Challenge Ba Vì 2026',
        slug: 'sarc-trail-challenge-ba-vi-2026',
        landingUrl: 'https://openrace.vn/g/sarc-trail-challenge-ba-vi-2026',
        scope: 'OPEN_COMMUNITY',
        scopeLabel: 'Cộng Đồng Mở Rộng',
        status: 'upcoming',
        statusLabel: 'Sắp Mở Đăng Ký',
        statusColor: 'amber',
        raceDates: '01/12/2026 – 15/12/2026',
        runnersCount: 28,
        totalDistanceKm: 0.0,
        totalPrizeVnd: 6000000,
        qrCodeUrl: 'https://openrace.vn/qr/sarc-trail-challenge-ba-vi-2026.svg'
      },
      {
        id: 'race-night-run',
        name: 'Giải Chạy Đêm SARC Heritage Ekiden 2027',
        slug: 'sarc-night-heritage-ekiden-2027',
        landingUrl: 'https://openrace.vn/g/sarc-night-heritage-ekiden-2027',
        scope: 'INTERNAL_CLUB',
        scopeLabel: 'Nội Bộ Ekiden',
        status: 'upcoming',
        statusLabel: 'Sắp Khởi Tranh',
        statusColor: 'blue',
        raceDates: '01/01/2027 – 15/01/2027',
        runnersCount: 64,
        totalDistanceKm: 0.0,
        totalPrizeVnd: 15000000,
        qrCodeUrl: 'https://openrace.vn/qr/sarc-night-heritage-ekiden-2027.svg'
      }
    ];

    // Dynamically synchronize from dynamicRaceSetups in case of wizard edits
    activeAndUpcoming.forEach(item => {
      const dyn = this.dynamicRaceSetups.get(item.id);
      if (dyn) {
        item.name = dyn.name;
        item.slug = dyn.slug;
        item.landingUrl = dyn.landingUrl;
        item.scope = dyn.scope;
        item.scopeLabel = dyn.scopeLabel;
        if (dyn.raceWindow) {
          const s = dyn.raceWindow.startDate ? dyn.raceWindow.startDate.split('-').reverse().join('/') : '';
          const e = dyn.raceWindow.endDate ? dyn.raceWindow.endDate.split('-').reverse().join('/') : '';
          if (s && e) item.raceDates = `${s} – ${e}`;
        }
      }
    });

    const frozenArchives: AdminRaceHubItem[] = [
      {
        id: 'race-season-9',
        name: 'Mùa 9 Thử Thách Mùa Hè Rực Lửa 2026',
        slug: 'mua-9-thu-thach-mua-he-ruc-lua-2026',
        landingUrl: 'https://openrace.vn/g/mua-9-thu-thach-mua-he-ruc-lua-2026',
        scope: 'INTERNAL_CLUB',
        scopeLabel: 'Nội Bộ SARC',
        status: 'frozen',
        statusLabel: 'Đã Đóng Băng Kết Quả (Frozen Ledger)',
        statusColor: 'purple',
        raceDates: '01/06/2026 – 30/06/2026',
        runnersCount: 52,
        totalDistanceKm: 15420.0,
        totalPrizeVnd: 15000000,
        championTeam: 'Team Dragons SADC (Quán Quân)',
        ledgerSignature: 'LEDGER-SIG-M9-FROZEN-8F9B2C',
        qrCodeUrl: 'https://openrace.vn/qr/mua-9-thu-thach-mua-he-ruc-lua-2026.svg'
      },
      {
        id: 'race-spring-2026',
        name: 'SARC Chào Xuân Đinh Mùi 2026',
        slug: 'sarc-chao-xuan-dinh-mui-2026',
        landingUrl: 'https://openrace.vn/g/sarc-chao-xuan-dinh-mui-2026',
        scope: 'INTERNAL_CLUB',
        scopeLabel: 'Nội Bộ SARC',
        status: 'archived',
        statusLabel: 'Đã Hoàn Thành (Lịch Sử)',
        statusColor: 'slate',
        raceDates: '01/01/2026 – 15/01/2026',
        runnersCount: 35,
        totalDistanceKm: 4890.0,
        totalPrizeVnd: 8000000,
        championTeam: 'Team Phoenix SARC (Quán Quân)',
        ledgerSignature: 'LEDGER-SIG-SPR26-9E4C1A',
        qrCodeUrl: 'https://openrace.vn/qr/sarc-chao-xuan-dinh-mui-2026.svg'
      }
    ];

    return {
      summary: {
        totalRaces: activeAndUpcoming.length + frozenArchives.length,
        activeCount: activeAndUpcoming.length,
        frozenCount: frozenArchives.length,
        totalRunners: 227,
        totalPrizeDisbursedVnd: 69000000
      },
      activeAndUpcoming,
      frozenArchives,
      templates: Array.from(this.raceTemplates.values())
    };
  }

  public getRaceTemplates(): RaceTemplatePreset[] {
    if (this.raceTemplates.size === 0) {
      this.seedDynamicRaceSetups();
    }
    return Array.from(this.raceTemplates.values());
  }

  public saveRaceTemplate(preset: RaceTemplatePreset): RaceTemplatePreset {
    preset.id = preset.id || `tmpl-custom-${Date.now()}`;
    preset.usageCount = preset.usageCount || 1;
    this.raceTemplates.set(preset.id, preset);
    return preset;
  }

  public getRaceQRCode(raceId: string): { raceId: string; slug: string; landingUrl: string; qrSvg: string } {
    const hub = this.getAdminRaceHub();
    const all = [...hub.activeAndUpcoming, ...hub.frozenArchives];
    const match = all.find(r => r.id === raceId || r.slug === raceId) || all[0];
    return {
      raceId: match.id,
      slug: match.slug,
      landingUrl: match.landingUrl,
      qrSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full text-slate-900"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="currentColor"/><rect x="15" y="15" width="20" height="20" fill="white"/><rect x="20" y="20" width="10" height="10" fill="currentColor"/><rect x="60" y="10" width="30" height="30" fill="currentColor"/><rect x="65" y="15" width="20" height="20" fill="white"/><rect x="70" y="20" width="10" height="10" fill="currentColor"/><rect x="10" y="60" width="30" height="30" fill="currentColor"/><rect x="15" y="65" width="20" height="20" fill="white"/><rect x="20" y="70" width="10" height="10" fill="currentColor"/><rect x="45" y="45" width="10" height="10" fill="#FF5B26"/><rect x="60" y="60" width="15" height="15" fill="currentColor"/><rect x="75" y="75" width="15" height="15" fill="currentColor"/></svg>`
    };
  }

  public exportRaceExcelReport(raceId: string): { success: boolean; raceId: string; fileName: string; totalRunners: number; totalRows: number; totalDistanceKm: number; exportedAt: string; downloadUrl: string } {
    const hub = this.getAdminRaceHub();
    const all = [...hub.activeAndUpcoming, ...hub.frozenArchives];
    const match = all.find(r => r.id === raceId || r.slug === raceId) || all[0];
    return {
      success: true,
      raceId: match.id,
      fileName: `BAO_CAO_GIAI_${match.slug.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      totalRunners: match.runnersCount,
      totalRows: match.runnersCount,
      totalDistanceKm: match.totalDistanceKm,
      exportedAt: new Date().toISOString(),
      downloadUrl: `/api/races/${match.id}/download-report`
    };
  }

  // ====================================================
  // [AC-FROZEN-HUB-ACTIONS-01 & 02] Frozen Hall of Fame & Real Excel/CSV Generation
  // ====================================================
  public getFrozenHallOfFame(raceIdOrSlug: string): {
    raceId: string;
    raceName: string;
    slug: string;
    ledgerSignature: string;
    raceDates: string;
    championTeam: string;
    totalDistanceKm: number;
    totalPrizeVnd: number;
    totalPrizeFormatted: string;
    certificatesCount: number;
    recipients: Array<{
      id: string;
      athleteName: string;
      bib: string;
      team: string;
      rank: number;
      rankBadge: string;
      distanceKm: number;
      certNo: string;
      issuedDate: string;
      awardTitle: string;
    }>;
  } {
    const hub = this.getAdminRaceHub();
    const all = [...hub.frozenArchives, ...hub.activeAndUpcoming];
    const match = all.find(r => r.id === raceIdOrSlug || r.slug === raceIdOrSlug) || hub.frozenArchives[0];
    
    const isSpring = match.id === 'race-spring-2026' || match.slug.includes('xuan') || match.slug.includes('dinh-mui');

    const recipients = isSpring ? [
      {
        id: 'rec-sp-01',
        athleteName: 'Nguyễn Văn A',
        bib: 'BIB-SPR01',
        team: 'Team Phoenix SARC',
        rank: 1,
        rankBadge: '🥇 Quán Quân Cá Nhân',
        distanceKm: 215.5,
        certNo: 'CERT-2026-SPR-001',
        issuedDate: '15/01/2026',
        awardTitle: 'Huy Chương Vàng Cá Nhân & 2.000.000đ'
      },
      {
        id: 'rec-sp-02',
        athleteName: 'Trần Quốc Tuấn',
        bib: 'BIB-SPR08',
        team: 'Team Phoenix SARC',
        rank: 2,
        rankBadge: '🥈 Á Quân Cá Nhân',
        distanceKm: 198.2,
        certNo: 'CERT-2026-SPR-002',
        issuedDate: '15/01/2026',
        awardTitle: 'Huy Chương Bạc Cá Nhân & 1.500.000đ'
      },
      {
        id: 'rec-sp-03',
        athleteName: 'Lê Thu Thảo',
        bib: 'BIB-SPR14',
        team: 'Team Eagles SARC',
        rank: 3,
        rankBadge: '🥉 Hạng Ba Cá Nhân',
        distanceKm: 182.0,
        certNo: 'CERT-2026-SPR-003',
        issuedDate: '15/01/2026',
        awardTitle: 'Huy Chương Đồng Cá Nhân & 1.000.000đ'
      },
      {
        id: 'rec-sp-04',
        athleteName: 'Hoàng Văn Minh',
        bib: 'BIB-SPR05',
        team: 'Team Phoenix SARC',
        rank: 4,
        rankBadge: '🎖️ Top 5 Finisher',
        distanceKm: 165.4,
        certNo: 'CERT-2026-SPR-004',
        issuedDate: '15/01/2026',
        awardTitle: 'Finisher Danh Dự'
      },
      {
        id: 'rec-sp-05',
        athleteName: 'Phạm Đức C',
        bib: 'BIB-SPR22',
        team: 'Team Phoenix SARC',
        rank: 5,
        rankBadge: '🎖️ Top 5 Finisher',
        distanceKm: 154.0,
        certNo: 'CERT-2026-SPR-005',
        issuedDate: '15/01/2026',
        awardTitle: 'Finisher Danh Dự'
      }
    ] : [
      {
        id: 'rec-m9-01',
        athleteName: 'Nguyễn Văn A',
        bib: 'BIB-M9-001',
        team: 'Team Dragons SADC',
        rank: 1,
        rankBadge: '🥇 Quán Quân Đơn Nam',
        distanceKm: 420.5,
        certNo: 'CERT-2026-M9-001',
        issuedDate: '30/06/2026',
        awardTitle: 'Giải Nhất Cá Nhân & 3.000.000đ'
      },
      {
        id: 'rec-m9-02',
        athleteName: 'Trần Thị B',
        bib: 'BIB-M9-012',
        team: 'Team Dragons SADC',
        rank: 1,
        rankBadge: '🥇 Quán Quân Đơn Nữ',
        distanceKm: 395.0,
        certNo: 'CERT-2026-M9-002',
        issuedDate: '30/06/2026',
        awardTitle: 'Giải Nhất Nữ & 3.000.000đ'
      },
      {
        id: 'rec-m9-03',
        athleteName: 'Lê Văn Hùng',
        bib: 'BIB-M9-005',
        team: 'Team Phoenix SARC',
        rank: 2,
        rankBadge: '🥈 Á Quân Nam',
        distanceKm: 388.2,
        certNo: 'CERT-2026-M9-003',
        issuedDate: '30/06/2026',
        awardTitle: 'Giải Nhì Cá Nhân & 2.000.000đ'
      },
      {
        id: 'rec-m9-04',
        athleteName: 'Vũ Thị Mai',
        bib: 'BIB-M9-018',
        team: 'Team Eagles SARC',
        rank: 2,
        rankBadge: '🥈 Á Quân Nữ',
        distanceKm: 360.5,
        certNo: 'CERT-2026-M9-004',
        issuedDate: '30/06/2026',
        awardTitle: 'Giải Nhì Nữ & 2.000.000đ'
      },
      {
        id: 'rec-m9-05',
        athleteName: 'Phạm Đức C',
        bib: 'BIB-M9-009',
        team: 'Team Dragons SADC',
        rank: 3,
        rankBadge: '🥉 Hạng Ba Nam',
        distanceKm: 345.8,
        certNo: 'CERT-2026-M9-005',
        issuedDate: '30/06/2026',
        awardTitle: 'Giải Ba Cá Nhân & 1.000.000đ'
      },
      {
        id: 'rec-m9-06',
        athleteName: 'Hoàng Văn Minh',
        bib: 'BIB-M9-003',
        team: 'Team Phoenix SARC',
        rank: 4,
        rankBadge: '🎖️ Top 10 Finisher',
        distanceKm: 330.0,
        certNo: 'CERT-2026-M9-006',
        issuedDate: '30/06/2026',
        awardTitle: 'Podium Finisher 800.000đ'
      },
      {
        id: 'rec-m9-07',
        athleteName: 'Trần Quốc Tuấn',
        bib: 'BIB-M9-008',
        team: 'Team Phoenix SARC',
        rank: 5,
        rankBadge: '🎖️ Top 10 Finisher',
        distanceKm: 318.4,
        certNo: 'CERT-2026-M9-007',
        issuedDate: '30/06/2026',
        awardTitle: 'Podium Finisher 800.000đ'
      },
      {
        id: 'rec-m9-08',
        athleteName: 'Lê Thu Thảo',
        bib: 'BIB-M9-021',
        team: 'Team Dragons SADC',
        rank: 6,
        rankBadge: '🎖️ Top 10 Finisher',
        distanceKm: 305.2,
        certNo: 'CERT-2026-M9-008',
        issuedDate: '30/06/2026',
        awardTitle: 'Podium Finisher 800.000đ'
      },
      {
        id: 'rec-m9-09',
        athleteName: 'Đỗ Quốc Tuấn',
        bib: 'BIB-M9-031',
        team: 'Team Tigers SARC',
        rank: 7,
        rankBadge: '🎖️ Top 10 Finisher',
        distanceKm: 295.6,
        certNo: 'CERT-2026-M9-009',
        issuedDate: '30/06/2026',
        awardTitle: 'Podium Finisher 800.000đ'
      },
      {
        id: 'rec-m9-10',
        athleteName: 'Bùi Tuấn Kiệt',
        bib: 'BIB-M9-027',
        team: 'Team Dragons SADC',
        rank: 8,
        rankBadge: '🎖️ Top 10 Finisher',
        distanceKm: 288.0,
        certNo: 'CERT-2026-M9-010',
        issuedDate: '30/06/2026',
        awardTitle: 'Podium Finisher 800.000đ'
      },
      {
        id: 'rec-m9-11',
        athleteName: 'Ngô Mỹ Hạnh',
        bib: 'BIB-M9-042',
        team: 'Team Phoenix SARC',
        rank: 9,
        rankBadge: '🎖️ Top 10 Finisher',
        distanceKm: 280.0,
        certNo: 'CERT-2026-M9-011',
        issuedDate: '30/06/2026',
        awardTitle: 'Chuyên Cần Streak Master'
      }
    ];

    return {
      raceId: match.id,
      raceName: match.name,
      slug: match.slug,
      ledgerSignature: match.ledgerSignature || 'LEDGER-SIG-M9-FROZEN-8F9B2C',
      raceDates: match.raceDates || '01/06/2026 – 30/06/2026',
      championTeam: match.championTeam || 'Team Dragons SADC',
      totalDistanceKm: match.totalDistanceKm || 15420.0,
      totalPrizeVnd: match.totalPrizeVnd || 15000000,
      totalPrizeFormatted: (match.totalPrizeVnd || 15000000).toLocaleString('vi-VN') + 'đ',
      certificatesCount: recipients.length,
      recipients
    };
  }

  public generateRaceReportCsv(raceIdOrSlug: string): string {
    const hof = this.getFrozenHallOfFame(raceIdOrSlug);
    const lines: string[] = [];
    
    // Header section
    lines.push(`"BÁO CÁO TỔNG KẾT TOÀN DIỆN GIẢI ĐẤU"`);
    lines.push(`"Tên Giải Đấu:","${hof.raceName}"`);
    lines.push(`"Mã Định Danh (Slug):","${hof.slug}"`);
    lines.push(`"Chữ Ký Sổ Cái Bảo Mật (Ledger Signature):","${hof.ledgerSignature}"`);
    lines.push(`"Thời Gian Tranh Tài:","${hof.raceDates}"`);
    lines.push(`"Đội Quán Quân / Vô Địch:","${hof.championTeam}"`);
    lines.push(`"Tổng Cự Ly Chung Cuộc (km):","${hof.totalDistanceKm.toFixed(1)}"`);
    lines.push(`"Tổng Quỹ Thưởng Đã Giải Ngân:","${hof.totalPrizeFormatted}"`);
    lines.push(`"Tổng Số Chứng Nhận E-Cert Đã Cấp:","${hof.certificatesCount}"`);
    lines.push(`"Thời Điểm Trích Xuất Dữ Liệu:","${new Date().toISOString()}"`);
    lines.push(``);

    // Table Header
    lines.push(`"Hạng","Họ Và Tên VĐV","Mã BIB","Đội Đua","Danh Hiệu / Huy Chương","Cự Ly Tích Lũy (km)","Mã Số Chứng Nhận E-Cert","Ngày Cấp Chứng Nhận","Trạng Thái Sổ Cái"`);

    // Table Rows
    hof.recipients.forEach(r => {
      lines.push(`"${r.rank}","${r.athleteName}","${r.bib}","${r.team}","${r.awardTitle}","${r.distanceKm.toFixed(1)}","${r.certNo}","${r.issuedDate}","ĐÃ ĐÓNG BĂNG & XÁC THỰC"`);
    });

    lines.push(``);
    lines.push(`"XÁC NHẬN BỞI:","Ban Tổ Chức Hệ Thống OpenRace Enterprise - Chữ Ký Điện Tử Bất Biến"`);

    // Prepend UTF-8 BOM
    return '\uFEFF' + lines.join('\r\n');
  }

  // ====================================================
  // [AC-CLUB-COMMAND-CENTER-01 to 04] All-in-One Command Center Methods
  // ====================================================

  public seedClubCommandCenterData(): void {
    if (this.clubMemberMatrix.size > 0) return;

    const members: ClubMemberMatrixItem[] = [
      {
        id: 'user-01',
        name: 'Nguyễn Văn A',
        email: 'athlete.nguyen@sarc.vn',
        bib: '204',
        role: 'CAPTAIN_PHOENIX',
        roleLabel: 'Đội Trưởng Phoenix',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'ACTIVE',
        joinedAt: '15/01/2026',
        totalKm: 342.5
      },
      {
        id: 'lead-01',
        name: 'Hoàng Văn Minh',
        email: 'minh.hoang@sarc.vn',
        bib: '001',
        role: 'PRESIDENT',
        roleLabel: 'Chủ Nhiệm CLB',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'ACTIVE',
        joinedAt: '01/01/2026',
        totalKm: 410.2
      },
      {
        id: 'user-02',
        name: 'Trần Thị B',
        email: 'tran.b@sarc.vn',
        bib: '112',
        role: 'CAPTAIN_TIGERS',
        roleLabel: 'Đội Trưởng Tigers',
        teamId: 'team-tigers',
        teamName: 'Team Tigers SARC',
        status: 'ACTIVE',
        joinedAt: '20/01/2026',
        totalKm: 289.0
      },
      {
        id: 'coach-01',
        name: 'Lê Văn Hùng',
        email: 'hung.coach@sarc.vn',
        bib: '007',
        role: 'TECHNICAL_DIRECTOR',
        roleLabel: 'Ban Chuyên Môn',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'ACTIVE',
        joinedAt: '05/01/2026',
        totalKm: 520.8
      },
      {
        id: 'user-03',
        name: 'Phạm Đức C',
        email: 'duc.c@sarc.vn',
        bib: '305',
        role: 'MEMBER',
        roleLabel: 'Thành Viên',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'ACTIVE',
        joinedAt: '10/02/2026',
        totalKm: 195.4
      },
      {
        id: 'user-04',
        name: 'Vũ Thị Mai',
        email: 'mai.vu@sarc.vn',
        bib: '409',
        role: 'MEMBER',
        roleLabel: 'Thành Viên',
        teamId: 'team-eagles',
        teamName: 'Team Eagles SARC',
        status: 'ACTIVE',
        joinedAt: '01/03/2026',
        totalKm: 140.0
      },
      {
        id: 'pend-01',
        name: 'Đỗ Quốc Tuấn',
        email: 'tuan.do@gmail.com',
        bib: 'TBD-01',
        role: 'MEMBER',
        roleLabel: 'Thành Viên',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'PENDING',
        joinedAt: '06/11/2026',
        totalKm: 0.0
      },
      {
        id: 'pend-02',
        name: 'Ngô Mỹ Hạnh',
        email: 'hanh.ngo@gmail.com',
        bib: 'TBD-02',
        role: 'MEMBER',
        roleLabel: 'Thành Viên',
        teamId: 'team-open',
        teamName: 'Chưa phân đội',
        status: 'PENDING',
        joinedAt: '07/11/2026',
        totalKm: 0.0
      },
      {
        id: 'lock-01',
        name: 'Bùi Tuấn Kiệt',
        email: 'kiet.bui@sarc.vn',
        bib: '999',
        role: 'MEMBER',
        roleLabel: 'Thành Viên',
        teamId: 'team-phoenix',
        teamName: 'Team Phoenix SARC',
        status: 'LOCKED',
        joinedAt: '10/01/2026',
        totalKm: 15.0
      }
    ];

    for (const m of members) {
      this.clubMemberMatrix.set(m.id, m);
    }

    const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full text-slate-900"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="currentColor"/><rect x="15" y="15" width="20" height="20" fill="white"/><rect x="20" y="20" width="10" height="10" fill="currentColor"/><rect x="60" y="10" width="30" height="30" fill="currentColor"/><rect x="65" y="15" width="20" height="20" fill="white"/><rect x="70" y="20" width="10" height="10" fill="currentColor"/><rect x="10" y="60" width="30" height="30" fill="currentColor"/><rect x="15" y="65" width="20" height="20" fill="white"/><rect x="20" y="70" width="10" height="10" fill="currentColor"/><rect x="45" y="45" width="10" height="10" fill="#FF5B26"/><rect x="60" y="60" width="15" height="15" fill="currentColor"/><rect x="75" y="75" width="15" height="15" fill="currentColor"/></svg>`;

    const invites: ClubInviteCodeItem[] = [
      {
        code: 'SARC-SPRING-2026',
        teamAssigned: 'Chung Toàn CLB',
        usedCount: 18,
        maxUses: 50,
        expiresAt: '31/12/2026',
        status: 'ACTIVE',
        qrSvg
      },
      {
        code: 'PHX-VIP-24H',
        teamAssigned: 'Team Phoenix SARC',
        usedCount: 6,
        maxUses: 10,
        expiresAt: '08/11/2026 (24h)',
        status: 'ACTIVE',
        qrSvg
      },
      {
        code: 'OPEN-TRIAL-88',
        teamAssigned: 'Team Tigers SARC',
        usedCount: 10,
        maxUses: 10,
        expiresAt: '30/11/2026',
        status: 'EXPIRED',
        qrSvg
      }
    ];

    for (const inv of invites) {
      this.clubInviteCodes.set(inv.code, inv);
    }
  }

  public getUnifiedClubCommandCenter(): UnifiedClubCommandCenterResponse {
    if (this.clubMemberMatrix.size === 0) {
      this.seedClubCommandCenterData();
    }
    const members = Array.from(this.clubMemberMatrix.values());
    const inviteCodes = Array.from(this.clubInviteCodes.values());

    const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
    const pendingMembers = members.filter(m => m.status === 'PENDING').length;
    const totalCaptains = members.filter(m => m.role.includes('CAPTAIN') || m.role === 'PRESIDENT' || m.role === 'TECHNICAL_DIRECTOR').length;
    const activeInvites = inviteCodes.filter(c => c.status === 'ACTIVE').length;

    this.clubProfileConfig.totalActiveMembers = activeMembers;
    this.clubProfileConfig.pendingCount = pendingMembers;
    this.clubProfileConfig.activeCodesCount = activeInvites;

    return {
      profile: this.clubProfileConfig,
      members,
      inviteCodes,
      summary: {
        totalMembers: members.length,
        activeMembers,
        pendingMembers,
        totalCaptains,
        activeInvites
      },
      pulseMetrics: {
        activeMembersCount: activeMembers,
        pendingMembersCount: pendingMembers,
        totalCaptainsCount: totalCaptains,
        activeInvitesCount: activeInvites,
        totalInvitesUsed: 0
      }
    };
  }

  public updateClubIdentityAndBankConfig(profile: Partial<ClubProfileConfig>): ClubProfileConfig {
    if (profile.name) this.clubProfileConfig.name = profile.name;
    if (profile.slogan) this.clubProfileConfig.slogan = profile.slogan;
    if (profile.description) this.clubProfileConfig.description = profile.description;
    if (profile.logoUrl) this.clubProfileConfig.logoUrl = profile.logoUrl;
    if (profile.bankBin) this.clubProfileConfig.bankBin = profile.bankBin;
    if (profile.bankName) this.clubProfileConfig.bankName = profile.bankName;
    if (profile.bankAccountNumber) this.clubProfileConfig.bankAccountNumber = profile.bankAccountNumber;
    if (profile.bankAccountName) this.clubProfileConfig.bankAccountName = profile.bankAccountName;

    const bin = this.clubProfileConfig.bankBin;
    const acc = this.clubProfileConfig.bankAccountNumber;
    const accName = encodeURIComponent(this.clubProfileConfig.bankAccountName);
    this.clubProfileConfig.vietQrQuickUrl = `https://img.vietqr.io/image/${bin}-${acc}-compact2.png?amount=0&addInfo=QUY%20CLB%20SARC&accountName=${accName}`;

    return this.clubProfileConfig;
  }

  public updateClubSlogan(slogan: string, description?: string): ClubProfileConfig {
    if (slogan) this.clubProfileConfig.slogan = slogan;
    if (description !== undefined) this.clubProfileConfig.description = description;
    return this.clubProfileConfig;
  }

  public updateClubMemberRole(memberId: string, newRole: ClubMemberRole): ClubMemberMatrixItem {
    if (this.clubMemberMatrix.size === 0) {
      this.seedClubCommandCenterData();
    }
    const member = this.clubMemberMatrix.get(memberId);
    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }
    member.role = newRole;
    switch (newRole) {
      case 'CAPTAIN_PHOENIX':
        member.roleLabel = 'Đội Trưởng Phoenix';
        member.teamId = 'team-phoenix';
        member.teamName = 'Team Phoenix SARC';
        break;
      case 'CAPTAIN_TIGERS':
        member.roleLabel = 'Đội Trưởng Tigers';
        member.teamId = 'team-tigers';
        member.teamName = 'Team Tigers SARC';
        break;
      case 'TECHNICAL_DIRECTOR':
        member.roleLabel = 'Ban Chuyên Môn';
        break;
      case 'PRESIDENT':
        member.roleLabel = 'Chủ Nhiệm CLB';
        break;
      default:
        member.roleLabel = 'Thành Viên';
        break;
    }
    this.clubMemberMatrix.set(memberId, member);
    return member;
  }

  public updateClubMemberStatus(memberId: string, status: 'ACTIVE' | 'PENDING' | 'LOCKED' | 'SUSPENDED'): ClubMemberMatrixItem {
    if (this.clubMemberMatrix.size === 0) {
      this.seedClubCommandCenterData();
    }
    const member = this.clubMemberMatrix.get(memberId);
    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }
    member.status = (status === 'SUSPENDED' ? 'LOCKED' : status) as any;
    this.clubMemberMatrix.set(memberId, member);

    // Synchronize active and pending counts
    const allMembers = Array.from(this.clubMemberMatrix.values());
    this.clubProfileConfig.totalActiveMembers = allMembers.filter(m => m.status === 'ACTIVE').length;
    this.clubProfileConfig.pendingCount = allMembers.filter(m => m.status === 'PENDING').length;

    return member;
  }

  public generateClubInviteCode(params: { teamAssigned?: string; maxUses?: number; expireHours?: number }): ClubInviteCodeItem {
    const code = `SARC-JOIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const hours = params.expireHours || 24;
    const expiresAt = `${hours}h kể từ bây giờ`;
    const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full text-slate-900"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="currentColor"/><rect x="15" y="15" width="20" height="20" fill="white"/><rect x="20" y="20" width="10" height="10" fill="currentColor"/><rect x="60" y="10" width="30" height="30" fill="currentColor"/><rect x="65" y="15" width="20" height="20" fill="white"/><rect x="70" y="20" width="10" height="10" fill="currentColor"/><rect x="10" y="60" width="30" height="30" fill="currentColor"/><rect x="15" y="65" width="20" height="20" fill="white"/><rect x="20" y="70" width="10" height="10" fill="currentColor"/><rect x="45" y="45" width="10" height="10" fill="#FF5B26"/><rect x="60" y="60" width="15" height="15" fill="currentColor"/><rect x="75" y="75" width="15" height="15" fill="currentColor"/></svg>`;

    const item: ClubInviteCodeItem = {
      code,
      teamAssigned: params.teamAssigned || 'Chung Toàn CLB',
      usedCount: 0,
      maxUses: params.maxUses || 10,
      expiresAt,
      status: 'ACTIVE',
      qrSvg
    };
    this.clubInviteCodes.set(code, item);
    return item;
  }

  public revokeClubInviteCode(code: string): { success: boolean; code: string } {
    const item = this.clubInviteCodes.get(code);
    if (item) {
      item.status = 'LOCKED';
      this.clubInviteCodes.set(code, item);
    }
    return { success: true, code };
  }

  // ==========================================
  // [AC-TOURNAMENT-HUB-01] TOURNAMENT & CATEGORY HUB REPOSITORY
  // ==========================================

  public getTournamentHubSummary(): TournamentHubSummary {
    const activeRaces: RaceCapacityStats[] = [
      {
        raceId: 'race-ba-vi-2026',
        name: 'SARC Trail Challenge Ba Vì 2026',
        enrolledCount: 64,
        maxCapacity: 80,
        capacityRatioPct: 80,
        isFull: false,
        status: 'ACTIVE'
      },
      {
        raceId: 'race-season-10',
        name: 'Mùa 10 Run to Techcombank 2026',
        enrolledCount: 48,
        maxCapacity: 50,
        capacityRatioPct: 96,
        isFull: false,
        status: 'ACTIVE'
      },
      {
        raceId: 'race-internal-ekiden',
        name: 'Internal Ekiden Relay SARC 2026',
        enrolledCount: 28,
        maxCapacity: 40,
        capacityRatioPct: 70,
        isFull: false,
        status: 'ACTIVE'
      }
    ];

    const upcomingRaces: RaceCapacityStats[] = [
      {
        raceId: 'race-tet-2027',
        name: 'SARC Chào Xuân Đinh Mùi 2027',
        enrolledCount: 15,
        maxCapacity: 60,
        capacityRatioPct: 25,
        isFull: false,
        status: 'UPCOMING'
      }
    ];

    const frozenRaces: RaceCapacityStats[] = [
      {
        raceId: 'race-season-9',
        name: 'Mùa 9 Thử Thách Mùa Hè Rực Lửa 2026',
        enrolledCount: 52,
        maxCapacity: 52,
        capacityRatioPct: 100,
        isFull: true,
        status: 'FROZEN'
      }
    ];

    const totalRaces = activeRaces.length + upcomingRaces.length + frozenRaces.length;
    const totalActiveRunners = activeRaces.reduce((sum, r) => sum + r.enrolledCount, 0);
    const averageCapacityPct = Math.round(
      [...activeRaces, ...upcomingRaces, ...frozenRaces].reduce((sum, r) => sum + r.capacityRatioPct, 0) / totalRaces
    );

    return {
      racesMatrix: {
        active: activeRaces,
        upcoming: upcomingRaces,
        frozen: frozenRaces
      },
      totalRaces,
      totalActiveRunners,
      averageCapacityPct
    };
  }

  // ==========================================
  // [AC-TECHNICAL-MODERATION-02] TECHNICAL & MODERATION HUB REPOSITORY
  // ==========================================

  public getTechnicalModerationDashboard(): TechnicalModerationDashboard {
    const pulse = this.getClubPulseAnalytics('club-sarc-sadc');

    return {
      urgentReviewQueue: {
        trailElevationRuns: [
          {
            id: 'REV-TRAIL-01',
            runnerName: 'Hoàng Đức Anh',
            activityName: 'Chinh phục Đỉnh Ba Vì Trail',
            distanceKm: 14.2,
            elevationGainM: 320,
            pace: '6:15 min/km',
            flagReason: 'Cần thẩm định D+ thực tế theo độ cao GPS (+3.2km Bonus)',
            status: 'PENDING'
          },
          {
            id: 'REV-TRAIL-02',
            runnerName: 'Vũ Thị Hạnh',
            activityName: 'Hàm Lợn Trail Training',
            distanceKm: 8.5,
            elevationGainM: 195,
            pace: '7:02 min/km',
            flagReason: 'Độ dốc trung bình 12% - Hợp lệ quy chế giải',
            status: 'PENDING'
          }
        ],
        treadmillHeartRateRuns: [
          {
            id: 'REV-TM-01',
            runnerName: 'Lê Thị B',
            activityName: 'Treadmill Interval Run 10K',
            distanceKm: 10.0,
            heartRateAvg: 158,
            isContinuousHr: true,
            status: 'PENDING'
          },
          {
            id: 'REV-TM-02',
            runnerName: 'Nguyễn Văn Nam',
            activityName: 'Chạy máy thể dục Gym SARC',
            distanceKm: 6.0,
            heartRateAvg: 149,
            isContinuousHr: true,
            status: 'PENDING'
          }
        ],
        aiAutoTrimRuns: [
          {
            id: 'REV-TRIM-01',
            runnerName: 'Phạm Đức C',
            activityName: 'Chạy sáng công viên + Đi xe máy về',
            rawDistanceKm: 12.8,
            trimmedDistanceKm: 8.2,
            vehicleSpeedDetected: 'Vận tốc đỉnh 42.5 km/h tại Km 8.3 (Đã tự động cắt)',
            status: 'PENDING'
          }
        ],
        totalPendingReview: 5
      },
      guardrails: {
        minDistanceKm: 3.0,
        maxPaceSeconds: 720,
        hardPaceFloorLock: '2:45 min/km',
        trailBonusMultiplier: 1.5
      },
      clubPulse: {
        totalActiveRunners: pulse.totalActiveRunners,
        activityHeatmap: pulse.blocks.flatMap(b =>
          pulse.daysHeader.map((day, idx) => ({
            day,
            timeBlock: b.timeBlock,
            intensity: b.dailyCounts[idx] || 0
          }))
        ),
        churnWatchlist: pulse.churnWatchlist.map(c => ({
          id: c.id,
          name: c.athleteName,
          daysInactive: c.inactiveDays,
          riskLevel: c.riskLevel,
          lastSeen: c.lastActivityDate
        }))
      },
      disputeCenter: {
        pendingAppeals: [
          {
            id: 'DISP-001',
            runnerName: 'Lê Thị B',
            raceName: 'SARC Trail Challenge Ba Vì',
            requestedKm: 1.8,
            reason: 'Mất sóng GPS dốc hầm Ba Vì, đề nghị cộng bù cự ly',
            evidenceUrl: 'https://strava.com/activities/998231',
            status: 'PENDING'
          },
          {
            id: 'DISP-002',
            runnerName: 'Nguyễn Văn D',
            raceName: 'Mùa 10 Run to Techcombank',
            requestedKm: 1.0,
            reason: 'Qua hầm Kim Liên đồng hồ ngắt quãng',
            evidenceUrl: 'https://strava.com/activities/998232',
            status: 'PENDING'
          }
        ],
        resolvedCount: 18
      }
    };
  }

  // ==========================================
  // [AC-FINANCIAL-TREASURY-03] FINANCIAL & TREASURY HUB REPOSITORY
  // ==========================================

  private treasuryDebts = [
    {
      id: 'debt-01',
      runnerId: 'user-04',
      runnerName: 'Hoàng Đức Anh',
      amountVnd: 100000,
      reason: 'Phạt thiếu 8.5km chỉ tiêu tuần 19',
      isOverdue: true,
      daysOverdue: 4,
      status: 'UNPAID' as 'UNPAID' | 'RECONCILED'
    },
    {
      id: 'debt-02',
      runnerId: 'user-05',
      runnerName: 'Trần Văn Tuấn',
      amountVnd: 50000,
      reason: 'Đóng quỹ Mùa 10 Run to Techcombank',
      isOverdue: true,
      daysOverdue: 8,
      status: 'UNPAID' as 'UNPAID' | 'RECONCILED'
    },
    {
      id: 'debt-03',
      runnerId: 'user-06',
      runnerName: 'Lê Quốc Hùng',
      amountVnd: 50000,
      reason: 'Phạt pace gian lận < 2:45 min/km',
      isOverdue: false,
      daysOverdue: 1,
      status: 'UNPAID' as 'UNPAID' | 'RECONCILED'
    }
  ];

  public getFinancialTreasuryLedger(): FinancialTreasuryLedger {
    const profile = this.clubProfileConfig;
    const unpaidDebts = this.treasuryDebts.filter(d => d.status === 'UNPAID');
    const totalOutstandingDuesVnd = unpaidDebts.reduce((sum, d) => sum + d.amountVnd, 0);
    const totalOverdueCount = unpaidDebts.filter(d => d.isOverdue).length;

    return {
      clubTreasury: {
        bankBin: profile.bankBin || '970422',
        bankName: profile.bankName || 'MB Bank (Quân Đội)',
        bankAccountNo: profile.bankAccountNumber || '0388299999',
        bankAccountOwner: profile.bankAccountName || 'CLB CHAY BO SARC',
        totalBalanceVnd: 42500000,
        vietQrPayload: profile.vietQrQuickUrl || '00020101021238540010A00000072701240006970422011003882999990208QRIBFTTA53037045802VN6304E1F2'
      },
      debtLedger: {
        records: this.treasuryDebts,
        totalOutstandingDuesVnd,
        totalOverdueCount
      },
      prizeDisbursal: {
        raceId: 'race-season-10',
        raceName: 'Mùa 10 Run to Techcombank 2026',
        totalPrizePoolVnd: 25000000,
        disbursedVnd: 15000000,
        pendingDisbursalVnd: 10000000,
        awards: [
          {
            category: 'Top 1 Đồng Đội',
            recipient: 'Team Dragons SADC',
            prizeVnd: 5000000,
            nftCertificateId: 'NFT-CUP-2026-001',
            status: 'PAID'
          },
          {
            category: 'Top 1 Cá Nhân Nam',
            recipient: 'Nguyễn Văn A',
            prizeVnd: 3000000,
            nftCertificateId: 'NFT-MALE-2026-001',
            status: 'PAID'
          },
          {
            category: 'Top 1 Cá Nhân Nữ',
            recipient: 'Trần Thị B',
            prizeVnd: 3000000,
            nftCertificateId: 'NFT-FEMALE-2026-001',
            status: 'PAID'
          },
          {
            category: 'Vua Leo Dốc D+ Trail',
            recipient: 'Đỗ Quốc Tuấn',
            prizeVnd: 1500000,
            nftCertificateId: 'NFT-TRAIL-2026-001',
            status: 'PENDING'
          },
          {
            category: 'Streak Hero Chuyên Cần',
            recipient: 'Vũ Hoàng Long',
            prizeVnd: 1500000,
            nftCertificateId: 'NFT-STREAK-2026-001',
            status: 'PENDING'
          }
        ]
      },
      reconciliationAudit: {
        autoMatchedCount: 34,
        manualReviewedCount: 2,
        totalSettledVnd: 15500000
      }
    };
  }

  public reconcileTreasuryPayment(debtId: string, method: string = 'VIETQR_AUTO'): { success: boolean; debtId: string; settledAmount: number } {
    const debt = this.treasuryDebts.find(d => d.id === debtId);
    if (!debt) {
      throw new Error(`Debt record with ID ${debtId} not found`);
    }
    debt.status = 'RECONCILED';
    return {
      success: true,
      debtId,
      settledAmount: debt.amountVnd
    };
  }

  // ==========================================
  // [AC-OPS-01..08] SYSTEM MONITORING & OPERATIONS COMMAND CENTER
  // ==========================================

  private stravaQuotaData: StravaQuotaBurnRateDto = {
    period15m: {
      usage: 124,
      limit: 600,
      percentage: 20.67,
      burnRatePerMin: 14.2,
      projectedTimeToCeilingMin: 33.5
    },
    periodDaily: {
      usage: 3450,
      limit: 30000,
      percentage: 11.5,
      burnRatePerHour: 245,
      projectedTimeToCeilingHours: 108.3
    },
    smartPollingActive: false,
    tokenRotationEnabled: true,
    activeAppPool: [
      {
        clientId: 'client-openrace-prod-01',
        appName: 'OpenRace Production Primary',
        isPrimary: true,
        remainingQuota: 476,
        status: 'ACTIVE'
      },
      {
        clientId: 'client-openrace-prod-02',
        appName: 'OpenRace Backup Secondary',
        isPrimary: false,
        remainingQuota: 600,
        status: 'STANDBY'
      },
      {
        clientId: 'client-openrace-prod-03',
        appName: 'OpenRace Disaster Recovery',
        isPrimary: false,
        remainingQuota: 590,
        status: 'STANDBY'
      }
    ],
    autoBackoffThresholdPercent: 85
  };

  public getStravaQuotaForecast(): StravaQuotaBurnRateDto {
    return { ...this.stravaQuotaData };
  }

  public toggleTokenRotation(enabled?: boolean): StravaQuotaBurnRateDto {
    if (enabled !== undefined) {
      this.stravaQuotaData.tokenRotationEnabled = enabled;
    } else {
      this.stravaQuotaData.tokenRotationEnabled = !this.stravaQuotaData.tokenRotationEnabled;
    }
    if (this.stravaQuotaData.period15m.percentage >= this.stravaQuotaData.autoBackoffThresholdPercent) {
      this.stravaQuotaData.smartPollingActive = true;
    }
    return { ...this.stravaQuotaData };
  }

  private dlqSurgeryStore: DlqSurgeryItemDto[] = [
    {
      id: 'dlq-strava-8801',
      source: 'STRAVA',
      athleteId: 'ath-01',
      athleteName: 'Nguyễn Văn A',
      errorReason: 'ISO8601 Timestamp Format Mismatch in start_date_local: expected ISO, received custom string',
      statusCode: 422,
      retryCount: 2,
      maxRetries: 5,
      nextRetryDelaySec: 4,
      receivedAt: '2026-11-07T05:42:10.000Z',
      lastAttemptAt: '2026-11-07T05:42:16.000Z',
      status: 'PENDING_SURGERY',
      rawPayload: {
        activityId: 98124401,
        athleteId: 'ath-01',
        start_date_local: '2026/11/07 06:15:00 GMT+7',
        distance: 10250,
        moving_time: 3120,
        type: 'Run'
      },
      surgeryPatchedFields: {}
    },
    {
      id: 'dlq-garmin-8802',
      source: 'GARMIN',
      athleteId: 'ath-02',
      athleteName: 'Trần Thị B',
      errorReason: 'Missing required elevation_gain_meters field in FIT activity payload',
      statusCode: 400,
      retryCount: 1,
      maxRetries: 5,
      nextRetryDelaySec: 2,
      receivedAt: '2026-11-07T06:10:00.000Z',
      lastAttemptAt: '2026-11-07T06:10:02.000Z',
      status: 'PENDING_SURGERY',
      rawPayload: {
        fit_file_id: 'gar-9941',
        athleteId: 'ath-02',
        distance_meters: 5400,
        total_timer_time: 1740,
        elevation_gain_meters: null,
        sport: 'RUNNING'
      },
      surgeryPatchedFields: {}
    },
    {
      id: 'dlq-coros-8803',
      source: 'COROS',
      athleteId: 'ath-03',
      athleteName: 'Lê Văn C',
      errorReason: 'Negative moving_time in Coros stream data segment',
      statusCode: 422,
      retryCount: 4,
      maxRetries: 5,
      nextRetryDelaySec: 16,
      receivedAt: '2026-11-07T04:20:00.000Z',
      lastAttemptAt: '2026-11-07T04:20:30.000Z',
      status: 'RESOLVED',
      rawPayload: {
        stream_id: 'cor-112',
        athleteId: 'ath-03',
        moving_time: 1800,
        distance: 6000
      },
      surgeryPatchedFields: {
        moving_time: 1800
      }
    }
  ];

  public getDlqSurgeryItems(): DlqSurgeryItemDto[] {
    return [...this.dlqSurgeryStore];
  }

  public editDlqPayload(id: string, patchedFields: Record<string, any>): DlqSurgeryItemDto {
    const item = this.dlqSurgeryStore.find(d => d.id === id);
    if (!item) {
      throw new Error(`DLQ Item with ID ${id} not found`);
    }
    item.surgeryPatchedFields = { ...item.surgeryPatchedFields, ...patchedFields };
    item.rawPayload = { ...item.rawPayload, ...patchedFields };
    return { ...item };
  }

  public replayDlqWebhook(id: string): WebhookReplayResponseDto {
    const item = this.dlqSurgeryStore.find(d => d.id === id);
    if (!item) {
      throw new Error(`DLQ Item with ID ${id} not found`);
    }
    item.status = 'RESOLVED';
    item.lastAttemptAt = new Date().toISOString();
    return {
      id: item.id,
      success: true,
      replayedAt: item.lastAttemptAt,
      status: 'RESOLVED',
      message: `Payload for ${item.source} (${item.athleteName}) successfully patched and replayed into ingestion pipeline.`
    };
  }

  private tenantHealthStore: TenantHealthItemDto[] = [
    {
      tenantId: 'tenant-sarc-prod-01',
      tenantName: 'CLB Chạy Bộ SARC (Phoenix SARC)',
      subdomain: 'sarc.openrace.vn',
      tier: 'ENTERPRISE',
      activeRunnersDau: 48,
      storageUsedMb: 1420,
      storageQuotaMb: 10240,
      bandwidthConsumedGb: 12.8,
      isFrozen: false,
      lastActiveAt: new Date().toISOString()
    },
    {
      tenantId: 'tenant-hrc-prod-02',
      tenantName: 'Hanoi Running Club (HRC)',
      subdomain: 'hrc.openrace.vn',
      tier: 'PRO',
      activeRunnersDau: 126,
      storageUsedMb: 3450,
      storageQuotaMb: 5120,
      bandwidthConsumedGb: 44.2,
      isFrozen: false,
      lastActiveAt: new Date().toISOString()
    },
    {
      tenantId: 'tenant-vpr-prod-03',
      tenantName: 'Vung Tau Passion Runners (VPR)',
      subdomain: 'vpr.openrace.vn',
      tier: 'FREE',
      activeRunnersDau: 15,
      storageUsedMb: 240,
      storageQuotaMb: 500,
      bandwidthConsumedGb: 2.1,
      isFrozen: false,
      lastActiveAt: new Date().toISOString()
    },
    {
      tenantId: 'tenant-test-freeze-04',
      tenantName: 'Spam Club Sandbox',
      subdomain: 'spam.openrace.vn',
      tier: 'FREE',
      activeRunnersDau: 1,
      storageUsedMb: 490,
      storageQuotaMb: 500,
      bandwidthConsumedGb: 8.5,
      isFrozen: true,
      freezeReason: 'Vi phạm chính sách lạm dụng webhook bot',
      lastActiveAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  public getTenantHealthMatrix(): TenantHealthMatrixDto {
    const totalTenants = this.tenantHealthStore.length;
    const frozenTenantsCount = this.tenantHealthStore.filter(t => t.isFrozen).length;
    const totalActiveRunnersDau = this.tenantHealthStore.reduce((acc, t) => acc + t.activeRunnersDau, 0);
    const totalStorageUsedMb = this.tenantHealthStore.reduce((acc, t) => acc + t.storageUsedMb, 0);
    const totalBandwidthConsumedGb = parseFloat(this.tenantHealthStore.reduce((acc, t) => acc + t.bandwidthConsumedGb, 0).toFixed(1));

    return {
      totalTenants,
      frozenTenantsCount,
      totalActiveRunnersDau,
      totalStorageUsedMb,
      totalBandwidthConsumedGb,
      tenants: [...this.tenantHealthStore]
    };
  }

  public toggleTenantFreeze(tenantId: string, isFrozen?: boolean, reason?: string): TenantHealthItemDto {
    const tenant = this.tenantHealthStore.find(t => t.tenantId === tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    if (isFrozen !== undefined) {
      tenant.isFrozen = isFrozen;
    } else {
      tenant.isFrozen = !tenant.isFrozen;
    }
    if (tenant.isFrozen) {
      tenant.freezeReason = reason || 'Đóng băng theo chính sách quản trị nền tảng';
    } else {
      delete tenant.freezeReason;
    }
    return { ...tenant };
  }

  private scopedRecomputeJobs: Map<string, ScopedRecomputeProgressDto> = new Map();

  public executeScopedRecompute(req: ScopedRecomputeRequestDto): ScopedRecomputeProgressDto {
    const jobId = `recompute-job-${Date.now()}`;
    const totalActivities = req.scopeType === 'MALFORMED_SUBSET' ? 12 : req.scopeType === 'TENANT' ? 148 : 520;
    const auditLogId = `audit-rec-${Date.now()}`;

    const progress: ScopedRecomputeProgressDto = {
      jobId,
      scopeType: req.scopeType,
      status: 'COMPLETED',
      processedActivities: totalActivities,
      totalActivities,
      progressPercent: 100,
      elapsedSeconds: 2.4,
      estimatedRemainingSeconds: 0,
      startedAt: new Date(Date.now() - 2400).toISOString(),
      completedAt: new Date().toISOString(),
      auditLogId
    };

    this.scopedRecomputeJobs.set(jobId, progress);

    this.logAdminSecurityAction(
      req.triggerActor || 'admin@openrace.vn',
      '127.0.0.1',
      `SCOPED_RECOMPUTE_${req.scopeType}`,
      'SCOPED_RECOMPUTE_ENGINE',
      req
    );

    return progress;
  }

  public getScopedRecomputeStatus(jobId: string): ScopedRecomputeProgressDto {
    const job = this.scopedRecomputeJobs.get(jobId);
    if (!job) {
      return {
        jobId,
        scopeType: 'TENANT',
        status: 'COMPLETED',
        processedActivities: 148,
        totalActivities: 148,
        progressPercent: 100,
        elapsedSeconds: 1.8,
        estimatedRemainingSeconds: 0,
        startedAt: new Date(Date.now() - 1800).toISOString(),
        completedAt: new Date().toISOString(),
        auditLogId: `audit-rec-${Date.now()}`
      };
    }
    return job;
  }

  public getTrafficAnalytics(): TrafficVisitorMetricsDto {
    const hours: HourlyConcurrencyHeatmapItemDto[] = [];
    const peakHours = [5, 6, 18, 19, 20];

    for (let h = 0; h < 24; h++) {
      const isPeak = peakHours.includes(h);
      let concurrent = 0;
      let latency = 22;
      let errorRate = 0.02;

      if (h >= 5 && h <= 6) {
        concurrent = h === 5 ? 450 : 680;
        latency = 34;
        errorRate = 0.05;
      } else if (h >= 18 && h <= 20) {
        concurrent = h === 18 ? 580 : h === 19 ? 710 : 490;
        latency = 38;
        errorRate = 0.06;
      } else if (h >= 7 && h <= 17) {
        concurrent = Math.floor(120 + Math.sin(h) * 40);
        latency = 24;
      } else {
        concurrent = Math.floor(25 + Math.random() * 20);
        latency = 18;
      }

      const label = `${String(h).padStart(2, '0')}:00 - ${String((h + 1) % 24).padStart(2, '0')}:00`;
      hours.push({
        hour: h,
        label,
        concurrentRunners: concurrent,
        isPeakHour: isPeak,
        serverLatencyMs: latency,
        errorRatePercent: errorRate
      });
    }

    return {
      currentConcurrentUsers: 245,
      peakConcurrentToday: 710,
      averageLatencyMs: 24.8,
      http4xxRatePercent: 0.08,
      http5xxRatePercent: 0.01,
      cdnEdgeBandwidthGbps: 1.45,
      totalPageViews24h: 64890,
      heatmap24h: hours
    };
  }

  private partnerList: PartnerUptimeItemDto[] = [
    {
      partnerId: 'partner-strava',
      partnerName: 'Strava API v3 Sync',
      category: 'DEVICE_SYNC',
      status: 'OPERATIONAL',
      uptime90d: 99.96,
      latencyMs: 42,
      hasActiveOutageBanner: false
    },
    {
      partnerId: 'partner-garmin',
      partnerName: 'Garmin Connect Health API',
      category: 'DEVICE_SYNC',
      status: 'OPERATIONAL',
      uptime90d: 99.91,
      latencyMs: 58,
      hasActiveOutageBanner: false
    },
    {
      partnerId: 'partner-coros',
      partnerName: 'Coros Training API',
      category: 'DEVICE_SYNC',
      status: 'OPERATIONAL',
      uptime90d: 99.89,
      latencyMs: 64,
      hasActiveOutageBanner: false
    },
    {
      partnerId: 'partner-zalo',
      partnerName: 'Zalo OA Cloud Gateway',
      category: 'COMMUNICATION',
      status: 'OPERATIONAL',
      uptime90d: 99.98,
      latencyMs: 18,
      hasActiveOutageBanner: false
    },
    {
      partnerId: 'partner-vietqr',
      partnerName: 'VietQR / NAPAS Banking Switch',
      category: 'PAYMENT_GATEWAY',
      status: 'OPERATIONAL',
      uptime90d: 99.95,
      latencyMs: 32,
      hasActiveOutageBanner: false
    }
  ];

  private partnerApiKeys: PartnerApiKeyDto[] = [
    {
      id: 'key-sarc-timing-01',
      name: 'SARC Timing Gate App (Hồ Tây)',
      keyPrefix: 'op_live_sarc_8f3a...',
      scopes: ['read:races', 'write:activities'],
      createdAt: '2026-10-15T08:00:00.000Z',
      lastUsedAt: '2026-11-07T06:30:00.000Z',
      status: 'ACTIVE'
    },
    {
      id: 'key-bavi-cp-02',
      name: 'Ba Vì Trail Mobile Checkpoint',
      keyPrefix: 'op_live_bavi_19cb...',
      scopes: ['read:races', 'read:leaderboard'],
      createdAt: '2026-10-20T10:00:00.000Z',
      lastUsedAt: '2026-11-06T18:45:00.000Z',
      status: 'ACTIVE'
    }
  ];

  public getPartnerEcosystem(): PartnerEcosystemDto {
    const activeOutageCount = this.partnerList.filter(p => p.status === 'OUTAGE').length;
    const totalUptime = this.partnerList.reduce((acc, p) => acc + p.uptime90d, 0);
    const overallSlaUptimePercent = parseFloat((totalUptime / this.partnerList.length).toFixed(2));

    return {
      partners: [...this.partnerList],
      overallSlaUptimePercent,
      activeOutageCount,
      apiKeys: [...this.partnerApiKeys]
    };
  }

  public generatePartnerApiKey(req: GenerateApiKeyRequestDto): PartnerApiKeyDto {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const newKey: PartnerApiKeyDto = {
      id: `key-${Date.now()}`,
      name: req.name || 'New Developer API Key',
      keyPrefix: `op_live_${randomHex}...`,
      scopes: req.scopes && req.scopes.length > 0 ? req.scopes : ['read:races'],
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.partnerApiKeys.push(newKey);
    return newKey;
  }

  public revokePartnerApiKey(keyId: string): PartnerApiKeyDto {
    const key = this.partnerApiKeys.find(k => k.id === keyId);
    if (!key) {
      throw new Error(`Partner API key ${keyId} not found`);
    }
    key.status = 'REVOKED';
    return { ...key };
  }

  public getSaasBillingIntelligence(): SaasBillingIntelligenceDto {
    return {
      monthlyRecurringRevenueVnd: 42500000,
      annualRunRateVnd: 510000000,
      churnRatePercent: 1.2,
      arpuVnd: 3540000,
      revenueBreakdown: {
        tenantSubscriptionsVnd: 28000000,
        racePlatformFeeVnd: 9500000,
        ticketCommissionVnd: 5000000
      },
      tierDistribution: {
        freeCount: 12,
        proCount: 8,
        enterpriseCount: 4
      },
      monthlyTrends: [
        { month: '06/2026', mrrVnd: 22000000, activeTenants: 14 },
        { month: '07/2026', mrrVnd: 26500000, activeTenants: 17 },
        { month: '08/2026', mrrVnd: 31000000, activeTenants: 19 },
        { month: '09/2026', mrrVnd: 35200000, activeTenants: 21 },
        { month: '10/2026', mrrVnd: 39000000, activeTenants: 23 },
        { month: '11/2026', mrrVnd: 42500000, activeTenants: 24 }
      ]
    };
  }

  private securityAnomalies: SecurityAnomalyDto[] = [
    {
      id: 'sec-ano-01',
      type: 'BRUTE_FORCE_AUTH',
      severity: 'CRITICAL',
      actorIp: '198.51.100.42',
      detectedAt: '2026-11-07T02:15:20.000Z',
      targetResource: '/api/auth/login (Admin Portal)',
      actionTaken: 'BLOCKED_IP',
      status: 'RESOLVED'
    },
    {
      id: 'sec-ano-02',
      type: 'UNAUTHORIZED_TREASURY_ACCESS',
      severity: 'HIGH',
      actorIp: '203.0.113.88',
      detectedAt: '2026-11-07T04:30:10.000Z',
      targetResource: '/api/club/finance/reconcile-settle',
      actionTaken: 'CHALLENGE_2FA',
      status: 'RESOLVED'
    },
    {
      id: 'sec-ano-03',
      type: 'MALICIOUS_SCAN',
      severity: 'MEDIUM',
      actorIp: '185.220.101.5',
      detectedAt: '2026-11-07T05:05:00.000Z',
      targetResource: '/.env /actuator /wp-admin',
      actionTaken: 'BLOCKED_IP',
      status: 'RESOLVED'
    }
  ];

  private immutableAuditLogs: ImmutableAuditLogDto[] = [
    {
      id: 'sec-log-01',
      timestamp: '2026-11-07T04:45:00.000Z',
      actor: 'admin@sarc.vn',
      actorIp: '118.70.14.88',
      action: 'BATCH_APPROVE_MODERATION',
      targetModule: 'TECHNICAL_MODERATION_HUB',
      payloadHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      previousRecordHash: '0000000000000000000000000000000000000000000000000000000000000000',
      verificationStatus: 'VERIFIED_TAMPER_FREE'
    },
    {
      id: 'sec-log-02',
      timestamp: '2026-11-07T05:12:00.000Z',
      actor: 'treasury@sarc.vn',
      actorIp: '118.70.14.88',
      action: 'SETTLE_TREASURY_DEBT',
      targetModule: 'FINANCIAL_TREASURY_HUB',
      payloadHashSha256: '7d1b54a20b0804b4081c7e0965e6480b9f29882a875a6c11d279cf44d75d2757',
      previousRecordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      verificationStatus: 'VERIFIED_TAMPER_FREE'
    }
  ];

  public getSecurityAuditHub(): SecurityAuditHubDto {
    const unresolvedAnomalyCount = this.securityAnomalies.filter(a => a.status === 'OPEN').length;
    const verifiedRecords = this.immutableAuditLogs.filter(l => l.verificationStatus === 'VERIFIED_TAMPER_FREE').length;

    return {
      anomalies: [...this.securityAnomalies],
      unresolvedAnomalyCount,
      auditTrail: [...this.immutableAuditLogs],
      tamperVerificationSummary: {
        totalRecords: this.immutableAuditLogs.length,
        verifiedRecords,
        isCompromised: false
      }
    };
  }

  public logAdminSecurityAction(
    actor: string,
    actorIp: string,
    action: string,
    targetModule: string,
    payload: any
  ): ImmutableAuditLogDto {
    const prevHash = this.immutableAuditLogs.length > 0
      ? this.immutableAuditLogs[this.immutableAuditLogs.length - 1].payloadHashSha256
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const payloadString = JSON.stringify(payload || {});
    const payloadHashSha256 = crypto.createHash('sha256').update(prevHash + payloadString + action).digest('hex');

    const newRecord: ImmutableAuditLogDto = {
      id: `sec-log-${Date.now()}-${this.immutableAuditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      actor,
      actorIp,
      action,
      targetModule,
      payloadHashSha256,
      previousRecordHash: prevHash,
      verificationStatus: 'VERIFIED_TAMPER_FREE'
    };

    this.immutableAuditLogs.push(newRecord);
    return newRecord;
  }

}
