/**
 * Testes E2E de Autenticação - KorLab Nutri
 * Testa login, logout e fluxos de autenticação
 */

const puppeteer = require('puppeteer');
const path = require('path');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Autenticação - KorLab Nutri', () => {
  let browser;
  let page;
  let authHelper;
  let navHelper;

  beforeAll(async () => {
    console.log('🚀 Iniciando testes de autenticação...');
    
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    
    // Configurar helpers
    authHelper = new AuthHelper(page, config);
    navHelper = new NavigationHelper(page, config);
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Interceptar requests para logging
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (config.test.verbose) {
        console.log(`🌐 ${request.method()} ${request.url()}`);
      }
      request.continue();
    });
  });

  afterAll(async () => {
    console.log('🏁 Finalizando testes de autenticação...');
    
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Limpar dados de autenticação antes de cada teste
    await authHelper.clearAuthData();
  });

  describe('Login', () => {
    test('deve realizar login com credenciais válidas', async () => {
      console.log('🔐 Teste: Login com credenciais válidas');
      
      // Realizar login
      await authHelper.login();
      
      // Verificar se está logado
      const isLoggedIn = await authHelper.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      // Verificar se está na página correta
      const isOnDashboard = await navHelper.isOnPage('dashboard');
      expect(isOnDashboard).toBe(true);
      
      // Verificar presença de elementos do dashboard
      await navHelper.waitForElement(testData.selectors.dashboard);
      
      console.log('✅ Login com credenciais válidas - PASSOU');
    }, config.test.timeout);

    test('deve falhar com credenciais inválidas', async () => {
      console.log('🔐 Teste: Login com credenciais inválidas');
      
      try {
        await authHelper.login(
          testData.users.invalidUser.email,
          testData.users.invalidUser.password
        );
        
        // Se chegou aqui, o teste falhou
        throw new Error('Login deveria ter falhado com credenciais inválidas');
      } catch (error) {
        // Verificar se está na página de login
        const isOnLogin = await navHelper.isOnPage('login');
        expect(isOnLogin).toBe(true);
        
        // Verificar se não está logado
        const isLoggedIn = await authHelper.isLoggedIn();
        expect(isLoggedIn).toBe(false);
        
        console.log('✅ Login com credenciais inválidas - PASSOU');
      }
    }, config.test.timeout);

    test('deve validar campos obrigatórios', async () => {
      console.log('🔐 Teste: Validação de campos obrigatórios');
      
      // Navegar para página de login
      await navHelper.navigateTo('login');
      
      // Tentar submeter formulário vazio
      await page.click(testData.selectors.loginButton);
      
      // Verificar mensagens de erro
      const emailError = await page.$eval(
        'input[type="email"]',
        el => el.validationMessage
      );
      
      const passwordError = await page.$eval(
        'input[type="password"]',
        el => el.validationMessage
      );
      
      expect(emailError).toBeTruthy();
      expect(passwordError).toBeTruthy();
      
      console.log('✅ Validação de campos obrigatórios - PASSOU');
    }, config.test.timeout);
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // Fazer login antes de cada teste de logout
      await authHelper.login();
    });

    test('deve realizar logout com sucesso', async () => {
      console.log('🚪 Teste: Logout com sucesso');
      
      // Verificar se está logado
      let isLoggedIn = await authHelper.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      // Realizar logout
      await authHelper.logout();
      
      // Verificar se não está mais logado
      isLoggedIn = await authHelper.isLoggedIn();
      expect(isLoggedIn).toBe(false);
      
      // Verificar se está na página de login
      const isOnLogin = await navHelper.isOnPage('login');
      expect(isOnLogin).toBe(true);
      
      console.log('✅ Logout com sucesso - PASSOU');
    }, config.test.timeout);
  });

  describe('Proteção de Rotas', () => {
    test('deve redirecionar para login ao acessar rota protegida sem autenticação', async () => {
      console.log('🛡️ Teste: Proteção de rotas');
      
      // Tentar acessar página protegida sem login
      await navHelper.navigateTo('clientes');
      
      // Verificar se foi redirecionado para login
      const isOnLogin = await navHelper.isOnPage('login');
      expect(isOnLogin).toBe(true);
      
      console.log('✅ Proteção de rotas - PASSOU');
    }, config.test.timeout);

    test('deve manter autenticação após reload da página', async () => {
      console.log('🔄 Teste: Persistência de autenticação');
      
      // Fazer login
      await authHelper.login();
      
      // Verificar se está logado
      let isLoggedIn = await authHelper.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      // Recarregar página
      await navHelper.reload();
      
      // Verificar se ainda está logado
      isLoggedIn = await authHelper.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      console.log('✅ Persistência de autenticação - PASSOU');
    }, config.test.timeout);
  });

  describe('Navegação Autenticada', () => {
    beforeEach(async () => {
      // Fazer login antes de cada teste
      await authHelper.login();
    });

    test('deve navegar para página de clientes', async () => {
      console.log('🧭 Teste: Navegação para clientes');
      
      await navHelper.clickNavigationLink('Clientes', testData.selectors.clientList);
      
      const isOnClientes = await navHelper.isOnPage('clientes');
      expect(isOnClientes).toBe(true);
      
      console.log('✅ Navegação para clientes - PASSOU');
    }, config.test.timeout);

    test('deve navegar para página de questionários', async () => {
      console.log('🧭 Teste: Navegação para questionários');
      
      await navHelper.clickNavigationLink('Questionários', testData.selectors.questionnaireList);
      
      const isOnQuestionarios = await navHelper.isOnPage('questionarios');
      expect(isOnQuestionarios).toBe(true);
      
      console.log('✅ Navegação para questionários - PASSOU');
    }, config.test.timeout);

    test('deve navegar para página de planos alimentares', async () => {
      console.log('🧭 Teste: Navegação para planos alimentares');
      
      await navHelper.clickNavigationLink('Planos', testData.selectors.mealPlanList);
      
      const isOnPlanos = await navHelper.isOnPage('planos');
      expect(isOnPlanos).toBe(true);
      
      console.log('✅ Navegação para planos alimentares - PASSOU');
    }, config.test.timeout);
  });
});
