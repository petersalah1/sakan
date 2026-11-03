'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getStoredItem, setStoredItem } from '@/lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return getStoredItem('user', {
      id: '7585eb0f-839d-4a68-93ce-c114bbb1001a',
      name: 'بيتر صلاح',
      email: 'petersalah104@gmail.com',
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
            name: session.user.user_metadata?.name || 'بيتر صلاح',
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
            name: session.user.user_metadata?.name || 'بيتر صلاح',
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
          name: data.user.user_metadata?.name || 'بيتر صلاح',
          isDemo: false,
        });
        return { success: true };
      } else {
        const demoUser = {
          id: 'u-peter',
          name: 'بيتر صلاح',
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

  const loginAsDemo = (memberName = 'بيتر صلاح') => {
    const demoUser = {
      id: '7585eb0f-839d-4a68-93ce-c114bbb1001a',
      name: memberName,
      email: 'petersalah104@gmail.com',
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
