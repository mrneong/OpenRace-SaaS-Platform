/**
 * Unit Test Suite for User Management, Google Auth, 3-Step Onboarding & Administration
 * AC-USER-AUTH-REGISTER-01: Member Registration
 * AC-USER-AUTH-GOOGLE-02: 1-Touch Google OAuth 2.0 Sign-In
 * AC-USER-PROFILE-ONBOARDING-03: Athlete Profile Onboarding Wizard (Step 1)
 * AC-USER-CLUB-JOIN-ONBOARDING-04: Club & Squad Enrollment (Step 2)
 * AC-USER-RACE-JOIN-ONBOARDING-05: Race Enrollment & Auto BIB (Step 3)
 * AC-USER-ADMIN-MANAGEMENT-06: Admin User Directory & Non-Destructive Status Governance
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { UserManagementUseCase } from './user-management.use-case';

export function runUserManagementTests(runner: any) {
  runner.test('AC-USER-AUTH-REGISTER-01: Register new user with validation and profile creation', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    // 1. Validation: Missing email / fullName
    let failedMissing = false;
    try {
      useCase.register({ email: '', fullName: '' });
    } catch (e: any) {
      failedMissing = true;
      runner.expect(e.message.includes('bắt buộc')).toBe(true);
    }
    runner.expect(failedMissing).toBe(true);

    // 2. Validation: Invalid email format
    let failedEmail = false;
    try {
      useCase.register({ email: 'invalid-email', fullName: 'Tester' });
    } catch (e: any) {
      failedEmail = true;
      runner.expect(e.message.includes('không hợp lệ')).toBe(true);
    }
    runner.expect(failedEmail).toBe(true);

    // 3. Validation: Password min length
    let failedPass = false;
    try {
      useCase.register({ email: 'valid@openrace.vn', fullName: 'Tester', password: '123' });
    } catch (e: any) {
      failedPass = true;
      runner.expect(e.message.includes('tối thiểu 6 ký tự')).toBe(true);
    }
    runner.expect(failedPass).toBe(true);

    // 4. Successful registration
    const res = useCase.register({
      fullName: 'Trịnh Thăng Bình',
      email: 'binh.trinh@openrace.vn',
      password: 'password123',
      phone: '0987654321',
      gender: 'Nam',
      birthDate: '1995-10-12'
    });

    runner.expect(res.success).toBe(true);
    runner.expect(res.isNewUser).toBe(true);
    runner.expect(res.authProvider).toBe('LOCAL');
    runner.expect(res.user.fullName).toBe('Trịnh Thăng Bình');
    runner.expect(res.user.email).toBe('binh.trinh@openrace.vn');
    runner.expect(res.user.gender).toBe('Nam');
    runner.expect(res.user.onboardingCompleted).toBe(false);

    // 5. Duplicate registration acts as login
    const resDup = useCase.register({
      fullName: 'Trịnh Thăng Bình',
      email: 'binh.trinh@openrace.vn',
      password: 'password123'
    });
    runner.expect(resDup.success).toBe(true);
    runner.expect(resDup.isNewUser).toBe(false);
  });

  runner.test('AC-USER-AUTH-GOOGLE-02: 1-Touch Google OAuth Sign-In & Profile Sync', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    // 1. First time Google login creates account
    const gAuth = useCase.loginWithGoogle({
      googleEmail: 'runner.google@gmail.com',
      googleName: 'Lê Hoàng Yến',
      googlePicture: 'https://lh3.googleusercontent.com/a/mock-yen-avatar',
      googleSub: 'google-sub-998877'
    });

    runner.expect(gAuth.success).toBe(true);
    runner.expect(gAuth.isNewUser).toBe(true);
    runner.expect(gAuth.authProvider).toBe('GOOGLE');
    runner.expect(gAuth.user.fullName).toBe('Lê Hoàng Yến');
    runner.expect(gAuth.user.email).toBe('runner.google@gmail.com');
    runner.expect(gAuth.user.avatarUrl).toBe('https://lh3.googleusercontent.com/a/mock-yen-avatar');

    // 2. Existing Google login updates lastLogin
    const gAuth2 = useCase.loginWithGoogle({
      googleEmail: 'runner.google@gmail.com',
      googleName: 'Lê Hoàng Yến'
    });
    runner.expect(gAuth2.success).toBe(true);
    runner.expect(gAuth2.isNewUser).toBe(false);
  });

  runner.test('AC-USER-PROFILE-ONBOARDING-03: Athlete Profile Onboarding Wizard Step 1', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    const reg = useCase.register({
      fullName: 'Vũ Minh Tuấn',
      email: 'tuan.vu@running.vn',
      password: 'securePassword!'
    });

    const profileRes = useCase.saveProfileOnboarding(reg.userId, {
      shirtSize: 'XL',
      targetDistance: '42km Full Marathon',
      avgPace: '5:15 min/km',
      emergencyContact: 'Vũ Thị Loan (Chị gái) - 0912998877'
    });

    runner.expect(profileRes.success).toBe(true);
    runner.expect(profileRes.user.shirtSize).toBe('XL');
    runner.expect(profileRes.user.targetDistance).toBe('42km Full Marathon');
    runner.expect(profileRes.user.avgPace).toBe('5:15 min/km');
    runner.expect(profileRes.user.emergencyContact).toBe('Vũ Thị Loan (Chị gái) - 0912998877');
    runner.expect(profileRes.user.onboardingCompleted).toBe(true);
  });

  runner.test('AC-USER-CLUB-JOIN-ONBOARDING-04: Club & Squad Enrollment Step 2', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    const reg = useCase.register({
      fullName: 'Phan Bảo Ngọc',
      email: 'ngoc.phan@running.vn'
    });

    const clubRes = useCase.enrollClub(reg.userId, {
      clubId: 'club-danang',
      clubName: 'CLB Đà Nẵng Runners',
      teamId: 'team-song-bien',
      teamName: 'Đội Sóng Biển'
    });

    runner.expect(clubRes.success).toBe(true);
    runner.expect(clubRes.user.clubId).toBe('club-danang');
    runner.expect(clubRes.user.clubName).toBe('CLB Đà Nẵng Runners');
    runner.expect(clubRes.user.teamId).toBe('team-song-bien');
    runner.expect(clubRes.user.enrolledClubs?.length).toBe(1);
    runner.expect(clubRes.user.enrolledClubs?.[0].clubId).toBe('club-danang');
  });

  runner.test('AC-USER-RACE-JOIN-ONBOARDING-05: Race Enrollment with Auto Electronic BIB Step 3', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    const reg = useCase.register({
      fullName: 'Đỗ Hữu Nghĩa',
      email: 'nghia.do@running.vn'
    });

    const raceRes = useCase.enrollRace(reg.userId, {
      raceId: 'race-season-10',
      raceName: 'MÙA 10 RUN TO TECHCOMBANK 2026 — SADC/SARC',
      category: '21km Half Marathon'
    });

    runner.expect(raceRes.success).toBe(true);
    runner.expect(raceRes.assignedBib.startsWith('BIB-')).toBe(true);
    runner.expect(raceRes.user.enrolledRaces?.length).toBe(1);
    runner.expect(raceRes.user.enrolledRaces?.[0].raceId).toBe('race-season-10');
    runner.expect(raceRes.user.enrolledRaces?.[0].bib).toBe(raceRes.assignedBib);
  });

  runner.test('AC-USER-ADMIN-MANAGEMENT-06: Admin User Directory, Filter & Soft Status Toggle', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    // 1. Get all users
    const allUsers = useCase.getAdminUsers();
    runner.expect(allUsers.totalUsers >= 8).toBe(true);
    runner.expect(allUsers.activeUsers >= 5).toBe(true);

    // 2. Filter by Google provider
    const googleUsers = useCase.getAdminUsers({ authProvider: 'GOOGLE' });
    runner.expect(googleUsers.users.every(u => u.authProvider === 'GOOGLE')).toBe(true);

    // 3. Toggle Status of a user
    const toggleRes = useCase.toggleUserStatus('usr-008', 'admin-tester', 'Kích hoạt lại tài khoản');
    runner.expect(toggleRes.success).toBe(true);
    runner.expect(toggleRes.user.status).toBe('ACTIVE');

    // Toggle back to deactivated
    const toggleBack = useCase.toggleUserStatus('usr-008', 'admin-tester', 'Tạm khóa lại');
    runner.expect(toggleBack.user.status).toBe('DEACTIVATED');
  });

  runner.test('AC-USER-GOOGLE-AUTH-NEXTAUTH-01 & DB-SYNC-02: Google OAuth Profile Sync with Default ATHLETE Role', () => {
    const store = new InMemoryDataStore();
    const useCase = new UserManagementUseCase(store);

    // Scenario 1: New Google OAuth user gets role ATHLETE automatically
    const newAthleteAuth = useCase.loginWithGoogle({
      googleEmail: 'athlete.newbie@gmail.com',
      googleName: 'Đặng Thùy Dương',
      googlePicture: 'https://lh3.googleusercontent.com/a/duong-profile.jpg',
      googleSub: 'google-sub-unique-776655'
    });

    runner.expect(newAthleteAuth.success).toBe(true);
    runner.expect(newAthleteAuth.isNewUser).toBe(true);
    runner.expect(newAthleteAuth.user.role).toBe('ATHLETE');
    runner.expect(newAthleteAuth.user.roleName).toBe('Vận Động Viên (Runner)');
    runner.expect(newAthleteAuth.user.authProvider).toBe('GOOGLE');
    runner.expect(newAthleteAuth.user.avatarUrl).toBe('https://lh3.googleusercontent.com/a/duong-profile.jpg');
    runner.expect(newAthleteAuth.user.email).toBe('athlete.newbie@gmail.com');

    // Scenario 2: Existing Google OAuth user gets profile updated without losing permissions
    const existingAthleteAuth = useCase.loginWithGoogle({
      googleEmail: 'athlete.newbie@gmail.com',
      googleName: 'Đặng Thùy Dương (Updated)',
      googlePicture: 'https://lh3.googleusercontent.com/a/duong-profile-v2.jpg'
    });

    runner.expect(existingAthleteAuth.success).toBe(true);
    runner.expect(existingAthleteAuth.isNewUser).toBe(false);
    runner.expect(existingAthleteAuth.user.fullName).toBe('Đặng Thùy Dương (Updated)');
    runner.expect(existingAthleteAuth.user.avatarUrl).toBe('https://lh3.googleusercontent.com/a/duong-profile-v2.jpg');
    runner.expect(existingAthleteAuth.user.role).toBe('ATHLETE');
  });
}

