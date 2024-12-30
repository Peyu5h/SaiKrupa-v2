import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const colorTokens = {
  light: {
    background: '#F8FAFC',
    foreground: '#0F172A',
    card: '#FFFFFF',
    'card-foreground': '#0F172A',
    popover: '#FFFFFF',
    'popover-foreground': '#0F172A',
    primary: '#2563e6',
    'primary-foreground': '#FFFFFF',
    secondary: '#F1F5F9',
    'secondary-foreground': '#0F172A',
    muted: '#F1F5F9',
    'muted-foreground': '#64748B',
    accent: '#F8FAFC',
    'accent-foreground': '#0F172A',
    destructive: '#DC2626',
    'destructive-foreground': '#FFFFFF',
    border: '#E2E8F0',
    input: '#F1F5F9',
    ring: '#1E40AF',
  },
  dark: {
    background: '#1A1A1A',
    foreground: '#FFFFFF',
    card: '#2A2A2A',
    'card-foreground': '#FFFFFF',
    popover: '#2A2A2A',
    'popover-foreground': '#FFFFFF',
    primary: 'hsl(207 90% 27%)',
    'primary-foreground': 'hsl(207 9% 96.35%)',
    secondary: '#2A2A2A',
    'secondary-foreground': '#FFFFFF',
    muted: '#2A2A2A',
    'muted-foreground': '#666666',
    accent: '#2A2A2A',
    'accent-foreground': '#FFFFFF',
    destructive: '#FF4444',
    'destructive-foreground': '#FFFFFF',
    border: '#2A2A2A',
    input: '#2A2A2A',
    ring: 'hsl(207 90% 27%)',
  },
};

export function useThemeColors() {
  const colorScheme = useColorScheme();
  const colors = useMemo(() => colorTokens[colorScheme === 'dark' ? 'dark' : 'light'], [colorScheme]);
  
  const getColor = useMemo(() => 
    (variable: keyof typeof colorTokens.light) => colors[variable] || variable,
    [colors]
  );
  
  return { getColor };
}


