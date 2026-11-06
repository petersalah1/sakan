'use client';

import React, { useState } from 'react';
import { useApartment } from '@/hooks/useApartment';
import { useAuth, normalizePhone } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/currency';

export default function MembersList() {
  const { members, memberStats, addMember, updateMember, deleteMember, apartment } =
    useApartment();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [error, setError] = useState('');
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingPhone, setEditingPhone] = useState('');

  const handleCopyInvite = () => {
    const inviteLink =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login?invite=${apartment.invite_code}`
        : apartment.invite_code;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleShareInviteWhatsApp = () => {
    const link =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login?invite=${apartment.invite_code}`
        : '';
    const text = `🏠 يا شباب، ده رابط الانضمام لمتابعة مصاريف سكننا (${apartment.name}) على تطبيق سكن سبليت:\n${link}\n\n🔑 رمز دعوة السكن: ${apartment.invite_code}\n(ادخل الرابط وسجل برقم هاتفك لتبدأ بمتابعة مصاريفك)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSavePhone = (memberId) => {
    const clean = normalizePhone(editingPhone);
    updateMember(memberId, { phone: clean });
    setEditingMemberId(null);
    setEditingPhone('');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى كتابة اسم الساكن');
      return;
    }
    if (!phone.trim()) {
      setError('يرجى إدخال رقم هاتف الساكن ليتمكن من تسجيل الدخول به');
      return;
    }

    addMember({ name, phone, email });
    setName('');
    setPhone('');
    setEmail('');
    setError('');
    setIsAdding(false);
  };

  const isAdmin = user?.role === 'admin' || user?.id === '7585eb0f-839d-4a68-93ce-c114bbb1001a';

  return (
    <div className="space-y-6">
      {/* Apartment Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full mb-2 inline-block">
            {isAdmin ? 'لوحة تحكم المشرف' : 'سكن مشترك'}
          </span>
          <h3 className="text-xl font-black">{apartment.name} 🏠</h3>
          <p className="text-xs text-emerald-100 mt-1">
            {isAdmin
              ? 'أنت المشرف الوحيد المخول بإضافة الساكنين وتحديد من له حق الدخول'
              : 'قائمة الساكنين المعتمدين في الشقة من قبل المشرف بيتر صلاح'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleShareInviteWhatsApp}
              className="px-4 py-2.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>📲</span>
              <span>إرسال رابط السكن للساكنين عبر واتساب</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Members Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>أفراد وساكني الشقة</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                {members.length} ساكنين
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              قائمة أفراد السكن وإجمالي مدفوعات وأرصدة كل شخص
            </p>
          </div>

          {isAdmin && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-xs"
            >
              <span>+</span>
              <span>إضافة ساكن جديد</span>
            </button>
          )}
        </div>

        {/* Add Member Form (Admin only) */}
        {isAdmin && isAdding && (
          <form
            onSubmit={handleAddMember}
            className="mb-6 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                إضافة ساكن جديد للسكن (منح صلاحية الدخول)
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
              <div className="mb-3 text-xs text-rose-600 font-bold">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  اسم الساكن بالكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مقار أو مينا"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  رقم الهاتف (لتسجيل دخوله) *
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all"
              >
                حفظ وإضافة الساكن
              </button>
            </div>
          </form>
        )}

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const stats = memberStats[member.id] || { paid: 0, share: 0, net: 0 };
            const isCreditor = stats.net > 0.01;
            const isDebtor = stats.net < -0.01;

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 flex flex-col justify-between transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${
                          member.avatar_color || 'bg-emerald-500'
                        } text-white font-black flex items-center justify-center text-lg shadow-xs`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {member.name}
                        </h3>
                        {editingMemberId === member.id ? (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <input
                              type="tel"
                              dir="ltr"
                              placeholder="01XXXXXXXXX"
                              value={editingPhone}
                              onChange={(e) => setEditingPhone(e.target.value)}
                              className="w-28 px-2 py-1 text-[11px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            />
                            <button
                              onClick={() => handleSavePhone(member.id)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingMemberId(null)}
                              className="text-[10px] text-zinc-400 hover:text-zinc-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            {member.phone ? (
                              <p className="text-[11px] text-zinc-400 font-mono">
                                📞 {member.phone}
                              </p>
                            ) : (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                لم يُسجل رقم الهاتف
                              </p>
                            )}

                            {(user?.role === 'admin' || user?.id === member.id) && (
                              <button
                                onClick={() => {
                                  setEditingMemberId(member.id);
                                  setEditingPhone(member.phone || '');
                                }}
                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                {member.phone ? 'تعديل' : '+ إضافة رقم'}
                              </button>
                            )}
                          </div>
                        )}
                        {member.email && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            ✉️ {member.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {isAdmin && member.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `هل أنت متأكد من حذف ${member.name} وإلغاء صلاحية دخوله للسكن؟`
                            )
                          ) {
                            deleteMember(member.id);
                          }
                        }}
                        title="حذف العضو وإلغاء صلاحية دخوله"
                        className="text-zinc-400 hover:text-rose-500 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>إجمالي ما دفعه:</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(stats.paid, apartment.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>نصيبه المستحق:</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(stats.share, apartment.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Balance Status */}
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">
                    الصافي:
                  </span>
                  {isCreditor && (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                      له {formatCurrency(stats.net, apartment.currency)}
                    </span>
                  )}
                  {isDebtor && (
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                      عليه {formatCurrency(Math.abs(stats.net), apartment.currency)}
                    </span>
                  )}
                  {!isCreditor && !isDebtor && (
                    <span className="text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                      خالص (0)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

