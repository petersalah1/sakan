'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AppContext = createContext(null);

const DEFAULT_MEMBERS = [
  { id: '1', name: 'أحمد محمود', email: 'ahmed@example.com', phone: '01012345678', color: 'bg-blue-500' },
  { id: '2', name: 'عمر خالد', email: 'omar@example.com', phone: '01123456789', color: 'bg-emerald-500' },
  { id: '3', name: 'محمد علي', email: 'mohamed@example.com', phone: '01234567890', color: 'bg-purple-500' },
];

const DEFAULT_EXPENSES = [
  {
    id: '101',
    title: 'فاتورة الكهرباء والغاز',
    amount: 450,
    paidBy: '1',
    splitBetween: ['1', '2', '3'],
    category: 'فواتير',
    date: '2026-11-01',
    notes: 'فاتورة شهر أكتوبر',
  },
  {
    id: '102',
    title: 'طلبات ومشتريات السوبرماركت',
    amount: 620,
    paidBy: '2',
    splitBetween: ['1', '2', '3'],
    category: 'مشتريات',
    date: '2026-11-02',
    notes: 'جبن، بيض، خضار، مسحوق غسيل',
  },
  {
    id: '103',
    title: 'اشتراك الإنترنت المنزلي',
    amount: 300,
    paidBy: '3',
    splitBetween: ['1', '2', '3'],
    category: 'إنترنت',
    date: '2026-11-02',
    notes: 'سرعة سوبر 140 جيجا',
  },
  {
    id: '104',
    title: 'عشاء كشري مشترك',
    amount: 180,
    paidBy: '1',
    splitBetween: ['1', '2'],
    category: 'طعام',
    date: '2026-11-03',
    notes: 'أحمد وعمر فقط',
  },
];

