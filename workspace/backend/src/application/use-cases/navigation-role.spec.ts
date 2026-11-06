/**
 * Role-Based Navigation & Dynamic Sidebar Unit Test Suite
 * Tests AC-ROLE-NAV-01 to AC-ROLE-NAV-05
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { NavigationRoleUseCase } from './navigation-role.use-case';
import { getFrontendHtml } from '../../main';

export function runNavigationRoleTests(runner: any) {
  runner.suite('Role-Based Navigation & Dynamic Sidebar Ecosystem (AC-ROLE-NAV-01 to AC-ROLE-NAV-05)', () => {
    const dataStore = new InMemoryDataStore();
    const useCase = new NavigationRoleUseCase(dataStore);

    runner.test('AC-ROLE-NAV-01: 4 Standardized Portal Groups with 19 Menu Items', () => {
      const groups = useCase.getAllNavigationGroups();
      if (groups.length !== 4) throw new Error(`Expected 4 groups, got ${groups.length}`);

      const [runnerGroup, clubGroup, captainGroup, adminGroup] = groups;

      // Group 1: Runner Portal
      if (runnerGroup.id !== 'group-runner' || runnerGroup.items.length !== 5) {
        throw new Error('Group 1 Runner Portal items mismatch');
      }

      // Group 2: Club & Team Space
      if (clubGroup.id !== 'group-club' || clubGroup.items.length !== 5) {
        throw new Error('Group 2 Club & Team Space items mismatch');
      }

      // Group 3: Club Admin & Captain Portal
      if (captainGroup.id !== 'group-captain' || captainGroup.items.length !== 5) {
        throw new Error('Group 3 Club Admin items mismatch');
      }

      // Group 4: Super Admin / Platform
      if (adminGroup.id !== 'group-admin' || adminGroup.items.length !== 4) {
        throw new Error('Group 4 Super Admin items mismatch');
      }

      const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
      if (totalItems !== 19) throw new Error(`Expected 19 total menu items, got ${totalItems}`);
    });

    runner.test('AC-ROLE-NAV-02: Top Header Context Switcher Role Definitions', () => {
      const roles = useCase.getPortalRoles();
      if (roles.length !== 5) throw new Error(`Expected 5 roles, got ${roles.length}`);

      const roleIds = roles.map(r => r.id);
      const expectedIds = ['runner', 'club', 'captain', 'admin', 'all'];
      for (const id of expectedIds) {
        if (!roleIds.includes(id as any)) throw new Error(`Missing role ${id}`);
      }

      const runnerRole = roles.find(r => r.id === 'runner');
      if (!runnerRole || !runnerRole.label.includes('Vận Động Viên') || runnerRole.icon !== '🏃') {
        throw new Error('Runner role definition invalid');
      }

      const captainRole = roles.find(r => r.id === 'captain');
      if (!captainRole || !captainRole.label.includes('Ban Điều Hành') || captainRole.icon !== '⚡') {
        throw new Error('Captain role definition invalid');
      }

      const adminRole = roles.find(r => r.id === 'admin');
      if (!adminRole || !adminRole.label.includes('Quản Trị Nền Tảng') || adminRole.icon !== '🛡️') {
        throw new Error('Admin role definition invalid');
      }
    });

    runner.test('AC-ROLE-NAV-03: Dynamic Sidebar Filtering per Active Role', () => {
      // 1. Runner
      useCase.setActiveRole('user-01', 'runner');
      let context = useCase.getUserNavigationContext('user-01');
      if (context.activeRole !== 'runner' || context.groups.length !== 1 || context.groups[0].id !== 'group-runner') {
        throw new Error('Dynamic filter for runner role failed');
      }

      // 2. Club
      useCase.setActiveRole('user-01', 'club');
      context = useCase.getUserNavigationContext('user-01');
      if (context.activeRole !== 'club' || context.groups.length !== 1 || context.groups[0].id !== 'group-club') {
        throw new Error('Dynamic filter for club role failed');
      }

      // 3. Captain
      useCase.setActiveRole('user-01', 'captain');
      context = useCase.getUserNavigationContext('user-01');
      if (context.activeRole !== 'captain' || context.groups.length !== 1 || context.groups[0].id !== 'group-captain') {
        throw new Error('Dynamic filter for captain role failed');
      }

      // 4. Admin
      useCase.setActiveRole('user-01', 'admin');
      context = useCase.getUserNavigationContext('user-01');
      if (context.activeRole !== 'admin' || context.groups.length !== 1 || context.groups[0].id !== 'group-admin') {
        throw new Error('Dynamic filter for admin role failed');
      }

      // 5. All
      useCase.setActiveRole('user-01', 'all');
      context = useCase.getUserNavigationContext('user-01');
      if (context.activeRole !== 'all' || context.groups.length !== 4) {
        throw new Error('Dynamic filter for all roles failed');
      }
    });

    runner.test('AC-ROLE-NAV-04: Navigation Redirection and Tab Destination Finders', () => {
      const dashboardItem = useCase.findMenuItemByTab('dashboard');
      if (!dashboardItem || dashboardItem.id !== 'nav-runner-dashboard' || !dashboardItem.title.includes('Tổng Quan')) {
        throw new Error('findMenuItemByTab(dashboard) failed');
      }

      const activitiesItem = useCase.findMenuItemByTab('activities');
      if (!activitiesItem || activitiesItem.id !== 'nav-runner-activities') {
        throw new Error('findMenuItemByTab(activities) failed');
      }

      const clubItem = useCase.findMenuItemByTab('club');
      if (!clubItem || clubItem.id !== 'nav-club-overview') {
        throw new Error('findMenuItemByTab(club) failed');
      }

      const clubAdminItem = useCase.findMenuItemByTab('club-admin');
      if (!clubAdminItem || clubAdminItem.id !== 'nav-captain-batch') {
        throw new Error('findMenuItemByTab(club-admin) failed');
      }

      const systemAdminItem = useCase.findMenuItemByTab('system-admin');
      if (!systemAdminItem || systemAdminItem.id !== 'nav-admin-iam') {
        throw new Error('findMenuItemByTab(system-admin) failed');
      }

      const runnerItems = useCase.getMenuItemsForRole('runner');
      if (runnerItems.length !== 5) throw new Error('getMenuItemsForRole(runner) count invalid');

      const adminItems = useCase.getMenuItemsForRole('admin');
      if (adminItems.length !== 4) throw new Error('getMenuItemsForRole(admin) count invalid');

      const allItems = useCase.getMenuItemsForRole('all');
      if (allItems.length !== 19) throw new Error('getMenuItemsForRole(all) count invalid');
    });

    runner.test('AC-ROLE-NAV-05: Backend User Navigation Context and Role Entitlements API', () => {
      const context = useCase.getUserNavigationContext('user-01');
      if (context.userId !== 'user-01' || context.userName !== 'Nguyễn Văn A' || context.totalMenuItems !== 19) {
        throw new Error('getUserNavigationContext user info invalid');
      }

      const updateResult = useCase.setActiveRole('user-02', 'captain');
      if (!updateResult.success || updateResult.activeRole !== 'captain' || updateResult.groupCount !== 1) {
        throw new Error('setActiveRole execution failed');
      }

      const updatedContext = useCase.getUserNavigationContext('user-02');
      if (updatedContext.activeRole !== 'captain' || updatedContext.groups.length !== 1 || updatedContext.groups[0].id !== 'group-captain') {
        throw new Error('Context persistence failed');
      }
    });

    runner.test('AC-SAAS-V3-01: Concise SaaS Sidebar Navigation Titles & Badge Removal', () => {
      const groups = useCase.getAllNavigationGroups();

      // Expected exact concise titles per user proposal
      const expectedTitles = [
        // Runner Portal
        'Tổng Quan',
        'Nhật Ký & Bài Chạy',
        'Bảng Xếp Hạng',
        'Kết Nối Thiết Bị',
        'Quỹ & Sổ Nợ',
        // Club & Team Space
        'Câu Lạc Bộ',
        'Đội Của Tôi',
        'Bảng Tin & Kudos',
        'Trợ Lý AI',
        'Hoạt Động & Biểu Quyết',
        // Club Admin Portal
        'Thành Viên',
        'Thiết Lập Giải',
        'Kiểm Duyệt Bài',
        'Tài Chính & Quỹ',
        'Truyền Thông & Chốt Tuần',
        // Super Admin Portal
        'Giám Sát Hệ Thống',
        'Quản Lý Tenant',
        'Phân Quyền (RBAC)',
        'Tham Số Hệ Thống'
      ];

      const allItems = groups.flatMap(g => g.items);
      if (allItems.length !== 19) {
        throw new Error(`Expected 19 items, got ${allItems.length}`);
      }

      for (let i = 0; i < 19; i++) {
        const item = allItems[i];
        const expected = expectedTitles[i];
        if (item.title !== expected) {
          throw new Error(`Item ${i} (${item.id}): expected title "${expected}", got "${item.title}"`);
        }
        // Verify dynamic status badges are eliminated to keep sidebar uncluttered
        if (item.badge && item.badge.trim() !== '') {
          throw new Error(`Item ${i} (${item.id}) still has dynamic status badge: "${item.badge}"`);
        }
      }
    });

    runner.test('AC-SAAS-V3-02 to AC-SAAS-V3-05: Multi-Role Context Switcher, Bottom Bar & Optimistic Submissions', () => {
      // 1. Context Switcher Roles verification
      const roles = useCase.getPortalRoles();
      if (roles.length !== 5) throw new Error('Expected 5 available roles');

      // 2. Optimistic submission verification via store and race increment
      const initialRace = dataStore.getRaceDashboardOverview('race-season-10');
      const startKm = initialRace.kpis.totalAccumulatedKm;

      const actId = 'test-opt-' + Date.now();
      dataStore.saveActivity({
        id: actId,
        userId: 'user-01',
        stravaActivityId: 'opt-123',
        name: 'Optimistic Road Run',
        distanceKm: 5.0,
        movingTimeSec: 1500,
        elapsedTimeSec: 1500,
        elevationGainM: 20,
        startDate: new Date().toISOString(),
        status: 'VALID',
        raceId: 'race-season-10',
        submissionSource: 'manual_optimistic',
        heartRateAvg: 148,
        createdAt: new Date().toISOString()
      } as any);

      const newKm = dataStore.incrementRaceDistance('race-season-10', 5.0);
      if (newKm <= startKm) {
        throw new Error(`Expected incremented distance > ${startKm}, got ${newKm}`);
      }

      const updatedRace = dataStore.getRaceDashboardOverview('race-season-10');
      if (updatedRace.kpis.totalAccumulatedKm !== newKm) {
        throw new Error('Race total accumulated distance failed to reflect optimistic increment');
      }
    });

    runner.test('AC-MANTIS-DEFAULT-01: Mantis Material UI as Default System Theme', () => {
      const html = getFrontendHtml();

      // 1. Initial body tag specifies mantis theme
      if (!html.includes('data-theme="mantis"')) {
        throw new Error('Default body missing data-theme="mantis"');
      }
      if (!html.includes('theme-mantis')) {
        throw new Error('Default body class missing theme-mantis');
      }

      // 2. Mantis layout elements are active (not hidden)
      if (html.includes('<aside id="mantis-sidebar" class="hidden')) {
        throw new Error('Mantis sidebar should not be hidden by default');
      }
      if (html.includes('<header id="mantis-header" class="hidden')) {
        throw new Error('Mantis header should not be hidden by default');
      }
      if (html.includes('<div id="mantis-dashboard-view" class="hidden')) {
        throw new Error('Mantis dashboard view should not be hidden by default');
      }

      // 3. Sport Cam layout elements are hidden by default
      if (!html.includes('<aside id="slim-rail" class="hidden')) {
        throw new Error('Sport slim rail should be hidden by default');
      }
      if (!html.includes('<header id="openrace-header" class="hidden')) {
        throw new Error('Sport openrace header should be hidden by default');
      }
      if (!html.includes('<div id="sub-nav-bar" class="hidden')) {
        throw new Error('Sport sub nav bar should be hidden by default');
      }
      if (!html.includes('<div id="openrace-dashboard-view" class="hidden')) {
        throw new Error('Sport dashboard view should be hidden by default');
      }

      // 4. Default client hydration logic defaults to mantis
      if (!html.includes("if (savedUiTheme === 'sport')")) {
        throw new Error('Client theme hydration should only switch to sport if explicitly saved');
      }
      if (!html.includes("setAppTheme('mantis', false)")) {
        throw new Error('Client theme hydration should default to mantis');
      }
    });
  });
}
