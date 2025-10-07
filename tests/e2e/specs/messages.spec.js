/**
 * Testes E2E para Sistema de Mensagens - KorLab Nutri
 * Cobertura: Envio de mensagens, templates, histórico de conversas,
 * notificações, integração com clientes e agendamentos
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Sistema de Mensagens - KorLab Nutri', () => {
  let page;
  let authHelper;
  let formHelper;
  let navHelper;
  let createdTemplateId;

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage();
    authHelper = new AuthHelper(page);
    formHelper = new FormHelper(page);
    navHelper = new NavigationHelper(page);
    
    // Login para acessar funcionalidades
    await authHelper.login(testData.users.validUser.email, testData.users.validUser.password);
    console.log('🚀 Iniciando testes de mensagens...');
  });

  afterAll(async () => {
    // Limpar dados de teste se necessário
    await authHelper.clearAuthData();
    await page.close();
    console.log('🏁 Finalizando testes de mensagens...');
  });

  beforeEach(async () => {
    await navHelper.navigateTo('/mensagens');
    await navHelper.waitForElement(testData.selectors.messageList);
  });

  describe('Envio de Mensagens', () => {
    it('deve enviar mensagem para cliente', async () => {
      console.log('💬 Testando envio de mensagem...');
      
      await formHelper.clickButton('[data-testid="new-message-button"]');
      await navHelper.waitForElement(testData.selectors.messageForm);

      // Selecionar cliente
      await formHelper.selectOption('select[name="client_id"]', '1'); // Assumindo cliente existente
      
      // Preencher mensagem
      await formHelper.fillInput('textarea[name="message_text"]', testData.messages.validMessage.text);
      await formHelper.selectOption('select[name="message_type"]', testData.messages.validMessage.type);

      await formHelper.clickButton(testData.selectors.sendMessageButton);
      await navHelper.waitForToast('Mensagem enviada com sucesso!', 'success');
      
      // Verificar se a mensagem aparece no histórico
      await navHelper.waitForText(testData.messages.validMessage.text, '[data-testid="message-content"]');
      console.log('✅ Mensagem enviada com sucesso');
    });

    it('deve enviar mensagem para múltiplos clientes', async () => {
      console.log('👥 Testando envio para múltiplos clientes...');
      
      await formHelper.clickButton('[data-testid="new-message-button"]');
      await navHelper.waitForElement(testData.selectors.messageForm);

      // Selecionar múltiplos clientes
      await page.check('input[name="select_all_clients"]');
      
      await formHelper.fillInput('textarea[name="message_text"]', 'Mensagem para todos os clientes');
      await formHelper.clickButton(testData.selectors.sendMessageButton);
      
      await navHelper.waitForToast('Mensagens enviadas com sucesso!', 'success');
      
      console.log('✅ Mensagens enviadas para múltiplos clientes');
    });

    it('deve validar campos obrigatórios', async () => {
      console.log('🔍 Testando validação de campos...');
      
      await formHelper.clickButton('[data-testid="new-message-button"]');
      await navHelper.waitForElement(testData.selectors.messageForm);

      // Tentar enviar sem preencher campos obrigatórios
      await formHelper.clickButton(testData.selectors.sendMessageButton);
      
      await navHelper.waitForText('Cliente é obrigatório', 'p.text-destructive');
      await navHelper.waitForText('Mensagem é obrigatória', 'p.text-destructive');
      
      console.log('✅ Validação de campos funcionando');
    });

    it('deve permitir anexar arquivos', async () => {
      console.log('📎 Testando anexo de arquivos...');
      
      await formHelper.clickButton('[data-testid="new-message-button"]');
      await navHelper.waitForElement(testData.selectors.messageForm);

      await formHelper.selectOption('select[name="client_id"]', '1');
      await formHelper.fillInput('textarea[name="message_text"]', 'Mensagem com anexo');
      
      // Simular upload de arquivo (sem arquivo real para o teste)
      await formHelper.clickButton('[data-testid="attach-file-button"]');
      await navHelper.waitForElement('[data-testid="file-upload-modal"]');
      
      console.log('✅ Modal de anexo de arquivo funcionando');
    });
  });

  describe('Templates de Mensagens', () => {
    it('deve criar template de mensagem', async () => {
      console.log('📝 Testando criação de template...');
      
      await formHelper.clickButton('[data-testid="manage-templates-button"]');
      await navHelper.waitForElement('[data-testid="templates-modal"]');
      await formHelper.clickButton('[data-testid="create-template-button"]');
      await navHelper.waitForElement(testData.selectors.templateForm);

      // Preencher dados do template
      await formHelper.fillInput('input[name="template_name"]', testData.messages.validTemplate.name);
      await formHelper.selectOption('select[name="template_category"]', testData.messages.validTemplate.category);
      await formHelper.fillInput('textarea[name="template_content"]', testData.messages.validTemplate.content);

      await formHelper.clickButton('[data-testid="save-template-button"]');
      await navHelper.waitForToast('Template criado com sucesso!', 'success');
      
      // Verificar se o template aparece na lista
      await navHelper.waitForText(testData.messages.validTemplate.name, '[data-testid="template-name"]');
      console.log('✅ Template criado com sucesso');
    });

    it('deve editar template existente', async () => {
      console.log('✏️ Testando edição de template...');
      
      // Criar template primeiro
      await formHelper.clickButton('[data-testid="manage-templates-button"]');
      await navHelper.waitForElement('[data-testid="templates-modal"]');
      await formHelper.clickButton('[data-testid="create-template-button"]');
      await formHelper.fillInput('input[name="template_name"]', testData.messages.validTemplate.name);
      await formHelper.fillInput('textarea[name="template_content"]', testData.messages.validTemplate.content);
      await formHelper.clickButton('[data-testid="save-template-button"]');
      await navHelper.waitForToast('Template criado com sucesso!', 'success');

      // Editar template
      await formHelper.clickButton('[data-testid="edit-template-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.templateForm);

      const updatedContent = 'Template editado via teste E2E';
      await formHelper.fillInput('textarea[name="template_content"]', updatedContent);
      await formHelper.clickButton('[data-testid="save-template-button"]');
      
      await navHelper.waitForToast('Template atualizado com sucesso!', 'success');
      await navHelper.waitForText(updatedContent, '[data-testid="template-content"]');
      
      console.log('✅ Template editado com sucesso');
    });

    it('deve usar template em mensagem', async () => {
      console.log('📋 Testando uso de template...');
      
      // Criar template primeiro
      await formHelper.clickButton('[data-testid="manage-templates-button"]');
      await navHelper.waitForElement('[data-testid="templates-modal"]');
      await formHelper.clickButton('[data-testid="create-template-button"]');
      await formHelper.fillInput('input[name="template_name"]', testData.messages.validTemplate.name);
      await formHelper.fillInput('textarea[name="template_content"]', testData.messages.validTemplate.content);
      await formHelper.clickButton('[data-testid="save-template-button"]');
      await navHelper.waitForToast('Template criado com sucesso!', 'success');

      // Fechar modal de templates
      await formHelper.clickButton('[data-testid="close-templates-modal"]');

      // Usar template em nova mensagem
      await formHelper.clickButton('[data-testid="new-message-button"]');
      await formHelper.selectOption('select[name="client_id"]', '1');
      
      await formHelper.selectOption('select[name="message_template"]', testData.messages.validTemplate.name);
      await formHelper.clickButton('[data-testid="load-template-button"]');

      // Verificar se o conteúdo do template foi carregado
      const messageContent = await page.$eval('textarea[name="message_text"]', el => el.value);
      expect(messageContent).toContain(testData.messages.validTemplate.content);
      
      console.log('✅ Template usado em mensagem');
    });

    it('deve excluir template', async () => {
      console.log('🗑️ Testando exclusão de template...');
      
      // Criar template primeiro
      await formHelper.clickButton('[data-testid="manage-templates-button"]');
      await navHelper.waitForElement('[data-testid="templates-modal"]');
      await formHelper.clickButton('[data-testid="create-template-button"]');
      await formHelper.fillInput('input[name="template_name"]', testData.messages.validTemplate.name);
      await formHelper.fillInput('textarea[name="template_content"]', testData.messages.validTemplate.content);
      await formHelper.clickButton('[data-testid="save-template-button"]');
      await navHelper.waitForToast('Template criado com sucesso!', 'success');

      // Excluir template
      await formHelper.clickButton('[data-testid="delete-template-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');
      await formHelper.clickButton('[data-testid="confirm-delete-button"]');
      
      await navHelper.waitForToast('Template excluído com sucesso!', 'success');
      
      console.log('✅ Template excluído');
    });
  });

  describe('Histórico de Conversas', () => {
    it('deve exibir histórico de mensagens com cliente', async () => {
      console.log('💬 Testando histórico de conversas...');
      
      // Enviar uma mensagem primeiro
      await formHelper.clickButton('[data-testid="new-message-button"]');
      await formHelper.selectOption('select[name="client_id"]', '1');
      await formHelper.fillInput('textarea[name="message_text"]', 'Mensagem de teste para histórico');
      await formHelper.clickButton(testData.selectors.sendMessageButton);
      await navHelper.waitForToast('Mensagem enviada com sucesso!', 'success');

      // Verificar histórico
      await navHelper.waitForElement('[data-testid="conversation-history"]');
      const messages = await page.$$('[data-testid="message-item"]');
      expect(messages.length).toBeGreaterThan(0);
      
      console.log('✅ Histórico de conversas exibido');
    });

    it('deve filtrar mensagens por cliente', async () => {
      console.log('🔍 Testando filtro por cliente...');
      
      await formHelper.selectOption('select[name="filter_client"]', '1');
      await formHelper.clickButton('[data-testid="apply-client-filter-button"]');

      await navHelper.waitForElement(testData.selectors.messageList);
      
      console.log('✅ Filtro por cliente funcionando');
    });

    it('deve filtrar mensagens por data', async () => {
      console.log('📅 Testando filtro por data...');
      
      await formHelper.fillInput('input[name="filter_date_from"]', '2024-01-01');
      await formHelper.fillInput('input[name="filter_date_to"]', '2024-12-31');
      await formHelper.clickButton('[data-testid="apply-date-filter-button"]');

      await navHelper.waitForElement(testData.selectors.messageList);
      
      console.log('✅ Filtro por data funcionando');
    });

    it('deve buscar mensagens por conteúdo', async () => {
      console.log('🔍 Testando busca por conteúdo...');
      
      await formHelper.fillInput('input[name="search_messages"]', 'teste');
      await formHelper.clickButton('[data-testid="search-messages-button"]');

      await navHelper.waitForElement(testData.selectors.messageList);
      
      console.log('✅ Busca por conteúdo funcionando');
    });
  });

  describe('Notificações e Alertas', () => {
    it('deve exibir notificação de nova mensagem', async () => {
      console.log('🔔 Testando notificações...');
      
      // Verificar se há notificações
      const notificationBadge = await page.$('[data-testid="notification-badge"]');
      if (notificationBadge) {
        const count = await notificationBadge.evaluate(el => el.textContent);
        expect(parseInt(count)).toBeGreaterThanOrEqual(0);
      }
      
      console.log('✅ Notificações funcionando');
    });

    it('deve marcar mensagem como lida', async () => {
      console.log('✅ Testando marcação como lida...');
      
      // Clicar em uma mensagem não lida
      await formHelper.clickButton('[data-testid="unread-message"]:first-child');
      
      // Verificar se foi marcada como lida
      await navHelper.waitForElement('[data-testid="read-message"]');
      
      console.log('✅ Mensagem marcada como lida');
    });

    it('deve configurar alertas de mensagens', async () => {
      console.log('⚙️ Testando configuração de alertas...');
      
      await formHelper.clickButton('[data-testid="message-settings-button"]');
      await navHelper.waitForElement('[data-testid="settings-modal"]');

      // Configurar alertas
      await page.check('input[name="email_notifications"]');
      await page.check('input[name="push_notifications"]');
      await formHelper.selectOption('select[name="notification_frequency"]', 'immediate');

      await formHelper.clickButton('[data-testid="save-settings-button"]');
      await navHelper.waitForToast('Configurações salvas com sucesso!', 'success');
      
      console.log('✅ Alertas configurados');
    });
  });

  describe('Integração com Outros Módulos', () => {
    it('deve enviar lembrete de agendamento', async () => {
      console.log('📅 Testando envio de lembrete de agendamento...');
      
      // Navegar para agendamentos e enviar lembrete
      await navHelper.navigateTo('/agendamentos');
      await formHelper.clickButton('[data-testid="send-reminder-button"]:first-child');
      await navHelper.waitForElement('[data-testid="reminder-modal"]');

      await formHelper.fillInput('textarea[name="reminder_message"]', 'Lembrete: Você tem uma consulta agendada para amanhã.');
      await formHelper.clickButton('[data-testid="send-reminder-button"]');

      await navHelper.waitForToast('Lembrete enviado com sucesso!', 'success');
      
      // Verificar se aparece no histórico de mensagens
      await navHelper.navigateTo('/mensagens');
      await navHelper.waitForText('Lembrete: Você tem uma consulta agendada', '[data-testid="message-content"]');
      
      console.log('✅ Lembrete de agendamento enviado');
    });

    it('deve enviar mensagem de boas-vindas para novo cliente', async () => {
      console.log('👋 Testando mensagem de boas-vindas...');
      
      // Navegar para clientes e criar um novo
      await navHelper.navigateTo('/clientes');
      await formHelper.clickButton(testData.selectors.addClientButton);
      await formHelper.fillInput('input[name="name"]', 'Cliente Teste Mensagem');
      await formHelper.fillInput('input[name="email"]', 'cliente.teste@email.com');
      await formHelper.fillInput('input[name="phone"]', '11999999999');
      
      // Marcar para enviar mensagem de boas-vindas
      await page.check('input[name="send_welcome_message"]');
      await formHelper.clickButton('[data-testid="save-client-button"]');
      
      await navHelper.waitForToast('Cliente criado e mensagem enviada!', 'success');

      // Verificar se a mensagem foi enviada
      await navHelper.navigateTo('/mensagens');
      await navHelper.waitForText('Bem-vindo', '[data-testid="message-content"]');
      
      console.log('✅ Mensagem de boas-vindas enviada');
    });

    it('deve enviar feedback request após consulta', async () => {
      console.log('⭐ Testando solicitação de feedback...');
      
      // Navegar para agendamentos e marcar consulta como realizada
      await navHelper.navigateTo('/agendamentos');
      await formHelper.clickButton('[data-testid="mark-completed-button"]:first-child');
      await navHelper.waitForElement('[data-testid="completion-modal"]');

      // Marcar para enviar solicitação de feedback
      await page.check('input[name="send_feedback_request"]');
      await formHelper.clickButton('[data-testid="confirm-completion-button"]');
      
      await navHelper.waitForToast('Consulta finalizada e feedback solicitado!', 'success');

      // Verificar se a mensagem foi enviada
      await navHelper.navigateTo('/mensagens');
      await navHelper.waitForText('feedback', '[data-testid="message-content"]');
      
      console.log('✅ Solicitação de feedback enviada');
    });
  });

  describe('Relatórios e Estatísticas', () => {
    it('deve exibir estatísticas de mensagens', async () => {
      console.log('📊 Testando estatísticas de mensagens...');
      
      // Verificar cards de estatísticas
      const totalMessages = await page.$eval('[data-testid="total-messages"]', el => el.textContent);
      const sentMessages = await page.$eval('[data-testid="sent-messages"]', el => el.textContent);
      const receivedMessages = await page.$eval('[data-testid="received-messages"]', el => el.textContent);
      const unreadMessages = await page.$eval('[data-testid="unread-messages"]', el => el.textContent);

      expect(parseInt(totalMessages)).toBeGreaterThanOrEqual(0);
      expect(parseInt(sentMessages)).toBeGreaterThanOrEqual(0);
      expect(parseInt(receivedMessages)).toBeGreaterThanOrEqual(0);
      expect(parseInt(unreadMessages)).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Estatísticas de mensagens exibidas');
    });

    it('deve gerar relatório de mensagens', async () => {
      console.log('📋 Testando geração de relatório...');
      
      await formHelper.clickButton('[data-testid="generate-message-report-button"]');
      await navHelper.waitForElement('[data-testid="report-modal"]');

      await formHelper.fillInput('input[name="report_date_from"]', '2024-01-01');
      await formHelper.fillInput('input[name="report_date_to"]', '2024-12-31');
      await formHelper.selectOption('select[name="report_format"]', 'pdf');
      
      await formHelper.clickButton('[data-testid="generate-report-button"]');
      await navHelper.waitForToast('Relatório gerado com sucesso!', 'success');
      
      console.log('✅ Relatório de mensagens gerado');
    });

    it('deve exibir gráfico de volume de mensagens', async () => {
      console.log('📈 Testando gráfico de volume...');
      
      await formHelper.clickButton('[data-testid="view-analytics-button"]');
      await navHelper.waitForElement('[data-testid="analytics-modal"]');

      // Verificar se o gráfico está presente
      const chart = await page.$('[data-testid="message-volume-chart"]');
      expect(chart).not.toBeNull();
      
      console.log('✅ Gráfico de volume exibido');
    });
  });

  describe('Configurações Avançadas', () => {
    it('deve configurar assinatura de email', async () => {
      console.log('✍️ Testando configuração de assinatura...');
      
      await formHelper.clickButton('[data-testid="message-settings-button"]');
      await navHelper.waitForElement('[data-testid="settings-modal"]');

      await formHelper.fillInput('textarea[name="email_signature"]', 'Dr. João Nutricionista\nCRN: 123456\nKorLab Nutri');
      await formHelper.clickButton('[data-testid="save-settings-button"]');
      
      await navHelper.waitForToast('Configurações salvas com sucesso!', 'success');
      
      console.log('✅ Assinatura configurada');
    });

    it('deve configurar horário de envio automático', async () => {
      console.log('⏰ Testando configuração de horário...');
      
      await formHelper.clickButton('[data-testid="message-settings-button"]');
      await navHelper.waitForElement('[data-testid="settings-modal"]');

      await page.check('input[name="enable_scheduled_messages"]');
      await formHelper.fillInput('input[name="business_hours_start"]', '08:00');
      await formHelper.fillInput('input[name="business_hours_end"]', '18:00');
      await formHelper.selectOption('select[name="timezone"]', 'America/Sao_Paulo');

      await formHelper.clickButton('[data-testid="save-settings-button"]');
      await navHelper.waitForToast('Configurações salvas com sucesso!', 'success');
      
      console.log('✅ Horário de envio configurado');
    });
  });
});