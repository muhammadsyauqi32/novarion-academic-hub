import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { courses, classSections, studyGroups } from './academics';

export const whatsappConnections = pgTable('whatsapp_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  phoneNumber: varchar('phone_number', { length: 30 }),
  displayName: varchar('display_name', { length: 100 }),
  status: varchar('status', { length: 30 }).notNull().default('disconnected'), // 'connected' | 'connecting' | 'disconnected' | 'requires_repair' | 'error'
  tempQrCode: text('temp_qr_code'),
  qrExpiresAt: timestamp('qr_expires_at', { withTimezone: true }),
  isPaused: boolean('is_paused').notNull().default(false), // Emergency kill switch
  lastConnectedAt: timestamp('last_connected_at', { withTimezone: true }),
  lastHeartbeatAt: timestamp('last_heartbeat_at', { withTimezone: true }),
  lastError: text('last_error'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const whatsappAuthState = pgTable('whatsapp_auth_state', {
  key: varchar('key', { length: 255 }).primaryKey(),
  encryptedData: text('encrypted_data').notNull(),
  iv: varchar('iv', { length: 64 }).notNull(),
  tag: varchar('tag', { length: 64 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const messagingChannels = pgTable('messaging_channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  jid: varchar('jid', { length: 100 }).notNull().unique(), // e.g., '12036302839218@g.us'
  name: varchar('name', { length: 150 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  verifiedByAdmin: boolean('verified_by_admin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const channelRoutes = pgTable('channel_routes', {
  id: uuid('id').defaultRandom().primaryKey(),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => messagingChannels.id, { onDelete: 'cascade' }),
  scope: varchar('scope', { length: 30 }).notNull(), // 'angkatan' | 'mata_kuliah' | 'kelas' | 'kelompok'
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  classSectionId: uuid('class_section_id').references(() => classSections.id, { onDelete: 'cascade' }),
  studyGroupId: uuid('study_group_id').references(() => studyGroups.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
