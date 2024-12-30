import { View, ScrollView, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { Text } from '~/components/ui/text';
import { IndianRupee, TrendingUp, Users, Wallet, ChevronDown, Calendar } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '~/lib/api';
import { Skeleton } from '~/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn, useThemeColors } from '~/lib/utils';
import { AnalyticsResponse, MONTHS } from '~/backend/src/utils/types';
import { useToast } from '~/components/ui/toast';
import { Muted } from '~/components/ui/typography';

const GREEN_COLOR = '#16a34a';

const LoadingState = () => (
  <View className="flex-1 bg-background">
    <View className="p-4">
      <View className="mb-6">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-5 w-64" />
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1">
          <Skeleton className="h-[54px] w-full rounded-lg" />
        </View>
        <View className="flex-1">
          <Skeleton className="h-[54px] w-full rounded-lg" />
        </View>
        <View className="flex-1">
          <Skeleton className="h-[54px] w-full rounded-lg" />
        </View>
      </View>

      <View className="flex-row flex-wrap gap-4 mb-6">
        <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
          <Text className="text-muted-foreground text-sm mb-2">Total Customers</Text>
          <Skeleton className="h-8 w-24" />
        </View>
        <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
          <Text className="text-muted-foreground text-sm mb-2">Payment Rate</Text>
          <Skeleton className="h-8 w-24" />
        </View>
      </View>

      <View className="flex-col gap-4 mb-6">
        {[1, 2].map((i) => (
          <View key={i} className="w-full bg-card p-4 rounded-2xl border border-border">
            <Text className="text-muted-foreground text-sm mb-2">
              {i === 1 ? 'Total Revenue' : 'Actual Profit'}
            </Text>
            <Skeleton className="h-8 w-32" />
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-4 mb-6">
        {[1, 2].map((i) => (
          <View key={i} className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <Text className="text-muted-foreground text-sm mb-2">
              {i === 1 ? 'New Customers' : 'Left Customers'}
            </Text>
            <Skeleton className="h-8 w-24" />
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-4">
        {[1, 2].map((i) => (
          <View key={i} className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <Text className="text-muted-foreground text-sm mb-2">
              {i === 1 ? 'Total Debt' : 'Total Advance'}
            </Text>
            <Skeleton className="h-8 w-24" />
          </View>
        ))}
      </View>
    </View>
  </View>
);

const AnalyticsScreen = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedViewType, setSelectedViewType] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [availableYears] = useState<number[]>([currentYear, currentYear + 1]);

  const { getColor } = useThemeColors();

  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<AnalyticsResponse>({
    queryKey: ['analytics', selectedYear, selectedMonth, selectedViewType],
    queryFn: async (): Promise<AnalyticsResponse> => {
      try {
        const queryParams = new URLSearchParams({
          year: selectedYear.toString(),
          month: selectedMonth.toString(),
          viewType: selectedViewType,
        });

        const response = await api.get<AnalyticsResponse>(`/api/analytics?${queryParams}`);
        if (!response.status) {
          toast({
            title: 'Error',
            description: response.message,
            variant: 'destructive',
          })
        }
        return response.data as AnalyticsResponse;
      } catch (error) {
        console.error('Analytics Error:', error);
        throw error;
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const handleViewTypeChange = (newType: 'Monthly' | 'Yearly') => {
    setSelectedViewType(newType);
  };

  if (isLoading) return <LoadingState />;

  return (
    <ScrollView 
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-1">Good morning, Vijay</Text>
          <Text className="text-muted-foreground">Here's your business overview</Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  style={{ height: 54 }}
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
                        selectedViewType === type && 'bg-secondary/70'
                      )}
                    >
                      <Text>{type}</Text>
                      <Muted>View {type.toLowerCase()} analytics</Muted>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          {selectedViewType === 'Monthly' && (
            <View className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    style={{ height: 54 }}
                    variant="outline" 
                    className="w-full justify-between flex-row"
                  >
                    <Text className="text-foreground">{MONTHS[selectedMonth - 1]}</Text>
                    <ChevronDown size={18} className="text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  insets={{ left: 12, right: 12 }}
                  className="w-64 native:w-72 bg-background max-h-80"
                  style={{ overflow: 'scroll' }}
                >
                  <DropdownMenuLabel>Select Month</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup className="gap-1">
                    {MONTHS.map((month, index) => (
                      <DropdownMenuItem
                        key={month}
                        onPress={() => setSelectedMonth(index + 1)}
                        className={cn(
                          'flex-col items-start gap-1',
                          selectedMonth === index + 1 && 'bg-secondary/70'
                        )}
                      >
                        <Text>{month}</Text>
                        <Muted>View {month}'s analytics</Muted>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          )}

          <View className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button style={{ height: 54 }} variant="outline" className="w-full justify-between flex-row">
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
                  {availableYears.map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      className={cn(
                        'flex-col items-start gap-1',
                        selectedYear === year && 'bg-secondary/70'
                      )}
                    >
                      <Text>{year}</Text>
                      <Muted>View {year}'s analytics</Muted>
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
            <Text className="text-3xl font-bold text-foreground/80">
              {data?.totalCustomers ?? 0}
            </Text>
          </View>

          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground text-lg">Payment Rate</Text>
            </View>
            <Text className="text-3xl font-bold text-green-600">
              {data?.paymentRate ?? 0}%
            </Text>
          </View>
        </View>

        <View className="flex-col gap-4 mb-6">
          <View className="w-full bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Total Revenue</Text>
              <IndianRupee size={20} color={getColor('primary')} />
            </View>
            <Text className="text-2xl text-foreground/80 font-bold">
              ₹{data?.revenue ?? 0}
            </Text>
          </View>

          <View className="w-full bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Actual Profit</Text>
              <Wallet size={20} color={GREEN_COLOR} />
            </View>
            <Text className="text-2xl font-bold" style={{ color: GREEN_COLOR }}>
              ₹{data?.profit ?? 0}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">New Customers</Text>
              <Users size={20} color={GREEN_COLOR} />
            </View>
            <Text className="text-2xl font-bold text-green-600">
              +{data?.customerMovement.new || 0}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              This {selectedViewType.toLowerCase()}
            </Text>
          </View>

          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Left Customers</Text>
              <Users size={20} color={getColor('destructive')} />
            </View>
            <Text className="text-2xl font-bold text-destructive">
              -{data?.customerMovement.deleted || 0}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              This {selectedViewType.toLowerCase()}
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-4">
          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Total Debt</Text>
              <TrendingUp size={20} color={getColor('destructive')} />
            </View>
            <Text className="text-2xl font-bold text-destructive">
              ₹{data?.totalDebt ?? 0}
            </Text>
          </View>

          <View className="flex-1 min-w-[160px] bg-card p-4 rounded-2xl border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted-foreground">Total Advance</Text>
              <Wallet size={20} color="green" />
            </View>
            <Text className="text-2xl font-bold text-green-600">
              ₹{data?.totalAdvance ?? 0}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;

