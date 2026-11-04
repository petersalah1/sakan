'use client';

import React, { useState } from 'react';
import { useApartment } from '@/hooks/useApartment';
import { formatCurrency } from '@/utils/currency';
import SettleModal from './SettleModal';

export default function BalanceSummary() {
  const {
    members,
    totalExpenses,
    memberStats,
    suggestedSettlements,
    settlements,
    deleteSettlement,
    apartment,
  } = useApartment();

  const [activeSettlement, setActiveSettlement] = useState(null);

  const membersMap = React.useMemo(() => {
    const map = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  const handleDeleteSettlement = (id) => {
    if (window.confirm('هل تريد حذف هذه التسوية من السجل وإعادة احتساب الدين؟')) {
      deleteSettlement(id);
    }
  };

  const handleShareWhatsApp = () => {
    let text = `🏠 *كشف حساب مصاريف السكن (${apartment.name})*\n`;
    text += `💰 *إجمالي المصاريف:* ${formatCurrency(totalExpenses, apartment.currency)}\n\n`;
    text += `📊 *موقف الساكنين:*\n`;
    members.forEach((m) => {
      const stats = memberStats[m.id] || { net: 0 };
      if (stats.net > 0.01) {
        text += `• ${m.name}: له ${formatCurrency(stats.net, apartment.currency)} ✅\n`;
      } else if (stats.net < -0.01) {
        text += `• ${m.name}: عليه ${formatCurrency(Math.abs(stats.net), apartment.currency)} ⚠️\n`;
      } else {
        text += `• ${m.name}: خالص (0) 🤝\n`;
      }
    });

    if (suggestedSettlements.length > 0) {
      text += `\n🤝 *التحويلات المطلوبة للتصفية:*\n`;
      suggestedSettlements.forEach((s, idx) => {
        text += `${idx + 1}. ${s.from.name} يدفع لـ ${s.to.name}: ${formatCurrency(s.amount, apartment.currency)}\n`;
      });
    }

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl flex items-center justify-center">
            ⚖️
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              موقف الحسابات والتسويات
            </h3>
            <p className="text-xs text-zinc-400">
              إجمالي مصاريف السكن حتى الآن:{' '}
              <strong className="text-zinc-700 dark:text-zinc-200">
                {formatCurrency(totalExpenses, apartment.currency)}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>📲</span>
            <span>مشاركة الملخص على واتساب</span>
          </button>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 text-xs font-bold">
            {suggestedSettlements.length > 0
              ? `${suggestedSettlements.length} تحويلات مقترحة للتصفية`
              : 'جميع الحسابات متوازنة'}
          </div>
        </div>
      </div>

      {/* Suggested Minimal Settlements */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                خطة التسوية الذكية (أقل عدد تحويلات)
              </h2>
              <p className="text-xs text-zinc-400">
                خوارزمية ذكية تحسب أبسط طريقة لتصفية جميع الديون المشتركة
              </p>
            </div>
          </div>
        </div>

        {suggestedSettlements.length === 0 ? (
          <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-200">
              لا توجد ديون معلقة بين أعضاء السكن!
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              جميع المصاريف متساوية أو تم سدادها وتسويتها بالكامل.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedSettlements.map((settle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Transfer summary */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        settle.from.avatar_color || 'bg-rose-500'
                      }`}
                    />
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      {settle.from.name}
                    </span>
                  </div>

                  <span className="text-xs text-zinc-400 font-bold">
                    يدفع لـ
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        settle.to.avatar_color || 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      {settle.to.name}
                    </span>
                  </div>
                </div>

                {/* Amount & Settle Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(settle.amount, apartment.currency)}
                  </span>

                  <button
                    onClick={() => setActiveSettlement(settle)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition-all"
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
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
          <span>📊</span>
          <span>كشف رصيد كل ساكن</span>
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          الفرق بين إجمالي ما دفعه كل فرد ونصيبه المستهلك من مصاريف السكن
        </p>

        <div className="space-y-3">
          {members.map((member) => {
            const stats = memberStats[member.id] || { paid: 0, share: 0, net: 0 };
            const isOwed = stats.net > 0.01;
            const owes = stats.net < -0.01;

            return (
              <div
                key={member.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl ${
                      member.avatar_color || 'bg-emerald-500'
                    } text-white font-black flex items-center justify-center text-sm shadow-xs`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      {member.name}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      دفع: {formatCurrency(stats.paid, apartment.currency)}
                      {stats.settledPaid > 0 && (
                        <span className="text-emerald-500 font-bold">
                          {' '}(+{formatCurrency(stats.settledPaid, apartment.currency)} تسوية)
                        </span>
                      )}
                      {stats.settledReceived > 0 && (
                        <span className="text-amber-500 font-bold">
                          {' '}(استلم {formatCurrency(stats.settledReceived, apartment.currency)} تسوية)
                        </span>
                      )}
                      {' • '}استهلك: {formatCurrency(stats.share, apartment.currency)}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  {isOwed && (
                    <div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                        له {formatCurrency(stats.net, apartment.currency)}
                      </span>
                    </div>
                  )}
                  {owes && (
                    <div>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                        عليه {formatCurrency(Math.abs(stats.net), apartment.currency)}
                      </span>
                    </div>
                  )}
                  {!isOwed && !owes && (
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      خالص (0)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Settlements Stream */}
      {settlements.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>📜</span>
              <span>سجل التسويات التي تمت بالفعل ({settlements.length})</span>
            </h3>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {settlements.map((s) => {
              const fromName = s.from_name || membersMap[s.from_member_id]?.name || 'عضو';
              const toName = s.to_name || membersMap[s.to_member_id]?.name || 'عضو';
              const dateText = s.settled_at ? s.settled_at.split('T')[0] : '';

              return (
                <div
                  key={s.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-emerald-500 font-extrabold text-sm">✓</span>
                    <span className="truncate">
                      سدّد <strong className="font-extrabold text-zinc-900 dark:text-zinc-100">{fromName}</strong>{' '}
                      مبلغ{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                        {formatCurrency(s.amount, apartment.currency)}
                      </strong>{' '}
                      إلى <strong className="font-extrabold text-zinc-900 dark:text-zinc-100">{toName}</strong>
                      {s.notes && (
                        <span className="text-[11px] text-zinc-400 block sm:inline sm:mr-1.5">
                          ({s.notes})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-zinc-400 font-medium text-[11px] dir-ltr">{dateText}</span>
                    <button
                      onClick={() => handleDeleteSettlement(s.id)}
                      title="حذف هذه التسوية"
                      className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settle Modal */}
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

