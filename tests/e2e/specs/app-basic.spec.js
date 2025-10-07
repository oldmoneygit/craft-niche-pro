/**
 * Teste Básico da Aplicação - KorLab Nutri
 * Teste básico da aplicação sem autenticação
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');

describe('Teste Básico da Aplicação - KorLab Nutri', () => {
  let browser;
  let page;

  beforeAll(async () => {
    console.log('🚀 Iniciando teste básico da aplicação...');
    
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterAll(async () => {
    console.log('🏁 Finalizando teste básico da aplicação...');
    
    if (browser) {
      await browser.close();
    }
  });

  test('deve carregar a página inicial', async () => {
    console.log('🏠 Testando carregamento da página inicial...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Verificar título
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Verificar se a página carregou
    const bodyText = await page.$eval('body', el => el.textContent);
    expect(bodyText).toBeTruthy();
    
    console.log(`✅ Página inicial carregada - Título: ${title}`);
  }, 15000);

  test('deve verificar elementos básicos da interface', async () => {
    console.log('🔍 Testando elementos da interface...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Aguardar um pouco para a página carregar completamente
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar se há elementos React carregados
    const reactElements = await page.$$eval('*', elements => {
      return elements.some(el => el.__reactInternalInstance || el._reactInternalFiber);
    });

    if (reactElements) {
      console.log('✅ Elementos React detectados');
    } else {
      console.log('⚠️ Elementos React não detectados (pode ser normal)');
    }

    // Verificar se há algum conteúdo
    const hasContent = await page.evaluate(() => {
      return document.body.children.length > 0;
    });

    expect(hasContent).toBe(true);
    
    console.log('✅ Interface básica verificada');
  }, 15000);

  test('deve verificar responsividade', async () => {
    console.log('📱 Testando responsividade...');
    
    // Navegar para a aplicação
    await page.goto(config.baseURL, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // Testar diferentes tamanhos de tela
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));

      const bodyWidth = await page.$eval('body', el => el.offsetWidth);
      expect(bodyWidth).toBeGreaterThan(0);
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) - Largura: ${bodyWidth}px`);
    }
  }, 20000);
});
