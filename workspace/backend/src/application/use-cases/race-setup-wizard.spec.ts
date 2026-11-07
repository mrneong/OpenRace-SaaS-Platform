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

    runner.test('AC-AWARDS-CONFIG-01: Standardized 5 Categories Configuration with Multi-Tier Cash Prizes, NFT Anti-counterfeiting & Hall of Fame', () => {
      const race = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(!!race).toBe(true);
      runner.expect(!!race.awardStructure).toBe(true);
      runner.expect(race.awardStructure.categories.length).toBe(5);

      const topMale = race.awardStructure.categories.find((c: any) => c.targetType === 'INDIVIDUAL_MALE');
      runner.expect(!!topMale).toBe(true);
      runner.expect(topMale?.rankCount).toBe(3);
      runner.expect(topMale?.cashPrizes?.rank1).toBe(3000000);
      runner.expect(topMale?.cashPrizes?.rank2).toBe(2000000);
      runner.expect(topMale?.cashPrizes?.rank3).toBe(1000000);
      runner.expect(topMale?.antiCounterfeitTokenId).toBe('NFT-SARC-2026-MALE-01');

      const topFemale = race.awardStructure.categories.find((c: any) => c.targetType === 'INDIVIDUAL_FEMALE');
      runner.expect(!!topFemale).toBe(true);
      runner.expect(topFemale?.rankCount).toBe(3);
      runner.expect(topFemale?.cashPrizes?.rank1).toBe(3000000);
      runner.expect(topFemale?.cashPrizes?.rank2).toBe(2000000);
      runner.expect(topFemale?.cashPrizes?.rank3).toBe(1000000);
      runner.expect(topFemale?.antiCounterfeitTokenId).toBe('NFT-SARC-2026-FEMALE-01');

      const topTeam = race.awardStructure.categories.find((c: any) => c.targetType === 'TEAM');
      runner.expect(!!topTeam).toBe(true);
      runner.expect(topTeam?.rankCount).toBe(3);
      runner.expect(topTeam?.cashPrizes?.rank1).toBe(5000000);
      runner.expect(topTeam?.cashPrizes?.rank2).toBe(3000000);
      runner.expect(topTeam?.cashPrizes?.rank3).toBe(2000000);
      runner.expect(topTeam?.hallOfFameShowcase).toBe(true);

      const streak = race.awardStructure.categories.find((c: any) => c.targetType === 'STREAK');
      runner.expect(streak?.prizeValueVnd).toBe(1500000);
      runner.expect(streak?.prizeDescription?.includes('gỗ')).toBe(true);

      const trail = race.awardStructure.categories.find((c: any) => c.targetType === 'TRAIL_ELEVATION');
      runner.expect(trail?.prizeValueVnd).toBe(1500000);
      runner.expect(trail?.prizeDescription?.includes('Trail King')).toBe(true);
    });

    runner.test('AC-AWARDS-ENGINE-02: Automated Calculation Engine with Anti-cheat reconciliation, Frozen Ledger & Digital Signatures', () => {
      const awardResult = clubUseCase.calculateRaceAwards('race-season-10');
      runner.expect(awardResult.success).toBe(true);
      runner.expect(awardResult.winnersCount).toBe(11);
      runner.expect(awardResult.totalCashDisbursedVnd).toBe(25000000);
      runner.expect(awardResult.digitalSignatureLedger.startsWith('LEDGER-SIG-')).toBe(true);

      runner.expect(awardResult.winners.length).toBe(11);
      awardResult.winners.forEach((winner: any) => {
        runner.expect(!!winner.certificateNumber).toBe(true);
        runner.expect(winner.certificateNumber.startsWith('CERT-SARC-2026-')).toBe(true);
        runner.expect(!!winner.digitalSignatureSha256).toBe(true);
        runner.expect(winner.digitalSignatureSha256.startsWith('SIG-SHA256-')).toBe(true);
        runner.expect(winner.cashPrizeVnd > 0).toBe(true);
        runner.expect(!!winner.verificationQrUrl).toBe(true);
      });

      // Verify Frozen Ledger state in storage
      const race = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(race.status).toBe('frozen');
      runner.expect(race.frozenLedger?.isFrozen).toBe(true);
      runner.expect(race.frozenLedger?.totalCashDisbursedVnd).toBe(25000000);
      runner.expect(race.frozenLedger?.digitalSignatureLedger.startsWith('LEDGER-SIG-')).toBe(true);
    });

    runner.test('AC-RACE-SETUP-HUB-01: Active & Completed Races Hub replacing static simulator', () => {
      const hub = clubUseCase.getAdminRaceHub();
      runner.expect(!!hub).toBe(true);
      runner.expect(hub.summary.totalRaces).toBe(5);
      runner.expect(hub.summary.activeCount).toBe(3);
      runner.expect(hub.summary.frozenCount).toBe(2);
      runner.expect(hub.activeAndUpcoming.length).toBe(3);
      runner.expect(hub.frozenArchives.length).toBe(2);

      // Verify active races details
      const liveRace = hub.activeAndUpcoming.find((r: any) => r.id === 'race-season-10');
      runner.expect(!!liveRace).toBe(true);
      runner.expect(liveRace?.status).toBe('live');
      runner.expect(liveRace?.runnersCount).toBe(48);
      runner.expect(liveRace?.totalPrizeVnd).toBe(25000000);

      const trailRace = hub.activeAndUpcoming.find((r: any) => r.id === 'race-trail-bavi');
      runner.expect(!!trailRace).toBe(true);
      runner.expect(trailRace?.status).toBe('upcoming');

      const nightEkiden = hub.activeAndUpcoming.find((r: any) => r.id === 'race-night-run');
      runner.expect(!!nightEkiden).toBe(true);
      runner.expect(nightEkiden?.scope).toBe('INTERNAL_CLUB');

      // Verify frozen archives
      const season9 = hub.frozenArchives.find((r: any) => r.id === 'race-season-9');
      runner.expect(!!season9).toBe(true);
      runner.expect(season9?.status).toBe('frozen');
      runner.expect(season9?.championTeam?.includes('Dragons')).toBe(true);
      runner.expect(season9?.ledgerSignature?.startsWith('LEDGER-SIG-')).toBe(true);
    });

    runner.test('AC-RACE-SETUP-TEMPLATES-02: Race Templates Store & Landing Page Quick QR/Link Manager', () => {
      const templates = clubUseCase.getRaceTemplates();
      runner.expect(templates.length >= 3).toBe(true);

      const monthlyTmpl = templates.find((t: any) => t.id === 'tmpl-monthly-run');
      runner.expect(!!monthlyTmpl).toBe(true);
      runner.expect(monthlyTmpl?.targetType).toBe('MONTHLY_INTERNAL');

      const trailTmpl = templates.find((t: any) => t.id === 'tmpl-trail-dplus');
      runner.expect(!!trailTmpl).toBe(true);
      runner.expect(trailTmpl?.targetType).toBe('TRAIL_ELEVATION');

      const ekidenTmpl = templates.find((t: any) => t.id === 'tmpl-ekiden-relay');
      runner.expect(!!ekidenTmpl).toBe(true);
      runner.expect(ekidenTmpl?.targetType).toBe('EKIDEN_RELAY');

      // Test Saving custom template
      const customTmpl = clubUseCase.saveRaceTemplate({
        id: 'tmpl-custom-sprint',
        name: 'Mẫu Giải Tốc Độ 5K Sprint',
        description: 'Giải chạy cự ly ngắn tốc độ cao',
        icon: '⚡',
        badge: 'Sprint 5K',
        targetType: 'CUSTOM',
        usageCount: 1,
        config: { name: 'Giải Chạy Sprint 5K' }
      });
      runner.expect(customTmpl.id).toBe('tmpl-custom-sprint');
      const updatedTmpls = clubUseCase.getRaceTemplates();
      runner.expect(updatedTmpls.some((t: any) => t.id === 'tmpl-custom-sprint')).toBe(true);

      // Test QR Code retrieval
      const qrData = clubUseCase.getRaceQRCode('race-season-10');
      runner.expect(qrData.raceId).toBe('race-season-10');
      runner.expect(qrData.landingUrl.includes('openrace.vn/g/')).toBe(true);
      runner.expect(qrData.qrSvg.includes('<svg')).toBe(true);

      // Test Excel Export metadata
      const exportMeta = clubUseCase.exportRaceExcelReport('race-season-10');
      runner.expect(exportMeta.success).toBe(true);
      runner.expect(exportMeta.fileName.includes('.xlsx')).toBe(true);
    });

    runner.test('AC-RACE-SETUP-CTA-03: Prominent Primary CTA & Clear 2-Tab Navigation State', () => {
      const hub = clubUseCase.getAdminRaceHub();
      runner.expect(hub.summary.totalPrizeDisbursedVnd).toBe(69000000);
      runner.expect(hub.summary.totalRunners).toBe(227);
      runner.expect(hub.activeAndUpcoming.every((r: any) => !!r.landingUrl && !!r.qrCodeUrl)).toBe(true);
      runner.expect(hub.frozenArchives.every((r: any) => !!r.championTeam && !!r.ledgerSignature)).toBe(true);
    });

    runner.test('AC-RULE-DECOUPLING-01: Platform Anti-Cheat Standard vs Tournament-Specific Settings Separation', () => {
      // 1. Platform Hard Standards (System Parameters)
      const platformConfig = adminUseCase.getPlatformConfig();
      runner.expect(platformConfig.hardAntiCheatFloorPaceMinKm).toBe(2.25);
      runner.expect(platformConfig.autoTrimVehicleTailDefault).toBe(true);
      runner.expect(platformConfig.webhookDlqMaxRetries).toBe(3);

      // 2. Tournament-Specific Settings (Race Setup Config)
      const raceConfig = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(raceConfig.scoringModel.minDistanceKm).toBe(3.0);
      runner.expect(raceConfig.scoringModel.tournamentCustomizations?.paceGate).toBe('3:30 - 9:30');
      runner.expect(raceConfig.scoringModel.tournamentCustomizations?.trailElevationBonus).toBe(true);
      runner.expect(raceConfig.scoringModel.tournamentCustomizations?.teamRankingFormula).toBe('TOTAL_AGGREGATE');
    });

    runner.test('AC-RULE-DECOUPLING-02: Smart Defaults & 90% Inheritance in Step 3 Wizard', () => {
      const catalogs = clubUseCase.getRaceWizardCatalogs();
      
      // 1. Verify Platform Inherited Defaults
      runner.expect(catalogs.platformInheritedDefaults?.hardAntiCheatFloorPaceMinKm).toBe(2.25);
      runner.expect(catalogs.platformInheritedDefaults?.autoTrimVehicleTail).toBe(true);

      // 2. Verify Smart Presets (Road, Trail, Fun Run)
      runner.expect(!!catalogs.smartPresets?.roadRace).toBe(true);
      runner.expect(catalogs.smartPresets?.roadRace.minDistanceKm).toBe(3.0);
      runner.expect(catalogs.smartPresets?.roadRace.trailElevationBonusEnabled).toBe(false);

      runner.expect(!!catalogs.smartPresets?.trailChallenge).toBe(true);
      runner.expect(catalogs.smartPresets?.trailChallenge.minDistanceKm).toBe(3.0);
      runner.expect(catalogs.smartPresets?.trailChallenge.trailElevationBonusEnabled).toBe(true);

      runner.expect(!!catalogs.smartPresets?.funRun).toBe(true);
      runner.expect(catalogs.smartPresets?.funRun.minDistanceKm).toBe(1.5);
      runner.expect(catalogs.smartPresets?.funRun.trailElevationBonusEnabled).toBe(false);
    });

    runner.test('AC-TOURNAMENT-PARAMS-01: Activity & Pace Rules as Tournament-Specific Settings', () => {
      const raceConfig = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(raceConfig.scoringModel.trailGainMinM).toBe(100);
      runner.expect(raceConfig.scoringModel.treadmillMinHrBpm).toBe(120);
      runner.expect(raceConfig.scoringModel.maxActivitiesPerDay).toBe(2);

      const created = clubUseCase.createDynamicRace({
        name: 'Giải Thử Thách Hà Nội Marathon 2027',
        scoringModel: {
          method: 'PACE_WEIGHTED',
          minDistanceKm: 5.0,
          paceGate: { min: '3:00', max: '8:00' },
          terrainFactors: { road: 1.0, trail: 1.5, treadmill: 0.8, track: 1.1 },
          antiCheatRules: { paceFloor: '2:15', autoTrimTail: true, maxSingleRunKm: 42.2 },
          elevationBonus: { enabled: true, bonusKmPer100mGain: 1.0 },
          streakBonusPercent: 20,
          trailGainMinM: 150,
          treadmillMinHrBpm: 125,
          maxActivitiesPerDay: 3
        }
      });
      runner.expect(created.scoringModel.minDistanceKm).toBe(5.0);
      runner.expect(created.scoringModel.trailGainMinM).toBe(150);
      runner.expect(created.scoringModel.treadmillMinHrBpm).toBe(125);
      runner.expect(created.scoringModel.maxActivitiesPerDay).toBe(3);
    });

    runner.test('AC-TOURNAMENT-FINANCE-02: Club Payment Account Catalog & Tournament Financial Settings', () => {
      // 1. Club Bank Accounts Catalog
      const bankAccounts = clubUseCase.getClubBankAccounts();
      runner.expect(bankAccounts.length >= 3).toBe(true);
      runner.expect(bankAccounts.some((a: any) => a.bankBin === '970422' && a.accountNumber === '0988889999')).toBe(true);

      // 2. Financial Rules in Race Setup
      const race1 = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(race1.financialRules?.bankBin).toBe('970422');
      runner.expect(race1.financialRules?.accountNumber).toBe('0988889999');
      runner.expect(race1.financialRules?.cyclePenaltyVnd).toBe(50000);
      runner.expect(race1.financialRules?.contributionTier1Vnd).toBe(100000);
      runner.expect(race1.financialRules?.contributionTierOtherVnd).toBe(200000);
    });

    runner.test('AC-TOURNAMENT-PREFIX-03: Tournament-Specific VietQR Transfer Memo Prefix', () => {
      const race1 = clubUseCase.getDynamicRaceSetup('race-season-10');
      runner.expect(race1.financialRules?.memoPrefix).toBe('SARC');

      const race2 = clubUseCase.getDynamicRaceSetup('race-trail-bavi');
      runner.expect(race2.financialRules?.memoPrefix).toBe('BAVITRAIL');

      // Verify custom prefix on race creation
      const created = clubUseCase.createDynamicRace({
        name: 'VPBank Hanoi Marathon Prep 2027',
        slug: 'vpb-hanoi-marathon-prep-2027',
        financialRules: {
          clubBankAccountId: 'bank-acc-01',
          bankBin: '970422',
          bankName: 'MBBank Quân Đội',
          accountNumber: '0988889999',
          accountName: 'CLB CHAY PHU DONG SARC',
          memoPrefix: 'VPBPREP',
          cyclePenaltyVnd: 60000,
          contributionTier1Vnd: 120000,
          contributionTierOtherVnd: 250000
        }
      });
      runner.expect(created.financialRules?.memoPrefix).toBe('VPBPREP');
      runner.expect(created.financialRules?.cyclePenaltyVnd).toBe(60000);
    });

    runner.test('AC-RACE-WIZARD-EDIT-02: Backend Race Setup Configuration Update & Hub Sync', () => {
      const initial = clubUseCase.getDynamicRaceSetup('race-trail-bavi');
      runner.expect(initial.name).toBe('SARC Trail Challenge Ba Vì 2026');

      const updated = clubUseCase.updateDynamicRace('race-trail-bavi', {
        name: 'SARC Trail Challenge Ba Vì 2026 - MỞ RỘNG',
        bannerVisuals: {
          slogan: 'Chinh phục đỉnh Ba Vì - Thử thách sức bền đỉnh cao'
        },
        scoringModel: {
          minDistanceKm: 4.0,
          method: 'PACE_WEIGHTED'
        }
      });
      runner.expect(updated.name).toBe('SARC Trail Challenge Ba Vì 2026 - MỞ RỘNG');
      runner.expect(updated.bannerVisuals.slogan).toBe('Chinh phục đỉnh Ba Vì - Thử thách sức bền đỉnh cao');
      runner.expect(updated.scoringModel.minDistanceKm).toBe(4.0);

      const fetched = clubUseCase.getDynamicRaceSetup('race-trail-bavi');
      runner.expect(fetched.name).toBe('SARC Trail Challenge Ba Vì 2026 - MỞ RỘNG');

      const hub = clubUseCase.getAdminRaceHub();
      const hubRace = hub.activeAndUpcoming.find((r: any) => r.id === 'race-trail-bavi');
      runner.expect(hubRace.name).toBe('SARC Trail Challenge Ba Vì 2026 - MỞ RỘNG');
    });
  });
}

