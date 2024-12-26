import { View, ScrollView, useWindowDimensions } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { useToast } from '~/components/ui/toast';
import { useState } from 'react';
import * as Yup from 'yup';

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
import { Formik, useFormik } from 'formik';
import { useRouter } from 'expo-router';

const DEFAULT_PLANS = [
  { id: 1, monthlyAmount: 310, profitPerCustomer: 120 },
  { id: 2, monthlyAmount: 390, profitPerCustomer: 150 },
  { id: 3, monthlyAmount: 500, profitPerCustomer: 200 },
];

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const { toast } = useToast();
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [editValues, setEditValues] = useState({
    monthlyAmount: '',
    profitPerCustomer: '',
  });
  const router = useRouter();

  const columnWidths = [width * 0.33, width * 0.33, width * 0.33];

  const handleEdit = (plan: (typeof DEFAULT_PLANS)[0]) => {
    setEditingPlan(plan.id);
    setEditValues({
      monthlyAmount: plan.monthlyAmount.toString(),
      profitPerCustomer: plan.profitPerCustomer.toString(),
    });
  };

  const handleSave = (planId: number) => {
    const newPlans = plans.map((plan) => {
      if (plan.id === planId) {
        return {
          ...plan,
          monthlyAmount: parseInt(editValues.monthlyAmount),
          profitPerCustomer: parseInt(editValues.profitPerCustomer),
        };
      }
      return plan;
    });

    setPlans(newPlans);
    setEditingPlan(null);
    toast({
      title: 'Plan Updated',
      description: 'Successfully updated plan values',
    });
  };

  const handleCreateUser = (values: any) => {
    // Handle form submission
  };
  const [isUpdateUserOpen, setIsUpdateUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);

  // const userValidationSchema = Yup.object().shape({
  //   name: Yup.string().min(2, 'Name too short').required('Name is required'),
  //   address: Yup.string().min(5, 'Address too short').required('Address is required'),
  //   mobileNumber: Yup.string()
  //     .matches(/^\d{10}$/, 'Phone number must be 10 digits')
  //     .required('Mobile number is required'),
  //   stbNumber: Yup.string().min(4, 'STB number too short').required('STB number is required'),
  //   customerId: Yup.string().min(4, 'Customer ID too short').required('Customer ID is required'),
  // });

  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
      mobileNumber: '',
      stbNumber: '',
      customerId: '',
    },
    // validationSchema: userValidationSchema,
    onSubmit: handleCreateUser,
  });

  const { handleSubmit } = formik;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-semibold">Settings</Text>
          <Text>
            <ThemeToggle />
          </Text>
        </View>

        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full my-4 flex-row items-center justify-center gap-2"
              onPress={() => setIsCreateUserOpen(true)}
            >
              <Text className="text-white">Create New User</Text>
              <Text className="text-white text-xl">+</Text>
            </Button>
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
                    onChangeText={formik.handleChange('name')}
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
                  onChangeText={formik.handleChange('address')}
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
                    value={formik.values.mobileNumber}
                    onChangeText={formik.handleChange('mobileNumber')}
                    placeholder="Enter mobile number"
                    keyboardType="numeric"
                  />
                  {formik.errors.mobileNumber && formik.touched.mobileNumber && (
                    <Text className="text-destructive text-xs mt-1">
                      {formik.errors.mobileNumber}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-medium mb-2">STB Number</Text>
                  <Input
                    value={formik.values.stbNumber}
                    onChangeText={formik.handleChange('stbNumber')}
                    placeholder="Enter STB number"
                  />
                  {formik.errors.stbNumber && formik.touched.stbNumber && (
                    <Text className="text-destructive text-xs mt-1">{formik.errors.stbNumber}</Text>
                  )}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">Customer ID</Text>
                <Input
                  value={formik.values.customerId}
                  onChangeText={formik.handleChange('customerId')}
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

            {plans.map((plan, index) => (
              <View
                key={plan.id}
                className={`flex-row ${index !== plans.length - 1 ? 'border-b border-border' : ''}`}
              >
                <View style={{ width: columnWidths[0] }} className="border-r border-border p-4">
                  {editingPlan === plan.id ? (
                    <Input
                      value={editValues.monthlyAmount}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, monthlyAmount: text }))
                      }
                      keyboardType="numeric"
                      className="h-8"
                    />
                  ) : (
                    <Text className="text-center">₹{plan.monthlyAmount}</Text>
                  )}
                </View>
                <View style={{ width: columnWidths[1] }} className="border-r border-border p-4">
                  {editingPlan === plan.id ? (
                    <Input
                      value={editValues.profitPerCustomer}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, profitPerCustomer: text }))
                      }
                      keyboardType="numeric"
                      className="h-8"
                    />
                  ) : (
                    <Text className="text-center">₹{plan.profitPerCustomer}</Text>
                  )}
                </View>
                <View style={{ width: columnWidths[2] }} className="p-4">
                  <View className="items-center">
                    {editingPlan === plan.id ? (
                      <Button size="sm" variant="ghost" onPress={() => handleSave(plan.id)}>
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
            ))}
          </View>
        </ScrollView>

        <View className="my-4 flex-row gap-4">
          <View className="flex-1">
            <Dialog open={isUpdateUserOpen} onOpenChange={setIsUpdateUserOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4 flex-row items-center justify-center gap-2">
                  <Text className="text-white">Update User</Text>
                </Button>
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
                <Button
                  className="w-full flex-row items-center justify-center gap-2"
                  variant="destructive"
                >
                  <Text className="text-white">Delete User</Text>
                </Button>
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
      </View>
    </ScrollView>
  );
}
