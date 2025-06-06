import { eq, asc, desc, and, isNull, like } from 'drizzle-orm';
import { z } from 'zod';
import { customers, payments, monthPayments, plans } from '../database/schema';
import type { Database } from '../database';
import { success, error } from '../utils/response';
import { CreateBillRequest } from '../utils/types';
import {
  generateMonthlyPayments,
  dateToTimestamp,
  toISOString,
  formatDates,
} from '../utils/helpers';

const billSchema = z.object({
  customerId: z.string(),
  year: z.number().optional(),
  monthlyAmount: z.number().optional().default(310),
  startMonth: z.number().min(1).max(12),
  endMonth: z.number().min(1).max(12).optional(),
  amount: z.number(),
  paidVia: z.string().optional().default('Cash'),
  paymentDate: z.string().datetime().optional(),
  wasOff: z.boolean().optional().default(false),
  note: z.string().optional(),
});

function formatBill(bill: any): any {
  if (bill.updatedAt) bill.updatedAt = toISOString(bill.updatedAt);
  if (bill.createdAt) bill.createdAt = toISOString(bill.createdAt);
  if (bill.paymentDate) bill.paymentDate = toISOString(bill.paymentDate);

  if (bill.months) {
    bill.months = bill.months.map(formatBill);
  }
  if (bill.customer) {
    bill.customer.registerAt = toISOString(bill.customer.registerAt, false);
  }
  return bill;
}

export const createBill = async (db: Database, data: unknown) => {
  try {
    const validatedData = billSchema.parse(data);

    const {
      customerId,
      monthlyAmount = 310,
      startMonth,
      wasOff = false,
    } = validatedData;

    const isOff = wasOff;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const year =
      validatedData.year ??
      (startMonth < currentMonth ? currentYear + 1 : currentYear);
    const endMonth = validatedData.endMonth || startMonth;
    const numberOfMonths = endMonth - startMonth + 1;

    const customer = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, customerId), isNull(customers.deletedAt)))
      .limit(1);

    if (!customer[0]) {
      return error('Customer not found');
    }

    const totalMonthlyAmount = monthlyAmount * numberOfMonths;
    const minimumRequiredAmount =
      monthlyAmount === 310
        ? Math.max(100 * numberOfMonths, Math.floor(totalMonthlyAmount * 0.3))
        : Math.floor(totalMonthlyAmount * 0.3);

    if (!isOff && validatedData.amount < minimumRequiredAmount) {
      return error(
        `Invalid payment amount. Minimum required amount for ${numberOfMonths} month(s) is ${minimumRequiredAmount}`
      );
    }

    let availableAdvance = 0;
    let existingDebt = 0;

    const customerPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.customerId, customerId))
      .orderBy(desc(payments.year));

    if (customerPayments.length > 0) {
      for (const payment of customerPayments) {
        const months = await db
          .select()
          .from(monthPayments)
          .where(eq(monthPayments.paymentId, payment.id))
          .orderBy(desc(monthPayments.month));

        if (months.length > 0) {
          availableAdvance = months[0].advance;
          existingDebt = months[0].debt;
          break;
        }
      }
    }

    let processedMonths;
    const paymentTimestamp = validatedData.paymentDate
      ? dateToTimestamp(new Date(validatedData.paymentDate))
      : dateToTimestamp(new Date());

    if (isOff) {
      const now = Math.floor(Date.now() / 1000);
      processedMonths = Array.from({ length: numberOfMonths }, (_, index) => ({
        month: startMonth + index,
        amount: 0,
        paidVia: validatedData.paidVia,
        paymentDate: paymentTimestamp,
        note: validatedData.note,
        status: 'Off',
        advance: availableAdvance,
        debt: existingDebt,
        createdAt: now,
      }));
    } else {
      processedMonths = generateMonthlyPayments(
        startMonth,
        endMonth,
        monthlyAmount,
        validatedData.amount,
        validatedData.paidVia,
        paymentTimestamp,
        validatedData.note,
        existingDebt,
        availableAdvance
      );
    }

    const paymentResult = await db
      .insert(payments)
      .values({
        customerId,
        year,
        totalDebt: processedMonths.reduce(
          (sum, month) => sum + (month.debt || 0),
          0
        ),
        totalAdvance: processedMonths.reduce(
          (sum, month) => sum + (month.advance || 0),
          0
        ),
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .returning();

    if (!paymentResult[0]) {
      return error('Failed to create payment');
    }

    const paymentId = paymentResult[0].id;

    for (const month of processedMonths) {
      await db.insert(monthPayments).values({
        ...month,
        paymentId,
      });
    }

    const createdMonths = await db
      .select()
      .from(monthPayments)
      .where(eq(monthPayments.paymentId, paymentId))
      .orderBy(asc(monthPayments.month));

    const payment = {
      ...paymentResult[0],
      months: createdMonths,
    };

    return success(formatDates(payment), 'Payment created successfully');
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return error('Validation failed', err.errors);
    }
    return error('Error creating bill', { message: err.message });
  }
};

