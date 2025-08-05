import { supabase } from '@/integrations/supabase/client';
import { Professional, CreateProfessionalData } from '@/types';

export const professionalService = {
  async getProfessionals(): Promise<{ data: Professional[] | null; error: any }> {
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
        .from('professionals')
        .select('*')
        .eq('user_id', userId)
        .order('name');
        
      return { data, error };
    } catch (error) {
      console.error('Error in getProfessionals:', error);
      return { data: null, error };
    }
  },

  async getProfessionalsByBusiness(businessSlug: string): Promise<{ data: Professional[] | null; error: any }> {
    try {
      // Get business user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('business_slug', businessSlug)
        .single();

      if (profileError || !profileData) {
        return { 
          data: null, 
          error: profileError || new Error('Negócio não encontrado') 
        };
      }

      // Get professionals for that business
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('name');
        
      return { data, error };
    } catch (error) {
      console.error('Error in getProfessionalsByBusiness:', error);
      return { data: null, error };
    }
  },

  async createProfessional(professional: CreateProfessionalData): Promise<{ data: Professional[] | null; error: any }> {
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
        .from('professionals')
        .insert({ ...professional, user_id: userId })
        .select();
        
      return { data, error };
    } catch (error) {
      console.error('Error in createProfessional:', error);
      return { data: null, error };
    }
  },

  async updateProfessional(id: string, updates: Partial<CreateProfessionalData>): Promise<{ data: Professional[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();
        
      return { data, error };
    } catch (error) {
      console.error('Error in updateProfessional:', error);
      return { data: null, error };
    }
  },

  async deleteProfessional(id: string): Promise<{ data: null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);
        
      return { data, error };
    } catch (error) {
      console.error('Error in deleteProfessional:', error);
      return { data: null, error };
    }
  },
};