import { View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Text } from '~/components/ui/text';
import { getColor } from '~/lib/utils';
import { IndianRupee, TrendingUp, Users, Wallet, ChevronDown, Calendar } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GREEN_COLOR = '#16a34a'; 

const AnalyticsScreen = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedViewType, setSelectedViewType] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0]);

  const stats = {
    totalCustomers: 45,
    transactions: {
      upi: 24,
      cash: 8,
    },
    paymentRate: 85, 
  };

  const handleViewTypeChange = (newType: 'Monthly' | 'Yearly') => {
    setSelectedViewType(newType);
  };

  return (
    <ScrollView className="flex-1 bg-background pt-6 ">
      <View className="p-4 ">
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-1">Good morning, Vijay</Text>
          <Text className="text-muted-foreground">Here's your business overview</Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className='flex-1'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between flex-row"
                >
                  <Text className="text-foreground">{selectedViewType}</Text>
                  <ChevronDown size={18} className="text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                insets={{ left: 12, right: 12 }}
                className="w-64 native:w-72 bg-background"
              >
                <DropdownMenuLabel>View Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="gap-1">
                  {['Monthly', 'Yearly'].map((type) => (
                    <DropdownMenuItem 
                      key={type} 
                      onPress={() => handleViewTypeChange(type as 'Monthly' | 'Yearly')}
                      className={cn(
                        'flex-col items-start gap-1',
                        selectedViewType === type ? 'bg-secondary/70' : ''
                      )}
                    >
                      <Text>{type}</Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          {selectedViewType === 'Monthly' && (
            <View className='flex-1'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between flex-row"
                  >
                    <Text className="text-foreground">{selectedMonth}</Text>
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
                    {MONTHS.map((month) => (
                      <DropdownMenuItem 
                        key={month} 
                        onPress={() => setSelectedMonth(month)}
                        className={cn(
                          'flex-col items-start gap-1',
                          selectedMonth === month ? 'bg-secondary/70' : ''
                        )}
                      >
                        <Text>{month}</Text>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          )}

<View className='flex-1'>
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
                <DropdownMenuLabel>Year</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <DropdownMenuItem 
                      key={i} 
                      onPress={() => setSelectedYear(2024 - i)}
                      className={cn(
                        'flex-col items-start gap-1',
                        selectedYear === (2024 - i) ? 'bg-secondary/70' : ''
                      )}
                    >
                      <Text>{2024 - i}</Text>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

         
             
        </View>

      <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground text-lg">Total Customers</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground/80">{stats.totalCustomers}</Text>
          </View>

          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground text-lg">Payment Rate</Text>
            </View>
            <Text className="text-3xl font-bold text-green-600">{stats.paymentRate}%</Text>
          </View>
        </View>


        {/* Existing Stats Cards - Now full width */}
        <View className="flex-col gap-4 mb-6">
          <View className="w-full bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Total Revenue</Text>
              <IndianRupee size={20} color={getColor('primary')} />
            </View>
            <Text className="text-2xl text-foreground/80 font-bold">₹1,870</Text>
          </View>

          <View className="w-full bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Actual Profit</Text>
              <Wallet size={20} color={GREEN_COLOR} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: GREEN_COLOR }}>₹1,200</Text>
          </View>
        </View>

        {/* Customer Movement Stats */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">New Customers</Text>
              <Users size={20} color={"#16a34a"} />
            </View>
            <Text className="text-2xl font-bold text-green-600">+3</Text>
            <Text className="text-sm text-muted-foreground mt-1">This {selectedViewType.toLowerCase()}</Text>
          </View>

          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Left Customers</Text>
              <Users size={20} color={getColor('destructive')} />
            </View>
            <Text className="text-2xl font-bold text-destructive">-1</Text>
            <Text className="text-sm text-muted-foreground mt-1">This {selectedViewType.toLowerCase()}</Text>
          </View>
        </View>

        {/* Collection Stats */}
        <View className="flex-row flex-wrap gap-4">
          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Total Debt</Text>
              <TrendingUp size={20} color={getColor('destructive')} />
            </View>
            <Text className="text-2xl font-bold text-destructive">₹10</Text>
          </View>

          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Total Advance</Text>
              <Wallet size={20} color="green" />
            </View>
            <Text className="text-2xl font-bold text-green-600">₹1,680</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;

