import { View } from "react-native";
import { Text } from "../ui/text";
import { Skeleton } from "../ui/skeleton";

export const DetailsLoader = () => (
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