/**
 * Configuração do Puppeteer para testes E2E - KorLab Nutri
 * Configurações otimizadas para ambiente de desenvolvimento e CI/CD
 */

const path = require('path');

module.exports = {
  // Configurações do navegador
  launch: {
    headless: process.env.CI === 'true' ? 'new' : false, // Headless em CI, com UI em dev
    devtools: process.env.NODE_ENV === 'development',
    slowMo: process.env.NODE_ENV === 'development' ? 50 : 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    timeout: 30000, // 30 segundos timeout
  },

  // Configurações do servidor
  server: {
    command: 'npm run dev',
    port: 8080,
    launchTimeout: 60000, // 60 segundos para iniciar o servidor
    debug: true,
  },

  // URLs base
  baseURL: process.env.BASE_URL || 'http://localhost:8080',
  
  // Configurações de teste
  test: {
    timeout: 60000, // 60 segundos timeout para testes
    retries: process.env.CI === 'true' ? 2 : 0, // Retry em CI
    reporter: process.env.CI === 'true' ? 'junit' : 'spec',
  },

  // Configurações de screenshot
  screenshot: {
    path: path.join(__dirname, '../screenshots'),
    fullPage: true,
  },

  // Configurações de vídeo (se necessário)
  video: {
    mode: process.env.CI === 'true' ? 'retain-on-failure' : 'off',
    size: { width: 1920, height: 1080 },
  },

  // Configurações específicas do KorLab Nutri
  app: {
    // URLs das páginas principais
    urls: {
      login: '/',
      dashboard: '/',
      clientes: '/clientes',
      questionarios: '/questionarios',
      planos: '/planos',
      agendamentos: '/agendamentos',
    },
    
    // Credenciais de teste
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'test@kornutri.com',
      password: process.env.TEST_USER_PASSWORD || 'Test123!',
    },
    
    // Timeouts específicos
    timeouts: {
      navigation: 10000,
      element: 5000,
      api: 15000,
    },
  },
};
