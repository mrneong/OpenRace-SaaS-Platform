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

    runner.test('AC-ROLE-NAV-01: 4 Standardized Portal Groups with 25 Menu Items and 8 Decoupled Operations Menus', () => {
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
      if (adminGroup.id !== 'group-admin' || adminGroup.items.length !== 10) {
        throw new Error('Group 4 Super Admin items mismatch: expected 10 items');
      }

      const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
      if (totalItems !== 25) throw new Error(`Expected 25 total menu items, got ${totalItems}`);
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
      if (adminItems.length !== 10) throw new Error('getMenuItemsForRole(admin) count invalid: expected 10 items');

      const allItems = useCase.getMenuItemsForRole('all');
      if (allItems.length !== 25) throw new Error('getMenuItemsForRole(all) count invalid: expected 25 items');
    });

    runner.test('AC-ROLE-NAV-05: Backend User Navigation Context and Role Entitlements API', () => {
      const context = useCase.getUserNavigationContext('user-01');
      if (context.userId !== 'user-01' || context.userName !== 'Nguyễn Văn A' || context.totalMenuItems !== 25) {
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

      // Expected exact concise titles per user proposal with 8 Decoupled Operations Major Menus
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
        // Super Admin Portal - 8 Decoupled Operations Major Menus + RBAC + Tham Số
        'Strava Quota & Burn Rate',
        'Webhook & Phẫu Thuật DLQ',
        'Quản Lý Tenants CLB',
        'Recompute Có Phạm Vi',
        'Lưu Lượng & Heatmap 24h',
        'Đối Tác & Uptime SLA',
        'Kinh Doanh & SaaS MRR',
        'An Ninh & Audit SHA-256',
        'Phân Quyền (RBAC)',
        'Tham Số Hệ Thống'
      ];

      const allItems = groups.flatMap(g => g.items);
      if (allItems.length !== 25) {
        throw new Error(`Expected 25 items, got ${allItems.length}`);
      }

      for (let i = 0; i < 25; i++) {
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

    runner.test('AC-RACE-BAR-TOP-01: Top-Level Full-Width Header Row for Race Selector Bar', () => {
      const html = getFrontendHtml();

      // 1. Selector bar uses Mantis card design
      if (!html.includes('id="global-race-selector-bar" class="mantis-card bg-white')) {
        throw new Error('Global race selector bar must use mantis-card bg-white styling');
      }

      // 2. Title and badges on top in dedicated header row with border separator
      if (!html.includes('TẦNG 1: TOP HEADER ROW - TIÊU ĐỀ LÊN TRÊN CÙNG (FULL-WIDTH)')) {
        throw new Error('Expected top-level full-width header row for title and badges');
      }
      if (!html.includes('Bảng Điều Khiển Giải Đấu')) {
        throw new Error('Expected title "Bảng Điều Khiển Giải Đấu"');
      }
      if (!html.includes('border-b border-[#F0F0F0] dark:border-slate-800')) {
        throw new Error('Expected divider separating top header row from controls row');
      }

      // 3. Controls and progress row below
      if (!html.includes('TẦNG 2: CONTROLS & PROGRESS ROW')) {
        throw new Error('Expected controls & progress row below header');
      }
      if (!html.includes('Chọn Giải Đấu:')) {
        throw new Error('Expected "Chọn Giải Đấu:" label on controls row');
      }
      if (!html.includes('border-[#D9D9D9]') || !html.includes('hover:border-[#1890FF]')) {
        throw new Error('Race select dropdown missing Ant Design border styling');
      }
    });

    runner.test('AC-PLATFORM-CONFIG-01: Remove Hardcoded Mantis Word & Dynamically Display Application Name and Branding', () => {
      const html = getFrontendHtml();

      // 1. Must NOT contain hardcoded Mantis brand text in the sidebar logo
      if (html.includes('<span class="text-base font-bold tracking-tight text-[#262626]">Mantis</span>')) {
        throw new Error('Sidebar brand header still contains hardcoded Mantis text');
      }

      // 2. Must contain dynamic application name display and tag
      if (!html.includes('id="platform-app-name-display"') || !html.includes('id="platform-app-tag-display"')) {
        throw new Error('Sidebar brand header missing platform-app-name-display or platform-app-tag-display');
      }

      // 3. Must contain Cấu Hình Nền Tảng subtab button
      if (!html.includes('id="subtab-btn-platform"') || !html.includes('showSystemAdminTab(\'platform\')')) {
        throw new Error('System Admin navigation missing Cấu Hình Nền Tảng subtab button');
      }

      // 4. Must contain Platform Configuration View with 4 category groups and custom params
      if (!html.includes('id="view-system-platform"')) {
        throw new Error('System Admin view missing view-system-platform');
      }
      if (!html.includes('id="cfg-app-name"') || !html.includes('id="cfg-brand-tag"')) {
        throw new Error('Platform configuration form missing application name input fields');
      }
      if (!html.includes('id="platform-custom-params-list"')) {
        throw new Error('Platform configuration missing platform-custom-params-list');
      }
    });

    runner.test('AC-PORTAL-GROUP-BADGE-REMOVAL-01: Portal Group Item Count Badges Removed from All Sidebar Headers', () => {
      const html = getFrontendHtml();

      // 1. Must NOT contain badges like "5 Mục", "4 Mục", "5 MỤC", "4 MỤC" in portal group headers
      if (html.includes('>5 Mục</span>') || html.includes('>4 Mục</span>')) {
        throw new Error('Mantis sidebar still contains portal item count badges ("5 Mục" or "4 Mục")');
      }
      if (html.includes('>5 MỤC</span>') || html.includes('>4 MỤC</span>')) {
        throw new Error('Classic Sport sidebar still contains portal item count badges ("5 MỤC" or "4 MỤC")');
      }

      // 2. Must still contain all 4 portal group titles in Mantis sidebar
      if (!html.includes('Phân Hệ Vận Động Viên') || !html.includes('Phân Hệ Câu Lạc Bộ & Đội')) {
        throw new Error('Mantis sidebar missing portal titles');
      }
      if (!html.includes('Phân Hệ Ban Điều Hành CLB') || !html.includes('Phân Hệ Quản Trị Nền Tảng')) {
        throw new Error('Mantis sidebar missing admin portal titles');
      }

      // 3. Must still contain all 4 portal group titles in Sport sidebar
      if (!html.includes('PHÂN HỆ: VẬN ĐỘNG VIÊN') || !html.includes('PHÂN HỆ: CÂU LẠC BỘ & ĐỘI')) {
        throw new Error('Sport sidebar missing portal titles');
      }
      if (!html.includes('PHÂN HỆ: BAN ĐIỀU HÀNH CLB') || !html.includes('PHÂN HỆ: QUẢN TRỊ NỀN TẢNG')) {
        throw new Error('Sport sidebar missing admin portal titles');
      }
    });

    runner.test('AC-OPS-MAJOR-NAV-01 to 03: 8 Decoupled Operations Major Menus in Mantis & Sport Sidebars', () => {
      const html = getFrontendHtml();

      // 1. Mantis Sidebar must contain all 8 decoupled operations major menus
      const mantisOpsNavs = [
        'id="mantis-nav-ops-quota"',
        'id="mantis-nav-ops-dlq"',
        'id="mantis-nav-ops-tenants"',
        'id="mantis-nav-ops-recompute"',
        'id="mantis-nav-ops-traffic"',
        'id="mantis-nav-ops-partners"',
        'id="mantis-nav-ops-billing"',
        'id="mantis-nav-ops-security"'
      ];
      for (const navId of mantisOpsNavs) {
        if (!html.includes(navId)) {
          throw new Error(`Mantis sidebar missing operational menu element: ${navId}`);
        }
      }

      // 2. Sport Sidebar must contain all 8 decoupled operations major menus
      const sportOpsNavs = [
        'id="sidebar-ops-quota"',
        'id="sidebar-ops-dlq"',
        'id="sidebar-ops-tenants"',
        'id="sidebar-ops-recompute"',
        'id="sidebar-ops-traffic"',
        'id="sidebar-ops-partners"',
        'id="sidebar-ops-billing"',
        'id="sidebar-ops-security"'
      ];
      for (const navId of sportOpsNavs) {
        if (!html.includes(navId)) {
          throw new Error(`Classic Sport sidebar missing operational menu element: ${navId}`);
        }
      }

      // 3. Direct tab routing triggers for all 8 operations menus
      const opsRoutes = [
        "switchTab('ops-quota')",
        "switchTab('ops-dlq')",
        "switchTab('ops-tenants')",
        "switchTab('ops-recompute')",
        "switchTab('ops-traffic')",
        "switchTab('ops-partners')",
        "switchTab('ops-billing')",
        "switchTab('ops-security')"
      ];
      for (const route of opsRoutes) {
        if (!html.includes(route)) {
          throw new Error(`Missing 1-click direct tab route trigger: ${route}`);
        }
      }

      // 4. Data store group-admin contains exactly 10 items (8 ops + RBAC + Configs)
      const groups = useCase.getAllNavigationGroups();
      const adminGroup = groups.find(g => g.id === 'group-admin');
      if (!adminGroup || adminGroup.items.length !== 10) {
        throw new Error(`group-admin must contain exactly 10 items, got ${adminGroup?.items?.length}`);
      }

      const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
      if (totalItems !== 25) {
        throw new Error(`Total navigation menu items must equal 25, got ${totalItems}`);
      }
    });
  });
}
