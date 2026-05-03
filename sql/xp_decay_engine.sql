-- DDL & DML Script para Mecanismo de Estabilização Econômica (XP Decay)
-- AREA FIT - Arquitetura de Banco de Dados e Economia de Retenção

-- Função para Recalcular Projeção de MRR baseada em perda de XP
CREATE OR REPLACE FUNCTION recalculate_mrr_projection(p_student_id UUID)
RETURNS void AS $$
DECLARE
    v_unit_id UUID;
    v_base_fee DECIMAL;
    v_current_xp INT;
    v_lost_discount DECIMAL := 0;
BEGIN
    SELECT unit_id, base_monthly_fee, current_xp 
    INTO v_unit_id, v_base_fee, v_current_xp
    FROM students WHERE id = p_student_id;

    -- Lógica de Pricing: Se XP cai abaixo do limite de tier, o desconto é perdido, elevando MRR
    IF v_current_xp < 1000 THEN
        v_lost_discount := v_base_fee * 0.15; -- Perda de 15% de desconto
    ELSIF v_current_xp < 5000 THEN
        v_lost_discount := v_base_fee * 0.05; -- Perda de 5% de desconto
    END IF;

    -- Atualiza a tabela de projeções financeiras da Unidade
    UPDATE financial_projections
    SET projected_mrr = projected_mrr + v_lost_discount,
        updated_at = CURRENT_TIMESTAMP
    WHERE unit_id = v_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função principal do Cron Job: Decaimento Progressivo (Gravidade de XP)
CREATE OR REPLACE FUNCTION apply_xp_gravity_decay()
RETURNS void AS $$
DECLARE
    v_lambda DECIMAL;
    v_absent_days INT;
    v_student RECORD;
    v_decay_amount INT;
BEGIN
    -- Itera sobre alunos ausentes por mais de 3 dias
    FOR v_student IN 
        SELECT id, current_xp, last_checkin, discount_tier
        FROM students 
        WHERE status = 'ACTIVE' AND last_checkin < CURRENT_DATE - INTERVAL '3 days'
    LOOP
        v_absent_days := EXTRACT(DAY FROM CURRENT_DATE - v_student.last_checkin);
        
        -- Modulador lambda: Decaimento mais agressivo para alunos que custam mais (maior desconto)
        v_lambda := CASE v_student.discount_tier
                    WHEN 'DIAMOND' THEN 1.5
                    WHEN 'GOLD' THEN 1.0
                    WHEN 'SILVER' THEN 0.5
                    ELSE 0.2
                  END;
                  
        -- Fórmula: XP_new = XP_current - (λ * Days_absent^2)
        v_decay_amount := ROUND(v_lambda * POWER(v_absent_days, 2));
        
        -- Atualiza XP do aluno com piso de 0
        UPDATE students
        SET current_xp = GREATEST(0, current_xp - v_decay_amount),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_student.id;
        
        -- Dispara recalibração do MRR se aplicável
        PERFORM recalculate_mrr_projection(v_student.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- O Cron Job seria agendado via pg_cron:
-- SELECT cron.schedule('xp_decay_job', '0 2 * * *', 'SELECT apply_xp_gravity_decay()');
