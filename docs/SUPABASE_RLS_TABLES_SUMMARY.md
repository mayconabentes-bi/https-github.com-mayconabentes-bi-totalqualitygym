# Supabase RLS Table Summary

Reference: `security_spec.md` data invariants and abuse cases.

## Current Validation Status
- Tenant guards in SGQ write paths are active and validated.
- RLS protections for tenant-scoped SGQ core tables were validated in homologation flow.
- MCP read RPCs are returning real data in smoke and daily tool runs.

## Required Policy Dimensions
- Tenant isolation: `tenant_id` (or equivalent tenant relation) must match authenticated user tenant.
- Role-gated write paths: `direction` and `partner` can approve/version quality policy and strategic artifacts.
- Teacher constraints: read-only for policy/plan resources; optional scoped create on objectives.
- Self-escalation prevention: users cannot alter own role or tenant assignment.
- Immutable system fields: `created_at` style fields immutable after insert.

## Core Identity & Governance
- `users`: source of role and tenant membership; enforce no self role/tenant change; no cross-tenant list.
- `units`: tenant catalog; reads scoped by membership mapping.
- `technical_logs`: tenant-scoped operational logs; read/write only within tenant.

## SGQ / Compliance Domain
- `non_conformities`: tenant-scoped; create/update restricted by role policy.
- `corrective_actions`: tenant-scoped; tied to non-conformity lifecycle.
- `action_plan_items`: inherit tenant from parent corrective action.
- `effectiveness_verifications`: inherit tenant from parent action plan item / corrective action.

## Policy / Plan / Objective / Stakeholder Mapping
Tables named in `security_spec.md` (`quality_policy`, `strategic_plans`, `quality_objectives`, `stakeholders`) are not present in current `sql/*.sql` set and should be created with explicit `tenant_id`, `created_by`, immutable `created_at`, and role-gated approval/versioning policies.

## Operational Domain (Tenant-Scoped)
- `physical_assets`
- `asset_maintenance_logs` (tenant inherited from `physical_assets`)
- `enrollment_sessions`
- `contracts` (tenant inherited from related enrollment/student)
- `subscriptions`
- `invoices`
- `payment_attempts` (tenant inherited from invoice/subscription)

## CRM / Gamification (Tenant-Scoped)
- `student_health_scores`
- `lifecycle_logs` (tenant inherited from student/profile)
- `gamification_profiles`
- `xp_transactions`
- `user_achievements` (tenant inherited from user/profile)
- `badges` (global catalog: read-all, write-admin only)

## Demo/Bootstrap Tables Requiring Tenant Hardening
- `students`
- `financial_projections`

These two and `users` in `demo_population.sql` should be normalized to include or derive tenant context before RLS rollout.

## Minimum RLS Coverage Order
1. `users`, `units`
2. `non_conformities`, `corrective_actions`, `action_plan_items`, `effectiveness_verifications`
3. `subscriptions`, `invoices`, `payment_attempts`, `enrollment_sessions`, `contracts`
4. `physical_assets`, `asset_maintenance_logs`, `technical_logs`
5. `student_health_scores`, `lifecycle_logs`, `gamification_profiles`, `xp_transactions`, `user_achievements`
