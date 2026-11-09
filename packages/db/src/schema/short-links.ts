import { pgTable, uuid, varchar, text, integer, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { profiles } from './auth';

export const shortLinks = pgTable(
  'short_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    originalUrl: text('original_url').notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    clickCount: integer('click_count').notNull().default(0),
    userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('short_links_slug_idx').on(table.slug),
    userIdIdx: index('short_links_user_id_idx').on(table.userId),
  })
);

export type ShortLink = typeof shortLinks.$inferSelect;
export type NewShortLink = typeof shortLinks.$inferInsert;

