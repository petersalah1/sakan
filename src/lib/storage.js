/**
 * Local Storage & Offline Cache Management for Sakan Split
 */

export const INITIAL_APARTMENT = {
  id: 'd71498f6-43c2-4824-9685-cba44c879acf',
  name: 'سكن بيتر صلاح',
  currency: 'ج.م',
  invite_code: 'PETER2026',
};

export const INITIAL_MEMBERS = [
  {
    id: '7585eb0f-839d-4a68-93ce-c114bbb1001a',
    apartment_id: 'd71498f6-43c2-4824-9685-cba44c879acf',
    name: 'بيتر صلاح',
    email: 'petersalah104@gmail.com',
    phone: '',
    avatar_color: 'bg-emerald-500',
    role: 'admin',
  },
];

export const INITIAL_EXPENSES = [];
export const INITIAL_SETTLEMENTS = [];

export function getStoredItem(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`sakan_v4_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function setStoredItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`sakan_v4_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}
