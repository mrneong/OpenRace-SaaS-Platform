/**
 * User Management & Authentication Use Case (TypeScript)
 * Handles User Registration, Google OAuth 2.0 Integration, 3-Step Profile Onboarding,
 * Club & Race Enrollment, and Administration Governance.
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import type { SystemUser, UserEnrolledClub, UserEnrolledRace } from '../../domain/models/models';

export interface RegisterUserDto {
  username?: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
}

export interface GoogleAuthDto {
  googleEmail: string;
  googleName: string;
  googlePicture?: string;
  googleSub?: string;
}

export interface ProfileOnboardingDto {
  userId?: string;
  shirtSize?: string;
  targetDistance?: string;
  avgPace?: string;
  emergencyContact?: string;
}

export interface ClubEnrollDto {
  userId?: string;
  clubId: string;
  clubName?: string;
  teamId?: string;
  teamName?: string;
}

export interface RaceEnrollDto {
  userId?: string;
  raceId: string;
  raceName?: string;
  category?: string;
}

export interface UserAuthResponse {
  success: boolean;
  userId: string;
  token: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  isNewUser: boolean;
  user: SystemUser;
  message?: string;
}

export class UserManagementUseCase {
  constructor(private readonly dataStore: InMemoryDataStore) {}

  /**
   * [AC-USER-AUTH-REGISTER-01] Register new user with email & password
   */
  register(dto: RegisterUserDto): UserAuthResponse {
    if (!dto.email || !dto.fullName) {
      throw new Error('Email và Họ tên là các trường bắt buộc');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(dto.email)) {
      throw new Error('Định dạng email không hợp lệ');
    }

    if (dto.password && dto.password.length < 6) {
      throw new Error('Mật khẩu phải có độ dài tối thiểu 6 ký tự');
    }

    const result = this.dataStore.registerUser(dto);
    return {
      success: true,
      userId: result.user.id,
      token: result.token,
      authProvider: 'LOCAL',
      isNewUser: result.isNewUser,
      user: result.user,
      message: result.isNewUser ? 'Đăng ký tài khoản thành viên thành công' : 'Tài khoản đã tồn tại, đăng nhập thành công'
    };
  }

  /**
   * [AC-USER-AUTH-GOOGLE-02] 1-Touch Google OAuth 2.0 Sign-In & Profile Sync
   */
  loginWithGoogle(dto: GoogleAuthDto): UserAuthResponse {
    if (!dto.googleEmail || !dto.googleName) {
      throw new Error('Thông tin Google OAuth không hợp lệ');
    }

    const result = this.dataStore.authenticateGoogleUser(dto);
    return {
      success: true,
      userId: result.user.id,
      token: result.token,
      authProvider: 'GOOGLE',
      isNewUser: result.isNewUser,
      user: result.user,
      message: result.isNewUser ? 'Đăng ký nhanh bằng tài khoản Google thành công' : 'Đăng nhập Google thành công'
    };
  }

  /**
   * Local login with username/email & password
   */
  login(identity: string, password?: string): UserAuthResponse {
    const identLower = identity.trim().toLowerCase();
    const user = Array.from(this.dataStore.systemUsers.values()).find(
      u => u.email.toLowerCase() === identLower || u.username.toLowerCase() === identLower
    );

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (user.status === 'DEACTIVATED') {
      throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên.');
    }

    user.lastLoginAt = new Date().toISOString();
    return {
      success: true,
      userId: user.id,
      token: `jwt_token_${user.id}_${Date.now()}`,
      authProvider: user.authProvider || 'LOCAL',
      isNewUser: false,
      user,
      message: 'Đăng nhập thành công'
    };
  }

  /**
   * [AC-USER-PROFILE-ONBOARDING-03] Save athletic onboarding profile details
   */
  saveProfileOnboarding(userId: string, dto: ProfileOnboardingDto): { success: boolean; user: SystemUser; message: string } {
    const targetUserId = userId || dto.userId || 'user-01';
    const updatedUser = this.dataStore.saveUserOnboardingProfile(targetUserId, dto);
    return {
      success: true,
      user: updatedUser,
      message: 'Đã hoàn thiện hồ sơ thể thao và thông số vận động viên thành công'
    };
  }

  /**
   * [AC-USER-CLUB-JOIN-ONBOARDING-04] Enroll member into Club & Squad
   */
  enrollClub(userId: string, dto: ClubEnrollDto): { success: boolean; user: SystemUser; enrolledClub: UserEnrolledClub; totalClubs: number; message: string } {
    const targetUserId = userId || dto.userId || 'user-01';
    const clubName = dto.clubName || (dto.clubId === 'club-sarc' ? 'CLB SARC Running Club' :
      dto.clubId === 'club-hrc' ? 'CLB Chạy Bộ Hà Nội (HRC)' :
      dto.clubId === 'club-danang' ? 'CLB Đà Nẵng Runners' : 'CLB Sài Gòn Trail & Ultra Runners');
    
    const teamName = dto.teamName || (dto.teamId === 'team-phoenix' ? 'Team Phoenix SARC' :
      dto.teamId === 'team-tigers' ? 'Team Tigers SARC' :
      dto.teamId === 'team-eagles' ? 'Team Eagles SARC' : 'Đội Phong Trào');

    const updatedUser = this.dataStore.enrollUserInClub(targetUserId, {
      clubId: dto.clubId,
      clubName,
      teamId: dto.teamId || 'team-phoenix',
      teamName
    });

    const enrolled = updatedUser.enrolledClubs?.find(c => c.clubId === dto.clubId) || {
      clubId: dto.clubId,
      clubName,
      enrolledAt: new Date().toISOString()
    };

    return {
      success: true,
      user: updatedUser,
      enrolledClub: enrolled,
      totalClubs: updatedUser.enrolledClubs?.length || 1,
      message: `Đã gia nhập thành công ${clubName} (${teamName})`
    };
  }

  /**
   * [AC-USER-RACE-JOIN-ONBOARDING-05] Enroll user in Tournament with auto BIB allocation
   */
  enrollRace(userId: string, dto: RaceEnrollDto): { success: boolean; user: SystemUser; enrolledRace: UserEnrolledRace; assignedBib: string; message: string } {
    const targetUserId = userId || dto.userId || 'user-01';
    const raceName = dto.raceName || (dto.raceId === 'race-season-10' ? 'MÙA 10 RUN TO TECHCOMBANK 2026 — SADC/SARC' :
      dto.raceId === 'race-trail-bavi' ? 'SARC TRAIL CHALLENGE BA VÌ 2026' : 'GIẢI CHẠY ĐÊM SARC HERITAGE EKIDEN 2027');

    const result = this.dataStore.enrollUserInRace(targetUserId, {
      raceId: dto.raceId,
      raceName,
      category: dto.category || '21km Half Marathon'
    });

    const enrolled = result.user.enrolledRaces?.find(r => r.raceId === dto.raceId) || {
      raceId: dto.raceId,
      raceName,
      bib: result.assignedBib,
      enrolledAt: new Date().toISOString()
    };

    return {
      success: true,
      user: result.user,
      enrolledRace: enrolled,
      assignedBib: result.assignedBib,
      message: `Đã đăng ký thành công giải ${raceName} với số BIB ${result.assignedBib}`
    };
  }

  /**
   * [AC-USER-ADMIN-MANAGEMENT-06] Get All Users for Administrative Governance
   */
  getAdminUsers(filter?: { status?: string; roleId?: string; authProvider?: string; search?: string }): {
    totalUsers: number;
    activeUsers: number;
    googleUsers: number;
    onboardedUsers: number;
    users: SystemUser[];
  } {
    let list = this.dataStore.getSystemUsers(filter);
    if (filter?.authProvider && filter.authProvider !== 'ALL') {
      list = list.filter(u => u.authProvider === filter.authProvider);
    }

    const all = Array.from(this.dataStore.systemUsers.values());
    return {
      totalUsers: all.length,
      activeUsers: all.filter(u => u.status === 'ACTIVE').length,
      googleUsers: all.filter(u => u.authProvider === 'GOOGLE').length,
      onboardedUsers: all.filter(u => u.onboardingCompleted).length,
      users: list
    };
  }

  /**
   * Toggle user active/deactivated status
   */
  toggleUserStatus(userId: string, actorId: string = 'admin-01', reason?: string): { success: boolean; user: SystemUser; message: string } {
    const user = this.dataStore.toggleSystemUserStatus(userId, actorId, reason);
    return {
      success: true,
      user,
      message: `Đã ${user.status === 'ACTIVE' ? 'mở khóa' : 'tạm khóa'} tài khoản người dùng ${user.fullName}`
    };
  }
}

