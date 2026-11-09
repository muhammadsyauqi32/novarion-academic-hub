-- Migration: Create short_links table for custom URL shortener (nova.link)

CREATE TABLE IF NOT EXISTS "short_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "original_url" text NOT NULL,
  "slug" varchar(100) NOT NULL,
  "title" varchar(255),
  "description" text,
  "click_count" integer DEFAULT 0 NOT NULL,
  "user_id" uuid REFERENCES "profiles"("id") ON DELETE CASCADE,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "short_links_slug_unique" UNIQUE("slug")
);

CREATE UNIQUE INDEX IF NOT EXISTS "short_links_slug_idx" ON "short_links" ("slug");
CREATE INDEX IF NOT EXISTS "short_links_user_id_idx" ON "short_links" ("user_id");

-- RLS policies for short_links
ALTER TABLE "short_links" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'short_links' AND policyname = 'short_links_public_read'
  ) THEN
    CREATE POLICY "short_links_public_read" ON "short_links"
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'short_links' AND policyname = 'short_links_user_manage'
  ) THEN
    CREATE POLICY "short_links_user_manage" ON "short_links"
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

