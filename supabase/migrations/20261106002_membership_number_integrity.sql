do $$
begin
  if exists (
    select 1
    from public.portal_records
    where record_type in ('membership', 'registration')
      and nullif(btrim(data ->> 'memberId'), '') is not null
    group by lower(btrim(data ->> 'memberId'))
    having count(*) > 1
  ) then
    raise exception
      'Duplicate membership numbers exist. Resolve them before applying this migration.';
  end if;
end;
$$;

create unique index if not exists portal_records_member_id_unique_idx
  on public.portal_records (lower(btrim(data ->> 'memberId')))
  where record_type in ('membership', 'registration')
    and nullif(btrim(data ->> 'memberId'), '') is not null;
