import type { D1Database } from '@cloudflare/workers-types';
import type { Database } from '../database';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  users,
  customers,
  payments,
  monthPayments,
  transactions,
  plans,
} from '../database/schema';

export type Bindings = {
  DB: D1Database;
};

export type Variables = {
  db: Database;
};

export type AppType = {
  Bindings: Bindings;
  Variables: Variables;
};

// Drizzle inferred types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;

export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

export type MonthPayment = InferSelectModel<typeof monthPayments>;
export type NewMonthPayment = InferInsertModel<typeof monthPayments>;

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export type Plan = InferSelectModel<typeof plans>;
export type NewPlan = InferInsertModel<typeof plans>;

export interface CreateCustomerRequest {
  name: string;
  address: string;
  phone: string;
  customerId: string;
  stdId?: string;
  notes?: string;
}

export interface CreateBillRequest {
  customerId: string;
  year?: number;
  monthlyAmount?: number;
  startMonth: number;
  endMonth?: number;
  amount: number;
  paidVia?: string;
  paymentDate?: string; // ISO String
  wasOff?: boolean;
  note?: string;
}

export type MonthlyBillStatus =
  | 'Paid'
  | 'Partially Paid'
  | 'Advance Paid'
  | 'Unpaid'
  | 'Off';

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

// Extended types with related data
export interface CustomerWithRelations extends Customer {
  payments?: (Payment & {
    months: MonthPayment[];
  })[];
  billSummary?: {
    totalPaid: number;
    totalDebt: number;
    totalAdvance: number;
  };
}

export interface PaymentWithRelations extends Payment {
  customer: Customer;
  months: MonthPayment[];
}

export interface TransactionWithRelations extends Transaction {
  customer: Customer;
  payment?: Payment;
  monthPayment?: MonthPayment;
}
