'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApartment } from '@/hooks/useApartment';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginAsDemo, loading, user, logout } = useAuth();
  const { members } = useApartment();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMember, setSelectedMember] = useState(members[0]?.name || 'أحمد محمود');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await loginWithEmail(email, password);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'تعذر تسجيل الدخول، يرجى المحاولة مجدداً');
    }
  };

  const handleDemoLogin = (name) => {
    loginAsDemo(name);
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
        {/* Brand Icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-3xl flex items-center justify-center mx-auto mb-3 shadow-md">
            س
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            تسجيل الدخول إلى سَكَن سبليت
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            تابع مصاريفك وفواتير السكن المشترك مع زملائك
          </p>
        </div>

        {user && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mb-2">
              أنت مسجل حالياً باسم: <strong>{user.name}</strong>
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                الذهاب للرئيسية
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 text-xs font-bold rounded-xl"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Demo Fast Login */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-1.5">
            <span>⚡</span>
            <span>دخول تجريبي سريع (بدون كلمة سر):</span>
          </h3>

          <div className="space-y-2">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  الدخول باسم {m.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleDemoLogin(selectedMember)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all"
            >
              متابعة كـ {selectedMember}
            </button>
          </div>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <span className="relative bg-white dark:bg-zinc-900 px-3 text-[11px] font-bold text-zinc-400">
            أو عبر البريد الإلكتروني
          </span>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.99] font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

