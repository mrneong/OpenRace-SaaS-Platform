/**
 * Role-Based Navigation & Dynamic Sidebar Unit Test Suite
 * Tests AC-ROLE-NAV-01 to AC-ROLE-NAV-05
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { NavigationRoleUseCase } from './navigation-role.use-case';

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
  });
}
