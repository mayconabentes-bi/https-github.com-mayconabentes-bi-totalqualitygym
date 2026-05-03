-- DDL Script para Gestão de Ativos Físicos e Infraestrutura (EAM)
-- AREA FIT - Arquiteto de Software e Especialista em Qualidade

CREATE TYPE asset_category AS ENUM (
    'MAQUINA', 
    'MATERIAL', 
    'INFRA',
    'EQUIPAMENTO_LUTA'
);

CREATE TYPE asset_status AS ENUM (
    'CONFORME', 
    'MANUTENCAO', 
    'CRITICO'
);

-- Tabela de Ativos Físicos
CREATE TABLE physical_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    category asset_category NOT NULL,
    status asset_status DEFAULT 'CONFORME',
    installation_date DATE NOT NULL,
    last_audit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_audit_date DATE NOT NULL,
    technical_specs JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Manutenção de Ativos
CREATE TABLE asset_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES physical_assets(id) ON DELETE CASCADE,
    intervention_type VARCHAR(50) NOT NULL, -- Ex: 'Preventiva', 'Corretiva'
    description TEXT NOT NULL,
    technician_name VARCHAR(100),
    cost DECIMAL(10,2) DEFAULT 0.00,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Gestão de Ativos
CREATE INDEX idx_assets_tenant ON physical_assets(tenant_id);
CREATE INDEX idx_assets_status ON physical_assets(status);
CREATE INDEX idx_assets_next_audit ON physical_assets(next_audit_date);

-- Comentário para Governança
COMMENT ON TABLE physical_assets IS 'Cofre de ativos físicos da unidade para controle de SGQ e segurança.';
