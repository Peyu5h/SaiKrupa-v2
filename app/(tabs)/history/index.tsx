import {
  RefreshControl,
  ScrollView,
  View,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Text } from '~/components/ui/text';
import AllTransactionsCard from '~/components/AllTransactionsCard';
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
import { ApiResponse, MONTHS, Transaction } from '~/lib/utils';

const HistoryScreen = () => {
  const PAYMENT_MODES = ['All', 'UPI', 'Cash'];

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedViewType, setSelectedViewType] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [availableYears] = useState<number[]>([currentYear - 1, currentYear, currentYear + 1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: [
      'transactions',
      searchQuery,
      paymentMode,
      selectedYear,
      selectedMonth,
      selectedViewType,
    ] as const,
    queryFn: async ({ queryKey }): Promise<ApiResponse> => {
      const response = await api.get<ApiResponse>('api/bills/transactions');
      if (!response.status) {
        throw new Error(response.message);
      }
      return response as any;
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

  const renderTransaction = useCallback(
    (transaction: Transaction) => (
      <AllTransactionsCard
        key={transaction.id}
        name={transaction.customer.name}
        date={new Date(transaction.months[0].paymentDate).toLocaleDateString()}
        amount={transaction.months[0].amount}
        paymentMethod={transaction.months[0].paidVia}
        onDelete={() => deleteMutation.mutate(transaction.id)}
      />
    ),
    [deleteMutation]
  );

  const filteredTransactions = useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((transaction: Transaction) => {
      const matchesSearch = transaction.customer.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPaymentMode =
        paymentMode === 'All' || transaction.months.some((m) => m.paidVia === paymentMode);
      const matchesYear = transaction.year === selectedYear;
      const matchesMonth =
        selectedViewType === 'Yearly' || transaction.months.some((m) => m.month === selectedMonth);

      return matchesSearch && matchesPaymentMode && matchesYear && matchesMonth;
    });
  }, [response?.data, searchQuery, paymentMode, selectedYear, selectedMonth, selectedViewType]);

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-24">
      <Text className="text-muted-foreground text-lg">No transactions found</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-4 w-full">
      <View className="items-center w-full flex flex-row gap-2 mt-2 mb-4">
        <View className="flex-1">
          <Input
            placeholder="Search for customer"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="w-full border border-border text-foreground text-lg rounded-lg"
          />
        </View>
        <View className="flex-0 w-28">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                style={{ height: 54 }}
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
              <DropdownMenuLabel>Payment Mode</DropdownMenuLabel>
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
                    <Muted>Filter by {mode.toLowerCase()} payments</Muted>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between flex-row">
                <Text className="text-foreground">{selectedViewType}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>View Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {['Monthly', 'Yearly'].map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onPress={() => setSelectedViewType(type as 'Monthly' | 'Yearly')}
                    className={cn(
                      'flex-col items-start gap-1',
                      selectedViewType === type && 'bg-secondary/70'
                    )}
                  >
                    <Text>{type}</Text>
                    <Muted>View {type.toLowerCase()} transactions</Muted>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        {selectedViewType === 'Monthly' && (
          <View className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between flex-row">
                  <Text className="text-foreground">{MONTHS[selectedMonth - 1]}</Text>
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
                      onPress={() => setSelectedMonth(index + 1)}
                      className={cn(
                        'flex-col items-start gap-1',
                        selectedMonth === index + 1 && 'bg-secondary/70'
                      )}
                    >
                      <Text>{month}</Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        )}

        <View className="flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between flex-row">
                <Text className="text-foreground">{selectedYear}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Year</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {availableYears.map((year) => (
                  <DropdownMenuItem
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    className={cn(
                      'flex-col items-start gap-1',
                      selectedYear === year && 'bg-secondary/70'
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />}
      >
        {filteredTransactions.length > 0
          ? filteredTransactions.map(renderTransaction)
          : renderEmptyState()}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
