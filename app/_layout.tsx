import '~/global.css';

import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { SafeAreaView, View } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { cn } from '~/lib/utils';
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

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const {  isDarkColorScheme } = useColorScheme();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Promise.all([
          // Add any initialization tasks here
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  React.useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ReactQueryProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <ToastProvider>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <SafeAreaView className={cn('flex-1 bg-background', isDarkColorScheme ? 'dark' : '')}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen options={{ animation: 'none' }} name="(tabs)" />
              <Stack.Screen
                name="(detailsPage)"
                options={{
                  presentation: 'card',
                  animation: 'slide_from_right',
                  animationDuration: 200,
                  gestureEnabled: true,
                  gestureDirection: 'horizontal',
                }}
              />
            </Stack>
            <PortalHost />
          </SafeAreaView>
        </ToastProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
