/**
 * Testes E2E de Planos Alimentares - KorLab Nutri
 * Testa criação e gestão de planos alimentares
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão de Planos Alimentares - KorLab Nutri', () => {
  let browser;
  let page;
  let authHelper;
  let formHelper;
  let navHelper;

  beforeAll(async () => {
    console.log('🚀 Iniciando testes de planos alimentares...');
    
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
    console.log('🏁 Finalizando testes de planos alimentares...');
    
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Navegar para página de planos antes de cada teste
    await navHelper.navigateTo('planos', '[data-testid="meal-plan-list"]');
  });

  describe('Criação de Plano Alimentar', () => {
    test('deve criar um novo plano alimentar', async () => {
      console.log('🍽️ Teste: Criação de plano alimentar');
      
      const mealPlanData = testData.mealPlans.validMealPlan;
      
      // Clicar no botão de criar plano
      await page.click('[data-testid="create-meal-plan-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="meal-plan-form"]');
      
      // Preencher informações básicas
      await formHelper.fillInput('input[name="title"]', mealPlanData.title);
      await formHelper.fillInput('textarea[name="description"]', mealPlanData.description);
      await formHelper.fillInput('input[name="target_calories"]', mealPlanData.target_calories.toString());
      
      // Selecionar cliente (primeiro da lista)
      await navHelper.waitForElement('select[name="client_id"]');
      await formHelper.selectOption('select[name="client_id"]', '1');
      
      // Adicionar primeira refeição
      await page.click('[data-testid="add-meal-button"]');
      
      // Aguardar modal de refeição abrir
      await navHelper.waitForElement('[data-testid="meal-form"]');
      
      // Preencher dados da refeição
      await formHelper.fillInput('input[name="meal_name"]', mealPlanData.meals[0].name);
      await formHelper.fillInput('input[name="meal_time"]', mealPlanData.meals[0].time);
      
      // Adicionar primeiro alimento
      await page.click('[data-testid="add-food-button"]');
      
      // Aguardar modal de alimento abrir
      await navHelper.waitForElement('[data-testid="food-form"]');
      
      // Preencher dados do alimento
      await formHelper.fillInput('input[name="food_name"]', mealPlanData.meals[0].foods[0].name);
      await formHelper.fillInput('input[name="quantity"]', mealPlanData.meals[0].foods[0].quantity.toString());
      await formHelper.selectOption('select[name="unit"]', mealPlanData.meals[0].foods[0].unit);
      await formHelper.fillInput('input[name="calories"]', mealPlanData.meals[0].foods[0].calories.toString());
      
      // Salvar alimento
      await page.click('[data-testid="save-food-button"]');
      
      // Aguardar modal de alimento fechar
      await navHelper.waitForElementToDisappear('[data-testid="food-form"]');
      
      // Salvar refeição
      await page.click('[data-testid="save-meal-button"]');
      
      // Aguardar modal de refeição fechar
      await navHelper.waitForElementToDisappear('[data-testid="meal-form"]');
      
      // Salvar plano alimentar
      await page.click('[data-testid="save-meal-plan-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Plano alimentar criado com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible('[data-testid="meal-plan-form"]');
      expect(modalVisible).toBe(false);
      
      // Verificar se plano aparece na lista
      const planInList = await page.$eval(
        '[data-testid="meal-plan-list"]',
        (list, title) => list.textContent.includes(title),
        mealPlanData.title
      );
      expect(planInList).toBe(true);
      
      console.log('✅ Criação de plano alimentar - PASSOU');
    }, config.test.timeout);

    test('deve validar campos obrigatórios', async () => {
      console.log('🍽️ Teste: Validação de campos obrigatórios');
      
      // Clicar no botão de criar plano
      await page.click('[data-testid="create-meal-plan-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="meal-plan-form"]');
      
      // Tentar salvar sem preencher campos obrigatórios
      await page.click('[data-testid="save-meal-plan-button"]');
      
      // Verificar mensagens de erro
      const titleError = await page.$eval(
        'input[name="title"]',
        el => el.validationMessage
      );
      
      expect(titleError).toBeTruthy();
      
      console.log('✅ Validação de campos obrigatórios - PASSOU');
    }, config.test.timeout);
  });

  describe('Listagem de Planos Alimentares', () => {
    test('deve exibir lista de planos alimentares', async () => {
      console.log('📋 Teste: Listagem de planos alimentares');
      
      // Verificar se lista está visível
      const listVisible = await navHelper.isElementVisible('[data-testid="meal-plan-list"]');
      expect(listVisible).toBe(true);
      
      // Verificar se há pelo menos um plano na lista
      const planCount = await page.$$eval(
        '[data-testid="meal-plan-list"] .meal-plan-item',
        items => items.length
      );
      
      expect(planCount).toBeGreaterThan(0);
      
      console.log('✅ Listagem de planos alimentares - PASSOU');
    }, config.test.timeout);

    test('deve permitir busca de planos', async () => {
      console.log('🔍 Teste: Busca de planos alimentares');
      
      // Aguardar campo de busca
      await navHelper.waitForElement('input[data-testid="search-input"]');
      
      // Digitar termo de busca
      await formHelper.fillInput('input[data-testid="search-input"]', 'Emagrecimento');
      
      // Aguardar resultados
      await page.waitForTimeout(1000);
      
      // Verificar se resultados foram filtrados
      const filteredCount = await page.$$eval(
        '[data-testid="meal-plan-list"] .meal-plan-item',
        items => items.length
      );
      
      expect(filteredCount).toBeGreaterThan(0);
      
      console.log('✅ Busca de planos alimentares - PASSOU');
    }, config.test.timeout);
  });

  describe('Visualização de Plano Alimentar', () => {
    test('deve visualizar detalhes de um plano', async () => {
      console.log('👁️ Teste: Visualização de plano alimentar');
      
      // Aguardar lista carregar
      await navHelper.waitForElement('[data-testid="meal-plan-list"] .meal-plan-item');
      
      // Clicar no primeiro plano
      await page.click('[data-testid="meal-plan-list"] .meal-plan-item:first-child');
      
      // Aguardar modal de visualização abrir
      await navHelper.waitForElement('[data-testid="meal-plan-details"]');
      
      // Verificar se detalhes estão visíveis
      const detailsVisible = await navHelper.isElementVisible('[data-testid="meal-plan-details"]');
      expect(detailsVisible).toBe(true);
      
      // Verificar se informações básicas estão presentes
      const titleVisible = await navHelper.isElementVisible('[data-testid="meal-plan-title"]');
      expect(titleVisible).toBe(true);
      
      // Fechar modal
      await page.click('[data-testid="modal-close"]');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible('[data-testid="meal-plan-details"]');
      expect(modalVisible).toBe(false);
      
      console.log('✅ Visualização de plano alimentar - PASSOU');
    }, config.test.timeout);
  });

  describe('Edição de Plano Alimentar', () => {
    test('deve editar um plano existente', async () => {
      console.log('✏️ Teste: Edição de plano alimentar');
      
      // Aguardar lista carregar
      await navHelper.waitForElement('[data-testid="meal-plan-list"] .meal-plan-item');
      
      // Clicar no botão de editar do primeiro plano
      await page.hover('[data-testid="meal-plan-list"] .meal-plan-item:first-child');
      await page.click('[data-testid="meal-plan-list"] .meal-plan-item:first-child [data-testid="edit-button"]');
      
      // Aguardar modal de edição abrir
      await navHelper.waitForElement('[data-testid="meal-plan-form"]');
      
      // Alterar título
      await formHelper.fillInput('input[name="title"]', 'Plano Alimentar Editado');
      
      // Salvar alterações
      await page.click('[data-testid="save-meal-plan-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Plano alimentar atualizado com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible('[data-testid="meal-plan-form"]');
      expect(modalVisible).toBe(false);
      
      console.log('✅ Edição de plano alimentar - PASSOU');
    }, config.test.timeout);
  });

  describe('Exclusão de Plano Alimentar', () => {
    test('deve excluir um plano existente', async () => {
      console.log('🗑️ Teste: Exclusão de plano alimentar');
      
      // Aguardar lista carregar
      await navHelper.waitForElement('[data-testid="meal-plan-list"] .meal-plan-item');
      
      // Contar planos antes da exclusão
      const initialCount = await page.$$eval(
        '[data-testid="meal-plan-list"] .meal-plan-item',
        items => items.length
      );
      
      // Clicar no botão de excluir do primeiro plano
      await page.hover('[data-testid="meal-plan-list"] .meal-plan-item:first-child');
      await page.click('[data-testid="meal-plan-list"] .meal-plan-item:first-child [data-testid="delete-button"]');
      
      // Aguardar modal de confirmação
      await navHelper.waitForElement('[data-testid="confirmation-modal"]');
      
      // Confirmar exclusão
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Plano alimentar excluído com sucesso');
      
      // Verificar se número de planos diminuiu
      await page.waitForTimeout(1000);
      const finalCount = await page.$$eval(
        '[data-testid="meal-plan-list"] .meal-plan-item',
        items => items.length
      );
      
      expect(finalCount).toBe(initialCount - 1);
      
      console.log('✅ Exclusão de plano alimentar - PASSOU');
    }, config.test.timeout);
  });

  describe('Cálculo de Calorias', () => {
    test('deve calcular total de calorias automaticamente', async () => {
      console.log('🧮 Teste: Cálculo de calorias');
      
      // Clicar no botão de criar plano
      await page.click('[data-testid="create-meal-plan-button"]');
      
      // Aguardar modal abrir
      await navHelper.waitForElement('[data-testid="meal-plan-form"]');
      
      // Preencher informações básicas
      await formHelper.fillInput('input[name="title"]', 'Plano Teste Calorias');
      await formHelper.fillInput('textarea[name="description"]', 'Teste de cálculo de calorias');
      
      // Adicionar refeição com alimentos
      await page.click('[data-testid="add-meal-button"]');
      await navHelper.waitForElement('[data-testid="meal-form"]');
      
      await formHelper.fillInput('input[name="meal_name"]', 'Café da Manhã');
      await formHelper.fillInput('input[name="meal_time"]', '08:00');
      
      // Adicionar alimento com calorias conhecidas
      await page.click('[data-testid="add-food-button"]');
      await navHelper.waitForElement('[data-testid="food-form"]');
      
      await formHelper.fillInput('input[name="food_name"]', 'Aveia');
      await formHelper.fillInput('input[name="quantity"]', '50');
      await formHelper.selectOption('select[name="unit"]', 'g');
      await formHelper.fillInput('input[name="calories"]', '180');
      
      await page.click('[data-testid="save-food-button"]');
      await navHelper.waitForElementToDisappear('[data-testid="food-form"]');
      
      // Verificar se total de calorias foi calculado
      const totalCalories = await page.$eval(
        '[data-testid="total-calories"]',
        el => el.textContent
      );
      
      expect(totalCalories).toContain('180');
      
      await page.click('[data-testid="save-meal-button"]');
      await navHelper.waitForElementToDisappear('[data-testid="meal-form"]');
      
      console.log('✅ Cálculo de calorias - PASSOU');
    }, config.test.timeout);
  });
});
