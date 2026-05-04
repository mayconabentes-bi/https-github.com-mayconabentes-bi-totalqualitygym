# Checklist de Homologacao - Proxima Etapa

Data de referencia: 2026-05-04
Janela operacional: 16:00-17:00

## Objetivo

Registrar o estado de saida da rodada de seguranca e regressao para retomada no proximo dia com criterio objetivo.

## Resultado da Rodada

- Build web: aprovado.
- Build api: aprovado.
- Testes api: aprovado.
- Smoke MCP: aprovado.

## Checklist de Saida para Amanha

- [x] RPCs retornando dados reais.
- [x] Guardas de tenant validados.
- [x] Tools MCP iniciais prontas para operacao.
- [x] Documentacao atualizada.

## Comandos de Verificacao Rapida (amanha)

```bash
npm run build
npm --prefix api run build
npm --prefix api test -- --runInBand
npm run mcp:smoke
npm run mcp:tool:daily -- --limit 3
```

## Criterio de Go/No-Go

Go:
- Todos os comandos acima concluem com exit code 0.
- Smoke MCP retorna pelo menos 1 linha em cada RPC critica.

No-Go:
- Qualquer erro de build/teste/smoke.
- RPC critica sem dados quando deveria haver baseline de homologacao.
