import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types';

export const serviceService = {
  async getServices(): Promise<{ data: Service[] | null; error: any }> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return { data: null, error: sessionError };
    }
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }
    const { data, error } = await supabase.from('services').select('*').eq('user_id', userId);
    return { data, error };
  },

  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<{ data: Service[] | null; error: any }> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return { data: null, error: sessionError };
    }
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }
    const { data, error } = await supabase.from('services').insert({ ...service, user_id: userId }).select();
    return { data, error };
  },

  async updateService(id: string, updates: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<{ data: Service[] | null; error: any }> {
    const { data, error } = await supabase.from('services').update(updates).eq('id', id).select();
    return { data, error };
  },

  async deleteService(id: string): Promise<{ data: null; error: any }> {
    const { data, error } = await supabase.from('services').delete().eq('id', id);
    return { data, error };
  },
};
