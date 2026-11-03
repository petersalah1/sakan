import BalanceSummary from '@/components/BalanceSummary';

export default function SettlementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          تصفية الديون وتسوية الحسابات
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          خطة ذكية لتصفية الحسابات بأقل عدد ممكن من المعاملات النقدية
        </p>
      </div>

      <BalanceSummary />
    </div>
  );
}

