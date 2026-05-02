-- Script de População Estratégica - Live Demo TOTAL QUALITY GYM
-- Arquiteto de Dados & Engenheiro de Sistemas
-- Foco: Stress Test de Multitenancy, Gamificação e Resiliência Operacional

-- 0. Garantir Schema e Tabelas Base (Caso não existam no ambiente)
ALTER TABLE units ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela consolidada de metadados de alunos (referenciada pelo motor de XP Decay)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id),
    current_xp INTEGER DEFAULT 0,
    discount_tier VARCHAR(50) DEFAULT 'BRONZE',
    base_monthly_fee DECIMAL(10,2) DEFAULT 149.90,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_checkin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de projeção financeira (referenciada pelo recalcular_mrr)
CREATE TABLE IF NOT EXISTS financial_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id),
    projected_mrr DECIMAL(15,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. População de Unidades (White-Label Tenants)
INSERT INTO units (id, name, location_city, location_state, contact_email, status, theme_config)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000', 
    'AREA FIT - Concept Centro', 
    'São Paulo', 
    'SP', 
    'centro@areafit.com.br', 
    'ACTIVE',
    '{
        "primary": "#141414", 
        "secondary": "#A3A3A3", 
        "logo_url": "https://api.dicebear.com/7.x/initials/svg?seed=AC&backgroundColor=141414&fontFamily=serif"
    }'
),
(
    '550e8400-e29b-41d4-a716-446655440001', 
    'AREA FIT - Ponta Negra Premium', 
    'Manaus', 
    'AM', 
    'pontanegra@areafit.com.br', 
    'ACTIVE',
    '{
        "primary": "#B8860B", 
        "secondary": "#F5F5DC", 
        "logo_url": "https://api.dicebear.com/7.x/initials/svg?seed=PN&backgroundColor=B8860B&fontFamily=serif"
    }'
);

-- Inicializar projeção financeira
INSERT INTO financial_projections (unit_id, projected_mrr)
VALUES 
('550e8400-e29b-41d4-a716-446655440000', 50000.00),
('550e8400-e29b-41d4-a716-446655440001', 80000.00);

-- 2. População de Alunos (Users + Gamification + Students)
-- Aluno 1: O Mestre Disciplinado
INSERT INTO users (id, display_name, email) VALUES ('550e8400-e29b-41d4-a716-446655440010', 'O Mestre Disciplinado', 'mestre@demo.com');
INSERT INTO gamification_profiles (user_id, tenant_id, total_xp, current_level, warrior_rank, streak_days)
VALUES ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 15000, 50, 'Mestre', 45);
INSERT INTO students (id, unit_id, current_xp, discount_tier, last_checkin, status)
VALUES ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 15000, 'DIAMOND', NOW()::DATE, 'ACTIVE');

-- Aluno 2: A Estrela Inadimplente
INSERT INTO users (id, display_name, email) VALUES ('550e8400-e29b-41d4-a716-446655440011', 'A Estrela Inadimplente', 'estrela@demo.com');
INSERT INTO gamification_profiles (user_id, tenant_id, total_xp, current_level, warrior_rank, last_checkin_at)
VALUES ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 9000, 32, 'Veterano', NOW() - INTERVAL '1 day');
INSERT INTO students (id, unit_id, current_xp, discount_tier, last_checkin, status)
VALUES ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 9000, 'GOLD', (NOW() - INTERVAL '1 day')::DATE, 'ACTIVE');
-- Registro Financeiro em Atraso
INSERT INTO subscriptions (student_id, tenant_id, plan_id, status, current_period_end)
VALUES ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'PLAN_ANUAL', 'PAST_DUE', NOW() + INTERVAL '1 month');

