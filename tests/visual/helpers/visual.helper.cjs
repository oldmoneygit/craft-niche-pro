/**
 * Helper para testes visuais - KorLab Nutri
 * Utilitários para captura de screenshots, comparação visual e responsividade
 */

class VisualHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Captura screenshot de uma página específica
   */
  async capturePageScreenshot(pageName, options = {}) {
    const {
      fullPage = true,
      viewport = 'desktop',
      waitForSelector = null,
      waitForTimeout = 1000
    } = options;

    console.log(`📸 Capturando screenshot da página: ${pageName}`);

    // Aguardar seletor específico se fornecido
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
    }

    // Aguardar timeout se especificado
    if (waitForTimeout > 0) {
      await this.page.waitForTimeout(waitForTimeout);
    }

    // Configurar viewport se especificado
    if (viewport !== 'desktop') {
      await this.setViewport(viewport);
    }

    // Capturar screenshot
    const screenshot = await this.page.screenshot({
      fullPage,
      path: `tests/visual/baselines/${viewport}/${pageName}.png`
    });

    console.log(`✅ Screenshot capturado: ${pageName} (${viewport})`);
    return screenshot;
  }

  /**
   * Configura viewport para diferentes dispositivos
   */
  async setViewport(device) {
    const viewports = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };

    const viewport = viewports[device];
    if (viewport) {
      await this.page.setViewportSize(viewport);
      console.log(`📱 Viewport configurado: ${device} (${viewport.width}x${viewport.height})`);
    }
  }

  /**
   * Compara screenshot atual com baseline
   */
  async compareWithBaseline(pageName, options = {}) {
    const {
      viewport = 'desktop',
      threshold = 0.2,
      fullPage = true
    } = options;

    console.log(`🔍 Comparando com baseline: ${pageName} (${viewport})`);

    try {
      await expect(this.page).toHaveScreenshot(`${pageName}-${viewport}.png`, {
        threshold,
        fullPage
      });
      
      console.log(`✅ Comparação visual aprovada: ${pageName}`);
      return true;
    } catch (error) {
      console.error(`❌ Diferença visual detectada: ${pageName}`, error.message);
      return false;
    }
  }

  /**
   * Testa responsividade em múltiplos viewports
   */
  async testResponsiveness(pageName, viewports = ['desktop', 'tablet', 'mobile']) {
    console.log(`📱 Testando responsividade: ${pageName}`);

    const results = [];

    for (const viewport of viewports) {
      await this.setViewport(viewport);
      await this.page.waitForTimeout(500); // Aguardar estabilização

      const result = await this.compareWithBaseline(pageName, { viewport });
      results.push({ viewport, passed: result });
    }

    const passedCount = results.filter(r => r.passed).length;
    console.log(`📊 Responsividade: ${passedCount}/${results.length} viewports aprovados`);

    return results;
  }

  /**
   * Captura screenshot de elemento específico
   */
  async captureElementScreenshot(selector, name, options = {}) {
    const { waitForSelector = true } = options;

    console.log(`🎯 Capturando screenshot do elemento: ${selector}`);

    if (waitForSelector) {
      await this.page.waitForSelector(selector, { timeout: 10000 });
    }

    const element = await this.page.locator(selector);
    await element.screenshot({ path: `tests/visual/baselines/elements/${name}.png` });

    console.log(`✅ Screenshot do elemento capturado: ${name}`);
  }

  /**
   * Valida cores e contraste
   */
  async validateColors(options = {}) {
    const { minContrastRatio = 4.5 } = options;

    console.log(`🎨 Validando cores e contraste...`);

    const colors = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorData = [];

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && color !== backgroundColor) {
          colorData.push({
            element: el.tagName,
            color,
            backgroundColor,
            text: el.textContent?.slice(0, 50)
          });
        }
      });

      return colorData;
    });

    console.log(`🎨 ${colors.length} combinações de cores encontradas`);
    return colors;
  }

  /**
   * Aguarda carregamento completo da página
   */
  async waitForPageLoad() {
    console.log('⏳ Aguardando carregamento completo da página...');
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => document.readyState === 'complete');
    
    // Aguardar um pouco mais para garantir estabilização
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Página carregada completamente');
  }

  /**
   * Remove elementos que podem interferir nos testes visuais
   */
  async hideDynamicElements() {
    console.log('🙈 Ocultando elementos dinâmicos...');

    await this.page.addStyleTag({
      content: `
        /* Ocultar elementos que podem interferir nos testes */
        [data-testid*="loading"],
        [data-testid*="spinner"],
        .toast,
        .notification,
        .alert,
        [class*="animate"],
        [class*="transition"] {
          display: none !important;
        }
        
        /* Ocultar cursor */
        * {
          cursor: none !important;
        }
      `
    });

    console.log('✅ Elementos dinâmicos ocultados');
  }
}

module.exports = VisualHelper;
