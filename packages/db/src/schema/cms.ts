import { pgTable, uuid, varchar, text, boolean, integer, date, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './auth';

export const cmsHero = pgTable('cms_hero', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }),
  subtitle: text('subtitle'),
  imageUrl: text('image_url').notNull(),
  focalPointX: varchar('focal_point_x', { length: 10 }).default('50%'),
  focalPointY: varchar('focal_point_y', { length: 10 }).default('50%'),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published' | 'archived'
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cmsNews = pgTable('cms_news', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 20 }).notNull().default('update'), // 'update' | 'article'
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'),
  category: varchar('category', { length: 50 }).notNull().default('Umum'),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published' | 'archived'
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxNewsStatus: index('idx_cms_news_status').on(t.status, t.publishedAt),
}));

export const cmsAlbums = pgTable('cms_albums', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  eventDate: date('event_date'),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // 'draft' | 'published' | 'archived'
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cmsAlbumPhotos = pgTable('cms_album_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  albumId: uuid('album_id')
    .notNull()
    .references(() => cmsAlbums.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  displayOrder: integer('display_order').notNull().default(0),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxAlbumPhotosOrder: index('idx_cms_album_photos_order').on(t.albumId, t.displayOrder),
}));

export const cmsAchievements = pgTable('cms_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  recipient: varchar('recipient', { length: 200 }).notNull(), // Individu atau Tim
  competition: varchar('competition', { length: 200 }).notNull(),
  rank: varchar('rank', { length: 100 }).notNull(), // Juara 1, Medali Emas, dll
  category: varchar('category', { length: 50 }).notNull().default('Akademik'), // 'Akademik' | 'Data Science' | 'Olahraga' | 'Seni' | 'Lainnya'
  level: varchar('level', { length: 50 }).notNull().default('Nasional'), // 'Internasional' | 'Nasional' | 'Provinsi' | 'Institut'
  eventDate: date('event_date'),
  description: text('description'),
  imageUrl: text('image_url'),
  isFeatured: boolean('is_featured').notNull().default(false),
  status: varchar('status', { length: 20 }).notNull().default('published'),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxAchieveStatus: index('idx_cms_achieve_status').on(t.status, t.isFeatured),
}));

export const cmsMedia = pgTable('cms_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  filePath: text('file_path').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSize: integer('file_size').notNull(),
  altText: varchar('alt_text', { length: 255 }),
  width: integer('width'),
  height: integer('height'),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
