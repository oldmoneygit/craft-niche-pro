/**
 * Testes E2E de Questionários - KorLab Nutri
 * Testa criação, envio e gestão de questionários
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão de Questionários - KorLab Nutri', () => {
  let browser;
  let page;
  let authHelper;
  let formHelper;
  let navHelper;

  beforeAll(async () => {
    console.log('🚀 Iniciando testes de questionários...');
    
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
    console.log('🏁 Finalizando testes de questionários...');
    
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Navegar para página de questionários antes de cada teste
    await navHelper.navigateTo('questionarios', testData.selectors.questionnaireList);
  });

  describe('Criação de Questionário', () => {
    test('deve criar um novo questionário com perguntas', async () => {
      console.log('📝 Teste: Criação de questionário com perguntas');
      
      const questionnaireData = testData.questionnaires.validQuestionnaire;
      
      // Clicar no botão de criar questionário
      await page.click('[data-testid="create-questionnaire-button"]');
      
      // Aguardar página de criação carregar
      await navHelper.waitForElement('[data-testid="questionnaire-builder"]');
      
      // Preencher informações básicas
      await formHelper.fillInput('input[name="title"]', questionnaireData.title);
      await formHelper.fillInput('input[name="category"]', questionnaireData.category);
      await formHelper.fillInput('textarea[name="description"]', questionnaireData.description);
      await formHelper.fillInput('input[name="estimated_time"]', questionnaireData.estimated_time.toString());
      
      // Adicionar primeira pergunta
      await page.click('[data-testid="add-question-button"]');
      
      // Aguardar modal de pergunta abrir
      await navHelper.waitForElement('[data-testid="question-editor"]');
      
      // Preencher pergunta
      await formHelper.fillInput('input[name="question_text"]', questionnaireData.questions[0].question_text);
      await formHelper.selectOption('select[name="question_type"]', questionnaireData.questions[0].question_type);
      
      // Adicionar opções para single_choice
      await formHelper.fillInput('input[name="option_0"]', questionnaireData.questions[0].options[0]);
      await formHelper.fillInput('input[name="option_1"]', questionnaireData.questions[0].options[1]);
      
      // Marcar como obrigatória
      await formHelper.toggleCheckbox('input[name="is_required"]', true);
      
      // Salvar pergunta
      await page.click('[data-testid="save-question-button"]');
      
      // Aguardar modal fechar
      await navHelper.waitForElementToDisappear('[data-testid="question-editor"]');
      
      // Adicionar segunda pergunta (number)
      await page.click('[data-testid="add-question-button"]');
      await navHelper.waitForElement('[data-testid="question-editor"]');
      
      await formHelper.fillInput('input[name="question_text"]', questionnaireData.questions[1].question_text);
      await formHelper.selectOption('select[name="question_type"]', questionnaireData.questions[1].question_type);
      await formHelper.toggleCheckbox('input[name="is_required"]', true);
      
      await page.click('[data-testid="save-question-button"]');
      await navHelper.waitForElementToDisappear('[data-testid="question-editor"]');
      
      // Salvar questionário
      await page.click('[data-testid="save-questionnaire-button"]');
      
      // Aguardar redirecionamento para lista
      await navHelper.waitForNavigation();
      await navHelper.waitForElement(testData.selectors.questionnaireList);
      
      // Verificar se questionário foi criado
      const questionnaireInList = await page.$eval(
        testData.selectors.questionnaireList,
        (list, title) => list.textContent.includes(title),
        questionnaireData.title
      );
      expect(questionnaireInList).toBe(true);
      
      console.log('✅ Criação de questionário com perguntas - PASSOU');
    }, config.test.timeout);

    test('deve validar campos obrigatórios', async () => {
      console.log('📝 Teste: Validação de campos obrigatórios');
      
      // Clicar no botão de criar questionário
      await page.click('[data-testid="create-questionnaire-button"]');
      
      // Aguardar página de criação carregar
      await navHelper.waitForElement('[data-testid="questionnaire-builder"]');
      
      // Tentar salvar sem preencher título
      await page.click('[data-testid="save-questionnaire-button"]');
      
      // Verificar mensagem de erro
      const titleError = await page.$eval(
        'input[name="title"]',
        el => el.validationMessage
      );
      
      expect(titleError).toBeTruthy();
      
      console.log('✅ Validação de campos obrigatórios - PASSOU');
    }, config.test.timeout);
  });

  describe('Listagem de Questionários', () => {
    test('deve exibir lista de questionários', async () => {
      console.log('📋 Teste: Listagem de questionários');
      
      // Verificar se lista está visível
      const listVisible = await navHelper.isElementVisible(testData.selectors.questionnaireList);
      expect(listVisible).toBe(true);
      
      // Verificar se há pelo menos um questionário na lista
      const questionnaireCount = await page.$$eval(
        `${testData.selectors.questionnaireList} .questionnaire-item`,
        items => items.length
      );
      
      expect(questionnaireCount).toBeGreaterThan(0);
      
      console.log('✅ Listagem de questionários - PASSOU');
    }, config.test.timeout);

    test('deve permitir busca de questionários', async () => {
      console.log('🔍 Teste: Busca de questionários');
      
      // Aguardar campo de busca
      await navHelper.waitForElement('input[data-testid="search-input"]');
      
      // Digitar termo de busca
      await formHelper.fillInput('input[data-testid="search-input"]', 'Avaliação');
      
      // Aguardar resultados
      await page.waitForTimeout(1000);
      
      // Verificar se resultados foram filtrados
      const filteredCount = await page.$$eval(
        `${testData.selectors.questionnaireList} .questionnaire-item`,
        items => items.length
      );
      
      expect(filteredCount).toBeGreaterThan(0);
      
      console.log('✅ Busca de questionários - PASSOU');
    }, config.test.timeout);
  });

  describe('Envio de Questionário', () => {
    test('deve enviar questionário para cliente', async () => {
      console.log('📤 Teste: Envio de questionário para cliente');
      
      // Aguardar lista carregar
      await navHelper.waitForElement(`${testData.selectors.questionnaireList} .questionnaire-item`);
      
      // Clicar no botão de enviar do primeiro questionário
      await page.hover(`${testData.selectors.questionnaireList} .questionnaire-item:first-child`);
      await page.click(`${testData.selectors.questionnaireList} .questionnaire-item:first-child [data-testid="send-button"]`);
      
      // Aguardar modal de envio abrir
      await navHelper.waitForElement('[data-testid="send-questionnaire-modal"]');
      
      // Selecionar cliente (assumindo que existe pelo menos um)
      await navHelper.waitForElement('select[name="client_id"]');
      await formHelper.selectOption('select[name="client_id"]', '1'); // Primeiro cliente
      
      // Adicionar mensagem personalizada
      await formHelper.fillInput('textarea[name="custom_message"]', 'Olá! Por favor, responda ao questionário.');
      
      // Enviar questionário
      await page.click('[data-testid="send-questionnaire-button"]');
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Questionário enviado com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible('[data-testid="send-questionnaire-modal"]');
      expect(modalVisible).toBe(false);
      
      console.log('✅ Envio de questionário para cliente - PASSOU');
    }, config.test.timeout);
  });

  describe('Edição de Questionário', () => {
    test('deve editar questionário existente', async () => {
      console.log('✏️ Teste: Edição de questionário');
      
      // Aguardar lista carregar
      await navHelper.waitForElement(`${testData.selectors.questionnaireList} .questionnaire-item`);
      
      // Clicar no botão de editar do primeiro questionário
      await page.hover(`${testData.selectors.questionnaireList} .questionnaire-item:first-child`);
      await page.click(`${testData.selectors.questionnaireList} .questionnaire-item:first-child [data-testid="edit-button"]`);
      
      // Aguardar página de edição carregar
      await navHelper.waitForElement('[data-testid="questionnaire-builder"]');
      
      // Alterar título
      await formHelper.fillInput('input[name="title"]', 'Questionário Editado');
      
      // Salvar alterações
      await page.click('[data-testid="save-questionnaire-button"]');
      
      // Aguardar redirecionamento
      await navHelper.waitForNavigation();
      await navHelper.waitForElement(testData.selectors.questionnaireList);
      
      // Verificar se alteração foi salva
      const updatedTitle = await page.$eval(
        testData.selectors.questionnaireList,
        (list, title) => list.textContent.includes(title),
        'Questionário Editado'
      );
      expect(updatedTitle).toBe(true);
      
      console.log('✅ Edição de questionário - PASSOU');
    }, config.test.timeout);
  });

  describe('Exclusão de Questionário', () => {
    test('deve excluir questionário existente', async () => {
      console.log('🗑️ Teste: Exclusão de questionário');
      
      // Aguardar lista carregar
      await navHelper.waitForElement(`${testData.selectors.questionnaireList} .questionnaire-item`);
      
      // Contar questionários antes da exclusão
      const initialCount = await page.$$eval(
        `${testData.selectors.questionnaireList} .questionnaire-item`,
        items => items.length
      );
      
      // Clicar no botão de excluir do primeiro questionário
      await page.hover(`${testData.selectors.questionnaireList} .questionnaire-item:first-child`);
      await page.click(`${testData.selectors.questionnaireList} .questionnaire-item:first-child [data-testid="delete-button"]`);
      
      // Aguardar modal de confirmação
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Confirmar exclusão
      await page.click(testData.selectors.confirmButton);
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Questionário excluído com sucesso');
      
      // Verificar se número de questionários diminuiu
      await page.waitForTimeout(1000);
      const finalCount = await page.$$eval(
        `${testData.selectors.questionnaireList} .questionnaire-item`,
        items => items.length
      );
      
      expect(finalCount).toBe(initialCount - 1);
      
      console.log('✅ Exclusão de questionário - PASSOU');
    }, config.test.timeout);
  });
});