export const getCustomerBills = async (
  db: Database,
  customerId: string,
  year?: number
) => {
  try {
    const whereCondition = year
      ? and(eq(payments.customerId, customerId), eq(payments.year, year))
      : eq(payments.customerId, customerId);

    const bills = await db
      .select()
      .from(payments)
      .where(whereCondition)
      .orderBy(desc(payments.year));

    const billsWithMonths = [];

    for (const bill of bills) {
      const months = await db
        .select()
        .from(monthPayments)
        .where(eq(monthPayments.paymentId, bill.id))
        .orderBy(asc(monthPayments.month));

      billsWithMonths.push({
        ...bill,
        months,
      });
    }

    return success(formatDates(billsWithMonths), 'Bills fetched successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error fetching bills', { message: err.message });
  }
};

export const getAllTransactions = async (db: Database) => {
  try {
    const allPayments = await db
      .select({
        id: payments.id,
        customerId: payments.customerId,
        year: payments.year,
        totalDebt: payments.totalDebt,
        totalAdvance: payments.totalAdvance,
        updatedAt: payments.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          address: customers.address,
          phone: customers.phone,
          stdId: customers.stdId,
          customerId: customers.customerId,
          registerAt: customers.registerAt,
        },
      })
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(isNull(customers.deletedAt))
      .orderBy(desc(payments.year), desc(payments.updatedAt));

    const transactionsWithDetails = [];

    for (const payment of allPayments) {
      const months = await db
        .select()
        .from(monthPayments)
        .where(eq(monthPayments.paymentId, payment.id))
        .orderBy(asc(monthPayments.month));

      transactionsWithDetails.push({
        ...payment,
        months,
      });
    }

    return success(
      formatDates(transactionsWithDetails),
      'Transactions fetched successfully'
    );
  } catch (err: any) {
    console.error(err);
    return error('Error fetching transactions', { message: err.message });
  }
};

export const getRecentTransactions = async (db: Database) => {
  try {
    const recentPayments = await db
      .select({
        id: payments.id,
        customerId: payments.customerId,
        year: payments.year,
        totalDebt: payments.totalDebt,
        totalAdvance: payments.totalAdvance,
        updatedAt: payments.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          address: customers.address,
          phone: customers.phone,
          stdId: customers.stdId,
          customerId: customers.customerId,
          registerAt: customers.registerAt,
        },
      })
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(isNull(customers.deletedAt))
      .orderBy(desc(payments.updatedAt))
      .limit(15);

    const transactionsWithDetails = [];

    for (const payment of recentPayments) {
      const months = await db
        .select()
        .from(monthPayments)
        .where(eq(monthPayments.paymentId, payment.id))
        .orderBy(asc(monthPayments.month));

      transactionsWithDetails.push({
        ...payment,
        months,
      });
    }

    return success(
      formatDates(transactionsWithDetails),
      'Recent transactions fetched successfully'
    );
  } catch (err: any) {
    console.error(err);
    return error('Error fetching recent transactions', {
      message: err.message,
    });
  }
};

// DELETE: Delete a transaction
export const deleteTransaction = async (db: Database, paymentId: string) => {
  try {
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment[0]) {
      return error('Transaction not found');
    }

    await db.delete(payments).where(eq(payments.id, paymentId));

    return success(null, 'Transaction deleted successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error deleting transaction', { message: err.message });
  }
};

export const createPlan = async (
  db: Database,
  amount: number,
  profit: number
) => {
  try {
    const result = await db
      .insert(plans)
      .values({ amount, profit })
      .returning();

    return success(formatDates(result[0]), 'Plan created successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error creating plan', { message: err.message });
  }
};

export const getPlans = async (db: Database) => {
  try {
    const allPlans = await db.select().from(plans);

    return success(formatDates(allPlans), 'Plans fetched successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error fetching plans', { message: err.message });
  }
};

export const updatePlan = async (
  db: Database,
  id: string,
  amount: number,
  profit: number
) => {
  try {
    const result = await db
      .update(plans)
      .set({ amount, profit })
      .where(eq(plans.id, id))
      .returning();

    if (!result[0]) {
      return error('Plan not found');
    }

    return success(formatDates(result[0]), 'Plan updated successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error updating plan', { message: err.message });
  }
};

export const deletePlan = async (db: Database, id: string) => {
  try {
    const result = await db.delete(plans).where(eq(plans.id, id)).returning();

    if (!result[0]) {
      return error('Plan not found');
    }

    return success(null, 'Plan deleted successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error deleting plan', { message: err.message });
  }
};
