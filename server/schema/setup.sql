-- Complete Database Setup for QR Order System
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- 1. CREATE ADMINS TABLE
-- ============================================

create table if not exists public.admins (
  id uuid not null default gen_random_uuid(),
  username text not null unique,
  password text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint admins_pkey primary key (id)
);

-- ============================================
-- 2. CREATE TRIGGER FUNCTION (if not exists)
-- ============================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- 3. CREATE TRIGGERS FOR ALL TABLES
-- ============================================

-- Trigger for admins
drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
  before update on public.admins
  for each row
  execute function update_updated_at_column();

-- Trigger for menu_items (should already exist)
drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at
  before update on public.menu_items
  for each row
  execute function update_updated_at_column();

-- Trigger for orders (should already exist)
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function update_updated_at_column();

-- ============================================
-- 4. DISABLE RLS OR CREATE PERMISSIVE POLICIES
-- ============================================

-- Option A: Disable RLS entirely (simpler for development)
alter table public.admins disable row level security;
alter table public.menu_items disable row level security;
alter table public.orders disable row level security;

-- Option B: If you want RLS enabled, use these policies instead
-- (Comment out the "disable" commands above and uncomment below)

/*
-- Enable RLS
alter table public.admins enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

-- Drop existing policies if any
drop policy if exists "Enable all access for authenticated users" on public.admins;
drop policy if exists "Enable all access for authenticated users" on public.menu_items;
drop policy if exists "Enable all access for authenticated users" on public.orders;

-- Create permissive policies for all operations
create policy "Enable all access for authenticated users"
  on public.admins for all
  using (true)
  with check (true);

create policy "Enable all access for authenticated users"
  on public.menu_items for all
  using (true)
  with check (true);

create policy "Enable all access for authenticated users"
  on public.orders for all
  using (true)
  with check (true);
*/

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if tables exist
select 'admins' as table_name, count(*) as row_count from public.admins
union all
select 'menu_items', count(*) from public.menu_items
union all
select 'orders', count(*) from public.orders;
