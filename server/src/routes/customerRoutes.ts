import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { AppType } from '../utils/types';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';

const customerRoutes = new Hono<AppType>();

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  stdId: z.string().optional(),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

customerRoutes.get('/', async (c) => {
  const response = await getAllCustomers(c.get('db'));
  return c.json(response);
});

customerRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const year = c.req.query('year') ? Number(c.req.query('year')) : undefined;

  const response = await getCustomerById(c.get('db'), id, year);
  return c.json(response);
});

customerRoutes.post(
  '/create',
  zValidator('json', createCustomerSchema),
  async (c) => {
    const data = await c.req.json();
    const response = await createCustomer(c.get('db'), data);

    return response.status ? c.json(response, 201) : c.json(response, 400);
  }
);

customerRoutes.put(
  '/:id',
  zValidator('json', updateCustomerSchema),
  async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();

    const response = await updateCustomer(c.get('db'), id, data);

    return response.status ? c.json(response) : c.json(response, 404);
  }
);

customerRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const response = await deleteCustomer(c.get('db'), id);

  return response.status ? c.json(response) : c.json(response, 404);
});

export default customerRoutes;
