import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { Input } from '~/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { useCustomerDetails } from '~/hooks/useCustomerDetails';
import { useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import { currentIdAtom } from '~/lib/atom';

const MONTHLY_AMOUNTS = [310, 390, 450];
const PAYMENT_METHODS = ['Cash', 'UPI'] as const;
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

const SUGGESTED_AMOUNTS = [300, 350, 400, 500];

const removeUndefined = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
};

export default function Form() {
  const [customerId, setCustomerId] = useAtom(currentIdAtom);
  const { customer, isLoading } = useCustomerDetails(customerId);

  console.log('ID:', customerId);

  if (isLoading) {
    return (
      <View className="flex-1 p-4 bg-background">
        <Text>Loading customer details...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 p-4 bg-background">
        <Text>Customer not found</Text>
      </View>
    );
  }

  const [isOff, setIsOff] = useState(false);
  const [isMultiMonth, setIsMultiMonth] = useState(false);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [endMonth, setEndMonth] = useState(startMonth);
  const [monthlyAmount, setMonthlyAmount] = useState(310);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>('Cash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    const formData = {
      customerId: customerId, // Use the actual customer ID from params
      monthlyAmount,
      startMonth: startMonth + 1,
      endMonth: isMultiMonth ? endMonth + 1 : undefined,
      amount: isOff ? 0 : parseInt(amount),
      paidVia: paymentMethod,
      wasOff: isOff,
      note: note || undefined,
    };

    const formattedData = removeUndefined(formData);
    console.log('Submitting:', formattedData);
  };

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <View className="flex-row items-center  justify-between mb-6 p-4 bg-card/50 rounded-2xl border border-border">
        <View>
          <Text className="font-medium text-lg">Service Paused</Text>
          <Text className="text-muted-foreground text-sm">Turn on if service was paused</Text>
        </View>
        <Switch checked={isOff} onCheckedChange={setIsOff} />
      </View>

      <View className="space-y-4 mb-6">
        <View className="flex-row items-center justify-between mb-4 border-b border-border pb-4">
          <Text className="text-base font-medium">Multiple Months</Text>
          <Switch checked={isMultiMonth} onCheckedChange={setIsMultiMonth} disabled={isOff} />
        </View>

        <View className={cn('flex-row gap-4', isMultiMonth ? 'justify-between' : 'justify-center')}>
          <View className={cn('flex-1', isMultiMonth ? 'w-1/2' : 'w-full')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between flex-row">
                  <Text className="text-foreground">{MONTHS[startMonth]}</Text>
                  <ChevronDown size={18} className="text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                insets={{ left: 12, right: 12 }}
                className="w-64 native:w-72 bg-background"
              >
                <DropdownMenuLabel>Select start month</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollView style={{ maxHeight: 400 }}>
                  <DropdownMenuGroup className="gap-1">
                    {MONTHS.map((month, index) => (
                      <DropdownMenuItem
                        key={month}
                        onPress={() => setStartMonth(index)}
                        className={cn(startMonth === index && 'bg-secondary/70')}
                      >
                        <Text>{month}</Text>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </ScrollView>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          {isMultiMonth && (
            <View className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between flex-row"
                    disabled={isOff}
                  >
                    <Text>{MONTHS[endMonth]}</Text>
                    <ChevronDown className="text-muted-foreground" size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  insets={{ left: 12, right: 12 }}
                  className="w-64 native:w-72 bg-background"
                >
                  <DropdownMenuLabel>Select end month</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollView style={{ maxHeight: 400 }}>
                    <DropdownMenuGroup className="gap-1">
                      {MONTHS.map((month, index) => (
                        <DropdownMenuItem
                          key={month}
                          onPress={() => setEndMonth(index)}
                          className={cn(endMonth === index && 'bg-secondary/70')}
                        >
                          <Text>{month}</Text>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </ScrollView>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          )}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Monthly Amount</Text>
        <View className="flex-row gap-2">
          {MONTHLY_AMOUNTS.map((value) => (
            <Button
              key={value}
              variant={monthlyAmount === value ? 'default' : 'outline'}
              className="flex-1"
              onPress={() => setMonthlyAmount(value)}
              disabled={isOff}
            >
              <Text className={monthlyAmount === value ? 'text-primary-foreground' : ''}>
                ₹{value}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Amount</Text>
        <Input
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          className="mb-2"
        />
        <View className="flex-row flex-wrap gap-2">
          {SUGGESTED_AMOUNTS.map((suggestedAmount) => (
            <Button
              key={suggestedAmount}
              variant="outline"
              size="sm"
              onPress={() => setAmount(suggestedAmount.toString())}
              disabled={isOff}
              className="flex-1 min-w-[80px]"
            >
              <Text>₹{suggestedAmount}</Text>
            </Button>
          ))}
        </View>

        <View className="mt-6">
          <Text className="text-base font-medium mb-2">Payment Method</Text>
          <View className="flex-row gap-2">
            {PAYMENT_METHODS.map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'default' : 'outline'}
                className="flex-1"
                onPress={() => setPaymentMethod(method)}
                disabled={isOff}
              >
                <Text className={paymentMethod === method ? 'text-primary-foreground' : ''}>
                  {method}
                </Text>
              </Button>
            ))}
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Note (Optional)</Text>
        <Input
          placeholder="Add a note"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          className="min-h-[20] mb-2"
        />
      </View>

      <Button
        className="mb-12"
        size="lg"
        onPress={handleSubmit}
        disabled={!customerId || isLoading}
      >
        <Text className="text-primary-foreground font-medium">
          {isOff ? 'Mark as Paused' : 'Create entry'}
        </Text>
      </Button>
    </ScrollView>
  );
}
