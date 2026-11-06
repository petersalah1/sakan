'use client';

import React, { useState } from 'react';
import { useApartment } from '@/hooks/useApartment';
import { useAuth } from '@/hooks/useAuth';
import { EXPENSE_CATEGORIES } from '@/utils/categories';
import { formatCurrency } from '@/utils/currency';

export default function AddExpenseModal({ isOpen, onClose }) {
  const { members, addExpense, apartment } = useApartment();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(() => user?.id || members[0]?.id || '');
  const [category, setCategory] = useState('food');
  const [splits, setSplits] = useState(members.map((m) => m.id));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const activePaidBy = paidBy || user?.id || members[0]?.id || '';
  const activeSplits = splits.length > 0 ? splits : members.map((m) => m.id);

  if (!isOpen) return null;

  const toggleSplitMember = (id) => {
    setSplits((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSplits(members.map((m) => m.id));
  const deselectAll = () => setSplits([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('يرجى كتابة وصف أو اسم للمصروف');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('يرجى كتابة مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!activePaidBy) {
      setError('يرجى تحديد من دفع المبلغ');
      return;
    }
    if (activeSplits.length === 0) {
      setError('يرجى اختيار شخص واحد على الأقل للمشاركة في التقسيم');
      return;
    }

    addExpense({
      title,
      amount: parsedAmount,
      paid_by: activePaidBy,
      category,
      expense_date: date,
      splits: activeSplits,
      notes,
    });

    onClose();
  };

  const parsedAmount = parseFloat(amount) || 0;
  const perPersonShare =
    activeSplits.length > 0 ? (parsedAmount / activeSplits.length).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">
                💸
              </div>
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  إضافة مصروف جديد
                </h2>
                <p className="text-xs text-zinc-400">
                  سجل مصروف الشقة وقسمه على الساكنين بسهولة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                وصف المصروف *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: فاتورة كهرباء، كشري، مسحوق غسيل..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  المبلغ ({apartment.currency}) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">
                    {apartment.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                التصنيف
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPENSE_CATEGORIES.filter((c) => c.id !== 'settlement').map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center border transition-all ${
                      category === cat.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                مين دفع المبلغ؟ *
              </label>
              <select
                value={activePaidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Among Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  يتقسم على مين؟ ({activeSplits.length} من {members.length})
                </label>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    الكل
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-zinc-400 hover:underline"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map((m) => {
                  const isSelected = activeSplits.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleSplitMember(m.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full ${
                            m.avatar_color || 'bg-zinc-400'
                          }`}
                        />
                        <span className="text-xs font-bold">{m.name}</span>
                      </div>
                      <span className="text-xs font-extrabold">
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              {parsedAmount > 0 && splits.length > 0 && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">نصيب الفرد المشارك:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(perPersonShare, apartment.currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ملاحظات إضافية (اختياري)
              </label>
              <input
                type="text"
                placeholder="تفاصيل الفاتورة أو طريقة الدفع..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-xl shadow-xs transition-all"
              >
                حفظ المصروف
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

