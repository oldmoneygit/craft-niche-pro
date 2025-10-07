# 🧪 Testes - KorLab Nutri

## Estrutura

### E2E (End-to-End)
Testes funcionais completos com Puppeteer.

**Localização:** [tests/e2e/](./e2e/)
- **Configuração:** `tests/e2e/config/`
- **Helpers:** `tests/e2e/helpers/`
- **Fixtures:** `tests/e2e/fixtures/`
- **Especificações:** `tests/e2e/specs/`

**Cobertura:**
- Autenticação completa
- Fluxo de clientes
- Criação de questionários
- Geração de planos alimentares
- Fluxo completo end-to-end

### Visual (Visual Regression)
Testes visuais e de acessibilidade com Playwright.

**Localização:** [tests/visual/](./visual/)
- **Configuração:** `tests/visual/config/`
- **Helpers:** `tests/visual/helpers/`
- **Especificações:** `tests/visual/specs/`
- **Baselines:** `tests/visual/baselines/`
- **Relatórios:** `tests/visual/reports/`

**Tipos de teste:**
- Screenshots de todas as páginas
- Testes de responsividade (desktop, tablet, mobile)
- Auditoria de acessibilidade (WCAG AA)
- Validação do design system
- Testes de contraste e cores

## Executar Testes

### Comandos Principais

```bash
# Testes E2E
npm run test:e2e                    # Todos os testes E2E
npm run test:e2e:auth              # Testes de autenticação
npm run test:e2e:clients           # Testes de clientes
npm run test:e2e:questionnaires    # Testes de questionários
npm run test:e2e:meal-plans        # Testes de planos alimentares
npm run test:e2e:flow              # Fluxo completo

# Testes Visuais
npm run test:visual                # Todos os testes visuais
npm run test:visual:chromium       # Chromium desktop
npm run test:visual:firefox        # Firefox desktop
npm run test:visual:webkit         # WebKit desktop
npm run test:visual:mobile         # Mobile (375px)
npm run test:visual:tablet         # Tablet (768px)

# Testes de Acessibilidade
npm run test:accessibility         # Auditoria WCAG AA
npm run test:design-system         # Validação design system

# Todos os Testes
npm run test:all                   # E2E + Visual + Acessibilidade
npm run test:all:ci                # Para CI/CD
```

### Modos de Debug

```bash
# E2E Debug
npm run test:e2e:debug             # Debug com logs detalhados
npm run test:e2e:watch             # Modo watch

# Visual Debug
npm run test:visual:debug          # Debug com browser aberto
npm run test:visual:headed         # Executar com browser visível
npm run test:visual:ui             # Interface gráfica

# Relatórios
npm run visual:report              # Relatório visual
npm run visual:report:accessibility # Relatório acessibilidade
```

## Configuração

### E2E (Puppeteer)
- **Config:** `tests/e2e/jest.config.cjs`
- **Setup:** `tests/e2e/config/setup.cjs`
- **Helpers:** `tests/e2e/helpers/`

### Visual (Playwright)
- **Config:** `tests/visual/config/playwright.config.cjs`
- **Global Setup:** `tests/visual/config/global-setup.cjs`
- **Axe Config:** `tests/visual/config/axe.config.cjs`

## Viewports Testados

### Desktop
- **1920x1080** - Desktop padrão
- **1440x900** - Desktop médio
- **1280x720** - Desktop pequeno

### Tablet
- **768x1024** - iPad portrait
- **1024x768** - iPad landscape

### Mobile
- **375x667** - iPhone SE
- **414x896** - iPhone 11 Pro Max

## Estrutura de Testes

### E2E - Fluxos Testados

1. **Autenticação**
   - Login com credenciais válidas
   - Logout
   - Proteção de rotas

2. **Gestão de Clientes**
   - Cadastro de cliente
   - Edição de dados
   - Visualização de perfil

3. **Questionários**
   - Criação de questionário
   - Preenchimento público
   - Aprovação de respostas

4. **Planos Alimentares**
   - Geração automática
   - Edição manual
   - Aplicação de templates

