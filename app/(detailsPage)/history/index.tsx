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
import { cn } from '~/lib/utils';
import { HistoryIcon } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { MonthlyBreakdown } from '~/components/MonthlyCard';
import { useCustomerDetails } from '~/hooks/useCustomerDetails';
import { useAtom } from 'jotai';
import { currentIdAtom } from '~/lib/atom';
import { useThemeColors } from '~/lib/utils';

export default function History() {
  const [customerId] = useAtom(currentIdAtom);
  const { data, isLoading } = useCustomerDetails(customerId);
  const billSummary = data?.billSummary;
  const { getColor } = useThemeColors();

  const YEARS = billSummary?.paymentHistory.map(ph => ph.year).sort((a, b) => b - a) || [];
  const [selectedYear, setSelectedYear] = useState(0);

  const transformedPayments = billSummary?.paymentHistory.reduce((acc, yearData) => {
    acc[yearData.year] = yearData.monthlyBreakdown.map(payment => ({
      month: payment.month,
      amount: payment.amount,
      paidVia: payment.paidVia,
      status: payment.status,
      debt: payment.debt,
      advance: payment.advance,
      paymentDate: payment.paymentDate,
      note: payment.note
    }));
    return acc;
  }, {} as Record<number, any[]>) || {};

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
          payments={transformedPayments[YEARS[selectedYear]] || []}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
}
