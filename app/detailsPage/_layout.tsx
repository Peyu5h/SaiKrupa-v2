import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { getColor } from '~/lib/utils';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function MaterialTopTabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border/50">
        <Pressable
          className="mr-6 bg-background border border-border rounded-full p-3"
          onPress={handleBack}
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

      {/* Tabs */}
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: 'grey',
          tabBarLabelStyle: {
            fontSize: 14,
            textTransform: 'capitalize',
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: colors.text,
            height: 2,
          },
          tabBarScrollEnabled: false,
          tabBarStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: 'transparent',
          },
          tabBarContentContainerStyle: {
            alignItems: 'center',
            backgroundColor: getColor('background'),
          },
          tabBarItemStyle: {
            width: undefined,
            paddingHorizontal: 0,
            borderBottomWidth: 1,
            borderBottomColor: getColor('border'),
          },
        }}
      >
        <MaterialTopTabs.Screen
          name="entry"
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
    </SafeAreaView>
  );
}
