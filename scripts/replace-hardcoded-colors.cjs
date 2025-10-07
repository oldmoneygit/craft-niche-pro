// Script para substituir cores hardcoded por tokens CSS
// KorLab Nutri - Correção automática de cores

const fs = require('fs');
const path = require('path');

// Mapeamento de cores hardcoded para tokens CSS
const colorMappings = {
  // Verde primário
  '#10b981': 'var(--primary)',
  '#059669': 'var(--primary-dark)',
  '#34d399': 'var(--primary-light)',
  
  // Azul secundário
  '#3b82f6': 'var(--secondary)',
  '#2563eb': 'var(--secondary-dark)',
  
  // Textos
  '#171717': 'var(--text-primary)',
  '#fafafa': 'var(--text-primary-light)',
  '#6b7280': 'var(--text-secondary)',
  '#9ca3af': 'var(--text-tertiary)',
  '#737373': 'var(--text-muted)',
  '#a3a3a3': 'var(--text-muted-light)',
  
  // Backgrounds
  '#ffffff': 'var(--bg-white)',
  '#1a1a1a': 'var(--bg-dark)',
  
  // Semânticas
  '#f59e0b': 'var(--warning)',
  '#ef4444': 'var(--destructive)',
  '#8b5cf6': 'var(--accent)',
  
  // Borders
  '#e5e5e5': 'var(--border)',
  '#404040': 'var(--border-dark)',
};

// Função para processar um arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Substituir cores hex
    Object.entries(colorMappings).forEach(([hexColor, cssVar]) => {
      const regex = new RegExp(hexColor.replace('#', '\\#'), 'g');
      if (content.includes(hexColor)) {
        content = content.replace(regex, cssVar);
        hasChanges = true;
        console.log(`✅ ${path.basename(filePath)}: ${hexColor} → ${cssVar}`);
      }
    });
    
    // Substituir cores RGB específicas
    const rgbMappings = {
      'rgba(16, 185, 129, 0.1)': 'var(--primary-alpha)',
      'rgba(16, 185, 129, 0.15)': 'var(--primary-alpha-dark)',
      'rgba(59, 130, 246, 0.1)': 'var(--secondary-alpha)',
      'rgba(239, 68, 68, 0.1)': 'var(--error-alpha)',
      'rgba(245, 158, 11, 0.15)': 'var(--warning-alpha)',
    };
    
    Object.entries(rgbMappings).forEach(([rgbaColor, cssVar]) => {
      if (content.includes(rgbaColor)) {
        content = content.replace(new RegExp(rgbaColor.replace(/[()]/g, '\\$&'), 'g'), cssVar);
        hasChanges = true;
        console.log(`✅ ${path.basename(filePath)}: ${rgbaColor} → ${cssVar}`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para encontrar arquivos TSX/TS
function findFiles(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Executar substituições
console.log('🎨 Iniciando substituição de cores hardcoded...\n');

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

let totalFiles = 0;
let changedFiles = 0;

files.forEach(file => {
  totalFiles++;
  if (processFile(file)) {
    changedFiles++;
  }
});

console.log(`\n📊 RESUMO:`);
console.log(`📁 Arquivos processados: ${totalFiles}`);
console.log(`✅ Arquivos alterados: ${changedFiles}`);
console.log(`📝 Cores substituídas: ${Object.keys(colorMappings).length} cores hex + 5 cores RGBA`);

// Adicionar variáveis CSS que faltam
const cssFile = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');

const missingVars = `
/* Cores com transparência para substituir RGBA */
  --primary-alpha: rgba(5, 150, 105, 0.1);
  --primary-alpha-dark: rgba(5, 150, 105, 0.15);
  --secondary-alpha: rgba(37, 99, 235, 0.1);
  --error-alpha: rgba(220, 38, 38, 0.1);
  --warning-alpha: rgba(217, 119, 6, 0.15);
  
  /* Backgrounds específicos */
  --bg-white: #ffffff;
  --bg-dark: #1a1a1a;
  
  /* Textos específicos */
  --text-primary-light: #fafafa;
  --text-muted-light: #a3a3a3;
  
  /* Borders específicos */
  --border-dark: #404040;
  
  /* Secundária escura */
  --secondary-dark: #1d4ed8;
`;

// Adicionar variáveis que faltam se não existirem
if (!cssContent.includes('--primary-alpha')) {
  cssContent = cssContent.replace('--radius: 0.75rem;', `--radius: 0.75rem;${missingVars}`);
  fs.writeFileSync(cssFile, cssContent, 'utf8');
  console.log('✅ Variáveis CSS adicionadas');
}

console.log('\n🎉 Substituição de cores concluída!');
