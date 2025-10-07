# 🎨 Testes Visuais e Acessibilidade - KorLab Nutri

Sistema completo de testes visuais e acessibilidade implementado com Playwright + Axe-Core.

## 🚀 **FUNCIONALIDADES**

### **Testes Visuais**
- ✅ Screenshots de todas as páginas principais
- ✅ Comparação visual baseline vs atual
- ✅ Testes de responsividade (mobile, tablet, desktop)
- ✅ Validação de cores e contraste
- ✅ Suporte multi-browser (Chromium, Firefox, WebKit)

### **Testes de Acessibilidade**
- ✅ Auditoria WCAG AA completa
- ✅ Navegação por teclado
- ✅ Contraste de cores
- ✅ Labels e ARIA
- ✅ Estrutura de headings
- ✅ Indicadores de foco

### **Design System Validation**
- ✅ Paleta de cores consistente
- ✅ Tipografia padronizada
- ✅ Espaçamentos uniformes
- ✅ Componentes visuais
- ✅ Design responsivo

## 📁 **ESTRUTURA**

```
tests/visual/
├── config/                 # Configurações
│   ├── playwright.config.js
│   ├── axe.config.js
│   ├── global-setup.js
│   └── global-teardown.js
├── helpers/                # Helpers reutilizáveis
│   ├── visual.helper.js
│   ├── accessibility.helper.js
│   └── design.helper.js
├── specs/                  # Testes
│   ├── visual.spec.js
│   ├── accessibility.spec.js
│   └── design-system.spec.js
├── baselines/              # Screenshots de referência
│   ├── desktop/
│   ├── tablet/
│   └── mobile/
├── reports/                # Relatórios
│   ├── visual/
│   └── accessibility/
└── utils/                  # Utilitários
    ├── color-validator.js
    └── typography-validator.js
```

## 🛠️ **COMANDOS DISPONÍVEIS**

### **Testes Visuais**
```bash
# Executar todos os testes visuais
npm run test:visual

# Interface gráfica do Playwright
npm run test:visual:ui

# Modo debug
npm run test:visual:debug

# Modo headed (ver navegador)
npm run test:visual:headed

# Testes específicos por browser
npm run test:visual:chromium
npm run test:visual:firefox
npm run test:visual:webkit

# Testes por dispositivo
npm run test:visual:mobile
npm run test:visual:tablet
```

### **Testes de Acessibilidade**
```bash
# Auditoria de acessibilidade
npm run test:accessibility

# Validação do design system
npm run test:design-system
```

### **Gerenciamento de Baseline**
```bash
# Atualizar screenshots de referência
npm run visual:baseline

# Visualizar relatórios
npm run visual:report
npm run visual:report:accessibility
```

### **Utilitários**
```bash
# Instalar browsers do Playwright
npm run visual:install

# Gerar código de teste
npm run visual:codegen

# Executar todos os testes
npm run test:all
npm run test:all:ci
```

## 🎯 **PÁGINAS TESTADAS**

- ✅ Dashboard (/)
- ✅ Clientes (/clientes)
- ✅ Leads (/leads)
- ✅ Agendamentos (/agendamentos)
- ✅ Planos Alimentares (/planos)
- ✅ Questionários (/questionarios)
- ✅ Questionários Builder (/questionarios/novo)
- ✅ Recordatório (/recordatorio)
- ✅ Feedbacks Semanais (/feedbacks)
- ✅ Serviços (/servicos)
- ✅ Mensagens (/mensagens)
- ✅ Lembretes (/lembretes)
- ✅ Agente IA (/agente-ia)
- ✅ Base Conhecimento (/base-conhecimento)
- ✅ Relatórios (/relatorios)
- ✅ Financeiro (/financeiro)
- ✅ Configurações (/configuracoes)

## 📊 **VIEWPORTS SUPORTADOS**

- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667

## 🌐 **BROWSERS SUPORTADOS**

- **Chromium** (Chrome/Edge)
- **Firefox**
- **WebKit** (Safari)

## ♿ **PADRÕES DE ACESSIBILIDADE**

- **WCAG AA** compliance
- **Contraste mínimo**: 4.5:1 (texto normal), 3:1 (texto grande)
- **Navegação por teclado** completa
- **Labels e ARIA** adequados
- **Estrutura semântica** correta

## 🎨 **DESIGN SYSTEM**

### **Cores**
- Máximo 20 cores únicas
- Contraste WCAG AA
- Paleta consistente entre páginas

### **Tipografia**
- Máximo 3 fontes
- Máximo 8 tamanhos
- Hierarquia semântica (H1-H6)
- Line-height adequado (1.2-2.0)

### **Espaçamentos**
- Máximo 10 valores únicos
- Consistência entre componentes
- Sistema de grid responsivo

## 📈 **RELATÓRIOS**

### **Relatórios Visuais**
- Screenshots de comparação
- Diferenças detectadas
- Métricas de performance
- Análise de responsividade

### **Relatórios de Acessibilidade**
- Violações WCAG categorizadas
- Pontuação geral
- Recomendações de melhoria
- Screenshots de problemas

### **Relatórios do Design System**
- Análise de cores
- Consistência tipográfica
- Validação de espaçamentos
- Pontuação geral

## 🔧 **CONFIGURAÇÃO**

### **Playwright**
- Timeout: 30s
- Retry: 2x (CI), 0x (local)
- Threshold visual: 20%
- Screenshots: full page

### **Axe-Core**
- Tags: wcag2a, wcag2aa, wcag21aa, best-practice
- Exclusões: devtools, elementos dinâmicos
- Thresholds: 0 críticas, 0 sérias, ≤5 moderadas

## 🚀 **INTEGRAÇÃO CI/CD**

### **GitHub Actions** (exemplo)
```yaml
- name: Visual Tests
  run: npm run test:visual -- --reporter=github

- name: Accessibility Tests  
  run: npm run test:accessibility -- --reporter=github

- name: Design System Tests
  run: npm run test:design-system -- --reporter=github
```

## 📝 **COMO USAR**

### **1. Primeira Execução**
```bash
# Instalar dependências
npm install

# Instalar browsers
npm run visual:install

# Capturar baseline inicial
npm run visual:baseline
```

### **2. Execução Regular**
```bash
# Desenvolvimento local
npm run test:visual

# Ver relatórios
npm run visual:report
```

### **3. Atualizar Baseline**
```bash
# Quando houver mudanças visuais intencionais
npm run visual:baseline
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Configurar CI/CD** para execução automática
2. **Integrar com PRs** para aprovação de mudanças
3. **Configurar alertas** para regressões
4. **Expandir cobertura** para mais páginas
5. **Implementar testes de performance** visual

## 📞 **SUPORTE**

Para dúvidas ou problemas:
1. Verificar logs em `tests/visual/reports/`
2. Executar em modo debug: `npm run test:visual:debug`
3. Verificar configurações em `tests/visual/config/`

---

**Implementado com ❤️ para KorLab Nutri**
