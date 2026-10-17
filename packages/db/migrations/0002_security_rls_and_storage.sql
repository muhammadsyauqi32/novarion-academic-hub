-- ==============================================================================
-- MIGRATION 0002: ROW LEVEL SECURITY (RLS), ACCESS CONTROL & STORAGE SECURITY
-- ==============================================================================

-- 1. Helper Function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Helper Function: is_active_student()
CREATE OR REPLACE FUNCTION public.is_active_student()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.student_whitelist w ON p.nim = w.nim
    WHERE p.id = auth.uid() AND w.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY ON ALL PUBLIC TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE "student_whitelist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academic_terms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_offerings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "class_sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "study_group_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agendas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agenda_targets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agenda_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agenda_revisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "personal_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared_task_completions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messaging_channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "channel_routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_connections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_auth_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_delivery_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "import_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_notifications" ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. RLS POLICIES: AUTH & PROFILES
-- ------------------------------------------------------------------------------

-- student_whitelist: Hanya admin yang dapat melihat dan mengelola whitelist
DROP POLICY IF EXISTS "Admin full access on student_whitelist" ON "student_whitelist";
CREATE POLICY "Admin full access on student_whitelist"
  ON "student_whitelist"
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- profiles: Pengguna bisa melihat profil sendiri dan sesama mahasiswa aktif, tapi hanya admin atau pemilik yang bisa update
DROP POLICY IF EXISTS "Users can read profiles" ON "profiles";
CREATE POLICY "Users can read profiles"
  ON "profiles"
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_active_student());

DROP POLICY IF EXISTS "Users can update own profile" ON "profiles";
CREATE POLICY "Users can update own profile"
  ON "profiles"
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin can insert/delete profiles" ON "profiles";
CREATE POLICY "Admin can insert/delete profiles"
  ON "profiles"
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. RLS POLICIES: ACADEMICS (TERMS, COURSES, CLASSES, GROUPS, ENROLLMENTS)
-- ------------------------------------------------------------------------------

