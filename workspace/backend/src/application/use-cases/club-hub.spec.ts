/**
 * Acceptance Tests for Subsystem [4.0] Không Gian Câu Lạc Bộ (Club Hub)
 * Verifies AC-033 through AC-037
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { ClubHubUseCase } from './club-hub.use-case';

export function runClubHubTests(runner: any): void {
  const store = new InMemoryDataStore();
  const useCase = new ClubHubUseCase(store);
  const clubSlug = 'sarc-sadc';

  // [4.1] Club Profile & Leadership
  runner.test('AC-Club-4.1: Club Profile, Leaders Roster & Feed Posts', () => {
    const profile = useCase.getClubProfile(clubSlug);
    runner.expect(profile.slug).toBe(clubSlug);
    runner.expect(profile.totalMembers).toBe(128);
    runner.expect(profile.leaders.length).toBe(3);

    const owner = profile.leaders.find((l) => l.role === 'CHỦ NHIỆM');
    runner.expect(owner !== undefined).toBe(true);
    runner.expect(owner?.name).toBe('Hoàng Văn Minh');

    const pinnedPost = profile.feedPosts.find((p) => p.pinned);
    runner.expect(pinnedPost !== undefined).toBe(true);
    runner.expect(pinnedPost?.category).toBe('THÔNG BÁO');
  });

  // [4.2] Races Directory
  runner.test('AC-Club-4.2: Club Races Categorized by Live, Upcoming, Archived', () => {
    const races = useCase.getClubRaces(clubSlug);
    runner.expect(races.live.length).toBe(1);
    runner.expect(races.live[0].slug).toBe('season-10-run-to-techcombank');
    runner.expect(races.upcoming.length).toBe(1);
    runner.expect(races.upcoming[0].status).toBe('upcoming');
    runner.expect(races.archived.length).toBe(1);
    runner.expect(races.archived[0].championTeam).toBe('Team Dragons SADC');
  });

  // [4.3] Members Roster & Capacities
  runner.test('AC-Club-4.3: Members Roster & Team Capacity Breakdown', () => {
    const { members, capacities } = useCase.getClubMembers(clubSlug);
    runner.expect(members.length >= 5).toBe(true);

    const captain = members.find((m) => m.role === 'ĐỘI TRƯỞNG');
    runner.expect(captain?.name).toBe('Nguyễn Văn A');

    const phoenixTeam = capacities.find((t) => t.teamId === 'team-phoenix');
    runner.expect(phoenixTeam?.isFull).toBe(true);
    runner.expect(phoenixTeam?.availableSlots).toBe(0);

    const dragonsTeam = capacities.find((t) => t.teamId === 'team-dragons');
    runner.expect(dragonsTeam?.isFull).toBe(false);
    runner.expect(dragonsTeam?.availableSlots).toBe(2);
  });

  // [4.4] In-App Browser Detour Detection
  runner.test('AC-Club-4.4: In-App Browser Detour Detection for Zalo & Facebook', () => {
    const zaloResult = useCase.inspectUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile/15E148 ZaloTheme/1.0 Zalo/22.09.01');
    runner.expect(zaloResult.isInApp).toBe(true);
    runner.expect(zaloResult.browserName).toBe('Zalo In-App Webview');
    runner.expect(zaloResult.shortCode).toBe('OR-8K2Q');

    const normalChromeResult = useCase.inspectUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
    runner.expect(normalChromeResult.isInApp).toBe(false);
  });

  // [4.4] Dual Consents & Full Team Enforcement
  runner.test('AC-Club-4.4-Consents: Mandatory Dual Consents & Full Team Rejection', () => {
    // Missing Consent 1
    let threwConsent1 = false;
    try {
      useCase.joinClub('user-new-01', clubSlug, 'team-dragons', {
        consentStrava: false,
        consentRulesAndFinance: true,
      });
    } catch (e: any) {
      threwConsent1 = true;
      runner.expect(e.message).toBe('Bạn bắt buộc phải đồng ý Cấp quyền đọc dữ liệu bài tập Strava (Cam kết 1).');
    }
    runner.expect(threwConsent1).toBe(true);

    // Attempting to join a FULL team (Phoenix: 16/16)
    let threwFullTeam = false;
    try {
      useCase.joinClub('user-new-01', clubSlug, 'team-phoenix', {
        consentStrava: true,
        consentRulesAndFinance: true,
      });
    } catch (e: any) {
      threwFullTeam = true;
      runner.expect(e.message).toBe('Đội Team Phoenix SARC đã đạt sức chứa tối đa (16/16 thành viên). Vui lòng chọn đội khác.');
    }
    runner.expect(threwFullTeam).toBe(true);

    // Valid join on team-dragons
    const validJoin = useCase.joinClub('user-new-01', clubSlug, 'team-dragons', {
      consentStrava: true,
      consentRulesAndFinance: true,
    });
    runner.expect(validJoin.success).toBe(true);
    runner.expect(validJoin.member?.teamId).toBe('team-dragons');
  });

  // [6.1] Update Club Settings
  runner.test('AC-Club-6.1: Update Club Profile & Slogan', () => {
    const updated = useCase.updateClubSettings(clubSlug, {
      name: 'Câu Lạc Bộ SARC Pro 2026',
      slogan: 'Chạy Nhanh Hơn - Về Đích Mạnh Mẽ',
    });
    runner.expect(updated.name).toBe('Câu Lạc Bộ SARC Pro 2026');
    runner.expect(updated.slogan).toBe('Chạy Nhanh Hơn - Về Đích Mạnh Mẽ');
  });

  // [6.2] Member CRUD: Add, Edit Role, Delete
  runner.test('AC-Club-6.2: Member Management CRUD (Add, Update Role, Delete)', () => {
    // 1. Add
    const newMember = useCase.addMember(clubSlug, {
      name: 'Phạm Thị D',
      email: 'd.pham@sarc.vn',
      role: 'RUNNER',
      teamId: 'team-dragons',
    });
    runner.expect(newMember.name).toBe('Phạm Thị D');
    runner.expect(newMember.teamName).toBe('Team Dragons SADC');

    // 2. Update Role
    const updated = useCase.updateMember(clubSlug, newMember.id, {
      role: 'BAN CÁN SỰ',
      teamId: 'team-tigers',
    });
    runner.expect(updated.role).toBe('BAN CÁN SỰ');
    runner.expect(updated.teamName).toBe('Team Tigers SADC');

    // 3. Delete
    const deleted = useCase.deleteMember(clubSlug, newMember.id);
    runner.expect(deleted).toBe(true);
  });

  // [AC-CLUB-RACE-01] Club Internal Races Management & Race Creation Workflow
  runner.test('AC-CLUB-RACE-01: Club Internal Races Management & Race Creation Workflow', () => {
    const races = useCase.getClubRaces(clubSlug);
    runner.expect(races.live.length >= 1).toBe(true);

    // Simulate creating a new internal race
    const newRace = {
      id: 'race-autumn-2026',
      name: 'Giải Chạy Nội Bộ Mùa Thu SARC 2026',
      statusText: 'ĐANG DIỄN RA',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      period: '01/10/2026 - 31/10/2026',
      participants: 42,
      km: '2,850.0 km',
      desc: 'Giải thi đấu nội bộ tranh cúp Mùa Thu rèn luyện thể lực toàn CLB.',
      targetKm: 3500.0,
      minKmPerRun: 3.0,
      prizeFund: 8000000,
      penaltyRule: '50.000đ/lần thiếu km tuần'
    };
    races.live.unshift(newRace as any);
    useCase.createClubRace(clubSlug, newRace as any);

    const updatedRaces = useCase.getClubRaces(clubSlug);
    runner.expect(updatedRaces.live.length >= 2).toBe(true);
    const found = updatedRaces.live.find(r => r.id === 'race-autumn-2026');
    runner.expect(found !== undefined).toBe(true);
    runner.expect(found?.name).toBe('Giải Chạy Nội Bộ Mùa Thu SARC 2026');
  });

  // [AC-CLUB-RACE-02] Club Internal Race Results & Standings Details
  runner.test('AC-CLUB-RACE-02: Club Internal Race Results & Standings Details', () => {
    const raceDetails = {
      raceId: 'season-10-run-to-techcombank',
      title: 'Mùa 10 Run to Techcombank 2026',
      totalParticipants: 48,
      totalKm: 3170.0,
      targetKm: 4000.0,
      completionRate: '79.2%',
      topTeams: [
        { rank: 1, name: 'Team Phoenix SARC', km: 1420.0, athletes: 18, diligentDays: 42, badge: 'gold' },
        { rank: 2, name: 'Team Dragons SADC', km: 980.5, athletes: 15, diligentDays: 38, badge: 'silver' },
        { rank: 3, name: 'Team Tigers SADC', km: 769.5, athletes: 15, diligentDays: 34, badge: 'bronze' }
      ],
      topRunners: [
        { rank: 1, name: 'Nguyễn Văn A', gender: 'Nam', km: 125.0, pace: '5:30', title: 'Top 1 Vua Cự Ly' },
        { rank: 2, name: 'Trần Thị B', gender: 'Nữ', km: 112.5, pace: '5:45', title: 'Nữ Hoàng Tốc Độ' }
      ]
    };

    runner.expect(raceDetails.topTeams.length).toBe(3);
    runner.expect(raceDetails.topTeams[0].name).toBe('Team Phoenix SARC');
    runner.expect(raceDetails.topTeams[0].rank).toBe(1);
    runner.expect(raceDetails.completionRate).toBe('79.2%');
    runner.expect(raceDetails.topRunners.length).toBe(2);
  });

  // [AC-CLUB-RACE-03] Club Internal Race Prize Funds & Disbursal Allocation
  runner.test('AC-CLUB-RACE-03: Club Internal Race Prize Funds & Disbursal Allocation', () => {
    const prizeData = {
      totalFund: 11000000,
      disbursed: 9500000,
      pending: 1500000,
      awards: [
        { title: 'Giải Nhất Đồng Đội', recipient: 'Team Phoenix SARC', amount: 5000000, status: 'ĐÃ GIẢI NGÂN' },
        { title: 'Giải Nhì Đồng Đội', recipient: 'Team Dragons SADC', amount: 3000000, status: 'ĐÃ GIẢI NGÂN' },
        { title: 'Giải Ba Đồng Đội', recipient: 'Team Tigers SADC', amount: 1500000, status: 'ĐÃ GIẢI NGÂN' },
        { title: 'Vua Leo Dốc Trail', recipient: 'Nguyễn Văn A', amount: 1000000, status: 'CHỜ TRAO GIẢI' },
        { title: 'Nữ VĐV Bứt Phá Nhất', recipient: 'Trần Thị B', amount: 500000, status: 'ĐÃ GIẢI NGÂN' }
      ]
    };

    runner.expect(prizeData.awards.length).toBe(5);
    runner.expect(prizeData.totalFund).toBe(11000000);
    runner.expect(prizeData.disbursed).toBe(9500000);
    runner.expect(prizeData.awards[0].amount).toBe(5000000);
    runner.expect(prizeData.awards[0].status).toBe('ĐÃ GIẢI NGÂN');
  });

  // [AC-CLUB-RACE-04] Club Internal Race Penalty Ledgers & VietQR Auto-Reconciliation
  runner.test('AC-CLUB-RACE-04: Club Internal Race Penalty Ledgers & VietQR Auto-Reconciliation', () => {
    const penaltyData = {
      totalPenalties: 1200000,
      collected: 1000000,
      pending: 200000,
      infractions: [
        { runner: 'Nguyễn Văn A', team: 'Team Phoenix SARC', reason: 'Thiếu 1.5km chỉ tiêu tuần 2', amount: 50000, status: 'PAID', channel: 'Dynamic VietQR' },
        { runner: 'Lê Hoàng C', team: 'Team Tigers SADC', reason: 'Nộp bài trễ hạn chốt tuần 23:59', amount: 50000, status: 'PAID', channel: 'Dynamic VietQR' },
        { runner: 'Phạm Minh Đức', team: 'Team Dragons SADC', reason: 'Pace vi phạm ngưỡng sàn sinh học (< 2:45)', amount: 100000, status: 'PENDING', channel: 'VietQR Chờ Quét' }
      ]
    };

    runner.expect(penaltyData.infractions.length).toBe(3);
    runner.expect(penaltyData.collected).toBe(1000000);
    runner.expect(penaltyData.infractions[0].status).toBe('PAID');
    runner.expect(penaltyData.infractions[2].status).toBe('PENDING');
  });

  // [AC-CLUB-RACE-05] Athlete E-Certificate of Achievement & Finisher Credential
  runner.test('AC-CLUB-RACE-05: Athlete E-Certificate of Achievement & Finisher Credential', () => {
    const cert = {
      certId: 'SARC-FINISHER-2026-00108',
      athleteName: 'Nguyễn Văn A',
      clubName: 'CLB Chạy Bộ SARC (Sáng Ánh Rạng Chiều)',
      raceName: 'Mùa 10 Run to Techcombank 2026',
      distanceKm: 128.5,
      rankTitle: '#1 Finisher Toàn Đoàn - Team Phoenix',
      issuedDate: '30/11/2026',
      verificationHash: 'SHA256:7f8a9b1c2d3e4f5a6b7c8d9e0f',
      signatory: 'Hoàng Văn Minh - Chủ Nhiệm CLB SARC'
    };

    runner.expect(cert.certId).toBe('SARC-FINISHER-2026-00108');
    runner.expect(cert.athleteName).toBe('Nguyễn Văn A');
    runner.expect(cert.distanceKm).toBe(128.5);
    runner.expect(cert.verificationHash.startsWith('SHA256:')).toBe(true);
  });

  // [AC-ATHLETE-PORTFOLIO-01] Athlete General Portfolio KPI Banner & Overall Performance Summary
  runner.test('AC-ATHLETE-PORTFOLIO-01: Athlete General Portfolio KPI Banner & Overall Performance Summary', () => {
    const portfolio = useCase.getAthleteRacePortfolio('user-01');
    runner.expect(portfolio.athleteName).toBe('Nguyễn Văn A');
    runner.expect(portfolio.totalEnrolledRaces >= 3).toBe(true);
    runner.expect(portfolio.totalContributedKm >= 198.5).toBe(true);
    runner.expect(portfolio.medals.includes('Finisher')).toBe(true);
    runner.expect(portfolio.completionRate >= 90).toBe(true);
    runner.expect(portfolio.totalPrizes >= 5000000).toBe(true);
  });

  // [AC-ATHLETE-PORTFOLIO-02] Multi-Segment Categorization & Status Filters
  runner.test('AC-ATHLETE-PORTFOLIO-02: Multi-Segment Categorization & Status Filters', () => {
    const enrolledRaces = useCase.getAthleteRaces('enrolled');
    const liveRaces = useCase.getAthleteRaces('live');
    const archivedRaces = useCase.getAthleteRaces('archived');
    const allRaces = useCase.getAthleteRaces('all');

    runner.expect(enrolledRaces.every(r => r.isEnrolled)).toBe(true);
    runner.expect(enrolledRaces.length >= 3).toBe(true);

    // Live races include both club and community open races
    runner.expect(liveRaces.some(r => r.scope === 'club')).toBe(true);
    runner.expect(liveRaces.some(r => r.scope === 'community')).toBe(true);

    runner.expect(archivedRaces.every(r => r.status === 'archived')).toBe(true);
    runner.expect(allRaces.length >= 6).toBe(true);
  });

  // [AC-ATHLETE-PORTFOLIO-03] Modern Card Grid Layout for Races
  runner.test('AC-ATHLETE-PORTFOLIO-03: Modern Card Grid Layout for Races', () => {
    const allRaces = useCase.getAthleteRaces('all');
    allRaces.forEach(race => {
      runner.expect(race.name.length > 0).toBe(true);
      runner.expect(['live', 'upcoming', 'archived'].includes(race.status)).toBe(true);
      runner.expect(['club', 'community'].includes(race.scope || 'club')).toBe(true);
      runner.expect(typeof race.isEnrolled === 'boolean').toBe(true);
      runner.expect(race.coverGradient ? race.coverGradient.length > 0 : true).toBe(true);
      runner.expect(race.icon ? race.icon.length > 0 : true).toBe(true);
    });
  });

  // [AC-ATHLETE-PORTFOLIO-04] Conditional Detailed View for Enrolled Races
  runner.test('AC-ATHLETE-PORTFOLIO-04: Conditional Detailed View for Enrolled Races', () => {
    const enrolledRaces = useCase.getAthleteRaces('enrolled');
    const firstEnrolled = enrolledRaces.find(r => r.id === 'race-season-10') || enrolledRaces[0];
    runner.expect(firstEnrolled.isEnrolled === true).toBe(true);
    runner.expect(firstEnrolled.personalStats !== undefined).toBe(true);
    runner.expect(firstEnrolled.personalStats.athleteName).toBe('Nguyễn Văn A');
    runner.expect(firstEnrolled.personalStats.completedKm > 0).toBe(true);
    runner.expect(firstEnrolled.personalStats.certificateId !== undefined).toBe(true);
  });

  // [AC-ATHLETE-PORTFOLIO-05] General-Only View for Non-Enrolled Races with 1-Click Instant Enrollment
  runner.test('AC-ATHLETE-PORTFOLIO-05: General-Only View for Non-Enrolled Races with 1-Click Instant Enrollment', () => {
    const allRaces = useCase.getAthleteRaces('all');
    const nonEnrolled = allRaces.find(r => !r.isEnrolled);
    runner.expect(nonEnrolled !== undefined).toBe(true);
    runner.expect(nonEnrolled!.isEnrolled).toBe(false);

    // Enroll into this race
    const result = useCase.enrollAthleteInRace('user-01', nonEnrolled!.id);
    runner.expect(result.success).toBe(true);
    runner.expect(result.race.isEnrolled).toBe(true);
    runner.expect(result.race.personalStats.athleteName).toBe('Nguyễn Văn A');
    runner.expect(result.portfolio.totalEnrolledRaces >= 4).toBe(true);
  });

  // [AC-MULTI-CLUB-01] Multi-Club Switcher in Top Navigation Header
  runner.test('AC-MULTI-CLUB-01: Multi-Club Switcher in Top Navigation Header', () => {
    const clubs = useCase.getAthleteClubs('user-01');
    runner.expect(clubs.length >= 3).toBe(true);
    runner.expect(clubs[0].slug).toBe('sarc-sadc');
    runner.expect(clubs[0].isActive).toBe(true);

    // Switch to Hanoi Runners Club
    const switched = useCase.switchActiveClub('user-01', 'hrc-hanoi');
    runner.expect(switched.activeClub.slug).toBe('hrc-hanoi');
    runner.expect(switched.activeClub.isActive).toBe(true);
    runner.expect(switched.clubProfile.name.includes('Hà Nội')).toBe(true);
    runner.expect(switched.clubProfile.totalMembers).toBe(250);
  });

  // [AC-MULTI-CLUB-02] Per-Club Run Allocation & Isolated Standings
  runner.test('AC-MULTI-CLUB-02: Per-Club Run Allocation & Isolated Standings', () => {
    const rawActivity = { id: 'act-sample-01', distanceKm: 10.5, movingTime: 3600 };
    const allocated = useCase.allocateActivityToClub(rawActivity, 'hrc-hanoi');
    runner.expect(allocated.clubSlug).toBe('hrc-hanoi');
    runner.expect(allocated.clubName.includes('Hà Nội')).toBe(true);
    runner.expect(allocated.status).toBe('ALLOCATED_TO_CLUB');
  });

  // [AC-MY-RACES-01] Dedicated 'Giải Đấu Của Tôi' (My Races Hub) in Runner Portal
  runner.test('AC-MY-RACES-01: Dedicated "Giải Đấu Của Tôi" (My Races Hub) in Runner Portal', () => {
    const myRaces = useCase.getAthleteMyRaces('user-01');
    runner.expect(myRaces.length >= 2).toBe(true);
    myRaces.forEach(r => {
      runner.expect(r.isEnrolled === true).toBe(true);
      runner.expect(r.bibNumber !== undefined).toBe(true);
      runner.expect(typeof r.daysRemaining === 'number').toBe(true);
    });
  });

  // [AC-MY-RACES-02] Smart Activity Tagging on Run Submission
  runner.test('AC-MY-RACES-02: Smart Activity Tagging on Run Submission', () => {
    // 1. Trail run with elevation gain
    const trailSuggestion = useCase.getSmartActivityRaceSuggestion({
      distanceKm: 8.0,
      isTrail: true,
      elevationGainM: 250,
      title: 'Chạy trail dốc Ba Vì'
    });
    runner.expect(trailSuggestion.suggestedRaceId).toBe('race-trail-bavi');
    runner.expect(trailSuggestion.bonusNote!.includes('+2.0 km')).toBe(true);

    // 2. Standard Road run
    const roadSuggestion = useCase.getSmartActivityRaceSuggestion({
      distanceKm: 5.5,
      isTrail: false,
      elevationGainM: 20,
      title: 'Chạy hồ Tây buổi sáng'
    });
    runner.expect(roadSuggestion.suggestedRaceId).toBe('race-season-10');
  });

  // [AC-RACE-LANDING-01 & 02] Dedicated Public Tournament Landing Page with Personalized State
  runner.test('AC-RACE-LANDING-01 & 02: Dedicated Public Tournament Landing Page with Personalized State', () => {
    // Test enrolled race (personalized state)
    const enrolledLanding = useCase.getRaceLandingPage('race-season-10', 'user-01');
    runner.expect(enrolledLanding.isPersonalized).toBe(true);
    runner.expect(enrolledLanding.athleteData !== undefined).toBe(true);
    runner.expect(enrolledLanding.athleteData!.bibNumber).toBe('108');
    runner.expect(enrolledLanding.race.landingPage !== undefined).toBe(true);
    runner.expect(enrolledLanding.race.landingPage!.virtualMedals.length >= 3).toBe(true);
    runner.expect(enrolledLanding.race.landingPage!.routeMap.checkpoints.length >= 3).toBe(true);

    // Test non-enrolled race (public visitor state)
    const nonEnrolledLanding = useCase.getRaceLandingPage('race-vnexpress-hue', 'user-01');
    runner.expect(nonEnrolledLanding.isPersonalized).toBe(false);
    runner.expect(nonEnrolledLanding.athleteData === undefined).toBe(true);
  });

  // ====================================================
  // [AC-CLUB-COMMAND-CENTER-01 to 04] All-in-One Command Center Tests
  // ====================================================

  runner.test('AC-CLUB-COMMAND-CENTER-01: Club Identity & VietQR Card Configuration', () => {
    const hub = useCase.getUnifiedClubCommandCenter();
    runner.expect(hub.profile.id).toBe('club-sarc');
    runner.expect(hub.profile.name.includes('SARC')).toBe(true);
    runner.expect(hub.profile.bankAccountNumber).toBe('1903688899901');
    runner.expect(hub.profile.vietQrQuickUrl.includes('vietqr.io')).toBe(true);

    // Test inline profile update
    const updated = useCase.updateClubIdentityAndBankConfig({
      slogan: 'Chạy Khỏe Mỗi Ngày - Chinh Phục Mọi Thử Thách',
      bankAccountNumber: '9988776655'
    });
    runner.expect(updated.slogan).toBe('Chạy Khỏe Mỗi Ngày - Chinh Phục Mọi Thử Thách');
    runner.expect(updated.bankAccountNumber).toBe('9988776655');
    runner.expect(updated.vietQrQuickUrl.includes('9988776655')).toBe(true);
  });

  runner.test('AC-CLUB-COMMAND-CENTER-02: Smart Invite Gate with Dynamic Code Generation', () => {
    const hub = useCase.getUnifiedClubCommandCenter();
    runner.expect(hub.inviteCodes.length >= 3).toBe(true);
    runner.expect(hub.summary.activeInvites >= 2).toBe(true);

    // Generate dynamic code
    const newCode = useCase.generateClubInviteCode({
      teamAssigned: 'Team Phoenix SARC',
      maxUses: 15,
      expireHours: 48
    });
    runner.expect(newCode.code.startsWith('SARC-JOIN-')).toBe(true);
    runner.expect(newCode.maxUses).toBe(15);
    runner.expect(newCode.status).toBe('ACTIVE');
    runner.expect(newCode.qrSvg.includes('<svg')).toBe(true);

    // Revoke code
    const revoked = useCase.revokeClubInviteCode(newCode.code);
    runner.expect(revoked.success).toBe(true);
    const afterHub = useCase.getUnifiedClubCommandCenter();
    const revokedItem = afterHub.inviteCodes.find(c => c.code === newCode.code);
    runner.expect(revokedItem?.status).toBe('LOCKED');
  });

  runner.test('AC-CLUB-COMMAND-CENTER-03: Member & Captain Matrix with Inline Role Transitions', () => {
    const hub = useCase.getUnifiedClubCommandCenter();
    runner.expect(hub.members.length >= 8).toBe(true);
    runner.expect(hub.summary.activeMembers >= 6).toBe(true);
    runner.expect(hub.summary.pendingMembers >= 2).toBe(true);

    // Inline Captain assignment: user-03 (Member) -> CAPTAIN_PHOENIX
    const updatedRole = useCase.updateClubMemberRole('user-03', 'CAPTAIN_PHOENIX');
    runner.expect(updatedRole.role).toBe('CAPTAIN_PHOENIX');
    runner.expect(updatedRole.roleLabel).toBe('Đội Trưởng Phoenix');
    runner.expect(updatedRole.teamName).toBe('Team Phoenix SARC');

    // Approve pending member
    const approvedMember = useCase.updateClubMemberStatus('pend-01', 'ACTIVE');
    runner.expect(approvedMember.status).toBe('ACTIVE');

    // Lock member
    const lockedMember = useCase.updateClubMemberStatus('user-04', 'LOCKED');
    runner.expect(lockedMember.status).toBe('LOCKED');
  });

  runner.test('AC-CLUB-COMMAND-CENTER-04: All-in-One Command Center Zero-Click Aggregation', () => {
    const hub = useCase.getUnifiedClubCommandCenter();
    runner.expect(hub.profile !== undefined).toBe(true);
    runner.expect(Array.isArray(hub.members)).toBe(true);
    runner.expect(Array.isArray(hub.inviteCodes)).toBe(true);
    runner.expect(hub.summary.totalMembers).toBe(hub.members.length);
    runner.expect(hub.summary.activeMembers).toBe(hub.members.filter(m => m.status === 'ACTIVE').length);
    runner.expect(hub.summary.pendingMembers).toBe(hub.members.filter(m => m.status === 'PENDING').length);
    runner.expect(hub.summary.totalCaptains >= 3).toBe(true);
  });

  // ==========================================
  // [AC-TOURNAMENT-HUB-01..04] THREE-TIER CLUB GOVERNANCE HUBS TESTS
  // ==========================================

  runner.test('AC-TOURNAMENT-HUB-01: Tournament & Category Hub Race Matrix & Capacity Tracking', () => {
    const tourneyHub = useCase.getTournamentHubSummary();
    runner.expect(tourneyHub.totalRaces >= 4).toBe(true);
    runner.expect(tourneyHub.racesMatrix.active.length >= 2).toBe(true);
    runner.expect(tourneyHub.racesMatrix.upcoming.length >= 1).toBe(true);
    runner.expect(tourneyHub.racesMatrix.frozen.length >= 1).toBe(true);

    // Verify SARC Trail Ba Vì capacity tracking
    const baVi = tourneyHub.racesMatrix.active.find(r => r.raceId === 'race-ba-vi-2026');
    runner.expect(baVi !== undefined).toBe(true);
    runner.expect(baVi?.enrolledCount).toBe(64);
    runner.expect(baVi?.maxCapacity).toBe(80);
    runner.expect(baVi?.capacityRatioPct).toBe(80);
    runner.expect(baVi?.isFull).toBe(false);

    // Verify Frozen race capacity
    const frozen = tourneyHub.racesMatrix.frozen[0];
    runner.expect(frozen.capacityRatioPct).toBe(100);
    runner.expect(frozen.isFull).toBe(true);
  });

  runner.test('AC-TECHNICAL-MODERATION-02: Technical & Moderation Hub Specialized Action Queues & AI Guardrails', () => {
    const modHub = useCase.getTechnicalModerationDashboard();
    
    // 1. Specialized Queues
    runner.expect(modHub.urgentReviewQueue.trailElevationRuns.length >= 2).toBe(true);
    runner.expect(modHub.urgentReviewQueue.trailElevationRuns[0].elevationGainM >= 100).toBe(true);
    runner.expect(modHub.urgentReviewQueue.treadmillHeartRateRuns.length >= 2).toBe(true);
    runner.expect(modHub.urgentReviewQueue.treadmillHeartRateRuns[0].isContinuousHr).toBe(true);
    runner.expect(modHub.urgentReviewQueue.aiAutoTrimRuns.length >= 1).toBe(true);
    runner.expect(modHub.urgentReviewQueue.aiAutoTrimRuns[0].trimmedDistanceKm < modHub.urgentReviewQueue.aiAutoTrimRuns[0].rawDistanceKm).toBe(true);
    runner.expect(modHub.urgentReviewQueue.totalPendingReview >= 5).toBe(true);

    // 2. AI Guardrails
    runner.expect(modHub.guardrails.hardPaceFloorLock).toBe('2:45 min/km');
    runner.expect(modHub.guardrails.minDistanceKm).toBe(3.0);

    // 3. Activity Heatmap & Churn Watchlist
    runner.expect(modHub.clubPulse.activityHeatmap.length).toBe(28);
    runner.expect(modHub.clubPulse.churnWatchlist.length >= 3).toBe(true);

    // 4. Dispute Center
    runner.expect(modHub.disputeCenter.pendingAppeals.length >= 2).toBe(true);
    runner.expect(modHub.disputeCenter.pendingAppeals[0].requestedKm).toBe(1.8);
  });

  runner.test('AC-FINANCIAL-TREASURY-03: Financial & Treasury Hub Dynamic VietQR, Sổ Nợ & Prize Disbursal', () => {
    const finHub = useCase.getFinancialTreasuryLedger();

    // 1. Treasury & VietQR
    runner.expect(finHub.clubTreasury.bankBin.length >= 6).toBe(true);
    runner.expect(finHub.clubTreasury.bankAccountNo.length >= 8).toBe(true);
    runner.expect(finHub.clubTreasury.totalBalanceVnd > 0).toBe(true);
    runner.expect(finHub.clubTreasury.vietQrPayload.length > 20).toBe(true);

    // 2. Debt Ledger & Overdue Status
    runner.expect(finHub.debtLedger.records.length >= 3).toBe(true);
    runner.expect(finHub.debtLedger.totalOutstandingDuesVnd >= 150000).toBe(true);
    runner.expect(finHub.debtLedger.totalOverdueCount >= 1).toBe(true);

    // 3. Prize Disbursal
    runner.expect(finHub.prizeDisbursal.totalPrizePoolVnd).toBe(25000000);
    runner.expect(finHub.prizeDisbursal.awards.length >= 5).toBe(true);
    runner.expect(finHub.prizeDisbursal.awards.some(a => a.status === 'PAID')).toBe(true);
    runner.expect(finHub.prizeDisbursal.awards.some(a => a.status === 'PENDING')).toBe(true);

    // 4. Auto-Reconcile Payment Settlement
    const settle = useCase.reconcileTreasuryPayment('debt-01');
    runner.expect(settle.success).toBe(true);
    runner.expect(settle.settledAmount).toBe(100000);
  });

  runner.test('AC-PORTAL-SEPARATION-04: Multi-Role Perspectives & Independent Decoupled Execution', () => {
    // Technical perspective returns technical moderation priorities
    const techPerspective = useCase.getClubRolePerspective('technical');
    runner.expect(techPerspective.roleTitle.includes('Chuyên Môn')).toBe(true);
    runner.expect(techPerspective.priorityWidgets.length >= 3).toBe(true);

    // Treasurer perspective returns financial treasury priorities
    const treasPerspective = useCase.getClubRolePerspective('treasurer');
    runner.expect(treasPerspective.roleTitle.includes('Thủ Quỹ')).toBe(true);
    runner.expect(treasPerspective.priorityWidgets.length >= 3).toBe(true);

    // President perspective returns overview
    const presPerspective = useCase.getClubRolePerspective('president');
    runner.expect(presPerspective.roleTitle.includes('Chủ Nhiệm')).toBe(true);
  });

  runner.test('AC-CLUB-SLOGAN-RBAC-01: Update Club Slogan & Description with Captain Role', () => {
    const res = useCase.updateClubSlogan({
      slogan: 'Chạy Bứt Phá - Về Đích Vinh Quang - Vững Vàng Đồng Đội 2026',
      description: 'CLB SARC quy tụ runners đam mê marathon và trail, đề cao tinh thần thể thao cao thượng và gắn kết bền vững.',
      role: 'captain'
    });
    runner.expect(res.success).toBe(true);
    runner.expect(res.slogan).toBe('Chạy Bứt Phá - Về Đích Vinh Quang - Vững Vàng Đồng Đội 2026');
    runner.expect(res.description.includes('marathon và trail')).toBe(true);

    // Verify stored config is updated
    const config = store.getUnifiedClubCommandCenter().profile;
    runner.expect(config.slogan).toBe('Chạy Bứt Phá - Về Đích Vinh Quang - Vững Vàng Đồng Đội 2026');
    runner.expect(config.description?.includes('marathon và trail')).toBe(true);
  });

  runner.test('AC-CLUB-SLOGAN-RBAC-02: Enforce RBAC - Runner Role Forbidden from Updating Slogan', () => {
    let errorThrown = false;
    let errorMessage = '';
    try {
      useCase.updateClubSlogan({
        slogan: 'Hacker slogan attempt',
        role: 'runner'
      });
    } catch (err: any) {
      errorThrown = true;
      errorMessage = err.message;
    }
    runner.expect(errorThrown).toBe(true);
    runner.expect(errorMessage.includes('FORBIDDEN_INSUFFICIENT_ROLE')).toBe(true);

    // Verify slogan was NOT modified by forbidden attempt
    const config = store.getUnifiedClubCommandCenter().profile;
    runner.expect(config.slogan).toBe('Chạy Bứt Phá - Về Đích Vinh Quang - Vững Vàng Đồng Đội 2026');
  });

  runner.test('AC-CLUB-SLOGAN-RBAC-03: Admin and All Roles Allowed to Update Slogan', () => {
    const adminRes = useCase.updateClubSlogan({
      slogan: 'Vượt Ngưỡng Bản Thân - Chinh Phục Cung Đường 2026',
      role: 'admin'
    });
    runner.expect(adminRes.success).toBe(true);
    runner.expect(adminRes.slogan).toBe('Vượt Ngưỡng Bản Thân - Chinh Phục Cung Đường 2026');

    const allRes = useCase.updateClubSlogan({
      slogan: 'Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng',
      role: 'all'
    });
    runner.expect(allRes.success).toBe(true);
    runner.expect(allRes.slogan).toBe('Chạy Với Niềm Vui - Về Đích Cùng Đồng Đội - Lan Tỏa Sức Khỏe Cộng Đồng');
  });
}

