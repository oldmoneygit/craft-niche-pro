/**
 * Helper para validação do Design System - KorLab Nutri
 * Validação de cores, tipografia, espaçamentos e consistência visual
 */

class DesignHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Extrai paleta de cores da aplicação
   */
  async extractColorPalette() {
    console.log('🎨 Extraindo paleta de cores...');

    const colors = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      const colorData = [];

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const properties = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
        
        properties.forEach(prop => {
          const value = styles[prop];
          if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent' && !value.includes('var(')) {
            colorSet.add(value);
            colorData.push({
              element: el.tagName,
              property: prop,
              value: value,
              text: el.textContent?.slice(0, 20)
            });
          }
        });
      });

      return {
        uniqueColors: Array.from(colorSet),
        colorData: colorData.slice(0, 100) // Limitar para performance
      };
    });

    console.log(`🎨 ${colors.uniqueColors.length} cores únicas encontradas`);
    return colors;
  }

  /**
   * Valida tipografia
   */
  async validateTypography() {
    console.log('📝 Validando tipografia...');

    const typography = await this.page.evaluate(() => {
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, input, textarea');
      const typographyData = [];

      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const text = el.textContent?.trim();
        
        if (text && text.length > 0) {
          typographyData.push({
            tagName: el.tagName,
            text: text.slice(0, 30),
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            color: styles.color
          });
        }
      });

      return typographyData;
    });

    // Analisar consistência
    const fontFamilies = [...new Set(typography.map(t => t.fontFamily))];
    const fontSizes = [...new Set(typography.map(t => t.fontSize))];
    const fontWeights = [...new Set(typography.map(t => t.fontWeight))];

    const analysis = {
      totalElements: typography.length,
      fontFamilies,
      fontSizes,
      fontWeights,
      consistency: {
        fontFamilyCount: fontFamilies.length,
        fontSizeCount: fontSizes.length,
        fontWeightCount: fontWeights.length,
        isConsistent: fontFamilies.length <= 3 && fontSizes.length <= 8 && fontWeights.length <= 4
      }
    };

    console.log(`📝 Tipografia: ${analysis.consistency.isConsistent ? 'Consistente' : 'Inconsistente'}`);
    return { data: typography, analysis };
  }

  /**
   * Valida espaçamentos
   */
  async validateSpacing() {
    console.log('📏 Validando espaçamentos...');

    const spacing = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const spacingData = [];

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const spacingProps = ['margin', 'padding', 'gap'];
        
        spacingProps.forEach(prop => {
          const value = styles[prop];
          if (value && value !== '0px' && value !== 'normal') {
            spacingData.push({
              element: el.tagName,
              property: prop,
              value: value
            });
          }
        });
      });

      return spacingData;
    });

    // Extrair valores únicos de espaçamento
    const spacingValues = [...new Set(spacing.map(s => s.value))];
    const spacingAnalysis = {
      totalSpacings: spacing.length,
      uniqueValues: spacingValues,
      isConsistent: spacingValues.length <= 10 // Máximo de 10 valores únicos
    };

    console.log(`📏 Espaçamentos: ${spacingAnalysis.isConsistent ? 'Consistente' : 'Inconsistente'}`);
    return { data: spacing, analysis: spacingAnalysis };
  }

  /**
   * Valida componentes visuais
   */
  async validateVisualComponents() {
    console.log('🧩 Validando componentes visuais...');

    const components = await this.page.evaluate(() => {
      const components = [];
      
      // Procurar por botões
      const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
      buttons.forEach(btn => {
        const styles = window.getComputedStyle(btn);
        components.push({
          type: 'button',
          element: btn.tagName,
          text: btn.textContent?.slice(0, 20),
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding
        });
      });

      // Procurar por inputs
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const styles = window.getComputedStyle(input);
        components.push({
          type: 'input',
          element: input.tagName,
          inputType: input.type,
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          borderRadius: styles.borderRadius,
          padding: styles.padding
        });
      });

      // Procurar por cards/containers
      const cards = document.querySelectorAll('[class*="card"], [class*="container"], [class*="panel"]');
      cards.forEach(card => {
        const styles = window.getComputedStyle(card);
        components.push({
          type: 'card',
          element: card.tagName,
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          margin: styles.margin
        });
      });

      return components;
    });

    // Analisar consistência dos componentes
    const buttonStyles = components.filter(c => c.type === 'button');
    const inputStyles = components.filter(c => c.type === 'input');
    const cardStyles = components.filter(c => c.type === 'card');

    const consistencyAnalysis = {
      buttons: {
        count: buttonStyles.length,
        uniqueBackgrounds: [...new Set(buttonStyles.map(b => b.backgroundColor))].length,
        uniqueBorderRadius: [...new Set(buttonStyles.map(b => b.borderRadius))].length,
        isConsistent: buttonStyles.length <= 1 || [...new Set(buttonStyles.map(b => b.backgroundColor))].length <= 3
      },
      inputs: {
        count: inputStyles.length,
        uniqueBackgrounds: [...new Set(inputStyles.map(i => i.backgroundColor))].length,
        uniqueBorderRadius: [...new Set(inputStyles.map(i => i.borderRadius))].length,
        isConsistent: inputStyles.length <= 1 || [...new Set(inputStyles.map(i => i.backgroundColor))].length <= 3
      },
      cards: {
        count: cardStyles.length,
        uniqueBackgrounds: [...new Set(cardStyles.map(c => c.backgroundColor))].length,
        uniqueBorderRadius: [...new Set(cardStyles.map(c => c.borderRadius))].length,
        isConsistent: cardStyles.length <= 1 || [...new Set(cardStyles.map(c => c.backgroundColor))].length <= 3
      }
    };

    console.log(`🧩 Componentes: ${components.length} encontrados`);
    return { data: components, analysis: consistencyAnalysis };
  }

  /**
   * Valida responsividade do design
   */
  async validateResponsiveDesign() {
    console.log('📱 Validando design responsivo...');

    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    const responsiveResults = [];

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(500);

      const layoutAnalysis = await this.page.evaluate((viewport) => {
        const elements = document.querySelectorAll('*');
        const layoutData = [];

        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          if (rect.width > 0 && rect.height > 0) {
            layoutData.push({
              element: el.tagName,
              width: rect.width,
              height: rect.height,
              position: styles.position,
              display: styles.display,
              overflow: styles.overflow,
              isVisible: rect.width > 0 && rect.height > 0
            });
          }
        });

        return {
          viewport: viewport.name,
          totalElements: layoutData.length,
          visibleElements: layoutData.filter(e => e.isVisible).length,
          layoutData: layoutData.slice(0, 50) // Limitar para performance
        };
      }, viewport);

      responsiveResults.push(layoutAnalysis);
    }

    console.log(`📱 Responsividade testada em ${viewports.length} viewports`);
    return responsiveResults;
  }

  /**
   * Gera relatório completo do design system
   */
  async generateDesignSystemReport() {
    console.log('📊 Gerando relatório do design system...');

    const report = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      colorPalette: null,
      typography: null,
      spacing: null,
      components: null,
      responsiveDesign: null,
      summary: null
    };

    try {
      // Coletar todos os dados
      report.colorPalette = await this.extractColorPalette();
      report.typography = await this.validateTypography();
      report.spacing = await this.validateSpacing();
      report.components = await this.validateVisualComponents();
      report.responsiveDesign = await this.validateResponsiveDesign();

      // Gerar resumo
      report.summary = {
        colorCount: report.colorPalette.uniqueColors.length,
        typographyConsistent: report.typography.analysis.consistency.isConsistent,
        spacingConsistent: report.spacing.analysis.isConsistent,
        componentConsistent: Object.values(report.components.analysis).every(c => c.isConsistent),
        responsiveTested: report.responsiveDesign.length === 3,
        overallScore: this.calculateDesignScore(report)
      };

      // Salvar relatório
      const fs = require('fs').promises;
      const reportPath = `tests/visual/reports/design-system/${Date.now()}-design-report.json`;
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      console.log(`📊 Relatório do design system salvo: ${reportPath}`);
      console.log(`📊 Pontuação geral: ${report.summary.overallScore}/100`);

      return report;

    } catch (error) {
      console.error('❌ Erro ao gerar relatório do design system:', error.message);
      throw error;
    }
  }

  /**
   * Calcula pontuação geral do design system
   */
  calculateDesignScore(report) {
    let score = 100;

    // Penalizar por muitas cores
    if (report.colorPalette.uniqueColors.length > 20) {
      score -= 10;
    }

    // Penalizar por tipografia inconsistente
    if (!report.typography.analysis.consistency.isConsistent) {
      score -= 20;
    }

    // Penalizar por espaçamentos inconsistentes
    if (!report.spacing.analysis.isConsistent) {
      score -= 15;
    }

    // Penalizar por componentes inconsistentes
    const inconsistentComponents = Object.values(report.components.analysis).filter(c => !c.isConsistent).length;
    score -= inconsistentComponents * 10;

    // Penalizar se não testou responsividade
    if (report.responsiveDesign.length < 3) {
      score -= 15;
    }

    return Math.max(0, score);
  }
}

module.exports = DesignHelper;
