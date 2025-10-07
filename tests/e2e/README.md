# 🧪 Testes E2E - KorLab Nutri

Sistema completo de testes end-to-end para o KorLab Nutri, implementado com Puppeteer e Jest.

## 📋 Índice

- [Configuração](#configuração)
- [Estrutura](#estrutura)
- [Executando Testes](#executando-testes)
- [Escrevendo Testes](#escrevendo-testes)
- [Helpers](#helpers)
- [Debugging](#debugging)
- [CI/CD](#cicd)

## 🚀 Configuração

### Pré-requisitos

- Node.js 18+
- Aplicação KorLab Nutri rodando em `http://localhost:8080`
- Dados de teste configurados no banco

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional)
export BASE_URL=http://localhost:8080
export TEST_USER_EMAIL=test@kornutri.com
export TEST_USER_PASSWORD=Test123!
export TAKE_SCREENSHOTS=true
```

## 📁 Estrutura

```
tests/e2e/
├── config/
│   ├── puppeteer.config.js    # Configuração do Puppeteer
│   ├── jest.config.js         # Configuração do Jest
│   └── setup.js              # Setup global
├── helpers/
│   ├── auth.helper.js        # Helper de autenticação
│   ├── form.helper.js        # Helper de formulários
│   └── navigation.helper.js  # Helper de navegação
├── specs/
│   ├── auth.spec.js          # Testes de autenticação
│   ├── clients.spec.js       # Testes de clientes
│   ├── questionnaires.spec.js # Testes de questionários
│   ├── meal-plans.spec.js    # Testes de planos alimentares
│   └── e2e-flow.spec.js      # Fluxo completo E2E
├── fixtures/
│   └── test-data.js          # Dados de teste
└── README.md                 # Esta documentação
```

## ▶️ Executando Testes

### Comandos Disponíveis

```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar testes específicos
npm run test:e2e:auth           # Apenas autenticação
npm run test:e2e:clients        # Apenas clientes
npm run test:e2e:questionnaires # Apenas questionários
npm run test:e2e:meal-plans     # Apenas planos alimentares
npm run test:e2e:flow          # Fluxo completo

# Modo watch (desenvolvimento)
npm run test:e2e:watch

# Debug mode
npm run test:e2e:debug

# CI/CD mode
npm run test:e2e:ci
```

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BASE_URL` | `http://localhost:8080` | URL base da aplicação |
| `TEST_USER_EMAIL` | `test@kornutri.com` | Email do usuário de teste |
| `TEST_USER_PASSWORD` | `Test123!` | Senha do usuário de teste |
| `TAKE_SCREENSHOTS` | `false` | Capturar screenshots |
| `CI` | `false` | Modo CI/CD |

## ✍️ Escrevendo Testes

### Estrutura Básica

```javascript
describe('Nome do Módulo', () => {
  let browser;
  let page;
  let authHelper;
  let formHelper;
  let navHelper;

  beforeAll(async () => {
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    
    authHelper = new AuthHelper(page, config);
    formHelper = new FormHelper(page, config);
    navHelper = new NavigationHelper(page, config);
    
    await authHelper.login();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('deve fazer algo específico', async () => {
    // Seu teste aqui
    await navHelper.navigateTo('clientes');
    await formHelper.fillInput('input[name="name"]', 'João Silva');
    await formHelper.submitForm();
    
    expect(await formHelper.waitForSuccessMessage()).toBe(true);
  });
});
```

### Padrões de Teste

1. **Sempre fazer login** antes dos testes
2. **Usar helpers** para operações comuns
3. **Aguardar elementos** antes de interagir
4. **Verificar resultados** com expectativas claras
5. **Limpar dados** entre testes quando necessário

## 🔧 Helpers

### AuthHelper

```javascript
// Login
await authHelper.login('email@test.com', 'password');

// Verificar se está logado
const isLoggedIn = await authHelper.isLoggedIn();

// Logout
await authHelper.logout();

// Limpar dados de auth
await authHelper.clearAuthData();
```

### FormHelper

```javascript
// Preencher input
await formHelper.fillInput('input[name="name"]', 'João Silva');

// Selecionar opção
await formHelper.selectOption('select[name="category"]', 'option-value');

// Marcar checkbox
await formHelper.toggleCheckbox('input[name="agreed"]', true);

// Submeter formulário
await formHelper.submitForm('form');

// Aguardar mensagens
await formHelper.waitForSuccessMessage('Cliente criado');
await formHelper.waitForErrorMessage('Campo obrigatório');
```

### NavigationHelper

```javascript
// Navegar para página
await navHelper.navigateTo('clientes', '[data-testid="client-list"]');

// Clicar em link de navegação
await navHelper.clickNavigationLink('Clientes');

// Aguardar elemento
await navHelper.waitForElement('[data-testid="modal"]');

// Verificar se está na página correta
const isOnPage = await navHelper.isOnPage('clientes');
```

## 🐛 Debugging

### Modo Debug

```bash
# Executar em modo debug
npm run test:e2e:debug

# Com screenshots
TAKE_SCREENSHOTS=true npm run test:e2e:debug
```

### Screenshots Automáticos

Screenshots são capturados automaticamente em:
- Falhas de teste
- Quando `TAKE_SCREENSHOTS=true`
- Pasta: `tests/screenshots/`

### Logs Detalhados

```bash
# Verbose mode
VERBOSE=true npm run test:e2e
```

### Debug Manual

```javascript
// Pausar execução
await page.waitForTimeout(5000);

// Log de elementos
await page.evaluate(() => console.log(document.body.innerHTML));

// Screenshot manual
await page.screenshot({ path: 'debug.png' });
```

## 🔄 CI/CD

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      - run: npm run dev &
      - run: npm run test:e2e:ci
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-screenshots
          path: tests/screenshots/
```

### Configuração CI

```bash
# Variáveis para CI
export CI=true
export BASE_URL=http://localhost:8080
export TAKE_SCREENSHOTS=true

# Executar testes
npm run test:e2e:ci
```

## 📊 Relatórios

### JUnit XML

Relatórios em formato JUnit são gerados em `tests/reports/junit.xml` para integração com CI/CD.

### Coverage

Relatórios de cobertura são gerados em `tests/coverage/` quando executado em modo CI.

## 🚨 Troubleshooting

### Problemas Comuns

1. **Timeout de conexão**
   - Verificar se a aplicação está rodando
   - Aumentar timeout no `puppeteer.config.js`

2. **Elementos não encontrados**
   - Verificar se `data-testid` está presente
   - Aguardar carregamento com `waitForElement`

3. **Testes instáveis**
   - Adicionar `waitForTimeout` entre operações
   - Usar `waitForNavigation` após cliques

4. **Dados de teste**
   - Verificar se dados existem no banco
   - Limpar dados entre testes

### Logs Úteis

```bash
# Ver logs do Puppeteer
DEBUG=puppeteer:* npm run test:e2e

# Ver logs do Jest
npm run test:e2e -- --verbose

# Ver requests HTTP
VERBOSE=true npm run test:e2e
```

## 📝 Dados de Teste

### Configuração

Dados de teste estão em `fixtures/test-data.js`:

```javascript
const testData = {
  users: {
    validUser: {
      email: 'test@kornutri.com',
      password: 'Test123!',
    },
  },
  clients: {
    validClient: {
      name: 'João Silva',
      email: 'joao@test.com',
      phone: '(11) 99999-9999',
    },
  },
  // ... mais dados
};
```

### Seletores

```javascript
const selectors = {
  loginForm: 'form[data-testid="login-form"]',
  clientList: '[data-testid="client-list"]',
  modal: '[data-testid="modal"]',
  // ... mais seletores
};
```

## 🤝 Contribuindo

### Adicionando Novos Testes

1. Criar arquivo em `specs/`
2. Usar helpers existentes
3. Seguir padrões estabelecidos
4. Adicionar dados em `fixtures/test-data.js`
5. Documentar no README

### Adicionando Novos Helpers

1. Criar arquivo em `helpers/`
2. Exportar classe com métodos utilitários
3. Documentar métodos
4. Usar em testes existentes

---

**🎯 Objetivo**: Garantir que todos os fluxos críticos do KorLab Nutri funcionem corretamente em ambiente de produção.

**📞 Suporte**: Em caso de dúvidas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.
