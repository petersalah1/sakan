'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApartment } from '@/hooks/useApartment';
import { formatCurrency } from '@/utils/currency';
import { getCategoryById } from '@/utils/categories';
import StatCard from './StatCard';
import AddExpenseModal from './AddExpenseModal';
import SettleModal from './SettleModal';

export default function Dashboard() {
  const {
    apartment,
    members,
    expenses,
    totalExpenses,
    suggestedSettlements,
    memberStats,
  } = useApartment();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSettlement, setActiveSettlement] = useState(null);

  const recentExpenses = expenses.slice(0, 5);
  const averageShare =
    members.length > 0 ? (totalExpenses / members.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-white/20 px-3 py-1 rounded-full mb-3 inline-block">
              نظام إدارة مصاريف الشقة الذكي
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              أهلاً بك في {apartment.name} 🏠
            </h1>
            <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
              سجل كل فواتير ومصاريف السكن المشتركة، واعرف فوراً مين عليه فلوس ومين له فلوس بدون إحراج أو حسابات معقدة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>تسجيل مصروف جديد</span>
            </button>

            <Link
              href="/settlements"
              className="px-4 py-3 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <span>🤝</span>
              <span>تصفية الحسابات</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المصاريف"
          value={formatCurrency(totalExpenses, apartment.currency)}
          subtitle="المجموع الكلي للمصاريف المشتركة"
          icon="💰"
          color="emerald"
        />

        <StatCard
          title="أفراد الشقة"
          value={`${members.length} ساكنين`}
          subtitle="الأعضاء المسجلين في السكن"
          icon="👥"
          color="blue"
        />

        <StatCard
          title="متوسط نصيب الفرد"
          value={formatCurrency(averageShare, apartment.currency)}
          subtitle="إذا تم التقسيم بالتساوي"
          icon="⚖️"
          color="purple"
        />

        <StatCard
          title="تسويات معلقة"
          value={`${suggestedSettlements.length} تحويلات`}
          subtitle={
            suggestedSettlements.length > 0
              ? 'مطلوب إتمامها للتصفية'
              : 'الحسابات متوازنة تماماً'
          }
          icon="🤝"
          color="amber"
        />
      </div>

      {/* Suggested Settlement Quick Notice */}
      {suggestedSettlements.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                تسوية مطلوبة ذات أولوية:
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                <strong className="font-extrabold">{suggestedSettlements[0].from.name}</strong>{' '}
                يدفع{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                  {formatCurrency(suggestedSettlements[0].amount, apartment.currency)}
                </strong>{' '}
                لـ <strong className="font-extrabold">{suggestedSettlements[0].to.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSettlement(suggestedSettlements[0])}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all self-start sm:self-auto"
          >
            سداد وتسوية الآن
          </button>
        </div>
      )}

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🧾</span>
                <span>آخر المصاريف المسجلة</span>
              </h2>

              <Link
                href="/expenses"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                عرض كل المصاريف ({expenses.length}) ←
              </Link>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                لا توجد مصاريف مسجلة حتى الآن.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentExpenses.map((exp) => {
                  const cat = getCategoryById(exp.category);
                  const payer = members.find((m) => m.id === exp.paid_by);

                  return (
                    <div
                      key={exp.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                          {cat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                            {exp.title}
                          </p>
                          <p className="text-xs text-zinc-400">
                            دفعها {payer ? payer.name : 'غير مسجل'} • {exp.expense_date}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 block">
                          {formatCurrency(exp.amount, apartment.currency)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          مقسم على {exp.splits?.length || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Roommates Balance Snapshot */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>👥</span>
                <span>أرصدة الساكنين</span>
              </h2>

              <Link
                href="/members"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                إدارة الأعضاء
              </Link>
            </div>

            <div className="space-y-2.5">
              {members.map((m) => {
                const stats = memberStats[m.id] || { net: 0 };
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          m.avatar_color || 'bg-zinc-400'
                        }`}
                      />
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {m.name}
                      </span>
                    </div>

                    <div>
                      {stats.net > 0.01 && (
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          له {formatCurrency(stats.net, apartment.currency)}
                        </span>
                      )}
                      {stats.net < -0.01 && (
                        <span className="font-black text-rose-600 dark:text-rose-400">
                          عليه {formatCurrency(Math.abs(stats.net), apartment.currency)}
                        </span>
                      )}
                      {Math.abs(stats.net) <= 0.01 && (
                        <span className="text-zinc-400 font-bold">خالص</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {activeSettlement && (
        <SettleModal
          settlement={activeSettlement}
          isOpen={Boolean(activeSettlement)}
          onClose={() => setActiveSettlement(null)}
        />
      )}
    </div>
  );
}

