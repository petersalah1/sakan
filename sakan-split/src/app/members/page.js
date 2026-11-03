import MembersList from '@/components/MembersList';

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          إدارة أعضاء السكن
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          إضافة وتعديل شركاء السكن والاطلاع على أرصدة كل شخص
        </p>
      </div>

      <MembersList />
    </div>
  );
}

