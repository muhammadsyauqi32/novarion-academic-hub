import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './auth';
import { academicTerms, courses, classSections } from './academics';

export const knowledgeItems = pgTable('knowledge_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  content: text('content').notNull(),
  category: varchar('category', { length: 30 }).notNull(), // 'faq' | 'guide' | 'important_link' | 'reference'
  status: varchar('status', { length: 20 }).notNull().default('published'), // 'draft' | 'published' | 'archived'
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const knowledgeAssets = pgTable('knowledge_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  assetType: varchar('asset_type', { length: 30 }).notNull(), // 'file_upload' | 'external_link'
  filePath: text('file_path'),
  externalUrl: text('external_url'),
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  termId: uuid('term_id').references(() => academicTerms.id, { onDelete: 'set null' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'set null' }),
  classSectionId: uuid('class_section_id').references(() => classSections.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('published'),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
