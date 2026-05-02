-- DDL Script para Faturamento Recorrente e Performance Financeira
-- AREA FIT - Arquiteto de Software Financeiro

CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- Assinaturas de Planos
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    status subscription_status DEFAULT 'ACTIVE',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Faturas Mensais
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    amount_original DECIMAL(10,2) NOT NULL,
    performance_discount DECIMAL(10,2) DEFAULT 0.00,
    amount_final DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status payment_status DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE,
    billing_reason VARCHAR(100), -- Ex: 'RECURRING', 'UPGRADE'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tentativas de Pagamento (Log)
CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    gateway_transaction_id VARCHAR(100),
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED'
    error_message TEXT,
    attempt_count INTEGER DEFAULT 1,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices Financeiros
CREATE INDEX idx_sub_student ON subscriptions(student_id);
CREATE INDEX idx_inv_due ON invoices(due_date);
CREATE INDEX idx_inv_status ON invoices(payment_status);
