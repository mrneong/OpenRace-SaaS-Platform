/**
 * Unit Test Suite for System Administration (IAM, RBAC & Config Catalogs)
 * AC-SYS-01: User Management (Create, Update, Soft Deactivate / Reactivate)
 * AC-SYS-02: Role & RBAC (Create, Update, Soft Deactivate)
 * AC-SYS-03: Config Catalogs (4 Master Sets, Parameter CRUD, Soft Deactivate)
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { AdminManagementUseCase } from './admin-management.use-case';

export function runSystemAdminTests(runner: any) {
  runner.test('AC-SYS-01: User Management CRUD & Non-Destructive Soft Deactivation', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    // 1. List seeded users
    const users = useCase.getSystemUsers();
    runner.expect(users.length >= 8).toBe(true);
    const userA = users.find(u => u.username === 'nguyenvana');
    runner.expect(userA !== undefined).toBe(true);
    runner.expect(userA?.status).toBe('ACTIVE');

    // 2. Create new user
    const newUser = useCase.createSystemUser({
      username: 'runner_test_01',
      fullName: 'Trần Văn Kiểm Thử',
      email: 'kiemthu@openrace.vn',
      phone: '0912345678',
      roleId: 'role-runner-athlete',
      clubId: 'club-sarc',
      teamId: 'team-phoenix',
    }, 'admin-tester');

    runner.expect(newUser.id !== undefined).toBe(true);
    runner.expect(newUser.status).toBe('ACTIVE');
    runner.expect(newUser.fullName).toBe('Trần Văn Kiểm Thử');

    // 3. Update user info
    const updated = useCase.updateSystemUser(newUser.id, {
      fullName: 'Trần Văn Kiểm Thử Đã Đổi Tên',
      phone: '0988776655',
    }, 'admin-tester');
    runner.expect(updated.fullName).toBe('Trần Văn Kiểm Thử Đã Đổi Tên');
    runner.expect(updated.phone).toBe('0988776655');

    // 4. Soft deactivation (Bỏ kích hoạt - KHÔNG XÓA DỮ LIỆU)
    const countBeforeDeactivate = useCase.getSystemUsers().length;
    const deactivated = useCase.toggleSystemUserStatus(newUser.id, 'admin-tester', 'Thử nghiệm bỏ kích hoạt');
    runner.expect(deactivated.status).toBe('DEACTIVATED');

    // Verify record still exists in database (data is preserved!)
    const countAfterDeactivate = useCase.getSystemUsers().length;
    runner.expect(countAfterDeactivate).toBe(countBeforeDeactivate);
    const retrieved = useCase.getSystemUserById(newUser.id);
    runner.expect(retrieved !== undefined).toBe(true);
    runner.expect(retrieved?.status).toBe('DEACTIVATED');

    // 5. Reactivate user
    const reactivated = useCase.toggleSystemUserStatus(newUser.id, 'admin-tester', 'Kích hoạt lại');
    runner.expect(reactivated.status).toBe('ACTIVE');
  });

  runner.test('AC-SYS-02: Role & Permission (RBAC) Management & Soft Deactivation', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    // 1. List roles
    const roles = useCase.getSystemRoles();
    runner.expect(roles.length >= 6).toBe(true);

    const superAdminRole = roles.find(r => r.code === 'SUPER_ADMIN');
    runner.expect(superAdminRole !== undefined).toBe(true);
    runner.expect(superAdminRole?.status).toBe('ACTIVE');

    // 2. Create custom role
    const newRole = useCase.createSystemRole({
      code: 'CHIEF_MARSHAL',
      name: 'Tổng Giám Sát Đường Đua',
      description: 'Điều phối toàn bộ trọng tài và xe dẫn đường',
      permissions: ['activities.verify', 'appeals.manage', 'telemetry.view'],
    }, 'admin-tester');

    runner.expect(newRole.code).toBe('CHIEF_MARSHAL');
    runner.expect(newRole.permissions.length).toBe(3);
    runner.expect(newRole.status).toBe('ACTIVE');

    // 3. Update role
    const updatedRole = useCase.updateSystemRole(newRole.id, {
      name: 'Tổng Giám Sát Đường Đua Cấp Cao',
      permissions: ['activities.verify', 'appeals.manage', 'telemetry.view', 'activities.autotrim'],
    }, 'admin-tester');
    runner.expect(updatedRole.name).toBe('Tổng Giám Sát Đường Đua Cấp Cao');
    runner.expect(updatedRole.permissions.length).toBe(4);

    // 4. Soft deactivation
    const toggled = useCase.toggleSystemRoleStatus(newRole.id, 'admin-tester');
    runner.expect(toggled.status).toBe('DEACTIVATED');

    // Data remains intact
    const fetched = useCase.getSystemRoleById(newRole.id);
    runner.expect(fetched?.status).toBe('DEACTIVATED');
    runner.expect(fetched?.code).toBe('CHIEF_MARSHAL');
  });

  runner.test('AC-SYS-03: System Master Data & 4 Config Catalogs with Soft Deactivation', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    // 1. List catalogs (4 structured catalogs)
    const catalogs = useCase.getSystemCatalogs();
    runner.expect(catalogs.length).toBe(4);
    runner.expect(catalogs.some(c => c.code === 'CATALOG_PACE_RULES')).toBe(true);
    runner.expect(catalogs.some(c => c.code === 'CATALOG_FINANCE_GATEWAY')).toBe(true);
    runner.expect(catalogs.some(c => c.code === 'CATALOG_WEARABLES_INTEGRATION')).toBe(true);
    runner.expect(catalogs.some(c => c.code === 'CATALOG_RACE_LIFECYCLE')).toBe(true);

    // 2. Check Pace Rules parameters
    const paceConfigs = useCase.getSystemConfigs('CATALOG_PACE_RULES');
    runner.expect(paceConfigs.length >= 7).toBe(true);
    const minDistance = paceConfigs.find(c => c.key === 'MIN_DISTANCE_KM');
    runner.expect(minDistance?.value).toBe('3.0');

    // 3. Check VietQR Finance parameters
    const finConfigs = useCase.getSystemConfigs('CATALOG_FINANCE_GATEWAY');
    const binParam = finConfigs.find(c => c.key === 'VIETQR_BANK_BIN');
    runner.expect(binParam?.value).toBe('970422');

    // 4. Create new config parameter
    const newParam = useCase.createSystemConfig({
      catalogCode: 'CATALOG_PACE_RULES',
      key: 'MAX_ELEVATION_GRADE_PCT',
      name: 'Độ dốc tối đa leo dốc hợp lệ',
      value: '45',
      unit: '%',
      dataType: 'number',
      description: 'Độ dốc địa hình tối đa công nhận cho phép chạy bộ địa hình',
    }, 'admin-tester');

    runner.expect(newParam.id !== undefined).toBe(true);
    runner.expect(newParam.status).toBe('ACTIVE');

    // 5. Update config parameter
    const updatedParam = useCase.updateSystemConfig(newParam.id, {
      value: '48',
      description: 'Cập nhật độ dốc địa hình cho chặng trail Everest',
    }, 'admin-tester');
    runner.expect(updatedParam.value).toBe('48');

    // 6. Soft deactivation (Bỏ kích hoạt tham số, không xóa dữ liệu)
    const deactivatedParam = useCase.toggleSystemConfigStatus(newParam.id, 'admin-tester');
    runner.expect(deactivatedParam.status).toBe('DEACTIVATED');

    // Parameter is preserved in catalog
    const allPaceAfter = useCase.getSystemConfigs('CATALOG_PACE_RULES');
    const found = allPaceAfter.find(c => c.id === newParam.id);
    runner.expect(found !== undefined).toBe(true);
    runner.expect(found?.status).toBe('DEACTIVATED');
    runner.expect(found?.value).toBe('48');
  });
}
