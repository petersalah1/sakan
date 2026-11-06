'use client';

import { useState, useEffect, useMemo, useRef, createContext, useContext, useCallback } from 'react';
import {
  INITIAL_APARTMENT,
  INITIAL_MEMBERS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  getStoredItem,
  setStoredItem,
} from '@/lib/storage';
import { calculateBalancesAndSettlements } from '@/utils/settlementCalculator';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ApartmentContext = createContext(null);

export function ApartmentProvider({ children }) {
  const [apartment, setApartment] = useState(INITIAL_APARTMENT);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local' | 'synced' | 'syncing' | 'error'
  const hasLoadedRef = useRef(false);

  // Fetch data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      setSyncStatus('syncing');

      // 1. Fetch Apartment
      const { data: aptData, error: aptError } = await supabase
        .from('apartments')
        .select('*')
        .limit(1)
        .maybeSingle();

      let currentAptId = apartment.id;

      if (!aptError && aptData) {
        setApartment(aptData);
        currentAptId = aptData.id;
      } else if (!aptData) {
        // Seed initial apartment to Supabase if empty
        const { data: newApt } = await supabase
          .from('apartments')
          .insert([
            {
              name: apartment.name,
              currency: apartment.currency,
              invite_code: apartment.invite_code,
            },
          ])
          .select()
          .single();
        if (newApt) {
          setApartment(newApt);
          currentAptId = newApt.id;
        }
      }

      // 2. Fetch Members
      const { data: memData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (memData && memData.length > 0) {
        setMembers(memData);
      } else {
        // Seed default members if profiles is empty
        const initialProfiles = INITIAL_MEMBERS.map((m) => ({
          apartment_id: currentAptId,
          name: m.name,
          email: m.email,
          phone: m.phone,
          avatar_color: m.avatar_color,
          role: m.role || 'member',
        }));
        const { data: createdMembers } = await supabase
          .from('profiles')
          .insert(initialProfiles)
          .select();
        if (createdMembers && createdMembers.length > 0) {
          setMembers(createdMembers);
        }
      }

      // 3. Fetch Expenses with splits
      const { data: expData } = await supabase
        .from('expenses')
        .select('*, expense_splits(*)')
        .order('expense_date', { ascending: false });

      if (expData) {
        const formattedExpenses = expData.map((e) => ({
          id: e.id,
          title: e.title,
          amount: parseFloat(e.amount),
          paid_by: e.paid_by,
          category: e.category,
          expense_date: e.expense_date,
          splits: (e.expense_splits || []).map((s) => s.member_id),
          notes: e.notes || '',
          created_at: e.created_at,
        }));
        setExpenses(formattedExpenses);
      }

      // 4. Fetch Settlements
      const { data: setlData } = await supabase
        .from('settlements')
        .select('*')
        .order('settled_at', { ascending: false });

      if (setlData) {
        // Map members for lookup
        const currentMembers = memData || [];
        const membersById = {};
        currentMembers.forEach((m) => {
          membersById[m.id] = m;
        });

        // Filter out known deleted IDs
        const deletedIds = new Set(getStoredItem('deleted_settlement_ids', []));

        // Known previous phantom duplicates from rapid test clicking
        const KNOWN_DUPLICATE_IDS = new Set([
          'c2af8beb-7bab-4a00-89c4-a98d34fa7e7a',
          '53c67a8c-f7f8-48ce-b0fb-be7efd40d859',
          '122d7d11-af86-4ffd-a6be-2b9b46cac172',
          'b4ed8227-f0d0-452a-9786-9aabbb982ab9',
          '74d60bb0-229a-417e-a3b7-e2dfc2b23d1f',
          '3802f26c-d18d-4012-81ab-34e9ffedc504',
          'df4f3d7a-4c6d-4f00-a42b-a709999462a9',
          '8c77801a-fd39-4620-92e5-8583b949e3a6',
          '301c394f-fa6d-4e8d-bb35-294bc0377da3',
          '8ec99b0f-f73c-4f15-afc9-6f62d808f18f',
          '4d49ea59-78f7-4369-b956-b51598194eda',
          '8bc875d5-dcdb-4de9-8a47-5eda52380f0e',
          '1d83d189-8b34-4798-a394-c5720e16ceb0',
          '0096b64d-b1ea-41a8-aba0-773b348b9072',
          'a4d273a3-9e28-4f3f-9dd1-1d9e17b013f6',
        ]);

        const formattedSettlements = [];
        const seenSignatures = new Set();

        for (const s of setlData) {
          if (deletedIds.has(s.id) || KNOWN_DUPLICATE_IDS.has(s.id)) continue;

          // Prevent identical rapid submissions on the same minute
          const dateMinute = s.settled_at ? s.settled_at.substring(0, 16) : '';
          const signature = `${s.from_member_id}_${s.to_member_id}_${s.amount}_${dateMinute}`;
          if (seenSignatures.has(signature)) continue;
          seenSignatures.add(signature);

          const fromMem = membersById[s.from_member_id];
          const toMem = membersById[s.to_member_id];
          const dateStr = s.settled_at ? s.settled_at.split('T')[0] : '';

          formattedSettlements.push({
            id: s.id,
            apartment_id: s.apartment_id,
            from_member_id: s.from_member_id,
            to_member_id: s.to_member_id,
            from_name: s.from_name || fromMem?.name || 'عضو',
            to_name: s.to_name || toMem?.name || 'عضو',
            amount: parseFloat(s.amount) || 0,
            settled_at: dateStr,
            notes: s.notes || '',
          });
        }

        setSettlements(formattedSettlements);
      }

      setSyncStatus('synced');
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local storage:', err);
      setSyncStatus('local');
    }
  }, [apartment.currency, apartment.id, apartment.invite_code, apartment.name]);

  // Initial load: LocalStorage first, then Supabase if configured
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedApt = getStoredItem('apartment', null);
        const savedMembers = getStoredItem('members', null);
        const savedExpenses = getStoredItem('expenses', null);
        const savedSettlements = getStoredItem('settlements', null);

        if (savedApt) setApartment(savedApt);
        if (savedMembers) setMembers(savedMembers);
        if (savedExpenses) setExpenses(savedExpenses);
        if (savedSettlements) setSettlements(savedSettlements);
      } catch (err) {
        console.warn('LocalStorage initial read error:', err);
      } finally {
        hasLoadedRef.current = true;
        setIsLoaded(true);

        if (isSupabaseConfigured()) {
          fetchSupabaseData();
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchSupabaseData]);

  // Realtime subscription: updates when any roommate adds an expense on their phone
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          fetchSupabaseData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settlements' },
        () => {
          fetchSupabaseData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchSupabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSupabaseData]);

  // Cache changes to localStorage
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    setStoredItem('apartment', apartment);
    setStoredItem('members', members);
    setStoredItem('expenses', expenses);
    setStoredItem('settlements', settlements);
  }, [apartment, members, expenses, settlements]);

  // Real-time calculations
  const { totalExpenses, memberStats, suggestedSettlements } = useMemo(() => {
    return calculateBalancesAndSettlements(members, expenses, settlements);
  }, [members, expenses, settlements]);

  // Add Expense
  const addExpense = async (expenseData) => {
    const tempId = 'exp-' + Date.now();
    const splitMemberIds =
      expenseData.splits && expenseData.splits.length > 0
        ? expenseData.splits
        : members.map((m) => m.id);

    const newExpense = {
      id: tempId,
      title: expenseData.title.trim(),
      amount: parseFloat(expenseData.amount) || 0,
      paid_by: expenseData.paid_by,
      category: expenseData.category || 'other',
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      splits: splitMemberIds,
      notes: expenseData.notes?.trim() || '',
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setExpenses((prev) => [newExpense, ...prev]);

    // Async sync to Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: insertedExp, error: expErr } = await supabase
          .from('expenses')
          .insert([
            {
              apartment_id: apartment.id,
              title: newExpense.title,
              amount: newExpense.amount,
              paid_by: newExpense.paid_by,
              category: newExpense.category,
              expense_date: newExpense.expense_date,
              notes: newExpense.notes,
            },
          ])
          .select()
          .single();

        if (!expErr && insertedExp) {
          const splitRows = splitMemberIds.map((mId) => ({
            expense_id: insertedExp.id,
            member_id: mId,
            amount: newExpense.amount / splitMemberIds.length,
          }));
          await supabase.from('expense_splits').insert(splitRows);

          // Update temporary ID with Supabase UUID
          setExpenses((prev) =>
            prev.map((e) => (e.id === tempId ? { ...e, id: insertedExp.id } : e))
          );
        }
      } catch (e) {
        console.warn('Supabase expense insert error:', e);
      }
    }

    return newExpense;
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('expenses').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase expense delete error:', e);
      }
    }
  };

  // Add Member
  const addMember = async (memberData) => {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];

    const tempId = 'm-' + Date.now();
    const newMember = {
      id: tempId,
      apartment_id: apartment.id,
      name: memberData.name.trim(),
      email: memberData.email?.trim() || '',
      phone: memberData.phone?.trim() || '',
      role: 'member',
      avatar_color: colors[members.length % colors.length],
      created_at: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);

    if (isSupabaseConfigured()) {
      try {
        const { data: insertedMem } = await supabase
          .from('profiles')
          .insert([
            {
              apartment_id: apartment.id,
              name: newMember.name,
              email: newMember.email,
              phone: newMember.phone,
              avatar_color: newMember.avatar_color,
              role: newMember.role,
            },
          ])
          .select()
          .single();

        if (insertedMem) {
          setMembers((prev) =>
            prev.map((m) => (m.id === tempId ? insertedMem : m))
          );
        }
      } catch (e) {
        console.warn('Supabase member insert error:', e);
      }
    }

    return newMember;
  };

  // Delete Member
  const deleteMember = async (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase member delete error:', e);
      }
    }
  };

  // Record Settlement
  const recordSettlement = async ({ fromMemberId, toMemberId, amount, notes = '' }) => {
    const fromMember = members.find((m) => m.id === fromMemberId);
    const toMember = members.find((m) => m.id === toMemberId);

    const tempId = 'stl-' + Date.now();
    const dateStr = new Date().toISOString().split('T')[0];

    const newSettlement = {
      id: tempId,
      apartment_id: apartment.id,
      from_member_id: fromMemberId,
      to_member_id: toMemberId,
      from_name: fromMember ? fromMember.name : 'عضو',
      to_name: toMember ? toMember.name : 'عضو',
      amount: parseFloat(amount) || 0,
      settled_at: dateStr,
      notes: notes || 'تم السداد والتسوية بنجاح',
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    if (isSupabaseConfigured()) {
      try {
        const { data: insertedStl, error: stlErr } = await supabase
          .from('settlements')
          .insert([
            {
              apartment_id: apartment.id,
              from_member_id: fromMemberId,
              to_member_id: toMemberId,
              amount: newSettlement.amount,
              notes: newSettlement.notes,
            },
          ])
          .select()
          .single();

        if (!stlErr && insertedStl) {
          setSettlements((prev) =>
            prev.map((s) =>
              s.id === tempId
                ? {
                    ...insertedStl,
                    amount: parseFloat(insertedStl.amount),
                    from_name: newSettlement.from_name,
                    to_name: newSettlement.to_name,
                    settled_at: (insertedStl.settled_at || dateStr).split('T')[0],
                  }
                : s
            )
          );
        }
      } catch (e) {
        console.warn('Supabase settlement insert error:', e);
      }
    }

    return newSettlement;
  };

  // Delete Settlement
  const deleteSettlement = async (id) => {
    // 1. Remember deleted ID in localStorage so it never re-appears
    try {
      const existingDeleted = getStoredItem('deleted_settlement_ids', []);
      if (!existingDeleted.includes(id)) {
        setStoredItem('deleted_settlement_ids', [...existingDeleted, id]);
      }
    } catch (e) {
      console.warn('Failed to update deleted_settlement_ids in storage:', e);
    }

    // 2. Remove from active state immediately
    setSettlements((prev) => prev.filter((s) => s.id !== id));

    // 3. Remove from Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('settlements').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase settlement delete error:', e);
      }
    }
  };

  // Update Member details (e.g. phone, email)
  const updateMember = async (id, updates) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase member update error:', e);
      }
    }
  };

  // Clear all settlements
  const clearAllSettlements = async () => {
    const allIds = settlements.map((s) => s.id);
    const existingDeleted = getStoredItem('deleted_settlement_ids', []);
    const combined = Array.from(new Set([...existingDeleted, ...allIds]));
    setStoredItem('deleted_settlement_ids', combined);

    setSettlements([]);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('settlements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase clear settlements error:', e);
      }
    }
  };

  // Update Apartment Info
  const updateApartment = async (updates) => {
    setApartment((prev) => ({ ...prev, ...updates }));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('apartments').update(updates).eq('id', apartment.id);
      } catch (e) {
        console.warn('Supabase apartment update error:', e);
      }
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setApartment(INITIAL_APARTMENT);
    setMembers(INITIAL_MEMBERS);
    setExpenses(INITIAL_EXPENSES);
    setSettlements(INITIAL_SETTLEMENTS);
  };

  return (
    <ApartmentContext.Provider
      value={{
        apartment,
        members,
        expenses,
        settlements,
        isLoaded,
        syncStatus,
        totalExpenses,
        memberStats,
        suggestedSettlements,
        addExpense,
        deleteExpense,
        addMember,
        updateMember,
        deleteMember,
        recordSettlement,
        deleteSettlement,
        clearAllSettlements,
        updateApartment,
        resetToDefaults,
        isSupabaseConnected: isSupabaseConfigured(),
        refreshData: fetchSupabaseData,
      }}
    >
      {children}
    </ApartmentContext.Provider>
  );
}

export function useApartment() {
  const context = useContext(ApartmentContext);
  if (!context) {
    throw new Error('useApartment must be used within an ApartmentProvider');
  }
  return context;
}
