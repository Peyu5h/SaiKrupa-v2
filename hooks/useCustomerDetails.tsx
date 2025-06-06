import { useQuery } from '@tanstack/react-query';
import { CustomerDetailsResponse } from '~/lib/utils';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';

export function useCustomerDetails(id: string | null) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['customerDetails', id],
    queryFn: async () => {
      if (!id) return null;

      const response = await api.get<CustomerDetailsResponse>(`api/customer/${id}`);
      if (!response.status) {
        toast({
          title: 'Error',
          description: response.message || 'Failed to fetch customer details',
          variant: 'destructive',
        });
        return null;
      }
      return response.data;
    },
    enabled: Boolean(id && id !== 'undefined'),
    staleTime: 30000,
  });
}
