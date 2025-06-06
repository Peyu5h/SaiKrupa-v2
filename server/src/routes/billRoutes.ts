import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { AppType } from '../utils/types';
import {
  createBill,
  getCustomerBills,
  getAllTransactions,
  getRecentTransactions,
  deleteTransaction,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/billController';

const billRoutes = new Hono<AppType>();

const createBillSchema = z.object({
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

const createPlanSchema = z.object({
  amount: z.number(),
  profit: z.number(),
});

billRoutes.post('/create', zValidator('json', createBillSchema), async (c) => {
  const data = await c.req.json();
  const response = await createBill(c.get('db'), data);

  return response.status ? c.json(response, 201) : c.json(response, 400);
});

billRoutes.get('/customer/:id', async (c) => {
  const customerId = c.req.param('id');
  const year = c.req.query('year') ? Number(c.req.query('year')) : undefined;

  const response = await getCustomerBills(c.get('db'), customerId, year);
  return c.json(response);
});

billRoutes.get('/transactions', async (c) => {
  const response = await getAllTransactions(c.get('db'));
  return c.json(response);
});

billRoutes.get('/transactions/recent', async (c) => {
  const response = await getRecentTransactions(c.get('db'));
  return c.json(response);
});

billRoutes.delete('/transactions/:id', async (c) => {
  const id = c.req.param('id');
  const response = await deleteTransaction(c.get('db'), id);

  return response.status ? c.json(response) : c.json(response, 404);
});

billRoutes.get('/plans', async (c) => {
  const response = await getPlans(c.get('db'));
  return c.json(response);
});

billRoutes.post('/plans', zValidator('json', createPlanSchema), async (c) => {
  const data = await c.req.json();
  const response = await createPlan(c.get('db'), data.amount, data.profit);

  return response.status ? c.json(response, 201) : c.json(response, 400);
});

billRoutes.put(
  '/plans/:id',
  zValidator('json', createPlanSchema),
  async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const response = await updatePlan(
      c.get('db'),
      id,
      data.amount,
      data.profit
    );

    return response.status ? c.json(response) : c.json(response, 404);
  }
);

billRoutes.delete('/plans/:id', async (c) => {
  const id = c.req.param('id');
  const response = await deletePlan(c.get('db'), id);

  return response.status ? c.json(response) : c.json(response, 404);
});

export default billRoutes;
