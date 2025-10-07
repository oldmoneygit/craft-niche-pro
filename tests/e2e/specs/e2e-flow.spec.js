/**
 * Teste E2E Completo - KorLab Nutri
 * Fluxo completo desde login até criação de plano alimentar
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Fluxo E2E Completo - KorLab Nutri', () => {
  let browser;
  let page;
  let authHelper;
  let formHelper;
  let navHelper;
  let createdClientId;
  let createdQuestionnaireId;
  let createdMealPlanId;

  beforeAll(async () => {
    console.log('🚀 Iniciando teste E2E completo...');
    
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    
    // Configurar helpers
    authHelper = new AuthHelper(page, config);
    formHelper = new FormHelper(page, config);
    navHelper = new NavigationHelper(page, config);
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Interceptar requests para logging
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (config.test.verbose) {
        console.log(`🌐 ${request.method()} ${request.url()}`);
      }
      request.continue();
    });
  });

  afterAll(async () => {
    console.log('🏁 Finalizando teste E2E completo...');
    
    if (browser) {
      await browser.close();
    }
  });

  test('fluxo completo: login → cliente → questionário → plano alimentar', async () => {
    console.log('🎯 Iniciando fluxo E2E completo...');

    // ========== ETAPA 1: LOGIN ==========
    console.log('🔐 Etapa 1: Realizando login...');
    
    await authHelper.login();
    expect(await authHelper.isLoggedIn()).toBe(true);
    
    console.log('✅ Login realizado com sucesso');

    // ========== ETAPA 2: CRIAR CLIENTE ==========
    console.log('👤 Etapa 2: Criando novo cliente...');
    
    await navHelper.navigateTo('clientes', testData.selectors.clientList);
    
    const clientData = testData.clients.validClient;
    
    // Clicar no botão de adicionar cliente
    await page.click(testData.selectors.addClientButton);
    await navHelper.waitForElement(testData.selectors.modal);
    
    // Preencher dados do cliente
    await formHelper.fillInput('input[name="name"]', clientData.name);
    await formHelper.fillInput('input[name="email"]', clientData.email);
    await formHelper.fillInput('input[name="phone"]', clientData.phone);
    await formHelper.fillInput('input[name="birth_date"]', clientData.birth_date);
    await formHelper.fillInput('input[name="height_cm"]', clientData.height_cm.toString());
    await formHelper.fillInput('input[name="weight_kg"]', clientData.weight_kg.toString());
    await formHelper.fillInput('textarea[name="goal"]', clientData.goal);
    await formHelper.fillInput('textarea[name="notes"]', clientData.notes);
    
    // Salvar cliente
    await formHelper.submitForm(testData.selectors.clientForm);
    await formHelper.waitForSuccessMessage('Cliente criado com sucesso');
    
    console.log('✅ Cliente criado com sucesso');

    // ========== ETAPA 3: CRIAR QUESTIONÁRIO ==========
    console.log('📝 Etapa 3: Criando questionário...');
    
    await navHelper.navigateTo('questionarios', testData.selectors.questionnaireList);
    
    const questionnaireData = testData.questionnaires.validQuestionnaire;
    
    // Clicar no botão de criar questionário
    await page.click('[data-testid="create-questionnaire-button"]');
    await navHelper.waitForElement('[data-testid="questionnaire-builder"]');
    
    // Preencher informações básicas
    await formHelper.fillInput('input[name="title"]', questionnaireData.title);
    await formHelper.fillInput('input[name="category"]', questionnaireData.category);
    await formHelper.fillInput('textarea[name="description"]', questionnaireData.description);
    await formHelper.fillInput('input[name="estimated_time"]', questionnaireData.estimated_time.toString());
    
    // Adicionar primeira pergunta
    await page.click('[data-testid="add-question-button"]');
    await navHelper.waitForElement('[data-testid="question-editor"]');
    
    await formHelper.fillInput('input[name="question_text"]', questionnaireData.questions[0].question_text);
    await formHelper.selectOption('select[name="question_type"]', questionnaireData.questions[0].question_type);
    
    // Adicionar opções
    await formHelper.fillInput('input[name="option_0"]', questionnaireData.questions[0].options[0]);
    await formHelper.fillInput('input[name="option_1"]', questionnaireData.questions[0].options[1]);
    
    await formHelper.toggleCheckbox('input[name="is_required"]', true);
    await page.click('[data-testid="save-question-button"]');
    await navHelper.waitForElementToDisappear('[data-testid="question-editor"]');
    
    // Salvar questionário
    await page.click('[data-testid="save-questionnaire-button"]');
    await navHelper.waitForNavigation();
    await navHelper.waitForElement(testData.selectors.questionnaireList);
    
    console.log('✅ Questionário criado com sucesso');

    // ========== ETAPA 4: ENVIAR QUESTIONÁRIO ==========
    console.log('📤 Etapa 4: Enviando questionário para cliente...');
    
    // Aguardar lista carregar
    await navHelper.waitForElement(`${testData.selectors.questionnaireList} .questionnaire-item`);
    
    // Clicar no botão de enviar
    await page.hover(`${testData.selectors.questionnaireList} .questionnaire-item:first-child`);
    await page.click(`${testData.selectors.questionnaireList} .questionnaire-item:first-child [data-testid="send-button"]`);
    
    // Aguardar modal de envio
    await navHelper.waitForElement('[data-testid="send-questionnaire-modal"]');
    
    // Selecionar cliente criado
    await formHelper.selectOption('select[name="client_id"]', '1');
    await formHelper.fillInput('textarea[name="custom_message"]', 'Olá! Por favor, responda ao questionário de avaliação.');
    
    // Enviar questionário
    await page.click('[data-testid="send-questionnaire-button"]');
    await formHelper.waitForSuccessMessage('Questionário enviado com sucesso');
    
    console.log('✅ Questionário enviado com sucesso');

    // ========== ETAPA 5: CRIAR PLANO ALIMENTAR ==========
    console.log('🍽️ Etapa 5: Criando plano alimentar...');
    
    await navHelper.navigateTo('planos', '[data-testid="meal-plan-list"]');
    
    const mealPlanData = testData.mealPlans.validMealPlan;
    
    // Clicar no botão de criar plano
    await page.click('[data-testid="create-meal-plan-button"]');
    await navHelper.waitForElement('[data-testid="meal-plan-form"]');
    
    // Preencher informações básicas
    await formHelper.fillInput('input[name="title"]', mealPlanData.title);
    await formHelper.fillInput('textarea[name="description"]', mealPlanData.description);
    await formHelper.fillInput('input[name="target_calories"]', mealPlanData.target_calories.toString());
    
    // Selecionar cliente criado
    await formHelper.selectOption('select[name="client_id"]', '1');
    
    // Adicionar primeira refeição
    await page.click('[data-testid="add-meal-button"]');
    await navHelper.waitForElement('[data-testid="meal-form"]');
    
    await formHelper.fillInput('input[name="meal_name"]', mealPlanData.meals[0].name);
    await formHelper.fillInput('input[name="meal_time"]', mealPlanData.meals[0].time);
    
    // Adicionar alimento
    await page.click('[data-testid="add-food-button"]');
    await navHelper.waitForElement('[data-testid="food-form"]');
    
    await formHelper.fillInput('input[name="food_name"]', mealPlanData.meals[0].foods[0].name);
    await formHelper.fillInput('input[name="quantity"]', mealPlanData.meals[0].foods[0].quantity.toString());
    await formHelper.selectOption('select[name="unit"]', mealPlanData.meals[0].foods[0].unit);
    await formHelper.fillInput('input[name="calories"]', mealPlanData.meals[0].foods[0].calories.toString());
    
    await page.click('[data-testid="save-food-button"]');
    await navHelper.waitForElementToDisappear('[data-testid="food-form"]');
    
    await page.click('[data-testid="save-meal-button"]');
    await navHelper.waitForElementToDisappear('[data-testid="meal-form"]');
    
    // Salvar plano alimentar
    await page.click('[data-testid="save-meal-plan-button"]');
    await formHelper.waitForSuccessMessage('Plano alimentar criado com sucesso');
    
    console.log('✅ Plano alimentar criado com sucesso');

    // ========== ETAPA 6: VERIFICAR DASHBOARD ==========
    console.log('📊 Etapa 6: Verificando dashboard...');
    
    await navHelper.navigateTo('dashboard', testData.selectors.dashboard);
    
    // Verificar se dados aparecem no dashboard
    const dashboardVisible = await navHelper.isElementVisible(testData.selectors.dashboard);
    expect(dashboardVisible).toBe(true);
    
    // Verificar estatísticas
    const statsVisible = await navHelper.isElementVisible('[data-testid="dashboard-stats"]');
    expect(statsVisible).toBe(true);
    
    console.log('✅ Dashboard verificado com sucesso');

    // ========== ETAPA 7: NAVEGAÇÃO ENTRE MÓDULOS ==========
    console.log('🧭 Etapa 7: Testando navegação entre módulos...');
    
    // Navegar para clientes
    await navHelper.clickNavigationLink('Clientes', testData.selectors.clientList);
    expect(await navHelper.isOnPage('clientes')).toBe(true);
    
    // Navegar para questionários
    await navHelper.clickNavigationLink('Questionários', testData.selectors.questionnaireList);
    expect(await navHelper.isOnPage('questionarios')).toBe(true);
    
    // Navegar para planos
    await navHelper.clickNavigationLink('Planos', '[data-testid="meal-plan-list"]');
    expect(await navHelper.isOnPage('planos')).toBe(true);
    
    // Voltar para dashboard
    await navHelper.clickNavigationLink('Dashboard', testData.selectors.dashboard);
    expect(await navHelper.isOnPage('dashboard')).toBe(true);
    
    console.log('✅ Navegação entre módulos funcionando');

    // ========== ETAPA 8: LOGOUT ==========
    console.log('🚪 Etapa 8: Realizando logout...');
    
    await authHelper.logout();
    expect(await authHelper.isLoggedIn()).toBe(false);
    expect(await navHelper.isOnPage('login')).toBe(true);
    
    console.log('✅ Logout realizado com sucesso');

    console.log('🎉 FLUXO E2E COMPLETO EXECUTADO COM SUCESSO!');
    
  }, config.test.timeout * 3); // Timeout maior para fluxo completo
});
