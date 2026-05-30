import { pgTable, serial, text, timestamp, varchar,pgEnum } from 'drizzle-orm/pg-core';
export const accountTypeEnum = pgEnum("account_type", [
  "USER",
  "PROFESSIONAL",
  "ADMIN"
]);


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
    accountType: accountTypeEnum('account_type').notNull().default('USER')
});

export const professionals = pgTable('professionals', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').notNull().references(() => users.id),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

export const professionalCategories = pgTable('professional_categories', {
    id: serial('id').primaryKey(),
    professionalId: serial('professional_id').notNull().references(() => professionals.id),
    categoryId: serial('category_id').notNull().references(() => categories.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});
