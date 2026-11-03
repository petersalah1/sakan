'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

const CATEGORY_ICONS = {
  طعام: '🍔',
  مشتريات: '🛒',
  فواتير: '⚡',
  إنترنت: '🌐',
  إيجار: '🏠',
  صيانة: '🔧',
  تسوية: '🤝',
  أخرى: '📦',
  عام: '📝',
};

export default function ExpenseList() {
  const { expenses, members, deleteExpense } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPayer, setSelectedPayer] = useState('ALL');

  // Map member IDs to member objects for quick lookup
  const membersMap = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'ALL' || exp.category === selectedCategory;
      const matchesPayer =
        selectedPayer === 'ALL' || exp.paidBy === selectedPayer;

      return matchesSearch && matchesCategory && matchesPayer;
    });
  }, [expenses, searchTerm, selectedCategory, selectedPayer]);

  // Unique categories in existing expenses
  const availableCategories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category));
    return Array.from(set);
  }, [expenses]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>سجل المصاريف</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {filteredExpenses.length} مصروف
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            جميع الفواتير والمصاريف التي تم تسجيلها في السكن
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="بحث في المصاريف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">جميع التصنيفات</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">جميع الدافعين</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="text-4xl mb-3">🧾</div>
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            لا توجد مصاريف مطابقة
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            جرّب تغيير فلاتر البحث أو أضف مصروف جديد
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredExpenses.map((expense) => {
            const payer = membersMap[expense.paidBy];
            const splits = expense.splitBetween || [];
            const splitAmount = splits.length > 0 ? (expense.amount / splits.length).toFixed(2) : expense.amount;
            const icon = CATEGORY_ICONS[expense.category] || '💸';

            return (
              <div
                key={expense.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 px-2 rounded-xl transition-colors"
              >
                {/* Left side: Icon & Title */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        {expense.title}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                        {expense.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span>دفعها:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            payer?.color || 'bg-zinc-400'
                          }`}
                        />
                        {payer ? payer.name : 'غير محدد'}
                      </span>
                      <span>•</span>
                      <span>التاريخ: {expense.date}</span>
                      {expense.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-zinc-400 dark:text-zinc-500">
                            &quot;{expense.notes}&quot;
                          </span>
                        </>
                      )}
                    </div>

                    {/* Split Details */}
                    <div className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <span>مقسم على {splits.length} أفراد ({splitAmount} ج.م لكل فرد)</span>
                      <span>[</span>
                      {splits.map((sId, idx) => (
                        <span key={sId}>
                          {membersMap[sId]?.name || 'عضو'}
                          {idx < splits.length - 1 ? '، ' : ''}
                        </span>
                      ))}
                      <span>]</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount & Delete button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pr-2">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 block">
                      {expense.amount.toLocaleString()} ج.م
                    </span>
                    <span className="text-[10px] text-zinc-400">إجمالي المبلغ</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف "${expense.title}"؟`)) {
                        deleteExpense(expense.id);
                      }
                    }}
                    title="حذف المصروف"
                    className="p-2 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors text-xs"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

