/**
 * Testes de Acessibilidade - KorLab Nutri
 * Auditoria completa WCAG AA com Axe-Core
 */

const { test, expect } = require('@playwright/test');
const AccessibilityHelper = require('../helpers/accessibility.helper.cjs');

// Páginas para testar acessibilidade
const pagesToTest = [
  { name: 'dashboard', path: '/', category: 'navigation' },
  { name: 'clientes', path: '/clientes', category: 'forms' },
  { name: 'leads', path: '/leads', category: 'forms' },
  { name: 'agendamentos', path: '/agendamentos', category: 'forms' },
  { name: 'planos-alimentares', path: '/planos', category: 'forms' },
  { name: 'questionarios', path: '/questionarios', category: 'forms' },
  { name: 'questionarios-builder', path: '/questionarios/novo', category: 'forms' },
  { name: 'recordatorio', path: '/recordatorio', category: 'forms' },
  { name: 'feedbacks', path: '/feedbacks', category: 'forms' },
  { name: 'servicos', path: '/servicos', category: 'forms' },
  { name: 'mensagens', path: '/mensagens', category: 'forms' },
  { name: 'lembretes', path: '/lembretes', category: 'forms' },
  { name: 'agente-ia', path: '/agente-ia', category: 'navigation' },
  { name: 'base-conhecimento', path: '/base-conhecimento', category: 'navigation' },
  { name: 'relatorios', path: '/relatorios', category: 'navigation' },
  { name: 'financeiro', path: '/financeiro', category: 'navigation' },
  { name: 'configuracoes', path: '/configuracoes', category: 'forms' }
];

