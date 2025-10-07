# 🥗 KorLab Nutri

Dashboard administrativa completa para nutricionistas.

## 📚 Documentação

- 📖 [Estrutura do Projeto](./docs/ESTRUTURA-PROJETO.md)
- 🗄️ [Schema do Banco](./docs/SCHEMA.md)
- 🎨 [Design System](./docs/DESIGN-SYSTEM.md)
- 🧪 [Guia de Testes](./tests/README.md)
- 📚 [Documentação Completa](./docs/README.md)

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Rodar desenvolvimento
npm run dev

# Rodar testes
npm run test:all
```

## 📁 Estrutura

```
korlab-nutri/
├── 📁 docs/              # Documentação completa
├── 📁 src/               # Código fonte
├── 📁 tests/             # Testes (E2E, Visual, Acessibilidade)
├── 📁 config/            # Configurações
├── 📁 scripts/           # Scripts utilitários
├── 📁 public/            # Assets públicos
└── 📁 supabase/          # Banco de dados e migrations
```

Veja [ESTRUTURA-PROJETO.md](./docs/ESTRUTURA-PROJETO.md) para detalhes.

## 🧪 Testes

```bash
npm run test:e2e         # Testes E2E
npm run test:visual      # Testes visuais
npm run test:accessibility # Testes de acessibilidade
npm run test:all         # Todos os testes
```

Veja [TESTING.md](./tests/README.md) para mais detalhes.

## 🎨 Design System

O projeto segue um design system documentado com paleta de cores validada WCAG AA.

Veja [DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md).

## 🗄️ Banco de Dados

**REGRA DE OURO:** Sempre consulte `docs/SCHEMA.md` antes de implementar features de banco de dados.

### Workflow de Desenvolvimento

1. Consulte `docs/SCHEMA.md` para validar nomes de colunas, foreign keys e ENUMs
2. Use `docs/PROMPT-TEMPLATE.md` para estruturar a implementação
3. Siga `docs/WORKFLOW-GUIDE.md` para processo completo
4. Valide tipos com `src/types/database.types.ts`

### Para IAs (Claude/Lovable/Bolt)

Quando implementar features relacionadas ao banco:

```
IMPORTANTE: Consulte docs/SCHEMA.md antes de gerar código.
Valide todos os nomes de colunas, foreign keys e ENUMs contra o schema.
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4336999a-0c65-4077-a4dd-af35e2981d79) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4336999a-0c65-4077-a4dd-af35e2981d79) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
