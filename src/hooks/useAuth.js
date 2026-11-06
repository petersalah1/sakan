'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getStoredItem, setStoredItem } from '@/lib/storage';

const AuthContext = createContext(null);

export function normalizePhone(raw = '') {
  if (!raw) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let clean = raw.toString().trim();
  arabicNumerals.forEach((d, idx) => {
    clean = clean.replaceAll(d, idx.toString());
  });
  clean = clean.replace(/[^0-9]/g, '');
  if (clean.startsWith('20') && clean.length === 12) {
    clean = '0' + clean.substring(2);
  }
  return clean;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize user from localStorage once mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = getStoredItem('user', null);
      if (stored && stored.id) {
        setUser(stored);
      }
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync latest user details from Supabase if configured
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) return;

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const updated = {
            id: data.id,
            name: data.name,
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'member',
            avatar_color: data.avatar_color || 'bg-emerald-500',
            apartment_id: data.apartment_id,
          };
          setUser(updated);
          setStoredItem('user', updated);
        }
      });
  }, [user?.id]);

  // Login with Phone or Email (Fast lookup in invited members)
  const loginWithIdentifier = useCallback(async (identifier) => {
    setLoading(true);
    try {
      const trimmed = (identifier || '').trim();
      if (!trimmed) {
        return { success: false, error: 'يرجى كتابة رقم الهاتف أو البريد الإلكتروني' };
      }

      const isEmail = trimmed.includes('@');
      const cleanPhone = normalizePhone(trimmed);
      const cleanEmail = trimmed.toLowerCase();

      let matchedProfile = null;

      if (isSupabaseConfigured()) {
        const { data: profiles, error } = await supabase.from('profiles').select('*');
        if (!error && profiles) {
          matchedProfile = profiles.find((p) => {
            if (isEmail && p.email && p.email.toLowerCase() === cleanEmail) return true;
            if (cleanPhone && p.phone && normalizePhone(p.phone) === cleanPhone) return true;
            // Also allow matching by exact name if no phone/email was entered
            if (p.name && p.name.trim().toLowerCase() === trimmed.toLowerCase()) return true;
            return false;
          });
        }
      }

      // Fallback to local members if offline or not in Supabase yet
      if (!matchedProfile) {
        const localMembers = getStoredItem('members', []);
        matchedProfile = localMembers.find((p) => {
          if (isEmail && p.email && p.email.toLowerCase() === cleanEmail) return true;
          if (cleanPhone && p.phone && normalizePhone(p.phone) === cleanPhone) return true;
          if (p.name && p.name.trim().toLowerCase() === trimmed.toLowerCase()) return true;
          return false;
        });
      }

      if (matchedProfile) {
        const loggedUser = {
          id: matchedProfile.id,
          name: matchedProfile.name,
          email: matchedProfile.email || '',
          phone: matchedProfile.phone || '',
          role: matchedProfile.role || 'member',
          avatar_color: matchedProfile.avatar_color || 'bg-emerald-500',
          apartment_id: matchedProfile.apartment_id,
        };
        setUser(loggedUser);
        setStoredItem('user', loggedUser);
        return { success: true, user: loggedUser };
      }

      return {
        success: false,
        notFound: true,
        error: 'لم نجد حساباً مسجلاً بهذا الرقم أو الإيميل. إذا كنت ساكناً جديداً، يرجى استخدام تبويب "الانضمام برمز الدعوة".',
      };
    } catch (err) {
      return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Join or Claim an existing invited profile using the Apartment Invite Code
  const joinWithInvite = useCallback(async ({ inviteCode, memberId, name, phone, email }) => {
    setLoading(true);
    try {
      const cleanCode = (inviteCode || '').trim().toUpperCase();
      if (!cleanCode) {
        return { success: false, error: 'يرجى إدخال رمز دعوة السكن' };
      }

      // 1. Verify Invite Code against Apartment in Supabase
      let aptInviteCode = 'PETER2026';
      let aptId = 'd71498f6-43c2-4824-9685-cba44c879acf';

      if (isSupabaseConfigured()) {
        const { data: aptData } = await supabase.from('apartments').select('*').limit(1).maybeSingle();
        if (aptData) {
          aptInviteCode = (aptData.invite_code || 'PETER2026').trim().toUpperCase();
          aptId = aptData.id;
        }
      }

      if (cleanCode !== aptInviteCode) {
        return {
          success: false,
          error: 'رمز الدعوة غير صحيح! الدخول بدعوة فقط من المشرف بيتر صلاح. اطلب الرمز منه للمتابعة.',
        };
      }

      const cleanPhone = normalizePhone(phone);
      const cleanEmail = (email || '').trim().toLowerCase();

      // Case A: Claim an existing profile (e.g. Peter already added 'مقار', and مقار enters his phone)
      if (memberId) {
        let updatedProfile = null;
        if (isSupabaseConfigured()) {
          const updates = {};
          if (cleanPhone) updates.phone = cleanPhone;
          if (cleanEmail) updates.email = cleanEmail;

          const { data } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', memberId)
            .select()
            .single();
          if (data) updatedProfile = data;
        }

        if (!updatedProfile) {
          const localMembers = getStoredItem('members', []);
          const found = localMembers.find((m) => m.id === memberId);
          if (found) {
            updatedProfile = {
              ...found,
              phone: cleanPhone || found.phone,
              email: cleanEmail || found.email,
            };
          }
        }

        if (updatedProfile) {
          const loggedUser = {
            id: updatedProfile.id,
            name: updatedProfile.name,
            email: updatedProfile.email || '',
            phone: updatedProfile.phone || '',
            role: updatedProfile.role || 'member',
            avatar_color: updatedProfile.avatar_color || 'bg-emerald-500',
            apartment_id: updatedProfile.apartment_id,
          };
          setUser(loggedUser);
          setStoredItem('user', loggedUser);
          return { success: true, user: loggedUser };
        }
      }

      // Case B: Create brand new roommate profile with valid invite code
      const cleanName = (name || '').trim();
      if (!cleanName) {
        return { success: false, error: 'يرجى كتابة اسمك للانضمام للسكن' };
      }

      const colors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-teal-500',
        'bg-indigo-500',
        'bg-cyan-500',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      let createdMember = null;
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              apartment_id: aptId,
              name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              role: 'member',
              avatar_color: randomColor,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (!error && data) createdMember = data;
      }

      if (!createdMember) {
        createdMember = {
          id: 'mem-' + Date.now(),
          apartment_id: aptId,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          role: 'member',
          avatar_color: randomColor,
          is_active: true,
        };
      }

      const loggedUser = {
        id: createdMember.id,
        name: createdMember.name,
        email: createdMember.email || '',
        phone: createdMember.phone || '',
        role: createdMember.role || 'member',
        avatar_color: createdMember.avatar_color || 'bg-emerald-500',
        apartment_id: createdMember.apartment_id,
      };

      setUser(loggedUser);
      setStoredItem('user', loggedUser);
      return { success: true, user: loggedUser };
    } catch (err) {
      return { success: false, error: err.message || 'فشل الانضمام برمز الدعوة' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Quick Login as Peter Salah (Admin)
  const loginAsPeter = useCallback(async () => {
    setLoading(true);
    try {
      let peterProfile = null;
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle();
        if (data) peterProfile = data;
      }

      if (!peterProfile) {
        peterProfile = {
          id: '7585eb0f-839d-4a68-93ce-c114bbb1001a',
          name: 'بيتر صلاح',
          email: 'petersalah104@gmail.com',
          role: 'admin',
          avatar_color: 'bg-emerald-500',
          apartment_id: 'd71498f6-43c2-4824-9685-cba44c879acf',
        };
      }

      const loggedUser = {
        id: peterProfile.id,
        name: peterProfile.name || 'بيتر صلاح',
        email: peterProfile.email || 'petersalah104@gmail.com',
        phone: peterProfile.phone || '',
        role: 'admin',
        avatar_color: peterProfile.avatar_color || 'bg-emerald-500',
        apartment_id: peterProfile.apartment_id,
      };

      setUser(loggedUser);
      setStoredItem('user', loggedUser);
      return { success: true, user: loggedUser };
    } finally {
      setLoading(false);
    }
  }, []);

  // Direct login as a selected existing member (from apartment list)
  const loginAsMember = useCallback((member) => {
    if (!member) return;
    const loggedUser = {
      id: member.id,
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'member',
      avatar_color: member.avatar_color || 'bg-emerald-500',
      apartment_id: member.apartment_id,
    };
    setUser(loggedUser);
    setStoredItem('user', loggedUser);
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setStoredItem('user', null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        loading,
        loginWithIdentifier,
        joinWithInvite,
        loginAsPeter,
        loginAsMember,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
