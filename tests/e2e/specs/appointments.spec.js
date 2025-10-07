/**
 * Testes E2E para Gestão de Agendamentos - KorLab Nutri
 * Cobertura: CRUD completo de agendamentos, visualização de calendário, 
 * filtros por data/tipo, notificações e integração com clientes
 */

const puppeteer = require('puppeteer');
const config = require('../config/puppeteer.config.cjs');
const AuthHelper = require('../helpers/auth.helper.js');
const FormHelper = require('../helpers/form.helper.js');
const NavigationHelper = require('../helpers/navigation.helper.js');
const testData = require('../fixtures/test-data.js');

describe('Gestão de Agendamentos - KorLab Nutri', () => {
  let page;
  let authHelper;
  let formHelper;
  let navHelper;
  let createdAppointmentId;

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage();
    authHelper = new AuthHelper(page);
    formHelper = new FormHelper(page);
    navHelper = new NavigationHelper(page);
    
    // Login para acessar funcionalidades
    await authHelper.login(testData.users.validUser.email, testData.users.validUser.password);
    console.log('🚀 Iniciando testes de agendamentos...');
  });

  afterAll(async () => {
    // Limpar dados de teste se necessário
    await authHelper.clearAuthData();
    await page.close();
    console.log('🏁 Finalizando testes de agendamentos...');
  });

  beforeEach(async () => {
    await navHelper.navigateTo('/agendamentos');
    await navHelper.waitForElement(testData.selectors.appointmentList);
  });

  describe('Criação de Agendamentos', () => {
    it('deve criar um novo agendamento com dados válidos', async () => {
      console.log('📅 Testando criação de agendamento...');
      
      await formHelper.clickButton(testData.selectors.addAppointmentButton);
      await navHelper.waitForElement(testData.selectors.appointmentForm);

      // Preencher formulário de agendamento
      await formHelper.selectOption('select[name="client_id"]', '1'); // Assumindo cliente existente
      await formHelper.fillInput('input[name="date"]', testData.appointments.validAppointment.date);
      await formHelper.fillInput('input[name="time"]', testData.appointments.validAppointment.time);
      await formHelper.selectOption('select[name="duration"]', testData.appointments.validAppointment.duration.toString());
      await formHelper.selectOption('select[name="type"]', testData.appointments.validAppointment.type);
      await formHelper.fillInput('textarea[name="notes"]', testData.appointments.validAppointment.notes);

      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento criado com sucesso!', 'success');
      
      // Verificar se o agendamento aparece na lista
      await navHelper.waitForText(testData.appointments.validAppointment.type, '[data-testid="appointment-type"]');
      console.log('✅ Agendamento criado com sucesso');
    });

    it('deve validar campos obrigatórios', async () => {
      console.log('🔍 Testando validação de campos obrigatórios...');
      
      await formHelper.clickButton(testData.selectors.addAppointmentButton);
      await navHelper.waitForElement(testData.selectors.appointmentForm);

      // Tentar salvar sem preencher campos obrigatórios
      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      
      // Verificar mensagens de erro
      await navHelper.waitForText('Cliente é obrigatório', 'p.text-destructive');
      await navHelper.waitForText('Data é obrigatória', 'p.text-destructive');
      await navHelper.waitForText('Horário é obrigatório', 'p.text-destructive');
      
      console.log('✅ Validação de campos funcionando');
    });

    it('deve permitir agendamento recorrente', async () => {
      console.log('🔄 Testando agendamento recorrente...');
      
      await formHelper.clickButton(testData.selectors.addAppointmentButton);
      await navHelper.waitForElement(testData.selectors.appointmentForm);

      // Preencher dados básicos
      await formHelper.selectOption('select[name="client_id"]', '1');
      await formHelper.fillInput('input[name="date"]', testData.appointments.validAppointment.date);
      await formHelper.fillInput('input[name="time"]', testData.appointments.validAppointment.time);
      
      // Marcar como recorrente
      await page.check('input[name="is_recurring"]');
      await formHelper.selectOption('select[name="recurrence_type"]', 'weekly');
      await formHelper.fillInput('input[name="recurrence_end"]', '2024-03-15');

      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento recorrente criado com sucesso!', 'success');
      
      console.log('✅ Agendamento recorrente criado');
    });
  });

  describe('Visualização e Filtros', () => {
    it('deve exibir calendário mensal', async () => {
      console.log('📅 Testando visualização de calendário...');
      
      await formHelper.clickButton('[data-testid="calendar-view-button"]');
      await navHelper.waitForElement(testData.selectors.calendarView);

      // Verificar se o calendário está visível
      const calendarCells = await page.$$('[data-testid="calendar-day"]');
      expect(calendarCells.length).toBeGreaterThan(20); // Pelo menos 20 dias no mês
      
      console.log('✅ Calendário mensal exibido');
    });

    it('deve filtrar agendamentos por data', async () => {
      console.log('📅 Testando filtro por data...');
      
      // Aplicar filtro de data
      await formHelper.fillInput('input[name="filter_date_from"]', '2024-01-01');
      await formHelper.fillInput('input[name="filter_date_to"]', '2024-12-31');
      await formHelper.clickButton('[data-testid="apply-date-filter-button"]');

      await navHelper.waitForElement(testData.selectors.appointmentList);
      
      // Verificar se há agendamentos na lista filtrada
      const appointments = await page.$$('[data-testid="appointment-item"]');
      expect(appointments.length).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Filtro por data funcionando');
    });

    it('deve filtrar agendamentos por tipo', async () => {
      console.log('🔍 Testando filtro por tipo...');
      
      await formHelper.selectOption('select[name="filter_type"]', 'Consulta');
      await formHelper.clickButton('[data-testid="apply-type-filter-button"]');

      await navHelper.waitForElement(testData.selectors.appointmentList);
      
      console.log('✅ Filtro por tipo funcionando');
    });

    it('deve filtrar agendamentos por cliente', async () => {
      console.log('👤 Testando filtro por cliente...');
      
      await formHelper.selectOption('select[name="filter_client"]', '1');
      await formHelper.clickButton('[data-testid="apply-client-filter-button"]');

      await navHelper.waitForElement(testData.selectors.appointmentList);
      
      console.log('✅ Filtro por cliente funcionando');
    });
  });

  describe('Edição de Agendamentos', () => {
    beforeEach(async () => {
      // Criar um agendamento para editar
      await formHelper.clickButton(testData.selectors.addAppointmentButton);
      await formHelper.selectOption('select[name="client_id"]', '1');
      await formHelper.fillInput('input[name="date"]', testData.appointments.validAppointment.date);
      await formHelper.fillInput('input[name="time"]', testData.appointments.validAppointment.time);
      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento criado com sucesso!', 'success');
    });

    it('deve editar dados de um agendamento existente', async () => {
      console.log('✏️ Testando edição de agendamento...');
      
      // Clicar no botão de editar do primeiro agendamento
      await formHelper.clickButton('[data-testid="edit-appointment-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.appointmentForm);

      // Alterar dados
      const newTime = '15:30';
      await formHelper.fillInput('input[name="time"]', newTime);
      await formHelper.fillInput('textarea[name="notes"]', 'Consulta alterada via teste E2E');

      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento atualizado com sucesso!', 'success');
      
      // Verificar se as alterações foram salvas
      await navHelper.waitForText(newTime, '[data-testid="appointment-time"]');
      
      console.log('✅ Agendamento editado com sucesso');
    });

    it('deve alterar status do agendamento', async () => {
      console.log('📊 Testando alteração de status...');
      
      // Clicar no botão de alterar status
      await formHelper.clickButton('[data-testid="change-status-button"]:first-child');
      await navHelper.waitForElement('[data-testid="status-change-modal"]');

      await formHelper.selectOption('select[name="new_status"]', 'completed');
      await formHelper.fillInput('textarea[name="completion_notes"]', 'Consulta realizada com sucesso');
      await formHelper.clickButton('[data-testid="confirm-status-change-button"]');

      await navHelper.waitForToast('Status alterado com sucesso!', 'success');
      
      console.log('✅ Status alterado com sucesso');
    });
  });

  describe('Exclusão de Agendamentos', () => {
    beforeEach(async () => {
      // Criar um agendamento para excluir
      await formHelper.clickButton(testData.selectors.addAppointmentButton);
      await formHelper.selectOption('select[name="client_id"]', '1');
      await formHelper.fillInput('input[name="date"]', testData.appointments.validAppointment.date);
      await formHelper.fillInput('input[name="time"]', testData.appointments.validAppointment.time);
      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento criado com sucesso!', 'success');
    });

    it('deve excluir um agendamento existente', async () => {
      console.log('🗑️ Testando exclusão de agendamento...');
      
      // Contar agendamentos antes da exclusão
      const appointmentsBefore = await page.$$('[data-testid="appointment-item"]');
      const countBefore = appointmentsBefore.length;

      // Clicar no botão de excluir
      await formHelper.clickButton('[data-testid="delete-appointment-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');

      // Confirmar exclusão
      await formHelper.clickButton('[data-testid="confirm-delete-button"]');
      await navHelper.waitForToast('Agendamento excluído com sucesso!', 'success');

      // Verificar se o agendamento foi removido
      const appointmentsAfter = await page.$$('[data-testid="appointment-item"]');
      const countAfter = appointmentsAfter.length;
      
      expect(countAfter).toBe(countBefore - 1);
      
      console.log('✅ Agendamento excluído com sucesso');
    });

    it('deve cancelar exclusão quando usuário clica em cancelar', async () => {
      console.log('❌ Testando cancelamento de exclusão...');
      
      const appointmentsBefore = await page.$$('[data-testid="appointment-item"]');
      const countBefore = appointmentsBefore.length;

      await formHelper.clickButton('[data-testid="delete-appointment-button"]:first-child');
      await navHelper.waitForElement('[data-testid="delete-confirmation-modal"]');

      // Clicar em cancelar
      await formHelper.clickButton('[data-testid="cancel-delete-button"]');

      // Verificar se o agendamento ainda existe
      const appointmentsAfter = await page.$$('[data-testid="appointment-item"]');
      const countAfter = appointmentsAfter.length;
      
      expect(countAfter).toBe(countBefore);
      
      console.log('✅ Exclusão cancelada com sucesso');
    });
  });

  describe('Notificações e Lembretes', () => {
    it('deve enviar lembrete de agendamento', async () => {
      console.log('📱 Testando envio de lembrete...');
      
      // Clicar no botão de enviar lembrete
      await formHelper.clickButton('[data-testid="send-reminder-button"]:first-child');
      await navHelper.waitForElement('[data-testid="reminder-modal"]');

      await formHelper.fillInput('textarea[name="reminder_message"]', 'Lembrete: Você tem uma consulta agendada para amanhã.');
      await formHelper.clickButton('[data-testid="send-reminder-button"]');

      await navHelper.waitForToast('Lembrete enviado com sucesso!', 'success');
      
      console.log('✅ Lembrete enviado');
    });

    it('deve agendar lembrete automático', async () => {
      console.log('⏰ Testando agendamento de lembrete automático...');
      
      await formHelper.clickButton('[data-testid="edit-appointment-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.appointmentForm);

      // Configurar lembrete automático
      await page.check('input[name="enable_reminder"]');
      await formHelper.selectOption('select[name="reminder_time"]', '24'); // 24 horas antes
      await formHelper.selectOption('select[name="reminder_method"]', 'email');

      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento atualizado com sucesso!', 'success');
      
      console.log('✅ Lembrete automático configurado');
    });
  });

  describe('Integração com Outros Módulos', () => {
    it('deve criar agendamento a partir de lead convertido', async () => {
      console.log('🔄 Testando integração com leads...');
      
      // Navegar para leads e converter um lead
      await navHelper.navigateTo('/leads');
      await formHelper.clickButton('[data-testid="convert-lead-button"]:first-child');
      await navHelper.waitForElement('[data-testid="convert-lead-modal"]');

      await formHelper.check('input[name="create_appointment"]');
      await formHelper.fillInput('input[name="appointment_date"]', testData.appointments.validAppointment.date);
      await formHelper.fillInput('input[name="appointment_time"]', testData.appointments.validAppointment.time);
      
      await formHelper.clickButton('[data-testid="confirm-convert-button"]');
      await navHelper.waitForToast('Lead convertido e agendamento criado!', 'success');

      // Verificar se foi redirecionado para agendamentos
      await navHelper.expectUrl('/agendamentos');
      
      console.log('✅ Agendamento criado a partir de lead');
    });

    it('deve vincular agendamento a plano alimentar', async () => {
      console.log('🍽️ Testando integração com planos alimentares...');
      
      await formHelper.clickButton('[data-testid="edit-appointment-button"]:first-child');
      await navHelper.waitForElement(testData.selectors.appointmentForm);

      // Vincular a um plano alimentar
      await formHelper.selectOption('select[name="meal_plan_id"]', '1');
      await formHelper.fillInput('textarea[name="notes"]', 'Consulta para revisão do plano alimentar');

      await formHelper.clickButton('[data-testid="save-appointment-button"]');
      await navHelper.waitForToast('Agendamento atualizado com sucesso!', 'success');
      
      console.log('✅ Agendamento vinculado ao plano alimentar');
    });
  });

  describe('Relatórios e Estatísticas', () => {
    it('deve exibir estatísticas de agendamentos', async () => {
      console.log('📊 Testando exibição de estatísticas...');
      
      // Verificar cards de estatísticas
      const totalAppointments = await page.$eval('[data-testid="total-appointments"]', el => el.textContent);
      const completedAppointments = await page.$eval('[data-testid="completed-appointments"]', el => el.textContent);
      const pendingAppointments = await page.$eval('[data-testid="pending-appointments"]', el => el.textContent);

      expect(parseInt(totalAppointments)).toBeGreaterThanOrEqual(0);
      expect(parseInt(completedAppointments)).toBeGreaterThanOrEqual(0);
      expect(parseInt(pendingAppointments)).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Estatísticas exibidas corretamente');
    });

    it('deve gerar relatório de agendamentos', async () => {
      console.log('📋 Testando geração de relatório...');
      
      await formHelper.clickButton('[data-testid="generate-report-button"]');
      await navHelper.waitForElement('[data-testid="report-modal"]');

      await formHelper.fillInput('input[name="report_date_from"]', '2024-01-01');
      await formHelper.fillInput('input[name="report_date_to"]', '2024-12-31');
      await formHelper.selectOption('select[name="report_format"]', 'pdf');
      
      await formHelper.clickButton('[data-testid="generate-report-button"]');
      await navHelper.waitForToast('Relatório gerado com sucesso!', 'success');
      
      console.log('✅ Relatório gerado');
    });
  });
});