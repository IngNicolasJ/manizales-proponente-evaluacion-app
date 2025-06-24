
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
    console.log('🚀 AuthProvider v6.0: Starting initialization...');
    
    let mounted = true;

    const checkAdminRole = async (userId: string) => {
      try {
        console.log('👑 Checking admin role for user:', userId);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('❌ Error checking admin role:', error);
          return false;
        }
        
        const adminStatus = profile?.role === 'admin';
        console.log('👑 Admin status:', adminStatus);
        return adminStatus;
      } catch (error) {
        console.error('❌ Exception checking admin role:', error);
        return false;
      }
    };

    // Set up auth state listener
    console.log('🔄 Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'none');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Check admin role asynchronously without blocking
            setTimeout(async () => {
              const adminStatus = await checkAdminRole(session.user.id);
              if (mounted) {
                setIsAdmin(adminStatus);
              }
            }, 0);
          } else {
            setIsAdmin(false);
          }
          
          // Always set loading to false when auth state changes
          setLoading(false);
          console.log('✅ Auth state change complete v6.0');
        }
      }
    );

    // Initialize auth
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Check admin role asynchronously
            setTimeout(async () => {
              const adminStatus = await checkAdminRole(session.user.id);
              if (mounted) {
                setIsAdmin(adminStatus);
              }
            }, 0);
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
          console.log('✅ Auth initialization complete v6.0');
        }
      } catch (error) {
        console.error('❌ Critical error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log('🧹 Auth provider cleanup complete');
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 Attempting sign up for:', email);
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
    
    if (error) {
      console.error('❌ Sign up error:', error);
    } else {
      console.log('✅ Sign up successful');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
    } else {
      console.log('✅ Sign in successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      setLoading(false);
    }
  };

  const forceSignOut = async () => {
    console.log('🔥 Force signing out...');
    try {
      setLoading(true);
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

  console.log('📊 AuthProvider v6.0 state - loading:', loading, 'user:', user?.email || 'none', 'isAdmin:', isAdmin);

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
