// Script para análise de cores e contraste WCAG
// KorLab Nutri - Auditoria de Design Visual

// Função para converter hex para RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Função para calcular luminância relativa
function getLuminance(rgb) {
  const [r, g, b] = Object.values(rgb).map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Função para calcular contraste WCAG
function getContrast(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Função para classificar contraste
function classifyContrast(ratio) {
  if (ratio < 3) return { level: 'FALHA', desc: 'Ilegível (< 3:1)' };
  if (ratio < 4.5) return { level: 'AA Large', desc: 'Só textos grandes (3:1 - 4.49:1)' };
  if (ratio < 7) return { level: 'AA', desc: 'Conformidade mínima (4.5:1 - 6.99:1)' };
  return { level: 'AAA', desc: 'Contraste excelente (7:1+)' };
}

// Cores identificadas no código
const colors = {
  // Cores primárias identificadas
  primary: '#10b981',      // Verde principal
  primaryDark: '#059669',  // Verde escuro
  primaryLight: '#34d399', // Verde claro
  
  // Cores secundárias
  secondary: '#3b82f6',    // Azul
  accent: '#8b5cf6',       // Roxo
  
  // Cores de texto
  textPrimary: '#171717',   // Texto principal dark
  textPrimaryLight: '#fafafa', // Texto principal light
  textSecondary: '#6b7280', // Texto secundário
  textTertiary: '#9ca3af',  // Texto terciário
  textMuted: '#737373',     // Texto muted
  textMutedLight: '#a3a3a3', // Texto muted light
  
  // Cores de background
  bgWhite: '#ffffff',
  bgDark: '#1a1a1a',
  bgCard: '#ffffff',
  bgCardDark: 'rgba(38, 38, 38, 0.6)',
  
  // Cores semânticas
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Cores de border
  border: '#e5e5e5',
  borderDark: '#404040',
  
  // Cores com transparência
  primaryAlpha: 'rgba(16, 185, 129, 0.1)',
  secondaryAlpha: 'rgba(59, 130, 246, 0.1)',
  errorAlpha: 'rgba(239, 68, 68, 0.1)',
  warningAlpha: 'rgba(245, 158, 11, 0.15)',
};

// Análise de contraste
console.log('🎨 AUDITORIA DE CORES - KorLab Nutri\n');

// Combinações críticas para testar
const combinations = [
  // Texto em background branco
  { text: colors.textSecondary, bg: colors.bgWhite, desc: 'Texto secundário em branco' },
  { text: colors.textTertiary, bg: colors.bgWhite, desc: 'Texto terciário em branco' },
  { text: colors.textMuted, bg: colors.bgWhite, desc: 'Texto muted em branco' },
  { text: colors.primary, bg: colors.bgWhite, desc: 'Verde primário em branco' },
  { text: colors.secondary, bg: colors.bgWhite, desc: 'Azul secundário em branco' },
  
  // Texto em background escuro
  { text: colors.textPrimaryLight, bg: colors.bgDark, desc: 'Texto claro em escuro' },
  { text: colors.textMutedLight, bg: colors.bgDark, desc: 'Texto muted light em escuro' },
  
  // Botões e elementos interativos
  { text: colors.bgWhite, bg: colors.primary, desc: 'Texto branco em botão verde' },
  { text: colors.bgWhite, bg: colors.secondary, desc: 'Texto branco em botão azul' },
  { text: colors.bgWhite, bg: colors.error, desc: 'Texto branco em botão erro' },
  { text: colors.bgWhite, bg: colors.warning, desc: 'Texto branco em botão aviso' },
  
  // Elementos com transparência (aproximação)
  { text: colors.textSecondary, bg: '#f8f9fa', desc: 'Texto secundário em card claro' },
  { text: colors.textPrimaryLight, bg: '#2a2a2a', desc: 'Texto claro em card escuro' },
];

console.log('📊 ANÁLISE DE CONTRASTE WCAG:\n');

let violations = [];
let warnings = [];
let approved = [];

combinations.forEach(combo => {
  const contrast = getContrast(combo.text, combo.bg);
  const classification = classifyContrast(contrast);
  
  const result = {
    desc: combo.desc,
    text: combo.text,
    bg: combo.bg,
    contrast: contrast ? contrast.toFixed(2) : 'N/A',
    level: classification.level,
    status: classification.level === 'FALHA' ? '❌' : 
            classification.level === 'AA Large' ? '⚠️' : '✅'
  };
  
  if (classification.level === 'FALHA') {
    violations.push(result);
  } else if (classification.level === 'AA Large') {
    warnings.push(result);
  } else {
    approved.push(result);
  }
});

// Relatório de violações críticas
if (violations.length > 0) {
  console.log('❌ VIOLAÇÕES CRÍTICAS DE CONTRASTE:');
  violations.forEach(v => {
    console.log(`${v.status} ${v.desc}`);
    console.log(`   Texto: ${v.text} | Background: ${v.bg} | Contraste: ${v.contrast}:1`);
    console.log('');
  });
}

// Avisos
if (warnings.length > 0) {
  console.log('⚠️ AVISOS - CONTRASTE LIMÍTROFE:');
  warnings.forEach(w => {
    console.log(`${w.status} ${w.desc}`);
    console.log(`   Texto: ${w.text} | Background: ${w.bg} | Contraste: ${w.contrast}:1`);
    console.log('');
  });
}

// Aprovados
if (approved.length > 0) {
  console.log('✅ CONTRASTES ADEQUADOS:');
  approved.forEach(a => {
    console.log(`${a.status} ${a.desc} - ${a.contrast}:1`);
  });
}

console.log('\n📈 RESUMO:');
console.log(`❌ Violações críticas: ${violations.length}`);
console.log(`⚠️ Avisos: ${warnings.length}`);
console.log(`✅ Aprovados: ${approved.length}`);

// Análise de cores hardcoded
console.log('\n🎨 CORES HARDCODED IDENTIFICADAS:');
const hardcodedColors = [
  '#10b981', '#059669', '#34d399', '#3b82f6', '#8b5cf6',
  '#171717', '#fafafa', '#6b7280', '#9ca3af', '#737373', '#a3a3a3',
  '#ffffff', '#1a1a1a', '#f59e0b', '#ef4444', '#e5e5e5', '#404040'
];

console.log(`Total de cores únicas hardcoded: ${hardcodedColors.length}`);
console.log('Cores encontradas:');
hardcodedColors.forEach(color => {
  console.log(`  ${color}`);
});

// Recomendações
console.log('\n💡 RECOMENDAÇÕES:');
console.log('1. Substituir todas as cores hardcoded por tokens do design system');
console.log('2. Criar paleta reduzida de 16+ cores para ~8 cores principais');
console.log('3. Implementar escala de cinzas consistente (4-5 tons)');
console.log('4. Validar contraste em todos os estados (hover, focus, disabled)');
console.log('5. Documentar design system com exemplos de uso');

// Gerar arquivo JSON com dados
const auditData = {
  timestamp: new Date().toISOString(),
  violations: violations,
  warnings: warnings,
  approved: approved,
  hardcodedColors: hardcodedColors,
  summary: {
    totalViolations: violations.length,
    totalWarnings: warnings.length,
    totalApproved: approved.length,
    totalHardcoded: hardcodedColors.length
  }
};

const fs = require('fs');
fs.writeFileSync('color-audit-report.json', JSON.stringify(auditData, null, 2));
console.log('\n📄 Relatório salvo em: color-audit-report.json');
