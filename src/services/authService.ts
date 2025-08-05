
import { supabase } from '@/integrations/supabase/client-enhanced';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type AuthUser = User | null;
export type AuthSession = Session | null;

export const authService = {
  // Login with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { user: null, session: null, error };
      }

      toast.success('Login realizado com sucesso!');
      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      toast.error('Erro ao fazer login');
      return { user: null, session: null, error };
    }
  },

  // Register a new user
  async signUp(email: string, password: string, name: string) {
    try {
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
        toast.error(error.message);
        return { user: null, session: null, error };
      }

      toast.success('Cadastro realizado com sucesso! Verifique seu email.');
      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      toast.error('Erro ao fazer cadastro');
      return { user: null, session: null, error };
    }
  },

  // Logout (without toast - handled by UI layer)
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      console.error('SignOut service error:', error);
      return { error };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { session: null, error };
      }
      return { session: data.session, error: null };
    } catch (error: any) {
      return { session: null, error };
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return { user: null, error };
      }
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  }
};
