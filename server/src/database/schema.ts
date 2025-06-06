import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
});

export const customers = sqliteTable('customers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  stdId: text('std_id'),
  customerId: text('customer_id').notNull().unique(),
  registerAt: text('register_at'),
  deletedAt: text('deleted_at'),
});

export const payments = sqliteTable('payments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  totalDebt: real('total_debt').notNull().default(0),
  totalAdvance: real('total_advance').notNull().default(0),
  updatedAt: integer('updated_at').notNull(),
});

export const monthPayments = sqliteTable('month_payments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  paymentId: text('payment_id')
    .notNull()
    .references(() => payments.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(),
  amount: real('amount').notNull(),
  paidVia: text('paid_via'),
  debt: real('debt').notNull().default(0),
  advance: real('advance').notNull().default(0),
  paymentDate: integer('payment_date'),
  status: text('status').notNull().default('Unpaid'),
  note: text('note'),
  createdAt: integer('created_at').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  paymentId: text('payment_id').references(() => payments.id),
  monthPaymentId: text('month_payment_id').references(() => monthPayments.id),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  note: text('note'),
  createdAt: integer('created_at').notNull(),
});

export const plans = sqliteTable('plans', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  amount: integer('amount').notNull(),
  profit: integer('profit').notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  payments: many(payments),
  transactions: many(transactions),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
  months: many(monthPayments),
  transactions: many(transactions),
}));

export const monthPaymentsRelations = relations(
  monthPayments,
  ({ one, many }) => ({
    payment: one(payments, {
      fields: [monthPayments.paymentId],
      references: [payments.id],
    }),
    transactions: many(transactions),
  })
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  payment: one(payments, {
    fields: [transactions.paymentId],
    references: [payments.id],
  }),
  monthPayment: one(monthPayments, {
    fields: [transactions.monthPaymentId],
    references: [monthPayments.id],
  }),
}));
