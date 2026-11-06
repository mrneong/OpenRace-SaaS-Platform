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



