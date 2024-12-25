import { View } from 'react-native';
import React from 'react';
import { getColor } from '~/lib/utils';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Info, Minus, Plus } from 'lucide-react-native';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';

interface MonthlyPayment {
  month: number;
  amount: number;
  paidVia: string;
  status: string;
  debt?: number;
  advance?: number;
  paymentDate: string;
  note?: string | null;
}

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

const getStatusDisplay = (status: string, debt?: number, advance?: number) => {
  switch (status) {
    case 'Paid':
      return <Text className="bg-green-600 p-1 rounded-lg px-2 text-sm">PAID</Text>;
    case 'Partially Paid':
      return (
        <View className="items-end">
          <Text className="bg-yellow-600 p-1 rounded-lg px-2 text-sm">PARTIAL</Text>
          {debt && debt > 0 && (
            <View className="flex-row items-center mt-1">
              <Minus size={12} color={getColor('destructive')} />
              <Text className="text-destructive text-sm">₹ {debt}</Text>
            </View>
          )}
        </View>
      );
    case 'Advance Paid':
      return (
        <View className="items-end">
          <Text className="bg-green-600 p-1 rounded-lg px-2 text-sm">PAID</Text>
          {advance && advance > 0 && (
            <View className="flex-row items-center mt-1">
              <Plus size={12} color="#38a169" />
              <Text className="text-green-600 text-sm">₹ {advance}</Text>
            </View>
          )}
        </View>
      );
    default:
      return <Text className="bg-red-600 p-1 rounded-lg px-2 text-sm">UNPAID</Text>;
  }
};

const MonthlyCard = ({ payment }: { payment: MonthlyPayment }) => {
  return (
    <View className="my-2">
      <View className="bg-card p-4 rounded-2xl border border-border flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <View>
            <View className="flex-row items-center">
              <Text className="text-foreground/70 text-xl ">{MONTHS[payment.month - 1]}</Text>
              {payment.note && (
                <Tooltip delayDuration={150}>
                  <TooltipTrigger className="ml-4 z-20 m-2">
                    <Info size={16} color={getColor('muted-foreground')} />
                  </TooltipTrigger>
                </Tooltip>
              )}
            </View>

            <View className="flex-row items-center">
              <Text className="font-medium text-muted-foreground">
                {format(new Date(payment.paymentDate), 'dd/MM/yyyy')} · {payment.paidVia}
              </Text>

              <Text className="font-semibold text-emerald-600 "> · ₹{payment.amount}</Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          {getStatusDisplay(payment.status, payment.debt, payment.advance)}
        </View>
      </View>
    </View>
  );
};

// export const MonthlyCardSkeleton = () => {
//   return (
//     <View className="my-2 flex-1 flex-row items-center justify-between">
//       <View className="bg-card p-4 rounded-2xl border border-border flex-row items-center justify-between">
//         <View className="flex-row items-center space-x-2">
//           <View>
//             <Skeleton className="h-7 w-24 mb-2 animate-pulse" />
//             <Skeleton className="h-5 w-40 mb-2 animate-pulse" />
//             <Skeleton className="h-7 w-24 mb-2 animate-pulse" />
//             <Skeleton className="h-5 w-40 mb-2 animate-pulse" />
//             <Skeleton className="h-7 w-24 mb-2 animate-pulse" />
//             <Skeleton className="h-5 w-40 mb-2 animate-pulse" />
//           </View>
//         </View>
//         <Skeleton className="h-7 w-20 mb-2 animate-pulse" />
//         <Skeleton className="h-7 w-20 mb-2 animate-pulse" />
//       </View>
//     </View>
//   );
// };

export const MonthlyBreakdown = ({
  payments,
  isLoading,
}: {
  payments: MonthlyPayment[];
  isLoading?: boolean;
}) => {
  //   if (isLoading) {
  //     return (
  //       <View>
  //         <MonthlyCardSkeleton />
  //         <MonthlyCardSkeleton />
  //         <MonthlyCardSkeleton />
  //       </View>
  //     );
  //   }

  const paymentsByMonth = new Map(payments.map((p) => [p.month, p]));

  return (
    <View>
      {MONTHS.map((month, index) => {
        const payment = paymentsByMonth.get(index + 1);
        if (payment) {
          return <MonthlyCard key={month} payment={payment} />;
        }
        return (
          <View key={month} className="my-2">
            <View className="bg-secondary/50 p-4 rounded-2xl border border-border flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <View>
                  <View className="flex-row mt-2" style={{ gap: 4 }}>
                    <Text className="text-foreground/50 text-xl">{month}</Text>
                  </View>
                </View>
              </View>
              <View className="items-end">{getStatusDisplay('Unpaid')}</View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default MonthlyBreakdown;
