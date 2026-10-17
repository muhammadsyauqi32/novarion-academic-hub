import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './auth';
import { academicTerms, courses, classSections, studyGroups } from './academics';

export const userPermissions = pgTable('user_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  permission: varchar('permission', { length: 50 }).notNull(), // 'agenda.create' | 'agenda.edit' | 'agenda.cancel' | 'agenda.import' | 'agenda.review' | 'materials.manage' | 'knowledge.manage' | 'students.manage' | 'permissions.manage' | 'website.manage' | 'whatsapp.manage' | 'audit.read'
  termId: uuid('term_id').references(() => academicTerms.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  classSectionId: uuid('class_section_id').references(() => classSections.id, { onDelete: 'cascade' }),
  studyGroupId: uuid('study_group_id').references(() => studyGroups.id, { onDelete: 'cascade' }),
  grantedBy: uuid('granted_by').references(() => profiles.id, { onDelete: 'set null' }),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxUserProfilePerm: index('idx_user_perm_profile').on(t.profileId, t.permission),
}));
