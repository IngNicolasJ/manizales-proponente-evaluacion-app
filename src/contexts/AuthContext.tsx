
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

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      const adminStatus = profile?.role === 'admin';
      console.log('AuthProvider: User is admin:', adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return false;
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    console.log('AuthProvider: Auth state cleared');
  };

  const processAuthState = async (session: Session | null) => {
    console.log('AuthProvider: Processing auth state:', session?.user?.email || 'none');
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      const adminStatus = await checkAdminRole(session.user.id);
      setIsAdmin(adminStatus);
    } else {
      setIsAdmin(false);
    }
    
    setLoading(false);
    console.log('AuthProvider: Auth processing complete, loading set to false');
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session?.user?.email || 'none');
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
          return;
        }
        
        await processAuthState(session);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('AuthProvider: Initial session:', initialSession?.user?.email || 'none');
        await processAuthState(initialSession);
      } catch (error) {
        console.error('Error getting initial session:', error);
        clearAuthState();
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
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
    console.log('AuthProvider: Signing out...');
    await supabase.auth.signOut();
  };

  const forceSignOut = async () => {
    console.log('AuthProvider: Force signing out...');
    try {
      localStorage.removeItem('sb-iudzwslvdgknfmsikxpy-auth-token');
      localStorage.clear();
      await supabase.auth.signOut();
      clearAuthState();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      console.error('Error during force sign out:', error);
      clearAuthState();
      setLoading(false);
      window.location.reload();
    }
  };

  console.log('AuthProvider: Current state - loading:', loading, 'user:', user?.email || 'none', 'session:', !!session, 'isAdmin:', isAdmin);

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
