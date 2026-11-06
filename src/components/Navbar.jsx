'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApartment } from '@/hooks/useApartment';
import { useAuth } from '@/hooks/useAuth';
import AddExpenseModal from './AddExpenseModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { apartment, isSupabaseConnected } = useApartment();
  const { user, logout } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: '🏠' },
    { href: '/expenses', label: 'المصاريف', icon: '💸' },
    { href: '/settlements', label: 'التسويات', icon: '🤝' },
    { href: '/members', label: 'الساكنين', icon: '👥' },
    { href: '/settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Apartment Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
                س
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-100 block leading-tight">
                  سَكَن سبليت
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold block -mt-0.5">
                  {apartment.name}
                </span>
              </div>
            </Link>

            {/* Supabase status badge */}
            <span
              title={
                isSupabaseConnected
                  ? 'متصل بقاعدة بيانات Supabase'
                  : 'يعمل محلياً (وضع عدم الاتصال)'
              }
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isSupabaseConnected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-zinc-150 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              />
              <span className="hidden md:inline">
                {isSupabaseConnected ? 'سحابي (Supabase)' : 'تخزين محلي'}
              </span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!user) {
                  router.push('/login');
                  return;
                }
                setShowAddModal(true);
              }}
              className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span className="text-base font-extrabold">+</span>
              <span className="hidden sm:inline">إضافة مصروف</span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px]">
                    {user.name.charAt(0)}
                  </span>
                  <span className="hidden sm:inline font-extrabold truncate max-w-[85px]">
                    {user.name}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] hidden md:inline bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1 py-0.2 rounded font-bold">
                      مشرف
                    </span>
                  )}
                </div>

                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-500 hover:text-rose-600 transition-all text-xs font-bold"
                >
                  <span className="hidden sm:inline">خروج</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </div>
            ) : ''}
          </div>
        </div>
      </header>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