-- Baca katalog akademik untuk mahasiswa aktif & admin
DROP POLICY IF EXISTS "Read academic terms" ON "academic_terms";
CREATE POLICY "Read academic terms" ON "academic_terms" FOR SELECT TO authenticated
  USING (public.is_active_student() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage academic terms" ON "academic_terms";
CREATE POLICY "Admin manage academic terms" ON "academic_terms" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read courses" ON "courses";
CREATE POLICY "Read courses" ON "courses" FOR SELECT TO authenticated
  USING (public.is_active_student() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage courses" ON "courses";
CREATE POLICY "Admin manage courses" ON "courses" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read course offerings" ON "course_offerings";
CREATE POLICY "Read course offerings" ON "course_offerings" FOR SELECT TO authenticated
  USING (public.is_active_student() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage course offerings" ON "course_offerings";
CREATE POLICY "Admin manage course offerings" ON "course_offerings" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read class sections" ON "class_sections";
CREATE POLICY "Read class sections" ON "class_sections" FOR SELECT TO authenticated
  USING (public.is_active_student() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage class sections" ON "class_sections";
CREATE POLICY "Admin manage class sections" ON "class_sections" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read study groups" ON "study_groups";
CREATE POLICY "Read study groups" ON "study_groups" FOR SELECT TO authenticated
  USING (public.is_active_student() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage study groups" ON "study_groups";
CREATE POLICY "Admin manage study groups" ON "study_groups" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Enrollments: Mahasiswa hanya bisa melihat kelasnya sendiri, Admin kelola semua
DROP POLICY IF EXISTS "Read enrollments" ON "enrollments";
CREATE POLICY "Read enrollments" ON "enrollments" FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage enrollments" ON "enrollments";
CREATE POLICY "Admin manage enrollments" ON "enrollments" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Study Group Members: Mahasiswa hanya bisa melihat kelompoknya sendiri, Admin kelola semua
DROP POLICY IF EXISTS "Read study group members" ON "study_group_members";
CREATE POLICY "Read study group members" ON "study_group_members" FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage study group members" ON "study_group_members";
CREATE POLICY "Admin manage study group members" ON "study_group_members" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. RLS POLICIES: AGENDAS & MODERATION
-- ------------------------------------------------------------------------------

-- Agendas: Publikasikan agenda yang disetujui untuk mahasiswa, semua untuk admin
DROP POLICY IF EXISTS "Read published agendas" ON "agendas";
CREATE POLICY "Read published agendas" ON "agendas" FOR SELECT TO authenticated
  USING (
    (status = 'published' AND (public.is_active_student() OR public.is_admin()))
    OR created_by = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Students can submit agenda proposals" ON "agendas";
CREATE POLICY "Students can submit agenda proposals" ON "agendas" FOR INSERT TO authenticated
  WITH CHECK (
    (status = 'submitted' AND created_by = auth.uid() AND public.is_active_student())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin manage agendas" ON "agendas";
CREATE POLICY "Admin manage agendas" ON "agendas" FOR UPDATE TO authenticated
  USING (public.is_admin() OR (created_by = auth.uid() AND status = 'submitted'))
  WITH CHECK (public.is_admin() OR (created_by = auth.uid() AND status = 'submitted'));

DROP POLICY IF EXISTS "Admin delete agendas" ON "agendas";
CREATE POLICY "Admin delete agendas" ON "agendas" FOR DELETE TO authenticated
  USING (public.is_admin() OR (created_by = auth.uid() AND status = 'submitted'));

DROP POLICY IF EXISTS "Read agenda targets" ON "agenda_targets";
CREATE POLICY "Read agenda targets" ON "agenda_targets" FOR SELECT TO authenticated
  USING (public.is_active_student() OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage agenda targets" ON "agenda_targets";
CREATE POLICY "Admin manage agenda targets" ON "agenda_targets" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Manage agenda reviews" ON "agenda_reviews";
CREATE POLICY "Manage agenda reviews" ON "agenda_reviews" FOR ALL TO authenticated
  USING (public.is_admin() OR reviewer_id = auth.uid())
  WITH CHECK (public.is_admin() OR reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Manage agenda revisions" ON "agenda_revisions";
CREATE POLICY "Manage agenda revisions" ON "agenda_revisions" FOR ALL TO authenticated
  USING (public.is_admin() OR submitted_by = auth.uid())
  WITH CHECK (public.is_admin() OR submitted_by = auth.uid());

-- ------------------------------------------------------------------------------
-- 7. RLS POLICIES: PERSONAL TASKS (STRICT PRIVACY — NO IDOR)
-- ------------------------------------------------------------------------------
-- Student A tidak boleh melihat atau memodifikasi tugas personal Student B!
DROP POLICY IF EXISTS "Personal tasks isolation" ON "personal_tasks";
CREATE POLICY "Personal tasks isolation"
  ON "personal_tasks"
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Shared task completions isolation
DROP POLICY IF EXISTS "Shared task completions isolation" ON "shared_task_completions";
CREATE POLICY "Shared task completions isolation"
  ON "shared_task_completions"
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 8. RLS POLICIES: KNOWLEDGE HUB & ACADEMIC MATERIALS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Read published knowledge items" ON "knowledge_items";
CREATE POLICY "Read published knowledge items" ON "knowledge_items" FOR SELECT TO authenticated
  USING ((status = 'published' AND public.is_active_student()) OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage knowledge items" ON "knowledge_items";
CREATE POLICY "Admin manage knowledge items" ON "knowledge_items" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Read published knowledge assets" ON "knowledge_assets";
CREATE POLICY "Read published knowledge assets" ON "knowledge_assets" FOR SELECT TO authenticated
  USING ((status = 'published' AND public.is_active_student()) OR public.is_admin());
DROP POLICY IF EXISTS "Admin manage knowledge assets" ON "knowledge_assets";
CREATE POLICY "Admin manage knowledge assets" ON "knowledge_assets" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. RLS POLICIES: SYSTEM, MESSAGING, AUDIT & NOTIFICATIONS
-- ------------------------------------------------------------------------------
-- Hanya admin yang dapat mengelola WhatsApp dan Channel Routes
DROP POLICY IF EXISTS "Admin manage messaging channels" ON "messaging_channels";
CREATE POLICY "Admin manage messaging channels" ON "messaging_channels" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage channel routes" ON "channel_routes";
CREATE POLICY "Admin manage channel routes" ON "channel_routes" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage whatsapp connections" ON "whatsapp_connections";
CREATE POLICY "Admin manage whatsapp connections" ON "whatsapp_connections" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage whatsapp auth state" ON "whatsapp_auth_state";
CREATE POLICY "Admin manage whatsapp auth state" ON "whatsapp_auth_state" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage reminder rules" ON "reminder_rules";
CREATE POLICY "Admin manage reminder rules" ON "reminder_rules" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage reminder jobs" ON "reminder_jobs";
CREATE POLICY "Admin manage reminder jobs" ON "reminder_jobs" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage reminder delivery attempts" ON "reminder_delivery_attempts";
CREATE POLICY "Admin manage reminder delivery attempts" ON "reminder_delivery_attempts" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Audit logs & Import runs: Hanya admin
DROP POLICY IF EXISTS "Admin manage audit logs" ON "audit_logs";
CREATE POLICY "Admin manage audit logs" ON "audit_logs" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manage import runs" ON "import_runs";
CREATE POLICY "Admin manage import runs" ON "import_runs" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Notifications: Pemilik notifikasi hanya bisa membaca notifikasi miliknya
DROP POLICY IF EXISTS "Read own notifications" ON "app_notifications";
CREATE POLICY "Read own notifications" ON "app_notifications" FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Update own notifications" ON "app_notifications";
CREATE POLICY "Update own notifications" ON "app_notifications" FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. RLS POLICIES: STORAGE BUCKET (course-materials)
-- ------------------------------------------------------------------------------
-- Pastikan bucket 'course-materials' berstatus private
UPDATE storage.buckets 
SET public = false, file_size_limit = 10485760 
WHERE id = 'course-materials';

-- Policy Upload: Hanya Admin yang dapat mengupload materi kuliah
DROP POLICY IF EXISTS "Admin upload course materials" ON storage.objects;
CREATE POLICY "Admin upload course materials"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-materials' AND public.is_admin()
  );

-- Policy Update/Delete: Hanya Admin yang dapat mengubah atau menghapus materi kuliah
DROP POLICY IF EXISTS "Admin modify course materials" ON storage.objects;
CREATE POLICY "Admin modify course materials"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-materials' AND public.is_admin())
  WITH CHECK (bucket_id = 'course-materials' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete course materials" ON storage.objects;
CREATE POLICY "Admin delete course materials"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-materials' AND public.is_admin());

-- Policy Download / Read: Mahasiswa aktif & Admin dapat membaca materi
DROP POLICY IF EXISTS "Authorized access to course materials" ON storage.objects;
CREATE POLICY "Authorized access to course materials"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'course-materials' 
    AND (public.is_active_student() OR public.is_admin())
  );
