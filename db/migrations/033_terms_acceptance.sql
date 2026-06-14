-- Records when each user accepted the current Terms of Service.
-- Stamped at the moment they tick the acceptance box at the bottom
-- of either /onboarding (students) or /onboarding/company.

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

-- Log of users who've exercised the 30-day arbitration opt-out
-- under Section 18 of the Terms. Populated manually by admin when
-- an opt-out email lands at hello@runeships.com — no UI yet.

create table if not exists public.arbitration_opt_outs (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_id uuid references auth.users(id) on delete set null,
  opt_out_received_at timestamptz not null default now(),
  notes text
);

create index if not exists arbitration_opt_outs_email_idx
  on public.arbitration_opt_outs (user_email);

-- Restrict to admins only — the table holds nothing the user needs
-- to see and writes happen via service_role.
alter table public.arbitration_opt_outs enable row level security;
