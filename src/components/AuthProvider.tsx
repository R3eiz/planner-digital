'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>(
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se Supabase não está configurado, redirecionar para /auth
    if (!isSupabaseConfigured()) {
      setLoading(false);
      if (pathname !== '/auth') {
        router.push('/auth');
      }
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          router.push('/');
        } else if (event === 'SIGNED_OUT') {
          router.push('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Redirect logic
  useEffect(() => {
    if (!loading && isSupabaseConfigured()) {
      if (!user && pathname !== '/auth') {
        router.push('/auth');
      } else if (user && pathname === '/auth') {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando NOVUS 2026...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
