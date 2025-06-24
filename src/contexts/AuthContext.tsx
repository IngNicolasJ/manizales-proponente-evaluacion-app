
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
    console.log('🚀 AuthProvider v5.0: Starting initialization...');
    
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Testing Supabase connection...');
        
        // Test basic Supabase connectivity first
        const startTime = Date.now();
        console.log('📡 Attempting to get session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        const endTime = Date.now();
        
        console.log(`⏱️ Session request took ${endTime - startTime}ms`);
        
        if (error) {
          console.error('❌ Error getting session:', error);
          console.error('❌ Error details:', {
            message: error.message,
            status: (error as any)?.status,
            statusCode: (error as any)?.statusCode
          });
        } else {
          console.log('✅ Session request successful');
        }

        if (mounted) {
          console.log('📝 Setting initial state - user:', session?.user?.email || 'none');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Check admin role if user exists
          if (session?.user) {
            try {
              console.log('👑 Checking admin role...');
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              if (profileError) {
                console.error('❌ Error checking admin role:', profileError);
                setIsAdmin(false);
              } else {
                const adminStatus = profile?.role === 'admin';
                setIsAdmin(adminStatus);
                console.log('👑 Admin status:', adminStatus);
              }
            } catch (error) {
              console.error('❌ Exception checking admin role:', error);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
          console.log('✅ Auth initialization complete v5.0');
        }
      } catch (error) {
        console.error('❌ Critical error in initializeAuth:', error);
        console.error('❌ Error stack:', (error as Error)?.stack);
        if (mounted) {
          setLoading(false);
          console.log('✅ Auth error handled - loading: false');
        }
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
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              const adminStatus = profile?.role === 'admin';
              setIsAdmin(adminStatus);
            } catch (error) {
              console.error('Error checking admin role in state change:', error);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
          console.log('✅ Auth state change complete v5.0');
        }
      }
    );

    // Set a timeout to force loading to false after 10 seconds
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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

  console.log('📊 AuthProvider v5.0 state - loading:', loading, 'user:', user?.email || 'none');

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
