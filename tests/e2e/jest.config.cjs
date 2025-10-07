/**
 * Configuração do Jest para testes E2E - KorLab Nutri
 */

module.exports = {
  // Configurações básicas
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/specs/**/*.spec.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Timeout global
  testTimeout: 120000, // 2 minutos
  
  // Configurações de setup
  setupFilesAfterEnv: ['<rootDir>/config/setup.cjs'],
  
  // Configurações de coverage
  collectCoverage: process.env.CI === 'true',
  coverageDirectory: 'tests/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  
  // Configurações de paralelização
  maxWorkers: process.env.CI === 'true' ? 2 : 1,
  
  // Configurações de verbose
  verbose: true,
  
  // Configurações de reporters
  reporters: [
    'default',
    process.env.CI === 'true' ? [
      'jest-junit',
      {
        outputDirectory: 'tests/reports',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      }
    ] : null,
  ].filter(Boolean),
  
  // Configurações de globals
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // Configurações de transform
  transform: {},
  
  // Configurações de module
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Configurações de clearMocks
  clearMocks: true,
  restoreMocks: true,
  
  // Configurações de error handling
  errorOnDeprecated: true,
  
  // Configurações específicas para E2E
  testEnvironmentOptions: {
    url: 'http://localhost:8080',
  },
};
