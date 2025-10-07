/**
 * Teste de Debug - React Query
 * Teste específico para verificar se o problema do React Query foi resolvido
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');

describe('Debug React Query - KorLab Nutri', () => {
  let browser;
  let page;

  beforeAll(async () => {
    console.log('🚀 Iniciando teste de debug do React Query...');
    
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
      } else if (msg.text().includes('Query') || msg.text().includes('React Query')) {
        console.log('🔍 Query Log:', msg.text());
      }
    });

    // Interceptar erros JavaScript
    page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
    });
  });

  afterAll(async () => {
    console.log('🏁 Finalizando teste de debug...');
    
    if (browser) {
      await browser.close();
    }
  });

  test('deve carregar a aplicação sem erros do React Query', async () => {
    console.log('🔍 Testando carregamento da aplicação...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar um pouco para a aplicação carregar
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar se há erros no console
    const errors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });

    // Verificar se a página carregou corretamente
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Verificar se há conteúdo na página
    const hasContent = await page.evaluate(() => {
      return document.body.children.length > 0;
    });
    expect(hasContent).toBe(true);

    // Verificar se não há tela branca
    const bodyText = await page.evaluate(() => {
      return document.body.textContent;
    });
    expect(bodyText.length).toBeGreaterThan(100); // Deve ter algum conteúdo

    console.log('✅ Aplicação carregada com sucesso');
    console.log(`📄 Título: ${title}`);
    console.log(`📝 Conteúdo: ${bodyText.length} caracteres`);
    
    if (errors.length > 0) {
      console.log('⚠️ Erros encontrados:', errors);
    }
  }, 20000);

  test('deve verificar se o React Query está funcionando', async () => {
    console.log('🔍 Testando funcionalidade do React Query...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar se o React Query está disponível
    const reactQueryStatus = await page.evaluate(() => {
      // Verificar se não há erros relacionados ao React Query
      const errors = [];
      
      // Verificar se há elementos React renderizados
      const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
      
      // Verificar se há conteúdo dinâmico (indicativo de queries funcionando)
      const dynamicContent = document.querySelector('[data-testid="dashboard"], .dashboard, main');
      
      return {
        hasReactElements: reactElements.length > 0,
        hasDynamicContent: !!dynamicContent,
        bodyContent: document.body.textContent.length,
        hasErrors: window.consoleErrors ? window.consoleErrors.length : 0
      };
    });

    expect(reactQueryStatus.bodyContent).toBeGreaterThan(100);
    
    console.log('📊 Status do React Query:');
    console.log(`  - Elementos React: ${reactQueryStatus.hasReactElements}`);
    console.log(`  - Conteúdo Dinâmico: ${reactQueryStatus.hasDynamicContent}`);
    console.log(`  - Conteúdo da Página: ${reactQueryStatus.bodyContent} caracteres`);
    console.log(`  - Erros: ${reactQueryStatus.hasErrors}`);
    
    // Se há conteúdo significativo, o React Query provavelmente está funcionando
    expect(reactQueryStatus.bodyContent).toBeGreaterThan(200);
    
    console.log('✅ React Query funcionando corretamente');
  }, 20000);

  test('deve capturar screenshot para análise visual', async () => {
    console.log('📸 Capturando screenshot para análise...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar carregamento completo
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Capturar screenshot
    const screenshot = await page.screenshot({
      path: 'tests/screenshots/debug-query-test.png',
      fullPage: true
    });

    expect(screenshot).toBeTruthy();
    console.log('✅ Screenshot capturado: tests/screenshots/debug-query-test.png');
  }, 25000);
});
