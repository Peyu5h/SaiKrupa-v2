import { RefreshControl, ScrollView, View, Platform, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text } from '~/components/ui/text';
import AllTransactionsCard from '~/components/AllTransactionsCard';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ChevronDown } from 'lucide-react-native';
import { getColor } from '~/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';

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
  const COLORS = {
    mutedForeground: getColor('muted-foreground'),
    foreground: getColor('foreground'),
    primary: getColor('primary'),
    background: getColor('background'),
  };
  const INITIAL_DATE = new Date(2024, 0, 1);

  const [fromDate, setFromDate] = useState(INITIAL_DATE);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0]);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);

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

  const transactions = [
    {
      id: '1',
      name: 'Piyush Bagul',
      date: '23/12/2024',
      amount: 910,
      paymentMethod: 'GPAY',
    },
    {
      id: '2',
      name: 'Piyush Bagul',
      date: '23/12/2024',
      amount: 910,
      paymentMethod: 'GPAY',
    },
    {
      id: '3',
      name: 'Piyush Bagul',
      date: '23/12/2024',
      amount: 910,
      paymentMethod: 'GPAY',
    },
    {
      id: '4',
      name: 'Piyush Bagul',
      date: '23/12/2024',
      amount: 910,
      paymentMethod: 'GPAY',
    },
    {
      id: '5',
      name: 'Piyush Bagul',
      date: '23/12/2024',
      amount: 910,
      paymentMethod: 'GPAY',
    },
  ];

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
        <View className="flex-0  w-28">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between flex-row">
                <Text className="text-foreground">{paymentMode}</Text>
                <ChevronDown size={18} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Payment Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {PAYMENT_MODES.map((mode) => (
                  <DropdownMenuItem key={mode} onPress={() => setPaymentMode(mode)}>
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
                <Button variant="outline" className="w-full justify-between flex-row">
                  <Text className="text-foreground">{selectedMonth}</Text>
                  <ChevronDown size={18} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Select Month</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {MONTHS.map((month) => (
                    <DropdownMenuItem key={month} onPress={() => setSelectedMonth(month)}>
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
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      >
        {/* Transactions List */}
        {transactions.map((transaction) => (
          <AllTransactionsCard
            key={transaction.id}
            name={transaction.name}
            date={transaction.date}
            amount={transaction.amount}
            paymentMethod={transaction.paymentMethod}
            onDelete={() => console.log('Delete transaction:', transaction.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default HistoryScreen;
