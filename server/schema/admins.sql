-- Admin table schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create admins table
create table if not exists public.admins (
  id uuid not null default gen_random_uuid(),
  username text not null unique,
  password text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint admins_pkey primary key (id)
);

-- Create trigger function for updated_at if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for admins table
create trigger set_admins_updated_at
  before update on admins
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
alter table public.admins enable row level security;

-- Create policy to allow service role access (adjust as needed)
create policy "Enable all access for service role"
  on public.admins
  for all
  using (true);
