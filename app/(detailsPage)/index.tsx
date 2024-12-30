import { View, Pressable, SafeAreaView, Linking, ScrollView } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '~/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronLeft } from 'lucide-react-native';
import { cn } from '~/lib/utils';
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
import {  useQueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { Skeleton } from '~/components/ui/skeleton';
import { NAV_THEME } from '~/lib/constants';
import { useCustomerDetails } from '~/hooks/useCustomerDetails';
import { DetailsLoader } from '~/components/loaders/detailsLoader';

const validationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name too short').required('Name is required'),
  address: Yup.string().min(5, 'Address too short').required('Address is required'),
  mobileNumber: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Mobile number is required'),
  stbNumber: Yup.string().min(4, 'STB number too short').required('STB number is required'),
});



const DetailsPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useCustomerDetails(id);
  const customer = data?.customer;
  const billSummary = data?.billSummary;

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

  const availableYears = useMemo(() => {
    if (!customer?.payments?.length) return [new Date().getFullYear().toString()];
    
    const years = [...new Set(customer.payments.map(payment => payment.year))];
    return years.sort((a, b) => b - a).map(year => year.toString()); 
  }, [customer]);

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(() => {
    if (availableYears.includes(currentYear)) {
      return availableYears.indexOf(currentYear);
      }
      return 0;
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (values: any) => {
    setIsUpdateOpen(false);
    try {
      const response = await api.put(`api/customer/${customer?.id}`, values);
      if (response.status) {
        toast({
          title: 'User Updated',
          description: `Successfully updated user ${values.name}`,
        });
        queryClient.invalidateQueries({ queryKey: ['customerDetails', id] });
      }
    } catch (error) {
      toast({
        title: 'Failed to Update',
        variant: 'destructive',
        description: `Failed to update user ${values.name}`,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response: any = await api.delete(`api/customer/${customer?.id}`);
      setIsDeleteOpen(false);

      if (response.data?.status) {
        toast({
          title: 'User Deleted',
          description: `Successfully deleted user ${customer?.name}`,
        });
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customerDetails', customer?.id] });
        router.push('/(tabs)');
      } else {
        throw new Error(response.data?.message || 'Failed to delete user');
      }
    } catch (error) {
      setIsDeleteOpen(false);
      toast({
        title: 'Failed to Delete',
        variant: 'destructive',
        description: `Failed to delete user ${customer?.name}`,
      });
    }
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
          <DetailsLoader />
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
                      <Text className="">Make changes to user details here. Click update if done.</Text>
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
                      <Text>{availableYears[selectedYear]}</Text>
                      <ChevronDown className="text-muted-foreground" size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 border border-foreground/10">
                    <DropdownMenuLabel>Select year</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {availableYears.map((year, index) => (
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
                ?.filter((payment) => payment.year === Number(availableYears[selectedYear]))
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
                  (payment) => payment.year === Number(availableYears[selectedYear])
                )) && (
                <View className="flex-1 flex-row items-center rounded-xl justify-center h-40">
                  <Text className="text-foreground/70 text-lg">
                    No transactions found for {availableYears[selectedYear]}
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
