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

const calculateMatchScore = (
  aiSuggestion: string,
  foodName: string,
  keywords: string[]
): number => {
  const normAi = normalizeText(aiSuggestion);
  const normFood = normalizeText(foodName);

  let score = 100;

  const criticalPenalties: Record<string, number> = {
    'pó': -200,
    'po': -200,
    'instantaneo': -200,
    'instantâneo': -200,
    'extrato': -150,
    'concentrado': -150,
    'tablete': -150,
    'desidratado': -150,
    'liofilizado': -150,
    'codorna': -100,
    'pata': -100,
    'purê': -80,
    'pure': -80,
    'gema': -80,
    'clara': -60,
    'molho': -40
  };

  for (const [word, penalty] of Object.entries(criticalPenalties)) {
    if (normFood.includes(word)) {
      score += penalty;
      console.log(`      ⚠️ Penalidade "${word}": ${penalty}`);
    }
  }

  const aiHasCozido = normAi.includes('cozido') || normAi.includes('cozida');
  const foodHasCozido = normFood.includes('cozido') || normFood.includes('cozida');
  const aiHasCru = normAi.includes('cru') || normAi.includes('crua');
  const foodHasCru = normFood.includes('cru') || normFood.includes('crua');

  if (aiHasCozido && foodHasCozido) {
    score += 50;
    console.log(`      ✅ Match preparo: cozido`);
  } else if (aiHasCru && foodHasCru) {
    score += 30;
    console.log(`      ✅ Match preparo: cru`);
  } else if (aiHasCozido && foodHasCru) {
    score -= 80;
    console.log(`      ❌ Mismatch: pediu cozido, achou cru`);
  } else if (aiHasCru && foodHasCozido) {
    score -= 80;
    console.log(`      ❌ Mismatch: pediu cru, achou cozido`);
  }

  if (!aiHasCozido && !aiHasCru) {
    const needsCooking = ['carne', 'frango', 'peixe', 'macarrão', 'macarrao', 'arroz', 'feijão', 'feijao', 'batata'];
    const needsCookingMatch = needsCooking.some(food => normAi.includes(food));

    if (needsCookingMatch && foodHasCozido) {
      score += 40;
      console.log(`      ✅ Assumiu cozido (correto)`);
    } else if (needsCookingMatch && foodHasCru) {
      score -= 60;
      console.log(`      ❌ Encontrou cru (não ideal)`);
    }
  }

  const matchedKeywords = keywords.filter(kw => normFood.includes(kw)).length;
  score += matchedKeywords * 20;

  const lengthDiff = Math.abs(normAi.length - normFood.length);
  score -= lengthDiff * 0.3;

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
