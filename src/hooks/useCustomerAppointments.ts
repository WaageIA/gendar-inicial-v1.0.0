import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { toast } from 'sonner';

export const useCustomerAppointments = () => {
  const { customer } = useCustomerAuth();
  
  return useQuery({
    queryKey: ['customerAppointments', customer?.id],
    queryFn: async () => {
      if (!customer?.id) throw new Error('Customer not found');
      const { data, error } = await customerService.getCustomerAppointments(customer.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!customer?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { customer } = useCustomerAuth();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!customer?.id) throw new Error('Customer not found');
      const { error } = await customerService.cancelCustomerAppointment(appointmentId, customer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ['customerAppointments'] });
      toast.success('Agendamento cancelado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao cancelar agendamento');
    },
  });
};

export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();
  const { customer, updateProfile } = useCustomerAuth();

  return useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await updateProfile(updates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate customer data
      queryClient.invalidateQueries({ queryKey: ['customerAppointments'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });
};