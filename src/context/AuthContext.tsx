import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any;
  // 1. Actualizamos el tipo para incluir gender
  signUp: (email: string, password: string, name: string, gender: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      setProfile(data);
    } catch (e) {
      console.error('Error obteniendo profile:', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;

        setSession(session);
        setUser(currentUser);

        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;

      setSession(session);
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // SIGN UP 
  // 2. Recibimos gender como cuarto parámetro
  const signUp = useCallback(async (email: string, password: string, name: string, gender: string) => {
    console.log('USANDO URL:', import.meta.env.VITE_SUPABASE_URL);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      // 3. Pasamos los metadatos extras a Supabase
      options: {
        data: {
          full_name: name.trim(),
          gender: gender,
        }
      }
    });

    console.log('SIGNUP DATA:', data);
    console.log('SIGNUP ERROR:', error);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, []);

  // SIGN IN
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      console.error('LOGIN ERROR:', error);
      return { error: error.message };
    }

    const { data: userData } = await supabase.auth.getUser();
    console.log('CURRENT USER:', userData);

    return { error: null };
  }, []);

  // SIGN OUT
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}