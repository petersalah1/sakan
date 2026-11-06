-- Migration 002: Add DELETE and UPDATE policies and clean inactive records
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pehxnzewnhmocxomwmmg/sql

-- 1. Enable delete and update policies on settlements
CREATE POLICY IF NOT EXISTS "Public delete settlements" ON public.settlements FOR DELETE USING (true);
CREATE POLICY IF NOT EXISTS "Public update settlements" ON public.settlements FOR UPDATE USING (true);

-- 2. Clean up all old test settlements
DELETE FROM public.settlements;

-- 3. Delete all inactive old test profiles permanently (keeps only Peter Salah)
DELETE FROM public.profiles WHERE id != '7585eb0f-839d-4a68-93ce-c114bbb1001a';
