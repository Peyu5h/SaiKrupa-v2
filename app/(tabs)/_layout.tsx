import '~/global.css';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, Tabs } from 'expo-router';
import * as React from 'react';
import { Platform, View, Pressable, ViewStyle } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { cn } from '~/lib/utils';

import { Ionicons } from '@expo/vector-icons';

import {
  HomeIcon,
  HomeOutlineIcon,
  AnalysisIcon,
  HistoryIcon,
  SettingsIcon,
  AnalysisOutlineIcon,
  HistoryOutlineIcon,
  SettingsOutlineIcon,
} from '~/components/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const COLORS = {
  primary: {
    light: 'hsl(214 87% 25%)',
    dark: 'hsl(207 90% 27%)',
  },
  primaryForeground: {
    light: 'hsl(214 1.74% 92.5%)',
    dark: 'hsl(207 9% 96.35%)',
  },
  background: {
    light: '#FFFFFF',
    dark: '#1A1A1A',
  },
  inactive: {
    light: '#999999',
    dark: '#666666',
  },
  searchBg: {
    light: '#F0F0F0',
    dark: '#2A2A2A',
  },
};

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (Platform.OS === 'web') {
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <SafeAreaView className={cn('flex-1 bg-background', isDarkColorScheme ? 'dark' : '')}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          //   headerRight: () => <ThemeToggle />,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 65,
            elevation: 0,
            position: 'absolute',
            left: 16,
            right: 16,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            borderTopWidth: 0,
            backgroundColor: COLORS.background[isDarkColorScheme ? 'dark' : 'light'],
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            paddingHorizontal: 16,
          },
          tabBarBackground: () => (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: COLORS.searchBg[isDarkColorScheme ? 'dark' : 'light'],
              }}
            />
          ),
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            // borderTopWidth: 1,
            // borderTopColor: COLORS.searchBg[isDarkColorScheme ? 'dark' : 'light'],
          },

          tabBarActiveTintColor: COLORS.primary[isDarkColorScheme ? 'dark' : 'light'],
          tabBarInactiveTintColor: COLORS.inactive[isDarkColorScheme ? 'dark' : 'light'],
          tabBarButton: (props) => (
            <Pressable {...props} style={({ pressed }) => [props.style, { opacity: 0 }]} />
          ),
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="+not-found"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
          }}
        />

        <Tabs.Screen
          name="(detailsPage)"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color }) =>
              focused ? (
                <HomeIcon size={28} color={color} />
              ) : (
                <HomeOutlineIcon size={28} color={color} />
              ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{
                  color: COLORS.primary[isDarkColorScheme ? 'dark' : 'light'],
                  borderless: true,
                  radius: 28,
                }}
                style={({ pressed }) => [
                  props.style,
                  {
                    opacity: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="history/index"
          options={{
            title: 'History',
            tabBarIcon: ({ focused, color }) => (
              // focused ? (
              <HistoryIcon size={28} color={color} />
              // ) : (
              //   <HistoryOutlineIcon size={28} color={color} />
              // ),
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{
                  color: COLORS.primary[isDarkColorScheme ? 'dark' : 'light'],
                  borderless: true,
                  radius: 28,
                }}
                style={({ pressed }) => [
                  props.style,
                  {
                    opacity: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search/index"
          options={{
            title: 'Search',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={{
                  position: 'absolute',
                  top: -44,
                  backgroundColor: focused
                    ? COLORS.primary[isDarkColorScheme ? 'dark' : 'light']
                    : COLORS.searchBg[isDarkColorScheme ? 'dark' : 'light'],
                  padding: 16,
                  height: 62,
                  width: 62,
                  borderRadius: 31,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: focused
                    ? COLORS.primary[isDarkColorScheme ? 'dark' : 'light']
                    : '#000',
                  shadowOffset: {
                    width: 0,
                    height: focused ? 8 : 4,
                  },
                  shadowOpacity: focused ? 0.4 : 0.1,
                  shadowRadius: focused ? 12 : 8,
                  elevation: focused ? 8 : 4,
                  transform: [{ scale: focused ? 1 : 1 }],
                }}
              >
                <Ionicons
                  name="search"
                  size={28}
                  color={
                    focused
                      ? COLORS.primaryForeground[isDarkColorScheme ? 'dark' : 'light']
                      : COLORS.primary[isDarkColorScheme ? 'dark' : 'light']
                  }
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="analytics/index"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ focused, color }) =>
              focused ? (
                <AnalysisIcon size={28} color={color} />
              ) : (
                <AnalysisOutlineIcon size={28} color={color} />
              ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{
                  color: COLORS.primary[isDarkColorScheme ? 'dark' : 'light'],
                  borderless: true,
                  radius: 28,
                }}
                style={({ pressed }) => [
                  props.style,
                  {
                    opacity: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused, color }) =>
              focused ? (
                <SettingsIcon size={28} color={color} />
              ) : (
                <SettingsOutlineIcon size={28} color={color} />
              ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                android_ripple={{
                  color: COLORS.primary[isDarkColorScheme ? 'dark' : 'light'],
                  borderless: true,
                  radius: 28,
                }}
                style={({ pressed }) => [
                  props.style,
                  {
                    opacity: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
