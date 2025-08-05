import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client-enhanced';
import { toast } from 'sonner';
import { loginRateLimiter, validateSessionToken, generateCSRFToken, setCSRFToken } from '@/utils/authValidation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOnline: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<void>;
  getRemainingLoginAttempts: (email: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Session validation and refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[Auth] Session refresh failed:', error);
        // Don't show error to user, just log it
      }
    } catch (error) {
      console.error('[Auth] Session refresh error:', error);
    }
  }, []);

  // Enhanced auth state management
  useEffect(() => {
    let mounted = true;

    // Generate CSRF token
    const csrfToken = generateCSRFToken();
    setCSRFToken(csrfToken);

    // Set up auth state listener with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log(`[Auth] State change: ${event}`, {
          userId: currentSession?.user?.id,
          timestamp: new Date().toISOString(),
        });

        // Validate session token if present
        if (currentSession?.access_token && !validateSessionToken(currentSession.access_token)) {
          console.warn('[Auth] Invalid session token detected');
          await supabase.auth.signOut();
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            toast.success('Login realizado com sucesso!');
            // Cache user data for offline access
            if (currentSession?.user) {
              localStorage.setItem('gendar-user-cache', JSON.stringify({
                id: currentSession.user.id,
                email: currentSession.user.email,
                cached_at: Date.now(),
              }));
            }
            break;

          case 'SIGNED_OUT':
            toast.info('Você saiu da sua conta');
            // Clear cached data
            localStorage.removeItem('gendar-user-cache');
            break;

          case 'TOKEN_REFRESHED':
            console.log('[Auth] Token refreshed successfully');
            break;

          case 'USER_UPDATED':
            console.log('[Auth] User data updated');
            break;

          case 'PASSWORD_RECOVERY':
            toast.info('Verifique seu email para redefinir a senha');
            break;
        }
      }
    );

    // Get initial session with timeout
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Failed to get initial session:', error);
          // Try to load from cache if offline
          if (!isOnline) {
            const cached = localStorage.getItem('gendar-user-cache');
            if (cached) {
              const userData = JSON.parse(cached);
              // Only use cache if less than 1 hour old
              if (Date.now() - userData.cached_at < 3600000) {
                console.log('[Auth] Using cached user data (offline)');
                // Create minimal user object for offline use
                setUser({ id: userData.id, email: userData.email } as User);
              }
            }
          }
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (error) {
        console.error('[Auth] Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up periodic session refresh (every 50 minutes)
    const refreshInterval = setInterval(() => {
      if (session && isOnline) {
        refreshSession();
      }
    }, 50 * 60 * 1000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [session, isOnline, refreshSession]);

  // Enhanced sign in with rate limiting
  const signIn = async (email: string, password: string) => {
    try {
      // Check rate limiting
      const rateLimitCheck = loginRateLimiter.canAttempt(email);
      if (!rateLimitCheck.allowed) {
        const minutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60);
        toast.error(`Muitas tentativas de login. Tente novamente em ${minutes} minutos.`);
        return { user: null, session: null, error: new Error('Rate limited') };
      }

      // Check if online
      if (!isOnline) {
        toast.error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
        return { user: null, session: null, error: new Error('Offline') };
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Record attempt result
      loginRateLimiter.recordAttempt(email, !error);

      if (error) {
        // Show specific error messages
        let errorMessage = 'Erro ao fazer login';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Confirme seu email antes de fazer login';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos.';
        }
        
        toast.error(errorMessage);
        return { user: null, session: null, error };
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return { user: null, session: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign up
  const signUp = async (email: string, password: string, name: string) => {
    try {
      if (!isOnline) {
        toast.error('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
        return { user: null, session: null, error: new Error('Offline') };
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        let errorMessage = 'Erro ao criar conta';
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Senha deve ter pelo menos 6 caracteres';
        }
        
        toast.error(errorMessage);
        return { user: null, session: null, error };
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('[Auth] Sign up error:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return { user: null, session: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Auth] Sign out error:', error);
        // Force local logout even if server request fails
      }
      
      // Clear local state regardless of server response
      setUser(null);
      setSession(null);
      localStorage.removeItem('gendar-user-cache');
      
      return { error: null };
    } catch (error: any) {
      console.error('[Auth] Sign out error:', error);
      // Force local logout
      setUser(null);
      setSession(null);
      localStorage.removeItem('gendar-user-cache');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getRemainingLoginAttempts = (email: string) => {
    return loginRateLimiter.getRemainingAttempts(email);
  };

  const value = {
    user,
    session,
    loading,
    isOnline,
    signIn,
    signUp,
    signOut,
    refreshSession,
    getRemainingLoginAttempts,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useEnhancedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};