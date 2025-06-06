import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import type { AppType } from '../utils/types';

const userRoutes = new Hono<AppType>();

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

// GET /users - list all users
userRoutes.get('/', async (c) => {
  const users = await getAllUsers(c.get('db'));
  return c.json(users);
});

// GET /users/:id - get user by id
userRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = await getUserById(c.get('db'), id);
  if (!user) return c.json({ message: 'User not found' }, 404);
  return c.json(user);
});

// POST /users - create user
userRoutes.post('/', zValidator('json', userSchema), async (c) => {
  const data = await c.req.json();
  const user = await createUser(c.get('db'), data);
  return c.json(user, 201);
});

// PUT /users/:id - update user
userRoutes.put('/:id', zValidator('json', userSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  const user = await updateUser(c.get('db'), id, data);
  if (!user) return c.json({ message: 'User not found' }, 404);
  return c.json(user);
});

// DELETE /users/:id - delete user
userRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const user = await deleteUser(c.get('db'), id);
  if (!user) return c.json({ message: 'User not found' }, 404);
  return c.json({ message: 'User deleted', user });
});

export default userRoutes;
