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