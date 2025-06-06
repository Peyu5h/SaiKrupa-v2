import { D1Database } from '@cloudflare/workers-types';

// Types
export type ApiResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

export type Env = {
  D1: D1Database;
};

// Response Helpers
export const success = <T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> => ({
  status: true,
  message,
  data,
});

export const error = (
  message: string,
  error?: unknown
): ApiResponse<never> => ({
  status: false,
  message,
  error,
});
