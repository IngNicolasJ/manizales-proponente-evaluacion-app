
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forceSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🚀 AuthProvider v4.0: Starting initialization...');
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }

        if (mounted) {
          console.log('📝 Setting initial state - user:', session?.user?.email || 'none');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Check admin role if user exists
          if (session?.user) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              const adminStatus = profile?.role === 'admin';
              setIsAdmin(adminStatus);
              console.log('👑 Admin status:', adminStatus);
            } catch (error) {
              console.error('Error checking admin role:', error);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
          
          // ALWAYS set loading to false after initial check
          setLoading(false);
          console.log('✅ Initial auth check complete - loading: false');
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
          console.log('✅ Auth error handled - loading: false');
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'none');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              const adminStatus = profile?.role === 'admin';
              setIsAdmin(adminStatus);
            } catch (error) {
              console.error('Error checking admin role:', error);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
          
          // ALWAYS ensure loading is false after state change
          setLoading(false);
          console.log('✅ Auth state change complete - loading: false');
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
  };

  const forceSignOut = async () => {
    console.log('🔥 Force signing out...');
    try {
      localStorage.clear();
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during force sign out:', error);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      window.location.href = '/auth';
    }
  };

  console.log('📊 AuthProvider v4.0 state - loading:', loading, 'user:', user?.email || 'none');

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    forceSignOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
