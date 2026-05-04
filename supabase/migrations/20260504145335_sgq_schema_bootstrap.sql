-- SGQ schema bootstrap for MCP phase
-- Creates core SGQ tables if they do not exist in remote project.

do $$
begin
	if not exists (select 1 from pg_type where typname = 'nc_source') then
		create type public.nc_source as enum (
			'Professor',
			'Aluno/Reclamacao',
			'Auditoria Interna',
			'Indicador',
			'Incidente'
		);
	end if;

	if not exists (select 1 from pg_type where typname = 'nc_gravity') then
		create type public.nc_gravity as enum (
			'Baixa',
			'Media',
			'Alta',
			'Critica'
		);
	end if;

	if not exists (select 1 from pg_type where typname = 'nc_status') then
		create type public.nc_status as enum (
			'Aberta',
			'Em Analise',
			'RAC Aberta',
			'Concluida'
		);
	end if;

	if not exists (select 1 from pg_type where typname = 'rac_status') then
		create type public.rac_status as enum (
			'Draft',
			'Approved',
			'Executed',
			'Verified'
		);
	end if;

	if not exists (select 1 from pg_type where typname = 'asset_category') then
		create type public.asset_category as enum (
			'MAQUINA',
			'MATERIAL',
			'INFRA',
			'EQUIPAMENTO_LUTA'
		);
	end if;

	if not exists (select 1 from pg_type where typname = 'asset_status') then
		create type public.asset_status as enum (
			'CONFORME',
			'MANUTENCAO',
			'CRITICO'
		);
	end if;
end $$;

create table if not exists public.non_conformities (
	id uuid primary key default gen_random_uuid(),
	tenant_id uuid not null,
	source public.nc_source not null,
	description text not null,
	immediate_action text not null,
	gravity public.nc_gravity not null default 'Media',
	status public.nc_status not null default 'Aberta',
	identified_by_id uuid not null,
	audit_plan_id uuid,
	created_at timestamptz not null default now()
);

create table if not exists public.corrective_actions (
	id uuid primary key default gen_random_uuid(),
	nc_id uuid not null,
	tenant_id uuid not null,
	identified_by_id uuid not null,
	cause_method text[],
	cause_manpower text[],
	cause_machine text[],
	cause_material text[],
	cause_environment text[],
	cause_measurement text[],
	root_cause text not null,
	proposed_action text,
	deadline date,
	responsible_id uuid,
	status public.rac_status not null default 'Draft',
	created_at timestamptz not null default now()
);

create table if not exists public.physical_assets (
	id uuid primary key default gen_random_uuid(),
	tenant_id uuid not null,
	name varchar(100) not null,
	category public.asset_category not null,
	status public.asset_status not null default 'CONFORME',
	installation_date date not null default current_date,
	last_audit_date timestamptz not null default now(),
	next_audit_date date not null,
	technical_specs jsonb not null default '{}'::jsonb,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.asset_maintenance_logs (
	id uuid primary key default gen_random_uuid(),
	asset_id uuid not null,
	intervention_type varchar(50) not null,
	description text not null,
	technician_name varchar(100),
	cost numeric(10,2) not null default 0.00,
	performed_at timestamptz not null default now()
);

do $$
begin
	if not exists (
		select 1
		from pg_constraint
		where conname = 'fk_asset_maintenance_asset'
			and conrelid = 'public.asset_maintenance_logs'::regclass
	) then
		alter table public.asset_maintenance_logs
			add constraint fk_asset_maintenance_asset
			foreign key (asset_id) references public.physical_assets(id)
			on delete cascade;
	end if;
end $$;

create index if not exists idx_nc_tenant on public.non_conformities(tenant_id);
create index if not exists idx_nc_status on public.non_conformities(status);
create index if not exists idx_nc_gravity on public.non_conformities(gravity);
create index if not exists idx_rac_tenant on public.corrective_actions(tenant_id);
create index if not exists idx_rac_status on public.corrective_actions(status);
create index if not exists idx_rac_nc on public.corrective_actions(nc_id);
create index if not exists idx_assets_tenant on public.physical_assets(tenant_id);
create index if not exists idx_assets_status on public.physical_assets(status);
create index if not exists idx_assets_next_audit on public.physical_assets(next_audit_date);

alter table public.non_conformities enable row level security;
alter table public.corrective_actions enable row level security;
alter table public.physical_assets enable row level security;

do $$
begin
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

	if not exists (
		select 1 from pg_policies
		where schemaname = 'public'
			and tablename = 'physical_assets'
			and policyname = 'mcp_assets_tenant_select'
	) then
		create policy mcp_assets_tenant_select on public.physical_assets
			for select
			using (tenant_id = public.mcp_current_tenant_id());
	end if;

	if not exists (
		select 1 from pg_policies
		where schemaname = 'public'
			and tablename = 'physical_assets'
			and policyname = 'mcp_assets_tenant_write'
	) then
		create policy mcp_assets_tenant_write on public.physical_assets
			for all
			using (tenant_id = public.mcp_current_tenant_id())
			with check (tenant_id = public.mcp_current_tenant_id());
	end if;
end $$;

do $$
begin
	if exists (
		select 1
		from pg_proc
		where proname = 'mcp_guard_tenant_write'
			and pronamespace = 'public'::regnamespace
	) then
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

