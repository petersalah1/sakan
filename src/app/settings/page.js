'use client';

import React, { useState } from 'react';
import { useApartment } from '@/hooks/useApartment';

export default function SettingsPage() {
  const {
    apartment,
    updateApartment,
    resetToDefaults,
    clearAllSettlements,
    isSupabaseConnected,
  } = useApartment();

  const [name, setName] = useState(apartment.name);
  const [currency, setCurrency] = useState(apartment.currency || 'ج.م');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    updateApartment({ name, currency });
    setSaveMessage('تم حفظ إعدادات السكن بنجاح!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          إعدادات السكن والبيانات
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          تخصيص بيانات الشقة والعملة وضبط الربط مع Supabase
        </p>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>{saveMessage}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <span>⚙️</span>
          <span>معلومات الشقة</span>
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              اسم السكن أو الشقة
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              رمز العملة المستخدمة
            </label>
            <input
              type="text"
              required
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              كود دعوة الساكنين
            </label>
            <input
              type="text"
              disabled
              value={apartment.invite_code}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition-all"
          >
            حفظ التعديلات
          </button>
        </form>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
          <span>⚡</span>
          <span>حالة الاتصال بقاعدة بيانات Supabase</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          يتيح لك Supabase مزامنة البيانات السحابية بين جميع هواتف وأجهزة الساكنين في الوقت الفعلي.
        </p>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
              {isSupabaseConnected
                ? 'متصل بنجاح بقاعدة بيانات Supabase'
                : 'التطبيق يعمل في وضع التخزين المحلي (Offline / Local Storage)'}
            </span>
          </div>

          <span className="text-[11px] font-bold text-zinc-400">
            {isSupabaseConnected ? 'سحابي' : 'محلي'}
          </span>
        </div>

        <div className="text-xs text-zinc-500 space-y-2 bg-zinc-100 dark:bg-zinc-800/60 p-4 rounded-2xl">
          <p className="font-bold text-zinc-700 dark:text-zinc-300">
            خطوات تفعيل Supabase:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>أنشئ مشروعاً جديداً ومستقلاً في Supabase.</li>
            <li>نفذ ملف الهجرة الموجود في <code className="font-mono text-[11px]">supabase/migrations/001_initial_schema.sql</code> في SQL Editor.</li>
            <li>أضف مفاتيح مشروعك في ملف <code className="font-mono text-[11px]">.env.local</code>:</li>
          </ol>
          <pre className="font-mono text-[11px] bg-black text-emerald-400 p-3 rounded-xl overflow-x-auto text-left" dir="ltr">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
          </pre>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 shadow-xs">
        <h2 className="text-base font-black text-rose-900 dark:text-rose-200 mb-1 flex items-center gap-2">
          <span>⚠️</span>
          <span>منطقة العمليات الحساسة</span>
        </h2>
        <p className="text-xs text-rose-700 dark:text-rose-300 mb-4">
          استعادة البيانات الافتراضية وحذف أي مصاريف أو أعضاء تم تسجيلهم محلياً.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (
                confirm(
                  'هل أنت متأكد من تصفير وحذف جميع سجلات التسويات السابقة؟'
                )
              ) {
                clearAllSettlements();
                setSaveMessage('تم تصفير سجل التسويات بنجاح.');
              }
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition-all"
          >
            تصفير سجل التسويات السابقة
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'هل أنت متأكد من رغبتك في استعادة البيانات التجريبية الافتراضية؟'
                )
              ) {
                resetToDefaults();
                setSaveMessage('تم استعادة البيانات الافتراضية بنجاح.');
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all"
          >
            استعادة البيانات التجريبية الافتراضية
          </button>
        </div>
      </div>
    </div>
  );
}

