import { RefreshControl, ScrollView, View, Platform, Pressable, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Text } from '~/components/ui/text';
import AllTransactionsCard from '~/components/AllTransactionsCard';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ChevronDown } from 'lucide-react-native';
import { cn, useThemeColors } from '~/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import { Muted } from '~/components/ui/typography';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';

// Add interfaces for type safety
interface TransactionMonth {
  id: string;
  paymentId: string;
  month: number;
  amount: number;
  paidVia: string;
  debt: number;
  advance: number;
  paymentDate: string;
  status: string;
  note: string | null;
}

interface Transaction {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    address: string;
    phone: string;
    stdId: string;
    customerId: string;
    registerAt: string;
  };
  months: TransactionMonth[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: Transaction[];
}

const HistoryScreen = () => {
  const PAYMENT_MODES = ['All', 'UPI', 'Cash'];
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  
  const INITIAL_DATE = new Date(2024, 0, 1);

    const { getColor } = useThemeColors();
    const COLORS = {
      mutedForeground: getColor('muted-foreground'),
      foreground: getColor('foreground'),
      primary: getColor('primary'),
      background: getColor('background'),
    };


  const [fromDate, setFromDate] = useState(INITIAL_DATE);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: transactionsData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['transactions', searchQuery, paymentMode, fromDate, selectedMonth] as const,
    queryFn: async () => {
      const response = await api.get<ApiResponse>('api/bills/transactions');
      if (!response.status) {
        throw new Error(response.message);
      }
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await api.delete(`api/bills/transactions/${transactionId}`);
      if (!response.status) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const monthIndex = fromDate.getMonth();
    setSelectedMonth(MONTHS[monthIndex]);
  }, [fromDate]);

  const onFromDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowFromDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const clearFilters = () => {
    setFromDate(INITIAL_DATE);
    setSelectedMonth(MONTHS[0]);
    setPaymentMode(PAYMENT_MODES[0]);
    setSearchQuery('');
  };

  // Memoize the transaction card render function
  const renderTransaction = useCallback((transaction: Transaction) => (
    <AllTransactionsCard
      key={transaction.id}
      name={transaction.customer.name}
      date={new Date(transaction.months[0].paymentDate).toLocaleDateString()}
      amount={transaction.months[0].amount}
      paymentMethod={transaction.months[0].paidVia}
      onDelete={() => deleteMutation.mutate(transaction.id)}
    />
  ), [deleteMutation]);

  // Memoize the transaction list
  const transactionList = useMemo(() => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if ((transactionsData as Transaction[]).length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-muted-foreground">No transactions found</Text>
        </View>
      );
    }

    return (transactionsData as Transaction[]).map(renderTransaction);
  }, [isLoading, transactionsData, renderTransaction]);

  return (
    <View className="flex-1 bg-background p-4 w-full">
      <View className="items-center w-full flex flex-row gap-2 mt-2 mb-4">
        <View className="flex-1">
          <Input
            placeholder="Search for customer"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="w-full border border-border text-foreground text-lg rounded-lg "
          />
        </View>
        <View className="flex-0 w-28">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                style={{height:54}}
                variant="outline" 
                className="w-full justify-between flex-row"
              >
                <Text className="text-foreground">{paymentMode}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select payment mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {PAYMENT_MODES.map((mode) => (
                  <DropdownMenuItem 
                    key={mode} 
                    onPress={() => setPaymentMode(mode)}
                    className={cn(
                      'flex-col items-start gap-1',
                      paymentMode === mode ? 'bg-secondary/70' : ''
                    )}
                  >
                    <Text>{mode}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Button
            variant="outline"
            onPress={() => setShowFromDatePicker(true)}
            className="w-full justify-between flex-row"
          >
            <Text className="text-foreground">From: {fromDate.toLocaleDateString()}</Text>
            <ChevronDown size={18} className="text-muted-foreground" />
          </Button>
        </View>

        <View className="flex-1 flex-row gap-2">
          <View className="flex-1 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between flex-row"
                >
                  <Text className="text-foreground">{selectedMonth}</Text>
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
                  {MONTHS.map((month) => (
                    <DropdownMenuItem 
                      key={month} 
                      onPress={() => setSelectedMonth(month)}
                      className={cn(
                        'flex-col items-start gap-1',
                        selectedMonth === month ? 'bg-secondary/70' : ''
                      )}
                    >
                      <Text>{month}</Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        </View>
      </View>

      {showFromDatePicker && (
        <DateTimePicker
          testID="fromDatePicker"
          value={fromDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onFromDateChange}
          textColor={COLORS.foreground}
          accentColor={COLORS.primary}
          themeVariant="dark"
          style={{
            backgroundColor: COLORS.background,
            width: Platform.OS === 'ios' ? '100%' : undefined,
          }}
        />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
      >
        {transactionList}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
