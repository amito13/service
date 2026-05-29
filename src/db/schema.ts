import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    contact: varchar('contact', { length: 13 }).notNull(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    city: varchar('city', { length: 256 }).notNull(),
    state: varchar('state', { length: 256 }).notNull(),
    pincode: varchar('pincode', { length: 10 }).notNull(),
});
