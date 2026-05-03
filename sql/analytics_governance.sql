-- SQL Aggregation Scripts for BI & Governance (POP.SGQ.12)
-- AREA FIT - Data Engineering

-- 1. Volume de Ocorrências (NC/Mês)
-- Meta: <= 5 por mês
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(id) AS total_nc
FROM non_conformities
WHERE tenant_id = :tenant_id
GROUP BY month
ORDER BY month DESC;

-- 2. Índice de Recorrência
-- Meta: <= 10%
WITH CauseCounts AS (
    SELECT 
        root_cause, 
        COUNT(*) as count_reoccurrence,
        (SELECT COUNT(*) FROM non_conformities WHERE tenant_id = :tenant_id) as total_nc
    FROM corrective_actions
    WHERE tenant_id = :tenant_id
    GROUP BY root_cause
)
SELECT 
    root_cause,
    (count_reoccurrence::float / total_nc) * 100 as recurrence_percentage
FROM CauseCounts
WHERE (count_reoccurrence::float / total_nc) > 0.10;

-- 3. SLA de Fechamento (Lead Time)
-- Meta: <= 30 dias
SELECT 
    AVG(EXTRACT(EPOCH FROM (ra.created_at - nc.created_at)) / 86400) as avg_days_to_close
FROM non_conformities nc
JOIN corrective_actions ra ON nc.id = ra.nc_id
WHERE ra.status = 'CLOSED' AND nc.tenant_id = :tenant_id;

-- 4. Índice de Eficácia
-- Meta: >= 90%
SELECT 
    (COUNT(CASE WHEN is_effective THEN 1 END)::float / COUNT(*)) * 100 as effectiveness_rate
FROM effectiveness_verifications
WHERE tenant_id = :tenant_id;

-- 5. Data Retention Policy (Matriz de Registros)
-- RACs mantidas por 5 anos.
-- Rotina de Descarte Seguro (Automated Cleanup)
DELETE FROM corrective_actions 
WHERE created_at < NOW() - INTERVAL '5 years';

DELETE FROM non_conformities 
WHERE created_at < NOW() - INTERVAL '5 years' 
AND status = 'Concluída';
