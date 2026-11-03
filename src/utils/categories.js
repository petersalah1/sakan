/**
 * Expense Categories Configuration for Sakan Split
 */

export const EXPENSE_CATEGORIES = [
  {
    id: 'food',
    name: 'طعام وشراب',
    icon: '🍔',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'groceries',
    name: 'مشتريات للمنزل',
    icon: '🛒',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'bills',
    name: 'كهرباء وغاز ومياه',
    icon: '⚡',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'internet',
    name: 'إنترنت واشتراكات',
    icon: '🌐',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'rent',
    name: 'إيجار السكن',
    icon: '🏠',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  {
    id: 'maintenance',
    name: 'صيانة وتصليح',
    icon: '🔧',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: 'settlement',
    name: 'تسوية حساب',
    icon: '🤝',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
  },
  {
    id: 'other',
    name: 'مصاريف أخرى',
    icon: '📦',
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
];

export function getCategoryById(id) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === id || c.name === id) || {
      id: 'other',
      name: id || 'أخرى',
      icon: '📝',
      color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-700',
    }
  );
}

