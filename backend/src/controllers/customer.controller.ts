import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address, phone, stdId, customerId, registerAt } = req.body;

    if (!name || !address || !phone || !customerId) {
      res.status(400).json({
        status: false,
        message: 'Missing required fields',
      });
      return;
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (existingCustomer) {
      res.status(400).json({
        status: false,
        message: 'Customer ID already exists',
      });
      return;
    }

    const formattedRegisterAt = registerAt || new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    const customer = await prisma.customer.create({
      data: {
        name,
        address,
        phone,
        stdId,
        customerId,
        registerAt: formattedRegisterAt,
      },
    });

    res.status(201).json({
      status: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      status: false,
      message: 'Error creating customer',
      error,
    });
  }
};
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, address, phone, stdId } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        stdId,
      },
    });

    res.status(200).json({
      status: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      status: false,
      message: 'Error updating customer',
      error,
    });
  }
};
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        status: false,
        message: 'Invalid customer ID format',
      });
      return;
    }

    const currentDate = new Date();
    const formattedDeleteDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    await prisma.customer.update({
      where: { id },
      data: {
        deletedAt: formattedDeleteDate
      }
    });

    await prisma.$transaction(async (tx) => {
      await tx.monthPayment.deleteMany({
        where: {
          payment: {
            customerId: id
          }
        }
      });

      await tx.payment.deleteMany({
        where: {
          customerId: id
        }
      });

      await tx.transaction.deleteMany({
        where: {
          customerId: id
        }
      });

      await tx.customer.delete({
        where: { id }
      });
    });

    res.status(200).json({
      status: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      status: false,
      message: 'Error deleting customer',
      error,
    });
  }
};

export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        payments: {
          include: {
            months: {
              orderBy: { month: 'asc' }
            },
          },
          orderBy: { year: 'desc' },
        },
      },
    });

    const customersWithSummary = customers.map(customer => ({
      ...customer,
      billSummary: {
        totalPaid: customer.payments.reduce(
          (sum, payment) => sum + payment.months.reduce((mSum, month) => mSum + month.amount, 0),
          0
        ),
        totalDebt: customer.payments.reduce((sum, payment) => sum + payment.totalDebt, 0),
        totalAdvance: customer.payments.reduce((sum, payment) => sum + payment.totalAdvance, 0),
      }
    }));

    res.status(200).json({
      status: true,
      message: 'Customers fetched successfully',
      data: customersWithSummary,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching customers',
      error,
    });
  }
};

export const getCustomerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    const customer = await prisma.customer.findUnique({
      where: { id: id },
      include: {
        payments: {
          where: {
            ...(year ? { year: parseInt(year as string) } : {}),
          },
          include: {
            months: {
              orderBy: { month: 'asc' },
            },
          },
          orderBy: { year: 'desc' },
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        status: false,
        message: 'Customer not found',
      });
      return;
    }

    const paymentsByYear = customer.payments.reduce(
      (acc, payment) => {
        const existingYear = acc.find((p) => p.year === payment.year);

        if (existingYear) {
          existingYear.monthlyBreakdown.push(...payment.months);
        } else {
          acc.push({
            year: payment.year,
            monthlyBreakdown: [...payment.months].map((month) => ({
              month: month.month,
              amount: month.amount,
              paidVia: month.paidVia,
              status: month.status,
              debt: month.debt,
              advance: month.advance,
              paymentDate: month.paymentDate,
            })),
          });
        }
        return acc;
      },
      [] as Array<{
        year: number;
        monthlyBreakdown: Array<{
          month: number;
          amount: number;
          paidVia?: string;
          status: string;
          debt: number;
          advance: number;
          paymentDate?: Date;
        }>;
      }>
    );

    const summary = {
      totalPaid: customer.payments.reduce(
        (sum, payment) => sum + payment.months.reduce((mSum, month) => mSum + month.amount, 0),
        0
      ),
      totalDebt: customer.payments.reduce((sum, payment) => sum + payment.totalDebt, 0),
      totalAdvance: customer.payments.reduce((sum, payment) => sum + payment.totalAdvance, 0),
      paymentHistory: paymentsByYear,
    };

    res.status(200).json({
      status: true,
      message: 'Customer bill history fetched successfully',
      data: { customer, billSummary: summary },
    });
  } catch (error) {
    console.error('Error fetching customer bill history:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching customer bill history',
      error,
    });
  }
};
