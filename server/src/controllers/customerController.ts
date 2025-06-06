import { eq, and, desc, asc, isNull, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { customers, payments, monthPayments } from '../database/schema';
import type { Database } from '../database';
import { success, error } from '../utils/response';
import { CustomerWithRelations, CreateCustomerRequest } from '../utils/types';
import { getCurrentDate, formatDates } from '../utils/helpers';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  stdId: z.string().optional(),
  notes: z.string().optional(),
});

export const createCustomer = async (db: Database, data: unknown) => {
  try {
    const validatedData = customerSchema.parse(data) as CreateCustomerRequest;

    const existingCustomer = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.customerId, validatedData.customerId))
      .limit(1);

    if (existingCustomer.length > 0) {
      return error('Customer ID already exists');
    }

    const formattedRegisterAt = getCurrentDate();

    const result = await db
      .insert(customers)
      .values({
        name: validatedData.name,
        address: validatedData.address,
        phone: validatedData.phone,
        stdId: validatedData.stdId,
        customerId: validatedData.customerId,
        registerAt: formattedRegisterAt,
      })
      .returning();

    return success(formatDates(result[0]), 'Customer created successfully');
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return error('Validation failed', err.errors);
    }
    return error('Error creating customer', { message: err.message });
  }
};

const processBatches = async <T, R>(
  items: T[],
  batchSize: number,
  processBatch: (batch: T[]) => Promise<R[]>
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
  }

  return results;
};

export const getAllCustomers = async (db: Database) => {
  try {
    console.time('getAllCustomers');

    const customersList = await db
      .select()
      .from(customers)
      .where(isNull(customers.deletedAt))
      .orderBy(asc(customers.name));

    if (customersList.length === 0) {
      console.timeEnd('getAllCustomers');
      return success([], 'No customers found');
    }

    const customersWithData: CustomerWithRelations[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < customersList.length; i += BATCH_SIZE) {
      const customerBatch = customersList.slice(i, i + BATCH_SIZE);

      const customerIds = customerBatch.map((c) => c.id);

      const allPayments = await db
        .select()
        .from(payments)
        .where(inArray(payments.customerId, customerIds))
        .orderBy(desc(payments.year));

      const paymentsByCustomerId = new Map<
        string,
        (typeof payments.$inferSelect)[]
      >();
      for (const payment of allPayments) {
        if (!paymentsByCustomerId.has(payment.customerId)) {
          paymentsByCustomerId.set(payment.customerId, []);
        }
        paymentsByCustomerId.get(payment.customerId)!.push(payment);
      }

      for (const customer of customerBatch) {
        const customerPayments = paymentsByCustomerId.get(customer.id) || [];
        const paymentsWithMonths = [];
        let totalPaid = 0;
        let totalDebt = 0;
        let totalAdvance = 0;

        for (const payment of customerPayments) {
          const months = await db
            .select()
            .from(monthPayments)
            .where(eq(monthPayments.paymentId, payment.id))
            .orderBy(asc(monthPayments.month));

          totalDebt += payment.totalDebt;
          totalAdvance += payment.totalAdvance;

          for (const month of months) {
            totalPaid += month.amount;
          }

          paymentsWithMonths.push({
            ...payment,
            months,
          });
        }

        customersWithData.push({
          ...customer,
          payments: paymentsWithMonths,
          billSummary: {
            totalPaid,
            totalDebt,
            totalAdvance,
          },
        });
      }
    }

    console.timeEnd('getAllCustomers');

    return success(
      formatDates(customersWithData),
      'Customers fetched successfully'
    );
  } catch (err: any) {
    console.error(err);
    return error('Error fetching customers', { message: err.message });
  }
};

export const getCustomerById = async (
  db: Database,
  id: string,
  year?: number
) => {
  try {
    console.time('getCustomerById');

    const customer = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), isNull(customers.deletedAt)))
      .limit(1);

    if (!customer[0]) {
      console.timeEnd('getCustomerById');
      return error('Customer not found');
    }

    const customerPayments = await db
      .select()
      .from(payments)
      .where(
        year
          ? and(eq(payments.customerId, id), eq(payments.year, year))
          : eq(payments.customerId, id)
      )
      .orderBy(desc(payments.year));

    const paymentsWithMonths = [];
    let totalPaid = 0;
    let totalDebt = 0;
    let totalAdvance = 0;

    const paymentsByYear: Array<{
      year: number;
      monthlyBreakdown: Array<typeof monthPayments.$inferSelect>;
    }> = [];

    for (const payment of customerPayments) {
      const months = await db
        .select()
        .from(monthPayments)
        .where(eq(monthPayments.paymentId, payment.id))
        .orderBy(asc(monthPayments.month));

      totalDebt += payment.totalDebt;
      totalAdvance += payment.totalAdvance;

      for (const month of months) {
        totalPaid += month.amount;
      }

      paymentsWithMonths.push({
        ...payment,
        months,
      });

      const existingYear = paymentsByYear.find((p) => p.year === payment.year);

      if (existingYear) {
        existingYear.monthlyBreakdown.push(...months);
      } else {
        paymentsByYear.push({
          year: payment.year,
          monthlyBreakdown: months,
        });
      }
    }

    const billSummary = {
      totalPaid,
      totalDebt,
      totalAdvance,
      paymentHistory: paymentsByYear,
    };

    const customerWithData = {
      ...customer[0],
      payments: paymentsWithMonths,
      billSummary,
    };

    console.timeEnd('getCustomerById');

    return success(
      formatDates({
        customer: customerWithData,
        billSummary,
      }),
      'Customer details fetched successfully'
    );
  } catch (err: any) {
    console.error(err);
    return error('Error fetching customer', { message: err.message });
  }
};

export const updateCustomer = async (
  db: Database,
  id: string,
  data: unknown
) => {
  try {
    const validatedData = customerSchema.partial().parse(data);

    const result = await db
      .update(customers)
      .set(validatedData)
      .where(eq(customers.id, id))
      .returning();

    if (!result[0]) {
      return error('Customer not found');
    }

    return success(formatDates(result[0]), 'Customer updated successfully');
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return error('Validation failed', err.errors);
    }
    return error('Error updating customer', { message: err.message });
  }
};

export const deleteCustomer = async (db: Database, id: string) => {
  try {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer[0]) {
      return error('Customer not found');
    }

    const formattedDeleteDate = getCurrentDate();

    const result = await db
      .update(customers)
      .set({ deletedAt: formattedDeleteDate })
      .where(eq(customers.id, id))
      .returning();

    return success(formatDates(result[0]), 'Customer deleted successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error deleting customer', { message: err.message });
  }
};
