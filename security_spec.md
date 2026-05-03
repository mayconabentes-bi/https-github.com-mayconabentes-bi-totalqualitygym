# Security Specification - Area Fit SGQ

## Data Invariants
1. A user must belong to a tenant.
2. A document (policy, plan, objective, stakeholder) must be associated with the tenant the user belongs to.
3. Only users with the 'direction' or 'partner' role can approve or create new versions of the Quality Policy.
4. Users with the 'teacher' role have read-only access to policies and plans, but may create 'objectives' if assigned (though for now we'll stick to a simpler role-based read/write).
5. No one can change their own role or tenantId.
6. System-generated fields like `createdAt` are immutable.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user with a 'direction' role by a non-admin.
2. **Cross-Tenant Leak**: Attempt to read a Quality Policy from Tenant A while being a user of Tenant B.
3. **Ghost Field Injection**: Attempt to add `isSuperAdmin: true` to a user profile update.
4. **ID Poisoning**: Attempt to create a document with a 2KB string as ID.
5. **Unauthorized Approval**: A 'teacher' attempting to update the `QualityPolicy` with `isActive: true`.
6. **Orphaned Record**: Attempt to create a `QualityObjective` with a non-existent `tenantId`.
7. **Resource Exhaustion**: Attempt to send a 1MB string in a stakeholder 'needs' field.
8. **Privilege Escalation**: Attempt to update own `role` from 'teacher' to 'direction'.
9. **History Tampering**: Attempt to update an old (non-active) `QualityPolicy` version.
10. **Query Scraping**: Attempting a list query for all users across all tenants.
11. **Timestamp Manipulation**: Sending a client-side `createdAt` date for 2010.
12. **Deletion Attack**: A 'teacher' attempting to delete a 'StrategicPlan'.

## Test Runner (Draft Plan)
The test runner will verify that:
- `get` and `list` operations for tenant resources fail if `resource.data.tenantId != user.tenantId`.
- `create` and `update` fail if schema metadata (like `tenantId` change) is violated.
- Role-based permissions are strictly enforced.
