import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  useTheme,
  type ParamListBase,
  type TabNavigationState,
} from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { getColor } from '~/lib/utils';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function MaterialTopTabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View className="flex-1 mt-10 bg-background">
      <View className="flex-row items-center p-4 border-b border-border/50">
        <Pressable
          className="mr-6 bg-background border border-border rounded-full p-3"
          onPress={() => router.back()}
          android_ripple={{
            color: getColor('primary'),
            borderless: true,
            radius: 20,
          }}
        >
          <ChevronLeft color={getColor('secondary-foreground')} size={24} />
        </Pressable>
        <View>
          <Text className="text-lg font-medium">{params.name}</Text>
          <Text className="text-muted-foreground">{params.address}</Text>
        </View>
      </View>

      <MaterialTopTabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: getColor('primary'),
          tabBarInactiveTintColor: getColor('muted-foreground'),
          tabBarLabelStyle: {
            fontSize: 14,
            textTransform: 'capitalize',
            fontWeight: '600',
          },
          tabBarIndicatorStyle: {
            backgroundColor: getColor('primary'),
            height: 3,
          },
          tabBarStyle: {
            backgroundColor: getColor('background'),
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: getColor('border'),
          },
          tabBarItemStyle: {
            width: 'auto',
            paddingHorizontal: 16,
          },
          tabBarScrollEnabled: false,
          swipeEnabled: true,
          animationEnabled: true,
          lazy: false,
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Customer Details',
          }}
        />
        <MaterialTopTabs.Screen
          name="form"
          options={{
            title: 'Make Entry',
          }}
        />
        <MaterialTopTabs.Screen
          name="history"
          options={{
            title: 'Monthly Report',
          }}
        />
      </MaterialTopTabs>
      {/* <PortalHost /> */}

    </View>
  );
}
