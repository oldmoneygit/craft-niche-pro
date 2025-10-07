/**
 * Setup global para testes E2E - KorLab Nutri
 * Configurações e utilitários globais para todos os testes
 */

// Configurar timeouts globais
jest.setTimeout(120000); // 2 minutos

// Configurar console para testes
const originalConsole = global.console;

global.console = {
  ...originalConsole,
  // Silenciar logs em CI
  log: process.env.CI === 'true' ? jest.fn() : originalConsole.log,
  info: process.env.CI === 'true' ? jest.fn() : originalConsole.info,
  warn: originalConsole.warn,
  error: originalConsole.error,
};

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// Configurar handlers globais de erro
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Configurar cleanup automático
afterAll(async () => {
  // Cleanup global se necessário
  if (global.browser) {
    await global.browser.close();
  }
});

// Configurar helpers globais
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

global.takeScreenshot = async (page, name) => {
  if (process.env.TAKE_SCREENSHOTS === 'true') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${name}-${timestamp}.png`;
    await page.screenshot({ 
      path: `tests/screenshots/${filename}`,
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  }
};

global.waitForApiResponse = async (page, urlPattern, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout waiting for API response: ${urlPattern}`));
    }, timeout);

    page.on('response', (response) => {
      if (response.url().includes(urlPattern)) {
        clearTimeout(timeoutId);
        resolve(response);
      }
    });
  });
};

// Configurar mocks globais se necessário
global.mockApiResponses = {
  // Mock para APIs de teste
  '/api/test': { status: 200, body: { success: true } },
};

// Configurar dados de teste globais
global.testData = {
  validUser: {
    email: 'test@kornutri.com',
    password: 'Test123!',
  },
  validClient: {
    name: 'Cliente Teste E2E',
    email: 'cliente@teste.com',
    phone: '(11) 99999-9999',
  },
};

console.log('🧪 E2E Test Setup Complete');
console.log(`🌐 Base URL: ${process.env.BASE_URL}`);
console.log(`📸 Screenshots: ${process.env.TAKE_SCREENSHOTS === 'true' ? 'Enabled' : 'Disabled'}`);
console.log(`🔧 CI Mode: ${process.env.CI === 'true' ? 'Yes' : 'No'}`);
