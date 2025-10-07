/**
 * Testes E2E de Gestão de Clientes - KorLab Nutri
 * Testa CRUD completo de clientes
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão de Clientes - KorLab Nutri', () => {
  let browser;
  let page;
  let authHelper;
  let formHelper;
  let navHelper;

  beforeAll(async () => {
    console.log('🚀 Iniciando testes de gestão de clientes...');
    
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
    console.log('🏁 Finalizando testes de gestão de clientes...');
    
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Navegar para página de clientes antes de cada teste
    await navHelper.navigateTo('clientes', testData.selectors.clientList);
  });

  describe('Criação de Cliente', () => {
    test('deve criar um novo cliente com dados válidos', async () => {
      console.log('👤 Teste: Criação de cliente com dados válidos');
      
      const clientData = testData.clients.validClient;
      
      // Clicar no botão de adicionar cliente
      await page.click(testData.selectors.addClientButton);
      
      // Aguardar modal abrir
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Preencher formulário
      await formHelper.fillInput('input[name="name"]', clientData.name);
      await formHelper.fillInput('input[name="email"]', clientData.email);
      await formHelper.fillInput('input[name="phone"]', clientData.phone);
      await formHelper.fillInput('input[name="birth_date"]', clientData.birth_date);
      await formHelper.fillInput('input[name="height_cm"]', clientData.height_cm.toString());
      await formHelper.fillInput('input[name="weight_kg"]', clientData.weight_kg.toString());
      await formHelper.fillInput('textarea[name="goal"]', clientData.goal);
      await formHelper.fillInput('textarea[name="notes"]', clientData.notes);
      
      // Submeter formulário
      await formHelper.submitForm(testData.selectors.clientForm);
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Cliente criado com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible(testData.selectors.modal);
      expect(modalVisible).toBe(false);
      
      // Verificar se cliente aparece na lista
      const clientInList = await page.$eval(
        testData.selectors.clientList,
        (list, name) => list.textContent.includes(name),
        clientData.name
      );
      expect(clientInList).toBe(true);
      
      console.log('✅ Criação de cliente com dados válidos - PASSOU');
    }, config.test.timeout);

    test('deve validar campos obrigatórios', async () => {
      console.log('👤 Teste: Validação de campos obrigatórios');
      
      // Clicar no botão de adicionar cliente
      await page.click(testData.selectors.addClientButton);
      
      // Aguardar modal abrir
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Tentar submeter formulário vazio
      await formHelper.submitForm(testData.selectors.clientForm);
      
      // Verificar mensagens de erro
      const nameError = await page.$eval(
        'input[name="name"]',
        el => el.validationMessage
      );
      
      expect(nameError).toBeTruthy();
      
      console.log('✅ Validação de campos obrigatórios - PASSOU');
    }, config.test.timeout);

    test('deve criar cliente com dados mínimos', async () => {
      console.log('👤 Teste: Criação de cliente com dados mínimos');
      
      const clientData = testData.clients.minimalClient;
      
      // Clicar no botão de adicionar cliente
      await page.click(testData.selectors.addClientButton);
      
      // Aguardar modal abrir
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Preencher apenas campos obrigatórios
      await formHelper.fillInput('input[name="name"]', clientData.name);
      await formHelper.fillInput('input[name="email"]', clientData.email);
      await formHelper.fillInput('input[name="phone"]', clientData.phone);
      
      // Submeter formulário
      await formHelper.submitForm(testData.selectors.clientForm);
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Cliente criado com sucesso');
      
      console.log('✅ Criação de cliente com dados mínimos - PASSOU');
    }, config.test.timeout);
  });

  describe('Listagem de Clientes', () => {
    test('deve exibir lista de clientes', async () => {
      console.log('📋 Teste: Listagem de clientes');
      
      // Verificar se lista está visível
      const listVisible = await navHelper.isElementVisible(testData.selectors.clientList);
      expect(listVisible).toBe(true);
      
      // Verificar se há pelo menos um cliente na lista
      const clientCount = await page.$$eval(
        `${testData.selectors.clientList} .client-item`,
        items => items.length
      );
      
      expect(clientCount).toBeGreaterThan(0);
      
      console.log('✅ Listagem de clientes - PASSOU');
    }, config.test.timeout);

    test('deve permitir busca de clientes', async () => {
      console.log('🔍 Teste: Busca de clientes');
      
      // Aguardar campo de busca
      await navHelper.waitForElement('input[data-testid="search-input"]');
      
      // Digitar termo de busca
      await formHelper.fillInput('input[data-testid="search-input"]', 'João');
      
      // Aguardar resultados
      await page.waitForTimeout(1000);
      
      // Verificar se resultados foram filtrados
      const filteredCount = await page.$$eval(
        `${testData.selectors.clientList} .client-item`,
        items => items.length
      );
      
      expect(filteredCount).toBeGreaterThan(0);
      
      console.log('✅ Busca de clientes - PASSOU');
    }, config.test.timeout);
  });

  describe('Edição de Cliente', () => {
    test('deve editar dados de um cliente existente', async () => {
      console.log('✏️ Teste: Edição de cliente');
      
      // Aguardar lista carregar
      await navHelper.waitForElement(`${testData.selectors.clientList} .client-item`);
      
      // Clicar no primeiro cliente
      await page.click(`${testData.selectors.clientList} .client-item:first-child`);
      
      // Aguardar modal de edição abrir
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Limpar e preencher novo valor
      await formHelper.fillInput('input[name="name"]', 'João Silva Atualizado');
      
      // Submeter formulário
      await formHelper.submitForm(testData.selectors.clientForm);
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Cliente atualizado com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible(testData.selectors.modal);
      expect(modalVisible).toBe(false);
      
      console.log('✅ Edição de cliente - PASSOU');
    }, config.test.timeout);
  });

  describe('Exclusão de Cliente', () => {
    test('deve excluir um cliente existente', async () => {
      console.log('🗑️ Teste: Exclusão de cliente');
      
      // Aguardar lista carregar
      await navHelper.waitForElement(`${testData.selectors.clientList} .client-item`);
      
      // Contar clientes antes da exclusão
      const initialCount = await page.$$eval(
        `${testData.selectors.clientList} .client-item`,
        items => items.length
      );
      
      // Clicar no botão de excluir do primeiro cliente
      await page.hover(`${testData.selectors.clientList} .client-item:first-child`);
      await page.click(`${testData.selectors.clientList} .client-item:first-child [data-testid="delete-button"]`);
      
      // Aguardar modal de confirmação
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Confirmar exclusão
      await page.click(testData.selectors.confirmButton);
      
      // Aguardar mensagem de sucesso
      await formHelper.waitForSuccessMessage('Cliente excluído com sucesso');
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible(testData.selectors.modal);
      expect(modalVisible).toBe(false);
      
      // Verificar se número de clientes diminuiu
      await page.waitForTimeout(1000);
      const finalCount = await page.$$eval(
        `${testData.selectors.clientList} .client-item`,
        items => items.length
      );
      
      expect(finalCount).toBe(initialCount - 1);
      
      console.log('✅ Exclusão de cliente - PASSOU');
    }, config.test.timeout);

    test('deve cancelar exclusão ao clicar em cancelar', async () => {
      console.log('❌ Teste: Cancelar exclusão de cliente');
      
      // Aguardar lista carregar
      await navHelper.waitForElement(`${testData.selectors.clientList} .client-item`);
      
      // Contar clientes antes
      const initialCount = await page.$$eval(
        `${testData.selectors.clientList} .client-item`,
        items => items.length
      );
      
      // Clicar no botão de excluir
      await page.hover(`${testData.selectors.clientList} .client-item:first-child`);
      await page.click(`${testData.selectors.clientList} .client-item:first-child [data-testid="delete-button"]`);
      
      // Aguardar modal de confirmação
      await navHelper.waitForElement(testData.selectors.modal);
      
      // Cancelar exclusão
      await page.click(testData.selectors.cancelButton);
      
      // Verificar se modal foi fechado
      const modalVisible = await navHelper.isElementVisible(testData.selectors.modal);
      expect(modalVisible).toBe(false);
      
      // Verificar se número de clientes não mudou
      const finalCount = await page.$$eval(
        `${testData.selectors.clientList} .client-item`,
        items => items.length
      );
      
      expect(finalCount).toBe(initialCount);
      
      console.log('✅ Cancelar exclusão de cliente - PASSOU');
    }, config.test.timeout);
  });
});