export function AppProvider({ children }) {
  // Always initialize with defaults on both server and initial client render
  // to avoid hydration mismatch
  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [settlementsHistory, setSettlementsHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load from localStorage safely after initial hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedMembers = localStorage.getItem('sakn_members');
        const storedExpenses = localStorage.getItem('sakn_expenses');
        const storedSettlements = localStorage.getItem('sakn_settlements');

        if (storedMembers) setMembers(JSON.parse(storedMembers));
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
        if (storedSettlements) setSettlementsHistory(JSON.parse(storedSettlements));
      } catch (e) {
        console.warn('LocalStorage load issue:', e);
      } finally {
        hasLoadedRef.current = true;
        setIsLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes to LocalStorage only after initial load is complete
  useEffect(() => {
    if (!hasLoadedRef.current) return;

    try {
      localStorage.setItem('sakn_members', JSON.stringify(members));
      localStorage.setItem('sakn_expenses', JSON.stringify(expenses));
      localStorage.setItem('sakn_settlements', JSON.stringify(settlementsHistory));
    } catch (e) {
      console.warn('LocalStorage save issue:', e);
    }

    if (isSupabaseConfigured() && supabase) {
      // Supabase synchronization hook
    }
  }, [members, expenses, settlementsHistory]);

  // Add Member
  const addMember = (memberData) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-indigo-500',
    ];
    const newMember = {
      id: Date.now().toString(),
      name: memberData.name.trim(),
      email: memberData.email?.trim() || '',
      phone: memberData.phone?.trim() || '',
      color: colors[members.length % colors.length],
    };
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  // Delete Member
  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setExpenses((prev) =>
      prev.map((exp) => ({
        ...exp,
        splitBetween: exp.splitBetween.filter((mId) => mId !== id),
      }))
    );
  };

  // Add Expense
  const addExpense = (expenseData) => {
    const newExpense = {
      id: Date.now().toString(),
      title: expenseData.title.trim(),
      amount: parseFloat(expenseData.amount) || 0,
      paidBy: expenseData.paidBy,
      splitBetween: expenseData.splitBetween && expenseData.splitBetween.length > 0
        ? expenseData.splitBetween
        : members.map((m) => m.id),
      category: expenseData.category || 'عام',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes?.trim() || '',
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  };

  // Delete Expense
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Settle debt
  const settleDebt = ({ fromId, toId, amount }) => {
    const fromMember = members.find((m) => m.id === fromId);
    const toMember = members.find((m) => m.id === toId);

    const settlementRecord = {
      id: Date.now().toString(),
      fromId,
      toId,
      fromName: fromMember ? fromMember.name : 'عضو غير معروف',
      toName: toMember ? toMember.name : 'عضو غير معروف',
      amount: parseFloat(amount) || 0,
      date: new Date().toISOString().split('T')[0],
    };

    const settlementExpense = {
      id: 'settle_' + Date.now().toString(),
      title: `تسوية حساب: ${settlementRecord.fromName} سدد لـ ${settlementRecord.toName}`,
      amount: settlementRecord.amount,
      paidBy: fromId,
      splitBetween: [toId],
      category: 'تسوية',
      date: settlementRecord.date,
      notes: 'تمت التسوية بنجاح',
    };

    setExpenses((prev) => [settlementExpense, ...prev]);
    setSettlementsHistory((prev) => [settlementRecord, ...prev]);
  };

  // Reset to initial mock data
  const resetData = () => {
    setMembers(DEFAULT_MEMBERS);
    setExpenses(DEFAULT_EXPENSES);
    setSettlementsHistory([]);
  };

  // Calculations for balances and settlements
  const calculations = useMemo(() => {
    const totalExpenses = expenses
      .filter((e) => e.category !== 'تسوية')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const memberStats = {};
    members.forEach((m) => {
      memberStats[m.id] = {
        member: m,
        paid: 0,
        share: 0,
        net: 0,
      };
    });

    expenses.forEach((expense) => {
      const amt = Number(expense.amount) || 0;
      if (amt <= 0) return;

      if (memberStats[expense.paidBy]) {
        memberStats[expense.paidBy].paid += amt;
      }

      const splits = expense.splitBetween || [];
      if (splits.length > 0) {
        const splitAmount = amt / splits.length;
        splits.forEach((memberId) => {
          if (memberStats[memberId]) {
            memberStats[memberId].share += splitAmount;
          }
        });
      }
    });

    Object.values(memberStats).forEach((stat) => {
      stat.net = stat.paid - stat.share;
    });

    const debtors = [];
    const creditors = [];

    Object.values(memberStats).forEach((stat) => {
      const roundedNet = Math.round(stat.net * 100) / 100;
      if (roundedNet < -0.01) {
        debtors.push({ member: stat.member, amount: Math.abs(roundedNet) });
      } else if (roundedNet > 0.01) {
        creditors.push({ member: stat.member, amount: roundedNet });
      }
    });

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const suggestedSettlements = [];
    let dIdx = 0;
    let cIdx = 0;

    const debtorsCopy = debtors.map((d) => ({ ...d }));
    const creditorsCopy = creditors.map((c) => ({ ...c }));

    while (dIdx < debtorsCopy.length && cIdx < creditorsCopy.length) {
      const debtor = debtorsCopy[dIdx];
      const creditor = creditorsCopy[cIdx];

      const settleAmt = Math.min(debtor.amount, creditor.amount);
      if (settleAmt > 0.01) {
        suggestedSettlements.push({
          from: debtor.member,
          to: creditor.member,
          amount: Math.round(settleAmt * 100) / 100,
        });
      }

      debtor.amount -= settleAmt;
      creditor.amount -= settleAmt;

      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }

    return {
      totalExpenses,
      memberStats,
      suggestedSettlements,
    };
  }, [members, expenses]);

  const value = {
    members,
    expenses,
    settlementsHistory,
    isLoaded,
    totalExpenses: calculations.totalExpenses,
    memberStats: calculations.memberStats,
    suggestedSettlements: calculations.suggestedSettlements,
    addMember,
    deleteMember,
    addExpense,
    deleteExpense,
    settleDebt,
    resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
