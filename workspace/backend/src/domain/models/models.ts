/**
 * OpenRace Domain Models (TypeScript)
 */

export interface RuleSet {
  version: number;
  allowedTypes: string[];
  allowManual: boolean;
  allowTrainer: boolean;
  minDistanceKm: number;
  paceMin: number;   // min/km (e.g. 4.0)
  paceMax: number;   // min/km (e.g. 10.0)
  paceFloor: number; // min/km (e.g. 2.75 -> 2:45)
  trailGainMinM: number;
  gainUnitM: number;
  distanceUnitKm: number;
  bonusMode: 'trail_only' | 'always';
  maxBonusKmPerActivity?: number;
  maxActivitiesPerDay: number;
  cycleType: 'weekly';
  targetKmPerCycle: number;
  penaltyPerMissVnd: number;
  graceHours: number;
  partialWeekPolicy: 'prorate' | 'skip' | 'full';
  scoringStrategy: 'sum_team_v1' | 'avg_per_member_v1' | 'multi_criteria_weighted';
  criteriaWeights?: {
    distance: number;
    diligentDays: number;
    elevationGain: number;
    paceQuality: number;
  };
  capDaysTeam: number;
  rankingPolicy: 'top1_then_tied_second' | 'standard';
  payoutTierRank1Vnd: number;
  payoutTierOtherVnd: number;
  timezone: string;
}

export function getDefaultRuleSet(): RuleSet {
  return {
    version: 1,
    allowedTypes: ['Run', 'TrailRun'],
    allowManual: false,
    allowTrainer: false,
    minDistanceKm: 3.0,
    paceMin: 4.0,
    paceMax: 10.0,
    paceFloor: 2.75,
    trailGainMinM: 100.0,
    gainUnitM: 100.0,
    distanceUnitKm: 1.0,
    bonusMode: 'trail_only',
    maxActivitiesPerDay: 2,
    cycleType: 'weekly',
    targetKmPerCycle: 20.0,
    penaltyPerMissVnd: 50000,
    graceHours: 6,
    partialWeekPolicy: 'prorate',
    scoringStrategy: 'sum_team_v1',
    capDaysTeam: 140,
    rankingPolicy: 'top1_then_tied_second',
    payoutTierRank1Vnd: 100000,
    payoutTierOtherVnd: 200000,
    timezone: 'Asia/Ho_Chi_Minh',
  };
}

export interface Activity {
  id: string;
  userId: string;
  stravaActivityId: string;
  sportType: string;
  startAt: Date;
  elapsedTimeS: number;
  movingTimeS: number;
  distanceM: number;
  elevationGainM: number;
  isManual?: boolean;
  isTrainer?: boolean;
  avgHeartRate?: number;
  avgCadence?: number;
  maxSpeedKmH?: number;
  deviceSource?: 'STRAVA' | 'GARMIN_CONNECT' | 'COROS';
  autoTrimmed?: boolean;
  trimmedDistanceKm?: number;
  originalDistanceKm?: number;
  autoTrimReason?: string;
  isTreadmillVerified?: boolean;
  status: 'active' | 'deleted';
}

export interface Race {
  id: string;
  clubId: string;
  name: string;
  slug: string;
  startAt: Date;
  endAt: Date;
  status: 'draft' | 'open' | 'running' | 'finalizing' | 'closed';
  scope?: 'internal' | 'community' | 'designated';
  maxParticipants?: number;
  rules: RuleSet;
}

export interface Team {
  id: string;
  raceId: string;
  name: string;
  avatarUrl?: string;
  slogan?: string;
  leaderUserId?: string;
  updatedBy?: string;
}

export interface RaceWhitelist {
  id: string;
  raceId: string;
  email?: string;
  userId?: string;
  note?: string;
  createdAt: Date;
}

export interface StravaSyncLog {
  id: string;
  userId: string;
  syncSource: 'webhook' | 'manual_resync' | 'historical_pull';
  stravaActivityId?: number;
  httpStatusCode: number;
  status: 'received' | 'processed' | 'ignored' | 'failed';
  errorMessage?: string;
  rawEventPayload?: any;
  createdAt: Date;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  activityId?: string;
  activityTitle?: string;
  distanceKm?: number;
  pace?: string;
  gainM?: number;
  raceId?: string;
  raceName?: string;
  caption: string;
  mediaUrls?: string[];
  kudosCount: number;
  commentCount: number;
  likedByMe?: boolean;
  comments?: CommunityComment[];
  createdAt: Date;
}

