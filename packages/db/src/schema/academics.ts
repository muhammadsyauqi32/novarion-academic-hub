import { pgTable, uuid, varchar, integer, boolean, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { profiles } from './auth';

export const academicTerms = pgTable('academic_terms', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 30 }).notNull().unique(), // Contoh: '2026-GANJIL'
  name: varchar('name', { length: 100 }).notNull(), // Contoh: 'Semester Ganjil 2026/2027'
  startDate: date('start_date'),
  endDate: date('end_date'),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(), // Contoh: 'STAT101'
  name: varchar('name', { length: 150 }).notNull(),
  credits: integer('credits').notNull().default(3),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const courseOfferings = pgTable('course_offerings', {
  id: uuid('id').defaultRandom().primaryKey(),
  termId: uuid('term_id')
    .notNull()
    .references(() => academicTerms.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqTermCourse: uniqueIndex('unq_term_course').on(t.termId, t.courseId),
}));

export const classSections = pgTable('class_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  offeringId: uuid('offering_id')
    .notNull()
    .references(() => courseOfferings.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(), // Contoh: 'Kelas A', 'Kelas B'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqOfferingClass: uniqueIndex('unq_offering_class').on(t.offeringId, t.name),
}));

export const studyGroups = pgTable('study_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  classSectionId: uuid('class_section_id')
    .notNull()
    .references(() => classSections.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(), // Contoh: 'Kelompok Praktikum 1'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqClassGroup: uniqueIndex('unq_class_group').on(t.classSectionId, t.name),
}));

export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  classSectionId: uuid('class_section_id')
    .notNull()
    .references(() => classSections.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqProfileClass: uniqueIndex('unq_profile_class').on(t.profileId, t.classSectionId),
}));

export const studyGroupMembers = pgTable('study_group_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  studyGroupId: uuid('study_group_id')
    .notNull()
    .references(() => studyGroups.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  unqProfileGroup: uniqueIndex('unq_profile_group').on(t.profileId, t.studyGroupId),
}));
