-- Migration 002: Add DELETE and UPDATE policies for settlements
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pehxnzewnhmocxomwmmg/sql

-- 1. Enable delete and update policies on settlements
CREATE POLICY "Public delete settlements" ON public.settlements FOR DELETE USING (true);
CREATE POLICY "Public update settlements" ON public.settlements FOR UPDATE USING (true);

-- 2. Optional: Clean up existing duplicate test settlements (keeps only 1 row)
DELETE FROM public.settlements 
WHERE id NOT IN (
  SELECT id FROM public.settlements ORDER BY settled_at ASC LIMIT 1
);