export interface EvaluationResult {
  activityId: string;
  raceId: string;
  userId: string;
  isValid: boolean;
  rejectCode?: string;
  rejectMessage?: string;
  rawDistanceKm: number;
  bonusDistanceKm: number;
  finalDistanceKm: number;
  startAt: Date;
  localDate: string;
}

export interface TeamScore {
  scoreDistance: number;
  scoreDiligent: number;
  totalScore: number;
}

export interface RankedTeam {
  teamId: string;
  name: string;
  totalKm: number;
  teamDays: number;
  scores: TeamScore;
  rank: number;
  rankLabel: string;
}

export interface ParticipantLedger {
  rankFeeVnd: number;
  penaltiesVnd: number;
  totalPaidVnd: number;
  balanceDueVnd: number;
  isSettled: boolean;
}

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  roleName: string;
  clubId?: string;
  clubName?: string;
  teamId?: string;
  teamName?: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
  lastLoginAt?: string;
  updatedAt?: string;
}

export interface SystemRole {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemDefault?: boolean;
  status: 'ACTIVE' | 'DEACTIVATED';
  userCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemConfigCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  parameterCount?: number;
}

export interface SystemConfigParameter {
  id: string;
  catalogCode: string;
  key: string;
  name: string;
  value: string;
  unit?: string;
  dataType: 'number' | 'string' | 'boolean' | 'json';
  description: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  updatedAt: string;
  updatedBy?: string;
}

export interface CustomPlatformParam {
  id: string;
  key: string;
  name: string;
  value: string;
  description: string;
  status: 'ACTIVE' | 'DEACTIVATED';
}

export interface PlatformConfig {
  // 1. Nhận Diện & Thương Hiệu (Brand & Identity)
  appName: string;
  brandTag: string;
  slogan: string;
  version: string;
  logoPreset: string;
  logoUrl?: string;
  copyright: string;

  // 2. Giao Diện & Vùng Miền (UI/UX & Regional)
  defaultTheme: 'mantis' | 'sport';
  colorMode: 'auto' | 'light' | 'dark';
  language: 'vi-VN' | 'en-US';
  timezone: string;
  distanceUnit: 'km' | 'mi';
  currency: 'VND' | 'USD';

  // 3. Hỗ Trợ, Pháp Lý & GDPR (Support & Legal)
  supportEmail: string;
  hotline: string;
  tosUrl: string;
  privacyUrl: string;
  gdprExportEnabled: boolean;

  // 4. Tích Hợp & Vận Hành Toàn Sàn (Integration & Operations)
  stravaAutoSync: boolean;
  wearablesApi: boolean;
  vietqrAutoReconcile: boolean;
  weeklyCutoffSchedule: string;

  // Tùy biến mở rộng
  customParameters: CustomPlatformParam[];
  updatedAt?: string;
  updatedBy?: string;
}

// ==========================================
// PRO RUNNER DASHBOARD DOMAIN MODELS
// ==========================================

export interface HeartRateZone {
  zone: number;
  name: string;
  rangeBpm: string;
  minutesLast7Days: number;
  percentage: number;
}

export interface TrainingLoadRecovery {
  athleteId: string;
  trainingStatus: 'Productive' | 'Peaking' | 'Overreaching' | 'Recovery' | 'Maintaining';
  trainingStatusLabel: string;
  loadRatio: number; // Acute-to-Chronic Workload Ratio (ACWR e.g. 1.14)
  loadRatioStatus: 'optimal' | 'high' | 'low';
  acuteLoad: number;
  chronicLoad: number;
  recoveryHours: number;
  vo2Max: number;
  vo2MaxFitnessCategory: string;
  predictedRaceTimes: {
    race5k: string;
    race10k: string;
    halfMarathon21k: string;
    marathon42k: string;
  };
  hrZonesLast7Days: HeartRateZone[];
  lastSyncAt: string;
  sourceDevice: string;
}

