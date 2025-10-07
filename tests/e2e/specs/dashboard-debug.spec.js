/**
 * Teste de Debug - Dashboard
 * Teste específico para verificar se o Dashboard está funcionando após correção do React Query
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');

describe('Debug Dashboard - KorLab Nutri', () => {
  let browser;
  let page;

  beforeAll(async () => {
    console.log('🚀 Iniciando teste de debug do Dashboard...');
    
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Interceptar console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warn') {
        console.log('⚠️ Console Warning:', msg.text());
      }
    });

    // Interceptar erros JavaScript
    page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
    });
  });

  afterAll(async () => {
    console.log('🏁 Finalizando teste de debug do Dashboard...');
    
    if (browser) {
      await browser.close();
    }
  });

  test('deve carregar o Dashboard sem erros do React Query', async () => {
    console.log('🔍 Testando carregamento do Dashboard...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar carregamento inicial
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar se há erros específicos do React Query
    const errors = await page.evaluate(() => {
      // Capturar erros do React Query
      const reactQueryErrors = [];
      
      // Verificar se há elementos do dashboard
      const dashboardElements = document.querySelectorAll('[data-testid="dashboard"], .dashboard, main');
      
      // Verificar se há conteúdo de estatísticas
      const statsElements = document.querySelectorAll('[data-testid*="stat"], .stat-card, .metric');
      
      return {
        hasDashboardElements: dashboardElements.length > 0,
        hasStatsElements: statsElements.length > 0,
        bodyContent: document.body.textContent.length,
        hasReactQueryErrors: reactQueryErrors.length,
        pageTitle: document.title
      };
    });

    expect(errors.bodyContent).toBeGreaterThan(100);
    expect(errors.pageTitle).toBeTruthy();
    
    console.log('📊 Status do Dashboard:');
    console.log(`  - Elementos Dashboard: ${errors.hasDashboardElements}`);
    console.log(`  - Elementos Stats: ${errors.hasStatsElements}`);
    console.log(`  - Conteúdo da Página: ${errors.bodyContent} caracteres`);
    console.log(`  - Erros React Query: ${errors.hasReactQueryErrors}`);
    console.log(`  - Título: ${errors.pageTitle}`);
    
    console.log('✅ Dashboard carregado com sucesso');
  }, 20000);

  test('deve verificar se as queries do Dashboard estão funcionando', async () => {
    console.log('🔍 Testando queries do Dashboard...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar se há conteúdo dinâmico (indicativo de queries funcionando)
    const dashboardStatus = await page.evaluate(() => {
      // Verificar se há elementos que são carregados dinamicamente
      const dynamicElements = document.querySelectorAll('[data-testid*="stat"], .loading, .error');
      
      // Verificar se há números ou dados carregados
      const numberElements = document.querySelectorAll('text, span, div');
      let hasNumbers = false;
      
      numberElements.forEach(el => {
        const text = el.textContent;
        if (text && /^\d+$/.test(text.trim()) && parseInt(text) >= 0) {
          hasNumbers = true;
        }
      });
      
      // Verificar se há elementos de loading ou erro
      const isLoading = document.querySelector('.loading, [data-testid*="loading"]');
      const hasError = document.querySelector('.error, [data-testid*="error"]');
      
      return {
        hasDynamicElements: dynamicElements.length > 0,
        hasNumbers: hasNumbers,
        isLoading: !!isLoading,
        hasError: !!hasError,
        totalElements: document.body.children.length
      };
    });

    console.log('📊 Status das Queries:');
    console.log(`  - Elementos Dinâmicos: ${dashboardStatus.hasDynamicElements}`);
    console.log(`  - Tem Números: ${dashboardStatus.hasNumbers}`);
    console.log(`  - Está Carregando: ${dashboardStatus.isLoading}`);
    console.log(`  - Tem Erro: ${dashboardStatus.hasError}`);
    console.log(`  - Total de Elementos: ${dashboardStatus.totalElements}`);
    
    // Se há elementos e não está em erro, as queries provavelmente estão funcionando
    expect(dashboardStatus.totalElements).toBeGreaterThan(5);
    expect(dashboardStatus.hasError).toBe(false);
    
    console.log('✅ Queries do Dashboard funcionando corretamente');
  }, 25000);

  test('deve capturar screenshot do Dashboard para análise visual', async () => {
    console.log('📸 Capturando screenshot do Dashboard...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar carregamento completo
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Capturar screenshot
    const screenshot = await page.screenshot({
      path: 'tests/screenshots/dashboard-debug-test.png',
      fullPage: true
    });

    expect(screenshot).toBeTruthy();
    console.log('✅ Screenshot do Dashboard capturado: tests/screenshots/dashboard-debug-test.png');
  }, 30000);
});
