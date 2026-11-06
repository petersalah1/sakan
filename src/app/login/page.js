'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApartment } from '@/hooks/useApartment';

function LoginContent() {
  const router = useRouter();
  const { user, loading, loginWithPhone, loginAsAdmin, logout } = useAuth();
  const { apartment } = useApartment();

  const [activeTab, setActiveTab] = useState('member'); // 'member' | 'admin'
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Roommate Phone Login
  const handleMemberLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await loginWithPhone(phone);
    if (res.success) {
      setSuccessMsg(`أهلاً بك يا ${res.user.name}! جاري الدخول...`);
      setTimeout(() => router.push('/'), 600);
    } else {
      setError(res.error || 'تعذر تسجيل الدخول');
    }
  };

  // Handle Admin Peter Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await loginAsAdmin(adminPin);
    if (res.success) {
      setSuccessMsg('مرحباً بك يا بيتر! جاري الدخول كمدير للسكن...');
      setTimeout(() => router.push('/'), 600);
    } else {
      setError(res.error || 'رمز المرور غير صحيح');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-2">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-3xl flex items-center justify-center mx-auto mb-3 shadow-md">
            س
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            سَكَن سبليت 🏠
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {apartment.name} • متابعة وتصفية مصاريف الشقة
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-200 dark:border-emerald-800">
            <span>🔒</span>
            <span>الدخول بدعوة وإضافة مسبقة من المشرف بيتر صلاح فقط</span>
          </div>
        </div>

        {/* If already logged in */}
        {user && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mb-3">
              أنت مسجل حالياً كـ: <strong>{user.name}</strong>{' '}
              {user.role === 'admin' ? '👑 (المشرف)' : '👤 (ساكن)'}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all"
              >
                الذهاب للوحة المصاريف
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-6 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab('member');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'member'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            دخول الساكن
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            دخول المشرف (بيتر)
          </button>
        </div>

        {/* TAB 1: ROOMMATE PHONE LOGIN */}
        {activeTab === 'member' && (
          <form onSubmit={handleMemberLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                رقم هاتفك المسجل *
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-zinc-400 mt-1.5 block leading-relaxed">
                ادخل رقم الهاتف الذي قام المشرف بيتر صلاح بإضافته لحسابك في السكن.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'جاري التحقق من الرقم...' : 'تسجيل الدخول'}
            </button>
          </form>
        )}

        {/* TAB 2: PETER SALAH ADMIN LOGIN */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
              👑 هذا القسم مخصص لبيتر صلاح فقط لإدارة ومتابعة السكن وإضافة الساكنين الجدد.
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                رمز مرور المشرف (PIN) *
              </label>
              <input
                type="password"
                required
                dir="ltr"
                placeholder="••••"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'جاري التحقق...' : 'دخول المشرف'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-xs font-bold text-zinc-400">
          جاري التحميل...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
