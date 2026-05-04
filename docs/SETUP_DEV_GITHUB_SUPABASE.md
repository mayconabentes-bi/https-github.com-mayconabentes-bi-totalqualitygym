# Setup Diario: VS Code + GitHub + Supabase

Este guia deixa o ambiente pronto para desenvolvimento diario e preparacao para producao.

## 1) Conectar VS Code ao GitHub

1. Abra VS Code na pasta do projeto.
2. Clique no icone de conta (canto inferior esquerdo).
3. Selecione Sign in with GitHub.
4. Autorize no navegador e retorne ao VS Code.
5. Confirme no terminal:

```bash
git config --global --get user.name
git config --global --get user.email
git remote -v
git ls-remote --heads origin
```

## 2) Configurar ambiente local do app

1. Crie um arquivo `.env.local` na raiz.
2. Use os valores abaixo (substitua os placeholders):

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

3. Instale dependencias e rode:

```bash
npm install
npm run dev
```

## 3) Conectar projeto ao Supabase para operacao diaria

Opcao recomendada (CLI):

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Depois, para gerar tipos atualizados quando o schema mudar:

```bash
npm run update-types
```

Importante: ajuste `YOUR_ID` no script `update-types` de `package.json` para o project ref real.

## 4) Segredos no GitHub (para CI/CD e producao)

No repositorio GitHub, adicione em Settings > Secrets and variables > Actions:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN` (se usar deploy/migracoes via CLI no CI)
- `SUPABASE_PROJECT_REF` (se usar deploy/migracoes via CI)

## 5) Fluxo diario recomendado

```bash
git checkout main
git pull --ff-only
git checkout -b feat/minha-feature
npm run dev
# codar + validar
npm run lint
npm run build
git add .
git commit -m "feat: descricao objetiva"
git push -u origin feat/minha-feature
```

Abra Pull Request. O workflow de CI valida build/typecheck de web e API automaticamente.

## 6) Checklist pre-producao

- `.env.local` com chaves corretas.
- Build web e API sem erros.
- Tipos Supabase atualizados.
- SQL de migracao versionado em `sql/`.
- PR aprovado e CI verde.
- Merge em `main` com tag/release planejada.
