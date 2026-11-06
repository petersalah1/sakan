'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getStoredItem, setStoredItem } from '@/lib/storage';

const AuthContext = createContext(null);

export const ADMIN_PASSCODE = '1042004'; // Peter Salah's secure admin PIN (derived from petersalah104)

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
      .eq('is_active', true)
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
        } else {
          // If deactivated or deleted, log out
          setUser(null);
          setStoredItem('user', null);
        }
      });
  }, [user?.id]);

  // Login for Roommates: By phone number added by Peter
  const loginWithPhone = useCallback(async (phoneInput) => {
    setLoading(true);
    try {
      const cleanPhone = normalizePhone(phoneInput);
      if (!cleanPhone || cleanPhone.length < 8) {
        return { success: false, error: 'يرجى كتابة رقم هاتف صحيح مكون من 11 رقماً' };
      }

      let matchedProfile = null;

      if (isSupabaseConfigured()) {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_active', true);

        if (!error && profiles) {
          matchedProfile = profiles.find((p) => {
            if (!p.phone) return false;
            return normalizePhone(p.phone) === cleanPhone;
          });
        }
      }

      // Fallback to local members if offline
      if (!matchedProfile) {
        const localMembers = getStoredItem('members', []);
        matchedProfile = localMembers.find((p) => {
          if (!p.phone) return false;
          return normalizePhone(p.phone) === cleanPhone;
        });
      }

      if (matchedProfile) {
        const loggedUser = {
          id: matchedProfile.id,
          name: matchedProfile.name,
          email: matchedProfile.email || '',
          phone: matchedProfile.phone || '',
          role: matchedProfile.role || 'member',
          avatar_color: matchedProfile.avatar_color || 'bg-blue-500',
          apartment_id: matchedProfile.apartment_id,
        };
        setUser(loggedUser);
        setStoredItem('user', loggedUser);
        return { success: true, user: loggedUser };
      }

      return {
        success: false,
        error:
          'رقم الهاتف غير مسجل في السكن! الدخول مقتصر فقط على الأعضاء الذين أضافهم المشرف بيتر صلاح. يرجى التواصل معه لإضافتك أولاً.',
      };
    } catch (err) {
      return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login for Peter Salah (Admin): Secure with Admin PIN
  const loginAsAdmin = useCallback(async (passcode) => {
    setLoading(true);
    try {
      const cleanCode = (passcode || '').trim();
      if (cleanCode !== ADMIN_PASSCODE && cleanCode !== '1042004') {
        return { success: false, error: 'رمز مرور المشرف غير صحيح! هذه الصفحة مخصصة لبيتر صلاح فقط.' };
      }

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
        loginWithPhone,
        loginAsAdmin,
        logout,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin' || user?.id === '7585eb0f-839d-4a68-93ce-c114bbb1001a',
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
