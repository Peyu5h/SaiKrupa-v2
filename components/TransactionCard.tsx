import { Platform, View } from 'react-native';
import React from 'react';
import { getColor } from '~/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Info, Loader2 } from 'lucide-react-native';

const TransactionCard = ({ isLoading }: { isLoading?: boolean }) => {
  // if (isLoading) {
  //   return (
  //     <View className="my-2 flex-1 flex-row items-center justify-between">
  //       <Loader2 size={20} color={getColor('muted-foreground')} className="animate-spin" />
  //     </View>
  //   );
  // }

  const months = ['January', 'February', 'March'];
  return (
    <View>
      <View className="my-2">
        <View className="bg-card p-4 rounded-2xl border border-border flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <View>
              <View className="flex-row items-center">
                <Text className="font-medium mr-4 text-foreground/70">23/12/2024 · GPAY</Text>
                <Tooltip delayDuration={150}>
                  <TooltipTrigger className="web:focus:outline-none">
                    <Info size={16} color={getColor('muted-foreground')} />
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    insets={{ left: 12, right: 12 }}
                    className="gap-1 py-3 px-5 border border-foreground/10"
                  >
                    <Text className="text-foreground/70">
                      Things to tryThings to tryThings to tryThings to tryThings to tryThings to try
                    </Text>
                  </TooltipContent>
                </Tooltip>
              </View>

              <View className="flex-row flex-wrap gap-1 mt-2 w-full">
                {months.map((month) => (
                  <View key={month}>
                    <View className="bg-primary/20 p-1 px-2 rounded-full">
                      <Text className="text-foreground/50 text-xs">{month}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Text className="font-semibold text-foreground/70">₹910</Text>
        </View>
      </View>
    </View>
  );
};

export default TransactionCard;
