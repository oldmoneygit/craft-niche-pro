/**
 * Validador de Cores - KorLab Nutri
 * Utilitário para validar paleta de cores e contraste
 */

class ColorValidator {
  /**
   * Converte cor RGB/RGBA para valores numéricos
   */
  static parseColor(colorString) {
    if (colorString.startsWith('rgb')) {
      const values = colorString.match(/\d+/g);
      return {
        r: parseInt(values[0]),
        g: parseInt(values[1]),
        b: parseInt(values[2]),
        a: values[3] ? parseFloat(values[3]) : 1
      };
    }
    
    if (colorString.startsWith('#')) {
      const hex = colorString.slice(1);
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16),
        a: 1
      };
    }
    
    return null;
  }

  /**
   * Calcula luminância relativa de uma cor
   */
  static getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calcula contraste entre duas cores
   */
  static getContrastRatio(color1, color2) {
    const c1 = this.parseColor(color1);
    const c2 = this.parseColor(color2);
    
    if (!c1 || !c2) return 0;
    
    const l1 = this.getLuminance(c1.r, c1.g, c1.b);
    const l2 = this.getLuminance(c2.r, c2.g, c2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Verifica se contraste atende WCAG AA
   */
  static meetsWCAGAA(foreground, background, isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Verifica se contraste atende WCAG AAA
   */
  static meetsWCAGAAA(foreground, background, isLargeText = false) {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  /**
   * Analisa paleta de cores
   */
  static analyzeColorPalette(colors) {
    const analysis = {
      totalColors: colors.length,
      uniqueColors: [...new Set(colors)],
      colorCategories: {
        primary: [],
        secondary: [],
        accent: [],
        neutral: []
      },
      accessibility: {
        wcagAACompliant: 0,
        wcagAAACompliant: 0,
        totalCombinations: 0
      }
    };

    // Categorizar cores (simplificado)
    colors.forEach(color => {
      const parsed = this.parseColor(color);
      if (parsed) {
        const { r, g, b } = parsed;
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        if (brightness < 50) {
          analysis.colorCategories.neutral.push(color);
        } else if (brightness > 200) {
          analysis.colorCategories.primary.push(color);
        } else {
          analysis.colorCategories.secondary.push(color);
        }
      }
    });

    // Testar acessibilidade (combinações básicas)
    const testCombinations = [
      ['#000000', '#FFFFFF'], // Preto sobre branco
      ['#FFFFFF', '#000000'], // Branco sobre preto
      ['#0066CC', '#FFFFFF'], // Azul sobre branco
      ['#CC0000', '#FFFFFF']  // Vermelho sobre branco
    ];

    testCombinations.forEach(([fg, bg]) => {
      if (colors.includes(fg) && colors.includes(bg)) {
        analysis.accessibility.totalCombinations++;
        
        if (this.meetsWCAGAA(fg, bg)) {
          analysis.accessibility.wcagAACompliant++;
        }
        
        if (this.meetsWCAGAAA(fg, bg)) {
          analysis.accessibility.wcagAAACompliant++;
        }
      }
    });

    return analysis;
  }

  /**
   * Gera paleta de cores complementares
   */
  static generateComplementaryPalette(baseColor) {
    const parsed = this.parseColor(baseColor);
    if (!parsed) return [];

    const { r, g, b } = parsed;
    
    // Converter para HSL
    const hsl = this.rgbToHsl(r, g, b);
    
    // Gerar cores complementares
    const complementary = [
      baseColor,
      this.hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l),
      this.hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 0.2)),
      this.hslToRgb(hsl.h, hsl.s, Math.min(1, hsl.l + 0.2))
    ];

    return complementary;
  }

  /**
   * Converte RGB para HSL
   */
  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: h * 360,
      s: s,
      l: l
    };
  }

  /**
   * Converte HSL para RGB
   */
  static hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  /**
   * Valida se paleta segue design system
   */
  static validateDesignSystem(colors, rules = {}) {
    const defaults = {
      maxColors: 20,
      minContrastRatio: 4.5,
      requireNeutralColors: true,
      maxBrightnessVariation: 0.3
    };

    const config = { ...defaults, ...rules };
    const analysis = this.analyzeColorPalette(colors);
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };

    // Verificar número máximo de cores
    if (analysis.totalColors > config.maxColors) {
      validation.errors.push(`Muitas cores: ${analysis.totalColors} (máximo: ${config.maxColors})`);
      validation.score -= 20;
    }

    // Verificar cores neutras
    if (config.requireNeutralColors && analysis.colorCategories.neutral.length === 0) {
      validation.warnings.push('Faltam cores neutras na paleta');
      validation.score -= 5;
    }

    // Verificar acessibilidade
    const accessibilityRate = analysis.accessibility.totalCombinations > 0 
      ? analysis.accessibility.wcagAACompliant / analysis.accessibility.totalCombinations 
      : 0;

    if (accessibilityRate < 0.8) {
      validation.errors.push(`Baixa acessibilidade: ${Math.round(accessibilityRate * 100)}% WCAG AA`);
      validation.score -= 30;
    }

    validation.isValid = validation.errors.length === 0;
    validation.score = Math.max(0, validation.score);

    return validation;
  }
}

module.exports = ColorValidator;
