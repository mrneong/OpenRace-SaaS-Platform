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
  ClubAdminDashboardDto
} from '../../domain/models/models';

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

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
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
    };
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
    targetChannel?: 'all' | 'zalo' | 'in_app';
    senderName?: string;
  }): ClubBroadcastMessage {
    const newBroadcast: ClubBroadcastMessage = {
      id: `BCST_${Date.now()}`,
      clubId: msg.clubId || 'club-sarc-sadc',
      title: msg.title,
      content: msg.content,
      templateKey: msg.templateKey,
      targetChannel: msg.targetChannel || 'all',
      senderName: msg.senderName || 'Ban Điều Hành SARC',
      sentAt: new Date().toISOString(),
      deliveryCount: 48,
    };
    this.clubBroadcasts.unshift(newBroadcast);
    return newBroadcast;
  }

  lockSeasonWeek(weekNumber: number = 20): { week: number; isLocked: boolean; lockedAt: string; totalKm: number } {
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
    };
  }
}
