import { View, ScrollView, useWindowDimensions, Pressable, ActivityIndicator } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { useToast } from '~/components/ui/toast';
import { useState } from 'react';
import * as Yup from 'yup';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '~/lib/utils';
import { Pencil, Check, X, Plus } from 'lucide-react-native';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '~/components/ui/dialog';
import { useFormik } from 'formik';

import { cn } from '~/lib/utils';
import api from '~/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Plan {
  id: string;
  amount: number;
  profit: number;
}

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const { toast } = useToast();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    amount: '',
    profit: '',
  });
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get('/api/bills/plans');
      if (!response.status) {
        throw new Error(response.message);
      }
      return response.data as Plan[];
    },
  });

  const columnWidths = [width * 0.33, width * 0.33, width * 0.33];

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditValues({
      amount: plan.amount.toString(),
      profit: plan.profit.toString(),
    });
  };

  const handleSave = async (planId: string) => {
    try {
      const response = await api.put(`/api/bills/plans/${planId}`, {
        amount: parseInt(editValues.amount),
        profit: parseInt(editValues.profit),
      });

      if (response.status) {
        setEditingPlan(null);
        queryClient.invalidateQueries({ queryKey: ['plans'] });
        toast({
          title: 'Plan Updated',
          description: 'Successfully updated plan values',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update plan',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong while updating the plan',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      const response = await api.post('/api/customer/create', values);
      if (response.status) {
        toast({
          title: 'User Created',
          description: 'Successfully created user',
        });
        formik.resetForm();
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsCreateUserOpen(false);
    }
  };
  const [isUpdateUserOpen, setIsUpdateUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);

  const userValidationSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Name too short').required('Name is required'),
    address: Yup.string().min(5, 'Address too short').required('Address is required'),
    phone: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be 10 digits')
      .required('Mobile number is required'),
    customerId: Yup.string().min(4, 'Customer ID too short').required('Customer ID is required'),
    stbId: Yup.string().min(4, 'STB ID too short').required('STB ID is required'),
  });

  const { getColor } = useThemeColors();

  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
      phone: '',
      stbId: '',
      customerId: '',
    },
    validationSchema: userValidationSchema,
    onSubmit: handleCreateUser,
    validateOnChange: false,
    validateOnBlur: true,
  });

  const { handleSubmit } = formik;
  const [defaultName, setDefaultName] = useState('Vijay');
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-semibold">Settings</Text>
          <Text>
            <ThemeToggle />
          </Text>
        </View>

        <View className="">
          <Text className="text-sm font-medium mb-2">Default User</Text>
          <View className="flex-1 flex-row items-center justify-between gap-2">
            <Input
              value={defaultName}
              className="flex-1"
              onChangeText={(text) => setDefaultName(text)}
              editable={isEditingName}
            />
            <Button
              variant="outline"
              size="xl"
              className={cn(isEditingName && 'bg-green-600')}
              onPress={() => {
                if (isEditingName) {
                  toast({
                    title: 'Name Updated',
                    description: 'Successfully updated default name',
                  });
                }
                setIsEditingName(!isEditingName);
              }}
            >
              {isEditingName ? (
                <Check size={20} className="text-primary-foreground" />
              ) : (
                <Pencil color="gray" size={18} />
              )}
            </Button>
          </View>
        </View>

        <Text className="text-lg font-semibold mb-4 mt-8">Change Plans</Text>

        <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
          <View className="border border-border rounded-2xl w-full">
            <View className="flex-row border-b border-border">
              <View style={{ width: columnWidths[0] }} className="border-r border-border p-4">
                <Text className="text-center font-medium">Monthly Amount</Text>
              </View>
              <View style={{ width: columnWidths[1] }} className="border-r border-border p-4">
                <Text className="text-center font-medium">Profit per head</Text>
              </View>
              <View style={{ width: columnWidths[2] }} className="p-4">
                <Text className="text-center font-medium">Edit</Text>
              </View>
            </View>

            {isLoading ? (
              <View className="p-4">
                <ActivityIndicator />
              </View>
            ) : (
              plansData?.map((plan, index) => (
                <View
                  key={plan.id}
                  className={`flex-row ${
                    index !== (plansData?.length || 0) - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <View style={{ width: columnWidths[0] }} className="border-r border-border p-4">
                    {editingPlan === plan.id ? (
                      <Input
                        value={editValues.amount}
                        onChangeText={(text) =>
                          setEditValues((prev) => ({ ...prev, amount: text }))
                        }
                        keyboardType="numeric"
                        className="h-8"
                      />
                    ) : (
                      <Text className="text-center">₹{plan.amount}</Text>
                    )}
                  </View>
                  <View style={{ width: columnWidths[1] }} className="border-r border-border p-4">
                    {editingPlan === plan.id ? (
                      <Input
                        value={editValues.profit}
                        onChangeText={(text) =>
                          setEditValues((prev) => ({ ...prev, profit: text }))
                        }
                        keyboardType="numeric"
                        className="h-8"
                      />
                    ) : (
                      <Text className="text-center">₹{plan.profit}</Text>
                    )}
                  </View>
                  <View style={{ width: columnWidths[2] }} className="p-4">
                    <View className="items-center">
                      {editingPlan === plan.id ? (
                        <Button size="xl" variant="outline" onPress={() => handleSave(plan.id)}>
                          <Check size={20} className="text-primary" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onPress={() => handleEdit(plan)}>
                          <Pencil color="gray" size={16} />
                        </Button>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View className="my-4 mt-8 flex-row gap-4">
          <View className="flex-1">
            <Dialog open={isUpdateUserOpen} onOpenChange={setIsUpdateUserOpen}>
              <DialogTrigger asChild>
                <Pressable
                  className="flex-1  bg-primary/10 p-4 rounded-2xl border border-border flex-row items-center justify-center"
                  style={{ minWidth: '48%' }}
                  android_ripple={{
                    color: getColor('primary'),
                    borderless: false,
                    foreground: true,
                    radius: 92,
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-edit"
                    size={20}
                    color={getColor('primary')}
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-primary font-medium">Update User</Text>
                </Pressable>
              </DialogTrigger>
              <DialogContent className="min-w-full">
                <DialogHeader>
                  <DialogTitle>Update User</DialogTitle>
                  <DialogDescription>Enter STB ID to update user</DialogDescription>
                </DialogHeader>
                <Input placeholder="Enter STB ID" />
                <View className="flex-row gap-4 mt-4">
                  <DialogClose asChild style={{ flex: 1 }}>
                    <Button variant="outline">
                      <Text>Cancel</Text>
                    </Button>
                  </DialogClose>
                  <DialogClose asChild style={{ flex: 1 }}>
                    <Button>
                      <Text>OK</Text>
                    </Button>
                  </DialogClose>
                </View>
              </DialogContent>
            </Dialog>
          </View>
          <View className="flex-1">
            <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
              <DialogTrigger asChild>
                <Pressable
                  className="flex-1 bg-destructive/10 p-4 rounded-2xl border border-border flex-row items-center justify-center"
                  style={{ minWidth: '48%' }}
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
              <DialogContent className="min-w-full">
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>Enter STB ID to delete user</DialogDescription>
                </DialogHeader>
                <Input placeholder="Enter STB ID" />
                <View className="flex-row gap-4 mt-4">
                  <DialogClose asChild style={{ flex: 1 }}>
                    <Button variant="outline">
                      <Text>Cancel</Text>
                    </Button>
                  </DialogClose>
                  <DialogClose asChild style={{ flex: 1 }}>
                    <Button variant="destructive">
                      <Text>OK</Text>
                    </Button>
                  </DialogClose>
                </View>
              </DialogContent>
            </Dialog>
          </View>
        </View>

        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Pressable
              android_ripple={{
                color: getColor('primary'),
                borderless: false,
                foreground: true,
                radius: 200,
              }}
              className="w-full mt-2 bg-primary/10 p-4 rounded-2xl border border-border  flex-row items-center justify-center mb-24"
            >
              <Plus size={20} color={getColor('primary')} style={{ marginRight: 8 }} />
              <Text className="text-primary font-medium">Add new user</Text>
            </Pressable>
          </DialogTrigger>
          <DialogContent className="min-w-full">
            <DialogHeader>
              <View>
                <Text className="text-lg font-semibold">Create New User</Text>
                <Text className="text-sm text-muted-foreground">Add a new user to the system</Text>
              </View>
            </DialogHeader>

            <View style={{ gap: 16 }}>
              <View>
                <Text className="text-sm font-medium mb-2">Name</Text>
                <View className="w-full">
                  <Input
                    value={formik.values.name}
                    onChangeText={(text) => formik.setFieldValue('name', text, false)}
                    onBlur={() => formik.handleBlur('name')}
                    placeholder="Enter name"
                  />
                </View>
                {formik.errors.name && formik.touched.name && (
                  <Text className="text-destructive text-xs mt-1">{formik.errors.name}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">Address</Text>
                <Input
                  value={formik.values.address}
                  onChangeText={(text) => formik.setFieldValue('address', text, false)}
                  onBlur={() => formik.handleBlur('address')}
                  placeholder="Enter address"
                />
                {formik.errors.address && formik.touched.address && (
                  <Text className="text-destructive text-xs mt-1">{formik.errors.address}</Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-medium mb-2">Mobile Number</Text>
                  <Input
                    value={formik.values.phone}
                    onChangeText={(text) => formik.setFieldValue('phone', text, false)}
                    onBlur={() => formik.handleBlur('phone')}
                    placeholder="Enter mobile number"
                    keyboardType="numeric"
                  />
                  {formik.errors.phone && formik.touched.phone && (
                    <Text className="text-destructive text-xs mt-1">{formik.errors.phone}</Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-medium mb-2">STB Number</Text>
                  <Input
                    value={formik.values.stbId}
                    onChangeText={(text) => formik.setFieldValue('stbId', text, false)}
                    onBlur={() => formik.handleBlur('stbId')}
                    placeholder="Enter STB number"
                  />
                  {formik.errors.stbId && formik.touched.stbId && (
                    <Text className="text-destructive text-xs mt-1">{formik.errors.stbId}</Text>
                  )}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">Customer ID</Text>
                <Input
                  value={formik.values.customerId}
                  onChangeText={(text) => formik.setFieldValue('customerId', text, false)}
                  onBlur={() => formik.handleBlur('customerId')}
                  placeholder="Enter customer ID"
                />
                {formik.errors.customerId && formik.touched.customerId && (
                  <Text className="text-destructive text-xs mt-1">{formik.errors.customerId}</Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <DialogClose asChild style={{ flex: 1 }}>
                  <Button variant="outline">
                    <Text>Cancel</Text>
                  </Button>
                </DialogClose>
                <Button onPress={() => handleSubmit()} style={{ flex: 1 }}>
                  <Text>Create</Text>
                </Button>
              </View>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </ScrollView>
  );
}
