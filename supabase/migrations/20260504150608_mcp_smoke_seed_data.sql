-- MCP smoke seed data for homologation
-- Provides deterministic tenant fallback only when JWT tenant is missing.

create or replace function public.mcp_dev_tenant_id()
returns uuid
language sql
stable
as $$
	select '11111111-1111-1111-1111-111111111111'::uuid;
$$;

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
		return public.mcp_dev_tenant_id();
	end if;

	return candidate::uuid;
exception
	when invalid_text_representation then
		return public.mcp_dev_tenant_id();
end;
$$;

insert into public.physical_assets (
	id,
	tenant_id,
	name,
	category,
	status,
	installation_date,
	next_audit_date,
	technical_specs
)
values (
	'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
	public.mcp_dev_tenant_id(),
	'Tatame Principal - Area A',
	'INFRA'::public.asset_category,
	'CRITICO'::public.asset_status,
	current_date - interval '180 day',
	current_date + interval '5 day',
	'{"area_m2":120,"obs":"Seed MCP"}'::jsonb
)
on conflict (id) do update set
	tenant_id = excluded.tenant_id,
	status = excluded.status,
	next_audit_date = excluded.next_audit_date,
	updated_at = now();

insert into public.non_conformities (
	id,
	tenant_id,
	source,
	description,
	immediate_action,
	gravity,
	status,
	identified_by_id,
	created_at
)
values (
	'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
	public.mcp_dev_tenant_id(),
	'Auditoria Interna'::public.nc_source,
	'Falha de conformidade no tatame: desgaste acima do limite.',
	'Isolar area e registrar plano corretivo imediato.',
	'Alta'::public.nc_gravity,
	'RAC Aberta'::public.nc_status,
	'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
	now()
)
on conflict (id) do update set
	status = excluded.status,
	gravity = excluded.gravity,
	immediate_action = excluded.immediate_action;

insert into public.corrective_actions (
	id,
	nc_id,
	tenant_id,
	identified_by_id,
	root_cause,
	proposed_action,
	deadline,
	status,
	created_at
)
values (
	'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
	'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
	public.mcp_dev_tenant_id(),
	'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
	'Desgaste acelerado por uso sem inspeção semanal formal.',
	'Implantar checklist semanal e substituição parcial do revestimento.',
	current_date + interval '10 day',
	'Approved'::public.rac_status,
	now()
)
on conflict (id) do update set
	status = excluded.status,
	root_cause = excluded.root_cause,
	proposed_action = excluded.proposed_action,
	deadline = excluded.deadline;

