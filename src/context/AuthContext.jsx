import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { demoUsers } from '../lib/demoData';

const AuthContext = createContext(null);
const STORAGE_KEY = 'itdesk-demo-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (hasSupabaseConfig) {
        const { data } = await supabase.auth.getSession();
        const authUser = data.session?.user;
        if (authUser) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
          if (mounted) setUser(profile);
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setUser(JSON.parse(saved));
      }
      if (mounted) setLoading(false);
    }

    loadSession();

    if (!hasSupabaseConfig) return () => { mounted = false; };
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUser(profile);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    if (hasSupabaseConfig) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return;
    }
    const matched = demoUsers.find((candidate) => candidate.email === email && candidate.password === password);
    if (!matched) throw new Error('Invalid demo credentials. Try admin@servicedesk.dev / password123');
    const profile = { ...matched };
    delete profile.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }

  async function register(form) {
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } },
      });
      if (error) throw error;
      return data;
    }
    const profile = {
      id: `u-${crypto.randomUUID()}`,
      full_name: form.full_name,
      email: form.email,
      role: 'End User',
      department: form.department || 'General',
      is_active: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  }

  async function logout() {
    if (hasSupabaseConfig) await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, isDemo: !hasSupabaseConfig }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
