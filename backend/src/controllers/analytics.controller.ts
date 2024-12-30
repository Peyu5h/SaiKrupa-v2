import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month, viewType = 'Monthly' } = req.query;
    
    const currentDate = new Date();
    const currentYear = parseInt(year as string) || currentDate.getFullYear();
    const currentMonth = parseInt(month as string) || currentDate.getMonth() + 1;

    const dateFilter = viewType === 'Monthly' 
      ? `${currentMonth.toString().padStart(2, '0')}-${currentYear}`
      : `-${currentYear}`;

    const [newCustomers, deletedCustomers] = await Promise.all([
      prisma.customer.count({
        where: {
          registerAt: {
            endsWith: dateFilter
          }
        }
      }),
      prisma.customer.count({
        where: {
          deletedAt: {
            endsWith: dateFilter
          }
        }
      })
    ]);

    const plans = await prisma.plan.findMany();
    const profitMap = new Map(plans.map(plan => [plan.amount, plan.profit]));

    const payments = await prisma.payment.findMany({
      where: {
        year: currentYear,
        months: viewType === 'Monthly' 
          ? { some: { month: currentMonth } }
          : undefined
      },
      include: {
        months: true
      }
    });

    const totalCustomers = await prisma.customer.count();

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalDebt = 0;
    let totalAdvance = 0;
    const paymentMethods: Record<string, number> = {};

    payments.forEach(payment => {
      const relevantMonths = viewType === 'Monthly'
        ? payment.months.filter(m => m.month === currentMonth)
        : payment.months;

      relevantMonths.forEach(month => {
        if (month.status !== 'Off' && month.amount > 0) {
          totalRevenue += month.amount;
          
          let planProfit = 0;
          if (profitMap.has(month.amount)) {
            planProfit = profitMap.get(month.amount) || 0;
          } else {
            const planAmounts = Array.from(profitMap.keys());
            const closestAmount = planAmounts.reduce((prev, curr) => 
              Math.abs(curr - month.amount) < Math.abs(prev - month.amount) ? curr : prev
            );
            planProfit = profitMap.get(closestAmount) || 0;
          }
          
          totalProfit += planProfit;

          if (month.paidVia) {
            paymentMethods[month.paidVia] = (paymentMethods[month.paidVia] || 0) + month.amount;
          }

          totalDebt += month.debt;
          totalAdvance += month.advance;
        }
      });
    });

    const totalActivePayments = await prisma.monthPayment.count({
      where: {
        payment: {
          year: currentYear,
        },
        ...(viewType === 'Monthly' ? { month: currentMonth } : {}),
        status: { not: 'Off' }
      }
    });

    const paidPayments = await prisma.monthPayment.count({
      where: {
        payment: {
          year: currentYear,
        },
        ...(viewType === 'Monthly' ? { month: currentMonth } : {}),
        status: { in: ['Paid', 'Advance Paid'] }
      }
    });

    const paymentRate = totalActivePayments > 0
      ? Math.round((paidPayments / totalActivePayments) * 100)
      : 0;

    const response = {
      status: true,
      message: 'Analytics data fetched successfully',
      data: {
        totalCustomers,
        customerMovement: {
          new: newCustomers,
          deleted: deletedCustomers
        },
        revenue: totalRevenue,
        profit: totalProfit,
        paymentMethods,
        totalDebt,
        totalAdvance,
        paymentRate
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 