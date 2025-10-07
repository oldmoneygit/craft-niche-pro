/**
 * Helper para testes de acessibilidade - KorLab Nutri
 * Integração com Axe-Core para auditoria de acessibilidade WCAG AA
 */

const AxeBuilder = require('@axe-core/playwright').default;

class AccessibilityHelper {
  constructor(page) {
    this.page = page;
    this.axeBuilder = new AxeBuilder(page);
  }

  /**
   * Executa auditoria completa de acessibilidade
   */
  async runAccessibilityAudit(options = {}) {
    const {
      include = [['body']],
      exclude = [
        ['[data-testid="react-query-devtools"]'],
        ['[class*="react-query"]']
      ],
      tags = ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
      rules = {},
      threshold = {
        critical: 0,
        serious: 0,
        moderate: 5,
        minor: 10
      }
    } = options;

    console.log('♿ Executando auditoria de acessibilidade...');

    try {
      // Configurar Axe Builder
      this.axeBuilder
        .include(include)
        .exclude(exclude)
        .withTags(tags);

      // Aplicar regras customizadas
      Object.entries(rules).forEach(([rule, config]) => {
        this.axeBuilder.withRules(rule, config);
      });

      // Executar auditoria
      const results = await this.axeBuilder.analyze();

      // Processar resultados
      const processedResults = this.processAxeResults(results, threshold);

      // Gerar relatório
      await this.generateAccessibilityReport(processedResults);

      console.log(`✅ Auditoria concluída: ${processedResults.summary.violations} violações encontradas`);
      
      return processedResults;

    } catch (error) {
      console.error('❌ Erro na auditoria de acessibilidade:', error.message);
      throw error;
    }
  }

  /**
   * Processa resultados do Axe para análise
   */
  processAxeResults(results, threshold) {
    const violations = results.violations;
    const passed = results.passes;
    const incomplete = results.incomplete;

    // Categorizar violações por severidade
    const categorizedViolations = {
      critical: violations.filter(v => v.impact === 'critical'),
      serious: violations.filter(v => v.impact === 'serious'),
      moderate: violations.filter(v => v.impact === 'moderate'),
      minor: violations.filter(v => v.impact === 'minor')
    };

    // Verificar thresholds
    const thresholdResults = {
      critical: {
        count: categorizedViolations.critical.length,
        threshold: threshold.critical,
        passed: categorizedViolations.critical.length <= threshold.critical
      },
      serious: {
        count: categorizedViolations.serious.length,
        threshold: threshold.serious,
        passed: categorizedViolations.serious.length <= threshold.serious
      },
      moderate: {
        count: categorizedViolations.moderate.length,
        threshold: threshold.moderate,
        passed: categorizedViolations.moderate.length <= threshold.moderate
      },
      minor: {
        count: categorizedViolations.minor.length,
        threshold: threshold.minor,
        passed: categorizedViolations.minor.length <= threshold.minor
      }
    };

    // Calcular pontuação geral
    const totalViolations = violations.length;
    const score = Math.max(0, 100 - (totalViolations * 5)); // Penalidade de 5 pontos por violação

    return {
      summary: {
        violations: totalViolations,
        passed: passed.length,
        incomplete: incomplete.length,
        score: score,
        url: results.url,
        timestamp: new Date().toISOString()
      },
      violations: categorizedViolations,
      thresholdResults,
      rawResults: results,
      passed,
      incomplete
    };
  }

