import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const studentWhitelist = pgTable('student_whitelist', {
  id: uuid('id').defaultRandom().primaryKey(),
  nim: varchar('nim', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('student'), // 'student' | 'admin'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // ID akun Supabase auth.users
  nim: varchar('nim', { length: 30 })
    .notNull()
    .unique()
    .references(() => studentWhitelist.nim, { onDelete: 'restrict' }),
  email: varchar('email', { length: 150 }).notNull().unique(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('student'),
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
