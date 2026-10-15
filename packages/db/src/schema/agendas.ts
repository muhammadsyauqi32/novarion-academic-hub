import { pgTable, uuid, varchar, text, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { profiles } from './auth';
import { courses, classSections, studyGroups } from './academics';

export const agendas = pgTable('agendas', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 30 }).notNull(), // 'tugas' | 'kuis' | 'ujian' | 'praktikum' | 'kuliah' | 'kegiatan' | 'pengumuman'
  scope: varchar('scope', { length: 30 }).notNull(), // 'angkatan' | 'mata_kuliah' | 'kelas' | 'kelompok'
  startTime: timestamp('start_time', { withTimezone: true }),
  deadline: timestamp('deadline', { withTimezone: true }),
  locationOrLink: text('location_or_link'),
  sourceReference: text('source_reference'),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'published' | 'rejected' | 'cancelled'
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const agendaTargets = pgTable('agenda_targets', {
  id: uuid('id').defaultRandom().primaryKey(),
  agendaId: uuid('agenda_id')
    .notNull()
    .references(() => agendas.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  classSectionId: uuid('class_section_id').references(() => classSections.id, { onDelete: 'cascade' }),
  studyGroupId: uuid('study_group_id').references(() => studyGroups.id, { onDelete: 'cascade' }),
});

export const agendaRevisions = pgTable('agenda_revisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  agendaId: uuid('agenda_id')
    .notNull()
    .references(() => agendas.id, { onDelete: 'cascade' }),
  proposedTitle: varchar('proposed_title', { length: 200 }),
  proposedDescription: text('proposed_description'),
  proposedDeadline: timestamp('proposed_deadline', { withTimezone: true }),
  changeReason: text('change_reason').notNull(),
  submittedBy: uuid('submitted_by').references(() => profiles.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy: uuid('reviewed_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const agendaReviews = pgTable('agenda_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  agendaId: uuid('agenda_id')
    .notNull()
    .references(() => agendas.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 30 }).notNull(), // 'approved' | 'rejected' | 'revision_requested'
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const personalTasks = pgTable('personal_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  deadline: timestamp('deadline', { withTimezone: true }),
  status: varchar('status', { length: 20 }).notNull().default('todo'), // 'todo' | 'done'
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sharedTaskCompletions = pgTable('shared_task_completions', {
  id: uuid('id').defaultRandom().primaryKey(),
  agendaId: uuid('agenda_id')
    .notNull()
    .references(() => agendas.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('todo'), // 'todo' | 'done'
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqAgendaProfile: uniqueIndex('unq_agenda_profile_task').on(t.agendaId, t.profileId),
}));
