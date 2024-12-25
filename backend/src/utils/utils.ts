import { CreateBillRequest, MonthlyBillStatus, MonthPayment } from './types.js';

export function getPaymentStatus(paid: number, required: number): MonthlyBillStatus['status'] {
  if (paid === 0) return 'Unpaid';
  if (paid < required) return 'Partially Paid';
  if (paid > required) return 'Advance Paid';
  return 'Paid';
}

export function distributePayment(
  startMonth: number,
  monthsCovered: number,
  monthlyAmount: number,
  totalPaid: number,
  paidVia?: string,
  paymentDate?: Date
) {
  const payments = [];
  let remainingAmount = totalPaid;

  // Distribute full payments
  for (let i = 0; i < monthsCovered; i++) {
    const month = startMonth + i;
    if (month > 12) break; // Don't exceed December

    payments.push({
      month,
      amount: monthlyAmount,
      paidVia,
      paymentDate,
      status: 'Paid',
    });
    remainingAmount -= monthlyAmount;
  }

  // Handle remaining amount if any
  if (remainingAmount > 0 && startMonth + monthsCovered <= 12) {
    payments.push({
      month: startMonth + monthsCovered,
      amount: remainingAmount,
      paidVia,
      paymentDate,
      status: remainingAmount >= monthlyAmount ? 'Paid' : 'Partially Paid',
    });
  }

  return payments;
}

export function generateMonthlyPayments(
  startMonth: number,
  endMonth: number,
  monthlyAmount: number,
  amount: number,
  paidVia?: string,
  paymentDate: Date = new Date(),
  note?: string,
  initialDebt: number = 0,
  initialAdvance: number = 0
): MonthPayment[] {
  const months: MonthPayment[] = [];
  let currentDebt = initialDebt;
  let currentAdvance = initialAdvance;
  let remainingAmount = amount;

  for (let month = startMonth; month <= endMonth; month++) {
    const isLastMonth = month === endMonth;
    let monthAmount = isLastMonth ? remainingAmount : Math.min(monthlyAmount, remainingAmount);

    remainingAmount -= monthAmount;

    const effectiveAmount = monthAmount + currentAdvance;

    if (effectiveAmount >= monthlyAmount) {
      //if we have enough with advance
      const extraAmount = effectiveAmount - monthlyAmount;
      currentAdvance = extraAmount;
      currentDebt = 0;
    } else {
      //if we dont have enough with advance
      currentDebt = monthlyAmount - effectiveAmount;
      currentAdvance = 0;
    }

    months.push({
      month,
      amount: monthAmount,
      paidVia,
      paymentDate,
      debt: currentDebt,
      advance: currentAdvance,
      status: getPaymentStatus(effectiveAmount, monthlyAmount),
      note,
    });
  }

  return months;
}
