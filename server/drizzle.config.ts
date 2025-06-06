import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    // For local development
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
