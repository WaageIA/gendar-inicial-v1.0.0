
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const appointmentService = {
  // Get all appointments for the current user
  async getAppointments() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: [], error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userData.user.id) // SECURITY FIX: Filter by user_id
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        return { data: [], error: error.message };
      }

      // Convert date strings to Date objects
      const appointments = data.map(appointment => ({
        ...appointment,
        date: new Date(appointment.date),
        id: appointment.id,
        clientId: appointment.client_id,
        clientName: appointment.client_name,
        price: appointment.price || 0,
      })) as Appointment[];

      return { data: appointments, error: null };
    } catch (error: any) {
      console.error('Error in getAppointments:', error);
      return { data: [], error: error.message };
    }
  },

  // Create a new appointment
  async createAppointment(appointment: Omit<Appointment, 'id' | 'user_id'>) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Validate price
      if (!appointment.price || appointment.price <= 0) {
        toast.error('Preço deve ser maior que zero');
        return { data: null, error: 'Preço inválido' };
      }

      // Check for scheduling conflicts
      const conflictCheckStart = new Date(appointment.date);
      const conflictCheckEnd = new Date(appointment.date);
      conflictCheckEnd.setMinutes(conflictCheckEnd.getMinutes() + appointment.duration);

      const { data: conflicts, error: conflictError } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'scheduled')
        .lt('date', conflictCheckEnd.toISOString())
        .gt('date', new Date(conflictCheckStart.getTime() - 60 * 60 * 1000).toISOString());

      if (conflictError) {
        console.error('Error checking conflicts:', conflictError);
      } else if (conflicts && conflicts.length > 0) {
        // Check for actual overlap
        const hasConflict = conflicts.some(conflict => {
          const conflictStart = new Date(conflict.date);
          const conflictEnd = new Date(conflictStart);
          conflictEnd.setMinutes(conflictEnd.getMinutes() + conflict.duration);
          
          return (
            (conflictCheckStart < conflictEnd && conflictCheckEnd > conflictStart) &&
            conflict.status === 'scheduled'
          );
        });

        if (hasConflict) {
          toast.warning('Já existe um agendamento neste horário');
          return { data: null, error: 'Conflito de horário' };
        }
      }

      // Ensure status is a valid AppointmentStatus
      const status: AppointmentStatus = appointment.status;

      const { data, error } = await supabase.from('appointments').insert({
        client_id: appointment.clientId,
        client_name: appointment.clientName,
        date: appointment.date.toISOString(),
        service: appointment.service,
        duration: appointment.duration,
        status: status,
        notes: appointment.notes || null,
        location: appointment.location || null,
        price: appointment.price,
        user_id: userData.user.id
      }).select().single();

      if (error) {
        console.error('Error creating appointment:', error);
        return { data: null, error: error.message };
      }

      // Convert to Appointment type
      const newAppointment: Appointment = {
        id: data.id,
        clientId: data.client_id,
        clientName: data.client_name,
        date: new Date(data.date),
        service: data.service,
        duration: data.duration,
        status: data.status as AppointmentStatus,
        notes: data.notes,
        location: data.location,
        price: data.price || 0,
        user_id: data.user_id
      };

      toast.success('Agendamento criado com sucesso!');
      return { data: newAppointment, error: null };
    } catch (error: any) {
      console.error('Error in createAppointment:', error);
      toast.error('Erro ao criar agendamento');
      return { data: null, error: error.message };
    }
  },

  // Update an appointment
  async updateAppointment(appointment: Appointment) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Validate price
      if (!appointment.price || appointment.price <= 0) {
        toast.error('Preço deve ser maior que zero');
        return { data: null, error: 'Preço inválido' };
      }

      // Ensure status is a valid AppointmentStatus
      const status: AppointmentStatus = appointment.status;

      const { data, error } = await supabase
        .from('appointments')
        .update({
          client_id: appointment.clientId,
          client_name: appointment.clientName,
          date: appointment.date.toISOString(),
          service: appointment.service,
          duration: appointment.duration,
          status: status,
          notes: appointment.notes,
          location: appointment.location,
          price: appointment.price
        })
        .eq('id', appointment.id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        return { data: null, error: error.message };
      }

      // Convert to Appointment type
      const updatedAppointment: Appointment = {
        id: data.id,
        clientId: data.client_id,
        clientName: data.client_name,
        date: new Date(data.date),
        service: data.service,
        duration: data.duration,
        status: data.status as AppointmentStatus,
        notes: data.notes,
        location: data.location,
        price: data.price || 0,
        user_id: data.user_id
      };

      toast.success('Agendamento atualizado com sucesso!');
      return { data: updatedAppointment, error: null };
    } catch (error: any) {
      console.error('Error in updateAppointment:', error);
      toast.error('Erro ao atualizar agendamento');
      return { data: null, error: error.message };
    }
  },

  // Change appointment status
  async changeAppointmentStatus(id: string, status: AppointmentStatus) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error changing appointment status:', error);
        return { data: null, error: error.message };
      }

      // Convert to Appointment type
      const updatedAppointment: Appointment = {
        id: data.id,
        clientId: data.client_id,
        clientName: data.client_name,
        date: new Date(data.date),
        service: data.service,
        duration: data.duration,
        status: data.status as AppointmentStatus,
        notes: data.notes,
        location: data.location,
        price: data.price || 0,
        user_id: data.user_id
      };

      const statusMessages = {
        scheduled: 'Agendamento restaurado com sucesso!',
        completed: 'Agendamento concluído com sucesso!',
        cancelled: 'Agendamento cancelado com sucesso!'
      };

      if (status !== 'completed') {
        toast.success(statusMessages[status]);
      }
      
      return { data: updatedAppointment, error: null };
    } catch (error: any) {
      console.error('Error in changeAppointmentStatus:', error);
      toast.error('Erro ao alterar status do agendamento');
      return { data: null, error: error.message };
    }
  },

  // Delete an appointment
  async deleteAppointment(id: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { error: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error deleting appointment:', error);
        return { error: error.message };
      }

      toast.success('Agendamento excluído com sucesso!');
      return { error: null };
    } catch (error: any) {
      console.error('Error in deleteAppointment:', error);
      toast.error('Erro ao excluir agendamento');
      return { error: error.message };
    }
  },

  // Migrate appointments from localStorage to Supabase
  async migrateAppointmentsFromLocalStorage() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { error: 'Usuário não autenticado' };
      }

      // Get appointments from localStorage
      const savedAppointments = localStorage.getItem('nail-appointments');
      if (!savedAppointments) {
        return { error: null, message: 'Nenhum agendamento para migrar' };
      }

      const appointments = JSON.parse(savedAppointments) as Appointment[];
      if (appointments.length === 0) {
        return { error: null, message: 'Nenhum agendamento para migrar' };
      }

      // Prepare appointments for insert
      const appointmentsToInsert = appointments.map(appointment => ({
        client_id: appointment.clientId,
        client_name: appointment.clientName,
        date: appointment.date instanceof Date ? appointment.date.toISOString() : appointment.date,
        service: appointment.service,
        duration: appointment.duration,
        status: appointment.status as AppointmentStatus,
        notes: appointment.notes || null,
        location: appointment.location || null,
        price: appointment.price || 0,
        user_id: userData.user.id,
        id: appointment.id // Keep the original ID
      }));

      // Insert all appointments
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentsToInsert)
        .select();

      if (error) {
        console.error('Error migrating appointments:', error);
        return { error: error.message };
      }

      toast.success(`${data.length} agendamentos migrados com sucesso!`);
      return { error: null, data };
    } catch (error: any) {
      console.error('Error in migrateAppointmentsFromLocalStorage:', error);
      toast.error('Erro ao migrar agendamentos');
      return { error: error.message };
    }
  }
};
