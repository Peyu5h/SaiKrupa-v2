import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerDetailsResponse, Customer, BillSummary } from '~/backend/src/utils/types';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';

export function useCustomerDetails(id?: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [billSummary, setBillSummary] = useState<BillSummary | null>(null);

  const toast = (() => {
    try {
      return useToast();
    } catch (error) {
      return {
        toast: ({ title, description, variant }: any) => {
          console.warn(`Toast (${variant}):`, title, description);
        },
      };
    }
  })();

  if (!id) {
    return {
      customer: null,
      billSummary: null,
      isLoading: false,
      refetch: () => Promise.resolve(),
    };
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customerDetails', id],
    queryFn: async () => {
      try {
        // Add check for valid id
        if (!id || id === 'undefined') {
          throw new Error('Invalid customer ID');
        }

        const response = await api.get<CustomerDetailsResponse>(`api/customer/${id}`);

        if (!response.status || !response.data) {
          toast.toast({
            title: 'Error',
            description: response.message || 'Failed to fetch customer details',
            variant: 'destructive',
          });
          return null;
        }

        if (response.data.customer && response.data.billSummary) {
          setCustomer(response.data.customer);
          setBillSummary(response.data.billSummary);
        }

        return response.data;
      } catch (error) {
        console.error('Error fetching customer details:', error);
        toast.toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch customer details',
          variant: 'destructive',
        });
        return null;
      }
    },
    // Enable query only if id is valid
    enabled: Boolean(id && id !== 'undefined'),
    retry: 2,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data && !customer) {
      setCustomer(data?.customer || null);
      setBillSummary(data?.billSummary || null);
    }
  }, [data]);

  return {
    customer,
    billSummary,
    isLoading,
    refetch,
  };
}
