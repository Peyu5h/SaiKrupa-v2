import { View, Pressable, SafeAreaView, Linking, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text } from '~/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { cn, getColor } from '~/lib/utils';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HistoryIcon } from '~/components/icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import TransactionCard from '~/components/TransactionCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useToast } from '~/components/ui/toast';
import { useQuery } from '@tanstack/react-query';
import api from '~/lib/api';
import { BillSummary, Customer, CustomerDetailsResponse } from '~/backend/src/utils/types';
import { Skeleton } from '~/components/ui/skeleton';
import { NAV_THEME } from '~/lib/constants';
import { useCustomerDetails } from '~/hooks/useCustomerDetails';

const validationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name too short').required('Name is required'),
  address: Yup.string().min(5, 'Address too short').required('Address is required'),
  mobileNumber: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Mobile number is required'),
  stbNumber: Yup.string().min(4, 'STB number too short').required('STB number is required'),
});

const LoadingState = () => (
  <View className="p-4">
    <View className="flex-row flex-wrap gap-4 mb-6">
      <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
        <Text className="text-muted-foreground text-sm mb-2">STB Number</Text>
        <Skeleton className="h-6 w-24" />
      </View>
      <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
        <Text className="text-muted-foreground text-sm mb-2">Customer ID</Text>
        <Skeleton className="h-6 w-24" />
      </View>
    </View>

    <View className="bg-card p-4 rounded-2xl border border-border mb-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-muted-foreground text-sm mb-1">Mobile Number</Text>
          <Skeleton className="h-6 w-32" />
        </View>
        <Skeleton className="h-10 w-20" />
      </View>
    </View>

    <View className="flex-row gap-4 mb-6">
      {[1, 2].map((i) => (
        <View key={i} className="flex-1 bg-card p-4 rounded-2xl border border-border">
          <Text className="text-muted-foreground text-sm mb-1">
            {i === 1 ? 'Created On' : 'Last Updated'}
          </Text>
          <Skeleton className="h-6 w-24" />
        </View>
      ))}
    </View>

    <View className="flex-row gap-4 mb-6">
      {[1, 2].map((i) => (
        <View key={i} className="flex-1 bg-card p-4 rounded-2xl border border-border">
          <Text className="text-muted-foreground text-sm mb-2">
            {i === 1 ? 'Total' : 'Total Paid'}
          </Text>
          <Skeleton className="h-8 w-20" />
        </View>
      ))}
    </View>

    <View className="flex-row gap-4">
      {[1, 2].map((i) => (
        <Skeleton key={i} className="flex-1 h-14" />
      ))}
    </View>

    <View className="mt-12">
      <View className="flex-row items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-32" />
      </View>
      <View className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </View>
    </View>
  </View>
);

const DetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customer, billSummary, isLoading } = useCustomerDetails(id);

  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedId, setIsCopiedId] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(customer?.stdId || '');
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(customer?.customerId || '');
    setIsCopiedId(true);
    setTimeout(() => {
      setIsCopiedId(false);
    }, 3000);
  };

  const handleCall = ({ tel }: { tel: string | unknown }) => {
    Linking.openURL(`tel: ${tel}`);
  };

  const YEARS = ['2024', '2025'];

  const [selectedYear, setSelectedYear] = useState(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleSubmit = (values: any) => {
    setIsUpdateOpen(false);
    setTimeout(() => {
      toast({
        title: 'User Updated',
        description: `Successfully updated user ${values.name}`,
      });
    }, 100);
  };

  const handleDelete = () => {
    setIsDeleteOpen(false);
    setTimeout(() => {
      router.push('/(tabs)');
      toast({
        title: 'User Deleted',
        description: `Successfully deleted user ${customer?.name}`,
      });
    }, 100);
  };

  const wrapStb = (stb: string) => {
    if (stb.length > 12) {
      return `${stb.substring(0, 12)}...`;
    }
    return stb;
  };

  return (
    <ScrollView>
      <View className="flex-1 bg-background">
        {isLoading ? (
          <LoadingState />
        ) : (
          <View className="p-4">
            <View className="flex-row flex-wrap gap-4 mb-6">
              <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
                <Text className="text-muted-foreground text-sm mb-2">STB Number</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg text-foreground/80 font-semibold">
                    {wrapStb(customer?.stdId || '')}
                  </Text>
                  <Pressable
                    android_ripple={{
                      color: 'muted-foreground',
                      radius: 100,
                      foreground: true,
                      borderless: false,
                    }}
                    onPress={handleCopy}
                    className="w-8 h-8 bg-transparent items-center justify-center rounded-full  overflow-hidden"
                  >
                    {isCopied ? (
                      <Ionicons name="checkmark-outline" size={16} color={'#38a169'} />
                    ) : (
                      <Ionicons name="copy-outline" size={16} color={NAV_THEME.dark.primary} />
                    )}
                  </Pressable>
                </View>
              </View>

              <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
                <Text className="text-muted-foreground text-sm mb-2">Customer ID</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg text-foreground/80 font-semibold">
                    {customer?.customerId}
                  </Text>
                  <Pressable
                    android_ripple={{
                      color: 'muted-foreground',
                      radius: 100,
                      foreground: true,
                      borderless: false,
                    }}
                    onPress={handleCopyId}
                    className="w-8 h-8 bg-transparent items-center justify-center rounded-full  overflow-hidden"
                  >
                    {isCopiedId ? (
                      <Ionicons name="checkmark-outline" size={16} color={'#38a169'} />
                    ) : (
                      <Ionicons name="copy-outline" size={16} color={NAV_THEME.dark.primary} />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            <View className="bg-card p-4 rounded-2xl border border-border mb-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-muted-foreground text-sm mb-1">Mobile Number</Text>
                  <Text className="text-lg text-foreground/80 font-semibold">
                    {customer?.phone}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleCall({ tel: customer?.phone })}
                  className="bg-primary/20 px-6 py-2 rounded-full"
                >
                  <Text className="text-primary font-medium">Call</Text>
                </Pressable>
              </View>
            </View>

            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
                <Text className="text-muted-foreground text-sm mb-1">Created On</Text>
                <Text className="text-lg text-foreground/80 font-semibold">
                  {customer?.registerAt}
                </Text>
              </View>
              <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
                <Text className="text-muted-foreground text-sm mb-1">Last Updated</Text>
                <Text className="text-lg text-foreground/80 font-semibold">
                  {customer?.payments &&
                  customer.payments.length > 0 &&
                  customer.payments[0]?.updatedAt
                    ? new Date(customer?.payments[0]?.updatedAt || '').toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
                <Text className="text-muted-foreground text-sm mb-2">
                  {billSummary?.totalDebt ? 'Total Debt' : 'Total Advance'}
                </Text>
                <Text
                  className={`text-2xl font-bold ${
                    billSummary?.totalDebt ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  ₹{billSummary?.totalDebt || billSummary?.totalAdvance || '0'}
                </Text>
              </View>
              <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
                <Text className="text-muted-foreground text-sm mb-2">Total Paid</Text>
                <Text className="text-2xl font-bold text-primary">
                  ₹{billSummary?.totalPaid || '0'}
                </Text>
              </View>
            </View>

            {/* =============== update/delete =============== */}
            <View className="flex-row gap-4">
              <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen} className="flex-1">
                <DialogTrigger onPress={() => setIsUpdateOpen(true)} asChild>
                  <Pressable
                    className="flex-1 bg-card p-4 rounded-2xl border border-border flex-row items-center justify-center"
                    android_ripple={{
                      color: 'primary',
                      borderless: false,
                      foreground: true,
                      radius: 92,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="account-edit"
                      size={24}
                      color={NAV_THEME.dark.primary}
                    />
                    <Text className="text-primary ml-2 font-medium">Update User</Text>
                  </Pressable>
                </DialogTrigger>
                <DialogContent className="w-full">
                  <DialogHeader>
                    <DialogTitle>
                      <Text className="text-lg">Update User</Text>
                    </DialogTitle>
                    <DialogDescription>
                      <Text className="">
                        Make changes to user details here. Click update if done.
                      </Text>
                    </DialogDescription>
                  </DialogHeader>
                  <Formik
                    initialValues={{
                      name: customer?.name || '',
                      address: customer?.address || '',
                      mobileNumber: customer?.phone || '',
                      stbNumber: customer?.stdId || '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ handleSubmit, values, handleChange, dirty, errors, touched }) => (
                      <View style={{ gap: 16 }}>
                        <View>
                          <Text className="text-sm font-medium mb-2">Name</Text>
                          <Input
                            value={values.name}
                            onChangeText={handleChange('name')}
                            placeholder="Enter name"
                          />
                          {errors.name && touched.name && (
                            <Text className="text-destructive text-xs mt-1">{errors.name}</Text>
                          )}
                        </View>

                        <View>
                          <Text className="text-sm font-medium mb-2">Address</Text>
                          <Input
                            value={values.address}
                            onChangeText={handleChange('address')}
                            placeholder="Enter address"
                          />
                          {errors.address && touched.address && (
                            <Text className="text-destructive text-xs mt-1">{errors.address}</Text>
                          )}
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <Text className="text-sm font-medium mb-2">Mobile Number</Text>
                            <Input
                              value={values.mobileNumber}
                              onChangeText={handleChange('mobileNumber')}
                              placeholder="Enter mobile number"
                              keyboardType="numeric"
                            />
                            {errors.mobileNumber && touched.mobileNumber && (
                              <Text className="text-destructive text-xs mt-1">
                                {errors.mobileNumber}
                              </Text>
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text className="text-sm font-medium mb-2">STB Number</Text>
                            <Input
                              value={values.stbNumber}
                              onChangeText={handleChange('stbNumber')}
                              placeholder="Enter STB number"
                            />
                            {errors.stbNumber && touched.stbNumber && (
                              <Text className="text-destructive text-xs mt-1">
                                {errors.stbNumber}
                              </Text>
                            )}
                          </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                          <DialogClose asChild style={{ flex: 1 }}>
                            <Button variant="outline" style={{ flex: 1 }}>
                              <Text>Cancel</Text>
                            </Button>
                          </DialogClose>
                          <Button
                            onPress={() => handleSubmit()}
                            disabled={!dirty}
                            style={{ flex: 1 }}
                          >
                            <Text>Update</Text>
                          </Button>
                        </View>
                      </View>
                    )}
                  </Formik>
                </DialogContent>
              </Dialog>

              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} className="flex-1">
                <DialogTrigger onPress={() => setIsDeleteOpen(true)} asChild>
                  <Pressable
                    className="flex-1 bg-card p-4 rounded-2xl border border-border flex-row items-center justify-center"
                    android_ripple={{
                      color: 'destructive',
                      borderless: false,
                      radius: 92,
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={'#e53e3e'}
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-destructive font-medium">Delete User</Text>
                  </Pressable>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      <Text className="text-lg">Delete User</Text>
                    </DialogTitle>
                    <DialogDescription>
                      <Text>Are you sure you want to delete user {customer?.name}?</Text>
                    </DialogDescription>
                  </DialogHeader>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                    <DialogClose asChild style={{ flex: 1 }}>
                      <Button variant="outline" style={{ flex: 1 }}>
                        <Text>Cancel</Text>
                      </Button>
                    </DialogClose>
                    <Button variant="destructive" onPress={handleDelete} style={{ flex: 1 }}>
                      <Text>Delete</Text>
                    </Button>
                  </View>
                </DialogContent>
              </Dialog>
            </View>

            {/* =============== Transactions =============== */}
            <View className="my-12">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2 text-2xl font-semibold">
                  <HistoryIcon size={18} color={'#666666'} />
                  <Text className="text-foreground/70 text-xl font-medium">Transactions:</Text>
                </View>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-32 justify-between flex-row">
                      <Text>{YEARS[selectedYear]}</Text>
                      <ChevronDown className="text-muted-foreground" size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 border border-foreground/10">
                    <DropdownMenuLabel>Select year</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {YEARS.map((year, index) => (
                        <DropdownMenuItem
                          key={year}
                          onPress={() => setSelectedYear(index)}
                          className={cn(selectedYear === index && 'bg-secondary/70')}
                        >
                          <Text>{year}</Text>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>

              {customer?.payments
                ?.filter((payment) => payment.year === Number(YEARS[selectedYear]))
                .map((payment) => {
                  const totalAmount = payment.months.reduce((sum, month) => sum + month.amount, 0);
                  return (
                    <TransactionCard
                      key={payment.id}
                      months={payment.months}
                      note={payment.months[0]?.note}
                      totalAmount={totalAmount}
                    />
                  );
                })}

              {(!customer?.payments?.length ||
                !customer?.payments?.find(
                  (payment) => payment.year === Number(YEARS[selectedYear])
                )) && (
                <View className="flex-1 flex-row items-center rounded-xl justify-center h-40">
                  <Text className="text-foreground/70 text-lg">
                    No transactions found for {YEARS[selectedYear]}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DetailsPage;
