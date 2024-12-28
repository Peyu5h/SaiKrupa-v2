import * as React from 'react';
import { Alert, Platform, RefreshControl, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOutDown,
  LayoutAnimationConfig,
} from 'react-native-reanimated';
import { Info } from '~/lib/icons/Info';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '~/lib/api';
import { useToast } from '~/components/ui/toast';
import { Input } from '~/components/ui/input';
import { cn, getColor } from '~/lib/utils';
import { Muted } from '~/components/ui/typography';
import { ChevronDown } from 'lucide-react-native';
import { Check } from 'lucide-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomerCard from '~/components/CustomerCard';

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  stdId: string;
  customerId: string;
  registerAt: string;
  payments: Array<{
    id: string;
    customerId: string;
    year: number;
    totalDebt: number;
    totalAdvance: number;
    updatedAt: string;
    months: Array<{
      id: string;
      paymentId: string;
      month: number;
      amount: number;
      paidVia: string;
      debt: number;
      advance: number;
      paymentDate: string;
      status: string;
      note: string | null;
      createdAt: string;
    }>;
  }>;
}

export default function SearchScreen() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse<Customer[]>>(
          '/api/customer/676725c2737cf785cdaaea38'
        );

        if (!response.status) {
          toast({
            title: 'Uh oh! Something went wrong',
            description: response.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: response.message,
          });
        }
        return response;
      } catch (error) {
        toast({
          title: 'Uh oh! Something went wrong',
          description: 'Network request failed',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  const [name, setName] = React.useState('');
  const [customerType, setCustomerType] = React.useState('All');
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const getMonthName = (month: number): string => {
    return new Date(2024, month).toLocaleString('default', { month: 'long' });
  };

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

  return (
    <View className="flex-1 items-center gap-4 p-4 bg-background">
      <View className="items-center w-full flex flex-row gap-2 mt-2">
        <View className="flex-1">
          <Input
            placeholder="Search for customer"
            value={name}
            onChangeText={setName}
            className="w-full border border-border text-foreground text-lg rounded-lg "
          />
        </View>
        <View className="flex-0 w-28">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                style={{height:54}}
                variant="outline"
                className="flex-row items-center justify-between "
              >
                <Text>{customerType}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select customer type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('All');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'All' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>All</Text>
                  <Muted>All customers</Muted>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('Paid');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'Paid' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>Paid</Text>
                  <Muted>Customers who paid monthly payment</Muted>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('Unpaid');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'Unpaid' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>Unpaid</Text>
                  <Muted>Customers who did not pay monthly payment</Muted>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onPress={() => {
                    setCustomerType('Partial');
                  }}
                  className={cn(
                    'flex-col items-start gap-1',
                    customerType === 'Partial' ? 'bg-secondary/70' : ''
                  )}
                >
                  <Text>Partial paid</Text>
                  <Muted>Customers who paid partial monthly payment</Muted>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>
      <View className="flex-row justify-between w-full gap-2">
        <View className="w-1/2 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between flex-row"
              >
                <Text className="text-foreground">{MONTHS[selectedMonth]}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select Month</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {MONTHS.map((month, index) => (
                  <DropdownMenuItem 
                    key={month} 
                    onPress={() => setSelectedMonth(index)}
                    className={cn(
                      'flex-col items-start gap-1',
                      selectedMonth === index ? 'bg-secondary/70' : ''
                    )}
                  >
                    <Text>{month}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        <View className="w-1/2 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between flex-row"
              >
                <Text className="text-foreground">{selectedYear}</Text>
                <ChevronDown size={18} className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              insets={{ left: 12, right: 12 }}
              className="w-64 native:w-72 bg-background"
            >
              <DropdownMenuLabel>Select Year</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="gap-1">
                {Array.from({ length: 10 }, (_, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    onPress={() => setSelectedYear(2024 - index)}
                    className={cn(
                      'flex-col items-start gap-1',
                      selectedYear === (2024 - index) ? 'bg-secondary/70' : ''
                    )}
                  >
                    <Text>{2024 - index}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>
      </View>

      <View className="w-full ">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className=""
          contentContainerStyle={{ paddingBottom: 200 }}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
        >
          <CustomerCard
            name="Vijay Bagul"
            address="room 8 Punjabi chawl"
            stb="3156457993"
            date="27-11-2024"
            amount={310}
            status="PAID"
          />
          <CustomerCard
            name="Vijay Bagul"
            address="room 8 Punjabi chawl"
            stb="3156457993"
            date="27-11-2024"
            amount={310}
            status="PAID"
          />
          <CustomerCard
            name="Vijay Bagul"
            address="room 8 Punjabi chawl"
            stb="3156457993"
            date="27-11-2024"
            amount={300}
            status="PARTIAL_PAID"
            debt={10}
          />
          <CustomerCard
            name="Vijay Bagul"
            address="room 8 Punjabi chawl"
            stb="3156457993"
            date="27-11-2024"
            amount={320}
            status="ADVANCE_PAID"
            advance={10}
          />
          <CustomerCard
            name="Vijay Bagul"
            address="room 8 Punjabi chawl"
            stb="3156457993"
            date="27-11-2024"
            amount={0}
            status="UNPAID"
            isPending={true}
          />
          <CustomerCard
            name="Vijay Bagul"
            address="room 8 Punjabi chawl"
            stb="3156457993"
            date="27-11-2024"
            amount={0}
            status="UNPAID"
          />
        </ScrollView>
      </View>
    </View>
  );
}
