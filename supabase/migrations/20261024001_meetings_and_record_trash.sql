alter table public.portal_records
  add column if not exists trashed_at timestamptz;

alter table public.portal_records
  drop constraint if exists portal_records_record_type_check;

alter table public.portal_records
  add constraint portal_records_record_type_check
  check (
    record_type in (
      'article',
      'gallery',
      'news',
      'membership',
      'registration',
      'contact',
      'gala',
      'roll_call',
      'meeting'
    )
  );

create index if not exists portal_records_trash_idx
  on public.portal_records (trashed_at desc, created_at desc)
  where trashed_at is not null;

create index if not exists portal_records_meeting_attendance_idx
  on public.portal_records ((data ->> 'meetingId'), (data ->> 'regNumber'))
  where record_type = 'roll_call' and trashed_at is null;

create or replace function public.enforce_unique_member_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_reg_number text;
begin
  if new.record_type not in ('membership', 'registration') or new.trashed_at is not null then
    return new;
  end if;

  normalized_reg_number := upper(btrim(coalesce(new.data ->> 'regNumber', '')));
  if normalized_reg_number = '' then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(normalized_reg_number, 0));

  if exists (
    select 1
    from public.portal_records existing
    where existing.record_type in ('membership', 'registration')
      and existing.trashed_at is null
      and upper(btrim(existing.data ->> 'regNumber')) = normalized_reg_number
      and existing.id <> new.id
  ) then
    raise exception 'Registration number already exists in the member register.'
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists portal_member_registration_unique on public.portal_records;
create trigger portal_member_registration_unique
before insert or update of record_type, data, trashed_at on public.portal_records
for each row execute function public.enforce_unique_member_registration();

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

  if tg_op = 'UPDATE' and old.trashed_at is null and new.trashed_at is not null then
    insert into public.sheet_sync_outbox (record_id, record_type, operation, payload)
    values (old.id, old.record_type, 'delete', old.data);
    return new;
  end if;

  if new.trashed_at is not null then
    return new;
  end if;

  insert into public.sheet_sync_outbox (record_id, record_type, operation, payload)
  values (new.id, new.record_type, 'upsert', new.data);
  return new;
end;
$$;

create or replace function public.trash_portal_record(
  p_record_id text,
  p_record_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.portal_records
  set trashed_at = now(),
      updated_at = now()
  where id = p_record_id
    and record_type = p_record_type
    and trashed_at is null;
  return found;
end;
$$;

create or replace function public.restore_portal_record(
  p_record_id text,
  p_record_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.portal_records
  set trashed_at = null,
      updated_at = now()
  where id = p_record_id
    and record_type = p_record_type
    and trashed_at is not null;
  return found;
end;
$$;

create or replace function public.permanently_delete_trashed_record(
  p_record_id text,
  p_record_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_record_type = 'meeting' then
    perform 1
    from public.portal_records
    where id = p_record_id
      and record_type = 'meeting'
      and trashed_at is not null
    for update;

    if found and exists (
      select 1
      from public.portal_records attendance
      where attendance.record_type = 'roll_call'
        and attendance.data ->> 'meetingId' = p_record_id
    ) then
      raise exception 'Meetings with attendance history cannot be permanently deleted.'
        using errcode = '23503';
    end if;
  end if;

  delete from public.portal_records
  where id = p_record_id
    and record_type = p_record_type
    and trashed_at is not null;
  return found;
end;
$$;

create or replace function public.record_meeting_attendance(
  p_record_id text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  meeting_status text;
  normalized_reg_number text;
begin
  if jsonb_typeof(p_data) <> 'object'
    or coalesce(p_data ->> 'meetingId', '') = ''
    or coalesce(p_data ->> 'regNumber', '') = '' then
    raise exception 'Invalid meeting attendance details.'
      using errcode = '22023';
  end if;

  normalized_reg_number := upper(btrim(p_data ->> 'regNumber'));
  perform pg_advisory_xact_lock(
    hashtextextended((p_data ->> 'meetingId') || ':' || normalized_reg_number, 0)
  );

  select meeting.data ->> 'status'
  into meeting_status
  from public.portal_records meeting
  where meeting.id = p_data ->> 'meetingId'
    and meeting.record_type = 'meeting'
    and meeting.trashed_at is null
  for share;

  if meeting_status is distinct from 'Open' then
    raise exception 'This meeting is not currently accepting attendance.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.portal_records attendance
    where attendance.record_type = 'roll_call'
      and attendance.trashed_at is null
      and attendance.data ->> 'meetingId' = p_data ->> 'meetingId'
      and upper(btrim(attendance.data ->> 'regNumber')) = normalized_reg_number
  ) then
    raise exception 'Attendance is already recorded for this meeting.'
      using errcode = '23505';
  end if;

  insert into public.portal_records (id, record_type, data)
  values (p_record_id, 'roll_call', p_data);
end;
$$;

revoke all on function public.trash_portal_record(text, text) from public, anon, authenticated;
revoke all on function public.restore_portal_record(text, text) from public, anon, authenticated;
revoke all on function public.permanently_delete_trashed_record(text, text) from public, anon, authenticated;
revoke all on function public.record_meeting_attendance(text, jsonb) from public, anon, authenticated;
revoke all on function public.enforce_unique_member_registration() from public, anon, authenticated;

grant execute on function public.trash_portal_record(text, text) to service_role;
grant execute on function public.restore_portal_record(text, text) to service_role;
grant execute on function public.permanently_delete_trashed_record(text, text) to service_role;
grant execute on function public.record_meeting_attendance(text, jsonb) to service_role;
