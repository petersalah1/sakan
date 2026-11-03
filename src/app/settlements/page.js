import BalanceSummary from '@/components/BalanceSummary';

export default function SettlementsPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          تصفية الحسابات والديون
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          حساب صافي أرصدة كل ساكن وتحديد التحويلات المطلوبة بأسهل طريقة
        </p>
      </div>

      <BalanceSummary />
    </div>
  );
}

