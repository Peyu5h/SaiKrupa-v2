import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { databaseMiddleware } from './middleware/database';
import type { AppType } from './utils/types';
import routes from './routes';

const app = new Hono<AppType>();

app.use('*', databaseMiddleware);
app.use(
  '*',
  cors({
    origin: '*',
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
    exposeHeaders: ['Content-Length'],
  })
);

app.route('/', routes);

export default app;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
  maxDuration: 300,
};

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
