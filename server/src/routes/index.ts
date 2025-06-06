import { Hono } from 'hono';
import type { AppType } from '../utils/types';
import userRoutes from './userRoutes';
import customerRoutes from './customerRoutes';
import billRoutes from './billRoutes';
import analyticsRoutes from './analyticsRoutes';

const routes = new Hono<AppType>();

routes.get('/', (c) => {
  return c.json({ success: true, message: 'API is healthy' });
});

// API routes
routes.route('/api/users', userRoutes);
routes.route('/api/customer', customerRoutes);
routes.route('/api/bills', billRoutes);
routes.route('/api/analytics', analyticsRoutes);

export default routes;
