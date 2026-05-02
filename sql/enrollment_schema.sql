-- DDL Script para Orquestração de Matrícula Híbrida
-- AREA FIT - Arquiteto de Software

CREATE TYPE enrollment_step AS ENUM (
    'IDENTIDADE', 
    'PLANO', 
    'BIOMETRIA', 
    'ASSINATURA', 
    'PAGAMENTO'
);

CREATE TYPE enrollment_channel AS ENUM (
    'ONLINE', 
    'PRESENCIAL'
);

-- Sessões de Matrícula (Stateful)
CREATE TABLE enrollment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    current_step enrollment_step NOT NULL DEFAULT 'IDENTIDADE',
    channel enrollment_channel NOT NULL,
    data_json JSONB DEFAULT '{}', -- Armazena dados parciais (CPF, Nome, Plano Escolhido)
    quality_policy_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contratos Gerados
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    plan_id VARCHAR(50) NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    device_info TEXT,
    is_minor BOOLEAN DEFAULT FALSE,
    guardian_name VARCHAR(100),
    guardian_cpf VARCHAR(14),
    document_url TEXT -- Link para o PDF assinado
);

-- Índice para busca de sessão por CPF (dentro do JSONB)
CREATE INDEX idx_enrollment_cpf ON enrollment_sessions ((data_json->>'cpf'));
CREATE INDEX idx_enrollment_tenant ON enrollment_sessions (tenant_id);
