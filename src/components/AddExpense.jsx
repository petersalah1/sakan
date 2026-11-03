'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

const CATEGORIES = [
  { id: 'طعام', label: 'طعام وشراب', icon: '🍔' },
  { id: 'مشتريات', label: 'مشتريات للمنزل', icon: '🛒' },
  { id: 'فواتير', label: 'فواتير ومرافق', icon: '⚡' },
  { id: 'إنترنت', label: 'إنترنت واشتراكات', icon: '🌐' },
  { id: 'إيجار', label: 'إيجار السكن', icon: '🏠' },
  { id: 'صيانة', label: 'صيانة وتصليحات', icon: '🔧' },
  { id: 'أخرى', label: 'مصاريف أخرى', icon: '📦' },
];

export default function AddExpense({ onSuccess, onCancel }) {
  const { members, addExpense } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members[0]?.id || '');
  const [splitBetween, setSplitBetween] = useState(members.map((m) => m.id));
  const [category, setCategory] = useState('طعام');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Toggle member selection in split
  const toggleMemberSplit = (memberId) => {
    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    setSplitBetween(members.map((m) => m.id));
  };

  const deselectAllMembers = () => {
    setSplitBetween([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('يرجى إدخال وصف للمصروف');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!paidBy) {
      setError('يرجى تحديد الشخص الذي دفع المبلغ');
      return;
    }
    if (splitBetween.length === 0) {
      setError('يرجى اختيار شخص واحد على الأقل للمشاركة في تقسيم المصروف');
      return;
    }

    addExpense({
      title,
      amount: parsedAmount,
      paidBy,
      splitBetween,
      category,
      date,
      notes,
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setNotes('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);

    if (onSuccess) onSuccess();
  };

  const perPersonAmount =
    amount && splitBetween.length > 0 && !isNaN(parseFloat(amount))
      ? (parseFloat(amount) / splitBetween.length).toFixed(2)
      : '0.00';

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            +
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              إضافة مصروف جديد
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              سجّل المصاريف المشتركة وقسمها بسهولة على السكن
            </p>
          </div>
        </div>
      </div>

      {isSubmitted && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium flex items-center gap-2">
          <span>✓</span> تم حفظ المصروف وتقسيمه بنجاح!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            وصف المصروف *
          </label>
          <input
            type="text"
            required
            placeholder="مثال: فاتورة كهرباء، كشري، منظفات..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              المبلغ (ج.م) *
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
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
              <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">
                ج.م
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              التاريخ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            التصنيف
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  category === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            مين دفع المبلغ؟ *
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Split Between */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              يتقسم على مين؟ ({splitBetween.length} من {members.length})
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllMembers}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                تحديد الكل
              </button>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={deselectAllMembers}
                className="text-zinc-500 hover:underline"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.map((m) => {
              const isSelected = splitBetween.includes(m.id);
              return (
                <label
                  key={m.id}
                  onClick={() => toggleMemberSplit(m.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${m.color || 'bg-zinc-400'}`}
                    />
                    <span className="text-xs font-semibold">{m.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              );
            })}
          </div>

          {amount && splitBetween.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 p-2 rounded-lg">
              نصيب الفرد في هذا المصروف: <span className="font-bold text-emerald-600 dark:text-emerald-400">{perPersonAmount} ج.م</span>
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            ملاحظات إضافية (اختياري)
          </label>
          <input
            type="text"
            placeholder="أي تفاصيل خاصة بالمصروف..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            تسجيل المصروف
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

