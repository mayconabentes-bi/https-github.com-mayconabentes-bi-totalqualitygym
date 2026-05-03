-- DDL Script para Inteligência de Ciclo de Vida do Aluno (CRM)
-- AREA FIT - Arquiteto de Software

CREATE TYPE lifecycle_state AS ENUM (
    'ONBOARDING', 
    'ENGAJADO', 
    'EM_RISCO', 
    'GRADUATION_READY', 
    'INATIVO'
);

-- Tabela de Score de Saúde do Aluno
CREATE TABLE student_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    engagement_score INTEGER DEFAULT 100, -- 0 a 100
    frequency_30d INTEGER DEFAULT 0,
    xp_velocity_30d INTEGER DEFAULT 0,
    nc_impact_penalty INTEGER DEFAULT 0, -- Penalidade por reclamações abertas
    last_scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Log de Transições de Ciclo de Vida
CREATE TABLE lifecycle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_state lifecycle_state,
    current_state lifecycle_state,
    trigger_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Alertas de Evasão
CREATE INDEX idx_health_score ON student_health_scores(engagement_score);
CREATE INDEX idx_health_user ON student_health_scores(user_id);
