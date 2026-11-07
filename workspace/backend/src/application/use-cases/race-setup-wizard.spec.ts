/**
 * Dynamic Race Setup Wizard & Platform Master Catalogs Unit Tests
 * Tests Acceptance Criteria:
 * - [AC-RACE-WIZARD-STEP1-01]: General Race Information & Dynamic Landing Page Slug
 * - [AC-RACE-WIZARD-STEP2-02]: Member Management, Squad Capacity & Tier Allocation
 * - [AC-RACE-WIZARD-STEP3-03]: Multi-dimensional Scoring, Hard Pace Floor & Elevation Bonus
 * - [AC-RACE-WIZARD-STEP4-04]: Leaderboard Mechanics (Individual & 3 Team Methods)
 * - [AC-RACE-WIZARD-STEP5-05]: Standard Awards Structure & Automated Calculation on Race Freeze
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { ClubHubUseCase } from './club-hub.use-case';
import { AdminManagementUseCase } from './admin-management.use-case';

export function runRaceSetupWizardTests(runner: any) {
  runner.suite('Dynamic Race Setup Wizard & Catalogs (AC-RACE-WIZARD-STEP1-01 to 05)', () => {
    const store = new InMemoryDataStore();
    const clubUseCase = new ClubHubUseCase(store);
    const adminUseCase = new AdminManagementUseCase(store);

    runner.test('AC-RACE-WIZARD-STEP1-01: Step 1 General Info & Landing Page with Auto Slug and 3 Scopes', () => {
      // 1. Check catalogs for Wizard Step 1
      const catalogs = clubUseCase.getRaceWizardCatalogs();
      runner.expect(catalogs.totalStandardCatalogs).toBe(5);
      runner.expect(catalogs.allMasterCatalogs.length).toBe(9);

      // 2. Create a race with auto slug and scope INTERNAL_CLUB
      const created = clubUseCase.createDynamicRace({
        name: 'Hà Nội Sunset Relay 2027',
        scope: 'INTERNAL_CLUB',
        registrationWindow: { startDate: '2027-02-01', endDate: '2027-02-28', isOpen: true },
        raceWindow: { startDate: '2027-03-01', endDate: '2027-03-31', isLive: false },
        bannerVisuals: {
          bannerUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200',
          logoUrl: '🌅',
          slogan: 'Hoàng hôn rực rỡ - Vững bước kiên cường',
          countdownEnabled: true
        }
      });

      runner.expect(created.slug).toBe('ha-noi-sunset-relay-2027');
      runner.expect(created.landingUrl).toBe('https://openrace.vn/g/ha-noi-sunset-relay-2027');
      runner.expect(created.scope).toBe('INTERNAL_CLUB');
      runner.expect(created.bannerVisuals.countdownEnabled).toBe(true);

      // Verify fetch by slug or ID
      const fetched = clubUseCase.getDynamicRaceSetup(created.slug);
      runner.expect(fetched.name).toBe('Hà Nội Sunset Relay 2027');
    });

    runner.test('AC-RACE-WIZARD-STEP2-02: Step 2 Squad Capacity Limits, Free-Agent & Master Tiers', () => {
      const catalogs = clubUseCase.getRaceWizardCatalogs();
      const tiers = catalogs.athleteTiers;
      const allocRules = catalogs.teamAllocationRules;

      // Master catalogs validation
      runner.expect(tiers.length >= 5).toBe(true);
      runner.expect(tiers.some((t: any) => t.key === 'TIER_PRO')).toBe(true);
      runner.expect(tiers.some((t: any) => t.key === 'TIER_OFFICE')).toBe(true);
      runner.expect(tiers.some((t: any) => t.key === 'TIER_PLANT')).toBe(true);

      runner.expect(allocRules.length >= 4).toBe(true);
      runner.expect(allocRules.some((r: any) => r.key === 'ALLOC_BALANCED_PACE')).toBe(true);
      runner.expect(allocRules.some((r: any) => r.key === 'ALLOC_FREE_AGENT')).toBe(true);

      // Create race with custom squad capacity & tiers
      const created = clubUseCase.createDynamicRace({
        name: 'Đà Nẵng Coastal Challenge 2027',
        scope: 'OPEN_COMMUNITY',
        teamCapacity: {
          minRunners: 6,
          maxRunners: 12,
          allowFreeAgent: true,
          allocationRule: 'ALLOC_BALANCED_PACE'
        },
        memberTiers: ['PRO_ATHLETE', 'FUN_RUNNER', 'PLANT_TIER']
      });

      runner.expect(created.teamCapacity.minRunners).toBe(6);
      runner.expect(created.teamCapacity.maxRunners).toBe(12);
      runner.expect(created.teamCapacity.allowFreeAgent).toBe(true);
      runner.expect(created.memberTiers.includes('PLANT_TIER')).toBe(true);
    });

    runner.test('AC-RACE-WIZARD-STEP3-03: Step 3 Multi-Dimensional Scoring, Hard Floor Pace & D+ Elevation Bonus', () => {
      const catalogs = clubUseCase.getRaceWizardCatalogs();
      const terrainConfigs = catalogs.terrainScoring;
      const antiCheatConfigs = catalogs.antiCheatRules;

      // Master catalogs verification
      const roadFactor = terrainConfigs.find((c: any) => c.key === 'FACTOR_ROAD');
      const trailFactor = terrainConfigs.find((c: any) => c.key === 'FACTOR_TRAIL');
      runner.expect(Number(roadFactor?.value)).toBe(1.0);
      runner.expect(Number(trailFactor?.value)).toBe(1.5);

      const hardFloor = antiCheatConfigs.find((c: any) => c.key === 'HARD_PACE_FLOOR');
      runner.expect(hardFloor?.value).toBe('2:45');

      const dPlusBonus = antiCheatConfigs.find((c: any) => c.key === 'TRAIL_ELEVATION_BONUS');
      runner.expect(Number(dPlusBonus?.value)).toBe(1.0);

      // Create dynamic race with custom scoring configuration
      const created = clubUseCase.createDynamicRace({
        name: 'Sapa Ultra Trail 2027',
        scoringModel: {
          method: 'PACE_WEIGHTED',
          terrainFactors: { road: 1.0, trail: 1.8, treadmill: 0.7, track: 1.0 },
          antiCheatRules: { paceFloor: '2:45', autoTrimTail: true, maxSingleRunKm: 80 },
          elevationBonus: { enabled: true, bonusKmPer100mGain: 1.5 },
          streakBonusPercent: 25
        }
      });

      runner.expect(created.scoringModel.method).toBe('PACE_WEIGHTED');
      runner.expect(created.scoringModel.terrainFactors['trail']).toBe(1.8);
      runner.expect(created.scoringModel.antiCheatRules.paceFloor).toBe('2:45');
      runner.expect(created.scoringModel.elevationBonus.bonusKmPer100mGain).toBe(1.5);
      runner.expect(created.scoringModel.streakBonusPercent).toBe(25);
    });

    runner.test('AC-RACE-WIZARD-STEP4-04: Step 4 Leaderboard Mechanics (Individual & 3 Team Methods)', () => {
      // Test Team Ranking Method 1: TOTAL_AGGREGATE
      const raceTotal = clubUseCase.createDynamicRace({
        name: 'Giải Tổng Hợp Toàn Đoàn 2027',
        rankingMechanics: {
          individualCriteria: 'TOTAL_DISTANCE',
          teamRankingMethod: 'TOTAL_AGGREGATE',
          topActiveNCount: 5
        }
      });
      runner.expect(raceTotal.rankingMechanics.teamRankingMethod).toBe('TOTAL_AGGREGATE');

      // Test Team Ranking Method 2: AVERAGE_PER_RUNNER
      const raceAvg = clubUseCase.createDynamicRace({
        name: 'Giải Điểm Bình Quân Thành Viên 2027',
        rankingMechanics: {
          individualCriteria: 'TOTAL_SCORE',
          teamRankingMethod: 'AVERAGE_PER_RUNNER',
          topActiveNCount: 5
        }
      });
      runner.expect(raceAvg.rankingMechanics.teamRankingMethod).toBe('AVERAGE_PER_RUNNER');

      // Test Team Ranking Method 3: TOP_ACTIVE_N
      const raceTopN = clubUseCase.createDynamicRace({
        name: 'Giải Top 5 Mũi Nhọn 2027',
        rankingMechanics: {
          individualCriteria: 'AVG_PACE',
          teamRankingMethod: 'TOP_ACTIVE_N',
          topActiveNCount: 5
        }
      });
      runner.expect(raceTopN.rankingMechanics.teamRankingMethod).toBe('TOP_ACTIVE_N');
      runner.expect(raceTopN.rankingMechanics.topActiveNCount).toBe(5);
    });

    runner.test('AC-RACE-WIZARD-STEP5-05: Step 5 Standard Awards Structure & Automated Calculation on Race Freeze', () => {
      const catalogs = clubUseCase.getRaceWizardCatalogs();
      const stdAwards = catalogs.standardAwards;

      runner.expect(stdAwards.length >= 5).toBe(true);
      runner.expect(stdAwards.some((a: any) => a.key === 'AWARD_TOP_MALE')).toBe(true);
      runner.expect(stdAwards.some((a: any) => a.key === 'AWARD_TOP_FEMALE')).toBe(true);
      runner.expect(stdAwards.some((a: any) => a.key === 'AWARD_TOP_TEAMS')).toBe(true);
      runner.expect(stdAwards.some((a: any) => a.key === 'AWARD_STREAK_HERO')).toBe(true);
      runner.expect(stdAwards.some((a: any) => a.key === 'AWARD_KING_OF_TRAIL')).toBe(true);

      // Execute Automated Award Calculation for default Season 10
      const awardResult = clubUseCase.calculateRaceAwards('race-season-10');
      runner.expect(awardResult.success).toBe(true);
      runner.expect(awardResult.raceId).toBe('race-season-10');
      runner.expect(awardResult.winnersCount).toBe(11);
      runner.expect(awardResult.winners.length).toBe(11);

      // Verify specific winners
      const teamWinner = awardResult.winners.find((w: any) => w.targetType === 'TEAM' && w.rank === 1);
      runner.expect(teamWinner?.winnerName).toBe('Team Phoenix SARC');

      const maleChamp = awardResult.winners.find((w: any) => w.targetType === 'INDIVIDUAL_MALE' && w.rank === 1);
      runner.expect(maleChamp?.winnerName).toBe('Nguyễn Văn A');

      const femaleChamp = awardResult.winners.find((w: any) => w.targetType === 'INDIVIDUAL_FEMALE' && w.rank === 1);
      runner.expect(femaleChamp?.winnerName).toBe('Trần Thị B');

      const streakHero = awardResult.winners.find((w: any) => w.targetType === 'STREAK');
      runner.expect(streakHero?.winnerName).toBe('Nguyễn Văn A');

      const trailKing = awardResult.winners.find((w: any) => w.targetType === 'TRAIL_ELEVATION');
      runner.expect(trailKing?.winnerName).toBe('Trần Thị B');

      // Verify race status is now frozen
      const frozenConfig = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(frozenConfig.status).toBe('frozen');
      runner.expect(frozenConfig.calculatedWinners?.length).toBe(11);
    });
  });
}
