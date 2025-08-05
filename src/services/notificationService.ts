
import { supabase } from '@/integrations/supabase/client-enhanced';
import { Notification, NotificationType, NotificationStatus } from '@/types';
import { toast } from 'sonner';

export const notificationService = {
  async getNotifications() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: [], error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id) // SECURITY FIX: Filter by user_id
        .order('scheduled_for', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return { data: [], error: error.message };
      }

      const notifications = data.map(notification => ({
        ...notification,
        type: notification.type as NotificationType,
        status: notification.status as NotificationStatus,
        scheduled_for: new Date(notification.scheduled_for),
        sent_at: notification.sent_at ? new Date(notification.sent_at) : undefined,
        created_at: new Date(notification.created_at),
        updated_at: new Date(notification.updated_at),
      })) as Notification[];

      return { data: notifications, error: null };
    } catch (error: any) {
      console.error('Error in getNotifications:', error);
      return { data: [], error: error.message };
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase.from('notifications').insert({
        client_id: notification.client_id,
        client_name: notification.client_name,
        appointment_id: notification.appointment_id,
        type: notification.type,
        template_message: notification.template_message,
        scheduled_for: notification.scheduled_for.toISOString(),
        status: notification.status,
        user_id: userData.user.id
      }).select().single();

      if (error) {
        console.error('Error creating notification:', error);
        return { data: null, error: error.message };
      }

      const newNotification: Notification = {
        ...data,
        type: data.type as NotificationType,
        status: data.status as NotificationStatus,
        scheduled_for: new Date(data.scheduled_for),
        sent_at: data.sent_at ? new Date(data.sent_at) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      toast.success('Notificação criada com sucesso!');
      return { data: newNotification, error: null };
    } catch (error: any) {
      console.error('Error in createNotification:', error);
      toast.error('Erro ao criar notificação');
      return { data: null, error: error.message };
    }
  },

  async updateNotificationStatus(id: string, status: NotificationStatus, executionId?: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      }

      if (executionId) {
        updateData.n8n_workflow_execution_id = executionId;
      }

      const { data, error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error in updateNotificationStatus:', error);
      return { data: null, error: error.message };
    }
  },

  async getPendingMaintenanceReminders() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        return { data: [], error: 'Usuário não autenticado' };
      }

      // Buscar agendamentos concluídos há mais de 15 dias
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'completed')
        .lt('date', fifteenDaysAgo.toISOString())
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error fetching appointments for reminders:', error);
        return { data: [], error: error.message };
      }

      // Verificar quais já têm notificação pendente
      const clientIds = appointments.map(apt => apt.client_id);
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('client_id')
        .in('client_id', clientIds)
        .eq('type', 'maintenance_reminder')
        .in('status', ['pending', 'sent']);

      const existingClientIds = existingNotifications?.map(n => n.client_id) || [];
      
      // Filtrar apenas clientes que não têm notificação pendente
      const clientsNeedingReminder = appointments.filter(apt => 
        !existingClientIds.includes(apt.client_id)
      );

      return { data: clientsNeedingReminder, error: null };
    } catch (error: any) {
      console.error('Error in getPendingMaintenanceReminders:', error);
      return { data: [], error: error.message };
    }
  }
};
