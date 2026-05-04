# MCP Integration - Fase Inicial

Este projeto esta configurado para usar MCP com Supabase via servidor HTTP.

## Arquivo de configuracao

- Cliente MCP no VS Code: `.vscode/mcp.json`
- Servidor configurado: `supabase`
- URL: `https://mcp.supabase.com/mcp?project_ref=hmxeyfprjhuejyijpwep`

## Como usar no dia a dia

1. Abra o workspace no VS Code.
2. Garanta que a extensao/cliente MCP esta habilitada no VS Code.
3. Recarregue a janela (`Developer: Reload Window`) apos alterar `.vscode/mcp.json`.
4. Verifique se o servidor `supabase` aparece como conectado no painel/saida MCP.

## Escopo desta fase

- Conectar o cliente MCP ao servidor Supabase.
- Validar conectividade do projeto `hmxeyfprjhuejyijpwep`.
- Preparar base para adicionar tools/resources especificos do SGQ na proxima fase.

## Fase 2 (implementada neste repo)

1. SQL de RPCs e guardas: `sql/mcp_phase2_hardening.sql`
2. RPCs de leitura criados:
	- `mcp_health()`
	- `mcp_list_non_conformities(p_limit, p_status)`
	- `mcp_list_corrective_actions(p_limit, p_status)`
	- `mcp_list_assets_attention(p_limit)`
3. Guardas de tenant para escrita:
	- helper `mcp_current_tenant_id()`
	- helper `mcp_enforce_tenant(tenant_id)`
	- trigger `mcp_guard_tenant_write()` em `non_conformities` e `corrective_actions`

## Aplicacao da Fase 2 no Supabase

1. Abra o SQL Editor do projeto Supabase.
2. Execute o arquivo `sql/mcp_phase2_hardening.sql`.
3. Verifique se as funcoes foram criadas sem erro.

## Smoke Test

Depois de aplicar o SQL, execute no workspace:

```bash
npm run mcp:smoke
```

Saida esperada:
- `[OK] mcp_health`
- `[OK] mcp_list_non_conformities`
- `[OK] mcp_list_corrective_actions`
- `[OK] mcp_list_assets_attention`
