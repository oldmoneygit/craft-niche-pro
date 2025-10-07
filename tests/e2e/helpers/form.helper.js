/**
 * Helper para manipulação de formulários nos testes E2E
 * Utilitários para preenchimento, validação e submissão de formulários
 */

class FormHelper {
  constructor(page, config) {
    this.page = page;
    this.config = config;
  }

  /**
   * Preenche campo de input
   */
  async fillInput(selector, value, options = {}) {
    const { clear = true, delay = 0 } = options;
    
    console.log(`📝 Preenchendo campo: ${selector} com valor: ${value}`);
    
    try {
      await this.page.waitForSelector(selector, {
        timeout: this.config.app.timeouts.element,
      });

      if (clear) {
        await this.page.click(selector, { clickCount: 3 });
        await this.page.keyboard.press('Delete');
      }

      if (delay > 0) {
        await this.page.type(selector, value, { delay });
      } else {
        await this.page.type(selector, value);
      }

      // Trigger eventos de input
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, selector);

      return true;
    } catch (error) {
      console.error(`❌ Erro ao preencher campo ${selector}:`, error.message);
      throw error;
    }
  }

  /**
   * Seleciona opção em select/dropdown
   */
  async selectOption(selector, value) {
    console.log(`📋 Selecionando opção: ${value} em ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, {
        timeout: this.config.app.timeouts.element,
      });

      // Clicar no select para abrir
      await this.page.click(selector);
      
      // Aguardar opções aparecerem
      await this.page.waitForSelector(`${selector} [role="option"]`, {
        timeout: this.config.app.timeouts.element,
      });

      // Selecionar opção
      await this.page.click(`${selector} [role="option"][value="${value}"]`);
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao selecionar opção ${value} em ${selector}:`, error.message);
      throw error;
    }
  }

  /**
   * Marca/desmarca checkbox
   */
  async toggleCheckbox(selector, checked = true) {
    console.log(`☑️ ${checked ? 'Marcando' : 'Desmarcando'} checkbox: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, {
        timeout: this.config.app.timeouts.element,
      });

      const isChecked = await this.page.$eval(selector, el => el.checked);
      
      if (isChecked !== checked) {
        await this.page.click(selector);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao alterar checkbox ${selector}:`, error.message);
      throw error;
    }
  }

  /**
   * Submete formulário
   */
  async submitForm(formSelector = 'form') {
    console.log(`📤 Submetendo formulário: ${formSelector}`);
    
    try {
      await this.page.waitForSelector(formSelector, {
        timeout: this.config.app.timeouts.element,
      });

      // Aguardar botão de submit estar habilitado
      await this.page.waitForFunction((selector) => {
        const button = document.querySelector(`${selector} button[type="submit"]`);
        return button && !button.disabled;
      }, { timeout: this.config.app.timeouts.element }, formSelector);

      // Clicar no botão de submit
      await this.page.click(`${formSelector} button[type="submit"]`);
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao submeter formulário ${formSelector}:`, error.message);
      throw error;
    }
  }

  /**
   * Aguarda mensagem de sucesso
   */
  async waitForSuccessMessage(message = null) {
    console.log('✅ Aguardando mensagem de sucesso...');
    
    try {
      await this.page.waitForSelector('[data-testid="success-message"], .toast-success', {
        timeout: this.config.app.timeouts.element,
      });

      if (message) {
        const messageText = await this.page.$eval(
          '[data-testid="success-message"], .toast-success',
          el => el.textContent
        );
        
        if (!messageText.includes(message)) {
          throw new Error(`Mensagem esperada: "${message}", recebida: "${messageText}"`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao aguardar mensagem de sucesso:', error.message);
      throw error;
    }
  }

  /**
   * Aguarda mensagem de erro
   */
  async waitForErrorMessage(message = null) {
    console.log('❌ Aguardando mensagem de erro...');
    
    try {
      await this.page.waitForSelector('[data-testid="error-message"], .toast-error', {
        timeout: this.config.app.timeouts.element,
      });

      if (message) {
        const messageText = await this.page.$eval(
          '[data-testid="error-message"], .toast-error',
          el => el.textContent
        );
        
        if (!messageText.includes(message)) {
          throw new Error(`Mensagem de erro esperada: "${message}", recebida: "${messageText}"`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao aguardar mensagem de erro:', error.message);
      throw error;
    }
  }

  /**
   * Valida campos obrigatórios
   */
  async validateRequiredFields(selectors) {
    console.log('🔍 Validando campos obrigatórios...');
    
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, {
          timeout: this.config.app.timeouts.element,
        });

        const isEmpty = await this.page.$eval(selector, el => !el.value || el.value.trim() === '');
        
        if (isEmpty) {
          throw new Error(`Campo obrigatório vazio: ${selector}`);
        }
      } catch (error) {
        console.error(`❌ Erro na validação do campo ${selector}:`, error.message);
        throw error;
      }
    }
    
    return true;
  }

  /**
   * Limpa todos os campos do formulário
   */
  async clearForm(formSelector = 'form') {
    console.log(`🧹 Limpando formulário: ${formSelector}`);
    
    await this.page.evaluate((selector) => {
      const form = document.querySelector(selector);
      if (form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
          } else {
            input.value = '';
          }
        });
      }
    }, formSelector);
    
    return true;
  }
}

module.exports = FormHelper;
