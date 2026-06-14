-- Resume PDF generation: track last-generated time (for cooldown)
-- + a public verification code so recruiters can confirm a printed
-- resume matches an active RuneShips profile.
--
-- Note: spec referenced this as migration "020" but 020 through
-- 030 are already taken, so this is 031.

alter table public.profiles
  add column if not exists last_resume_at timestamptz,
  add column if not exists resume_code text unique;

-- Sparse index — verification lookup is the only query that
-- ever filters on resume_code, and most rows have no code yet.
create index if not exists profiles_resume_code_idx
  on public.profiles (resume_code)
  where resume_code is not null;
