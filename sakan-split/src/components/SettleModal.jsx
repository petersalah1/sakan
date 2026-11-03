'use client';

import React, { useState } from 'react';
import { useApartment } from '@/hooks/useApartment';
import { formatCurrency } from '@/utils/currency';

export default function SettleModal({ settlement, isOpen, onClose }) {
  const { recordSettlement, apartment } = useApartment();
  const [notes, setNotes] = useState('');

  if (!isOpen || !settlement) return null;

  const handleConfirm = () => {
    recordSettlement({
      fromMemberId: settlement.from.id,
      toMemberId: settlement.to.id,
      amount: settlement.amount,
      notes: notes || `تسوية نقدية مباشرة: ${settlement.from.name} لـ ${settlement.to.name}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-3">
            🤝
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
            تأكيد تسوية الحساب
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            سيتم تسجيل التحويل وتحديث الأرصدة تلقائياً في السكن
          </p>
        </div>

        {/* Transfer Visual Card */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 mb-4 flex items-center justify-between">
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block mb-1">الدافع (مَدين)</span>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {settlement.from.name}
            </span>
          </div>

          <div className="text-center px-3">
            <span className="text-base text-zinc-400">←</span>
            <span className="block text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(settlement.amount, apartment.currency)}
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block mb-1">المستلم (دائن)</span>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {settlement.to.name}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
            ملاحظات التحويل (اختياري)
          </label>
          <input
            type="text"
            placeholder="مثال: فودافون كاش، إنستاباي، نقداً..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all"
          >
            تأكيد التسوية وسداد المبلغ
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

