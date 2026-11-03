'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import AddExpense from './AddExpense';

export default function Dashboard() {
  const {
    expenses,
    members,
    totalExpenses,
    suggestedSettlements,
    memberStats,
    resetData,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);

  // Recent 4 expenses
  const recentExpenses = expenses.slice(0, 4);

  // Average per member
  const averagePerMember =
    members.length > 0 ? (totalExpenses / members.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-l from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-3 py-1 rounded-full mb-3 inline-block">
            نظام إدارة مصاريف السكن
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            أهلاً بك في سَكَن 🏠
          </h1>
          <p className="text-sm text-emerald-100 mt-2 max-w-xl leading-relaxed">
            تتبع مصاريف الشقة المشتركة، قسم الفواتير بين الساكنين، وصفّي الحسابات بضغطة زر وبدون إحراج.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 font-bold rounded-2xl text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>+</span>
            <span>إضافة مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
            💰
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              إجمالي المصاريف
            </span>
            <span suppressHydrationWarning className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalExpenses.toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Members Count */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
            👥
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              أفراد السكن
            </span>
            <span suppressHydrationWarning className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {members.length} ساكنين
            </span>
          </div>
        </div>

        {/* Average per member */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 text-2xl font-bold">
            ⚖️
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              متوسط نصيب الفرد
            </span>
            <span suppressHydrationWarning className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {Number(averagePerMember).toLocaleString()} ج.م
            </span>
          </div>
        </div>

        {/* Suggested settlements count */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-bold">
            🤝
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">
              تسويات معلقة
            </span>
            <span suppressHydrationWarning className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {suggestedSettlements.length} تحويلات
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🧾</span>
                <span>آخر المصاريف المسجلة</span>
              </h2>
              <Link
                href="/expenses"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                عرض كل المصاريف ←
              </Link>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                لا توجد مصاريف مسجلة حتى الآن.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentExpenses.map((exp) => {
                  const payer = members.find((m) => m.id === exp.paidBy);
                  return (
                    <div
                      key={exp.id}
                      className="py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-base font-bold">
                          {exp.category === 'فواتير'
                            ? '⚡'
                            : exp.category === 'طعام'
                            ? '🍔'
                            : exp.category === 'إنترنت'
                            ? '🌐'
                            : '🛒'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {exp.title}
                          </p>
                          <p className="text-xs text-zinc-400">
                            دفعها {payer ? payer.name : 'غير محدد'} • {exp.date}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                          {exp.amount.toLocaleString()} ج.م
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          مقسم على {exp.splitBetween?.length || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/expenses"
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 transition-all text-center block group"
            >
              <span className="text-2xl block mb-1">💸</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 block">
                سجل المصاريف
              </span>
              <span className="text-[11px] text-zinc-400">
                إدارة وفلترة كل المصاريف
              </span>
            </Link>

            <Link
              href="/settlements"
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 transition-all text-center block group"
            >
              <span className="text-2xl block mb-1">🤝</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 block">
                تصفية الحسابات
              </span>
              <span className="text-[11px] text-zinc-400">
                تسوية الديون المقترحة
              </span>
            </Link>

            <Link
              href="/members"
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 transition-all text-center block group"
            >
              <span className="text-2xl block mb-1">👥</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 block">
                أعضاء السكن
              </span>
              <span className="text-[11px] text-zinc-400">
                إضافة وإدارة الساكنين
              </span>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Roommates Balance Snapshot */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>⚖️</span>
                <span>أرصدة الساكنين</span>
              </h2>
              <Link
                href="/settlements"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                التفاصيل
              </Link>
            </div>

            <div className="space-y-3">
              {members.map((m) => {
                const stats = memberStats[m.id] || { net: 0 };
                const net = Math.round(stats.net * 100) / 100;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          m.color || 'bg-zinc-400'
                        }`}
                      />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {m.name}
                      </span>
                    </div>

                    <div>
                      {net > 0.01 && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          له {net} ج.م
                        </span>
                      )}
                      {net < -0.01 && (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          عليه {Math.abs(net)} ج.م
                        </span>
                      )}
                      {Math.abs(net) <= 0.01 && (
                        <span className="text-zinc-400">خالص</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Settlements Preview */}
          {suggestedSettlements.length > 0 && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1.5">
                <span>💡</span>
                <span>تسوية سريعة مطلوبة:</span>
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <span className="font-semibold">{suggestedSettlements[0].from.name}</span> يدفع{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {suggestedSettlements[0].amount} ج.م
                </span>{' '}
                لـ <span className="font-semibold">{suggestedSettlements[0].to.name}</span>
              </p>
              <Link
                href="/settlements"
                className="mt-3 block text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm"
              >
                عرض كل التسويات
              </Link>
            </div>
          )}

          {/* Reset sample data helper button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('هل تريد استعادة البيانات الافتراضية التجريبية؟')) {
                  resetData();
                }
              }}
              className="w-full text-center text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 py-1"
            >
              🔄 استعادة البيانات التجريبية
            </button>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <AddExpense
              onSuccess={() => setShowAddModal(false)}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