export interface RunningShoe {
  id: string;
  userId: string;
  brand: string;
  name: string;
  category: 'race_day' | 'tempo_interval' | 'daily_trainer' | 'trail';
  categoryLabel: string;
  currentDistanceKm: number;
  maxDistanceKm: number;
  isDefault: boolean;
  status: 'ACTIVE' | 'RETIRED' | 'WARNING_REPLACE';
  warningLevel: 'SAFE' | 'CAUTION' | 'REPLACE'; // Green <70%, Yellow 70-90%, Red >=90%
  percentUsed: number;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionPlanInput {
  distanceKm: number;
  paceMinPerKm: number;
  temperatureC?: number;
  humidity?: number;
  runnerWeightKg?: number;
}

export interface NutritionPlanResult {
  estimatedDurationMinutes: number;
  estimatedDurationFormatted: string;
  estimatedCaloriesBurned: number;
  recommendedWaterMl: number;
  recommendedElectrolyteMg: number;
  recommendedGelCount: number;
  intakeSchedule: {
    hydrationIntervalMin: number;
    waterPerIntervalMl: number;
    gelIntervalMin: number;
    tips: string[];
  };
  weatherAdjustmentNote: string;
}

export interface DigitalBadge {
  id: string;
  code: string;
  title: string;
  category: 'DISTANCE' | 'STREAK' | 'RACE' | 'TRAIL';
  icon: string;
  description: string;
  achievedAt: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  verificationHash: string;
}

export interface RunnerMilestonesStreak {
  athleteId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  seasonTotalKm: number;
  nextMilestoneKm: number;
  remainingKmToMilestone: number;
  milestoneProgressPercent: number;
  milestoneTitle: string;
  recentBadges: DigitalBadge[];
}

/**
 * [Subsystem 6.0] Club Admin & Captain Dashboard (Club Admin Portal)
 * Action-First Operational Architecture
 */
export interface ClubAdminKPIs {
  memberCount: number; // Sĩ số hiện tại (e.g. 48)
  targetMembers: number; // Sức chứa mục tiêu (e.g. 50)
  treasuryCollectedVnd: number; // Quỹ thực thu (e.g. 4,800,000)
  treasuryTargetVnd: number; // Quỹ kế hoạch (e.g. 5,000,000)
  pendingReviewCount: number; // Số bài chạy chờ duyệt (e.g. 5)
  pendingReviewWarning: boolean; // Cảnh báo đỏ nếu > 10 bài
  outstandingDebtVnd: number; // Dư nợ quỹ / Phạt tồn đọng (e.g. 50,000)
  outstandingDebtWarning: boolean; // Cảnh báo đỏ nếu nợ quá 3 ngày
  penaltyCount: number; // Số thẻ phạt / vi phạm (e.g. 0)
  openDisputesCount: number; // Số đơn khiếu nại chưa xử lý (e.g. 1)
  openDisputesWarning: boolean; // Cảnh báo đỏ nếu tồn tại đơn > 24h
  weeklyCompletionRatePercent: number; // Tỷ lệ hoàn thành tuần (e.g. 68.5%)
  weeklyCompletionWarning: boolean; // Cảnh báo đỏ nếu < 70%
}

export interface PendingActivityQueueItem {
  id: string; // e.g. ACT_000075
  athleteId: string;
  athleteName: string;
  athleteAvatar: string;
  teamName: string;
  sportType: 'Run' | 'TrailRun' | 'Treadmill' | string;
  distanceKm: number;
  movingTimeMinutes: number;
  paceMinPerKm: string;
  elevationGainM: number;
  heartRateAvgBpm: number;
  syncSource: 'Strava' | 'Garmin Direct' | 'Coros Direct';
  submittedAt: string;
  validityVerdict: string; // e.g. "Hợp lệ - Dốc đạt chuẩn Trail 260m"
  status: 'pending' | 'approved' | 'rejected';
  selected?: boolean;
}

export interface ClubDisputeQueueItem {
  id: string; // e.g. DISP_2026_001
  activityId: string; // ACT_000073
  athleteId: string;
  athleteName: string;
  teamName: string;
  originalDistanceKm: number; // 2.4
  appealReason: string;
  hoursOpen: number; // 26.5
  isOverdue: boolean; // true if > 24h
  status: 'open' | 'resolved_bonus' | 'rejected';
  bonusKmGranted?: number;
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface ClubReconciliationItem {
  id: string; // e.g. LEDG_001
  memberId: string;
  memberName: string;
  teamName: string;
  amountVnd: number; // 50,000
  reason: string; // Phạt trễ tiến độ tuần 19 (<15km)
  daysOverdue: number; // 4
  status: 'unpaid' | 'paid' | 'reminded';
  vietQrUrl?: string;
  lastRemindedAt?: string;
  settledAt?: string;
}

export interface ClubBroadcastMessage {
  id: string;
  clubId: string;
  title: string;
  content: string;
  templateKey?: string;
  targetChannel: 'all' | 'zalo' | 'in_app' | 'email';
  senderName: string;
  sentAt: string;
  deliveryCount: number;
  sentChannels?: string[];
}

export interface OpenRaceAdminItem {
  id: string;
  name: string;
  scope: 'club' | 'community';
  status: 'live' | 'upcoming';
  statusText: string;
  enrolledCount: number;
  totalSlots: number;
  fillRatePercent: number;
  endDate: string;
  daysRemaining: number;
  landingSlug: string;
}

export interface HeatmapBlockItem {
  timeBlock: string; // e.g. "05:00 - 08:00 (Sáng sớm)"
  dailyCounts: number[]; // [T2, T3, T4, T5, T6, T7, CN]
}

export interface ChurnRiskRunnerItem {
  id: string;
  athleteName: string;
  teamName: string;
  inactiveDays: number;
  lastActivityDate: string;
  riskLevel: 'medium' | 'high' | 'critical';
  reason: string;
  phone: string;
  status: 'pending_reminder' | 'reminded';
}

export interface ClubPulseAnalyticsDto {
  totalActiveRunners: number; // 128
  totalWeeklyRuns: number; // 512
  peakHours: string; // "Thứ Bảy & Chủ Nhật (05:00 - 07:30)"
  daysHeader: string[]; // ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
  blocks: HeatmapBlockItem[];
  churnWatchlist: ChurnRiskRunnerItem[];
}

export interface TeamStandingQuickView {
  rank: number;
  teamId: string;
  teamName: string;
  captainName: string;
  completionRatePercent: number;
  totalKm: number;
  activeRunnersCount: number;
  maxRunnersCount: number;
  status: 'leading' | 'contending' | 'chasing';
  statusBadge: string;
}

export interface ClubAdminDashboardDto {
  clubId: string;
  clubName: string;
  seasonName: string;
  seasonStatus: string; // "Đang chạy (Tuần 20)"
  currentWeek: number; // 20
  kpis: ClubAdminKPIs;
  pendingActivities: PendingActivityQueueItem[];
  disputes: ClubDisputeQueueItem[];
  reconciliations: ClubReconciliationItem[];
  teamStandings: TeamStandingQuickView[];
  recentBroadcasts: ClubBroadcastMessage[];
  openRaces?: OpenRaceAdminItem[];
  pulseAnalytics?: ClubPulseAnalyticsDto;
  churnWatchlist?: ChurnRiskRunnerItem[];
  activeRolePerspective?: string;
}

// ==========================================
// [Navigation Ecosystem] Role-Based Portals & Menu Models
// ==========================================

export type PortalRoleId = 'runner' | 'club' | 'captain' | 'admin' | 'all';

export interface PortalRoleDefinition {
  id: PortalRoleId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  badgeColor: string;
}

export interface NavigationMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  tabId: string;
  sectionId?: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  roles: PortalRoleId[];
  action?: string;
}

export interface NavigationGroup {
  id: string;
  roleId: PortalRoleId;
  title: string;
  shortTitle: string;
  description: string;
  badge?: string;
  items: NavigationMenuItem[];
}

export interface UserNavigationContext {
  userId: string;
  userName: string;
  userRole: string;
  activeRole: PortalRoleId;
  availableRoles: PortalRoleDefinition[];
  groups: NavigationGroup[];
  totalMenuItems: number;
}

// ==========================================
// [Race Dashboard] Multi-Selection Tournament Ecosystem Models
// ==========================================

export interface RaceSelectorItem {
  id: string;
  slug: string;
  name: string;
  season: string;
  clubId: string;
  clubName: string;
  status: 'running' | 'upcoming' | 'completed';
  statusBadge: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  teamsCount: number;
  totalKm: number;
  targetKm: number;
  isUserJoined: boolean;
  userRank?: number;
  bannerUrl?: string;
}

export interface RaceKpiSummary {
  raceId: string;
  raceName: string;
  totalAthletes: number;
  totalTeams: number;
  athletesByClubOrTeam: { name: string; count: number }[];
  totalAccumulatedKm: number;
  targetKm: number;
  progressPercent: number; // e.g. 77.1
  completionRatePercent: number; // e.g. 84.5
  totalPrizePoolVnd: number; // e.g. 15,000,000
  totalPenaltiesVnd: number; // e.g. 2,400,000
  unpaidDebtVnd: number; // e.g. 450,000
}

export interface RaceDailyDistancePoint {
  date: string;
  dayOfWeek: string;
  distanceKm: number;
  isPeakDay: boolean; // weekend Long Run
  activityCount: number;
}

export interface RaceActivityTypeDistribution {
  roadKm: number;
  roadPercent: number;
  trailKm: number;
  trailPercent: number;
  treadmillKm: number;
  treadmillPercent: number;
  totalActivities: number;
}

export interface RaceTeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  medal: 'GOLD' | 'SILVER' | 'BRONZE' | 'HONOR';
  medalIcon: string;
  totalKm: number;
  activeRunners: number;
  completionRate: number;
}

