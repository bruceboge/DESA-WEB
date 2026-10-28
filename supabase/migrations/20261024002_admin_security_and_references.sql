create table if not exists public.portal_admin_sessions (
  access_token_hash text primary key check (access_token_hash ~ '^[0-9a-f]{64}$'),
  auth_user_id uuid not null,
  email text not null,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists portal_admin_sessions_expiry_idx
  on public.portal_admin_sessions (expires_at)
  where revoked_at is null;

alter table public.portal_admin_sessions enable row level security;
revoke all on public.portal_admin_sessions from public, anon, authenticated;
grant select, insert, update, delete on public.portal_admin_sessions to service_role;

create table if not exists public.portal_admin_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null,
  actor_email text not null,
  action text not null,
  resource_type text,
  resource_id text,
  created_at timestamptz not null default now()
);

create index if not exists portal_admin_audit_events_created_idx
  on public.portal_admin_audit_events (created_at desc);

create index if not exists portal_admin_audit_events_actor_idx
  on public.portal_admin_audit_events (actor_user_id, created_at desc);

alter table public.portal_admin_audit_events enable row level security;
revoke all on public.portal_admin_audit_events from public, anon, authenticated;
grant select, insert on public.portal_admin_audit_events to service_role;

create table if not exists public.admin_auth_rate_limits (
  bucket_key text primary key check (bucket_key ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null check (request_count > 0)
);

alter table public.admin_auth_rate_limits enable row level security;
revoke all on public.admin_auth_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.admin_auth_rate_limits to service_role;

create or replace function public.check_admin_auth_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if p_bucket_key !~ '^[0-9a-f]{64}$'
    or p_limit < 1
    or p_window_seconds < 1 then
    raise exception 'Invalid admin authentication rate limit parameters.'
      using errcode = '22023';
  end if;

  insert into public.admin_auth_rate_limits (bucket_key, window_started_at, request_count)
  values (p_bucket_key, now(), 1)
  on conflict (bucket_key) do update
    set window_started_at = case
          when admin_auth_rate_limits.window_started_at
            <= now() - make_interval(secs => p_window_seconds)
          then now()
          else admin_auth_rate_limits.window_started_at
        end,
        request_count = case
          when admin_auth_rate_limits.window_started_at
            <= now() - make_interval(secs => p_window_seconds)
          then 1
          else admin_auth_rate_limits.request_count + 1
        end
  returning request_count into current_count;

  delete from public.admin_auth_rate_limits
  where window_started_at < now() - interval '1 day';

  return current_count <= p_limit;
end;
$$;

revoke all on function public.check_admin_auth_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_admin_auth_rate_limit(text, integer, integer)
  to service_role;

create table if not exists public.portal_reference_counters (
  reference_prefix text primary key,
  next_value bigint not null check (next_value > 0)
);

alter table public.portal_reference_counters enable row level security;
revoke all on public.portal_reference_counters from public, anon, authenticated;
grant select, insert, update, delete on public.portal_reference_counters to service_role;

create or replace function public.next_portal_reference(p_prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  reference_number bigint;
begin
  if p_prefix !~ '^(DESA-DKUT|MSG-[0-9]{4}|RC-[0-9]{4})$' then
    raise exception 'Invalid portal reference prefix.'
      using errcode = '22023';
  end if;

  insert into public.portal_reference_counters (reference_prefix, next_value)
  values (p_prefix, 2)
  on conflict (reference_prefix) do update
    set next_value = portal_reference_counters.next_value + 1
  returning next_value - 1 into reference_number;

  return p_prefix || '-' || lpad(
    reference_number::text,
    greatest(6, length(reference_number::text)),
    '0'
  );
end;
$$;

revoke all on function public.next_portal_reference(text)
  from public, anon, authenticated;
grant execute on function public.next_portal_reference(text) to service_role;
