-- Fix: Add missing metadata column to notifications table
-- Run this in Supabase Dashboard > SQL Editor for project xfkfzpldrwdcjmzzwymz

alter table if exists public.notifications
  add column if not exists metadata jsonb not null default '{}'::jsonb;