export interface RaceIndividualLeader {
  rank: number;
  userId: string;
  athleteName: string;
  teamName: string;
  totalKm: number;
  activitiesCount: number;
  avgPace: string;
  streakDays: number;
}

export interface RaceSuspiciousViolationQueueItem {
  id: string;
  raceId: string;
  activityId: string;
  userId: string;
  athleteName: string;
  date: string;
  distanceKm: number;
  pace: string;
  elevationGainM: number;
  flagType: 'MOTORBIKE_SPEED' | 'IMPLAUSIBLE_PACE' | 'SUSPICIOUS_TRAIL_GAIN' | 'OVERLAPPING_TIME';
  flagBadge: string;
  details: string;
  status: 'PENDING_REFEREE' | 'REVIEWED' | 'DISMISSED';
}

export interface RaceDashboardOverviewDto {
  raceInfo: RaceSelectorItem;
  kpis: RaceKpiSummary;
  dailyAnalytics: RaceDailyDistancePoint[];
  activityDistribution: RaceActivityTypeDistribution;
  top5Teams: RaceTeamStanding[];
  top10Individuals: RaceIndividualLeader[];
  violationQueue: RaceSuspiciousViolationQueueItem[];
  lastUpdated: string;
}

export interface RaceExportReportDto {
  raceId: string;
  raceName: string;
  generatedAt: string;
  generatedBy: string;
  finishersCount: number;
  teamsRankings: RaceTeamStanding[];
  individualRankings: RaceIndividualLeader[];
  auditLogsSummary: { totalAudited: number; pendingViolations: number; approvedAppeals: number };
  csvFinisherContent: string;
}