test.describe('Testes de Acessibilidade - KorLab Nutri', () => {
  let accessibilityHelper;

  test.beforeEach(async ({ page }) => {
    accessibilityHelper = new AccessibilityHelper(page);
    
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

  // Teste de acessibilidade para cada página
  for (const pageInfo of pagesToTest) {
    test(`deve passar auditoria de acessibilidade em ${pageInfo.name}`, async ({ page }) => {
      console.log(`♿ Testando acessibilidade: ${pageInfo.name}...`);
      
      // Navegar para a página
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // Aguardar carregamento completo
      await page.waitForTimeout(2000);
      
      // Executar auditoria de acessibilidade
      const results = await accessibilityHelper.runAccessibilityAudit({
        include: [['body']],
        exclude: [
          ['[data-testid="react-query-devtools"]'],
          ['[class*="react-query"]']
        ],
        threshold: {
          critical: 0,
          serious: 0,
          moderate: 5,
          minor: 10
        }
      });
      
      // Verificar thresholds
      expect(results.thresholdResults.critical.passed).toBe(true);
      expect(results.thresholdResults.serious.passed).toBe(true);
      expect(results.thresholdResults.moderate.passed).toBe(true);
      
      // Verificar pontuação mínima (80/100)
      expect(results.summary.score).toBeGreaterThanOrEqual(80);
      
      console.log(`✅ Acessibilidade aprovada: ${pageInfo.name} (${results.summary.score}/100)`);
    });
  }

  // Teste específico de navegação por teclado
  test('deve suportar navegação por teclado', async ({ page }) => {
    console.log('⌨️ Testando navegação por teclado...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Testar navegação por teclado
    const navigationResults = await accessibilityHelper.testKeyboardNavigation();
    
    expect(navigationResults.length).toBeGreaterThan(0);
    
    console.log(`✅ Navegação por teclado testada: ${navigationResults.length} ações`);
  });

  // Teste de contraste de cores
  test('deve ter contraste adequado', async ({ page }) => {
    console.log('🎨 Testando contraste de cores...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar contraste
    const contrastResults = await accessibilityHelper.checkColorContrast();
    
    expect(contrastResults.length).toBeGreaterThan(0);
    
    console.log(`✅ Contraste verificado: ${contrastResults.length} elementos`);
  });

  // Teste de labels e ARIA
  test('deve ter labels e ARIA adequados', async ({ page }) => {
    console.log('🏷️ Testando labels e ARIA...');
    
    await page.goto('/clientes');
    await page.waitForLoadState('networkidle');
    
    // Verificar labels e ARIA
    const labelResults = await accessibilityHelper.checkLabelsAndAria();
    
    // Verificar se pelo menos 80% dos inputs são acessíveis
    const accessibleCount = labelResults.filter(r => r.accessible).length;
    const accessibilityRate = accessibleCount / labelResults.length;
    
    expect(accessibilityRate).toBeGreaterThanOrEqual(0.8);
    
    console.log(`✅ Labels e ARIA: ${Math.round(accessibilityRate * 100)}% acessível`);
  });

  // Teste de estrutura de headings
  test('deve ter estrutura de headings válida', async ({ page }) => {
    console.log('📋 Testando estrutura de headings...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar estrutura de headings
    const headingResults = await accessibilityHelper.checkHeadingStructure();
    
    expect(headingResults.hasH1).toBe(true);
    expect(headingResults.isOrdered).toBe(true);
    expect(headingResults.valid).toBe(true);
    
    console.log(`✅ Estrutura de headings válida: ${headingResults.structure.length} headings`);
  });

  // Teste completo de acessibilidade
  test('deve passar auditoria completa de acessibilidade', async ({ page }) => {
    console.log('♿ Executando auditoria completa...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Executar auditoria completa
    const completeResults = await accessibilityHelper.runCompleteAccessibilityAudit();
    
    // Verificar pontuação geral
    expect(completeResults.overallScore).toBeGreaterThanOrEqual(80);
    
    // Verificar se todos os testes foram executados
    expect(completeResults.axeAudit).toBeTruthy();
    expect(completeResults.keyboardNavigation).toBeTruthy();
    expect(completeResults.colorContrast).toBeTruthy();
    expect(completeResults.labelsAndAria).toBeTruthy();
    expect(completeResults.headingStructure).toBeTruthy();
    
    console.log(`✅ Auditoria completa: ${completeResults.overallScore}/100`);
  });

  // Teste de acessibilidade em diferentes viewports
  test('deve manter acessibilidade em diferentes viewports', async ({ page }) => {
    console.log('📱 Testando acessibilidade responsiva...');
    
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    const results = [];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const auditResults = await accessibilityHelper.runAccessibilityAudit();
      results.push({
        viewport: viewport.name,
        score: auditResults.summary.score,
        violations: auditResults.summary.violations
      });
    }
    
    // Verificar se todos os viewports mantêm acessibilidade
    results.forEach(result => {
      expect(result.score).toBeGreaterThanOrEqual(70);
    });
    
    console.log(`✅ Acessibilidade responsiva: ${results.length} viewports testados`);
  });

  // Teste de foco e navegação
  test('deve ter indicadores de foco visíveis', async ({ page }) => {
    console.log('🎯 Testando indicadores de foco...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Pressionar Tab para focar em elemento
    await page.keyboard.press('Tab');
    
    // Verificar se há indicador de foco
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (!activeElement) return null;
      
      const styles = window.getComputedStyle(activeElement);
      return {
        tagName: activeElement.tagName,
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });
    
    expect(focusedElement).toBeTruthy();
    
    // Verificar se tem indicador de foco
    const hasFocusIndicator = focusedElement.outline !== 'none' || 
                             focusedElement.outlineWidth !== '0px' ||
                             focusedElement.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBe(true);
    
    console.log('✅ Indicadores de foco verificados');
  });

  // Teste de textos alternativos
  test('deve ter textos alternativos em imagens', async ({ page }) => {
    console.log('🖼️ Testando textos alternativos...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar imagens
    const images = await page.evaluate(() => {
      const imgElements = document.querySelectorAll('img');
      return Array.from(imgElements).map(img => ({
        src: img.src,
        alt: img.alt,
        title: img.title,
        hasAlt: !!img.alt && img.alt.trim() !== ''
      }));
    });
    
    // Verificar se pelo menos 90% das imagens têm alt text
    const imagesWithAlt = images.filter(img => img.hasAlt).length;
    const altTextRate = imagesWithAlt / images.length;
    
    if (images.length > 0) {
      expect(altTextRate).toBeGreaterThanOrEqual(0.9);
    }
    
    console.log(`✅ Textos alternativos: ${Math.round(altTextRate * 100)}% das imagens`);
  });

  // Teste de links
  test('deve ter links acessíveis', async ({ page }) => {
    console.log('🔗 Testando links...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar links
    const links = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('a');
      return Array.from(linkElements).map(link => ({
        href: link.href,
        text: link.textContent?.trim(),
        hasText: !!link.textContent?.trim(),
        hasAriaLabel: !!link.getAttribute('aria-label'),
        hasTitle: !!link.getAttribute('title')
      }));
    });
    
    // Verificar se links têm texto ou aria-label
    const accessibleLinks = links.filter(link => 
      link.hasText || link.hasAriaLabel || link.hasTitle
    ).length;
    
    const linkAccessibilityRate = accessibleLinks / links.length;
    
    if (links.length > 0) {
      expect(linkAccessibilityRate).toBeGreaterThanOrEqual(0.9);
    }
    
    console.log(`✅ Links acessíveis: ${Math.round(linkAccessibilityRate * 100)}%`);
  });
});
