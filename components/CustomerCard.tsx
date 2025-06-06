import { Pressable, View } from 'react-native';
import React, { useState, useCallback } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from './ui/text';
import * as Clipboard from 'expo-clipboard';
import { cn } from '~/lib/utils';
import { Minus, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { CustomerCardProps, Payment } from '~/lib/utils';
import { useThemeColors } from '~/lib/utils';

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const CustomerCard = ({
  id,
  name,
  address,
  stb,
  date,
  amount,
  status,
  debt,
  advance,
  isPending,
  payments,
}: CustomerCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const { getColor } = useThemeColors();
  const { isDarkColorScheme } = useColorScheme();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(stb);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/(detailsPage)',
      params: { id },
    });
  }, [stb]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'Paid':
        return (
          <Text className="bg-green-600 text-primary-foreground p-1 rounded-lg px-4 font-medium text-sm">
            PAID
          </Text>
        );
      case 'Partially Paid':
        return (
          <View className="flex flex-col gap-2 items-end">
            <Text className="bg-yellow-600 text-primary-foreground p-1 rounded-lg px-4 font-medium text-sm">
              PARTIAL
            </Text>
            <View className="text-primary-foreground flex-row items-center gap-1">
              <Minus size={12} color={getColor('destructive')} />
              <Text className="text-destructive text-sm">₹ {debt}</Text>
            </View>
          </View>
        );
      case 'Advance Paid':
        return (
          <View className="items-end">
            <Text className="bg-green-600 text-primary-foreground p-1 rounded-lg px-4 font-medium text-sm">
              PAID
            </Text>
            <View className="text-muted-foreground mt-1.5 flex-row items-center gap-1">
              <Plus size={12} color="#38a169" />
              <Text className="text-green-600 text-sm">₹ {advance}</Text>
            </View>
          </View>
        );
      case 'Unpaid':
        return (
          <View className="items-end">
            <Text className="bg-red-600 text-primary-foreground p-1 rounded-lg px-4 font-medium text-sm mb-1.5">
              UNPAID
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getPendingMonthsCount = useCallback(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const paidMonths = new Set();

    payments.forEach((payment) => {
      payment.months.forEach((month) => {
        if (month.amount > 0) {
          paidMonths.add(`${payment.year}-${month.month}`);
        }
      });
    });

    // Get the earliest payment year
    const startYear = Math.min(...payments.map((p) => p.year));

    // Calculate total months that should be paid
    const totalMonthsRequired = (currentYear - startYear) * 12 + currentMonth;

    return Math.max(0, totalMonthsRequired - paidMonths.size);
  }, [payments]);

  return (
    <View
      className={cn(
        ' p-4 rounded-xl mb-6 border-[1px] border-foreground/10',
        isDarkColorScheme ? 'bg-card/50' : 'bg-card/80'
      )}
    >
      <View className="w-full flex-row justify-between">
        <View className="space-y-2">
          <Text className="font-medium text-secondary-foreground/80 text-xl">{name}</Text>
          <Text className="text-muted-foreground">{truncateText(address, 24)}</Text>
          <View className="flex-row items-center gap-2 mt-4">
            <Text className="text-muted-foreground text-lg">STB: {stb}</Text>
            <Pressable
              onPress={handleCopy}
              android_ripple={{
                color: getColor('muted-foreground'),
                borderless: true,
                radius: 20,
              }}
              className="p-2"
            >
              {({ pressed }) => (
                <View className="rounded-full  p-[5px]" style={{ opacity: pressed ? 0.7 : 1 }}>
                  {isCopied ? (
                    <Ionicons
                      name="checkmark-outline"
                      size={16}
                      color={getColor('muted-foreground')}
                    />
                  ) : (
                    <Ionicons name="copy-outline" size={16} color={getColor('muted-foreground')} />
                  )}
                </View>
              )}
            </Pressable>
          </View>
          {(status === 'Paid' || status === 'Advance Paid' || status === 'Partially Paid') && (
            <View className="flex-row gap-2 mt-3">
              <Text className="text-muted-foreground text-lg">{date}</Text>
              <Text className="text-muted-foreground text-lg">-</Text>
              <Text className="text-muted-foreground text-lg">₹ {amount}</Text>
            </View>
          )}

          {status === 'Unpaid' && (
            <View className="flex-row gap-2 mt-3">
              {(() => {
                const pendingMonths = getPendingMonthsCount();
                if (pendingMonths === 0) {
                  return (
                    <Text className="text-muted-foreground text-lg">
                      All months <Text className="text-green-600">cleared</Text>
                    </Text>
                  );
                } else {
                  return (
                    <Text className="text-muted-foreground text-lg">
                      {pendingMonths} {pendingMonths === 1 ? 'month' : 'months'}{' '}
                      <Text className="text-red-600">pending</Text>
                    </Text>
                  );
                }
              })()}
            </View>
          )}
        </View>
        <View className="justify-between items-end">
          {getStatusDisplay()}
          <Pressable
            onPress={handlePress}
            android_ripple={{
              // color: getColor('muted-foreground'),
              // radius: 75,
              borderless: false,
            }}
            className="z-24 border bg-card border-foreground/20 p-[20px] px-8 rounded-xl"
          >
            <Text className="text-foreground/50">Show details</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default CustomerCard;
