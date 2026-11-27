-- Persistent scraper run summaries, independent of Vercel log retention.

create table if not exists public.scraper_runs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  dry_run         boolean not null,
  inserted        integer not null default 0 check (inserted >= 0),
  notified        boolean not null default false,
  failed_sources  integer not null default 0 check (failed_sources >= 0),
  results         jsonb not null default '[]'::jsonb
    check (jsonb_typeof(results) = 'array')
);

create index if not exists scraper_runs_created_idx
  on public.scraper_runs (created_at desc);

alter table public.scraper_runs enable row level security;

create policy "admins can read scraper runs"
  on public.scraper_runs for select
  using (public.is_admin());

revoke all on public.scraper_runs from anon, authenticated;
grant select on public.scraper_runs to authenticated;
grant insert on public.scraper_runs to service_role;
