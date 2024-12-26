import '~/global.css';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, View, Pressable, ViewStyle, StyleProp } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeToggle } from '~/components/ThemeToggle';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { cn, getColor } from '~/lib/utils';
import { ReactQueryProvider } from '~/components/ReactQueryProvider';
import { ToastProvider } from '~/components/ui/toast';


const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const TAB_BAR_STYLES: ViewStyle = {
  height: 65,
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  elevation: 0,
  position: 'absolute',
  left: 16,
  right: 16,
  paddingHorizontal: 12,
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
};

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
    <ReactQueryProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <ToastProvider>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <View className={cn('flex-1 bg-background', isDarkColorScheme ? 'dark' : '')}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 200,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="detailsPage"
                options={{
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_right',
                  animationDuration: 200,
                }}
              />
            </Stack>
            <PortalHost />
          </View>
        </ToastProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
