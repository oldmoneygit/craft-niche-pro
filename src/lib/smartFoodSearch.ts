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
    .replace(/[,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text);
  const stopWords = ['de', 'da', 'do', 'com', 'sem', 'em', 'a', 'o', 'crua', 'cru', 'cozido', 'cozida', 'assado', 'assada', 'grelhado', 'grelhada', 'frito', 'frita'];

  return normalized
    .split(' ')
    .filter(w => w.length > 2 && !stopWords.includes(w));
};

const calculateMatchScore = (aiSuggestion: string, foodName: string, keywords: string[]): number => {
  const normAi = normalizeText(aiSuggestion);
  const normFood = normalizeText(foodName);

  let score = 100;

  const unwantedWords = ['instantaneo', 'po', 'extrato', 'tablete', 'codorna', 'seca', 'seco', 'desidratado', 'liofilizado', 'concentrado', 'industrializado'];
  for (const unwanted of unwantedWords) {
    if (normFood.includes(unwanted)) {
      score -= 40;
    }
  }

  const matchedKeywords = keywords.filter(kw => normFood.includes(kw)).length;
  score += matchedKeywords * 20;

  const lengthDiff = Math.abs(normAi.length - normFood.length);
  score -= lengthDiff * 0.5;

  return score;
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
    .limit(30);

  if (error || !candidates || candidates.length === 0) {
    console.log(`  ❌ Nenhum candidato para "${mainKeyword}"`);
    return null;
  }

  console.log(`  📊 ${candidates.length} candidatos encontrados`);

  const ranked = candidates
    .map(food => ({
      ...food,
      score: calculateMatchScore(aiSuggestion, food.name, keywords),
      keywordMatches: keywords.filter(kw =>
        normalizeText(food.name).includes(kw)
      ).length
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  console.log(`  ✅ Match: "${best.name}"`);
  console.log(`     Score: ${Math.round(best.score)}`);
  console.log(`     Keywords: ${best.keywordMatches}/${keywords.length}`);

  if (best.keywordMatches === 0 || best.score < 20) {
    console.log(`  ⚠️ Score muito baixo - rejeitado`);
    return null;
  }

  return {
    id: best.id,
    name: best.name,
    energy_kcal: best.energy_kcal,
    protein_g: best.protein_g,
    carbohydrate_g: best.carbohydrate_g,
    lipid_g: best.lipid_g,
    source: best.source
  };
};
