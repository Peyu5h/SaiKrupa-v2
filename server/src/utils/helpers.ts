import { MonthlyBillStatus, NewMonthPayment } from './types';

export function getCurrentDate(): string {
  return new Date()
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');
}

export function dateToTimestamp(date: Date | undefined): number {
  return date
    ? Math.floor(date.getTime() / 1000)
    : Math.floor(new Date().getTime() / 1000);
}

export function timestampToDate(timestamp: number | null): Date | null {
  return timestamp ? new Date(timestamp * 1000) : null;
}

export function toISOString(
  value: any,
  isTimestamp: boolean = true
): string | null {
  if (value === null || value === undefined) return null;
  if (isTimestamp) {
    return new Date(value * 1000).toISOString();
  }
  const dateParts = value.split('-');
  if (dateParts.length === 3) {
    return new Date(
      `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
    ).toISOString();
  }
  return new Date(value).toISOString();
}

export function getPaymentStatus(
  paid: number,
  required: number
): MonthlyBillStatus {
  if (paid === 0) return 'Unpaid';
  if (paid < required) return 'Partially Paid';
  if (paid > required) return 'Advance Paid';
  return 'Paid';
}

export function generateMonthlyPayments(
  startMonth: number,
  endMonth: number,
  monthlyAmount: number,
  amount: number,
  paidVia?: string,
  paymentTimestamp: number = dateToTimestamp(new Date()),
  note?: string,
  initialDebt: number = 0,
  initialAdvance: number = 0
): Omit<NewMonthPayment, 'paymentId' | 'id'>[] {
  const months: Omit<NewMonthPayment, 'paymentId' | 'id'>[] = [];
  let currentDebt = initialDebt;
  let currentAdvance = initialAdvance;
  let remainingAmount = amount;
  const now = Math.floor(Date.now() / 1000);

  for (let month = startMonth; month <= endMonth; month++) {
    const isLastMonth = month === endMonth;
    let monthAmount = isLastMonth
      ? remainingAmount
      : Math.min(monthlyAmount, remainingAmount);

    remainingAmount -= monthAmount;

    const effectiveAmount = monthAmount + currentAdvance;

    if (effectiveAmount >= monthlyAmount) {
      const extraAmount = effectiveAmount - monthlyAmount;
      currentAdvance = extraAmount;
      currentDebt = 0;
    } else {
      currentDebt = monthlyAmount - effectiveAmount;
      currentAdvance = 0;
    }

    months.push({
      month,
      amount: monthAmount,
      paidVia,
      paymentDate: paymentTimestamp,
      debt: currentDebt,
      advance: currentAdvance,
      status: getPaymentStatus(effectiveAmount, monthlyAmount),
      note,
      createdAt: now,
    });
  }

  return months;
}

export function formatDates<T>(data: T): T {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => formatDates(item)) as T;
  }

  const newData: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as any)[key];
      if (typeof value === 'object' && value !== null) {
        newData[key] = formatDates(value);
      } else {
        switch (key) {
          case 'createdAt':
          case 'updatedAt':
          case 'paymentDate':
            newData[key] = value ? toISOString(value) : null;
            break;
          case 'registerAt':
          case 'deletedAt':
            newData[key] = value ? toISOString(value, false) : null;
            break;
          default:
            newData[key] = value;
        }
      }
    }
  }
  return newData as T;
}
