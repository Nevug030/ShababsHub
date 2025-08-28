-- Quiz System Migration
-- Adds tables for quiz sessions, rounds, and answers

-- Quiz sessions - one active per room
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  status text not null default 'idle', -- idle|running|ended
  current_round int not null default 0,
  created_by text not null, -- player_id of the host
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  
  -- Ensure only one active session per room
  constraint unique_active_session unique (room_id) deferrable initially deferred
);

-- Quiz rounds - snapshot of each round for history
create table if not exists public.quiz_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  round_no int not null,
  question text not null,
  choices jsonb not null, -- array of strings
  correct_index int not null,
  started_at timestamptz not null default now(),
  revealed_at timestamptz,
  
  constraint unique_session_round unique (session_id, round_no)
);

-- Player answers for each round
create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.quiz_rounds(id) on delete cascade,
  player_id text not null,
  display_name text not null,
  choice_index int not null,
  submitted_at timestamptz not null default now(),
  is_correct boolean,
  
  constraint unique_round_player unique (round_id, player_id)
);

-- Indexes for performance
create index if not exists idx_quiz_sessions_room_id on public.quiz_sessions(room_id);
create index if not exists idx_quiz_sessions_status on public.quiz_sessions(status);
create index if not exists idx_quiz_rounds_session_id on public.quiz_rounds(session_id);
create index if not exists idx_quiz_answers_round_id on public.quiz_answers(round_id);
create index if not exists idx_quiz_answers_player_id on public.quiz_answers(player_id);

-- Enable Row Level Security
alter table public.quiz_sessions enable row level security;
alter table public.quiz_rounds enable row level security;
alter table public.quiz_answers enable row level security;

-- RLS Policies (MVP - permissive for development)
create policy "quiz_sessions_select_all" on public.quiz_sessions 
  for select using (true);
create policy "quiz_sessions_insert_all" on public.quiz_sessions 
  for insert with check (true);
create policy "quiz_sessions_update_all" on public.quiz_sessions 
  for update using (true);
create policy "quiz_sessions_delete_all" on public.quiz_sessions 
  for delete using (true);

create policy "quiz_rounds_select_all" on public.quiz_rounds 
  for select using (true);
create policy "quiz_rounds_insert_all" on public.quiz_rounds 
  for insert with check (true);
create policy "quiz_rounds_update_all" on public.quiz_rounds 
  for update using (true);

create policy "quiz_answers_select_all" on public.quiz_answers 
  for select using (true);
create policy "quiz_answers_insert_all" on public.quiz_answers 
  for insert with check (true);
create policy "quiz_answers_update_all" on public.quiz_answers 
  for update using (true);

-- Enable realtime for quiz tables
alter publication supabase_realtime add table public.quiz_sessions;
alter publication supabase_realtime add table public.quiz_rounds;
alter publication supabase_realtime add table public.quiz_answers;
