import MembersList from '@/components/MembersList';

export default function MembersPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
          أعضاء السكن والشركاء
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          إدارة قائمة الساكنين وتوزيع نسب المصاريف
        </p>
      </div>

      <MembersList />
    </div>
  );
}

