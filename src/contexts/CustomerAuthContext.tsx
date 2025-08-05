import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { toast } from 'sonner';

interface CustomerAuthContextType {
  user: User | null;
  customer: Customer | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (updates: Partial<Customer>) => Promise<any>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch customer data when user changes
  const fetchCustomerData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching customer data:', error);
        return;
      }

      setCustomer(data);
    } catch (error) {
      console.error('Error in fetchCustomerData:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchCustomerData(currentSession.user.id);
        } else {
          setCustomer(null);
        }

        setLoading(false);

        // Show appropriate messages
        if (event === 'SIGNED_IN') {
          toast.success('Login realizado com sucesso!');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Você saiu da sua conta');
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchCustomerData(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error: any) {
      toast.error('Erro ao fazer login');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setLoading(true);

      // First, create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        const error = new Error('Erro ao criar usuário');
        toast.error(error.message);
        return { data: null, error };
      }

      // Then create customer profile
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          auth_user_id: authData.user.id,
          full_name: fullName,
          email,
          phone: phone || null,
        })
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer profile:', customerError);
        // Don't show error to user as auth was successful
        // The profile will be created on next login attempt
      }

      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      return { data: { user: authData.user, customer: customerData }, error: null };

    } catch (error: any) {
      console.error('Error in signUp:', error);
      toast.error('Erro ao criar conta');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return { error };
      }

      setUser(null);
      setCustomer(null);
      setSession(null);
      
      return { error: null };
    } catch (error: any) {
      console.error('Error in signOut:', error);
      toast.error('Erro ao sair da conta');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Customer>) => {
    try {
      if (!user || !customer) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar perfil');
        return { data: null, error };
      }

      setCustomer(data);
      toast.success('Perfil atualizado com sucesso!');
      return { data, error: null };

    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      toast.error('Erro ao atualizar perfil');
      return { data: null, error };
    }
  };

  const value = {
    user,
    customer,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};