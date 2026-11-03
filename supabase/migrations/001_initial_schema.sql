-- Sakan Split - Database Schema Migration
-- Designed for Supabase PostgreSQL

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Apartments (السكن / الشقق)
CREATE TABLE IF NOT EXISTS public.apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EGP',
    invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles / Members (أعضاء السكن)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_color TEXT NOT NULL DEFAULT 'bg-emerald-500',
    role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Expenses (المصاريف)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    paid_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    category TEXT NOT NULL DEFAULT 'عام',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Expense Splits (تقسيم المصاريف)
CREATE TABLE IF NOT EXISTS public.expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(expense_id, member_id)
);

-- 5. Settlements (تسويات وتصفية الديون)
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    from_member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    to_member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    settled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    CONSTRAINT different_members CHECK (from_member_id <> to_member_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for demo & authenticated access
CREATE POLICY "Public read apartments" ON public.apartments FOR SELECT USING (true);
CREATE POLICY "Public insert apartments" ON public.apartments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update apartments" ON public.apartments FOR UPDATE USING (true);

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public delete profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Public read expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Public read expense_splits" ON public.expense_splits FOR SELECT USING (true);
CREATE POLICY "Public insert expense_splits" ON public.expense_splits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete expense_splits" ON public.expense_splits FOR DELETE USING (true);

CREATE POLICY "Public read settlements" ON public.settlements FOR SELECT USING (true);
CREATE POLICY "Public insert settlements" ON public.settlements FOR INSERT WITH CHECK (true);

