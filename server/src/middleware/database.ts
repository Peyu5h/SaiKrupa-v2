import { Context, Next } from 'hono';
import { createDb } from '../database';

export const databaseMiddleware = async (c: Context, next: Next) => {
  const db = createDb(c.env.DB);
  c.set('db', db);
  await next();
};
