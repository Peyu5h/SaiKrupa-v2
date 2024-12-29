export interface CreateCustomerRequest {
  name: string;
  address: string;
  phone: string;
  customerId: string; // Revert back from customerCode
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
