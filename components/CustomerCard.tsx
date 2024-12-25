import { Pressable, View } from 'react-native';
import React, { useState } from 'react';
import { getColor } from '~/lib/utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from './ui/text';
import * as Clipboard from 'expo-clipboard';
import { cn } from '~/lib/utils';
import { IndianRupee, Minus, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

interface CustomerCardProps {
  name: string;
  address: string;
  stb: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PARTIAL_PAID' | 'ADVANCE_PAID' | 'UNPAID';
  debt?: number;
  advance?: number;
  isPending?: boolean;
}

const CustomerCard = ({
  name,
  address,
  stb,
  date,
  amount,
  status,
  debt,
  advance,
  isPending,
}: CustomerCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(stb);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleShowDetails = () => {
    router.push({
      pathname: '/detailsPage/entry' as const,
      params: {
        name,
        address,
        stb,
        date,
        amount,
        status,
        debt,
        advance,
      },
    });
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'PAID':
        return <Text className="bg-green-600 p-1 rounded-lg px-4 font-medium text-sm">PAID</Text>;
      case 'PARTIAL_PAID':
        return (
          <View className="flex flex-col gap-2 items-end">
            <Text className="bg-yellow-600 p-1 rounded-lg px-4 font-medium text-sm">PARTIAL</Text>
            <View className="text-muted-foreground flex-row items-center gap-1">
              <Minus size={12} color={getColor('destructive')} />
              <Text className="text-destructive text-sm">₹ {debt}</Text>
            </View>
          </View>
        );
      case 'ADVANCE_PAID':
        return (
          <View className="items-end">
            <Text className="bg-green-600 p-1 rounded-lg px-4 font-medium text-sm">PAID</Text>
            <View className="text-muted-foreground mt-1.5 flex-row items-center gap-1">
              <Plus size={12} color="#38a169" />
              <Text className="text-green-600 text-sm">₹ {advance}</Text>
            </View>
          </View>
        );

      case 'UNPAID':
        return (
          <View className="items-end">
            <Text className="bg-red-600 p-1 rounded-lg px-4 font-medium text-sm mb-1.5">
              UNPAID
            </Text>
          </View>
        );
    }
  };

  return (
    <View className="bg-secondary/50 p-4 rounded-xl mb-4">
      <View className="w-full flex-row justify-between">
        <View className="space-y-2">
          <Text className="font-medium text-secondary-foreground/80 text-xl">{name}</Text>
          <Text className="text-muted-foreground">{address}</Text>
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
          {(status === 'PAID' || status === 'ADVANCE_PAID' || status === 'PARTIAL_PAID') && (
            <View className="flex-row gap-2 mt-3">
              <Text className="text-muted-foreground text-lg">{date}</Text>
              <Text className="text-muted-foreground text-lg">-</Text>
              <Text className="text-muted-foreground text-lg">₹ {amount}</Text>
            </View>
          )}

          {status === 'UNPAID' && (
            <View className="flex-row gap-2 mt-3">
              {!isPending ? (
                <Text className="text-muted-foreground text-lg">
                  All months <Text className="text-green-600">cleared</Text>
                </Text>
              ) : (
                <Text className="text-muted-foreground text-lg">
                  2 months <Text className="text-red-600">pending</Text>
                </Text>
              )}
            </View>
          )}
        </View>
        <View className="justify-between items-end">
          {getStatusDisplay()}
          <Pressable
            onPress={handleShowDetails}
            android_ripple={{
              color: getColor('border'),
              borderless: false,
            }}
            className="border border-foreground/10 p-[20px] px-8 rounded-xl"
          >
            <Text className="text-muted-foreground">Show details</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default CustomerCard;
