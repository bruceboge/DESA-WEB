create table if not exists public.portal_records (
  id text primary key,
  record_type text not null check (
    record_type in (
      'article',
      'gallery',
      'news',
      'membership',
      'registration',
      'contact',
      'gala',
      'roll_call'
    )
  ),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_records_type_created_idx
  on public.portal_records (record_type, created_at desc);

create index if not exists portal_records_member_reg_idx
  on public.portal_records ((data ->> 'regNumber'))
  where record_type in ('membership', 'registration');

alter table public.portal_records enable row level security;
revoke all on public.portal_records from anon, authenticated;
grant select, insert, update, delete on public.portal_records to service_role;

create table if not exists public.sheet_sync_outbox (
  id bigint generated always as identity primary key,
  record_id text not null,
  record_type text not null,
  operation text not null check (operation in ('upsert', 'delete')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent')),
  attempts integer not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists sheet_sync_pending_idx
  on public.sheet_sync_outbox (next_attempt_at, created_at)
  where status = 'pending';

alter table public.sheet_sync_outbox enable row level security;
revoke all on public.sheet_sync_outbox from anon, authenticated;
grant select, insert, update, delete on public.sheet_sync_outbox to service_role;

create or replace function public.save_portal_record(
  p_record_id text,
  p_record_type text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.portal_records (id, record_type, data)
  values (p_record_id, p_record_type, p_data)
  on conflict (id) do update
    set record_type = excluded.record_type,
        data = excluded.data,
        updated_at = now();
end;
$$;

create or replace function public.delete_portal_record(
  p_record_id text,
  p_record_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.portal_records
  where id = p_record_id and record_type = p_record_type;
  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

create or replace function public.enqueue_portal_record_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    insert into public.sheet_sync_outbox (record_id, record_type, operation, payload)
    values (old.id, old.record_type, 'delete', old.data);
    return old;
  end if;

  insert into public.sheet_sync_outbox (record_id, record_type, operation, payload)
  values (new.id, new.record_type, 'upsert', new.data);
  return new;
end;
$$;

drop trigger if exists portal_record_sync_trigger on public.portal_records;
create trigger portal_record_sync_trigger
after insert or update or delete on public.portal_records
for each row execute function public.enqueue_portal_record_sync();

create or replace function public.claim_sheet_sync_events(p_limit integer default 10)
returns setof public.sheet_sync_outbox
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with ready as (
    select current_event.id
    from public.sheet_sync_outbox current_event
    where (
      (current_event.status = 'pending' and current_event.next_attempt_at <= now())
      or (current_event.status = 'processing' and current_event.locked_at < now() - interval '5 minutes')
    )
      and not exists (
        select 1
        from public.sheet_sync_outbox earlier_event
        where earlier_event.record_id = current_event.record_id
          and earlier_event.id < current_event.id
          and earlier_event.status <> 'sent'
      )
    order by current_event.id
    for update of current_event skip locked
    limit least(greatest(p_limit, 1), 25)
  )
  update public.sheet_sync_outbox q
  set status = 'processing', locked_at = now()
  from ready
  where q.id = ready.id
  returning q.*;
end;
$$;

create or replace function public.finish_sheet_sync_event(
  p_event_id bigint,
  p_success boolean,
  p_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.sheet_sync_outbox
  set status = case when p_success then 'sent' else 'pending' end,
      attempts = attempts + 1,
      last_error = case when p_success then null else left(coalesce(p_error, 'Sync failed'), 500) end,
      next_attempt_at = case
        when p_success then now()
        else now() + make_interval(secs => least(3600, power(2, least(attempts, 11))::integer))
      end,
      locked_at = null,
      sent_at = case when p_success then now() else null end
  where id = p_event_id and status = 'processing';

  if not found then
    raise exception 'Sync event % was not in processing state', p_event_id;
  end if;
end;
$$;

revoke all on function public.save_portal_record(text, text, jsonb) from public, anon, authenticated;
revoke all on function public.delete_portal_record(text, text) from public, anon, authenticated;
revoke all on function public.claim_sheet_sync_events(integer) from public, anon, authenticated;
revoke all on function public.finish_sheet_sync_event(bigint, boolean, text) from public, anon, authenticated;
grant execute on function public.save_portal_record(text, text, jsonb) to service_role;
grant execute on function public.delete_portal_record(text, text) to service_role;
grant execute on function public.claim_sheet_sync_events(integer) to service_role;
grant execute on function public.finish_sheet_sync_event(bigint, boolean, text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'desa-media',
  'desa-media',
  true,
  4718592,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view DESA media" on storage.objects;
create policy "Public can view DESA media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'desa-media');
