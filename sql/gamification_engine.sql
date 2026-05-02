-- DDL Script para Gamificação e Retenção de Alunos
-- AREA FIT - Arquiteto de Sistemas

CREATE TYPE xp_source_type AS ENUM (
    'CHECKIN', 
    'PERFORMANCE', 
    'QUALITY_REPORT', 
    'GRADUATION'
);

-- Tabela de Perfil de Gamificação
CREATE TABLE gamification_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    warrior_rank VARCHAR(50) DEFAULT 'Novato',
    badges JSONB DEFAULT '[]',
    streak_days INTEGER DEFAULT 0,
    last_checkin_at TIMESTAMP WITH TIME ZONE,
    modality VARCHAR(50),
    gender CHAR(1),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Transações de XP
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    source xp_source_type NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- View para Ranking (Top 10 Mensal por Tenant)
CREATE VIEW ranking_mensal AS
SELECT 
    p.user_id,
    u.display_name,
    p.total_xp,
    p.current_level,
    p.warrior_rank,
    p.tenant_id,
    p.modality
FROM gamification_profiles p
JOIN users u ON p.user_id = u.id
ORDER BY p.total_xp DESC;

-- Índices de Performance
CREATE INDEX idx_xp_user ON xp_transactions(user_id);
CREATE INDEX idx_profile_tenant ON gamification_profiles(tenant_id);
CREATE INDEX idx_profile_modality ON gamification_profiles(modality);
