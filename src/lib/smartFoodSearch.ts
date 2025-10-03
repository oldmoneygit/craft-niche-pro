import { supabase } from '@/integrations/supabase/client';

export interface FoodSearchResult {
  id: string;
  name: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  lipid_g: number;
  source: string;
}

const EXACT_FOOD_MAP: Record<string, string[]> = {
  'Pão, forma, integral': ['Pão, forma, integral', 'pao forma integral', 'pao integral'],
  'Pão, francês': ['Pão, francês', 'pao frances'],

  'Ovo, cozido': ['Ovo, cozido', 'ovo cozido', 'ovo'],

  'Banana, prata': ['Banana, prata', 'banana'],
  'Maçã': ['Maçã', 'maca'],
  'Mamão': ['Mamão', 'mamao'],
  'Laranja': ['Laranja'],

  'Leite, vaca, desnatado': ['Leite, vaca, desnatado', 'leite desnatado'],
  'Leite, vaca, integral': ['Leite, vaca, integral', 'leite integral', 'leite'],
  'Iogurte, natural': ['Iogurte, natural', 'iogurte natural', 'iogurte'],

  'Arroz, integral, cozido': ['Arroz, integral, cozido', 'arroz integral'],
  'Arroz, branco, cozido': ['Arroz, branco, cozido', 'arroz branco', 'arroz'],
  'Feijão, carioca, cozido': ['Feijão, carioca, cozido', 'feijao carioca'],
  'Feijão, preto, cozido': ['Feijão, preto, cozido', 'feijao preto'],
  'Macarrão, cozido': ['Macarrão, cozido', 'macarrao'],
  'Aveia, flocos': ['Aveia, flocos', 'aveia'],

  'Frango, peito, grelhado': ['Frango, peito, grelhado', 'frango peito', 'peito de frango', 'frango'],
  'Carne, bovina, sem gordura': ['Carne, bovina, sem gordura', 'carne bovina', 'carne'],

  'Alface': ['Alface', 'alface americana'],
  'Tomate': ['Tomate'],
  'Cenoura, crua': ['Cenoura, crua', 'cenoura'],
  'Brócolis, cozido': ['Brócolis, cozido', 'brocolis'],

  'Batata, cozida': ['Batata, cozida', 'batata'],
  'Azeite de oliva': ['Azeite de oliva', 'azeite'],
  'Queijo, minas': ['Queijo, minas', 'queijo minas', 'queijo']
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const smartFoodSearch = async (
  aiSuggestion: string
): Promise<FoodSearchResult | null> => {
  console.log(`🔍 Buscando: "${aiSuggestion}"`);

  const normalized = normalizeText(aiSuggestion);

  for (const [tacoName, variations] of Object.entries(EXACT_FOOD_MAP)) {
    for (const variation of variations) {
      if (normalizeText(variation) === normalized ||
          normalized.includes(normalizeText(variation)) ||
          normalizeText(variation).includes(normalized)) {

        console.log(`  📋 Mapeado para TACO: "${tacoName}"`);

        const { data, error } = await supabase
          .from('foods')
          .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
          .ilike('name', tacoName)
          .or('source.ilike.%TACO%,source.ilike.%TBCA%')
          .limit(1);

        if (error) {
          console.log(`  ⚠️ Erro Supabase:`, error.message);
          continue;
        }

        if (data && data.length > 0) {
          const food = data[0];
          console.log(`  ✅ Encontrado: ${food.name} (${food.energy_kcal} kcal/100g)`);
          return food;
        }
      }
    }
  }

  console.log(`  ❌ NÃO MAPEADO: "${aiSuggestion}"`);
  return null;
};
