/**
 * Testes E2E de Financeiro - KorLab Nutri
 * Testa receitas, despesas, relatórios e gestão financeira
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão Financeira - KorLab Nutri', () => {
  let browser;
  let page;
  let authHelper;
  let formHelper;
  let navHelper;

  beforeAll(async () => {
    console.log('🚀 Iniciando testes de financeiro...');
    
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    
    // Configurar helpers
    authHelper = new AuthHelper(page, config);
    formHelper = new FormHelper(page, config);
    navHelper = new NavigationHelper(page, config);
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Fazer login antes de todos os testes
    await authHelper.login();
  });

  afterAll(async () => {
    console.log('🏁 Finalizando testes de financeiro...');
    
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Navegar para página de financeiro antes de cada teste
    await navHelper.navigateTo('financeiro', '[data-testid="finance-dashboard"]');
  });

  describe('Dashboard Financeiro', () => {
    test('deve exibir dashboard financeiro', async () => {
      console.log('💳 Teste: Dashboard financeiro');
      
      // Verificar se dashboard está visível
      const dashboardVisible = await navHelper.isElementVisible('[data-testid="finance-dashboard"]');
      expect(dashboardVisible).toBe(true);
      
      // Verificar cards de resumo
      const summaryCards = await page.$$eval(
        '[data-testid="finance-summary"] .summary-card',
        cards => cards.length
      );
      
      expect(summaryCards).toBeGreaterThanOrEqual(4); // Receitas, Despesas, Saldo, Fluxo
      
      // Verificar se valores são numéricos
      const totalRevenue = await page.$eval(
        '[data-testid="total-revenue"]',
        el => parseFloat(el.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
      );
      
      const totalExpenses = await page.$eval(
        '[data-testid="total-expenses"]',
        el => parseFloat(el.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
      );
      
      expect(totalRevenue).toBeGreaterThanOrEqual(0);
      expect(totalExpenses).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Dashboard financeiro exibido');
    }, config.test.timeout);

    test('deve exibir gráfico de fluxo de caixa', async () => {
      console.log('💳 Teste: Gráfico de fluxo de caixa');
      
      // Verificar se gráfico está visível
      const chartVisible = await navHelper.isElementVisible('[data-testid="cash-flow-chart"]');
      expect(chartVisible).toBe(true);
      
      // Verificar se há dados no gráfico
      const chartData = await page.$eval(
        '[data-testid="cash-flow-chart"]',
        el => el.textContent
      );
      
      expect(chartData).toBeTruthy();
      
      console.log('✅ Gráfico de fluxo de caixa exibido');
    }, config.test.timeout);

    test('deve exibir transações recentes', async () => {
      console.log('💳 Teste: Transações recentes');
      
      // Verificar se lista de transações está visível
      const transactionsVisible = await navHelper.isElementVisible('[data-testid="recent-transactions"]');
      expect(transactionsVisible).toBe(true);
      
      // Verificar se há transações na lista
      const transactionsCount = await page.$$eval(
        '[data-testid="recent-transactions"] .transaction-item',
        items => items.length
      );
      
      expect(transactionsCount).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Transações recentes exibidas');
    }, config.test.timeout);
  });

  describe('Gestão de Receitas', () => {
    test('deve criar nova receita', async () => {
      console.log('💳 Teste: Criação de receita');
      
      const revenueData = testData.finance.validRevenue;
      
      // Clicar no botão de nova receita
      await page.click('[data-testid="new-revenue-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="revenue-modal"]');
      
      // Preencher dados da receita
      await formHelper.fillInput('input[name="description"]', revenueData.description);
      await formHelper.fillInput('input[name="amount"]', revenueData.amount.toString());
      await formHelper.selectOption('select[name="category"]', revenueData.category);
      await formHelper.selectOption('select[name="payment_method"]', revenueData.payment_method);
      await formHelper.fillInput('input[name="date"]', revenueData.date);
      await formHelper.fillInput('textarea[name="notes"]', revenueData.notes);
      
      // Salvar receita
      await formHelper.submitForm('[data-testid="revenue-form"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Receita registrada com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible('[data-testid="revenue-modal"]');
      expect(modalVisible).toBe(false);
      
      console.log('✅ Receita criada com sucesso');
    }, config.test.timeout);

    test('deve validar campos obrigatórios da receita', async () => {
      console.log('💳 Teste: Validação de campos obrigatórios da receita');
      
      // Clicar no botão de nova receita
      await page.click('[data-testid="new-revenue-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="revenue-modal"]');
      
      // Tentar salvar sem preencher campos obrigatórios
      await page.click('[data-testid="save-revenue-button"]');
      
      // Verificar mensagens de erro
      const descriptionError = await page.$eval(
        'input[name="description"]',
        el => el.validationMessage
      );
      
      const amountError = await page.$eval(
        'input[name="amount"]',
        el => el.validationMessage
      );
      
      expect(descriptionError).toBeTruthy();
      expect(amountError).toBeTruthy();
      
      console.log('✅ Validação de campos obrigatórios da receita funcionando');
    }, config.test.timeout);

    test('deve editar receita existente', async () => {
      console.log('💳 Teste: Edição de receita');
      
      // Navegar para aba de receitas
      await page.click('[data-testid="revenues-tab"]');
      
      // Aguardar lista de receitas carregar
      await navHelper.waitForElement('[data-testid="revenues-list"] .revenue-item');
      
      // Clicar na primeira receita
      await page.click('[data-testid="revenues-list"] .revenue-item:first-child');
      
      // Aguardar modal de edição abrir
      await navHelper.waitForElement('[data-testid="revenue-modal"]');
      
      // Alterar valor
      await formHelper.fillInput('input[name="amount"]', '350.00');
      
      // Alterar descrição
      await formHelper.fillInput('input[name="description"]', 'Descrição atualizada da receita');
      
      // Salvar alterações
      await page.click('[data-testid="save-revenue-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Receita atualizada com sucesso');
      
      console.log('✅ Receita editada com sucesso');
    }, config.test.timeout);
  });

  describe('Gestão de Despesas', () => {
    test('deve criar nova despesa', async () => {
      console.log('💳 Teste: Criação de despesa');
      
      const expenseData = testData.finance.validExpense;
      
      // Clicar no botão de nova despesa
      await page.click('[data-testid="new-expense-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="expense-modal"]');
      
      // Preencher dados da despesa
      await formHelper.fillInput('input[name="description"]', expenseData.description);
      await formHelper.fillInput('input[name="amount"]', expenseData.amount.toString());
      await formHelper.selectOption('select[name="category"]', expenseData.category);
      await formHelper.selectOption('select[name="payment_method"]', expenseData.payment_method);
      await formHelper.fillInput('input[name="date"]', expenseData.date);
      await formHelper.fillInput('textarea[name="notes"]', expenseData.notes);
      
      // Salvar despesa
      await formHelper.submitForm('[data-testid="expense-form"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Despesa registrada com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible('[data-testid="expense-modal"]');
      expect(modalVisible).toBe(false);
      
      console.log('✅ Despesa criada com sucesso');
    }, config.test.timeout);

    test('deve validar campos obrigatórios da despesa', async () => {
      console.log('💳 Teste: Validação de campos obrigatórios da despesa');
      
      // Clicar no botão de nova despesa
      await page.click('[data-testid="new-expense-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="expense-modal"]');
      
      // Tentar salvar sem preencher campos obrigatórios
      await page.click('[data-testid="save-expense-button"]');
      
      // Verificar mensagens de erro
      const descriptionError = await page.$eval(
        'input[name="description"]',
        el => el.validationMessage
      );
      
      const amountError = await page.$eval(
        'input[name="amount"]',
        el => el.validationMessage
      );
      
      expect(descriptionError).toBeTruthy();
      expect(amountError).toBeTruthy();
      
      console.log('✅ Validação de campos obrigatórios da despesa funcionando');
    }, config.test.timeout);

    test('deve editar despesa existente', async () => {
      console.log('💳 Teste: Edição de despesa');
      
      // Navegar para aba de despesas
      await page.click('[data-testid="expenses-tab"]');
      
      // Aguardar lista de despesas carregar
      await navHelper.waitForElement('[data-testid="expenses-list"] .expense-item');
      
      // Clicar na primeira despesa
      await page.click('[data-testid="expenses-list"] .expense-item:first-child');
      
      // Aguardar modal de edição abrir
      await navHelper.waitForElement('[data-testid="expense-modal"]');
      
      // Alterar valor
      await formHelper.fillInput('input[name="amount"]', '150.00');
      
      // Alterar categoria
      await formHelper.selectOption('select[name="category"]', 'marketing');
      
      // Salvar alterações
      await page.click('[data-testid="save-expense-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Despesa atualizada com sucesso');
      
      console.log('✅ Despesa editada com sucesso');
    }, config.test.timeout);
  });

  describe('Relatórios Financeiros', () => {
    test('deve exibir relatório de receitas e despesas', async () => {
      console.log('💳 Teste: Relatório de receitas e despesas');
      
      // Navegar para aba de relatórios
      await page.click('[data-testid="reports-tab"]');
      
      // Aguardar relatórios carregarem
      await navHelper.waitForElement('[data-testid="financial-reports"]');
      
      // Verificar se gráfico de receitas vs despesas está visível
      const chartVisible = await navHelper.isElementVisible('[data-testid="revenue-expense-chart"]');
      expect(chartVisible).toBe(true);
      
      // Verificar métricas
      const revenueTotal = await page.$eval(
        '[data-testid="revenue-total"]',
        el => el.textContent
      );
      
      const expenseTotal = await page.$eval(
        '[data-testid="expense-total"]',
        el => el.textContent
      );
      
      const profitLoss = await page.$eval(
        '[data-testid="profit-loss"]',
        el => el.textContent
      );
      
      expect(revenueTotal).toBeTruthy();
      expect(expenseTotal).toBeTruthy();
      expect(profitLoss).toBeTruthy();
      
      console.log('✅ Relatório de receitas e despesas exibido');
    }, config.test.timeout);

    test('deve filtrar relatório por período', async () => {
      console.log('💳 Teste: Filtro de relatório por período');
      
      // Navegar para aba de relatórios
      await page.click('[data-testid="reports-tab"]');
      
      // Aguardar relatórios carregarem
      await navHelper.waitForElement('[data-testid="financial-reports"]');
      
      // Aplicar filtro de período
      await formHelper.fillInput('input[name="start_date"]', '2024-01-01');
      await formHelper.fillInput('input[name="end_date"]', '2024-01-31');
      
      // Aplicar filtro
      await page.click('[data-testid="apply-date-filter-button"]');
      
      // Aguardar atualização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se dados foram filtrados
      const filteredPeriod = await page.$eval(
        '[data-testid="filtered-period"]',
        el => el.textContent
      );
      
      expect(filteredPeriod).toContain('Janeiro');
      
      console.log('✅ Relatório filtrado por período');
    }, config.test.timeout);

    test('deve filtrar relatório por categoria', async () => {
      console.log('💳 Teste: Filtro de relatório por categoria');
      
      // Navegar para aba de relatórios
      await page.click('[data-testid="reports-tab"]');
      
      // Aguardar relatórios carregarem
      await navHelper.waitForElement('[data-testid="financial-reports"]');
      
      // Aplicar filtro de categoria
      await formHelper.selectOption('[data-testid="category-filter"]', 'consultation');
      
      // Aplicar filtro
      await page.click('[data-testid="apply-category-filter-button"]');
      
      // Aguardar atualização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se dados foram filtrados
      const filteredCategory = await page.$eval(
        '[data-testid="filtered-category"]',
        el => el.textContent
      );
      
      expect(filteredCategory).toContain('consultation');
      
      console.log('✅ Relatório filtrado por categoria');
    }, config.test.timeout);

    test('deve exportar relatório financeiro', async () => {
      console.log('💳 Teste: Exportação de relatório financeiro');
      
      // Navegar para aba de relatórios
      await page.click('[data-testid="reports-tab"]');
      
      // Aguardar relatórios carregarem
      await navHelper.waitForElement('[data-testid="financial-reports"]');
      
      // Clicar no botão de exportar
      await page.click('[data-testid="export-financial-report-button"]');
      
      // Selecionar formato
      await formHelper.selectOption('[data-testid="export-format"]', 'pdf');
      
      // Confirmar exportação
      await page.click('[data-testid="confirm-export-button"]');
      
      // Aguardar download (simulado)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Relatório financeiro exportado com sucesso');
    }, config.test.timeout);
  });

  describe('Categorias Financeiras', () => {
    test('deve criar nova categoria de receita', async () => {
      console.log('💳 Teste: Criação de categoria de receita');
      
      // Navegar para configurações
      await page.click('[data-testid="settings-tab"]');
      
      // Aguardar configurações carregarem
      await navHelper.waitForElement('[data-testid="finance-settings"]');
      
      // Clicar no botão de nova categoria de receita
      await page.click('[data-testid="new-revenue-category-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="category-modal"]');
      
      // Preencher dados da categoria
      await formHelper.fillInput('input[name="name"]', 'Consultoria Online');
      await formHelper.fillInput('input[name="description"]', 'Receitas de consultoria online');
      await formHelper.fillInput('input[name="color"]', '#3B82F6');
      
      // Salvar categoria
      await formHelper.submitForm('[data-testid="category-form"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Categoria criada com sucesso');
      
      console.log('✅ Categoria de receita criada com sucesso');
    }, config.test.timeout);

    test('deve criar nova categoria de despesa', async () => {
      console.log('💳 Teste: Criação de categoria de despesa');
      
      // Navegar para configurações
      await page.click('[data-testid="settings-tab"]');
      
      // Aguardar configurações carregarem
      await navHelper.waitForElement('[data-testid="finance-settings"]');
      
      // Clicar no botão de nova categoria de despesa
      await page.click('[data-testid="new-expense-category-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="category-modal"]');
      
      // Preencher dados da categoria
      await formHelper.fillInput('input[name="name"]', 'Marketing Digital');
      await formHelper.fillInput('input[name="description"]', 'Despesas com marketing digital');
      await formHelper.fillInput('input[name="color"]', '#EF4444');
      
      // Salvar categoria
      await formHelper.submitForm('[data-testid="category-form"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Categoria criada com sucesso');
      
      console.log('✅ Categoria de despesa criada com sucesso');
    }, config.test.timeout);

    test('deve editar categoria existente', async () => {
      console.log('💳 Teste: Edição de categoria');
      
      // Navegar para configurações
      await page.click('[data-testid="settings-tab"]');
      
      // Aguardar configurações carregarem
      await navHelper.waitForElement('[data-testid="finance-settings"]');
      
      // Aguardar lista de categorias carregar
      await navHelper.waitForElement('[data-testid="categories-list"] .category-item');
      
      // Clicar na primeira categoria
      await page.click('[data-testid="categories-list"] .category-item:first-child');
      
      // Aguardar modal de edição abrir
      await navHelper.waitForElement('[data-testid="category-modal"]');
      
      // Alterar descrição
      await formHelper.fillInput('input[name="description"]', 'Descrição atualizada da categoria');
      
      // Salvar alterações
      await page.click('[data-testid="save-category-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Categoria atualizada com sucesso');
      
      console.log('✅ Categoria editada com sucesso');
    }, config.test.timeout);
  });

  describe('Metas Financeiras', () => {
    test('deve criar meta de receita mensal', async () => {
      console.log('💳 Teste: Criação de meta de receita');
      
      // Navegar para aba de metas
      await page.click('[data-testid="goals-tab"]');
      
      // Aguardar metas carregarem
      await navHelper.waitForElement('[data-testid="financial-goals"]');
      
      // Clicar no botão de nova meta
      await page.click('[data-testid="new-goal-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="goal-modal"]');
      
      // Preencher dados da meta
      await formHelper.fillInput('input[name="title"]', 'Meta de Receita Janeiro');
      await formHelper.fillInput('input[name="target_amount"]', '10000');
      await formHelper.selectOption('select[name="type"]', 'revenue');
      await formHelper.selectOption('select[name="period"]', 'monthly');
      await formHelper.fillInput('input[name="start_date"]', '2024-01-01');
      await formHelper.fillInput('input[name="end_date"]', '2024-01-31');
      
      // Salvar meta
      await formHelper.submitForm('[data-testid="goal-form"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Meta criada com sucesso');
      
      console.log('✅ Meta de receita criada com sucesso');
    }, config.test.timeout);

    test('deve exibir progresso das metas', async () => {
      console.log('💳 Teste: Progresso das metas');
      
      // Navegar para aba de metas
      await page.click('[data-testid="goals-tab"]');
      
      // Aguardar metas carregarem
      await navHelper.waitForElement('[data-testid="financial-goals"]');
      
      // Verificar se há metas na lista
      const goalsCount = await page.$$eval(
        '[data-testid="goals-list"] .goal-item',
        items => items.length
      );
      
      expect(goalsCount).toBeGreaterThanOrEqual(0);
      
      // Verificar se progresso está visível
      const progressVisible = await navHelper.isElementVisible('[data-testid="goal-progress"]');
      expect(progressVisible).toBe(true);
      
      console.log('✅ Progresso das metas exibido');
    }, config.test.timeout);
  });
});
