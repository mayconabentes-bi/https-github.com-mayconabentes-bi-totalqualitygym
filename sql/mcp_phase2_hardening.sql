-- MCP Phase 2: read RPCs + tenant write guards
-- Apply in Supabase SQL Editor before running smoke tests.

create or replace function public.mcp_current_tenant_id()
returns uuid
language plpgsql
stable
as $$
declare
  claims jsonb;
  candidate text;
begin
  begin
    claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  exception
    when others then
      claims := null;
  end;

  candidate := coalesce(
    claims->>'tenant_id',
    claims->'app_metadata'->>'tenant_id',
    claims->'user_metadata'->>'tenant_id'
  );

  if candidate is null or btrim(candidate) = '' then
    return null;
  end if;

  return candidate::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function public.mcp_enforce_tenant(p_tenant_id uuid)
returns void
language plpgsql
stable
as $$
declare
  current_tenant uuid;
begin
  current_tenant := public.mcp_current_tenant_id();

  if current_tenant is null then
    raise exception 'TENANT_CONTEXT_REQUIRED';
  end if;

  if p_tenant_id is null then
    raise exception 'TENANT_ID_REQUIRED';
  end if;

  if p_tenant_id <> current_tenant then
    raise exception 'TENANT_MISMATCH';
  end if;
end;
$$;

create or replace function public.mcp_guard_tenant_write()
returns trigger
language plpgsql
as $$
begin
  if new.tenant_id is null then
    raise exception 'TENANT_ID_REQUIRED';
  end if;

  if tg_op = 'UPDATE' and new.tenant_id <> old.tenant_id then
    raise exception 'TENANT_ID_IMMUTABLE';
  end if;

  perform public.mcp_enforce_tenant(new.tenant_id);
  return new;
end;
$$;

-- Read RPCs (MCP tools entrypoints)
create or replace function public.mcp_health()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', true,
    'service', 'supabase',
    'tenant_id', public.mcp_current_tenant_id(),
    'timestamp', now()
  );
$$;

create or replace function public.mcp_list_non_conformities(
  p_limit int default 20,
  p_status text default null
)
returns table (
  id uuid,
  tenant_id uuid,
  source text,
  description text,
  immediate_action text,
  gravity text,
  status text,
  identified_by_id uuid,
  created_at timestamptz
)
language plpgsql
stable
as $$
begin
  if to_regclass('public.non_conformities') is null then
    return;
  end if;

  return query execute
    'select
      nc.id,
      nc.tenant_id,
      nc.source::text,
      nc.description,
      nc.immediate_action,
      nc.gravity::text,
      nc.status::text,
      nc.identified_by_id,
      nc.created_at
    from public.non_conformities nc
    where nc.tenant_id = public.mcp_current_tenant_id()
      and ($1 is null or nc.status::text = $1)
    order by nc.created_at desc
    limit $2'
  using p_status, least(greatest(coalesce(p_limit, 20), 1), 200);
end;
$$;

create or replace function public.mcp_list_corrective_actions(
  p_limit int default 20,
  p_status text default null
)
returns table (
  id uuid,
  tenant_id uuid,
  nc_id uuid,
  root_cause text,
  proposed_action text,
  deadline date,
  status text,
  created_at timestamptz
)
language plpgsql
stable
as $$
begin
  if to_regclass('public.corrective_actions') is null then
    return;
  end if;

  return query execute
    'select
      ca.id,
      ca.tenant_id,
      ca.nc_id,
      ca.root_cause,
      ca.proposed_action,
      ca.deadline,
      ca.status::text,
      ca.created_at
    from public.corrective_actions ca
    where ca.tenant_id = public.mcp_current_tenant_id()
      and ($1 is null or ca.status::text = $1)
    order by ca.created_at desc
    limit $2'
  using p_status, least(greatest(coalesce(p_limit, 20), 1), 200);
end;
$$;

create or replace function public.mcp_list_assets_attention(
  p_limit int default 20
)
returns table (
  id uuid,
  tenant_id uuid,
  name varchar,
  category text,
  status text,
  next_audit_date date
)
language plpgsql
stable
as $$
begin
  if to_regclass('public.physical_assets') is null then
    return;
  end if;

  return query execute
    'select
      pa.id,
      pa.tenant_id,
      pa.name,
      pa.category::text,
      pa.status::text,
      pa.next_audit_date
    from public.physical_assets pa
    where pa.tenant_id = public.mcp_current_tenant_id()
      and (
        pa.status::text <> ''CONFORME''
        or pa.next_audit_date <= current_date + interval ''30 day''
      )
    order by pa.next_audit_date asc
    limit $1'
  using least(greatest(coalesce(p_limit, 20), 1), 200);
end;
$$;

-- Guards and RLS hardening
alter table if exists public.non_conformities enable row level security;
alter table if exists public.corrective_actions enable row level security;

do $$
begin
  if to_regclass('public.non_conformities') is not null then
    if exists (
      select 1 from pg_trigger
      where tgname = 'trg_mcp_guard_non_conformities'
    ) then
      drop trigger trg_mcp_guard_non_conformities on public.non_conformities;
    end if;
    create trigger trg_mcp_guard_non_conformities
      before insert or update on public.non_conformities
      for each row
      execute function public.mcp_guard_tenant_write();
  end if;

  if to_regclass('public.corrective_actions') is not null then
    if exists (
      select 1 from pg_trigger
      where tgname = 'trg_mcp_guard_corrective_actions'
    ) then
      drop trigger trg_mcp_guard_corrective_actions on public.corrective_actions;
    end if;
    create trigger trg_mcp_guard_corrective_actions
      before insert or update on public.corrective_actions
      for each row
      execute function public.mcp_guard_tenant_write();
  end if;
end $$;

do $$
begin
  if to_regclass('public.non_conformities') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'non_conformities'
        and policyname = 'mcp_nc_tenant_select'
    ) then
      create policy mcp_nc_tenant_select on public.non_conformities
        for select
        using (tenant_id = public.mcp_current_tenant_id());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'non_conformities'
        and policyname = 'mcp_nc_tenant_write'
    ) then
      create policy mcp_nc_tenant_write on public.non_conformities
        for all
        using (tenant_id = public.mcp_current_tenant_id())
        with check (tenant_id = public.mcp_current_tenant_id());
    end if;
  end if;

  if to_regclass('public.corrective_actions') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'corrective_actions'
        and policyname = 'mcp_rac_tenant_select'
    ) then
      create policy mcp_rac_tenant_select on public.corrective_actions
        for select
        using (tenant_id = public.mcp_current_tenant_id());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'corrective_actions'
        and policyname = 'mcp_rac_tenant_write'
    ) then
      create policy mcp_rac_tenant_write on public.corrective_actions
        for all
        using (tenant_id = public.mcp_current_tenant_id())
        with check (tenant_id = public.mcp_current_tenant_id());
    end if;
  end if;
end $$;

grant execute on function public.mcp_health() to authenticated, service_role;
grant execute on function public.mcp_list_non_conformities(int, text) to authenticated, service_role;
grant execute on function public.mcp_list_corrective_actions(int, text) to authenticated, service_role;
grant execute on function public.mcp_list_assets_attention(int) to authenticated, service_role;