5. **Fluxo Completo**
   - Cliente → Questionário → Plano → Acompanhamento

### Visual - Páginas Testadas

- Dashboard
- Clientes
- Agendamentos
- Planos Alimentares
- Questionários
- Recordatório
- Feedbacks
- Serviços
- Mensagens
- Lembretes
- Agente IA
- Base de Conhecimento
- Relatórios
- Financeiro
- Configurações

### Acessibilidade - Critérios WCAG AA

- **Contraste:** Mínimo 4.5:1 para texto normal
- **Navegação:** Suporte completo a teclado
- **Labels:** Todos os inputs têm labels
- **ARIA:** Uso correto de atributos ARIA
- **Headings:** Estrutura hierárquica válida
- **Focus:** Indicadores visuais de foco

## Baselines e Screenshots

### Localização
- **Baselines:** `tests/visual/baselines/`
- **Screenshots:** `tests/visual/specs/visual.spec.cjs-snapshots/`

### Atualizar Baselines
```bash
npm run visual:baseline
```

### Estrutura de Baselines
```
baselines/
├── desktop/           # Screenshots desktop
├── tablet/           # Screenshots tablet
└── mobile/           # Screenshots mobile
```

## Relatórios

### Localização
- **Visual:** `tests/visual/reports/visual/`
- **Acessibilidade:** `tests/visual/reports/accessibility/`
- **Test Results:** `tests/visual/reports/test-results/`

### Visualizar Relatórios
```bash
npm run visual:report              # Abre relatório visual
npm run visual:report:accessibility # Abre relatório acessibilidade
```

## Troubleshooting

### Problemas Comuns

1. **Testes E2E falhando**
   - Verificar se o servidor está rodando
   - Verificar credenciais de teste
   - Verificar seletores de elementos

2. **Testes visuais falhando**
   - Atualizar baselines se mudanças foram intencionais
   - Verificar se elementos dinâmicos estão sendo ocultados
   - Verificar viewport correto

3. **Testes de acessibilidade falhando**
   - Verificar contraste de cores
   - Verificar labels em inputs
   - Verificar navegação por teclado

### Logs e Debug

```bash
# Logs detalhados E2E
npm run test:e2e:debug

# Debug visual com browser
npm run test:visual:debug

# Verificar configuração
npm run test:visual -- --list
```

## Contribuindo

### Adicionar Novo Teste E2E

1. Criar arquivo em `tests/e2e/specs/`
2. Seguir padrão de nomenclatura
3. Usar helpers disponíveis
4. Adicionar ao package.json se necessário

### Adicionar Novo Teste Visual

1. Adicionar à lista de páginas em `tests/visual/specs/visual.spec.cjs`
2. Verificar se todos os viewports são testados
3. Atualizar baselines se necessário

### Adicionar Novo Teste de Acessibilidade

1. Adicionar à lista de páginas em `tests/visual/specs/accessibility.spec.cjs`
2. Verificar critérios WCAG AA
3. Documentar novos requisitos

## Integração CI/CD

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: npm run test:e2e:ci

- name: Run Visual Tests
  run: npm run test:visual -- --reporter=github

- name: Run Accessibility Tests
  run: npm run test:accessibility -- --reporter=github
```

### Relatórios CI
- Testes E2E: JUnit XML
- Testes Visuais: HTML + JSON
- Testes Acessibilidade: HTML + JSON

## Ferramentas

### E2E
- **Puppeteer** - Automação de browser
- **Jest** - Framework de testes
- **Jest-Puppeteer** - Integração

### Visual
- **Playwright** - Testes multi-browser
- **Axe-Core** - Auditoria acessibilidade
- **Native Snapshots** - Comparação visual

### Utilitários
- **Playwright Codegen** - Geração de testes
- **Playwright Inspector** - Debug visual
- **Jest Watch** - Modo watch

## Precisa de Ajuda?

- 📚 Consulte a documentação em `docs/`
- 🐛 Verifique logs de erro
- 💬 Entre em contato com a equipe
- 🔧 Use comandos de debug disponíveis
