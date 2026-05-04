# Agenda Operacional - 2026-05-05

## Objetivo do dia

Avancar da homologacao inicial para operacao assistida, mantendo seguranca multitenant e estabilidade de regressao.

## Agenda proposta

### 09:00-09:30 | Abertura e health check
- Atualizar branch local e dependencias se necessario.
- Executar:
  - `npm run build`
  - `npm --prefix api run build`
  - `npm --prefix api test -- --runInBand`
  - `npm run mcp:smoke`
  - `npm run mcp:tool:daily -- --limit 3`
- Resultado esperado: todos os comandos com exit code 0.

### 09:30-11:00 | Seguranca RLS (teste negativo)
- Validar cenarios cross-tenant (leitura e escrita indevidas).
- Revalidar guardas em fluxos de escrita SGQ.
- Registrar evidencias de bloqueio correto.

### 11:00-12:00 | Evolucao tools MCP (pacote 2)
- Adicionar filtros de operacao diaria:
  - por status
  - por criticidade
  - por intervalo de datas
- Validar saida legivel para uso de rotina.

### 13:30-15:00 | Observabilidade operacional
- Incluir logs resumidos por comando MCP.
- Medir tempo de execucao das consultas principais.
- Definir limite de alerta para degradacao.

### 15:00-16:00 | Regressao completa
- Repetir build web/api, testes api e smoke MCP.
- Registrar comparativo com baseline de hoje.

### 16:00-17:00 | Fechamento
- Atualizar relatorio diario.
- Atualizar checklist de saida.
- Preparar commit e push do dia.

## Criterios de sucesso
- Zero falhas em build/test/smoke.
- Zero violacoes cross-tenant nos testes negativos.
- Tools MCP pacote 2 prontas e documentadas.
- Evidencias registradas em docs para auditoria interna.
