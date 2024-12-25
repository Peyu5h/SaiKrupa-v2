import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager, focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: Infinity,
    },
  },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    return onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
      });
    });
  }, []);
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });

    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
