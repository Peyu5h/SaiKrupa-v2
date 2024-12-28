import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getColor(variable: string) {
  const colorScheme = useColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  const colors = {
    background: isDarkColorScheme ? '#1A1A1A' : '#F8FAFC',
    foreground: isDarkColorScheme ? '#FFFFFF' : '#0F172A',
    card: isDarkColorScheme ? '#2A2A2A' : '#FFFFFF',
    'card-foreground': isDarkColorScheme ? '#FFFFFF' : '#0F172A',
    popover: isDarkColorScheme ? '#2A2A2A' : '#FFFFFF',
    'popover-foreground': isDarkColorScheme ? '#FFFFFF' : '#0F172A',
    primary: isDarkColorScheme ? 'hsl(207 90% 27%)' : '#1E40AF',
    'primary-foreground': isDarkColorScheme ? 'hsl(207 9% 96.35%)' : '#FFFFFF',
    secondary: isDarkColorScheme ? '#2A2A2A' : '#F1F5F9',
    'secondary-foreground': isDarkColorScheme ? '#FFFFFF' : '#0F172A',
    muted: isDarkColorScheme ? '#2A2A2A' : '#F1F5F9',
    'muted-foreground': isDarkColorScheme ? '#666666' : '#64748B',
    accent: isDarkColorScheme ? '#2A2A2A' : '#F8FAFC',
    'accent-foreground': isDarkColorScheme ? '#FFFFFF' : '#0F172A',
    destructive: isDarkColorScheme ? '#FF4444' : '#DC2626',
    'destructive-foreground': isDarkColorScheme ? '#FFFFFF' : '#FFFFFF',
    border: isDarkColorScheme ? '#2A2A2A' : '#E2E8F0',
    input: isDarkColorScheme ? '#2A2A2A' : '#F1F5F9',
    ring: isDarkColorScheme ? 'hsl(207 90% 27%)' : '#1E40AF',
  };

  return colors[variable as keyof typeof colors] || variable;
}

export const useThemedColor = (colorName: string) => {
  const colorScheme = useColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  return getColor(colorName);
};
