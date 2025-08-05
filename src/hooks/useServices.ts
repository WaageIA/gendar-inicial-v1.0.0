import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { Service, AvailableSlot } from '@/types';

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await serviceService.getServices();
      if (error) throw error;
      return data || [];
    },
  });
};

export const useServicesByBusiness = (businessSlug: string | undefined) => {
  return useQuery({
    queryKey: ['services', 'business', businessSlug],
    queryFn: async () => {
      if (!businessSlug) throw new Error('Business slug is required');
      const { data, error } = await serviceService.getServicesByBusiness(businessSlug);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAvailableSlots = (
  businessSlug: string | undefined,
  serviceId: string | undefined,
  date: Date | undefined,
  professionalId?: string
) => {
  return useQuery({
    queryKey: ['availableSlots', businessSlug, serviceId, date?.toDateString(), professionalId],
    queryFn: async () => {
      if (!businessSlug || !serviceId || !date) {
        throw new Error('Missing required parameters');
      }
      
      // Try Edge Function first, fallback to service method
      try {
        const { data, error } = await serviceService.getAvailableSlots(
          businessSlug,
          serviceId,
          date,
          professionalId
        );
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('Edge function failed, using fallback:', error);
        // Fallback to local generation
        const { data, error: fallbackError } = await serviceService.getAvailableSlots(
          businessSlug,
          serviceId,
          date,
          professionalId
        );
        if (fallbackError) throw fallbackError;
        return data || [];
      }
    },
    enabled: !!(businessSlug && serviceId && date),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};