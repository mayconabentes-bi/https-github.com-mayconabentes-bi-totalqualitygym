-- DDL Script para Plano de Ação e Eficácia (POP.SGQ.12)
-- AREA FIT - Engenheiro de Qualidade

CREATE TYPE action_status AS ENUM ('Pending', 'Completed');

-- Tabela de Itens do Plano de Ação
CREATE TABLE action_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rac_id UUID NOT NULL REFERENCES corrective_actions(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    responsible_id UUID NOT NULL REFERENCES users(id),
    deadline DATE NOT NULL,
    execution_method TEXT NOT NULL,
    effectiveness_criteria TEXT NOT NULL,
    status action_status DEFAULT 'Pending',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Verificação de Eficácia
CREATE TABLE effectiveness_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rac_id UUID NOT NULL REFERENCES corrective_actions(id) ON DELETE CASCADE,
    reoccurred BOOLEAN DEFAULT FALSE, -- O problema voltou a ocorrer?
    indicator_improved BOOLEAN DEFAULT TRUE, -- O indicador melhorou?
    complaint_ceased BOOLEAN DEFAULT TRUE, -- A reclamação cessou?
    technical_observation TEXT,
    is_effective BOOLEAN NOT NULL,
    verified_by_id UUID NOT NULL REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_apl_rac ON action_plan_items(rac_id);
CREATE INDEX idx_eff_rac ON effectiveness_verifications(rac_id);
