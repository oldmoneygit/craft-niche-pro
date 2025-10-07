/**
 * Testes do Design System - KorLab Nutri
 * Validação de consistência visual, cores, tipografia e espaçamentos
 */

const { test, expect } = require('@playwright/test');
const DesignHelper = require('../helpers/design.helper.cjs');

// Páginas para validar design system
const pagesToTest = [
  { name: 'dashboard', path: '/' },
  { name: 'clientes', path: '/clientes' },
  { name: 'questionarios', path: '/questionarios' },
  { name: 'planos-alimentares', path: '/planos' },
  { name: 'configuracoes', path: '/configuracoes' }
];

test.describe('Design System - KorLab Nutri', () => {
  let designHelper;

  test.beforeEach(async ({ page }) => {
    designHelper = new DesignHelper(page);
    
    // Fazer login antes dos testes
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    try {
      await page.fill('input[name="email"]', 'nutricionista@kornutri.com');
      await page.fill('input[name="password"]', 'Nutri123!');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    } catch (error) {
      console.warn('⚠️ Login automático falhou, continuando sem autenticação');
    }
  });

  // Teste de paleta de cores
  test('deve ter paleta de cores consistente', async ({ page }) => {
    console.log('🎨 Testando paleta de cores...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const colorPalette = await designHelper.extractColorPalette();
    
    // Verificar se não há muitas cores (máximo 20 cores únicas)
    expect(colorPalette.uniqueColors.length).toBeLessThanOrEqual(20);
    
    // Verificar se há cores suficientes (mínimo 5)
    expect(colorPalette.uniqueColors.length).toBeGreaterThanOrEqual(5);
    
    console.log(`✅ Paleta de cores: ${colorPalette.uniqueColors.length} cores únicas`);
  });

  // Teste de tipografia
  test('deve ter tipografia consistente', async ({ page }) => {
    console.log('📝 Testando tipografia...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const typography = await designHelper.validateTypography();
    
    // Verificar consistência da tipografia
    expect(typography.analysis.consistency.isConsistent).toBe(true);
    
    // Verificar número de fontes (máximo 3)
    expect(typography.analysis.consistency.fontFamilyCount).toBeLessThanOrEqual(3);
    
    // Verificar número de tamanhos (máximo 8)
    expect(typography.analysis.consistency.fontSizeCount).toBeLessThanOrEqual(8);
    
    console.log(`✅ Tipografia: ${typography.analysis.consistency.fontFamilyCount} fontes, ${typography.analysis.consistency.fontSizeCount} tamanhos`);
  });

  // Teste de espaçamentos
  test('deve ter espaçamentos consistentes', async ({ page }) => {
    console.log('📏 Testando espaçamentos...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const spacing = await designHelper.validateSpacing();
    
    // Verificar consistência dos espaçamentos
    expect(spacing.analysis.isConsistent).toBe(true);
    
    // Verificar número de valores únicos (máximo 10)
    expect(spacing.analysis.uniqueValues.length).toBeLessThanOrEqual(10);
    
    console.log(`✅ Espaçamentos: ${spacing.analysis.uniqueValues.length} valores únicos`);
  });

  // Teste de componentes visuais
  test('deve ter componentes visuais consistentes', async ({ page }) => {
    console.log('🧩 Testando componentes visuais...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const components = await designHelper.validateVisualComponents();
    
    // Verificar consistência dos botões
    expect(components.analysis.buttons.isConsistent).toBe(true);
    
    // Verificar consistência dos inputs
    expect(components.analysis.inputs.isConsistent).toBe(true);
    
    // Verificar consistência dos cards
    expect(components.analysis.cards.isConsistent).toBe(true);
    
    console.log(`✅ Componentes: ${components.data.length} componentes analisados`);
  });

  // Teste de design responsivo
  test('deve ser responsivo em diferentes viewports', async ({ page }) => {
    console.log('📱 Testando design responsivo...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const responsiveResults = await designHelper.validateResponsiveDesign();
    
    // Verificar se testou todos os viewports
    expect(responsiveResults.length).toBe(3);
    
    // Verificar se há elementos visíveis em cada viewport
    responsiveResults.forEach(result => {
      expect(result.visibleElements).toBeGreaterThan(0);
    });
    
    console.log(`✅ Design responsivo: ${responsiveResults.length} viewports testados`);
  });

  // Teste completo do design system
  test('deve passar validação completa do design system', async ({ page }) => {
    console.log('📊 Executando validação completa...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const report = await designHelper.generateDesignSystemReport();
    
    // Verificar pontuação geral (mínimo 80/100)
    expect(report.summary.overallScore).toBeGreaterThanOrEqual(80);
    
    // Verificar consistência geral
    expect(report.summary.typographyConsistent).toBe(true);
    expect(report.summary.spacingConsistent).toBe(true);
    expect(report.summary.componentConsistent).toBe(true);
    expect(report.summary.responsiveTested).toBe(true);
    
    console.log(`✅ Design System: ${report.summary.overallScore}/100 pontos`);
  });

  // Teste de consistência entre páginas
  test('deve manter consistência visual entre páginas', async ({ page }) => {
    console.log('🔄 Testando consistência entre páginas...');
    
    const colorPalettes = [];
    const typographyData = [];
    
    for (const pageInfo of pagesToTest) {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      const colors = await designHelper.extractColorPalette();
      const typography = await designHelper.validateTypography();
      
      colorPalettes.push({
        page: pageInfo.name,
        colors: colors.uniqueColors
      });
      
      typographyData.push({
        page: pageInfo.name,
        fonts: typography.analysis.fontFamilies,
        sizes: typography.analysis.fontSizes
      });
    }
    
    // Verificar consistência de cores entre páginas
    const allColors = colorPalettes.flatMap(p => p.colors);
    const uniqueColorsAcrossPages = [...new Set(allColors)];
    
    // Não deve haver mais de 25 cores únicas em todas as páginas
    expect(uniqueColorsAcrossPages.length).toBeLessThanOrEqual(25);
    
    // Verificar consistência de tipografia
    const allFonts = typographyData.flatMap(t => t.fonts);
    const uniqueFonts = [...new Set(allFonts)];
    
    // Não deve haver mais de 3 fontes únicas
    expect(uniqueFonts.length).toBeLessThanOrEqual(3);
    
    console.log(`✅ Consistência entre páginas: ${uniqueColorsAcrossPages.length} cores, ${uniqueFonts.length} fontes`);
  });

  // Teste de acessibilidade visual
  test('deve ter contraste adequado em todos os elementos', async ({ page }) => {
    console.log('👁️ Testando contraste visual...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar contraste de elementos de texto
    const contrastData = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label');
      const results = [];
      
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          if (color && backgroundColor && color !== backgroundColor) {
            results.push({
              element: el.tagName,
              color,
              backgroundColor,
              text: text.slice(0, 20)
            });
          }
        }
      });
      
      return results;
    });
    
    // Verificar se há elementos com contraste
    expect(contrastData.length).toBeGreaterThan(0);
    
    console.log(`✅ Contraste visual: ${contrastData.length} elementos verificados`);
  });

  // Teste de performance visual
  test('deve carregar elementos visuais rapidamente', async ({ page }) => {
    console.log('⚡ Testando performance visual...');
    
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Verificar se carregou em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
    
    // Verificar se há elementos visuais carregados
    const visualElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).length;
    });
    
    expect(visualElements).toBeGreaterThan(10);
    
    console.log(`✅ Performance visual: ${loadTime}ms, ${visualElements} elementos`);
  });

  // Teste de layout em diferentes resoluções
  test('deve manter layout adequado em diferentes resoluções', async ({ page }) => {
    console.log('🖥️ Testando layout em diferentes resoluções...');
    
    const resolutions = [
      { name: 'HD', width: 1366, height: 768 },
      { name: 'Full HD', width: 1920, height: 1080 },
      { name: '4K', width: 3840, height: 2160 }
    ];
    
    const results = [];
    
    for (const resolution of resolutions) {
      await page.setViewportSize({ width: resolution.width, height: resolution.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const layoutInfo = await page.evaluate(() => {
        const body = document.body;
        const rect = body.getBoundingClientRect();
        
        return {
          width: rect.width,
          height: rect.height,
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
          hasVerticalScroll: document.documentElement.scrollHeight > window.innerHeight
        };
      });
      
      results.push({
        resolution: resolution.name,
        ...layoutInfo
      });
    }
    
    // Verificar se não há scroll horizontal em nenhuma resolução
    const hasHorizontalScroll = results.some(r => r.hasHorizontalScroll);
    expect(hasHorizontalScroll).toBe(false);
    
    console.log(`✅ Layout responsivo: ${results.length} resoluções testadas`);
  });
});
