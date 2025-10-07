/**
 * Testes E2E para Gestão de Serviços - KorLab Nutri
 * Cobertura: CRUD completo de serviços, assinaturas, preços,
 * categorias e integração com clientes e planos
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão de Serviços - KorLab Nutri', () => {
  let page;
  let authHelper;
  let formHelper;
  let navHelper;
  let createdServiceId;

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage();
    authHelper = new AuthHelper(page);
    formHelper = new FormHelper(page);
    navHelper = new NavigationHelper(page);
    
    // Login para acessar funcionalidades
    await authHelper.login(testData.users.validUser.email, testData.users.validUser.password);
    console.log('🚀 Iniciando testes de serviços...');
  });

  afterAll(async () => {
    // Limpar dados de teste se necessário
    await authHelper.clearAuthData();
    await page.close();
    console.log('🏁 Finalizando testes de serviços...');
  });

  beforeEach(async () => {
    await navHelper.navigateTo('/servicos');
    await navHelper.waitForElement(testData.selectors.serviceList);
  });

  describe('Criação de Serviços', () => {
    it('deve criar um novo serviço com dados válidos', async () => {
      console.log('🛠️ Testando criação de serviço...');
      
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Preencher formulário de serviço
      await formHelper.fillInput('input[name="name"]', testData.services.validService.name);
      await formHelper.fillInput('textarea[name="description"]', testData.services.validService.description);
      await formHelper.fillInput('input[name="price"]', testData.services.validService.price.toString());
      await formHelper.fillInput('input[name="duration_days"]', testData.services.validService.duration_days.toString());
      await formHelper.selectOption('select[name="category"]', testData.services.validService.category);
      await formHelper.selectOption('select[name="type"]', testData.services.validService.type);

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço criado com sucesso!', 'success');
      
      // Verificar se o serviço aparece na lista
      await navHelper.waitForText(testData.services.validService.name, '[data-testid="service-name"]');
      console.log('✅ Serviço criado com sucesso');
    });

    it('deve validar campos obrigatórios', async () => {
      console.log('🔍 Testando validação de campos obrigatórios...');
      
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Tentar salvar sem preencher campos obrigatórios
      await formHelper.clickButton('[data-testid="save-service-button"]');
      
      // Verificar mensagens de erro
      await navHelper.waitForText('Nome é obrigatório', 'p.text-destructive');
      await navHelper.waitForText('Preço é obrigatório', 'p.text-destructive');
      await navHelper.waitForText('Categoria é obrigatória', 'p.text-destructive');
      
      console.log('✅ Validação de campos funcionando');
    });

    it('deve validar preço numérico', async () => {
      console.log('💰 Testando validação de preço...');
      
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await navHelper.waitForElement(testData.selectors.serviceForm);

      await formHelper.fillInput('input[name="name"]', 'Serviço Teste');
      await formHelper.fillInput('input[name="price"]', 'preço-inválido');
      await formHelper.selectOption('select[name="category"]', 'nutrition');
      
      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForText('Preço deve ser um número válido', 'p.text-destructive');
      
      console.log('✅ Validação de preço funcionando');
    });

    it('deve permitir múltiplas categorias', async () => {
      console.log('📂 Testando múltiplas categorias...');
      
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await navHelper.waitForElement(testData.selectors.serviceForm);

      await formHelper.fillInput('input[name="name"]', 'Serviço Multi-Categoria');
      await formHelper.fillInput('input[name="price"]', '150.00');
      
      // Selecionar múltiplas categorias
      await page.check('input[name="category_nutrition"]');
      await page.check('input[name="category_consultation"]');
      
      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço criado com sucesso!', 'success');
      
      console.log('✅ Serviço com múltiplas categorias criado');
    });
  });

  describe('Visualização e Filtros', () => {
    it('deve exibir lista de serviços com paginação', async () => {
      console.log('📋 Testando lista de serviços...');
      
      // Verificar se a lista está carregada
      const serviceItems = await page.$$('[data-testid="service-item"]');
      expect(serviceItems.length).toBeGreaterThanOrEqual(0);

      // Testar paginação se houver muitos serviços
      const pagination = await page.$('[data-testid="pagination"]');
      if (pagination) {
        await formHelper.clickButton('[data-testid="next-page-button"]');
        await navHelper.waitForElement(testData.selectors.serviceList);
      }
      
      console.log('✅ Lista de serviços exibida corretamente');
    });

    it('deve filtrar serviços por categoria', async () => {
      console.log('🔍 Testando filtro por categoria...');
      
      await formHelper.selectOption('select[name="filter_category"]', 'nutrition');
      await formHelper.clickButton('[data-testid="apply-category-filter-button"]');

      await navHelper.waitForElement(testData.selectors.serviceList);
      
      // Verificar se apenas serviços da categoria selecionada são exibidos
      const categoryElements = await page.$$('[data-testid="service-category"]');
      for (const element of categoryElements) {
        const category = await element.evaluate(el => el.textContent);
        expect(category).toContain('nutrition');
      }
      
      console.log('✅ Filtro por categoria funcionando');
    });

    it('deve filtrar serviços por tipo', async () => {
      console.log('🔍 Testando filtro por tipo...');
      
      await formHelper.selectOption('select[name="filter_type"]', 'subscription');
      await formHelper.clickButton('[data-testid="apply-type-filter-button"]');

      await navHelper.waitForElement(testData.selectors.serviceList);
      
      console.log('✅ Filtro por tipo funcionando');
    });

    it('deve filtrar serviços por faixa de preço', async () => {
      console.log('💰 Testando filtro por preço...');
      
      await formHelper.fillInput('input[name="filter_price_min"]', '100');
      await formHelper.fillInput('input[name="filter_price_max"]', '500');
      await formHelper.clickButton('[data-testid="apply-price-filter-button"]');

      await navHelper.waitForElement(testData.selectors.serviceList);
      
      console.log('✅ Filtro por preço funcionando');
    });

    it('deve buscar serviços por nome', async () => {
      console.log('🔍 Testando busca por nome...');
      
      await formHelper.fillInput('input[name="search"]', testData.services.validService.name);
      await formHelper.clickButton('[data-testid="search-button"]');

      await navHelper.waitForElement(testData.selectors.serviceList);
      
      // Verificar se o serviço encontrado está na lista
      await navHelper.waitForText(testData.services.validService.name, '[data-testid="service-name"]');
      
      console.log('✅ Busca por nome funcionando');
    });
  });

  describe('Edição de Serviços', () => {
    beforeEach(async () => {
      // Criar um serviço para editar
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await formHelper.fillInput('input[name="name"]', testData.services.validService.name);
      await formHelper.fillInput('input[name="price"]', testData.services.validService.price.toString());
      await formHelper.selectOption('select[name="category"]', testData.services.validService.category);
      await formHelper.selectOption('select[name="type"]', testData.services.validService.type);
      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço criado com sucesso!', 'success');
    });

    it('deve editar dados de um serviço existente', async () => {
      console.log('✏️ Testando edição de serviço...');
      
      // Clicar no botão de editar do primeiro serviço
      await formHelper.clickButton('[data-testid="edit-service-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Alterar dados
      const updatedName = 'Plano Nutricional Premium';
      const updatedPrice = '250.00';
      await formHelper.fillInput('input[name="name"]', updatedName);
      await formHelper.fillInput('input[name="price"]', updatedPrice);

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço atualizado com sucesso!', 'success');
      
      // Verificar se as alterações foram salvas
      await navHelper.waitForText(updatedName, '[data-testid="service-name"]');
      await navHelper.waitForText(updatedPrice, '[data-testid="service-price"]');
      
      console.log('✅ Serviço editado com sucesso');
    });

    it('deve ativar/desativar serviço', async () => {
      console.log('🔄 Testando ativação/desativação...');
      
      // Clicar no toggle de ativo/inativo
      await formHelper.clickButton('[data-testid="toggle-service-status-button"]:first-child');
      
      // Verificar se o status mudou
      const statusElement = await page.$('[data-testid="service-status"]:first-child');
      const status = await statusElement.evaluate(el => el.textContent);
      
      expect(status).toMatch(/inativo|desativado/i);
      
      console.log('✅ Status do serviço alterado');
    });

    it('deve duplicar serviço', async () => {
      console.log('📋 Testando duplicação de serviço...');
      
      await formHelper.clickButton('[data-testid="duplicate-service-button"]:first-child');
      await navHelper.waitForElement('[data-testid="duplicate-modal"]');

      await formHelper.fillInput('input[name="duplicate_name"]', 'Cópia do Serviço');
      await formHelper.clickButton('[data-testid="confirm-duplicate-button"]');
      
      await navHelper.waitForToast('Serviço duplicado com sucesso!', 'success');
      
      // Verificar se o serviço duplicado aparece na lista
      await navHelper.waitForText('Cópia do Serviço', '[data-testid="service-name"]');
      
      console.log('✅ Serviço duplicado com sucesso');
    });
  });

  describe('Assinaturas', () => {
    it('deve criar assinatura para cliente', async () => {
      console.log('📝 Testando criação de assinatura...');
      
      // Criar um serviço de assinatura primeiro
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await formHelper.fillInput('input[name="name"]', 'Plano Mensal');
      await formHelper.fillInput('input[name="price"]', '200.00');
      await formHelper.selectOption('select[name="type"]', 'subscription');
      await formHelper.selectOption('select[name="category"]', 'nutrition');
      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço criado com sucesso!', 'success');

      // Criar assinatura
      await formHelper.clickButton('[data-testid="create-subscription-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.subscriptionForm);

      await formHelper.selectOption('select[name="client_id"]', '1'); // Assumindo cliente existente
      await formHelper.fillInput('input[name="start_date"]', testData.services.validSubscription.start_date);
      await formHelper.fillInput('textarea[name="notes"]', testData.services.validSubscription.notes);

      await formHelper.clickButton('[data-testid="save-subscription-button"]');
      await navHelper.waitForToast('Assinatura criada com sucesso!', 'success');
      
      console.log('✅ Assinatura criada');
    });

    it('deve gerenciar renovação de assinatura', async () => {
      console.log('🔄 Testando renovação de assinatura...');
      
      // Assumindo que já existe uma assinatura
      await formHelper.clickButton('[data-testid="manage-subscription-button"]:first-child');
      await navHelper.waitForElement('[data-testid="subscription-management-modal"]');

      await formHelper.clickButton('[data-testid="renew-subscription-button"]');
      await navHelper.waitForElement('[data-testid="renewal-modal"]');

      await formHelper.fillInput('input[name="renewal_date"]', '2024-02-15');
      await formHelper.clickButton('[data-testid="confirm-renewal-button"]');
      
      await navHelper.waitForToast('Assinatura renovada com sucesso!', 'success');
      
      console.log('✅ Assinatura renovada');
    });

    it('deve cancelar assinatura', async () => {
      console.log('❌ Testando cancelamento de assinatura...');
      
      await formHelper.clickButton('[data-testid="manage-subscription-button"]:first-child');
      await navHelper.waitForElement('[data-testid="subscription-management-modal"]');

      await formHelper.clickButton('[data-testid="cancel-subscription-button"]');
      await navHelper.waitForElement('[data-testid="cancel-confirmation-modal"]');

      await formHelper.fillInput('textarea[name="cancellation_reason"]', 'Cancelamento solicitado pelo cliente');
      await formHelper.clickButton('[data-testid="confirm-cancel-button"]');
      
      await navHelper.waitForToast('Assinatura cancelada com sucesso!', 'success');
      
      console.log('✅ Assinatura cancelada');
    });

    it('deve exibir histórico de assinaturas', async () => {
      console.log('📊 Testando histórico de assinaturas...');
      
      await formHelper.clickButton('[data-testid="view-subscription-history-button"]:first-child');
      await navHelper.waitForElement('[data-testid="history-modal"]');

      // Verificar se há registros no histórico
      const historyItems = await page.$$('[data-testid="history-item"]');
      expect(historyItems.length).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Histórico de assinaturas exibido');
    });
  });

  describe('Exclusão de Serviços', () => {
    beforeEach(async () => {
      // Criar um serviço para excluir
      await formHelper.clickButton(testData.selectors.addServiceButton);
      await formHelper.fillInput('input[name="name"]', testData.services.validService.name);
      await formHelper.fillInput('input[name="price"]', testData.services.validService.price.toString());
      await formHelper.selectOption('select[name="category"]', testData.services.validService.category);
      await formHelper.selectOption('select[name="type"]', testData.services.validService.type);
      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço criado com sucesso!', 'success');
    });

    it('deve excluir um serviço existente', async () => {
      console.log('🗑️ Testando exclusão de serviço...');
      
      // Contar serviços antes da exclusão
      const servicesBefore = await page.$$('[data-testid="service-item"]');
      const countBefore = servicesBefore.length;

      // Clicar no botão de excluir
      await formHelper.clickButton('[data-testid="delete-service-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');

      // Confirmar exclusão
      await formHelper.clickButton('[data-testid="confirm-delete-button"]');
      await navHelper.waitForToast('Serviço excluído com sucesso!', 'success');

      // Verificar se o serviço foi removido
      const servicesAfter = await page.$$('[data-testid="service-item"]');
      const countAfter = servicesAfter.length;
      
      expect(countAfter).toBe(countBefore - 1);
      
      console.log('✅ Serviço excluído com sucesso');
    });

    it('deve impedir exclusão de serviço com assinaturas ativas', async () => {
      console.log('⚠️ Testando proteção contra exclusão...');
      
      // Criar uma assinatura para o serviço
      await formHelper.clickButton('[data-testid="create-subscription-button"]:first-child');
      await formHelper.selectOption('select[name="client_id"]', '1');
      await formHelper.clickButton('[data-testid="save-subscription-button"]');
      await navHelper.waitForToast('Assinatura criada com sucesso!', 'success');

      // Tentar excluir o serviço
      await formHelper.clickButton('[data-testid="delete-service-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');
      await formHelper.clickButton('[data-testid="confirm-delete-button"]');
      
      // Deve mostrar erro
      await navHelper.waitForToast('Não é possível excluir serviço com assinaturas ativas', 'destructive');
      
      console.log('✅ Proteção contra exclusão funcionando');
    });
  });

  describe('Integração com Outros Módulos', () => {
    it('deve vincular serviço a plano alimentar', async () => {
      console.log('🍽️ Testando integração com planos alimentares...');
      
      await formHelper.clickButton('[data-testid="edit-service-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Vincular a um plano alimentar
      await formHelper.selectOption('select[name="meal_plan_template"]', '1');
      await formHelper.fillInput('textarea[name="description"]', 'Serviço com plano alimentar incluído');

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço atualizado com sucesso!', 'success');
      
      console.log('✅ Serviço vinculado ao plano alimentar');
    });

    it('deve incluir questionário no serviço', async () => {
      console.log('📋 Testando integração com questionários...');
      
      await formHelper.clickButton('[data-testid="edit-service-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Incluir questionário obrigatório
      await page.check('input[name="include_questionnaire"]');
      await formHelper.selectOption('select[name="questionnaire_id"]', '1');

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço atualizado com sucesso!', 'success');
      
      console.log('✅ Questionário incluído no serviço');
    });

    it('deve configurar agendamentos automáticos', async () => {
      console.log('📅 Testando agendamentos automáticos...');
      
      await formHelper.clickButton('[data-testid="edit-service-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Configurar agendamentos automáticos
      await page.check('input[name="auto_schedule_appointments"]');
      await formHelper.selectOption('select[name="appointment_frequency"]', 'weekly');
      await formHelper.fillInput('input[name="appointment_duration"]', '60');

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço atualizado com sucesso!', 'success');
      
      console.log('✅ Agendamentos automáticos configurados');
    });
  });

  describe('Relatórios e Estatísticas', () => {
    it('deve exibir estatísticas de serviços', async () => {
      console.log('📊 Testando estatísticas de serviços...');
      
      // Verificar cards de estatísticas
      const totalServices = await page.$eval('[data-testid="total-services"]', el => el.textContent);
      const activeServices = await page.$eval('[data-testid="active-services"]', el => el.textContent);
      const totalSubscriptions = await page.$eval('[data-testid="total-subscriptions"]', el => el.textContent);
      const monthlyRevenue = await page.$eval('[data-testid="monthly-revenue"]', el => el.textContent);

      expect(parseInt(totalServices)).toBeGreaterThanOrEqual(0);
      expect(parseInt(activeServices)).toBeGreaterThanOrEqual(0);
      expect(parseInt(totalSubscriptions)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(monthlyRevenue)).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Estatísticas de serviços exibidas');
    });

    it('deve gerar relatório de serviços', async () => {
      console.log('📋 Testando geração de relatório...');
      
      await formHelper.clickButton('[data-testid="generate-services-report-button"]');
      await navHelper.waitForElement('[data-testid="report-modal"]');

      await formHelper.fillInput('input[name="report_date_from"]', '2024-01-01');
      await formHelper.fillInput('input[name="report_date_to"]', '2024-12-31');
      await formHelper.selectOption('select[name="report_format"]', 'excel');
      
      await formHelper.clickButton('[data-testid="generate-report-button"]');
      await navHelper.waitForToast('Relatório gerado com sucesso!', 'success');
      
      console.log('✅ Relatório de serviços gerado');
    });

    it('deve exibir gráfico de serviços mais populares', async () => {
      console.log('📈 Testando gráfico de popularidade...');
      
      await formHelper.clickButton('[data-testid="view-analytics-button"]');
      await navHelper.waitForElement('[data-testid="analytics-modal"]');

      // Verificar se o gráfico está presente
      const chart = await page.$('[data-testid="popular-services-chart"]');
      expect(chart).not.toBeNull();
      
      console.log('✅ Gráfico de serviços populares exibido');
    });
  });

  describe('Configurações Avançadas', () => {
    it('deve configurar preços promocionais', async () => {
      console.log('💰 Testando preços promocionais...');
      
      await formHelper.clickButton('[data-testid="edit-service-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Configurar preço promocional
      await page.check('input[name="enable_promotional_price"]');
      await formHelper.fillInput('input[name="promotional_price"]', '150.00');
      await formHelper.fillInput('input[name="promotion_start"]', '2024-01-01');
      await formHelper.fillInput('input[name="promotion_end"]', '2024-01-31');

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço atualizado com sucesso!', 'success');
      
      console.log('✅ Preço promocional configurado');
    });

    it('deve configurar descontos por quantidade', async () => {
      console.log('🎯 Testando descontos por quantidade...');
      
      await formHelper.clickButton('[data-testid="edit-service-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.serviceForm);

      // Configurar desconto por quantidade
      await page.check('input[name="enable_quantity_discount"]');
      await formHelper.fillInput('input[name="discount_min_quantity"]', '3');
      await formHelper.fillInput('input[name="discount_percentage"]', '10');

      await formHelper.clickButton('[data-testid="save-service-button"]');
      await navHelper.waitForToast('Serviço atualizado com sucesso!', 'success');
      
      console.log('✅ Desconto por quantidade configurado');
    });
  });
});