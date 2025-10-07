# 📁 Estrutura do Projeto - KorLab Nutri

## Visão Geral

Este documento descreve a organização completa do projeto KorLab Nutri, uma plataforma administrativa para nutricionistas.

## Estrutura de Diretórios

```
korlab-nutri/
├── 📁 docs/              # 📚 Documentação completa
├── 📁 src/               # 💻 Código fonte
├── 📁 tests/             # 🧪 Todos os testes
├── 📁 config/            # ⚙️ Configurações
├── 📁 scripts/           # 🔧 Scripts utilitários
├── 📁 public/            # 🌐 Assets públicos
├── 📁 supabase/          # 🗄️ Banco de dados e migrations
└── 📁 node_modules/      # 📦 Dependências
```

## Convenções

### Nomenclatura de Arquivos

**Componentes React:**
- PascalCase: `ClientList.tsx`
- Co-locação: `ClientList.tsx` + `ClientList.test.tsx`

**Hooks:**
- camelCase com prefixo `use`: `useClients.ts`

**Utils/Libs:**
- camelCase: `cacheStorage.ts`

**Tipos:**
- PascalCase com sufixo `.types`: `database.types.ts`

**Testes:**
- Mesmo nome + sufixo: `.spec.ts`, `.test.ts`

### Organização por Feature

Componentes são organizados por domínio/feature:

```
src/components/
├── clientes/        # Tudo relacionado a clientes
├── questionarios/   # Tudo relacionado a questionários
├── planos/          # Tudo relacionado a planos
├── agendamentos/    # Tudo relacionado a agendamentos
├── financeiro/      # Tudo relacionado a finanças
└── ui/              # Componentes de interface reutilizáveis
```

### Imports

Use path aliases para imports limpos:

```typescript
// ✅ Bom
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';

// ❌ Evitar
import { Button } from '../../../components/ui/button';
```

## Detalhamento de Pastas

### 📚 docs/

Toda a documentação do projeto.

**Principais arquivos:**
- `SCHEMA.md` - Schema completo do banco de dados
- `DESIGN-SYSTEM.md` - Guia de design e paleta de cores
- `ESTRUTURA-PROJETO.md` - Este arquivo
- `README.md` - Índice da documentação

**Sub-pastas:**
- `reports/` - Relatórios técnicos e auditorias
- `images/` - Imagens da documentação
  - `screenshots/` - Screenshots para documentação
  - `diagrams/` - Diagramas e fluxos

### 💻 src/

Todo o código fonte da aplicação.

**Sub-pastas:**
- `components/` - Componentes React (por domínio)
- `pages/` - Páginas/rotas da aplicação
- `hooks/` - Custom hooks
- `lib/` - Utilitários e bibliotecas
- `types/` - Definições TypeScript
- `contexts/` - Context providers
- `integrations/` - Integrações externas
- `utils/` - Funções utilitárias

### 🧪 tests/

Todos os testes organizados por tipo.

**Tipos de teste:**
- `e2e/` - Testes end-to-end (Puppeteer)
- `visual/` - Testes visuais (Playwright)
  - `config/` - Configurações do Playwright
  - `helpers/` - Helpers para testes visuais
  - `specs/` - Especificações de testes
  - `baselines/` - Screenshots de referência
  - `reports/` - Relatórios de testes

### ⚙️ config/

Configurações de ferramentas.

**Arquivos:**
- `eslint.config.js` - Config do ESLint
- `postcss.config.js` - Config do PostCSS

### 🔧 scripts/

Scripts utilitários e automações.

**Exemplos:**
- `audit-colors.cjs` - Auditoria de cores
- `replace-hardcoded-colors.cjs` - Substituição de cores
- `UPDATE_CLIENT_JEFERSON.sql` - Scripts SQL

### 🗄️ supabase/

Banco de dados e migrations.

**Sub-pastas:**
- `migrations/` - Migrations do banco
- `functions/` - Edge functions do Supabase

## Path Aliases

O projeto usa aliases para imports limpos:

```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@tests": path.resolve(__dirname, "./tests"),
    "@config": path.resolve(__dirname, "./config"),
    "@scripts": path.resolve(__dirname, "./scripts"),
    "@docs": path.resolve(__dirname, "./docs"),
  },
}
```

## Como Navegar

1. **Começar aqui:** [README.md](../README.md)
2. **Entender o banco:** [SCHEMA.md](./SCHEMA.md)
3. **Ver design:** [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)
4. **Rodar testes:** [../tests/README.md](../tests/README.md)
5. **Estrutura detalhada:** Este arquivo

## Manutenção

### Adicionar Nova Feature

1. Criar componentes em `src/components/{feature}/`
2. Criar hooks em `src/hooks/use{Feature}.ts`
3. Adicionar tipos em `src/types/{feature}.types.ts`
4. Criar testes em `tests/visual/specs/`
5. Documentar em `docs/` se necessário

### Adicionar Nova Página

1. Criar em `src/pages/{Page}.tsx`
2. Adicionar rota em `src/App.tsx`
3. Criar testes E2E em `tests/e2e/specs/`
4. Criar testes visuais em `tests/visual/specs/`

### Adicionar Nova Configuração

1. Criar arquivo em `config/`
2. Atualizar `vite.config.ts` se necessário
3. Atualizar `package.json` scripts se necessário

## Ferramentas Recomendadas

### VSCode Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Salve em `.vscode/extensions.json`

## Padrões de Código

### TypeScript
- Sempre usar TypeScript
- Interfaces com sufixo apropriado
- Tipos explícitos em funções públicas

### React
- Componentes em PascalCase
- Hooks com prefixo `use`
- Props com interfaces definidas

### CSS/Styling
- TailwindCSS como base
- CSS variables para temas
- Componentes shadcn/ui

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção

# Testes
npm run test:e2e         # Testes E2E
npm run test:visual      # Testes visuais
npm run test:accessibility # Testes de acessibilidade
npm run test:all         # Todos os testes

# Utilitários
npm run lint             # Lint do código
npm run preview          # Preview do build
```

## Precisa de Ajuda?

- 📚 Consulte a documentação em `docs/`
- 🐛 Abra uma issue no GitHub
- 💬 Entre em contato com a equipe
- 🔧 Veja os scripts em `scripts/` para automações
