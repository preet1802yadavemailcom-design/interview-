-- ==============================================================================
-- InterviewCapture — Production PostgreSQL Schema & Supabase Configuration
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project and navigate to the "SQL Editor".
-- 3. Paste and run this ENTIRE script. It is completely idempotent and safe to re-run.
-- 4. Navigate to "Authentication" > "Sign In / Providers" and enable "Anonymous Sign-Ins".
-- 5. Under "Database" > "Replication", verify that Realtime is enabled.
-- ==============================================================================

-- Enable pgcrypto extension for UUID generation
create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. Table: interview_rooms
-- ------------------------------------------------------------------------------
create table if not exists public.interview_rooms (
  room_code text primary key check (room_code ~ '^[A-HJ-NP-Z2-9]{12}$'),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '4 hours')
);

create index if not exists idx_interview_rooms_expires_at 
  on public.interview_rooms(expires_at);

-- ------------------------------------------------------------------------------
-- 2. Table: interview_room_members
-- ------------------------------------------------------------------------------
create table if not exists public.interview_room_members (
  room_code text not null references public.interview_rooms(room_code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('host', 'guest', 'participant')),
  display_name text not null check (char_length(display_name) between 1 and 40),
  joined_at timestamptz not null default now(),
  primary key (room_code, user_id)
);

create index if not exists idx_interview_members_user 
  on public.interview_room_members(user_id);

-- ------------------------------------------------------------------------------
-- 3. Row-Level Security (RLS)
-- ------------------------------------------------------------------------------
alter table public.interview_rooms enable row level security;
alter table public.interview_room_members enable row level security;

-- Authenticated users may read only their own membership record.
-- All inserts, updates, and deletes MUST occur via the vetted RPC functions below.
drop policy if exists "Users can read their own room membership" on public.interview_room_members;
create policy "Users can read their own room membership"
  on public.interview_room_members
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Restrict direct table modifications from anonymous/authenticated public roles
revoke all on public.interview_rooms from anon, authenticated;
revoke all on public.interview_room_members from anon, authenticated;
grant select on public.interview_room_members to authenticated;

-- ------------------------------------------------------------------------------
-- 4. RPC: create_interview_room
-- ------------------------------------------------------------------------------
create or replace function public.create_interview_room(
  p_room_code text, 
  p_display_name text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := left(trim(coalesce(p_display_name, 'Interviewer')), 40);
begin
  if v_user_id is null then 
    raise exception 'Authentication required: please ensure anonymous sign-in is active.'; 
  end if;

  if p_room_code !~ '^[A-HJ-NP-Z2-9]{12}$' then 
    raise exception 'Invalid room code format. Expected 12 alphanumeric characters.'; 
  end if;

  if v_name = '' then 
    v_name := 'Interviewer'; 
  end if;

  -- Clean up expired rooms
  delete from public.interview_rooms where expires_at <= now();

  -- Insert room record (expires in 4 hours)
  insert into public.interview_rooms(room_code, host_user_id, expires_at)
  values (p_room_code, v_user_id, now() + interval '4 hours');

  -- Reserve host seat
  insert into public.interview_room_members(room_code, user_id, role, display_name)
  values (p_room_code, v_user_id, 'host', v_name);

  return p_room_code;
end;
$$;

-- ------------------------------------------------------------------------------
-- 5. RPC: join_interview_room
-- ------------------------------------------------------------------------------
create or replace function public.join_interview_room(
  p_room_code text, 
  p_display_name text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room public.interview_rooms%rowtype;
  v_existing_role text;
  v_name text := left(trim(coalesce(p_display_name, 'Participant')), 40);
  v_member_count int;
begin
  if v_user_id is null then 
    raise exception 'Authentication required: please ensure anonymous sign-in is active.'; 
  end if;

  if p_room_code !~ '^[A-HJ-NP-Z2-9]{12}$' then 
    raise exception 'Invalid room code format.'; 
  end if;

  if v_name = '' then 
    v_name := 'Participant'; 
  end if;

  -- Lock room row for concurrency check
  select * into v_room
  from public.interview_rooms
  where room_code = p_room_code
  for update;

  if not found then 
    raise exception 'Room not found. Check the invite code or ask the host to create a new room.'; 
  end if;

  if v_room.expires_at <= now() then
    delete from public.interview_rooms where room_code = p_room_code;
    raise exception 'This interview room has expired. Ask the host for a fresh invite link.';
  end if;

  -- Check if current user is already registered in this room
  select role into v_existing_role
  from public.interview_room_members
  where room_code = p_room_code and user_id = v_user_id;

  if found then
    if v_existing_role = 'host' then 
      raise exception 'This browser created the room. To test as a guest, open the invite link in an incognito window or separate browser.'; 
    end if;
    return v_existing_role;
  end if;

  -- Support up to 100 participants per room
  select count(*) into v_member_count
  from public.interview_room_members 
  where room_code = p_room_code;

  if v_member_count >= 100 then
    raise exception 'This interview room is already full (maximum 100 participants reached).';
  end if;

  -- Reserve participant seat
  insert into public.interview_room_members(room_code, user_id, role, display_name)
  values (p_room_code, v_user_id, 'participant', v_name);

  return 'participant';
end;
$$;

-- ------------------------------------------------------------------------------
-- 6. RPC: leave_interview_room
-- ------------------------------------------------------------------------------
create or replace function public.leave_interview_room(p_room_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
begin
  if v_user_id is null then return; end if;

  select role into v_role 
  from public.interview_room_members
  where room_code = p_room_code and user_id = v_user_id;

  if v_role = 'host' then
    -- Host leaving closes and destroys the room session for all participants
    delete from public.interview_rooms where room_code = p_room_code and host_user_id = v_user_id;
  elsif v_role = 'guest' then
    -- Guest leaving vacates the guest seat
    delete from public.interview_room_members where room_code = p_room_code and user_id = v_user_id;
  end if;
end;
$$;

-- Grant RPC execution permissions to authenticated users
revoke all on function public.create_interview_room(text, text) from public;
revoke all on function public.join_interview_room(text, text) from public;
revoke all on function public.leave_interview_room(text) from public;
grant execute on function public.create_interview_room(text, text) to authenticated;
grant execute on function public.join_interview_room(text, text) to authenticated;
grant execute on function public.leave_interview_room(text) to authenticated;

-- ------------------------------------------------------------------------------
-- 7. Supabase Realtime Authorization Policies
-- ------------------------------------------------------------------------------
-- Restricts subscription and broadcast on private Realtime channels (topic format `room:<ROOM_CODE>`)
-- ONLY to authenticated users who currently hold a valid membership row in `interview_room_members`.

drop policy if exists "Interview members can read private room signals" on realtime.messages;
create policy "Interview members can read private room signals"
  on realtime.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.interview_room_members m
      where m.room_code = split_part(realtime.topic(), ':', 2)
        and m.user_id = (select auth.uid())
    )
  );

drop policy if exists "Interview members can send private room signals" on realtime.messages;
create policy "Interview members can send private room signals"
  on realtime.messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.interview_room_members m
      where m.room_code = split_part(realtime.topic(), ':', 2)
        and m.user_id = (select auth.uid())
    )
  );

-- NOTICE:
-- No audio, video, or canvas recording data is transmitted to or stored in Supabase.
-- Supabase is strictly utilized for ephemeral presence, WebRTC signaling, and room tokens.
