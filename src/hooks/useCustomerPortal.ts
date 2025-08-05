import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerPortalService } from '@/services/customerPortalService';
import { CreateCustomerPortalSettings } from '@/types';

export const useCustomerPortalSettings = () => {
  return useQuery({
    queryKey: ['customerPortalSettings'],
    queryFn: async () => {
      const { data, error } = await customerPortalService.getPortalSettings();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateCustomerPortalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: CreateCustomerPortalSettings) => {
      const { data, error } = await customerPortalService.createOrUpdatePortalSettings(settings);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch portal settings
      queryClient.invalidateQueries({ queryKey: ['customerPortalSettings'] });
      queryClient.invalidateQueries({ queryKey: ['customerPortalStats'] });
    },
  });
};

export const useCheckBusinessSlug = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      const { available, error } = await customerPortalService.checkBusinessSlugAvailability(slug);
      if (error) throw error;
      return available;
    },
  });
};

export const useCustomerPortalStats = () => {
  return useQuery({
    queryKey: ['customerPortalStats'],
    queryFn: async () => {
      const { data, error } = await customerPortalService.getPortalStats();
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};