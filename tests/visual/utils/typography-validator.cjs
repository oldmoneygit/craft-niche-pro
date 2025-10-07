/**
 * Validador de Tipografia - KorLab Nutri
 * Utilitário para validar consistência tipográfica
 */

class TypographyValidator {
  /**
   * Analisa tipografia da página
   */
  static analyzeTypography(typographyData) {
    const analysis = {
      totalElements: typographyData.length,
      fontFamilies: [...new Set(typographyData.map(t => t.fontFamily))],
      fontSizes: [...new Set(typographyData.map(t => t.fontSize))],
      fontWeights: [...new Set(typographyData.map(t => t.fontWeight))],
      lineHeights: [...new Set(typographyData.map(t => t.lineHeight))],
      colors: [...new Set(typographyData.map(t => t.color))],
      consistency: {
        fontFamilyCount: 0,
        fontSizeCount: 0,
        fontWeightCount: 0,
        isConsistent: false
      },
      hierarchy: {
        headings: typographyData.filter(t => ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(t.tagName)),
        body: typographyData.filter(t => ['P', 'SPAN', 'DIV'].includes(t.tagName)),
        interactive: typographyData.filter(t => ['BUTTON', 'A', 'INPUT'].includes(t.tagName))
      }
    };

    analysis.consistency = {
      fontFamilyCount: analysis.fontFamilies.length,
      fontSizeCount: analysis.fontSizes.length,
      fontWeightCount: analysis.fontWeights.length,
      isConsistent: analysis.fontFamilies.length <= 3 && 
                   analysis.fontSizes.length <= 8 && 
                   analysis.fontWeights.length <= 4
    };

    return analysis;
  }

  /**
   * Valida hierarquia tipográfica
   */
  static validateHierarchy(typographyData) {
    const headings = typographyData.filter(t => ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(t.tagName));
    
    const hierarchy = {
      hasH1: headings.some(h => h.tagName === 'H1'),
      headingLevels: [...new Set(headings.map(h => h.tagName))],
      sizes: {},
      weights: {},
      isValid: true,
      errors: [],
      warnings: []
    };

    // Analisar tamanhos por nível
    headings.forEach(heading => {
      const level = heading.tagName;
      if (!hierarchy.sizes[level]) {
        hierarchy.sizes[level] = [];
      }
      hierarchy.sizes[level].push(heading.fontSize);
    });

    // Verificar se H1 é o maior
    const h1Sizes = hierarchy.sizes['H1'] || [];
    const h2Sizes = hierarchy.sizes['H2'] || [];
    
    if (h1Sizes.length > 0 && h2Sizes.length > 0) {
      const avgH1 = this.parseFontSize(h1Sizes[0]);
      const avgH2 = this.parseFontSize(h2Sizes[0]);
      
      if (avgH1 <= avgH2) {
        hierarchy.errors.push('H1 deve ser maior que H2');
        hierarchy.isValid = false;
      }
    }

    // Verificar se não há H1
    if (!hierarchy.hasH1) {
      hierarchy.errors.push('Página deve ter pelo menos um H1');
      hierarchy.isValid = false;
    }

    return hierarchy;
  }

  /**
   * Converte tamanho de fonte para número
   */
  static parseFontSize(sizeString) {
    if (typeof sizeString === 'number') return sizeString;
    
    const match = sizeString.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 16;
  }

  /**
   * Valida legibilidade
   */
  static validateReadability(typographyData) {
    const readability = {
      score: 100,
      issues: [],
      recommendations: []
    };

    typographyData.forEach(element => {
      const fontSize = this.parseFontSize(element.fontSize);
      const lineHeight = this.parseLineHeight(element.lineHeight);
      
      // Verificar tamanho mínimo
      if (fontSize < 12) {
        readability.issues.push(`Texto muito pequeno: ${element.tagName} (${fontSize}px)`);
        readability.score -= 10;
      }

      // Verificar line-height
      const lineHeightRatio = lineHeight / fontSize;
      if (lineHeightRatio < 1.2) {
        readability.issues.push(`Line-height muito baixo: ${element.tagName} (${lineHeightRatio.toFixed(2)})`);
        readability.score -= 5;
      }

      if (lineHeightRatio > 2.0) {
        readability.issues.push(`Line-height muito alto: ${element.tagName} (${lineHeightRatio.toFixed(2)})`);
        readability.score -= 5;
      }
    });

    // Recomendações
    if (readability.score < 80) {
      readability.recommendations.push('Considere aumentar tamanhos de fonte menores');
      readability.recommendations.push('Ajuste line-heights para melhor legibilidade');
    }

    return readability;
  }

