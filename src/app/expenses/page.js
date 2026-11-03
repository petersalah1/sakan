'use client';

import React, { useState } from 'react';
import ExpenseList from '@/components/ExpenseList';
import AddExpenseModal from '@/components/AddExpenseModal';

export default function ExpensesPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            سجل المصاريف والفواتير
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            سجّل كل مصروف واعرف مين دفع ومين استفاد منه
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          <span>إضافة مصروف جديد</span>
        </button>
      </div>

      <ExpenseList />

      {showAddModal && (
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

