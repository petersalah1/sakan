'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function BalanceSummary() {
  const {
    members,
    totalExpenses,
    memberStats,
    suggestedSettlements,
    settlementsHistory,
    settleDebt,
  } = useApp();

  const [settledSuccessMsg, setSettledSuccessMsg] = useState('');

  const handleSettle = (fromId, toId, amount, fromName, toName) => {
    settleDebt({ fromId, toId, amount });
    setSettledSuccessMsg(
      `تم تسجيل تسوية بقيمة ${amount} ج.م من ${fromName} إلى ${toName} بنجاح!`
    );
    setTimeout(() => setSettledSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Alert */}
      {settledSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{settledSuccessMsg}</span>
        </div>
      )}

      {/* Overview Stat Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            💰
          </div>
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              إجمالي مصاريف السكن
            </span>
            <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalExpenses.toLocaleString()} ج.م
            </p>
          </div>
        </div>
        <div className="text-left">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            أفراد السكن
          </span>
          <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
            {members.length} أفراد
          </p>
        </div>
      </div>

      {/* Suggested Settlements Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                تسوية الحسابات المقترحة
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                أبسط طريقة لتصفية كل الديون المشتركة بأقل عدد ممكن من التحويلات
              </p>
            </div>
          </div>
        </div>

        {suggestedSettlements.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <span className="text-3xl block mb-2">🎉</span>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              جميع الحسابات متوازنة وخالصة!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              لا توجد ديون معلقة بين أعضاء السكن حالياً.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedSettlements.map((settle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        settle.from.color || 'bg-rose-500'
                      }`}
                    />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {settle.from.name}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-400 font-medium">
                    يدفع لـ
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        settle.to.color || 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {settle.to.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {settle.amount.toLocaleString()} ج.م
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleSettle(
                        settle.from.id,
                        settle.to.id,
                        settle.amount,
                        settle.from.name,
                        settle.to.name
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    تسوية الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Balances Breakdown */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
          <span>📊</span>
          <span>موقف كل ساكن المالي</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          تفاصيل ما دفعه كل فرد مقارنة بنصيبه الإجمالي من مصاريف السكن
        </p>

        <div className="space-y-4">
          {members.map((member) => {
            const stats = memberStats[member.id] || { paid: 0, share: 0, net: 0 };
            const net = Math.round(stats.net * 100) / 100;
            const isOwed = net > 0.01;
            const owes = net < -0.01;

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${
                        member.color || 'bg-blue-500'
                      } text-white font-bold flex items-center justify-center text-sm shadow-sm`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {member.name}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        دفع: {stats.paid.toLocaleString()} ج.م • نصيبه المستحق: {Math.round(stats.share).toLocaleString()} ج.م
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    {isOwed && (
                      <div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          له {net.toLocaleString()} ج.م
                        </span>
                        <p className="text-[10px] text-zinc-400">
                          يستحق استرداد هذا المبلغ
                        </p>
                      </div>
                    )}
                    {owes && (
                      <div>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          عليه {Math.abs(net).toLocaleString()} ج.م
                        </span>
                        <p className="text-[10px] text-zinc-400">
                          يجب عليه سداد هذا المبلغ
                        </p>
                      </div>
                    )}
                    {!isOwed && !owes && (
                      <span className="text-xs font-semibold text-zinc-500 bg-zinc-150 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                        خالص (0 ج.م)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlements History */}
      {settlementsHistory && settlementsHistory.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <span>📜</span>
            <span>سجل التسويات المكتملة</span>
          </h3>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {settlementsHistory.map((sh) => (
              <div
                key={sh.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>
                    سدّد <strong className="font-semibold">{sh.fromName}</strong>{' '}
                    مبلغ{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {sh.amount} ج.م
                    </strong>{' '}
                    إلى <strong className="font-semibold">{sh.toName}</strong>
                  </span>
                </div>
                <span className="text-zinc-400">{sh.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
