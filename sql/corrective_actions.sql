-- DDL Script para Análise de Causa Raiz (Ishikawa 6M)
-- AREA FIT - Arquiteto de Sistemas

CREATE TYPE rac_status AS ENUM (
    'Draft', 
    'Approved', 
    'Executed', 
    'Verified'
);

-- Tabela de Análise de Causa (RAC)
CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nc_id UUID NOT NULL, -- FK para non_conformities
    tenant_id UUID NOT NULL,
    identified_by_id UUID NOT NULL,
    
    -- Colunas para os 6Ms (Armazenados como Arrays no Postgres)
    cause_method TEXT[],
    cause_manpower TEXT[],
    cause_machine TEXT[],
    cause_material TEXT[],
    cause_environment TEXT[],
    cause_measurement TEXT[],
    
    root_cause TEXT NOT NULL,
    proposed_action TEXT,
    deadline DATE,
    responsible_id UUID, -- FK para users
    status rac_status DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_nc_rac FOREIGN KEY (nc_id) REFERENCES non_conformities(id) ON DELETE CASCADE,
    CONSTRAINT fk_responsible_rac FOREIGN KEY (responsible_id) REFERENCES users(id)
);

-- Índices de consulta
CREATE INDEX idx_rac_nc ON corrective_actions(nc_id);
CREATE INDEX idx_rac_tenant ON corrective_actions(tenant_id);
CREATE INDEX idx_rac_status ON corrective_actions(status);
