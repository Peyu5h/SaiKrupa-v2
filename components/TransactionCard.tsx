import { Platform, View } from 'react-native';
import React from 'react';
import { getColor } from '~/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Info, Loader2 } from 'lucide-react-native';

type MonthData = {
  month: number;
  amount: number;
  paidVia: string;
  paymentDate: Date | string;
  status: string;
  note?: string | null;
};

const TransactionCard = ({
  months,
  note,
  totalAmount,
}: {
  months: MonthData[];
  note?: string | null;
  totalAmount: number;
}) => {
  const monthNames = [
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

  const getMonthRange = () => {
    if (months.length === 1) {
      return monthNames[months[0].month - 1];
    }
    const startMonth = monthNames[months[0].month - 1];
    const endMonth = monthNames[months[months.length - 1].month - 1];
    return `${startMonth} - ${endMonth}`;
  };

  return (
    <View>
      <View className="my-2">
        <View className="bg-card p-4 rounded-2xl border border-border flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <View>
              <View className="flex-row items-center">
                <Text className="font-medium mr-4 text-foreground/70">
                  {new Date(months[0].paymentDate).toLocaleDateString()} · {months[0].paidVia}
                </Text>
                {note && (
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger className="web:focus:outline-none">
                      <Info size={16} color={getColor('muted-foreground')} />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      insets={{ left: 12, right: 12 }}
                      className="gap-1 py-3 px-5 border border-foreground/10"
                    >
                      <Text className="text-foreground/70">{note}</Text>
                    </TooltipContent>
                  </Tooltip>
                )}
              </View>

              <View className="flex-row flex-wrap gap-1 mt-2 w-full">
                <View className="bg-primary/20 p-1 px-2 rounded-full">
                  <Text className="text-foreground/50 text-xs">{getMonthRange()}</Text>
                </View>
              </View>
            </View>
          </View>
          <Text className="font-semibold text-foreground/70">₹{totalAmount}</Text>
        </View>
      </View>
    </View>
  );
};

export default TransactionCard;
