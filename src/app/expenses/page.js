'use client';

import React, { useState } from 'react';
import AddExpense from '@/components/AddExpense';
import ExpenseList from '@/components/ExpenseList';

export default function ExpensesPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            إدارة المصاريف المشتركة
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            سجّل وتابع كل ما يتم صرفه على البيت أو السكن
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm ${
            showAddForm
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <span>{showAddForm ? '✕' : '+'}</span>
          <span>{showAddForm ? 'إخفاء نموذج الإضافة' : 'إضافة مصروف جديد'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <AddExpense
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <ExpenseList />
    </div>
  );
}

