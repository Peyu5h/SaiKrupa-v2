import { View, Pressable } from 'react-native';
import React from 'react';
  import { useThemeColors } from '~/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/ui/text';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Button } from './ui/button';
import { TransactionCardProps } from '~/backend/src/utils/types';



const AllTransactionsCard = ({
  name,
  date,
  amount,
  paymentMethod,
  onDelete,
}: TransactionCardProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const handleDelete = () => {
    setIsDeleteOpen(false);
    onDelete?.();
  };
  const { getColor } = useThemeColors();


  return (
    <View className="mb-4 w-full bg-secondary/50 p-4 rounded-2xl border border-border">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-medium text-lg mb-2">{name}</Text>
          <Text className="text-muted-foreground">
            {date} · {paymentMethod} ·{' '}
            <Text className="font-medium text-emerald-600">₹{amount}</Text>
          </Text>
        </View>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger asChild>
            <Pressable
              className="p-2 rounded-full mr-2"
              android_ripple={{
                color: getColor('destructive'),
                borderless: true,
                radius: 20,
                foreground: true,
              }}
            >
              <Ionicons name="trash-sharp" size={20} color={getColor('destructive')} />
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Text className="text-lg">Delete Transaction</Text>
              </DialogTitle>
              <DialogDescription>
                <Text>Are you sure you want to delete this transaction?</Text>
              </DialogDescription>
            </DialogHeader>
            <View className="flex-row gap-3 mt-4">
              <DialogClose asChild className="flex-1">
                <Button variant="outline">
                  <Text>Cancel</Text>
                </Button>
              </DialogClose>
              <Button variant="destructive" onPress={handleDelete} className="flex-1">
                <Text>Delete</Text>
              </Button>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </View>
  );
};

export default AllTransactionsCard;
