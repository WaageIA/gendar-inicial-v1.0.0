import { supabase } from '@/integrations/supabase/client';
import { Service, AvailableSlot } from '@/types';
import { format, addMinutes, isBefore, isAfter, isSameDay } from 'date-fns';

export const serviceService = {
  async getServices(): Promise<{ data: Service[] | null; error: any }> {
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
        .from('services')
        .select('*')
        .eq('user_id', userId)
        .order('name');
        
      return { data, error };
    } catch (error) {
      console.error('Error in getServices:', error);
      return { data: null, error };
    }
  },

  async getServicesByBusiness(businessSlug: string): Promise<{ data: Service[] | null; error: any }> {
    try {
      // First, get the user_id from the profiles table using business_slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('business_slug', businessSlug)
        .single();

      if (profileError || !profileData) {
        return { 
          data: null, 
          error: profileError || new Error('Negócio não encontrado. Verifique o link.') 
        };
      }

      // Then get the services for that user
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('name');
        
      return { data, error };
    } catch (error) {
      console.error('Error in getServicesByBusiness:', error);
      return { data: null, error };
    }
  },

  async getAvailableSlots(
    businessSlug: string, 
    serviceId: string, 
    date: Date,
    professionalId?: string
  ): Promise<{ data: AvailableSlot[] | null; error: any }> {
    try {
      // Get business user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('business_slug', businessSlug)
        .single();

      if (profileError || !profileData) {
        return { data: null, error: new Error('Negócio não encontrado') };
      }

      // Get service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single();

      if (serviceError || !serviceData) {
        return { data: null, error: new Error('Serviço não encontrado') };
      }

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('date, duration')
        .eq('user_id', profileData.user_id)
        .eq('status', 'scheduled')
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (appointmentsError) {
        return { data: null, error: appointmentsError };
      }

      // Generate available slots
      const slots = this.generateTimeSlots(date, serviceData.duration, appointments || []);
      
      return { data: slots, error: null };
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      return { data: null, error };
    }
  },

  generateTimeSlots(date: Date, serviceDuration: number, existingAppointments: any[]): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const now = new Date();
    
    // Business hours: 9:00 to 18:00
    const startHour = 9;
    const endHour = 18;
    const slotInterval = 30; // 30 minutes intervals
    
    // Create slots for the day
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Skip past times for today
        if (isSameDay(date, now) && isBefore(slotTime, now)) {
          continue;
        }
        
        // Check if slot would end after business hours
        const slotEnd = addMinutes(slotTime, serviceDuration);
        const businessEnd = new Date(date);
        businessEnd.setHours(endHour, 0, 0, 0);
        
        if (isAfter(slotEnd, businessEnd)) {
          continue;
        }
        
        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.date);
          const appointmentEnd = addMinutes(appointmentStart, appointment.duration);
          
          return (
            (slotTime < appointmentEnd && slotEnd > appointmentStart)
          );
        });
        
        slots.push({
          time: format(slotTime, 'HH:mm'),
          available: !hasConflict,
          reason: hasConflict ? 'Horário ocupado' : undefined
        });
      }
    }
    
    return slots;
  },

  async createService(service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<{ data: Service[] | null; error: any }> {
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
        .from('services')
        .insert({ ...service, user_id: userId })
        .select();
        
      return { data, error };
    } catch (error) {
      console.error('Error in createService:', error);
      return { data: null, error };
    }
  },

  async updateService(id: string, updates: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<{ data: Service[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select();
        
      return { data, error };
    } catch (error) {
      console.error('Error in updateService:', error);
      return { data: null, error };
    }
  },

  async deleteService(id: string): Promise<{ data: null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
        
      return { data, error };
    } catch (error) {
      console.error('Error in deleteService:', error);
      return { data: null, error };
    }
  },
};