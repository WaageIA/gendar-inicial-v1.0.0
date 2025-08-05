import { useQuery } from '@tanstack/react-query';
import { professionalService } from '@/services/professionalService';

export const useProfessionals = () => {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await professionalService.getProfessionals();
      if (error) throw error;
      return data || [];
    },
  });
};

export const useProfessionalsByBusiness = (businessSlug: string | undefined) => {
  return useQuery({
    queryKey: ['professionals', 'business', businessSlug],
    queryFn: async () => {
      if (!businessSlug) throw new Error('Business slug is required');
      const { data, error } = await professionalService.getProfessionalsByBusiness(businessSlug);
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};