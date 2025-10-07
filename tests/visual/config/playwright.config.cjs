/**
 * Configuração do Playwright para Testes Visuais e Acessibilidade - KorLab Nutri
 * Suporte multi-browser (Chromium, Firefox, WebKit) com configurações otimizadas
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Configurações gerais
  testDir: '../specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../reports/visual' }],
    ['json', { outputFile: '../reports/visual/results.json' }],
    ['junit', { outputFile: '../reports/visual/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Configurações de projeto para diferentes browsers e viewports
  projects: [
    // Desktop - Chromium
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Desktop - Firefox
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Desktop - WebKit
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Tablet
    {
      name: 'chromium-tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 }
      },
    },

    // Mobile
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
    },
  ],

  // Configurações de servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Configurações específicas para testes visuais
  expect: {
    // Threshold para comparação de screenshots
    threshold: 0.2, // 20% de diferença permitida
    // Timeout para comparações visuais
    timeout: 10000,
  },

  // Configurações de output
  outputDir: '../reports/test-results/',
  
  // Configurações globais
  globalSetup: require.resolve('./global-setup.cjs'),
  globalTeardown: require.resolve('./global-teardown.cjs'),
});
