'use client';

import React, { useState } from 'react';
import { useApartment } from '@/hooks/useApartment';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/currency';

export default function SettleModal({ settlement, isOpen, onClose }) {
  const { recordSettlement, apartment } = useApartment();
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !settlement) return null;

  // Only the creditor (to) or apartment admin can settle
  const isCreditor = user?.id === settlement.to.id;
  const isAdmin = user?.role === 'admin' || user?.id === '7585eb0f-839d-4a68-93ce-c114bbb1001a';
  const canSettle = isCreditor || isAdmin;

  const handleConfirm = async () => {
    if (!canSettle || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await recordSettlement({
        fromMemberId: settlement.from.id,
        toMemberId: settlement.to.id,
        amount: settlement.amount,
        notes: notes || `تسوية نقدية: تم تأكيد استلام ${settlement.amount} ${apartment.currency} من ${settlement.from.name}`,
      });
      onClose();
    } catch (e) {
      console.error('Settlement error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-3">
            🤝
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
            تأكيد استلام المبلغ وتسوية الحساب
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            سيتم تصفية هذا المبلغ من رصيد الدافع والمستلم فوراً
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
            <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {settlement.to.name} ★
            </span>
          </div>
        </div>

        {/* Permission Notice */}
        {!canSettle ? (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed">
            ⚠️ <strong>غير مسموح:</strong> فقط المستلم (
            <strong>{settlement.to.name}</strong>) الذي له الفلوس هو المخول بتأكيد استلام المبلغ وتسوية الحساب.
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            ✓ أنت تؤكد الآن استلامك مبلغ{' '}
            <strong>{formatCurrency(settlement.amount, apartment.currency)}</strong> من{' '}
            <strong>{settlement.from.name}</strong>.
          </div>
        )}

        {/* Notes */}
        {canSettle && (
          <div className="mb-5">
            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              طريقة الاستلام أو ملاحظات (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: استلمت كاش، فودافون كاش، إنستاباي..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canSettle ? (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري تأكيد الاستلام...</span>
                </>
              ) : (
                <span>نعم، استلمت المبلغ وتأكيد التسوية</span>
              )}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-bold text-xs rounded-xl cursor-not-allowed"
            >
              في انتظار تأكيد {settlement.to.name}
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
