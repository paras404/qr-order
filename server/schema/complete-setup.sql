-- ============================================
-- COMPLETE DATABASE SETUP WITH DATA
-- Run this entire script in Supabase SQL Editor
-- ============================================

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
-- 2. CREATE TRIGGER FUNCTION
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

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
  before update on public.admins
  for each row
  execute function update_updated_at_column();

drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at
  before update on public.menu_items
  for each row
  execute function update_updated_at_column();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function update_updated_at_column();

-- ============================================
-- 4. DISABLE RLS FOR DEVELOPMENT
-- ============================================

alter table public.admins disable row level security;
alter table public.menu_items disable row level security;
alter table public.orders disable row level security;

-- ============================================
-- 5. INSERT ADMIN USER
-- Username: admin
-- Password: admin123
-- ============================================

insert into public.admins (username, password)
values (
  'admin',
  '$2a$10$ZpYWFJZKjhi8qiSzE65FM.OMeFiVDynq6fgircsEy.QzNsjNb16Q2'
)
on conflict (username) do nothing;

-- ============================================
-- 6. INSERT MENU ITEMS
-- ============================================

-- Clear existing menu items (optional)
-- delete from public.menu_items;

-- Indian Dishes
insert into public.menu_items (name, description, price, category, image_url, is_available)
values
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 350, 'Indian', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', true),
  ('Paneer Tikka Masala', 'Grilled cottage cheese in rich spiced gravy', 280, 'Indian', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', true),
  ('Biryani', 'Aromatic basmati rice with spiced chicken/veg', 320, 'Indian', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', true),
  ('Dal Makhani', 'Creamy black lentils slow-cooked with butter', 220, 'Indian', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', true);

-- Chinese Dishes
insert into public.menu_items (name, description, price, category, image_url, is_available)
values
  ('Hakka Noodles', 'Stir-fried noodles with vegetables and sauces', 180, 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', true),
  ('Manchurian', 'Deep-fried veggie/chicken balls in tangy sauce', 200, 'Chinese', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400', true),
  ('Fried Rice', 'Wok-tossed rice with vegetables and egg', 160, 'Chinese', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', true);

-- Italian Dishes
insert into public.menu_items (name, description, price, category, image_url, is_available)
values
  ('Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 380, 'Italian', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', true),
  ('Pasta Alfredo', 'Creamy fettuccine pasta with parmesan cheese', 320, 'Italian', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', true),
  ('Lasagna', 'Layered pasta with meat sauce and cheese', 400, 'Italian', 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400', true);

-- Beverages
insert into public.menu_items (name, description, price, category, image_url, is_available)
values
  ('Fresh Lime Soda', 'Refreshing lime juice with soda', 60, 'Beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', true),
  ('Mango Lassi', 'Sweet yogurt drink with mango pulp', 80, 'Beverages', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', true);

-- Desserts
insert into public.menu_items (name, description, price, category, image_url, is_available)
values
  ('Gulab Jamun', 'Soft milk dumplings in sugar syrup', 100, 'Desserts', 'https://images.unsplash.com/photo-1589119908995-c6b8c6d8b5b0?w=400', true),
  ('Tiramisu', 'Italian coffee-flavored dessert', 180, 'Desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', true);

-- ============================================
-- 7. VERIFICATION
-- ============================================

select 'admins' as table_name, count(*) as row_count from public.admins
union all
select 'menu_items', count(*) from public.menu_items
union all
select 'orders', count(*) from public.orders;
