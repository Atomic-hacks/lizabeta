-- =========================================================================
-- ELIZABETH'S UNIVERSE — the time capsule
--
-- Model: a capsule is append-only until its unlock date. Entries can be
-- added at any time; nothing can be read back until `unlock_at` has passed.
-- That rule is enforced in the API (and therefore server-side), not in the
-- browser, so a client clock cannot open it early.
--
-- Security: RLS is on with NO policies and privileges are revoked from the
-- public roles, so the anon key cannot touch this table at all. Every
-- operation goes through a route handler using the service-role key. The
-- recovery code is never stored — only its SHA-256 hash — so a database
-- leak does not open the capsule, and a capsule cannot be found without it.
-- =========================================================================

create extension if not exists "pgcrypto";

create table if not exists public.time_capsules (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  unlock_at timestamptz not null,
  -- [{ written_at, letter, hopes, memory, prediction, photo }]
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists time_capsules_code_hash_idx on public.time_capsules (code_hash);

alter table public.time_capsules enable row level security;

-- Intentionally no policies: anon and authenticated get nothing.
-- The service-role key used by the server routes bypasses RLS.
revoke all on public.time_capsules from anon, authenticated;

comment on table public.time_capsules is
  'Append-only birthday capsules. Server-only access; unlock date enforced in /api/capsule/open.';
