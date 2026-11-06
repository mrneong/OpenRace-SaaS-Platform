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
}

