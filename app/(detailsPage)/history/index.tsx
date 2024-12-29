import { RefreshControl, ScrollView, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text } from '~/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn, getColor } from '~/lib/utils';
import { HistoryIcon } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { MonthlyBreakdown } from '~/components/MonthlyCard';
import { useLocalSearchParams } from 'expo-router';
import { useCustomerDetails } from '~/hooks/useCustomerDetails';
import { useAtom } from 'jotai';
import { currentIdAtom } from '~/lib/atom';

const DUMMY_PAYMENTS = {
  2024: [
    {
      month: 1,
      amount: 300,
      paidVia: 'Cash',
      status: 'Partially Paid',
      debt: 10,
      advance: 0,
      paymentDate: '2024-01-21T20:32:49.019Z',
      note: 'Partial payment made',
    },
    {
      month: 2,
      amount: 310,
      paidVia: 'UPI',
      status: 'Paid',
      debt: 0,
      advance: 0,
      paymentDate: '2024-02-21T20:33:14.620Z',
    },
    {
      month: 3,
      amount: 320,
      paidVia: 'Cash',
      status: 'Advance Paid',
      debt: 0,
      advance: 50,
      paymentDate: '2024-03-21T20:33:14.620Z',
      note: 'Advance payment for next month',
    },
  ],
  2023: [
    {
      month: 11,
      amount: 300,
      paidVia: 'Cash',
      status: 'Paid',
      debt: 0,
      advance: 0,
      paymentDate: '2023-11-15T20:32:49.019Z',
    },
    {
      month: 12,
      amount: 310,
      paidVia: 'UPI',
      status: 'Paid',
      debt: 0,
      advance: 0,
      paymentDate: '2023-12-20T20:33:14.620Z',
    },
  ],
};

const History = () => {
  const [customerId, setCustomerId] = useAtom(currentIdAtom);

  const { customer } = useCustomerDetails(customerId);

  // Add debug logging
  console.log('History ID:', customer);

  const [selectedYear, setSelectedYear] = useState(0);
  const YEARS = [2024, 2023, 2022, 2021, 2020];
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [selectedYear]);

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2 text-2xl font-semibold">
          <HistoryIcon size={18} color={getColor('muted-foreground')} />
          <Text className="text-foreground/70 text-xl font-medium">Monthly history:</Text>
        </View>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-32 justify-between flex-row">
              <Text>{YEARS[selectedYear]}</Text>
              <ChevronDown className="text-muted-foreground" size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 border border-foreground/10">
            <DropdownMenuLabel>Select year</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {YEARS.map((year, index) => (
                <DropdownMenuItem
                  key={year}
                  onPress={() => setSelectedYear(index)}
                  className={cn(selectedYear === index && 'bg-secondary/70')}
                >
                  <Text>{year}</Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      >
        <MonthlyBreakdown
          payments={DUMMY_PAYMENTS[YEARS[selectedYear] as keyof typeof DUMMY_PAYMENTS] || []}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
};

export default History;
