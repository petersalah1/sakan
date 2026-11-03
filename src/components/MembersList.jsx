'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function MembersList() {
  const { members, memberStats, addMember, deleteMember } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الساكن');
      return;
    }

    addMember({ name, phone, email });
    setName('');
    setPhone('');
    setEmail('');
    setError('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>أعضاء السكن</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              {members.length} ساكنين
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            إدارة أفراد الشقة ومتابعة رصيد كل شخص
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto shadow-sm"
          >
            <span>+</span>
            <span>إضافة ساكن جديد</span>
          </button>
        )}
      </div>

      {/* Add Member Form */}
      {isAdding && (
        <form
          onSubmit={handleAddMember}
          className="mb-6 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              إضافة ساكن جديد إلى السكن
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              ✕ إلغاء
            </button>
          </div>

          {error && (
            <div className="mb-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                الاسم بالكامل *
              </label>
              <input
                type="text"
                placeholder="مثال: يوسف أحمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                رقم الهاتف (اختياري)
              </label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              حفظ الساكن
            </button>
          </div>
        </form>
      )}

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const stats = memberStats[member.id] || { paid: 0, share: 0, net: 0 };
          const roundedNet = Math.round(stats.net * 100) / 100;
          const isCreditor = roundedNet > 0.01;
          const isDebtor = roundedNet < -0.01;

          return (
            <div
              key={member.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col justify-between transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full ${
                        member.color || 'bg-blue-500'
                      } text-white font-bold flex items-center justify-center text-base shadow-sm`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {member.name}
                      </h3>
                      {member.phone && (
                        <p className="text-[11px] text-zinc-400">
                          📞 {member.phone}
                        </p>
                      )}
                      {member.email && (
                        <p className="text-[11px] text-zinc-400">
                          ✉️ {member.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {members.length > 1 && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `هل أنت متأكد من حذف ${member.name} من قائمة السكن؟`
                          )
                        ) {
                          deleteMember(member.id);
                        }
                      }}
                      title="حذف العضو"
                      className="text-zinc-400 hover:text-rose-500 text-xs p-1 rounded-md"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>إجمالي ما دفعه:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {stats.paid.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>نصيبه المستحق:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {Math.round(stats.share).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Balance Status */}
              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">
                  صافي الحساب:
                </span>
                {isCreditor && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    له {roundedNet.toLocaleString()} ج.م
                  </span>
                )}
                {isDebtor && (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                    عليه {Math.abs(roundedNet).toLocaleString()} ج.م
                  </span>
                )}
                {!isCreditor && !isDebtor && (
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    خالص (0 ج.م)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

