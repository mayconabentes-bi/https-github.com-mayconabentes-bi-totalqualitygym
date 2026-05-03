-- PROJ_SGQ_AREAFIT: Gamification Logic V2 (Calculated Levels & Tiers)
-- Arquiteto de Software Backend

-- VIEW: ranking_consolidado_v2
-- Esta view calcula em tempo real o nível e o Tier baseando-se no XP total
-- Fórmula: L = (xp/100)^(1/1.5) + 1

DROP VIEW IF EXISTS ranking_consolidado_v2;

CREATE OR REPLACE VIEW ranking_consolidado_v3 AS
WITH base_calculation AS (
    SELECT 
        p.user_id,
        u.display_name,
        p.total_xp,
        p.tenant_id,
        p.modality,
        p.graduation,
        p.gender,
        p.badges,
        -- Power formula: L = (xp/100)^(1/1.5) + 1
        FLOOR(POWER(p.total_xp / 100.0, 1.0/1.5)) + 1 AS calculated_level
    FROM gamification_profiles p
    JOIN users u ON p.user_id = u.id
)
SELECT 
    *,
    CASE 
        WHEN calculated_level <= 10 THEN 'Tier 1 (Iniciante)'
        WHEN calculated_level <= 30 THEN 'Tier 2 (Praticante)'
        WHEN calculated_level <= 50 THEN 'Tier 3 (Graduado)'
        ELSE 'Tier 4 (Elite)'
    END AS tier_status,
    -- Count quality badges (audit or RAC related)
    (SELECT COUNT(*) FROM jsonb_array_elements_text(badges) b WHERE b IN ('Guardião da Conformidade', 'Olho Clínico', 'Mestre do PDCA')) as quality_badges_count
FROM base_calculation;

-- Sugestão de Query para o Dashboard Top 10 Mensal
-- SELECT * FROM ranking_consolidado_v2 WHERE tenant_id = '...' ORDER BY total_xp DESC LIMIT 10;