// ==========================================
// [Dynamic Setup Wizard] Multi-Step Race Configuration & Scoring Models (AC-RACE-WIZARD-STEP1-01 to 05)
// ==========================================

export type ParticipantScope = 'internal' | 'community' | 'designated' | 'INTERNAL_CLUB' | 'OPEN_COMMUNITY' | 'DESIGNATED_INVITE';
export type ScoringMethod = 'distance' | 'pace_weighted' | 'streak_bonus' | 'DISTANCE_BASED' | 'PACE_WEIGHTED' | 'STREAK_BONUS';
export type IndividualRankingCriteria = 'distance' | 'score_points' | 'avg_pace' | 'TOTAL_DISTANCE' | 'TOTAL_SCORE' | 'AVG_PACE';
export type TeamRankingMethod = 'cumulative_total' | 'team_average' | 'top_active_n' | 'TOTAL_AGGREGATE' | 'AVERAGE_PER_RUNNER' | 'TOP_ACTIVE_N';

export interface AwardCategoryItem {
  id: string;
  code?: string;
  name?: string;
  categoryName?: string;
  targetType: 'individual_male' | 'individual_female' | 'team' | 'special' | 'INDIVIDUAL_MALE' | 'INDIVIDUAL_FEMALE' | 'TEAM' | 'STREAK' | 'TRAIL_ELEVATION' | string;
  criteria?: string;
  rankCount?: number;
  prizeDescription: string;
  prizeValueVnd?: number;
  cashPrizes?: { rank1: number; rank2: number; rank3: number };
  medalType?: 'gold' | 'silver' | 'bronze' | 'special_trophy' | 'nft_electronic' | string;
  nftMetadataHash?: string;
  antiCounterfeitProof?: string;
  antiCounterfeitTokenId?: string;
  trophyIncluded?: boolean;
  hallOfFameShowcase?: boolean;
}

