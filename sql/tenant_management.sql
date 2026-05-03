-- DDL & DCL Script para Gestão de Unidades e Segurança Multi-Tenant
-- AREA FIT - Arquiteto de Sistemas Cloud e Database Engineer

-- 1. Definição da Tabela Mestre de Unidades
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(2) NOT NULL,
    contact_email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'SUSPENDED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mock do Schema 'auth' para compatibilidade com ambiente Supabase/RLS
CREATE SCHEMA IF NOT EXISTS auth;

-- Função para extrair unit_id do JWT
CREATE OR REPLACE FUNCTION auth.get_unit_id() RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'app_metadata' ->> 'unit_id')::uuid;
$$ LANGUAGE sql STABLE;

-- Função para extrair role do JWT
CREATE OR REPLACE FUNCTION auth.get_role() RETURNS TEXT AS $$
    SELECT (auth.jwt() -> 'app_metadata' ->> 'role')::text;
$$ LANGUAGE sql STABLE;

-- Habilitar Row Level Security (RLS)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Acesso (DCL)
-- Restringe a gestão (INSERT/UPDATE/DELETE) exclusivamente para ADMIN_GLOBAL
CREATE POLICY admin_global_full_access ON units
    FOR ALL
    TO authenticated
    USING ( auth.get_role() = 'ADMIN_GLOBAL' )
    WITH CHECK ( auth.get_role() = 'ADMIN_GLOBAL' );

-- Permite que usuários autenticados vejam apenas sua própria unidade (ou todas se for ADMIN_GLOBAL)
CREATE POLICY unit_visibility_policy ON units
    FOR SELECT
    TO authenticated
    USING (
        ( auth.get_role() = 'ADMIN_GLOBAL' ) OR
        ( id = auth.get_unit_id() )
    );

-- 3. Função de Registro Seguro (PL/pgSQL)
CREATE OR REPLACE FUNCTION register_new_gym_unit(
    u_name VARCHAR,
    u_city VARCHAR,
    u_state VARCHAR,
    u_email VARCHAR
) RETURNS UUID AS $$
DECLARE
    new_unit_id UUID;
    executor_role TEXT;
BEGIN
    -- Validação de Autoridade do Executor
    executor_role := auth.get_role();
    
    IF executor_role IS NULL OR executor_role != 'ADMIN_GLOBAL' THEN
        RAISE EXCEPTION 'Acesso Negado: Apenas ADMIN_GLOBAL pode registrar novas unidades.';
    END IF;

    -- Inserção Controlada
    INSERT INTO units (name, location_city, location_state, contact_email)
    VALUES (u_name, u_city, u_state, u_email)
    RETURNING id INTO new_unit_id;

    RETURN new_unit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Exemplo de Uso e Cenário de Isolamento
/*
-- Script de Cadastro Unidade B
SELECT register_new_gym_unit(
    'AREA FIT - Ponta Negra', 
    'Manaus', 
    'AM', 
    'pontanegra@areafit.com.br'
);

-- Cenário de Isolamento RLS:
-- Quando o usuário da 'Unidade Ponta Negra' realizar um SELECT na tabela 'assets',
-- o RLS aplicará automaticamente o filtro: WHERE unit_id = auth.get_unit_id()
-- Isso impede que ele veja os equipamentos da 'Unidade Centro', 
-- mesmo que utilize o mesmo endpoint de API.
*/

-- Comentário de Governança
COMMENT ON TABLE units IS 'Tabela central de multi-tenancy para segregação de dados regionais.';
