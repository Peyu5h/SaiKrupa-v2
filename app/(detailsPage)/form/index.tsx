import React, { useState, useCallback, useMemo } from 'react';
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
import { useAtom } from 'jotai';
import { currentIdAtom } from '~/lib/atom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';
import { useRouter } from 'expo-router';
import { NAV_THEME } from '~/lib/constants';
import { MONTHS } from '~/backend/src/utils/types';

const MONTHLY_AMOUNTS = [310, 400, 600];
const PAYMENT_METHODS = ['Cash', 'UPI'] as const;

const SUGGESTED_AMOUNTS = [300, 310, 350, 400];

const removeUndefined = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
};

export default function Form() {
  const [customerId] = useAtom(currentIdAtom);
  const { data, isLoading } = useCustomerDetails(customerId);
  const [isOff, setIsOff] = useState(false);
  const [isMultiMonth, setIsMultiMonth] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const getNextAvailableMonth = useCallback(() => {
    if (!data?.customer?.payments) return new Date().getMonth();
    
    const currentYear = new Date().getFullYear();
    const paidMonths = data.customer.payments
      .filter(payment => payment.year === currentYear)
      .flatMap(payment => payment.months)
      .map(month => month.month - 1);
    
    const currentMonth = new Date().getMonth();
    for (let month = currentMonth; month < 12; month++) {
      if (!paidMonths.includes(month)) {
        return month;
      }
    }
    
    for (let month = 0; month < currentMonth; month++) {
      if (!paidMonths.includes(month)) {
        return month;
      }
    }
    
    return currentMonth; 
  }, [data]);

  const [startMonth, setStartMonth] = useState(getNextAvailableMonth());
  const [endMonth, setEndMonth] = useState(getNextAvailableMonth());
  const [monthlyAmount, setMonthlyAmount] = useState(310);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>('Cash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const paidMonths = useMemo(() => {
    if (!data?.customer?.payments) return [];
    
    const currentYear = new Date().getFullYear();
    return data.customer.payments
      .filter(payment => payment.year === currentYear)
      .flatMap(payment => payment.months)
      .map(month => month.month - 1);
  }, [data]);

  const isMonthDisabled = useCallback((monthIndex: number) => {
    return paidMonths.includes(monthIndex);
  }, [paidMonths]);

  const resetForm = useCallback(() => {
    setIsOff(false);
    setIsMultiMonth(false);
    setStartMonth(getNextAvailableMonth());
    setEndMonth(getNextAvailableMonth());
    setMonthlyAmount(310);
    setPaymentMethod('Cash');
    setAmount('');
    setNote('');
  }, []);

  const isFormValid = useCallback(() => {
    if (isOff) {
      return true; 
    }
    
    if (!amount || isNaN(parseInt(amount))) {
      return false;
    }
    
    if (isMultiMonth && endMonth < startMonth) {
      return false;
    }
    
    return true;
  }, [isOff, amount, isMultiMonth, startMonth, endMonth]);

  const createBillMutation = useMutation({
    mutationFn: async (formData: any) => {
      // try {
        const response = await api.post('api/bills/create', formData);
        console.log(response);

        if (!response.status) {
          throw new Error(response.message);
        }
        return response;
      // } catch (error: any) {
      //   console.log(error);
      //   const errorMessage = error.response?.data?.message || error.message;
      //   // console.log(errorMessage);
      //   throw new Error(errorMessage);
      // }
    },
    onSuccess: (response) => {
      toast({
        title: 'Success',
        description: response.message || 'Payment entry created successfully',
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
        description: "Payment for this month is already exists or Amount is too less",
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
      customer: {
        connect: {
          id: customerId
        }
      }
    };

    const formattedData = removeUndefined(formData);
    createBillMutation.mutate(formattedData);
  }, [customerId, isOff, amount, monthlyAmount, startMonth, endMonth, isMultiMonth, paymentMethod, note]);

  const customer = data?.customer;
  if (!customer) {
    return null;
  }

  if (isLoading) {
    return <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={NAV_THEME.dark.text} />
    </View>
  }

  return (
    <ScrollView className="flex-1 p-4 bg-background">

      <View className="space-y-4 mb-6">
        <View className="flex-row items-center justify-between my-4 border-b border-border pb-4">
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
                <DropdownMenuLabel>
                  <Text>Select start month</Text>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollView style={{ maxHeight: 400 }}>
                  <DropdownMenuGroup className="gap-1">
                    {MONTHS.map((month, index) => (
                      <DropdownMenuItem
                        key={month}
                        onPress={() => setStartMonth(index)}
                        className={cn(
                          startMonth === index && 'bg-secondary/70',
                          isMonthDisabled(index) && 'opacity-50'
                        )}
                        disabled={isMonthDisabled(index)}
                      >
                        <Text className={cn(isMonthDisabled(index) && 'text-muted-foreground')}>
                          {month}
                          {isMonthDisabled(index) && ' (Paid)'}
                        </Text>
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
                  <DropdownMenuLabel>
                    <Text>Select end month</Text>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollView style={{ maxHeight: 400 }}>
                    <DropdownMenuGroup className="gap-1">
                      {MONTHS.map((month, index) => (
                        <DropdownMenuItem
                          key={month}
                          onPress={() => setEndMonth(index)}
                          className={cn(
                            endMonth === index && 'bg-secondary/70',
                            isMonthDisabled(index) && 'opacity-50'
                          )}
                          disabled={isMonthDisabled(index)}
                        >
                          <Text className={cn(isMonthDisabled(index) && 'text-muted-foreground')}>
                            {month}
                            {isMonthDisabled(index) && ' (Paid)'}
                          </Text>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </ScrollView>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          )}
        </View>
      {startMonth && 
        isMonthDisabled(startMonth) && (
          <Text className="text-red-500">This month is already paid</Text>
        )
      }
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
        className="mb-4 bg-green-600"
        size="lg"
        onPress={handleSubmit}
        disabled={!customerId || !isFormValid() || createBillMutation.isPending || isMonthDisabled(startMonth)}
      >
        <Text className="text-primary-foreground font-medium">
          {createBillMutation.isPending
            ? <ActivityIndicator size="small" color={NAV_THEME.dark.text} />
            : isOff 
              ? 'Mark as Paused' 
              : 'Create entry'}
        </Text>
      </Button>

      <View className="flex-row items-center  justify-between my-8 mb-12 p-4 bg-card/50 rounded-2xl border border-border">
        <View>
          <Text className="font-medium text-lg">Service Paused</Text>
          <Text className="text-muted-foreground text-sm">Turn on if service was paused</Text>
        </View>
        <Switch checked={isOff} onCheckedChange={setIsOff} />
      </View>
    </ScrollView>
  );
}
