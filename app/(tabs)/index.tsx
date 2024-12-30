import * as React from 'react';
import { Alert, Platform, RefreshControl, ScrollView, View, ActivityIndicator, FlatList } from 'react-native';

import { Button } from '~/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';
import { Input } from '~/components/ui/input';
import { cn, useThemeColors } from '~/lib/utils';
import { Muted } from '~/components/ui/typography';
import { ChevronDown, UserX } from 'lucide-react-native';
import CustomerCard from '~/components/CustomerCard';
import { Customer, Payment } from '~/backend/src/utils/types';

interface ApiResponse {
  status: boolean;
  message: string;
  data: Customer[];
}

interface Month {
  id: string;
  paymentId: string;
  month: number;
  amount: number;
  paidVia: string;
  debt: number;
  advance: number;
  paymentDate: string;
  status: 'Paid' | 'Partially Paid' | 'Advance Paid' | 'Unpaid' | 'Off';
  note: string | null;
  createdAt: string;
}

export default function Screen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = React.useState('');
  const [customerType, setCustomerType] = React.useState('All');
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear] = React.useState(new Date().getFullYear()); 

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers', name, customerType, selectedMonth, selectedYear],
    queryFn: async () => {
      try {
        const response = await api.get<Customer[]>('api/customer');
        if (!response.status) {
          toast({
            title: 'Error',
            description: response.message,
            variant: 'destructive',
          });
          return [];
        }

        return response.data?.filter((customer) => {
          if (name && !customer.name.toLowerCase().includes(name.toLowerCase())) {
            return false;
          }

          const yearPayments = customer.payments.filter(p => p.year === selectedYear);
          const monthPayment = yearPayments
            .flatMap(p => p.months)
            .find(m => m.month === selectedMonth + 1);

          const status = monthPayment?.status || 'Unpaid';

          if (customerType !== 'All') {
            switch (customerType) {
              case 'Paid':
                return status === 'Paid' || status === 'Advance Paid';
              case 'Unpaid':
                return status === 'Unpaid';
              case 'Partial':
                return status === 'Partially Paid';
              default:
                return true;
            }
          }

          return true;
        }) || [];
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Network request failed',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  const getMonthName = (month: number): string => {
    return new Date(2024, month).toLocaleString('default', { month: 'long' });
  };

  const { getColor } = useThemeColors();

  const getMonthRange = () => {
    const currentMonth = new Date().getMonth();
    return [-2, -1, 0, 1, 2].map((offset) => {
      let month = currentMonth + offset;
      if (month < 0) month += 12;
      if (month > 11) month -= 12;
      return month;
    });
  };

  const LoadingView = () => (
    <View className="flex-1 justify-center items-center">
      <View className="bg-card p-6 rounded-xl border border-border">
        <ActivityIndicator size="large" color={getColor('primary')} />
        <Text className="text-muted-foreground mt-4">Loading customers...</Text>
      </View>
    </View>
  );

  const EmptyView = () => (
    <View className="flex-1 justify-center items-center">
      <View className="bg-card p-6 rounded-xl border border-border items-center">
        <UserX size={48} className="text-muted-foreground mb-4" />
        <Text className="text-xl font-medium text-foreground">No customers found</Text>
        <Text className="text-muted-foreground mt-2">Try adjusting your search criteria</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 items-center gap-4 p-4 bg-background">
      <View className="items-center w-full flex flex-row gap-2 mt-2">
        <View className="flex-1">
          <Input
            placeholder="Search for customer"
            value={name}
            onChangeText={setName}
            className="w-full border border-border text-foreground text-lg rounded-lg "
          />
        </View>
        <View className="flex-0 w-28">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                style={{height:54}}
                size={Platform.OS === 'web' ? 'sm' : 'default'}
                className="flex-row items-center justify-between"
              >
                <Text>{customerType}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select customer type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('All');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'All' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>All</Text>
                  <Muted>All customers</Muted>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('Paid');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'Paid' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>Paid</Text>
                  <Muted>Customers who paid monthly payment</Muted>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('Unpaid');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'Unpaid' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>Unpaid</Text>
                  <Muted>Customers who did not pay monthly payment</Muted>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('Partial');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'Partial' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>Partial paid</Text>
                  <Muted>Customers who paid partial monthly payment</Muted>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>
      <View className="flex-row justify-between w-full">
        <ScrollView showsHorizontalScrollIndicator={false} horizontal className="space-x-5">
          {getMonthRange().map((month) => (
            <Button
              key={month}
              variant={selectedMonth === month ? 'default' : 'outline'}
              className={cn(
                'mr-3 flex-row items-center gap-4',
                month === new Date().getMonth() && 'border border-primary'
              )}
              onPress={() => setSelectedMonth(month)}
            >
              <View>
                <Text
                  className={
                    selectedMonth === month ? 'text-primary-foreground' : 'text-foreground'
                  }
                >
                  {getMonthName(month)}
                </Text>
              </View>
            </Button>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1 w-full">
        {isLoading ? (
          <LoadingView />
        ) : customers.length === 0 ? (
          <EmptyView />
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const yearPayments = (item.payments || []).filter(p => p.year === selectedYear);
              const monthPayment = yearPayments
                .flatMap(p => p.months || [])
                .find(m => m.month === selectedMonth + 1);
              
              const currentPayment = yearPayments.find(p => 
                (p.months || []).some(m => m.month === selectedMonth + 1)
              );

              return (
                <CustomerCard
                  id={item.id}
                  name={item.name}
                  address={item.address}
                  stb={item.customerId}
                  date={monthPayment?.paymentDate ? new Date(monthPayment.paymentDate).toLocaleDateString() : ""}
                  amount={monthPayment?.amount || 0}
                  status={monthPayment?.status || 'Unpaid'}
                  debt={currentPayment?.totalDebt || monthPayment?.debt || 0}
                  advance={currentPayment?.totalAdvance || monthPayment?.advance || 0}
                  payments={item.payments}
                />
              );
            }}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
}
