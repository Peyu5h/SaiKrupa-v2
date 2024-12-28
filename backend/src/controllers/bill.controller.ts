import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { CreateBillRequest, MonthPayment, MonthlyBillStatus } from '../utils/types.js';
import { generateMonthlyPayments } from '../utils/utils.js';

export const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      monthlyAmount = 310,
      startMonth,
      endMonth,
      amount,
      paidVia = 'Cash',
      paymentDate = new Date(),
      wasOff = false,
    } = req.body as CreateBillRequest;

    const isOff = wasOff;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const year = req.body.year ?? (startMonth < currentMonth ? currentYear + 1 : currentYear);
    const finalEndMonth = endMonth || startMonth;
    const numberOfMonths = finalEndMonth - startMonth + 1;
    const totalMonthlyAmount = monthlyAmount * numberOfMonths;
    const minimumRequiredAmount = monthlyAmount === 310 
      ? Math.max(200 * numberOfMonths, Math.floor(totalMonthlyAmount * 0.65))
      : Math.floor(totalMonthlyAmount * 0.95);

    if (!isOff && amount < minimumRequiredAmount) {
      res.status(400).json({
        status: false,
        message: `Invalid payment amount. Minimum required amount for ${numberOfMonths} month(s) is ${minimumRequiredAmount}`,
      });
      return;
    }

    const isCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!isCustomer) {
      res.status(404).json({
        status: false,
        message: 'Customer not found',
      });
      return;
    }

    const existingMonthPayments = await prisma.payment.findMany({
      where: {
        customerId,
        year,
        months: {
          some: {
            month: {
              gte: startMonth,
              lte: finalEndMonth,
            },
          },
        },
      },
      include: {
        months: true,
      },
    });

    if (existingMonthPayments.length > 0) {
      res.status(400).json({
        status: false,
        message: `Payment already exist`,
      });
      return;
    }

    const customerPayments = await prisma.payment.findMany({
      where: {
        customerId,
        year,
      },
      include: {
        months: {
          orderBy: { month: 'asc' },
        },
      },
    });

    let availableAdvance = 0;
    let existingDebt = 0;

    if (customerPayments.length > 0) {
      const lastPayment = customerPayments[customerPayments.length - 1];
      const lastMonth = lastPayment.months[lastPayment.months.length - 1];
      availableAdvance = lastMonth?.advance || 0;
      existingDebt = lastMonth?.debt || 0;
    }

    let processedPaidMonths;

    if (isOff) {
      processedPaidMonths = Array.from({ length: numberOfMonths }, (_, index) => ({
        month: startMonth + index,
        amount: 0,
        paidVia,
        paymentDate,
        note: req.body.note,
        status: 'Off',
        advance: availableAdvance, //dont change existing debt/advance
        debt: existingDebt,
      }));
    } else {
      processedPaidMonths = generateMonthlyPayments(
        startMonth,
        finalEndMonth,
        monthlyAmount,
        amount,
        paidVia,
        paymentDate || new Date(),
        req.body.note,
        existingDebt,
        availableAdvance
      );
    }

    const payment = await prisma.payment.create({
      data: {
        customerId,
        year,
        totalAdvance: processedPaidMonths.reduce((sum, month) => sum + month.advance, 0),
        totalDebt: processedPaidMonths.reduce((sum, month) => sum + month.debt, 0),
        months: {
          create: processedPaidMonths,
        },
      },
      include: {
        months: {
          orderBy: { month: 'asc' },
        },
      },
    });

    res.status(201).json({
      status: true,
      message: 'Payment created successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      status: false,
      message: 'Error creating bill',
      error,
    });
  }
};

export const getCustomerBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { year } = req.query;

    const bills = await prisma.payment.findMany({
      where: {
        customerId,
        ...(year ? { year: parseInt(year as string) } : {}),
      },
      include: {
        months: {
          orderBy: { month: 'asc' },
        },
      },
      orderBy: {
        year: 'desc',
      },
    });

    res.status(200).json({
      status: true,
      message: 'Bills fetched successfully',
      data: bills,
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching bills',
      error,
    });
  }
};

export const getAllTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.payment.findMany({
      include: {
        customer: true,
        months: {
          orderBy: { month: 'asc' },
        },
      },
      orderBy: [{ year: 'desc' }, { updatedAt: 'desc' }],
    });

    res.status(200).json({
      status: true,
      message: 'Transactions fetched successfully',
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching transactions',
      error,
    });
  }
};

export const getRecentTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.payment.findMany({
      take: 15,
      include: {
        customer: true,
        months: {
          orderBy: { month: 'asc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.status(200).json({
      status: true,
      message: 'Recent transactions fetched successfully',
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching recent transactions',
      error,
    });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    // First get the payment details to identify which months to reset
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        months: true,
      },
    });

    if (!payment) {
      res.status(404).json({
        status: false,
        message: 'Transaction not found',
      });
      return;
    }

    // Use transaction to ensure all operations complete or none do
    await prisma.$transaction(async (tx) => {
      // Delete all month payments first (due to foreign key constraints)
      await tx.monthPayment.deleteMany({
        where: {
          paymentId: paymentId,
        },
      });

      // Delete the payment record
      await tx.payment.delete({
        where: {
          id: paymentId,
        },
      });
    });

    res.status(200).json({
      status: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      status: false,
      message: 'Error deleting transaction',
      error,
    });
  }
};