export interface AutoCalculatedAwardWinner {
  categoryId: string;
  categoryName: string;
  targetType: string;
  rank: number;
  winnerName: string;
  winnerTeam?: string;
  scoreOrDistance: string;
  prizeDescription: string;
  awardedAt: string;
  cashPrizeVnd?: number;
  medalType?: 'gold' | 'silver' | 'bronze' | 'special_trophy' | string;
  nftMetadataHash?: string;
  antiCounterfeitTokenId?: string;
  certificateNumber?: string;
  digitalSignatureSha256?: string;
  verificationQrUrl?: string;
  hallOfFameShowcase?: boolean;
  certifiedBy?: string;
}

export interface DynamicRaceSetupConfig {
  id: string;
  name: string;
  slug: string;
  landingUrl: string;
  scope: ParticipantScope;
  scopeLabel?: string;
  registrationWindow: {
    startDate: string;
    endDate: string;
    isOpen: boolean;
  };
  raceWindow: {
    startDate: string;
    endDate: string;
    isLive: boolean;
  };
  bannerVisuals: {
    bannerUrl: string;
    logoUrl: string;
    slogan: string;
    countdownEnabled: boolean;
  };
  teamCapacity: {
    minRunners: number;
    maxRunners: number;
    allowFreeAgent: boolean;
    allocationRule: string; // e.g. 'BALANCED_PACE', 'FREE_AGENT_ROUND_ROBIN'
  };
  memberTiers: string[]; // e.g. ['PRO_ATHLETE', 'FUN_RUNNER', 'NEWBIE_ROOKIE']
  scoringModel: {
    method: ScoringMethod;
    terrainFactors: Record<string, number>; // road: 1.0, trail: 1.5, treadmill: 0.8, track: 1.1
    antiCheatRules: {
      paceFloor: string; // e.g. "2:45"
      autoTrimTail: boolean;
      maxSingleRunKm: number; // 42.2
    };
    elevationBonus: {
      enabled: boolean;
      bonusKmPer100mGain: number; // e.g. 1.0 km / 100m D+
    };
    streakBonusPercent: number; // e.g. 20%
  };
  rankingMechanics: {
    individualCriteria: IndividualRankingCriteria;
    teamRankingMethod: TeamRankingMethod;
    topActiveNCount?: number; // e.g. 5
  };
  awardStructure: {
    categories: AwardCategoryItem[];
    autoCalculateWinners: boolean;
    autoTriggerOnRaceEnd?: boolean;
    hallOfFameActive?: boolean;
    antiCheatReconciled?: boolean;
  };
  calculatedWinners?: AutoCalculatedAwardWinner[];
  frozenLedger?: {
    isFrozen: boolean;
    frozenAt: string;
    totalCashDisbursedVnd: number;
    certificatesIssuedCount: number;
    digitalSignatureLedger: string;
  };
  status: 'draft' | 'published' | 'frozen';
  createdAt: string;
  updatedAt?: string;
}

export interface RaceTemplatePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  targetType: 'MONTHLY_INTERNAL' | 'TRAIL_ELEVATION' | 'EKIDEN_RELAY' | 'CUSTOM' | string;
  config: Partial<DynamicRaceSetupConfig>;
  usageCount: number;
}

export interface AdminRaceHubItem {
  id: string;
  name: string;
  slug: string;
  landingUrl: string;
  scope: string;
  scopeLabel: string;
  status: 'live' | 'upcoming' | 'frozen' | 'archived';
  statusLabel: string;
  statusColor: string;
  raceDates: string;
  runnersCount: number;
  totalDistanceKm: number;
  totalPrizeVnd: number;
  championTeam?: string;
  ledgerSignature?: string;
  qrCodeUrl?: string;
  quickActions?: {
    canViewLanding: boolean;
    canEditWizard: boolean;
    canExportExcel: boolean;
    canFreeze: boolean;
  };
}

export interface AdminRaceHubResponse {
  summary: {
    totalRaces: number;
    activeCount: number;
    frozenCount: number;
    totalRunners: number;
    totalPrizeDisbursedVnd: number;
  };
  activeAndUpcoming: AdminRaceHubItem[];
  frozenArchives: AdminRaceHubItem[];
  templates: RaceTemplatePreset[];
}







