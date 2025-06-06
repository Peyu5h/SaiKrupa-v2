import { Hono } from 'hono';
import type { AppType } from '../utils/types';
import { getAnalytics } from '../controllers/analyticsController';

const analyticsRoutes = new Hono<AppType>();

analyticsRoutes.get('/', async (c) => {
  const year = c.req.query('year')
    ? parseInt(c.req.query('year') as string, 10)
    : new Date().getFullYear();
  const month = c.req.query('month')
    ? parseInt(c.req.query('month') as string, 10)
    : undefined;
  const viewType = c.req.query('viewType') === 'Yearly' ? 'Yearly' : 'Monthly';

  const response = await getAnalytics(c.get('db'), year, month, viewType);
  return c.json(response);
});

export default analyticsRoutes;
