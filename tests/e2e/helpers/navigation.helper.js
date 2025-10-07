/**
 * Helper para navegação nos testes E2E
 * Utilitários para navegação entre páginas e validação de rotas
 */

class NavigationHelper {
  constructor(page, config) {
    this.page = page;
    this.config = config;
    this.baseURL = config.baseURL;
  }

  /**
   * Navega para uma página específica
   */
  async navigateTo(page, waitForSelector = null) {
    console.log(`🧭 Navegando para: ${page}`);
    
    try {
      const url = this.config.app.urls[page] || page;
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      await this.page.goto(fullUrl, {
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });

      // Aguardar elemento específico se fornecido
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, {
          timeout: this.config.app.timeouts.element,
        });
      }

      console.log(`✅ Navegação para ${page} realizada com sucesso`);
      return true;

    } catch (error) {
      console.error(`❌ Erro na navegação para ${page}:`, error.message);
      throw error;
    }
  }

  /**
   * Clica em link do menu de navegação
   */
  async clickNavigationLink(linkText, waitForSelector = null) {
    console.log(`🔗 Clicando no link: ${linkText}`);
    
    try {
      // Aguardar menu de navegação estar visível
      await this.page.waitForSelector('[data-testid="navigation"]', {
        timeout: this.config.app.timeouts.element,
      });

      // Encontrar e clicar no link
      const linkSelector = `[data-testid="navigation"] a:has-text("${linkText}"), [data-testid="navigation"] [role="button"]:has-text("${linkText}")`;
      await this.page.waitForSelector(linkSelector, {
        timeout: this.config.app.timeouts.element,
      });
      
      await this.page.click(linkSelector);

      // Aguardar navegação
      await this.page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });

      // Aguardar elemento específico se fornecido
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, {
          timeout: this.config.app.timeouts.element,
        });
      }

      console.log(`✅ Link ${linkText} clicado com sucesso`);
      return true;

    } catch (error) {
      console.error(`❌ Erro ao clicar no link ${linkText}:`, error.message);
      throw error;
    }
  }

  /**
   * Verifica se está na página correta
   */
  async isOnPage(expectedPage) {
    try {
      const currentUrl = this.page.url();
      const expectedUrl = this.config.app.urls[expectedPage] || expectedPage;
      
      return currentUrl.includes(expectedUrl);
    } catch (error) {
      console.error(`❌ Erro ao verificar página:`, error.message);
      return false;
    }
  }

  /**
   * Aguarda carregamento completo da página
   */
  async waitForPageLoad() {
    console.log('⏳ Aguardando carregamento da página...');
    
    try {
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForFunction(() => document.readyState === 'complete');
      
      console.log('✅ Página carregada completamente');
      return true;
    } catch (error) {
      console.error('❌ Erro ao aguardar carregamento da página:', error.message);
      throw error;
    }
  }

  /**
   * Volta para a página anterior
   */
  async goBack() {
    console.log('⬅️ Voltando para página anterior...');
    
    try {
      await this.page.goBack({
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });
      
      console.log('✅ Navegação para trás realizada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao voltar:', error.message);
      throw error;
    }
  }

  /**
   * Recarrega a página atual
   */
  async reload() {
    console.log('🔄 Recarregando página...');
    
    try {
      await this.page.reload({
        waitUntil: 'networkidle2',
        timeout: this.config.app.timeouts.navigation,
      });
      
      console.log('✅ Página recarregada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao recarregar página:', error.message);
      throw error;
    }
  }

  /**
   * Aguarda elemento específico aparecer
   */
  async waitForElement(selector, options = {}) {
    const { timeout = this.config.app.timeouts.element, visible = true } = options;
    
    console.log(`👀 Aguardando elemento: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, {
        timeout,
        visible,
      });
      
      console.log(`✅ Elemento ${selector} encontrado`);
      return true;
    } catch (error) {
      console.error(`❌ Elemento ${selector} não encontrado:`, error.message);
      throw error;
    }
  }

  /**
   * Aguarda elemento desaparecer
   */
  async waitForElementToDisappear(selector, timeout = null) {
    console.log(`👻 Aguardando elemento desaparecer: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, {
        state: 'hidden',
        timeout: timeout || this.config.app.timeouts.element,
      });
      
      console.log(`✅ Elemento ${selector} desapareceu`);
      return true;
    } catch (error) {
      console.error(`❌ Elemento ${selector} ainda está visível:`, error.message);
      throw error;
    }
  }

  /**
   * Verifica se elemento está visível
   */
  async isElementVisible(selector) {
    try {
      const element = await this.page.$(selector);
      if (!element) return false;
      
      const isVisible = await element.isVisible();
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Aguarda API response
   */
  async waitForApiResponse(urlPattern, timeout = null) {
    console.log(`🌐 Aguardando resposta da API: ${urlPattern}`);
    
    try {
      await this.page.waitForResponse(
        response => response.url().includes(urlPattern),
        { timeout: timeout || this.config.app.timeouts.api }
      );
      
      console.log(`✅ Resposta da API ${urlPattern} recebida`);
      return true;
    } catch (error) {
      console.error(`❌ Timeout aguardando API ${urlPattern}:`, error.message);
      throw error;
    }
  }
}

module.exports = NavigationHelper;
