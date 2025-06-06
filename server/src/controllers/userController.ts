import { eq } from 'drizzle-orm';
import { users } from '../database/schema';
import type { Database } from '../database';
import { success, error } from '../utils/response';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const getAllUsers = async (db: Database) => {
  try {
    const result = await db.select().from(users);
    return success(result, 'Users fetched successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error fetching users', { message: err.message });
  }
};

export const getUserById = async (db: Database, id: string) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!result[0]) {
      return error('User not found');
    }

    return success(result[0], 'User fetched successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error fetching user', { message: err.message });
  }
};

export const createUser = async (db: Database, data: unknown) => {
  try {
    const validatedData = userSchema.parse(data);

    const result = await db.insert(users).values(validatedData).returning();
    return success(result[0], 'User created successfully');
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return error('Validation failed', err.errors);
    }
    if (
      err instanceof Error &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      return error('Email or username already exists');
    }
    return error('Error creating user', { message: err.message });
  }
};

export const updateUser = async (db: Database, id: string, data: unknown) => {
  try {
    const validatedData = userSchema.partial().parse(data);

    const result = await db
      .update(users)
      .set(validatedData)
      .where(eq(users.id, id))
      .returning();

    if (!result[0]) {
      return error('User not found');
    }

    return success(result[0], 'User updated successfully');
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return error('Validation failed', err.errors);
    }
    if (
      err instanceof Error &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      return error('Email or username already exists');
    }
    return error('Error updating user', { message: err.message });
  }
};

export const deleteUser = async (db: Database, id: string) => {
  try {
    const result = await db.delete(users).where(eq(users.id, id)).returning();

    if (!result[0]) {
      return error('User not found');
    }

    return success({ user: result[0] }, 'User deleted successfully');
  } catch (err: any) {
    console.error(err);
    return error('Error deleting user', { message: err.message });
  }
};
