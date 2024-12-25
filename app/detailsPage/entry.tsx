import { View, Pressable, SafeAreaView, Linking, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Text } from '~/components/ui/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const validationSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name too short').required('Name is required'),
  address: Yup.string().min(5, 'Address too short').required('Address is required'),
  mobileNumber: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Mobile number is required'),
  stbNumber: Yup.string().min(4, 'STB number too short').required('STB number is required'),
});

const DetailsPage = () => {
  const params = useLocalSearchParams<{
    name: string;
    address: string;
    stb: string;
    date: string;
    amount: string;
    status: 'PAID' | 'PARTIAL_PAID' | 'ADVANCE_PAID' | 'UNPAID';
    debt?: string;
    advance?: string;
  }>();

  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedId, setIsCopiedId] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(params.stb);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(params.stb);
    setIsCopiedId(true);
    setTimeout(() => {
      setIsCopiedId(false);
    }, 3000);
  };

  const handleCall = () => {
    Linking.openURL('tel:9090909090');
  };

  const YEARS = ['2023', '2024', '2025'];

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
      router.push('/');
      toast({
        title: 'User Deleted',
        description: `Successfully deleted user ${params.name}`,
        variant: 'destructive',
      });
    }, 100);
  };

  return (
    <ScrollView>
      <View className="flex-1 bg-background pt-6">
        <View className="p-4 mt-0">
          <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
              <Text className="text-muted-foreground text-sm mb-2">STB Number</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-foreground/80 font-semibold">{params.stb}</Text>
                <Pressable
                  android_ripple={{
                    color: getColor('primary'),
                    radius: 100,
                    foreground: true,
                    borderless: false,
                  }}
                  onPress={handleCopy}
                  className="w-8 h-8 bg-transparent items-center justify-center rounded-full  overflow-hidden"
                >
                  {isCopied ? (
                    <Ionicons name="checkmark-outline" size={16} color={getColor('primary')} />
                  ) : (
                    <Ionicons name="copy-outline" size={16} color={getColor('muted-foreground')} />
                  )}
                </Pressable>
              </View>
            </View>

            <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
              <Text className="text-muted-foreground text-sm mb-2">Customer ID</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg text-foreground/80 font-semibold">{params.stb}</Text>
                <Pressable
                  android_ripple={{
                    color: getColor('primary'),
                    radius: 100,
                    foreground: true,
                    borderless: false,
                  }}
                  onPress={handleCopyId}
                  className="w-8 h-8 bg-transparent items-center justify-center rounded-full  overflow-hidden"
                >
                  {isCopiedId ? (
                    <Ionicons name="checkmark-outline" size={16} color={getColor('primary')} />
                  ) : (
                    <Ionicons name="copy-outline" size={16} color={getColor('muted-foreground')} />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          <View className="bg-card p-4 rounded-2xl border border-border mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Mobile Number</Text>
                <Text className="text-lg text-foreground/80 font-semibold">9090909090</Text>
              </View>
              <Pressable onPress={handleCall} className="bg-primary/20 px-6 py-2 rounded-full">
                <Text className="text-primary font-medium">Call</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
              <Text className="text-muted-foreground text-sm mb-1">Created On</Text>
              <Text className="text-lg text-foreground/80 font-semibold">2024-01-01</Text>
            </View>
            <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
              <Text className="text-muted-foreground text-sm mb-1">Last Updated</Text>
              <Text className="text-lg text-foreground/80 font-semibold">2024-03-15</Text>
            </View>
          </View>

          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
              <Text className="text-muted-foreground text-sm mb-2">
                {params.debt ? 'Total Debt' : 'Total Advance'}
              </Text>
              <Text
                className={`text-2xl font-bold ${params.debt ? 'text-red-500' : 'text-green-500'}`}
              >
                ₹{params.debt || params.advance || '0'}
              </Text>
            </View>
            <View className="flex-1 bg-card p-4 rounded-2xl border border-border">
              <Text className="text-muted-foreground text-sm mb-2">Total Paid</Text>
              <Text className="text-2xl font-bold text-primary">₹{params.amount || '0'}</Text>
            </View>
          </View>

          {/* =============== update/delete =============== */}
          <View className="flex-row gap-4">
            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen} className="flex-1">
              <DialogTrigger onPress={() => setIsUpdateOpen(true)} asChild>
                <Pressable
                  className="flex-1 bg-card p-4 rounded-2xl border border-border flex-row items-center justify-center"
                  android_ripple={{
                    color: getColor('primary'),
                    borderless: false,
                    foreground: true,
                    radius: 92,
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-edit"
                    size={24}
                    color={getColor('primary')}
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
                    name: params.name,
                    address: params.address,
                    mobileNumber: '9090909090',
                    stbNumber: params.stb,
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
                    color: getColor('destructive'),
                    borderless: false,
                    radius: 92,
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={getColor('destructive')}
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
                    <Text>Are you sure you want to delete user {params.name}?</Text>
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
          <View className="mt-12">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2 text-2xl font-semibold">
                <HistoryIcon size={18} color={getColor('muted-foreground')} />
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

            <TransactionCard />
            <TransactionCard />
            <TransactionCard />
            <TransactionCard />
            <TransactionCard />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DetailsPage;
