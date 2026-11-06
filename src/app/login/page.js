'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useApartment } from '@/hooks/useApartment';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    loginWithIdentifier,
    joinWithInvite,
    loginAsPeter,
    loginAsMember,
    logout,
  } = useAuth();
  const { apartment, members } = useApartment();

  const inviteFromUrl = searchParams.get('invite') || '';

  const [activeTab, setActiveTab] = useState(inviteFromUrl ? 'invite' : 'login');
  const [identifier, setIdentifier] = useState('');
  const [inviteCode, setInviteCode] = useState(inviteFromUrl.toUpperCase());
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedMemberToClaim, setSelectedMemberToClaim] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Login with Phone / Email
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await loginWithIdentifier(identifier);
    if (res.success) {
      setSuccessMsg(`أهلاً بك يا ${res.user.name}! جاري الدخول...`);
      setTimeout(() => router.push('/'), 600);
    } else {
      setError(res.error || 'تعذر تسجيل الدخول');
    }
  };

  // Handle Join with Invite Code
  const handleJoinInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await joinWithInvite({
      inviteCode: inviteCode || apartment.invite_code,
      memberId: selectedMemberToClaim || null,
      name: newName,
      phone: newPhone,
    });

    if (res.success) {
      setSuccessMsg(`تم الانضمام بنجاح! مرحباً بك يا ${res.user.name}`);
      setTimeout(() => router.push('/'), 700);
    } else {
      setError(res.error || 'فشل الانضمام برمز الدعوة');
    }
  };

  // Quick Admin Login
  const handleAdminLogin = async () => {
    setError('');
    const res = await loginAsPeter();
    if (res.success) {
      router.push('/');
    }
  };

  // Quick Roommate Login
  const handleRoommateClick = (member) => {
    loginAsMember(member);
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto py-8 px-2">
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
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
            <span>🔒</span>
            <span>الدخول بدعوة فقط من المشرف بيتر صلاح</span>
          </div>
        </div>

        {/* If already logged in */}
        {user && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mb-3">
              أنت مسجل حالياً كـ: <strong>{user.name}</strong>{' '}
              {user.role === 'admin' && '👑 (المشرف)'}
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
              setActiveTab('login');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('invite');
              setError('');
            }}
            className={`py-2.5 rounded-xl transition-all ${
              activeTab === 'invite'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            انضمام برمز الدعوة
          </button>
        </div>

        {/* TAB 1: FAST LOGIN */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  رقم الهاتف أو البريد الإلكتروني
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="01XXXXXXXXX أو name@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </button>
            </form>

            {/* Quick Member Selection (Roommates already added by Peter) */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 block mb-2.5 text-center">
                أو اختر اسمك المسجل بالسكن للدخول السريع:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {members
                  .filter((m) => m.role !== 'admin')
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleRoommateClick(m)}
                      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-right flex items-center gap-2"
                    >
                      <span className={`w-3 h-3 rounded-full ${m.avatar_color || 'bg-blue-500'}`} />
                      <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                        {m.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Admin Dedicated Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleAdminLogin}
                className="w-full py-2.5 border-2 border-dashed border-emerald-400/60 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
              >
                <span>👑</span>
                <span>دخول المشرف: بيتر صلاح</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: INVITE CODE JOIN */}
        {activeTab === 'invite' && (
          <form onSubmit={handleJoinInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                رمز دعوة السكن *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="مثال: PETER2026"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                اطلب رمز الدعوة من المشرف بيتر صلاح
              </span>
            </div>

            {/* Option to link to existing member name if already listed */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                هل اسمك مسجل بالفعل في قائمة السكن؟
              </label>
              <select
                value={selectedMemberToClaim}
                onChange={(e) => {
                  setSelectedMemberToClaim(e.target.value);
                  if (e.target.value) {
                    const found = members.find((m) => m.id === e.target.value);
                    if (found) setNewName(found.name);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- أنا ساكن جديد تماماً --</option>
                {members
                  .filter((m) => m.role !== 'admin')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      نعم، أنا {m.name}
                    </option>
                  ))}
              </select>
            </div>

            {!selectedMemberToClaim && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  اسمك بالكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف حسام"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                رقم هاتفك *
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="01XXXXXXXXX"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                سيُستخدم لتسجيل دخولك وتلقي إشعارات الحسابات
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'جاري التحقق والانضمام...' : 'تأكيد الدعوة والدخول للسكن'}
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
