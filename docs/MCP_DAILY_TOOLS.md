# MCP Daily Tools (Operacional)

Pacote inicial de consultas MCP para uso diario.

## Comandos

- Consulta de nao conformidades:

```bash
npm run mcp:tool:nc
```

- Consulta de acoes corretivas:

```bash
npm run mcp:tool:rac
```

- Consulta de ativos com atencao:

```bash
npm run mcp:tool:assets
```

- Executar os 3 em sequencia:

```bash
npm run mcp:tool:daily
```

## Filtros uteis

Os comandos aceitam parametros adicionais apos `--`:

- Limite de linhas:

```bash
npm run mcp:tool:nc -- --limit 50
```

- Filtro de status:

```bash
npm run mcp:tool:nc -- --status "RAC Aberta"
npm run mcp:tool:rac -- --status "Approved"
```

## Requisitos

- `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- RPCs MCP ja aplicadas no banco remoto.
