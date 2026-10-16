-- Migration 0001: Add must_change_password column to profiles table
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "must_change_password" boolean DEFAULT true NOT NULL;
