-- Migration 002: Add DELETE and UPDATE policies for settlements
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pehxnzewnhmocxomwmmg/sql

-- 1. Enable delete and update policies on settlements so they can be deleted from the app
CREATE POLICY IF NOT EXISTS "Public delete settlements" ON public.settlements FOR DELETE USING (true);
CREATE POLICY IF NOT EXISTS "Public update settlements" ON public.settlements FOR UPDATE USING (true);

-- 2. Clean up all old phantom test settlements to start fresh with clean real balances:
DELETE FROM public.settlements;


