-- DDL Script para Gestão de Não Conformidades (POP.SGQ.12)
-- AREA FIT - Arquiteto de Sistemas

-- Enum para Fonte da NC
CREATE TYPE nc_source AS ENUM (
    'Professor', 
    'Aluno/Reclamação', 
    'Auditoria Interna', 
    'Indicador', 
    'Incidente'
);

-- Enum para Gravidade
CREATE TYPE nc_gravity AS ENUM (
    'Baixa', 
    'Média', 
    'Alta', 
    'Crítica'
);

-- Enum para Status da NC
CREATE TYPE nc_status AS ENUM (
    'Aberta', 
    'Em Análise', 
    'RAC Aberta', 
    'Concluída'
);

-- Tabela Principal de Não Conformidades
CREATE TABLE non_conformities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- FK para Unidades
    source nc_source NOT NULL,
    description TEXT NOT NULL,
    immediate_action TEXT NOT NULL,
    gravity nc_gravity DEFAULT 'Média',
    status nc_status DEFAULT 'Aberta',
    identified_by_id UUID NOT NULL, -- FK para Usuários/Colaboradores
    audit_plan_id UUID, -- Opcional: Vínculo com Auditoria Interna (Bloco 7)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance e multitenancy
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_identifier FOREIGN KEY (identified_by_id) REFERENCES users(id)
);

-- Índices Sugeridos
CREATE INDEX idx_nc_tenant ON non_conformities(tenant_id);
CREATE INDEX idx_nc_status ON non_conformities(status);
CREATE INDEX idx_nc_gravity ON non_conformities(gravity);
