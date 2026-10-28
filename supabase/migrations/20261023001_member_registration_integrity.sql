create or replace function public.enforce_unique_member_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_reg_number text;
begin
  if new.record_type not in ('membership', 'registration') then
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
before insert or update of record_type, data on public.portal_records
for each row execute function public.enforce_unique_member_registration();

revoke all on function public.enforce_unique_member_registration() from public, anon, authenticated;
