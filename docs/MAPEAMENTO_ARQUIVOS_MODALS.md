# 📋 Mapeamento Completo de Arquivos de Modals

## 🗂️ Arquivos Encontrados

### 1. **InlineFoodSearch.tsx**
- **Local:** `src/components/platform/InlineFoodSearch.tsx`
- **Usado em:** `PlatformMealPlanEditor.tsx`
- **Rota:** `/platform/:clientId/planos-alimentares/novo` (Criar novo plano)
- **Função:** Busca inline rápida (não é modal)
- **Status:** ✅ MANTER - Funcionalidade diferente

### 2. **AddFoodModal.tsx**
- **Local:** `src/components/platform/AddFoodModal.tsx`
- **Usado em:** `PlatformMealPlanEditor.tsx`
- **Rota:** `/platform/:clientId/planos-alimentares/novo` (Criar novo plano)
- **Função:** Modal de adicionar alimento (NOVO - criado por nós)
- **Status:** ✅ MANTER - É o arquivo que acabamos de criar

### 3. **AddFoodToMealModal.tsx**
- **Local:** `src/components/platform/AddFoodToMealModal.tsx`
- **Usado em:** `PlatformMealPlanViewer.tsx`
- **Rota:** `/platform/:clientId/planos-alimentares/:planId` (Visualizar plano existente)
- **Função:** Modal para adicionar alimento em plano existente
- **Depende de:** `AddCustomFoodModal.tsx`
- **Status:** ⚠️ SUBSTITUIR - Este é o modal antigo com categorias

### 4. **CategoryBrowser.tsx**
- **Local:** `src/components/platform/CategoryBrowser.tsx`
- **Usado em:** NENHUM (removemos do editor)
- **Função:** Sistema antigo de navegação por categorias
- **Status:** ❌ PODE DELETAR - Não está sendo usado

### 5. **AddCustomFoodModal.tsx**
- **Local:** `src/components/platform/AddCustomFoodModal.tsx`
- **Usado em:** `AddFoodToMealModal.tsx`
- **Função:** Modal para adicionar alimentos customizados
- **Status:** ✅ MANTER - É usado pelo viewer

### 6. **FoodCategoryIcons.tsx**
- **Local:** `src/components/icons/FoodCategoryIcons.tsx`
- **Função:** Ícones de categorias de alimentos
- **Status:** ⚠️ VERIFICAR - Pode estar sendo usado pelo AddFoodToMealModal

---

## 🎯 Páginas e Seus Modals

### Página 1: **Editor de Novo Plano** (PlatformMealPlanEditor)
**Rota:** `/platform/:clientId/planos-alimentares/novo`

**Imports:**
```typescript
import { InlineFoodSearch } from '@/components/platform/InlineFoodSearch';
import { AddFoodModal } from '@/components/platform/AddFoodModal';
```

**Modals Usados:**
- ✅ `InlineFoodSearch` - Busca inline (não é modal)
- ✅ `AddFoodModal` - Modal novo que criamos
- ✅ `QuickPortionDialog` - Para configurar porções

**Status:** ✅ **JÁ ESTÁ CORRETO** - Usando o modal novo

---

### Página 2: **Visualizador de Plano** (PlatformMealPlanViewer)
**Rota:** `/platform/:clientId/planos-alimentares/:planId`

**Imports:**
```typescript
import { AddFoodToMealModal } from '@/components/platform/AddFoodToMealModal';
```

**Modals Usados:**
- ⚠️ `AddFoodToMealModal` - **ESTE É O ANTIGO COM CATEGORIAS**

**Status:** ⚠️ **PRECISA SER SUBSTITUÍDO**

---

## 🔧 Plano de Ação

### ✅ O QUE JÁ ESTÁ CORRETO:
1. **PlatformMealPlanEditor** já usa o modal novo (`AddFoodModal`)
2. Modal novo funciona perfeitamente com busca direta
3. `InlineFoodSearch` é componente separado (não conflita)

### ⚠️ O QUE PRECISA SER CORRIGIDO:
1. **PlatformMealPlanViewer** ainda usa `AddFoodToMealModal` (antigo com categorias)
2. Este é o arquivo que aparece na screenshot do usuário
3. Precisamos substituir o conteúdo de `AddFoodToMealModal.tsx`

### ❌ O QUE PODE SER DELETADO:
1. `CategoryBrowser.tsx` - Não está sendo usado em nenhum lugar

---

## 🎯 Solução Final

### PASSO 1: Verificar AddFoodToMealModal
- Abrir `src/components/platform/AddFoodToMealModal.tsx`
- Verificar se tem o sistema de categorias antigo
- Se tiver, substituir pelo código moderno

### PASSO 2: Manter Props Compatíveis
O `AddFoodToMealModal` precisa manter as props que o `PlatformMealPlanViewer` espera:
```typescript
interface AddFoodToMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (item: any) => void;
}
```

### PASSO 3: NÃO Deletar
- ✅ `AddFoodModal.tsx` - Usado no editor
- ✅ `AddFoodToMealModal.tsx` - Usado no viewer (só substituir conteúdo)
- ✅ `AddCustomFoodModal.tsx` - Dependência do viewer
- ✅ `InlineFoodSearch.tsx` - Busca inline
- ✅ `FoodCategoryIcons.tsx` - Pode ser usado

### PASSO 4: Pode Deletar com Segurança
- ❌ `CategoryBrowser.tsx` - Não usado em nenhum lugar

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────┐
│ CRIAR NOVO PLANO (PlatformMealPlanEditor)          │
├─────────────────────────────────────────────────────┤
│ ✅ InlineFoodSearch (busca inline)                  │
│ ✅ AddFoodModal (modal novo - OK!)                  │
│ ✅ QuickPortionDialog (configurar porções)          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ VISUALIZAR PLANO (PlatformMealPlanViewer)          │
├─────────────────────────────────────────────────────┤
│ ⚠️  AddFoodToMealModal (ANTIGO - precisa corrigir!)│
│    └─ Usa AddCustomFoodModal (manter)              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ NÃO USADO                                           │
├─────────────────────────────────────────────────────┤
│ ❌ CategoryBrowser (pode deletar)                   │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Conclusão

**O problema:** O usuário está vendo o modal antigo porque está usando o **PlatformMealPlanViewer** (visualizar plano existente), não o **PlatformMealPlanEditor** (criar novo plano).

**A solução:** Substituir o conteúdo de `AddFoodToMealModal.tsx` pelo código moderno, mantendo as props compatíveis com o que o viewer espera.

**Arquivos seguros para deletar:** Apenas `CategoryBrowser.tsx`
