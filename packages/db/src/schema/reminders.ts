import { pgTable, uuid, varchar, text, integer, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { agendas } from './agendas';
import { messagingChannels } from './messaging';

export const reminderRules = pgTable('reminder_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  triggerType: varchar('trigger_type', { length: 30 }).notNull().unique(), // 'h_7' | 'h_3' | 'h_1' | 't_minus_3h'
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
});

export const reminderJobs = pgTable('reminder_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  agendaId: uuid('agenda_id')
    .notNull()
    .references(() => agendas.id, { onDelete: 'cascade' }),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => messagingChannels.id, { onDelete: 'cascade' }),
  triggerType: varchar('trigger_type', { length: 30 }).notNull(), // 'h_7' | 'h_3' | 'h_1' | 't_minus_3h'
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('queued'), // 'queued' | 'processing' | 'submitted' | 'failed' | 'unknown' | 'cancelled'
  attemptCount: integer('attempt_count').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lockedBy: varchar('locked_by', { length: 100 }),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqAgendaChannelTrigger: uniqueIndex('unq_agenda_channel_trigger').on(t.agendaId, t.channelId, t.triggerType),
  idxScheduledStatus: index('idx_reminder_jobs_sched_status').on(t.status, t.scheduledFor),
}));

export const reminderDeliveryAttempts = pgTable('reminder_delivery_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => reminderJobs.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 30 }).notNull(), // 'baileys' | 'mock'
  providerMessageId: varchar('provider_message_id', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull(), // 'submitted' | 'failed' | 'unknown'
  responsePayload: text('response_payload'),
  errorMessage: text('error_message'),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).defaultNow().notNull(),
});
