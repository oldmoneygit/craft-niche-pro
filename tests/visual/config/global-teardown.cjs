/**
 * Teardown global para testes visuais - KorLab Nutri
 * Limpeza após todos os testes
 */

async function globalTeardown(config) {
  console.log('🧹 Iniciando teardown global...');
  
  try {
    // Aqui você pode adicionar lógica de limpeza se necessário
    // Por exemplo: limpar dados de teste, fechar conexões, etc.
    
    console.log('✅ Teardown global concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teardown global:', error.message);
    throw error;
  }
}

module.exports = globalTeardown;
