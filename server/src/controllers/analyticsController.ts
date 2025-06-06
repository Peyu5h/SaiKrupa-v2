import { eq, and, inArray, ne, isNull, like, count } from 'drizzle-orm';
import { customers, payments, monthPayments, plans } from '../database/schema';
import type { Database } from '../database';
import { success, error } from '../utils/response';
import { formatDates } from '../utils/helpers';

export const getAnalytics = async (
  db: Database,
  year: number,
  month?: number,
  viewType: 'Monthly' | 'Yearly' = 'Monthly'
) => {
  try {
    const currentDate = new Date();
    const currentYear = year || currentDate.getFullYear();
    const currentMonth = month || currentDate.getMonth() + 1;

    const dateFilter =
      viewType === 'Monthly'
        ? `%-${currentMonth.toString().padStart(2, '0')}-${currentYear}`
        : `%-${currentYear}`;

    const newCustomersResult = await db
      .select({ value: count() })
      .from(customers)
      .where(like(customers.registerAt, dateFilter));

    const deletedCustomersResult = await db
      .select({ value: count() })
      .from(customers)
      .where(like(customers.deletedAt, dateFilter));

    const newCustomersCount = newCustomersResult[0]?.value || 0;
    const deletedCustomersCount = deletedCustomersResult[0]?.value || 0;

    const allPlans = await db.select().from(plans);
    const profitMap = new Map(
      allPlans.map((plan) => [plan.amount, plan.profit])
    );

    const allPayments = await db
      .select()
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(and(eq(payments.year, currentYear), isNull(customers.deletedAt)));

    const totalCustomersResult = await db
      .select({ value: count() })
      .from(customers)
      .where(isNull(customers.deletedAt));

    const totalCustomersCount = totalCustomersResult[0]?.value || 0;

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalDebt = 0;
    let totalAdvance = 0;
    const paymentMethods: Record<string, number> = {};

    for (const payment of allPayments) {
      const monthsQuery =
        viewType === 'Monthly'
          ? db
              .select()
              .from(monthPayments)
              .where(
                and(
                  eq(monthPayments.paymentId, payment.payments.id),
                  eq(monthPayments.month, currentMonth)
                )
              )
          : db
              .select()
              .from(monthPayments)
              .where(eq(monthPayments.paymentId, payment.payments.id));

      const months = await monthsQuery;

      for (const month of months) {
        const monthAmount = Number(month.amount);
        if (month.status !== 'Off' && monthAmount > 0) {
          totalRevenue += monthAmount;

          let planProfit = 0;
          if (profitMap.has(monthAmount)) {
            planProfit = profitMap.get(monthAmount) || 0;
          } else if (profitMap.size > 0) {
            const planAmounts = Array.from(profitMap.keys());
            const closestAmount = planAmounts.reduce((prev, curr) =>
              Math.abs(curr - monthAmount) < Math.abs(prev - monthAmount)
                ? curr
                : prev
            );
            planProfit = profitMap.get(closestAmount) || 0;
          }

          totalProfit += planProfit;

          if (month.paidVia) {
            paymentMethods[month.paidVia] =
              (paymentMethods[month.paidVia] || 0) + monthAmount;
          }

          totalDebt += month.debt;
          totalAdvance += month.advance;
        }
      }
    }

    const activePaymentsResult = await db
      .select({ value: count() })
      .from(monthPayments)
      .innerJoin(payments, eq(monthPayments.paymentId, payments.id))
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(
        and(
          eq(payments.year, currentYear),
          isNull(customers.deletedAt),
          viewType === 'Monthly'
            ? eq(monthPayments.month, currentMonth)
            : undefined,
          ne(monthPayments.status, 'Off')
        )
      );

    const totalActivePayments = activePaymentsResult[0]?.value || 0;

    const paidPaymentsResult = await db
      .select({ value: count() })
      .from(monthPayments)
      .innerJoin(payments, eq(monthPayments.paymentId, payments.id))
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(
        and(
          eq(payments.year, currentYear),
          isNull(customers.deletedAt),
          viewType === 'Monthly'
            ? eq(monthPayments.month, currentMonth)
            : undefined,
          inArray(monthPayments.status, ['Paid', 'Advance Paid'])
        )
      );

    const totalPaidPayments = paidPaymentsResult[0]?.value || 0;

    const paymentRate =
      totalActivePayments > 0
        ? Math.round((totalPaidPayments / totalActivePayments) * 100)
        : 0;

    return success(
      formatDates({
        totalCustomers: totalCustomersCount,
        customerMovement: {
          new: newCustomersCount,
          deleted: deletedCustomersCount,
        },
        revenue: totalRevenue,
        profit: totalProfit,
        paymentMethods,
        totalDebt,
        totalAdvance,
        paymentRate,
      }),
      'Analytics data fetched successfully'
    );
  } catch (err: any) {
    console.error(err);
    return error('Error fetching analytics data', { message: err.message });
  }
};
