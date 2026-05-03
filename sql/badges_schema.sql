-- DDL Script para Sistema de Medalhas e Conquistas do SGQ
-- AREA FIT - Arquiteto de Gamificação

CREATE TYPE badge_rarity AS ENUM ('Bronze', 'Prata', 'Ouro');

-- Definição das Medalhas Disponíveis
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_slug VARCHAR(50) NOT NULL,
    rarity badge_rarity NOT NULL,
    xp_bonus INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conquistas de Usuários
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    context_data JSONB, -- Armazena a ID da Auditoria ou RAC que gerou a medalha
    UNIQUE(user_id, badge_id, context_data) -- Evita duplicidade para o mesmo evento
);

-- Inserção da Matriz de Conquistas Inicial
INSERT INTO badges (name, description, icon_slug, rarity, xp_bonus) VALUES
('Guardião da Conformidade', 'Processo auditado com 100% de conformidade técnica.', 'shield-check', 'Ouro', 5000),
('Olho Clínico', 'Identificou uma Não Conformidade Crítica oculta em ciclos anteriores.', 'search', 'Prata', 2500),
('Auditor de Elite', 'Média de avaliação de liderança superior a 4.8 em 3 ciclos.', 'award', 'Ouro', 5000),
('Precisão Temporal', 'Relatório de Auditoria encerrado em menos de 24h.', 'clock', 'Bronze', 1000),
('Detetive do Tatame', 'Identificou falha na categoria Máquina/Equipamento.', 'target', 'Bronze', 500),
('Mestre do PDCA', 'Fechou uma RAC com eficácia comprovada em 30 dias.', 'zap', 'Prata', 2000);
