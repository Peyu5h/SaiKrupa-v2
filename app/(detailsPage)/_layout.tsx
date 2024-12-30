import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme, type ParamListBase, type TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { Skeleton } from '~/components/ui/skeleton';
import { useCustomerDetails } from '~/hooks/useCustomerDetails';
import { useAtom } from 'jotai';
import { currentIdAtom } from '~/lib/atom';
import { useEffect, useMemo } from 'react';
import { useThemeColors } from '~/lib/utils';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function MaterialTopTabsLayout() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [_, setCurrentId] = useAtom(currentIdAtom);
  const customerId = Array.isArray(id) ? id[0] : id;
  const { getColor } = useThemeColors();

  const colors = useMemo(() => ({
    primary: getColor('primary'),
    secondaryForeground: getColor('secondary-foreground'),
    mutedForeground: getColor('muted-foreground'),
    background: getColor('background'),
    border: getColor('border'),
  }), [getColor]);

  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.mutedForeground,
    tabBarLabelStyle: {
      fontSize: 14,
      textTransform: 'capitalize',
      fontWeight: '600',
    },
    tabBarIndicatorStyle: {
      backgroundColor: colors.primary,
      height: 3,
    },
    tabBarStyle: {
      backgroundColor: colors.background,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tabBarItemStyle: {
      width: 'auto',
      paddingHorizontal: 16,
    },
    tabBarScrollEnabled: false,
    swipeEnabled: true,
    animationEnabled: true,
    lazy: false,
  };

  const rippleConfig = useMemo(() => ({
    color: colors.primary,
    borderless: true,
    radius: 20,
  }), [colors.primary]);

  useEffect(() => {
    if (customerId) {
      setCurrentId(customerId);
    }
  }, [customerId]);

  const { data, isLoading } = useCustomerDetails(customerId);

  useEffect(() => {
    if (!isLoading && !data?.customer) {
      router.back();
    }
  }, [isLoading, data]);

 
  return (
    <View className="flex-1 mt-10 bg-background">
      <View className="flex-row items-center p-4 border-b border-border/50">
        <Pressable
          className="mr-6 bg-background border border-border rounded-full p-3"
          onPress={() => router.back()}
          android_ripple={rippleConfig}
        >
          <ChevronLeft 
          color={colors.secondaryForeground} 
          size={24} />
        </Pressable>
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-medium">
            {data?.customer?.name || <Skeleton className="w-24 h-6 mb-1" />}
          </Text>
          <Text className="text-muted-foreground">
            {data?.customer?.address || <Skeleton className="w-48 h-6 mt-1" />}
          </Text>
        </View>
      </View>

      <MaterialTopTabs
        initialRouteName="index"
        screenOptions={screenOptions}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Customer Details',
          }}
        />
        <MaterialTopTabs.Screen
          name="form/index"
          options={{
            title: 'Make Entry',
          }}
        />
        <MaterialTopTabs.Screen
          name="history/index"
          options={{
            title: 'Monthly Report',
          }}
        />
      </MaterialTopTabs>
      {/* <PortalHost /> */}
    </View>
  );
}
