import { supabase } from '@/integrations/supabase/client';
import { Customer, CreateCustomerData, CreateAppointmentData } from '@/types';
import { toast } from 'sonner';

export const customerService = {
  async createCustomer(customerData: CreateCustomerData): Promise<{ data: Customer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in createCustomer:', error);
      return { data: null, error };
    }
  },

  async findOrCreateCustomer(customerData: CreateCustomerData): Promise<{ data: Customer | null; error: any }> {
    try {
      // First, try to find existing customer by email
      const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerData.email)
        .single();

      if (existingCustomer && !findError) {
        // Customer exists, update if needed
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            full_name: customerData.full_name,
            phone: customerData.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCustomer.id)
          .select()
          .single();

        return { data: updatedCustomer, error: updateError };
      }

      // Customer doesn't exist, create new one
      return await this.createCustomer(customerData);
    } catch (error) {
      console.error('Error in findOrCreateCustomer:', error);
      return { data: null, error };
    }
  },

  async createPublicAppointment(
    businessSlug: string,
    appointmentData: CreateAppointmentData,
    customerData: CreateCustomerData
  ): Promise<{ data: any | null; error: any }> {
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

      // Find or create customer
      const { data: customer, error: customerError } = await this.findOrCreateCustomer(customerData);
      
      if (customerError || !customer) {
        return { data: null, error: customerError || new Error('Erro ao criar cliente') };
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: profileData.user_id,
          customer_id: customer.id,
          professional_id: appointmentData.professional_id,
          client_id: customer.client_id || customer.id, // Fallback to customer.id if no client_id
          client_name: appointmentData.client_name,
          date: appointmentData.date.toISOString(),
          service: appointmentData.service,
          duration: appointmentData.duration,
          status: 'scheduled',
          notes: appointmentData.notes,
          location: appointmentData.location,
          price: appointmentData.price,
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        return { data: null, error: appointmentError };
      }

      toast.success('Agendamento realizado com sucesso!');
      return { data: { appointment, customer }, error: null };
    } catch (error) {
      console.error('Error in createPublicAppointment:', error);
      toast.error('Erro ao realizar agendamento');
      return { data: null, error };
    }
  },

  async getCustomerAppointments(customerId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching customer appointments:', error);
        return { data: null, error };
      }

      // Convert date strings to Date objects
      const appointments = data.map(appointment => ({
        ...appointment,
        date: new Date(appointment.date),
      }));

      return { data: appointments, error: null };
    } catch (error) {
      console.error('Error in getCustomerAppointments:', error);
      return { data: null, error };
    }
  },

  async cancelCustomerAppointment(appointmentId: string, customerId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error cancelling appointment:', error);
        toast.error('Erro ao cancelar agendamento');
        return { error };
      }

      toast.success('Agendamento cancelado com sucesso!');
      return { error: null };
    } catch (error) {
      console.error('Error in cancelCustomerAppointment:', error);
      toast.error('Erro ao cancelar agendamento');
      return { error };
    }
  },

  async updateCustomerProfile(customerId: string, updates: Partial<CreateCustomerData>): Promise<{ data: Customer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer profile:', error);
        toast.error('Erro ao atualizar perfil');
        return { data: null, error };
      }

      toast.success('Perfil atualizado com sucesso!');
      return { data, error: null };
    } catch (error) {
      console.error('Error in updateCustomerProfile:', error);
      toast.error('Erro ao atualizar perfil');
      return { data: null, error };
    }
  },
};