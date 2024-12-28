import * as React from 'react';
import { FlatList, RefreshControl, View, ActivityIndicator } from 'react-native';
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
import { useQuery, QueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';
import { Input } from '~/components/ui/input';
import { cn, getColor } from '~/lib/utils';
import { Muted } from '~/components/ui/typography';
import { ChevronDown, UserX } from 'lucide-react-native';
import { Customer, Payment } from '~/backend/src/utils/types';
import CustomerCard from '~/components/CustomerCard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

export default function SearchScreen() {
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [customerType, setCustomerType] = React.useState('All');
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = React.useState<number[]>([]);

  const getPaymentStatus = React.useCallback((monthPayment?: any) => {
    if (!monthPayment) return 'UNPAID';
    return monthPayment.status || 'UNPAID';
  }, []);

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

        const years = new Set<number>();
        response.data?.forEach(customer => {
          customer.payments.forEach(payment => {
            years.add(payment.year);
          });
        });
        
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        setAvailableYears(sortedYears);

        // Filter data
        return response.data?.filter(customer => {
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

  const renderCustomerItem = React.useCallback(({ item }: { item: Customer }) => {
    const yearPayments = item.payments.filter(p => p.year === selectedYear);
    const monthPayment = yearPayments
      .flatMap(p => p.months)
      .find(m => m.month === selectedMonth + 1);
    
    const currentPayment = yearPayments.find(p => 
      p.months.some(m => m.month === selectedMonth + 1)
    );

    // Calculate if all months are cleared up to current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const isAllMonthsCleared = (() => {
      const paidMonths = new Set();
      
      item.payments.forEach(payment => {
        if (payment.year > currentYear) return;
        
        payment.months.forEach(month => {
          if (payment.year === currentYear && month.month > currentMonth) return;
          if (month.amount > 0) {
            paidMonths.add(`${payment.year}-${month.month}`);
          }
        });
      });

      const totalMonthsRequired = (currentYear - Math.min(...item.payments.map(p => p.year))) * 12 + currentMonth;
      
      return paidMonths.size >= totalMonthsRequired;
    })();

    return (
      <CustomerCard
        name={item.name}
        address={item.address}
        stb={item.customerId}
        date={monthPayment?.paymentDate ? new Date(monthPayment.paymentDate).toLocaleDateString() : ""}
        amount={monthPayment?.amount || 0}
        status={monthPayment?.status || 'Unpaid'}
        debt={currentPayment?.totalDebt || monthPayment?.debt || 0}
        advance={currentPayment?.totalAdvance || monthPayment?.advance || 0}
        isPending={!isAllMonthsCleared}
        payments={item.payments}
      />
    );
  }, [selectedYear, selectedMonth]);

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

  const CustomerList = () => (
    <FlatList
      data={customers}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={renderCustomerItem}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

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
                style={{height:54}}
                variant="outline"
                className="flex-row items-center justify-between "
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
      <View className="flex-row justify-between w-full gap-2">
        <View className="w-1/2 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between flex-row"
              >
                <Text className="text-foreground">{MONTHS[selectedMonth]}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select Month</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {MONTHS.map((month, index) => (
                  <DropdownMenuItem 
                    key={month} 
                    onPress={() => setSelectedMonth(index)}
                    className={cn(
                      'flex-col items-start gap-1',
                      selectedMonth === index ? 'bg-secondary/70' : ''
                    )}
                  >
                    <Text>{month}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        <View className="w-1/2 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between flex-row"
              >
                <Text className="text-foreground">{selectedYear}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select Year</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {availableYears.map((year) => (
                  <DropdownMenuItem 
                    key={year} 
                    onPress={() => setSelectedYear(year)}
                    className={cn(
                      'flex-col items-start gap-1',
                      selectedYear === year ? 'bg-secondary/70' : ''
                    )}
                  >
                    <Text>{year}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>

      <View className="flex-1 w-full bg-background">
        {isLoading ? (
          <LoadingView />
        ) : customers.length === 0 ? (
          <EmptyView />
        ) : (
          <CustomerList />
        )}
      </View>
    </View>
  );
}
