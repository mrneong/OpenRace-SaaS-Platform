'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AthleteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userData: any) => void;
}

export function AthleteRegistrationModal({
  isOpen,
  onClose,
  onSuccess
}: AthleteRegistrationModalProps) {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Nam');
  const [birthDate, setBirthDate] = useState('1995-05-15');

  if (!isOpen) return null;

  /**
   * Handle Google OAuth 2.0 Sign-In via NextAuth.js
   * - Triggers signIn('google', { callbackUrl: '/dashboard' })
   * - Sets isLoading = true during authorization handshake
   * - Provides clear error alerts and success feedback
   */
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Execute NextAuth Google Provider sign-in
      const res = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      });

      if (res?.error) {
        setErrorMessage(
          res.error === 'OAuthSignin' || res.error === 'OAuthCallback'
            ? 'Lỗi xác thực OAuth từ Google. Vui lòng kiểm tra quyền tài khoản hoặc cấu hình Client ID.'
            : `Đăng nhập Google không thành công: ${res.error}`
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Xác thực tài khoản Google thành công! Đang chuyển hướng...');
      if (onSuccess) {
        onSuccess({ email, provider: 'GOOGLE' });
      }

      // Smooth transition to dashboard or onboarding
      setTimeout(() => {
        setIsLoading(false);
        if (res?.url) {
          window.location.href = res.url;
        } else {
          window.location.href = '/dashboard';
        }
      }, 800);
    } catch (err: any) {
      console.error('Google Sign-in Exception:', err);
      setErrorMessage(
        err?.message || 'Không thể kết nối đến máy chủ xác thực Google. Vui lòng thử lại sau.'
      );
      setIsLoading(false);
    }
  };

  /**
   * Handle standard Email & Password registration
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ và tên và địa chỉ Email.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'register'
        ? { fullName, email, password, phone, gender, birthDate }
        : { identity: email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Thao tác không thành công');
      }

      setSuccessMessage(
        authMode === 'register'
          ? 'Đăng ký tài khoản VĐV thành công! Bắt đầu tạo hồ sơ thi đấu...'
          : 'Đăng nhập thành công!'
      );

      if (onSuccess) onSuccess(data.user);

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi xử lý xác thực');
      setIsLoading(false);
    }
  };

  return (
    <div
      id="modal-auth-gateway"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden relative my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer text-sm font-bold disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl mb-3 shadow-inner">
            🏃
          </div>
          <h3 id="auth-gateway-title" className="text-xl font-black">
            Cổng Đăng Ký Vận Động Viên
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            Đăng nhập nhanh bằng Google OAuth 2.0 hoặc tạo tài khoản để nhận BIB và gia nhập CLB
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              id="btn-auth-tab-register"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition text-center cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Đăng Ký Thành Viên
            </button>
            <button
              type="button"
              id="btn-auth-tab-login"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition text-center cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Đăng Nhập
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              id="auth-gateway-feedback"
              className="p-3.5 rounded-2xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-start gap-2.5 animate-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-start gap-2.5 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* 1. Google OAuth 2.0 Real Button */}
          <div>
            <button
              type="button"
              id="btn-google-auth-trigger"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
                  <span id="btn-google-auth-text">Đang kết nối tài khoản Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span id="btn-google-auth-text">Tiếp tục bằng tài khoản Google</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">
              HOẶC TIẾP TỤC VỚI EMAIL
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {authMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="auth-reg-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {authMode === 'register' ? 'Email' : 'Email hoặc Tên đăng nhập'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type={authMode === 'register' ? 'email' : 'text'}
                id={authMode === 'register' ? 'auth-reg-email' : 'auth-login-identity'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.vn"
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Mật khẩu <span className="text-rose-500">*</span> (Tối thiểu 6 ký tự)
              </label>
              <input
                type="password"
                id={authMode === 'register' ? 'auth-reg-password' : 'auth-login-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                required
              />
            </div>

            {authMode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="auth-reg-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      disabled={isLoading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      id="auth-reg-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    id="auth-reg-birthdate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-2 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : authMode === 'register' ? (
                <>
                  <span>🚀</span>
                  <span>Đăng Ký & Tạo Hồ Sơ VĐV</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Đăng Nhập Ngay</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
