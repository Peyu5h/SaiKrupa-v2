import React, { useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';
import { useRouter } from 'expo-router';
import { NAV_THEME } from '~/lib/constants';

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
  const [customerId] = useAtom(currentIdAtom);
  const { data } = useCustomerDetails(customerId);
  const [isOff, setIsOff] = useState(false);
  const [isMultiMonth, setIsMultiMonth] = useState(false);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [monthlyAmount, setMonthlyAmount] = useState(310);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>('Cash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const resetForm = useCallback(() => {
    setIsOff(false);
    setIsMultiMonth(false);
    setStartMonth(new Date().getMonth());
    setEndMonth(new Date().getMonth());
    setMonthlyAmount(310);
    setPaymentMethod('Cash');
    setAmount('');
    setNote('');
  }, []);

  const createBillMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await api.post('api/bills/create', formData);
      if (!response.status) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Payment entry created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['customerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['customerDetails', customerId] });
      resetForm();
      router.back();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Payment already exists',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = useCallback(() => {
    if (!customerId) {
      toast({
        title: 'Error',
        description: 'Customer ID is required',
        variant: 'destructive',
      });
      return;
    }

    if (!isOff && (!amount || isNaN(parseInt(amount)))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    const formData = {
      customerId,
      monthlyAmount,
      startMonth: startMonth + 1,
      endMonth: isMultiMonth ? endMonth + 1 : undefined,
      amount: isOff ? 0 : parseInt(amount),
      paidVia: paymentMethod,
      wasOff: isOff,
      note: note || undefined,
    };

    const formattedData = removeUndefined(formData);
    createBillMutation.mutate(formattedData);
    console.log(formattedData);
  }, [customerId, isOff, amount, monthlyAmount, startMonth, endMonth, isMultiMonth, paymentMethod, note]);

  const customer = data?.customer;
  if (!customer) {
    return null;
  }

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
        disabled={!customerId}
      >
        <Text className="text-primary-foreground font-medium">
           {createBillMutation.isPending
            ? <ActivityIndicator size="small" color={NAV_THEME.dark.text} />
            : isOff 
              ? 'Mark as Paused' 
              : 'Create entry'}
            
        </Text>
      </Button>
    </ScrollView>
  );
}
