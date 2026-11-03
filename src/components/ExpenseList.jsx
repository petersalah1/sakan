'use client';

import React, { useState, useMemo } from 'react';
import { useApartment } from '@/hooks/useApartment';
import { getCategoryById, EXPENSE_CATEGORIES } from '@/utils/categories';
import { formatCurrency } from '@/utils/currency';

export default function ExpenseList() {
  const { expenses, members, deleteExpense, apartment } = useApartment();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPayer, setSelectedPayer] = useState('ALL');

  const membersMap = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        exp.title.toLowerCase().includes(term) ||
        (exp.notes && exp.notes.toLowerCase().includes(term));
      const matchesCategory =
        selectedCategory === 'ALL' || exp.category === selectedCategory;
      const matchesPayer =
        selectedPayer === 'ALL' || exp.paid_by === selectedPayer;

      return matchesSearch && matchesCategory && matchesPayer;
    });
  }, [expenses, searchTerm, selectedCategory, selectedPayer]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>سجل مصاريف السكن</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              {filteredExpenses.length} عملية
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            تتبع جميع المشتريات والفواتير المدفوعة
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="بحث عن مصروف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">جميع التصنيفات</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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

      {/* List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-4xl block mb-2">🧾</span>
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            لا توجد مصاريف مطابقة لخيارات البحث
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            جرّب تغيير فلاتر البحث أو أضف مصروفاً جديداً للسكن
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredExpenses.map((exp) => {
            const payer = membersMap[exp.paid_by];
            const cat = getCategoryById(exp.category);
            const splits = exp.splits || [];
            const splitPerPerson =
              splits.length > 0 ? (exp.amount / splits.length).toFixed(2) : exp.amount;

            return (
              <div
                key={exp.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 px-3 rounded-2xl transition-all"
              >
                {/* Right / Start (in RTL) Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                    {cat.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        {exp.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.color} ${cat.border}`}
                      >
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                      <span>دفعها:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            payer?.avatar_color || 'bg-zinc-400'
                          }`}
                        />
                        {payer ? payer.name : 'عضو غير مسجل'}
                      </span>
                      <span>•</span>
                      <span>التاريخ: {exp.expense_date}</span>
                      {exp.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-zinc-400">&quot;{exp.notes}&quot;</span>
                        </>
                      )}
                    </div>

                    {/* Split tags */}
                    <div className="mt-1.5 text-[11px] text-zinc-400 flex items-center gap-1 flex-wrap">
                      <span>
                        تقسيم على {splits.length} أفراد ({formatCurrency(splitPerPerson, apartment.currency)} للفرد):
                      </span>
                      {splits.map((sId) => (
                        <span
                          key={sId}
                          className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium text-[10px]"
                        >
                          {membersMap[sId]?.name || 'عضو'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pr-2">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block">
                      {formatCurrency(exp.amount, apartment.currency)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      المبلغ بالكامل
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف عملية "${exp.title}"؟`)) {
                        deleteExpense(exp.id);
                      }
                    }}
                    title="حذف المصروف"
                    className="p-2 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
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

