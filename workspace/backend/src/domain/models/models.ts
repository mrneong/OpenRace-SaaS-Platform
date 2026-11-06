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