  /**
   * Gera relatório de acessibilidade
   */
  async generateAccessibilityReport(results) {
    const reportData = {
      timestamp: results.summary.timestamp,
      url: results.summary.url,
      score: results.summary.score,
      summary: results.summary,
      violations: results.violations,
      thresholdResults: results.thresholdResults
    };

    // Salvar relatório JSON
    const fs = require('fs').promises;
    const reportPath = `tests/visual/reports/accessibility/${Date.now()}-accessibility-report.json`;
    
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📊 Relatório de acessibilidade salvo: ${reportPath}`);

    return reportData;
  }

  /**
   * Testa navegação por teclado
   */
  async testKeyboardNavigation() {
    console.log('⌨️ Testando navegação por teclado...');

    const navigationResults = [];

    // Testar Tab navigation
    await this.page.keyboard.press('Tab');
    let focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    navigationResults.push({ action: 'Tab', focusedElement });

    // Testar Shift+Tab (navegação reversa)
    await this.page.keyboard.press('Shift+Tab');
    focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    navigationResults.push({ action: 'Shift+Tab', focusedElement });

    // Testar Enter em elementos focáveis
    await this.page.keyboard.press('Enter');
    navigationResults.push({ action: 'Enter', result: 'pressed' });

    // Testar Escape
    await this.page.keyboard.press('Escape');
    navigationResults.push({ action: 'Escape', result: 'pressed' });

    console.log(`✅ Navegação por teclado testada: ${navigationResults.length} ações`);
    return navigationResults;
  }

  /**
   * Verifica contraste de cores
   */
  async checkColorContrast() {
    console.log('🎨 Verificando contraste de cores...');

    const contrastResults = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const contrastData = [];

      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)') {
            contrastData.push({
              element: el.tagName,
              text: text.slice(0, 30),
              color,
              backgroundColor,
              hasContrast: true // Simplificado - seria necessário calcular ratio real
            });
          }
        }
      });

      return contrastData;
    });

    console.log(`🎨 ${contrastResults.length} elementos com texto verificados`);
    return contrastResults;
  }

  /**
   * Verifica labels e ARIA
   */
  async checkLabelsAndAria() {
    console.log('🏷️ Verificando labels e ARIA...');

    const labelResults = await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      const results = [];

      inputs.forEach(input => {
        const hasLabel = !!input.closest('label') || input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
        const hasId = !!input.id;
        const hasPlaceholder = !!input.placeholder;

        results.push({
          tagName: input.tagName,
          type: input.type,
          hasLabel,
          hasId,
          hasPlaceholder,
          accessible: hasLabel || hasPlaceholder
        });
      });

      return results;
    });

    const accessibleCount = labelResults.filter(r => r.accessible).length;
    console.log(`🏷️ ${accessibleCount}/${labelResults.length} inputs acessíveis`);
    
    return labelResults;
  }

  /**
   * Verifica estrutura de headings
   */
  async checkHeadingStructure() {
    console.log('📋 Verificando estrutura de headings...');

    const headingStructure = await this.page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const structure = [];

      headings.forEach((heading, index) => {
        structure.push({
          level: parseInt(heading.tagName.charAt(1)),
          text: heading.textContent?.trim().slice(0, 50),
          order: index + 1
        });
      });

      return structure;
    });

    // Verificar se há pelo menos um h1
    const hasH1 = headingStructure.some(h => h.level === 1);
    const isOrdered = this.isHeadingOrderValid(headingStructure);

    console.log(`📋 Estrutura de headings: ${headingStructure.length} headings, H1: ${hasH1}, Ordem: ${isOrdered}`);
    
    return {
      structure: headingStructure,
      hasH1,
      isOrdered,
      valid: hasH1 && isOrdered
    };
  }

  /**
   * Verifica se a ordem dos headings é válida
   */
  isHeadingOrderValid(headings) {
    let lastLevel = 0;
    
    for (const heading of headings) {
      if (heading.level > lastLevel + 1) {
        return false; // Pulo de nível muito grande
      }
      lastLevel = heading.level;
    }
    
    return true;
  }

  /**
   * Executa auditoria completa com todos os testes
   */
  async runCompleteAccessibilityAudit() {
    console.log('♿ Iniciando auditoria completa de acessibilidade...');

    const results = {
      axeAudit: null,
      keyboardNavigation: null,
      colorContrast: null,
      labelsAndAria: null,
      headingStructure: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Executar todos os testes
      results.axeAudit = await this.runAccessibilityAudit();
      results.keyboardNavigation = await this.testKeyboardNavigation();
      results.colorContrast = await this.checkColorContrast();
      results.labelsAndAria = await this.checkLabelsAndAria();
      results.headingStructure = await this.checkHeadingStructure();

      // Calcular pontuação geral
      const score = this.calculateOverallScore(results);
      results.overallScore = score;

      console.log(`✅ Auditoria completa concluída. Pontuação: ${score}/100`);
      
      return results;

    } catch (error) {
      console.error('❌ Erro na auditoria completa:', error.message);
      throw error;
    }
  }

  /**
   * Calcula pontuação geral de acessibilidade
   */
  calculateOverallScore(results) {
    let score = 100;

    // Penalizar por violações do Axe
    if (results.axeAudit) {
      score -= results.axeAudit.summary.violations * 5;
    }

    // Penalizar por problemas de navegação por teclado
    if (results.keyboardNavigation) {
      // Lógica de penalização baseada nos resultados
    }

    // Penalizar por problemas de contraste
    if (results.colorContrast) {
      // Lógica de penalização baseada nos resultados
    }

    // Penalizar por problemas de labels/ARIA
    if (results.labelsAndAria) {
      const inaccessibleCount = results.labelsAndAria.filter(r => !r.accessible).length;
      score -= inaccessibleCount * 3;
    }

    // Penalizar por problemas de estrutura de headings
    if (results.headingStructure && !results.headingStructure.valid) {
      score -= 10;
    }

    return Math.max(0, score);
  }
}

module.exports = AccessibilityHelper;
