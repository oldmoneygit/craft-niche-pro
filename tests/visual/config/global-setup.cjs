/**
 * Setup global para testes visuais - KorLab Nutri
 * Configurações iniciais antes de todos os testes
 */

const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Iniciando setup global para testes visuais...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Aguardar servidor de desenvolvimento estar disponível
    console.log('⏳ Aguardando servidor de desenvolvimento...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Verificar se a aplicação está carregando corretamente
    const title = await page.title();
    console.log(`✅ Aplicação carregada: ${title}`);
    
    // Aguardar um pouco para garantir que tudo está estabilizado
    await page.waitForTimeout(2000);
    
    console.log('✅ Setup global concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no setup global:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
