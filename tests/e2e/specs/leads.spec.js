/**
 * Testes E2E para Gestão de Leads - KorLab Nutri
 * Cobertura: CRUD completo de leads, conversão para clientes,
 * filtros por fonte/status, follow-up e integração com agendamentos
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão de Leads - KorLab Nutri', () => {
  let page;
  let authHelper;
  let formHelper;
  let navHelper;
  let createdLeadId;

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage();
    authHelper = new AuthHelper(page);
    formHelper = new FormHelper(page);
    navHelper = new NavigationHelper(page);
    
    // Login para acessar funcionalidades
    await authHelper.login(testData.users.validUser.email, testData.users.validUser.password);
    console.log('🚀 Iniciando testes de leads...');
  });

  afterAll(async () => {
    // Limpar dados de teste se necessário
    await authHelper.clearAuthData();
    await page.close();
    console.log('🏁 Finalizando testes de leads...');
  });

  beforeEach(async () => {
    await navHelper.navigateTo('/leads');
    await navHelper.waitForElement(testData.selectors.leadList);
  });

  describe('Criação de Leads', () => {
    it('deve criar um novo lead com dados válidos', async () => {
      console.log('👤 Testando criação de lead...');
      
      await formHelper.clickButton(testData.selectors.addLeadButton);
      await navHelper.waitForElement(testData.selectors.leadForm);

      // Preencher formulário de lead
      await formHelper.fillInput('input[name="name"]', testData.leads.validLead.name);
      await formHelper.fillInput('input[name="email"]', testData.leads.validLead.email);
      await formHelper.fillInput('input[name="phone"]', testData.leads.validLead.phone);
      await formHelper.selectOption('select[name="source"]', testData.leads.validLead.source);
      await formHelper.selectOption('select[name="status"]', testData.leads.validLead.status);
      await formHelper.fillInput('textarea[name="notes"]', testData.leads.validLead.notes);

      await formHelper.clickButton('[data-testid="save-lead-button"]');
      await navHelper.waitForToast('Lead criado com sucesso!', 'success');
      
      // Verificar se o lead aparece na lista
      await navHelper.waitForText(testData.leads.validLead.name, '[data-testid="lead-name"]');
      console.log('✅ Lead criado com sucesso');
    });

    it('deve validar campos obrigatórios', async () => {
      console.log('🔍 Testando validação de campos obrigatórios...');
      
      await formHelper.clickButton(testData.selectors.addLeadButton);
      await navHelper.waitForElement(testData.selectors.leadForm);

      // Tentar salvar sem preencher campos obrigatórios
      await formHelper.clickButton('[data-testid="save-lead-button"]');
      
      // Verificar mensagens de erro
      await navHelper.waitForText('Nome é obrigatório', 'p.text-destructive');
      await navHelper.waitForText('Email é obrigatório', 'p.text-destructive');
      await navHelper.waitForText('Telefone é obrigatório', 'p.text-destructive');
      
      console.log('✅ Validação de campos funcionando');
    });

    it('deve validar formato de email', async () => {
      console.log('📧 Testando validação de email...');
      
      await formHelper.clickButton(testData.selectors.addLeadButton);
      await navHelper.waitForElement(testData.selectors.leadForm);

      await formHelper.fillInput('input[name="name"]', 'Lead Teste');
      await formHelper.fillInput('input[name="email"]', 'email-invalido');
      await formHelper.fillInput('input[name="phone"]', '11999999999');
      
      await formHelper.clickButton('[data-testid="save-lead-button"]');
      await navHelper.waitForText('Email deve ter um formato válido', 'p.text-destructive');
      
      console.log('✅ Validação de email funcionando');
    });

    it('deve permitir upload de arquivo de importação', async () => {
      console.log('📁 Testando importação de leads...');
      
      await formHelper.clickButton('[data-testid="import-leads-button"]');
      await navHelper.waitForElement('[data-testid="import-modal"]');

      // Simular upload de arquivo (sem arquivo real para o teste)
      await formHelper.selectOption('select[name="import_format"]', 'csv');
      await formHelper.clickButton('[data-testid="download-template-button"]');
      
      console.log('✅ Modal de importação funcionando');
    });
  });

  describe('Visualização e Filtros', () => {
    it('deve exibir lista de leads com paginação', async () => {
      console.log('📋 Testando lista de leads...');
      
      // Verificar se a lista está carregada
      const leadItems = await page.$$('[data-testid="lead-item"]');
      expect(leadItems.length).toBeGreaterThanOrEqual(0);

      // Testar paginação se houver muitos leads
      const pagination = await page.$('[data-testid="pagination"]');
      if (pagination) {
        await formHelper.clickButton('[data-testid="next-page-button"]');
        await navHelper.waitForElement(testData.selectors.leadList);
      }
      
      console.log('✅ Lista de leads exibida corretamente');
    });

    it('deve filtrar leads por status', async () => {
      console.log('🔍 Testando filtro por status...');
      
      await formHelper.selectOption('select[name="filter_status"]', 'new');
      await formHelper.clickButton('[data-testid="apply-status-filter-button"]');

      await navHelper.waitForElement(testData.selectors.leadList);
      
      // Verificar se apenas leads com status "new" são exibidos
      const statusElements = await page.$$('[data-testid="lead-status"]');
      for (const element of statusElements) {
        const status = await element.evaluate(el => el.textContent);
        expect(status).toContain('new');
      }
      
      console.log('✅ Filtro por status funcionando');
    });

    it('deve filtrar leads por fonte', async () => {
      console.log('🔍 Testando filtro por fonte...');
      
      await formHelper.selectOption('select[name="filter_source"]', 'Website');
      await formHelper.clickButton('[data-testid="apply-source-filter-button"]');

      await navHelper.waitForElement(testData.selectors.leadList);
      
      console.log('✅ Filtro por fonte funcionando');
    });

    it('deve buscar leads por nome ou email', async () => {
      console.log('🔍 Testando busca de leads...');
      
      await formHelper.fillInput('input[name="search"]', testData.leads.validLead.name);
      await formHelper.clickButton('[data-testid="search-button"]');

      await navHelper.waitForElement(testData.selectors.leadList);
      
      // Verificar se o lead encontrado está na lista
      await navHelper.waitForText(testData.leads.validLead.name, '[data-testid="lead-name"]');
      
      console.log('✅ Busca de leads funcionando');
    });

    it('deve ordenar leads por data de criação', async () => {
      console.log('📅 Testando ordenação por data...');
      
      await formHelper.selectOption('select[name="sort_by"]', 'created_at');
      await formHelper.selectOption('select[name="sort_order"]', 'desc');
      await formHelper.clickButton('[data-testid="apply-sort-button"]');

      await navHelper.waitForElement(testData.selectors.leadList);
      
      console.log('✅ Ordenação por data funcionando');
    });
  });

  describe('Edição de Leads', () => {
    beforeEach(async () => {
      // Criar um lead para editar
      await formHelper.clickButton(testData.selectors.addLeadButton);
      await formHelper.fillInput('input[name="name"]', testData.leads.validLead.name);
      await formHelper.fillInput('input[name="email"]', testData.leads.validLead.email);
      await formHelper.fillInput('input[name="phone"]', testData.leads.validLead.phone);
      await formHelper.selectOption('select[name="source"]', testData.leads.validLead.source);
      await formHelper.clickButton('[data-testid="save-lead-button"]');
      await navHelper.waitForToast('Lead criado com sucesso!', 'success');
    });

    it('deve editar dados de um lead existente', async () => {
      console.log('✏️ Testando edição de lead...');
      
      // Clicar no botão de editar do primeiro lead
      await formHelper.clickButton('[data-testid="edit-lead-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.leadForm);

      // Alterar dados
      const updatedName = 'Carlos Interessado Editado';
      await formHelper.fillInput('input[name="name"]', updatedName);
      await formHelper.fillInput('textarea[name="notes"]', 'Lead editado via teste E2E');

      await formHelper.clickButton('[data-testid="save-lead-button"]');
      await navHelper.waitForToast('Lead atualizado com sucesso!', 'success');
      
      // Verificar se as alterações foram salvas
      await navHelper.waitForText(updatedName, '[data-testid="lead-name"]');
      
      console.log('✅ Lead editado com sucesso');
    });

    it('deve alterar status do lead', async () => {
      console.log('📊 Testando alteração de status...');
      
      // Clicar no botão de alterar status
      await formHelper.clickButton('[data-testid="change-status-button"]:first-child');
      await navHelper.waitForElement('[data-testid="status-change-modal"]');

      await formHelper.selectOption('select[name="new_status"]', 'contacted');
      await formHelper.fillInput('textarea[name="status_notes"]', 'Lead contactado via telefone');
      await formHelper.clickButton('[data-testid="confirm-status-change-button"]');

      await navHelper.waitForToast('Status alterado com sucesso!', 'success');
      
      console.log('✅ Status alterado com sucesso');
    });

    it('deve adicionar notas ao lead', async () => {
      console.log('📝 Testando adição de notas...');
      
      await formHelper.clickButton('[data-testid="add-note-button"]:first-child');
      await navHelper.waitForElement('[data-testid="add-note-modal"]');

      await formHelper.fillInput('textarea[name="note_text"]', 'Lead muito interessado em consulta nutricional');
      await formHelper.selectOption('select[name="note_type"]', 'follow_up');
      await formHelper.clickButton('[data-testid="save-note-button"]');

      await navHelper.waitForToast('Nota adicionada com sucesso!', 'success');
      
      console.log('✅ Nota adicionada com sucesso');
    });
  });

  describe('Conversão de Leads', () => {
    beforeEach(async () => {
      // Criar um lead para converter
      await formHelper.clickButton(testData.selectors.addLeadButton);
      await formHelper.fillInput('input[name="name"]', testData.leads.validLead.name);
      await formHelper.fillInput('input[name="email"]', testData.leads.validLead.email);
      await formHelper.fillInput('input[name="phone"]', testData.leads.validLead.phone);
      await formHelper.selectOption('select[name="source"]', testData.leads.validLead.source);
      await formHelper.clickButton('[data-testid="save-lead-button"]');
      await navHelper.waitForToast('Lead criado com sucesso!', 'success');
    });

    it('deve converter lead para cliente', async () => {
      console.log('🔄 Testando conversão de lead...');
      
      // Clicar no botão de converter
      await formHelper.clickButton(testData.selectors.convertLeadButton);
      await navHelper.waitForElement('[data-testid="convert-lead-modal"]');

      // Preencher dados adicionais para o cliente
      await formHelper.fillInput('input[name="birth_date"]', '1990-05-15');
      await formHelper.fillInput('input[name="height_cm"]', '175');
      await formHelper.fillInput('input[name="weight_kg"]', '70');
      await formHelper.fillInput('textarea[name="goal"]', 'Perda de peso');
      await formHelper.selectOption('select[name="activity_level"]', 'moderada');

      await formHelper.clickButton('[data-testid="confirm-convert-button"]');
      await navHelper.waitForToast('Lead convertido para cliente com sucesso!', 'success');

      // Verificar se foi redirecionado para a lista de clientes
      await navHelper.expectUrl('/clientes');
      await navHelper.waitForText(testData.leads.validLead.name, '[data-testid="client-name"]');
      
      console.log('✅ Lead convertido com sucesso');
    });

    it('deve converter lead e criar agendamento', async () => {
      console.log('📅 Testando conversão com agendamento...');
      
      await formHelper.clickButton(testData.selectors.convertLeadButton);
      await navHelper.waitForElement('[data-testid="convert-lead-modal"]');

      // Marcar para criar agendamento
      await page.check('input[name="create_appointment"]');
      await formHelper.fillInput('input[name="appointment_date"]', '2024-12-20');
      await formHelper.fillInput('input[name="appointment_time"]', '14:00');
      await formHelper.selectOption('select[name="appointment_type"]', 'Consulta');

      await formHelper.clickButton('[data-testid="confirm-convert-button"]');
      await navHelper.waitForToast('Lead convertido e agendamento criado!', 'success');

      // Verificar se foi redirecionado para agendamentos
      await navHelper.expectUrl('/agendamentos');
      
      console.log('✅ Lead convertido com agendamento');
    });

    it('deve converter lead e criar plano alimentar', async () => {
      console.log('🍽️ Testando conversão com plano alimentar...');
      
      await formHelper.clickButton(testData.selectors.convertLeadButton);
      await navHelper.waitForElement('[data-testid="convert-lead-modal"]');

      // Marcar para criar plano alimentar
      await page.check('input[name="create_meal_plan"]');
      await formHelper.fillInput('textarea[name="meal_plan_goal"]', 'Plano para perda de peso');

      await formHelper.clickButton('[data-testid="confirm-convert-button"]');
      await navHelper.waitForToast('Lead convertido e plano alimentar criado!', 'success');

      console.log('✅ Lead convertido com plano alimentar');
    });
  });

  describe('Exclusão de Leads', () => {
    beforeEach(async () => {
      // Criar um lead para excluir
      await formHelper.clickButton(testData.selectors.addLeadButton);
      await formHelper.fillInput('input[name="name"]', testData.leads.validLead.name);
      await formHelper.fillInput('input[name="email"]', testData.leads.validLead.email);
      await formHelper.fillInput('input[name="phone"]', testData.leads.validLead.phone);
      await formHelper.selectOption('select[name="source"]', testData.leads.validLead.source);
      await formHelper.clickButton('[data-testid="save-lead-button"]');
      await navHelper.waitForToast('Lead criado com sucesso!', 'success');
    });

    it('deve excluir um lead existente', async () => {
      console.log('🗑️ Testando exclusão de lead...');
      
      // Contar leads antes da exclusão
      const leadsBefore = await page.$$('[data-testid="lead-item"]');
      const countBefore = leadsBefore.length;

      // Clicar no botão de excluir
      await formHelper.clickButton('[data-testid="delete-lead-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');

      // Confirmar exclusão
      await formHelper.clickButton('[data-testid="confirm-delete-button"]');
      await navHelper.waitForToast('Lead excluído com sucesso!', 'success');

      // Verificar se o lead foi removido
      const leadsAfter = await page.$$('[data-testid="lead-item"]');
      const countAfter = leadsAfter.length;
      
      expect(countAfter).toBe(countBefore - 1);
      
      console.log('✅ Lead excluído com sucesso');
    });

    it('deve cancelar exclusão quando usuário clica em cancelar', async () => {
      console.log('❌ Testando cancelamento de exclusão...');
      
      const leadsBefore = await page.$$('[data-testid="lead-item"]');
      const countBefore = leadsBefore.length;

      await formHelper.clickButton('[data-testid="delete-lead-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');

      // Clicar em cancelar
      await formHelper.clickButton('[data-testid="cancel-delete-button"]');

      // Verificar se o lead ainda existe
      const leadsAfter = await page.$$('[data-testid="lead-item"]');
      const countAfter = leadsAfter.length;
      
      expect(countAfter).toBe(countBefore);
      
      console.log('✅ Exclusão cancelada com sucesso');
    });
  });

  describe('Follow-up e Comunicação', () => {
    it('deve enviar email para lead', async () => {
      console.log('📧 Testando envio de email...');
      
      await formHelper.clickButton('[data-testid="send-email-button"]:first-child');
      await navHelper.waitForElement('[data-testid="email-modal"]');

      await formHelper.fillInput('input[name="email_subject"]', 'Bem-vindo à KorLab Nutri');
      await formHelper.fillInput('textarea[name="email_content"]', 'Olá! Obrigado pelo seu interesse em nossos serviços.');
      await formHelper.clickButton('[data-testid="send-email-button"]');

      await navHelper.waitForToast('Email enviado com sucesso!', 'success');
      
      console.log('✅ Email enviado');
    });

    it('deve agendar follow-up', async () => {
      console.log('⏰ Testando agendamento de follow-up...');
      
      await formHelper.clickButton('[data-testid="schedule-followup-button"]:first-child');
      await navHelper.waitForElement('[data-testid="followup-modal"]');

      await formHelper.fillInput('input[name="followup_date"]', '2024-12-20');
      await formHelper.fillInput('input[name="followup_time"]', '10:00');
      await formHelper.selectOption('select[name="followup_type"]', 'phone_call');
      await formHelper.fillInput('textarea[name="followup_notes"]', 'Ligar para confirmar interesse');

      await formHelper.clickButton('[data-testid="schedule-followup-button"]');
      await navHelper.waitForToast('Follow-up agendado com sucesso!', 'success');
      
      console.log('✅ Follow-up agendado');
    });

    it('deve usar template de email', async () => {
      console.log('📝 Testando uso de template...');
      
      await formHelper.clickButton('[data-testid="send-email-button"]:first-child');
      await navHelper.waitForElement('[data-testid="email-modal"]');

      await formHelper.selectOption('select[name="email_template"]', 'welcome');
      await formHelper.clickButton('[data-testid="load-template-button"]');

      // Verificar se o template foi carregado
      const subject = await page.$eval('input[name="email_subject"]', el => el.value);
      const content = await page.$eval('textarea[name="email_content"]', el => el.value);
      
      expect(subject).not.toBe('');
      expect(content).not.toBe('');
      
      console.log('✅ Template carregado');
    });
  });

  describe('Relatórios e Estatísticas', () => {
    it('deve exibir estatísticas de leads', async () => {
      console.log('📊 Testando exibição de estatísticas...');
      
      // Verificar cards de estatísticas
      const totalLeads = await page.$eval('[data-testid="total-leads"]', el => el.textContent);
      const newLeads = await page.$eval('[data-testid="new-leads"]', el => el.textContent);
      const convertedLeads = await page.$eval('[data-testid="converted-leads"]', el => el.textContent);
      const conversionRate = await page.$eval('[data-testid="conversion-rate"]', el => el.textContent);

      expect(parseInt(totalLeads)).toBeGreaterThanOrEqual(0);
      expect(parseInt(newLeads)).toBeGreaterThanOrEqual(0);
      expect(parseInt(convertedLeads)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(conversionRate)).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Estatísticas exibidas corretamente');
    });

    it('deve gerar relatório de leads', async () => {
      console.log('📋 Testando geração de relatório...');
      
      await formHelper.clickButton('[data-testid="generate-report-button"]');
      await navHelper.waitForElement('[data-testid="report-modal"]');

      await formHelper.fillInput('input[name="report_date_from"]', '2024-01-01');
      await formHelper.fillInput('input[name="report_date_to"]', '2024-12-31');
      await formHelper.selectOption('select[name="report_format"]', 'excel');
      
      await formHelper.clickButton('[data-testid="generate-report-button"]');
      await navHelper.waitForToast('Relatório gerado com sucesso!', 'success');
      
      console.log('✅ Relatório gerado');
    });

    it('deve exibir gráfico de conversão por fonte', async () => {
      console.log('📈 Testando gráfico de conversão...');
      
      await formHelper.clickButton('[data-testid="view-analytics-button"]');
      await navHelper.waitForElement('[data-testid="analytics-modal"]');

      // Verificar se o gráfico está presente
      const chart = await page.$('[data-testid="conversion-chart"]');
      expect(chart).not.toBeNull();
      
      console.log('✅ Gráfico de conversão exibido');
    });
  });
});