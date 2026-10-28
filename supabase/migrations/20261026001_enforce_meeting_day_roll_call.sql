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
  meeting_session_date text;
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

  select meeting.data ->> 'status', meeting.data ->> 'sessionDate'
  into meeting_status, meeting_session_date
  from public.portal_records meeting
  where meeting.id = p_data ->> 'meetingId'
    and meeting.record_type = 'meeting'
    and meeting.trashed_at is null
  for share;

  if meeting_status is distinct from 'Open' then
    raise exception 'This meeting is not currently accepting attendance.'
      using errcode = '22023';
  end if;

  if meeting_session_date is distinct from
      to_char(now() at time zone 'Africa/Nairobi', 'YYYY-MM-DD')
    or p_data ->> 'sessionDate' is distinct from meeting_session_date then
    raise exception 'Roll call is only valid on its scheduled date.'
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
