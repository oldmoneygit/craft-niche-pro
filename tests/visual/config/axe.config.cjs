/**
 * Configuração do Axe-Core para Testes de Acessibilidade - KorLab Nutri
 * WCAG AA compliance com thresholds configuráveis
 */

module.exports = {
  // Configurações do Axe
  axe: {
    // Regras do Axe a serem executadas
    rules: {
      // Regras críticas que devem sempre passar
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'aria-labels': { enabled: true },
      'alt-text': { enabled: true },
      'heading-order': { enabled: true },
      'link-name': { enabled: true },
      'button-name': { enabled: true },
      'form-label': { enabled: true },
      'focus-order': { enabled: true },
      'skip-link': { enabled: true },
    },

    // Tags WCAG a serem verificadas
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],

    // Configurações de inclusão/exclusão
    include: [['body']],
    exclude: [
      // Excluir elementos que podem causar falsos positivos
      ['[data-testid="react-query-devtools"]'],
      ['[class*="react-query"]'],
    ],
  },

  // Thresholds de violações
  thresholds: {
    // Violações críticas - devem ser 0
    critical: 0,
    // Violações sérias - devem ser 0
    serious: 0,
    // Violações moderadas - máximo 5
    moderate: 5,
    // Violações menores - máximo 10
    minor: 10,
  },

  // Configurações de relatório
  reporter: {
    // Formato do relatório
    format: ['html', 'json', 'junit'],
    // Diretório de output
    outputDir: '../reports/accessibility',
    // Incluir screenshots de violações
    includeScreenshots: true,
    // Incluir HTML de contexto
    includeHtml: true,
  },

  // Configurações de viewport para testes de acessibilidade
  viewports: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
  ],

  // Configurações específicas por página
  pages: {
    // Configurações específicas para páginas com formulários
    forms: {
      rules: {
        'form-label': { enabled: true },
        'aria-required-parent': { enabled: true },
        'checkboxgroup': { enabled: true },
        'radiogroup': { enabled: true },
      }
    },
    
    // Configurações específicas para páginas com navegação
    navigation: {
      rules: {
        'landmark-one-main': { enabled: true },
        'landmark-unique': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true },
      }
    }
  }
};
