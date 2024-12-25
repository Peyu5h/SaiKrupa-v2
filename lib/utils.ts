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
    background: isDarkColorScheme ? '#1A1A1A' : '#FFFFFF',
    foreground: isDarkColorScheme ? '#FFFFFF' : '#1A1A1A',
    card: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    'card-foreground': isDarkColorScheme ? '#FFFFFF' : '#1A1A1A',
    popover: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    'popover-foreground': isDarkColorScheme ? '#FFFFFF' : '#1A1A1A',
    primary: isDarkColorScheme ? 'hsl(207 90% 27%)' : 'hsl(214 87% 25%)',
    'primary-foreground': isDarkColorScheme ? 'hsl(207 9% 96.35%)' : 'hsl(214 1.74% 92.5%)',
    secondary: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    'secondary-foreground': isDarkColorScheme ? '#FFFFFF' : '#1A1A1A',
    muted: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    'muted-foreground': isDarkColorScheme ? '#666666' : '#999999',
    accent: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    'accent-foreground': isDarkColorScheme ? '#FFFFFF' : '#1A1A1A',
    destructive: isDarkColorScheme ? '#FF4444' : '#FF0000',
    'destructive-foreground': isDarkColorScheme ? '#FFFFFF' : '#FFFFFF',
    border: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    input: isDarkColorScheme ? '#2A2A2A' : '#F0F0F0',
    ring: isDarkColorScheme ? 'hsl(207 90% 27%)' : 'hsl(214 87% 25%)',
  };

  return colors[variable as keyof typeof colors] || variable;
}

export const useThemedColor = (colorName: string) => {
  const colorScheme = useColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  return getColor(colorName);
};
