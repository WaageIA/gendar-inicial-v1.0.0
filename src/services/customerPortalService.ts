import { supabase } from '@/integrations/supabase/client-enhanced';
import { CustomerPortalSettings, CreateCustomerPortalSettings } from '@/types';
import { toast } from 'sonner';

export const customerPortalService = {
  async getPortalSettings(): Promise<{ data: CustomerPortalSettings | null; error: any }> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        return { data: null, error: new Error('User not authenticated') };
      }
      
      const { data, error } = await supabase
        .from('customer_portal_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // No settings found, return default settings
        return { data: null, error: null };
      }
        
      return { data, error };
    } catch (error) {
      console.error('Error in getPortalSettings:', error);
      return { data: null, error };
    }
  },

  async createOrUpdatePortalSettings(settings: CreateCustomerPortalSettings): Promise<{ data: CustomerPortalSettings | null; error: any }> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('customer_portal_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('customer_portal_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('customer_portal_settings')
          .insert({
            ...settings,
            user_id: userId,
          })
          .select()
          .single();
      }

      if (result.error) {
        toast.error('Erro ao salvar configurações');
        return { data: null, error: result.error };
      }

      // Also update or create profile with business_slug
      await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          business_name: settings.business_name,
          business_slug: settings.business_slug,
          updated_at: new Date().toISOString(),
        });

      toast.success('Configurações salvas com sucesso!');
      return { data: result.data, error: null };

    } catch (error) {
      console.error('Error in createOrUpdatePortalSettings:', error);
      toast.error('Erro ao salvar configurações');
      return { data: null, error };
    }
  },

  async checkBusinessSlugAvailability(slug: string): Promise<{ available: boolean; error: any }> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { available: false, error: sessionError };
      }
      
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        return { available: false, error: new Error('User not authenticated') };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('business_slug', slug)
        .neq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No other user has this slug
        return { available: true, error: null };
      }

      if (error) {
        return { available: false, error };
      }

      // Another user has this slug
      return { available: false, error: null };

    } catch (error) {
      console.error('Error in checkBusinessSlugAvailability:', error);
      return { available: false, error };
    }
  },

  async getPortalStats(): Promise<{ data: any | null; error: any }> {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Get customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('auth_user_id', userId);

      // Get appointments from customers
      const { count: customerAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .not('customer_id', 'is', null);

      // Get recent customer registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        data: {
          totalCustomers: customerCount || 0,
          customerAppointments: customerAppointments || 0,
          recentCustomers: recentCustomers || 0,
        },
        error: null
      };

    } catch (error) {
      console.error('Error in getPortalStats:', error);
      return { data: null, error };
    }
  },
};