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

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text);

  const stopWords = ['de', 'da', 'do', 'com', 'sem', 'em', 'a', 'o', 'crua', 'cru', 'cozido', 'cozida', 'assado', 'assada', 'grelhado', 'grelhada'];

  const words = normalized
    .split(' ')
    .filter(w => w.length > 2 && !stopWords.includes(w));

  return words;
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);

  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');

  const commonWords = words1.filter(w => words2.includes(w)).length;
  const totalWords = Math.max(words1.length, words2.length);

  return commonWords / totalWords;
};

export const smartFoodSearch = async (
  aiSuggestion: string
): Promise<FoodSearchResult | null> => {
  console.log(`🔍 Buscando: "${aiSuggestion}"`);

  const keywords = extractKeywords(aiSuggestion);
  console.log(`  🔑 Keywords: ${keywords.join(', ')}`);

  if (keywords.length === 0) {
    console.log(`  ❌ Nenhuma keyword válida`);
    return null;
  }

  const mainKeyword = keywords[0];

  const { data: candidates, error } = await supabase
    .from('foods')
    .select('id, name, energy_kcal, protein_g, carbohydrate_g, lipid_g, source')
    .ilike('name', `%${mainKeyword}%`)
    .or('source.ilike.%TACO%,source.ilike.%TBCA%')
    .limit(20);

  if (error || !candidates || candidates.length === 0) {
    console.log(`  ❌ Nenhum candidato encontrado para "${mainKeyword}"`);
    return null;
  }

  console.log(`  📊 ${candidates.length} candidatos encontrados`);

  const ranked = candidates
    .map(food => ({
      ...food,
      similarity: calculateSimilarity(aiSuggestion, food.name),
      keywordMatches: keywords.filter(kw =>
        normalizeText(food.name).includes(kw)
      ).length
    }))
    .sort((a, b) => {
      if (b.keywordMatches !== a.keywordMatches) {
        return b.keywordMatches - a.keywordMatches;
      }
      return b.similarity - a.similarity;
    });

  const best = ranked[0];

  console.log(`  ✅ Melhor match: "${best.name}"`);
  console.log(`     Similaridade: ${Math.round(best.similarity * 100)}%`);
  console.log(`     Keywords: ${best.keywordMatches}/${keywords.length}`);

  if (best.keywordMatches > 0) {
    return {
      id: best.id,
      name: best.name,
      energy_kcal: best.energy_kcal,
      protein_g: best.protein_g,
      carbohydrate_g: best.carbohydrate_g,
      lipid_g: best.lipid_g,
      source: best.source
    };
  }

  console.log(`  ❌ Nenhum match adequado`);
  return null;
};
