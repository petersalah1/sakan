/**
 * Local Storage & Offline Cache Management for Sakan Split
 */

export const INITIAL_APARTMENT = {
  id: 'apt-cairo-101',
  name: 'شقة الدقي ٤٠٢',
  currency: 'ج.م',
  invite_code: 'SAKAN402',
};

export const INITIAL_MEMBERS = [
  {
    id: 'm-1',
    name: 'أحمد محمود',
    email: 'ahmed@sakansplit.local',
    phone: '01012345678',
    avatar_color: 'bg-emerald-500',
    role: 'admin',
  },
  {
    id: 'm-2',
    name: 'عمر خالد',
    email: 'omar@sakansplit.local',
    phone: '01123456789',
    avatar_color: 'bg-blue-500',
    role: 'member',
  },
  {
    id: 'm-3',
    name: 'محمد حسام',
    email: 'mohamed@sakansplit.local',
    phone: '01234567890',
    avatar_color: 'bg-purple-500',
    role: 'member',
  },
  {
    id: 'm-4',
    name: 'يوسف شريف',
    email: 'youssef@sakansplit.local',
    phone: '01512345678',
    avatar_color: 'bg-amber-500',
    role: 'member',
  },
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    title: 'فاتورة الكهرباء لشهر أكتوبر',
    amount: 520,
    paid_by: 'm-1',
    category: 'bills',
    expense_date: '2026-11-01',
    splits: ['m-1', 'm-2', 'm-3', 'm-4'],
    notes: 'تم الدفع عن طريق فوري',
  },
  {
    id: 'exp-2',
    title: 'مشتريات السوبر ماركت المشتركة',
    amount: 860,
    paid_by: 'm-2',
    category: 'groceries',
    expense_date: '2026-11-02',
    splits: ['m-1', 'm-2', 'm-3', 'm-4'],
    notes: 'بيض، لبن، جبن، زيت، مسحوق غسيل',
  },
  {
    id: 'exp-3',
    title: 'اشتراك باقة الإنترنت فايبر 200 ميجا',
    amount: 380,
    paid_by: 'm-3',
    category: 'internet',
    expense_date: '2026-11-02',
    splits: ['m-1', 'm-2', 'm-3', 'm-4'],
    notes: 'تجديد شهري',
  },
  {
    id: 'exp-4',
    title: 'غداء كشري وشاورما',
    amount: 240,
    paid_by: 'm-1',
    category: 'food',
    expense_date: '2026-11-03',
    splits: ['m-1', 'm-2'],
    notes: 'أحمد وعمر فقط',
  },
];

export const INITIAL_SETTLEMENTS = [];

export function getStoredItem(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`sakan_split_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function setStoredItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`sakan_split_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

