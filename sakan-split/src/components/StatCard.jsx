import React from 'react';

export default function StatCard({ title, value, subtitle, icon, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-100 dark:border-purple-900',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900',
  };

  const badgeStyle = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
          {title}
        </span>
        <div suppressHydrationWarning className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border ${badgeStyle}`}
      >
        {icon}
      </div>
    </div>
  );
}