-- Aluno 3: O Aluno em Churn Silencioso
INSERT INTO users (id, display_name, email) VALUES ('550e8400-e29b-41d4-a716-446655440012', 'O Aluno em Churn Silencioso', 'churn@demo.com');
INSERT INTO gamification_profiles (user_id, tenant_id, total_xp, current_level, warrior_rank, last_checkin_at)
VALUES ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 3000, 15, 'Intermediário', NOW() - INTERVAL '25 days');
INSERT INTO students (id, unit_id, current_xp, discount_tier, last_checkin, status)
VALUES ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 3000, 'SILVER', (NOW() - INTERVAL '25 days')::DATE, 'ACTIVE');

-- Aluno 4: O Novato de Alta Tração
INSERT INTO users (id, display_name, email) VALUES ('550e8400-e29b-41d4-a716-446655440013', 'O Novato de Alta Tração', 'novato@demo.com');
INSERT INTO gamification_profiles (user_id, tenant_id, total_xp, current_level, warrior_rank, last_checkin_at)
VALUES ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 500, 2, 'Novato', NOW() - INTERVAL '2 hours');
INSERT INTO students (id, unit_id, current_xp, discount_tier, last_checkin, status)
VALUES ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 500, 'BRONZE', NOW()::DATE, 'ACTIVE');

-- Aluno 5: Visitante Inter-Unidades
INSERT INTO users (id, display_name, email) VALUES ('550e8400-e29b-41d4-a716-446655440014', 'Visitante Inter-Unidades', 'visitante@demo.com');
INSERT INTO gamification_profiles (user_id, tenant_id, total_xp, current_level, warrior_rank)
VALUES ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 1200, 5, 'Novato');
INSERT INTO students (id, unit_id, current_xp, last_checkin, status)
VALUES ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 1200, (NOW() - INTERVAL '2 days')::DATE, 'ACTIVE');

-- 3. Infraestrutura & SGQ (Asset Health)
-- Ativo Crítico na Unidade A
INSERT INTO physical_assets (id, tenant_id, name, category, status, installation_date, next_audit_date)
VALUES ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'Esteira Matrix T7xe', 'MAQUINA', 'CRITICO', NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 months');

-- Não Conformidade para o Tatame
INSERT INTO physical_assets (id, tenant_id, name, category, status, installation_date, next_audit_date)
VALUES ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'Area de Luta Principal', 'EQUIPAMENTO_LUTA', 'MANUTENCAO', NOW() - INTERVAL '1 year', NOW() + INTERVAL '1 month');

INSERT INTO non_conformities (tenant_id, source, description, immediate_action, gravity, status, identified_by_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'Aluno/Reclamação', 
    'Tatame com odor forte e sinais de mofo na borda norte.', 
    'Interdição para higienização profunda e secagem.', 
    'Alta', 
    'Aberta', 
    '550e8400-e29b-41d4-a716-446655440010' -- Mestre Disciplinado denunciou
);

-- 4. Logs de Histórico (90 dias)
-- Gerar logs de acesso aleatórios para os últimos 90 dias
INSERT INTO technical_logs (tenant_id, instructor_id, student_id, performance_rating, xp_granted, validation_timestamp)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440010', -- Instructor mock (using mestre as instructor for demo)
    '550e8400-e29b-41d4-a716-446655440013', -- student
    (random() * 5 + 5)::int, -- Rating 5-10
    (random() * 50 + 10)::int, -- XP 10-60
    NOW() - (i || ' days')::interval
FROM generate_series(1, 90) i;

-- Transações de XP para preencher o extrato
INSERT INTO xp_transactions (user_id, tenant_id, amount, source, description, created_at)
SELECT 
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440000',
    (random() * 100 + 20)::int,
    'CHECKIN',
    'Treino diário - Foco em Qualidade',
    NOW() - (i || ' days')::interval
FROM generate_series(1, 45) i;

-- Comentário Final de Auditoria
COMMENT ON DATABASE postgres IS 'Demo Seed Area Fit - Cenários de Stress Test e Resiliência Operacional v1.0';
