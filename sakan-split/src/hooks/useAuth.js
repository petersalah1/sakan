'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getStoredItem, setStoredItem } from '@/lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return getStoredItem('user', {
      id: 'm-1',
      name: 'أحمد محمود',
      email: 'ahmed@sakansplit.local',
      isDemo: true,
    });
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            isDemo: false,
          });
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            isDemo: false,
          });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          isDemo: false,
        });
        return { success: true };
      } else {
        // Local mode login
        const demoUser = {
          id: 'u-' + Date.now(),
          name: email.split('@')[0],
          email,
          isDemo: true,
        };
        setUser(demoUser);
        setStoredItem('user', demoUser);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (memberName = 'أحمد محمود') => {
    const demoUser = {
      id: 'm-1',
      name: memberName,
      email: 'demo@sakansplit.local',
      isDemo: true,
    };
    setUser(demoUser);
    setStoredItem('user', demoUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setStoredItem('user', null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        loginAsDemo,
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

