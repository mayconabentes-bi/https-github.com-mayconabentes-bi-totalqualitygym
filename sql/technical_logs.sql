-- DDL Script para Validações Técnicas e Auditoria de Instrutor
-- AREA FIT - Arquiteto de Software e Engenharia de Software

CREATE TABLE technical_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    instructor_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES users(id),
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
    xp_granted INTEGER NOT NULL,
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    session_id UUID, -- Optional: link to a specific scheduled class session
    validation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Auditoria e Velocidade de Consulta
CREATE INDEX idx_tech_log_instructor ON technical_logs(instructor_id);
CREATE INDEX idx_tech_log_student ON technical_logs(student_id);
CREATE INDEX idx_tech_log_tenant ON technical_logs(tenant_id);
CREATE INDEX idx_tech_log_timestamp ON technical_logs(validation_timestamp);

-- Comentário para Governança
COMMENT ON TABLE technical_logs IS 'Registro de auditoria de cada validação técnica realizada por instrutores.';
