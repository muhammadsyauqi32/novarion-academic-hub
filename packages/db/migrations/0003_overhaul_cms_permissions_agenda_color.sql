-- Additive Migration: Novarion Academic Hub Overhaul
-- CMS, Granular Permissions, Agenda Color & External ID

-- 1. Extend agendas with color and external_id for CSV idempotent re-imports
ALTER TABLE "agendas" ADD COLUMN IF NOT EXISTS "color" varchar(20);
ALTER TABLE "agendas" ADD COLUMN IF NOT EXISTS "external_id" varchar(100);

-- 2. Extend personal_tasks with start_time and color
ALTER TABLE "personal_tasks" ADD COLUMN IF NOT EXISTS "start_time" timestamp with time zone;
ALTER TABLE "personal_tasks" ADD COLUMN IF NOT EXISTS "color" varchar(20);

-- 3. Granular User Permissions table
CREATE TABLE IF NOT EXISTS "user_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "permission" varchar(50) NOT NULL,
  "term_id" uuid REFERENCES "academic_terms"("id") ON DELETE CASCADE,
  "course_id" uuid REFERENCES "courses"("id") ON DELETE CASCADE,
  "class_section_id" uuid REFERENCES "class_sections"("id") ON DELETE CASCADE,
  "study_group_id" uuid REFERENCES "study_groups"("id") ON DELETE CASCADE,
  "granted_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_user_perm_profile" ON "user_permissions" ("profile_id", "permission");

-- 4. CMS: Hero Manager
CREATE TABLE IF NOT EXISTS "cms_hero" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(200),
  "subtitle" text,
  "image_url" text NOT NULL,
  "focal_point_x" varchar(10) DEFAULT '50%',
  "focal_point_y" varchar(10) DEFAULT '50%',
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. CMS: News Manager (Short updates and long articles)
CREATE TABLE IF NOT EXISTS "cms_news" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" varchar(20) DEFAULT 'update' NOT NULL,
  "title" varchar(200) NOT NULL,
  "slug" varchar(200) NOT NULL UNIQUE,
  "excerpt" text,
  "content" text NOT NULL,
  "cover_image_url" text,
  "category" varchar(50) DEFAULT 'Umum' NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_cms_news_status" ON "cms_news" ("status", "published_at");

-- 6. CMS: Albums & Gallery
CREATE TABLE IF NOT EXISTS "cms_albums" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(200) NOT NULL,
  "slug" varchar(200) NOT NULL UNIQUE,
  "description" text,
  "cover_image_url" text,
  "event_date" date,
  "is_featured" boolean DEFAULT false NOT NULL,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "cms_album_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "album_id" uuid NOT NULL REFERENCES "cms_albums"("id") ON DELETE CASCADE,
  "image_url" text NOT NULL,
  "caption" text,
  "display_order" integer DEFAULT 0 NOT NULL,
  "is_featured" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_cms_album_photos_order" ON "cms_album_photos" ("album_id", "display_order");

-- 7. CMS: Achievements
CREATE TABLE IF NOT EXISTS "cms_achievements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(200) NOT NULL,
  "recipient" varchar(200) NOT NULL,
  "competition" varchar(200) NOT NULL,
  "rank" varchar(100) NOT NULL,
  "category" varchar(50) DEFAULT 'Akademik' NOT NULL,
  "level" varchar(50) DEFAULT 'Nasional' NOT NULL,
  "event_date" date,
  "description" text,
  "imageUrl" text,
  "is_featured" boolean DEFAULT false NOT NULL,
  "status" varchar(20) DEFAULT 'published' NOT NULL,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_cms_achieve_status" ON "cms_achievements" ("status", "is_featured");

-- 8. CMS: Media Library
CREATE TABLE IF NOT EXISTS "cms_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_url" text NOT NULL,
  "file_path" text NOT NULL,
  "mime_type" varchar(100) NOT NULL,
  "file_size" integer NOT NULL,
  "alt_text" varchar(255),
  "width" integer,
  "height" integer,
  "created_by" uuid REFERENCES "profiles"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 9. Row Level Security configuration
ALTER TABLE "user_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cms_hero" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cms_news" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cms_albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cms_album_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cms_achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cms_media" ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read published cms_hero') THEN
    CREATE POLICY "Allow public read published cms_hero" ON "cms_hero" FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read published cms_news') THEN
    CREATE POLICY "Allow public read published cms_news" ON "cms_news" FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read published cms_albums') THEN
    CREATE POLICY "Allow public read published cms_albums" ON "cms_albums" FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read published cms_album_photos') THEN
    CREATE POLICY "Allow public read published cms_album_photos" ON "cms_album_photos" FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read published cms_achievements') THEN
    CREATE POLICY "Allow public read published cms_achievements" ON "cms_achievements" FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read cms_media') THEN
    CREATE POLICY "Allow public read cms_media" ON "cms_media" FOR SELECT USING (true);
  END IF;
END $$;
