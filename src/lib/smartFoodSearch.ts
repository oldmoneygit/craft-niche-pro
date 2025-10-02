import { supabase } from '@/integrations/supabase/client';
import { getMappedFoodName, normalizeText } from './foodMapping';

export interface FoodSearchResult {
  id: string;
  name: string;
  energy_kcal: number;
  protein_g: number;
  carbohydrate_g: number;
  lipid_g: number;
  source: string;
}

export const smartFoodSearch = async (
  aiSuggestion: string
): Promise<FoodSearchResult | null> => {
  console.log(`🔍 Buscando: "${aiSuggestion}"`);

  const mappedName = getMappedFoodName(aiSuggestion);
  if (mappedName) {
    console.log(`  📋 Mapeado para: "${mappedName}"`);

    const { data } = await supabase
      .from('foods')
      .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
      .ilike('name', mappedName)
      .limit(1)
      .single();

    if (data) {
      console.log(`  ✅ Encontrado via mapeamento: ${data.name}`);
      return data;
    }
  }

  const normalized = normalizeText(aiSuggestion);
  const keywords = normalized.split(' ').filter(w => w.length > 2);

  console.log(`  🔑 Keywords: ${keywords.join(', ')}`);

  for (const keyword of keywords) {
    const { data } = await supabase
      .from('foods')
      .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
      .ilike('name', `%${keyword}%`)
      .limit(1);

    if (data && data.length > 0) {
      console.log(`  ✅ Encontrado via keyword "${keyword}": ${data[0].name}`);
      return data[0];
    }
  }

  const { data: tacoData } = await supabase
    .from('foods')
    .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
    .or('source.ilike.%TACO%,source.ilike.%TBCA%')
    .ilike('name', `%${keywords[0]}%`)
    .limit(1);

  if (tacoData && tacoData.length > 0) {
    console.log(`  ✅ Encontrado TACO: ${tacoData[0].name}`);
    return tacoData[0];
  }

  const firstWord = keywords[0];
  if (firstWord) {
    const { data } = await supabase
      .from('foods')
      .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
      .ilike('name', `${firstWord}%`)
      .limit(1);

    if (data && data.length > 0) {
      console.log(`  ⚠️ Encontrado genérico: ${data[0].name}`);
      return data[0];
    }
  }

  console.log(`  ❌ NÃO ENCONTRADO: ${aiSuggestion}`);
  return null;
};