  /**
   * Converte line-height para número
   */
  static parseLineHeight(lineHeightString) {
    if (typeof lineHeightString === 'number') return lineHeightString;
    
    // Se é um número (sem unidade), assume px
    const numericMatch = lineHeightString.match(/^(\d+(?:\.\d+)?)$/);
    if (numericMatch) {
      return parseFloat(numericMatch[1]);
    }
    
    // Se tem unidade, extrai o número
    const unitMatch = lineHeightString.match(/(\d+(?:\.\d+)?)(px|em|rem)?/);
    return unitMatch ? parseFloat(unitMatch[1]) : 1.4;
  }

  /**
   * Valida responsividade tipográfica
   */
  static validateResponsiveness(typographyData) {
    const responsiveness = {
      score: 100,
      issues: [],
      recommendations: []
    };

    // Verificar se há unidades relativas (em, rem, %)
    const hasRelativeUnits = typographyData.some(t => 
      t.fontSize.includes('em') || 
      t.fontSize.includes('rem') || 
      t.fontSize.includes('%')
    );

    if (!hasRelativeUnits) {
      responsiveness.issues.push('Recomenda-se usar unidades relativas (em, rem) para responsividade');
      responsiveness.score -= 20;
    }

    // Verificar se há tamanhos muito grandes (pode quebrar em mobile)
    const largeSizes = typographyData.filter(t => {
      const size = this.parseFontSize(t.fontSize);
      return size > 24;
    });

    if (largeSizes.length > 5) {
      responsiveness.issues.push('Muitos tamanhos grandes podem causar problemas em mobile');
      responsiveness.score -= 15;
    }

    return responsiveness;
  }

  /**
   * Gera relatório completo de tipografia
   */
  static generateTypographyReport(typographyData) {
    const analysis = this.analyzeTypography(typographyData);
    const hierarchy = this.validateHierarchy(typographyData);
    const readability = this.validateReadability(typographyData);
    const responsiveness = this.validateResponsiveness(typographyData);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalElements: analysis.totalElements,
        fontFamilies: analysis.fontFamilies,
        fontSizes: analysis.fontSizes,
        fontWeights: analysis.fontWeights,
        overallScore: Math.round((hierarchy.isValid ? 100 : 70) + readability.score + responsiveness.score) / 3
      },
      analysis,
      hierarchy,
      readability,
      responsiveness,
      recommendations: [
        ...readability.recommendations,
        ...responsiveness.recommendations,
        ...(hierarchy.errors.length > 0 ? ['Corrigir hierarquia de headings'] : []),
        ...(analysis.consistency.isConsistent ? [] : ['Melhorar consistência tipográfica'])
      ]
    };

    return report;
  }

  /**
   * Valida se tipografia segue design system
   */
  static validateDesignSystem(typographyData, rules = {}) {
    const defaults = {
      maxFontFamilies: 3,
      maxFontSizes: 8,
      maxFontWeights: 4,
      minReadabilityScore: 80,
      requireResponsiveUnits: true
    };

    const config = { ...defaults, ...rules };
    const analysis = this.analyzeTypography(typographyData);
    const readability = this.validateReadability(typographyData);
    const responsiveness = this.validateResponsiveness(typographyData);

    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };

    // Verificar número de fontes
    if (analysis.fontFamilies.length > config.maxFontFamilies) {
      validation.errors.push(`Muitas fontes: ${analysis.fontFamilies.length} (máximo: ${config.maxFontFamilies})`);
      validation.score -= 20;
    }

    // Verificar número de tamanhos
    if (analysis.fontSizes.length > config.maxFontSizes) {
      validation.errors.push(`Muitos tamanhos: ${analysis.fontSizes.length} (máximo: ${config.maxFontSizes})`);
      validation.score -= 15;
    }

    // Verificar legibilidade
    if (readability.score < config.minReadabilityScore) {
      validation.errors.push(`Baixa legibilidade: ${readability.score}/100 (mínimo: ${config.minReadabilityScore})`);
      validation.score -= 25;
    }

    // Verificar responsividade
    if (config.requireResponsiveUnits && responsiveness.score < 90) {
      validation.warnings.push('Recomenda-se usar unidades relativas para responsividade');
      validation.score -= 10;
    }

    validation.isValid = validation.errors.length === 0;
    validation.score = Math.max(0, validation.score);

    return validation;
  }
}

module.exports = TypographyValidator;
