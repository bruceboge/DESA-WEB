update public.portal_records
set data = data - 'secret',
    updated_at = now()
where data ? 'secret';

update public.sheet_sync_outbox
set payload = payload - 'secret'
where payload ? 'secret';
