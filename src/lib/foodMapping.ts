export const FOOD_NAME_MAP: Record<string, string> = {
  'pao frances': 'Pão, francês',
  'pao de forma': 'Pão, forma, trigo',
  'pao integral': 'Pão, forma, integral',
  'torrada': 'Torrada, pão',

  'arroz branco': 'Arroz, branco, cozido',
  'arroz integral': 'Arroz, integral, cozido',
  'arroz': 'Arroz, branco, cozido',

  'feijao preto': 'Feijão, preto, cozido',
  'feijao carioca': 'Feijão, carioca, cozido',
  'feijao': 'Feijão, carioca, cozido',

  'frango': 'Frango, peito, grelhado',
  'peito de frango': 'Frango, peito, grelhado',
  'carne bovina': 'Carne, bovina, sem gordura',
  'carne': 'Carne, bovina, sem gordura',
  'ovo': 'Ovo, cozido',
  'ovo cozido': 'Ovo, cozido',

  'leite': 'Leite, vaca, integral',
  'leite integral': 'Leite, vaca, integral',
  'leite desnatado': 'Leite, vaca, desnatado',
  'iogurte': 'Iogurte, natural',
  'queijo': 'Queijo, minas',
  'requeijao': 'Requeijão',

  'banana': 'Banana, prata',
  'maca': 'Maçã',
  'laranja': 'Laranja',
  'mamao': 'Mamão',

  'alface': 'Alface',
  'tomate': 'Tomate',
  'cenoura': 'Cenoura, crua',
  'brocolis': 'Brócolis, cozido',

  'amendoim': 'Amendoim, torrado',
  'castanha': 'Castanha-do-pará',

  'aveia': 'Aveia, flocos',
  'azeite': 'Azeite de oliva',
  'oleo': 'Óleo, soja',
  'batata': 'Batata, cozida',
  'macarrao': 'Macarrão, cozido',
  'biscoito': 'Biscoito, cream cracker'
};

export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getMappedFoodName = (aiSuggestion: string): string | null => {
  const normalized = normalizeText(aiSuggestion);

  if (FOOD_NAME_MAP[normalized]) {
    return FOOD_NAME_MAP[normalized];
  }

  for (const [key, value] of Object.entries(FOOD_NAME_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
};
