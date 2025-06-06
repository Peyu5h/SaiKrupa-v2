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
  const colors = useMemo(
    () => colorTokens[colorScheme === 'dark' ? 'dark' : 'light'],
    [colorScheme]
  );

  const getColor = useMemo(
    () => (variable: keyof typeof colorTokens.light) => colors[variable] || variable,
    [colors]
  );

  return { getColor };
}

export function formatDateDMY(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export interface CreateCustomerRequest {
  name: string;
  address: string;
  phone: string;
  customerId: string;
  stdId?: string;
  notes?: string;
}

export interface MonthPayment {
  month: number;
  amount: number;
  paidVia?: string;
  paymentDate?: Date;
  status: 'Paid' | 'Partially Paid' | 'Advance Paid' | 'Unpaid' | 'Off';
  debt: number;
  advance: number;
  note?: string;
}

export interface CreateBillRequest {
  customerId: string;
  year?: number;
  monthlyAmount?: number;
  startMonth: number;
  endMonth?: number;
  amount: number;
  paidVia?: string;
  paymentDate?: Date;
  wasOff?: boolean;
}

export interface MonthlyBillStatus extends MonthPayment {
  debt: number;
  advance: number;
}

export interface Payment {
  id: string;
  customerId: string;
  year: number;
  totalDebt: number;
  totalAdvance: number;
  updatedAt: string;
  months: Array<{
    id: string;
    paymentId: string;
    month: number;
    amount: number;
    paidVia: string;
    debt: number;
    advance: number;
    paymentDate: string;
    status: 'Paid' | 'Partially Paid' | 'Advance Paid' | 'Unpaid' | 'Off';
    note: string | null;
    createdAt: string;
  }>;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  stdId: string;
  customerId: string;
  registerAt: string;
  payments: Payment[];
  billSummary?: {
    totalPaid: number;
    totalDebt: number;
    totalAdvance: number;
  };
}

export interface BillSummary {
  totalPaid: number;
  totalDebt: number;
  totalAdvance: number;
  paymentHistory: Array<{
    year: number;
    monthlyBreakdown: Array<MonthPayment>;
  }>;
}

export interface CustomerDetailsResponse {
  status: boolean;
  message: string;
  customer: Customer;
  billSummary: {
    totalPaid: number;
    totalDebt: number;
    totalAdvance: number;
    paymentHistory: Array<{
      year: number;
      monthlyBreakdown: Array<{
        month: number;
        amount: number;
        paidVia?: string;
        paymentDate?: Date;
        status: 'Paid' | 'Partially Paid' | 'Advance Paid' | 'Unpaid' | 'Off';
        debt: number;
        advance: number;
        note?: string;
      }>;
    }>;
  };
}

export interface AnalyticsResponse {
  status: boolean;
  message: string;

  totalCustomers: number;
  customerMovement: {
    new: number;
    deleted: number;
  };
  revenue: number;
  profit: number;
  paymentMethods: Record<string, number>;
  totalDebt: number;
  totalAdvance: number;
  paymentRate: number;
}

export interface Plan {
  id: string;
  monthlyAmount: number;
  profitPerHead: number;
}

export interface TransactionCardProps {
  name: string;
  date: string;
  amount: number;
  paymentMethod: string;
  onDelete?: () => void;
}

export interface CustomerCardProps {
  id: string;
  name: string;
  address: string;
  stb: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Partially Paid' | 'Advance Paid' | 'Unpaid' | 'Off';
  debt: number;
  advance: number;
  isPending?: boolean;
  payments: Payment[];
}

export interface MonthlyPayment {
  month: number;
  amount: number;
  paidVia: string;
  status: string;
  debt?: number;
  advance?: number;
  paymentDate: string;
  note?: string | null;
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface TransactionMonth {
  id: string;
  paymentId: string;
  month: number;
  amount: number;
  paidVia: string;
  debt: number;
  advance: number;
  paymentDate: string;
  status: string;
  note: string | null;
}

export interface Transaction {
  id: string;
  customerId: string;
  year: number;
  totalDebt: number;
  totalAdvance: number;
  customer: {
    id: string;
    name: string;
    address: string;
    phone: string;
    stdId: string;
    customerId: string;
    registerAt: string;
  };
  months: TransactionMonth[];
}

export interface ApiResponse {
  status: boolean;
  message: string;
  data: Transaction[];
}
