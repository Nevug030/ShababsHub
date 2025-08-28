-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- Create rooms table
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- Create room_players table
create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id text not null,
  display_name text not null,
  is_host boolean not null default false,
  joined_at timestamptz not null default now()
);

-- Create indexes for performance
create index if not exists idx_room_players_room_id on public.room_players(room_id);
create unique index if not exists idx_room_players_unique on public.room_players(room_id, player_id);

-- Enable Row Level Security
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;

-- Create RLS policies (MVP - permissive for development)
-- TODO: Harden these policies for production

-- Rooms policies
create policy "rooms_select_all" on public.rooms 
  for select using (true);

create policy "rooms_insert_all" on public.rooms 
  for insert with check (true);

create policy "rooms_update_all" on public.rooms 
  for update using (true);

-- Room players policies  
create policy "room_players_select_all" on public.room_players 
  for select using (true);

create policy "room_players_insert_all" on public.room_players 
  for insert with check (true);

create policy "room_players_delete_all" on public.room_players 
  for delete using (true);

-- Enable realtime for tables
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;

