/**
 * Helper para autenticação nos testes E2E
 * Gerencia login, logout e estados de autenticação
 */

class AuthHelper {
  constructor(page, config) {
    this.page = page;
    this.config = config;
    this.baseURL = config.baseURL;
  }

  /**
   * Realiza login com credenciais válidas
   */
  async login(email = null, password = null) {
    const userEmail = email || this.config.app.testUser.email;
    const userPassword = password || this.config.app.testUser.password;

    console.log('🔐 Realizando login...');

    try {
      // Navegar para a página de login
      await this.page.goto(`${this.baseURL}/`, {
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });

      // Aguardar elementos do formulário
      await this.page.waitForSelector('input[type="email"]', {
        timeout: this.config.app.timeouts.element,
      });

      // Preencher formulário de login
      await this.page.type('input[type="email"]', userEmail);
      await this.page.type('input[type="password"]', userPassword);

      // Clicar no botão de login
      await this.page.click('button[type="submit"]');

      // Aguardar redirecionamento para dashboard
      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });

      // Verificar se está logado (presença de elementos do dashboard)
      await this.page.waitForSelector('[data-testid="dashboard"]', {
        timeout: this.config.app.timeouts.element,
      });

      console.log('✅ Login realizado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está logado
   */
  async isLoggedIn() {
    try {
      // Verificar presença de elementos que indicam login
      const dashboardElement = await this.page.$('[data-testid="dashboard"]');
      const userMenu = await this.page.$('[data-testid="user-menu"]');
      
      return !!(dashboardElement || userMenu);
    } catch (error) {
      return false;
    }
  }

  /**
   * Realiza logout
   */
  async logout() {
    console.log('🚪 Realizando logout...');

    try {
      // Clicar no menu do usuário
      await this.page.click('[data-testid="user-menu"]');
      
      // Aguardar menu aparecer
      await this.page.waitForSelector('[data-testid="logout-button"]', {
        timeout: this.config.app.timeouts.element,
      });

      // Clicar em logout
      await this.page.click('[data-testid="logout-button"]');

      // Aguardar redirecionamento para login
      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });

      console.log('✅ Logout realizado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro no logout:', error.message);
      throw error;
    }
  }

  /**
   * Aguarda autenticação ser processada
   */
  async waitForAuth() {
    await this.page.waitForFunction(() => {
      // Verificar se não há mais loading de autenticação
      const authLoading = document.querySelector('[data-testid="auth-loading"]');
      return !authLoading || authLoading.style.display === 'none';
    }, { timeout: this.config.app.timeouts.navigation });
  }

  /**
   * Limpa dados de autenticação (localStorage, cookies)
   */
  async clearAuthData() {
    try {
      // Navegar para uma página válida primeiro
      await this.page.goto(`${this.baseURL}/`, { waitUntil: 'domcontentloaded' });
      
      await this.page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      });
    } catch (error) {
      console.warn('Erro ao limpar dados de autenticação:', error.message);
    }
  }
}

module.exports = AuthHelper;
