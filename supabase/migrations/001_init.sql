-- 1. TABLES -------------------------------------------------------
create table slots (
  id           uuid primary key default gen_random_uuid(),
  starts_at    timestamptz not null,
  duration_min int not null check (duration_min between 5 and 480),
  status       text not null default 'open' check (status in ('open', 'booked')),
  created_at   timestamptz not null default now(),
  unique (starts_at)                -- no two slots at the same start time
);

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null unique references slots(id) on delete cascade,  -- one booking per slot
  guest_name  text not null check (length(guest_name) between 1 and 100),
  guest_email text not null check (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at  timestamptz not null default now()
);

-- 2. ROW LEVEL SECURITY: which rows -------------------------------
alter table slots    enable row level security;
alter table bookings enable row level security;   -- no policies = invisible to the browser

create policy "anyone can read slots" on slots
  for select using (true);

create policy "anyone can create open future slots" on slots
  for insert with check (status = 'open' and starts_at > now());

-- 3. GRANTS: whether a role may touch the table at all ------------
revoke all on slots, bookings from anon, authenticated;
grant select, insert on slots to anon;
-- bookings: deliberately no grant, so guest emails can never be read

-- 4. BOOKING FUNCTION ---------------------------------------------
create or replace function book_slot(p_slot_id uuid, p_name text, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only succeeds if the slot is open AND still in the future.
  -- Postgres locks the row, so two simultaneous calls run one after the other.
  update slots set status = 'booked'
  where id = p_slot_id and status = 'open' and starts_at > now();

  if not found then
    raise exception 'SLOT_TAKEN';
  end if;

  insert into bookings (slot_id, guest_name, guest_email)
  values (p_slot_id, trim(p_name), trim(p_email));
end;
$$;

grant execute on function book_slot(uuid, text, text) to anon;