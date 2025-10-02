export interface MealTemplateItem {
  food_name: string;
  search_terms: string[];
  quantity: number;
  measure_name: string;
  category: 'base' | 'protein' | 'vegetable' | 'fruit' | 'dairy' | 'fat';
  optional?: boolean;
}

export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  target_kcal: number;
  items: MealTemplateItem[];
  tags: string[];
}

export const MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: 'cafe-classico',
    name: 'Café Clássico Brasileiro',
    description: 'Pão, ovos, café com leite e fruta',
    meal_type: 'breakfast',
    target_kcal: 400,
    items: [
      {
        food_name: 'Pão francês',
        search_terms: ['pao frances', 'pao', 'pão francês'],
        quantity: 1,
        measure_name: 'unidade',
        category: 'base'
      },
      {
        food_name: 'Ovo cozido',
        search_terms: ['ovo cozido', 'ovo'],
        quantity: 2,
        measure_name: 'unidade',
        category: 'protein'
      },
      {
        food_name: 'Café com leite',
        search_terms: ['cafe com leite', 'leite'],
        quantity: 1,
        measure_name: 'xícara',
        category: 'dairy'
      },
      {
        food_name: 'Banana',
        search_terms: ['banana'],
        quantity: 1,
        measure_name: 'unidade',
        category: 'fruit'
      }
    ],
    tags: ['tradicional', 'brasileiro']
  },
  {
    id: 'cafe-fit',
    name: 'Café Fitness',
    description: 'Aveia, frutas, iogurte e castanhas',
    meal_type: 'breakfast',
    target_kcal: 380,
    items: [
      {
        food_name: 'Aveia',
        search_terms: ['aveia'],
        quantity: 3,
        measure_name: 'colher de sopa',
        category: 'base'
      },
      {
        food_name: 'Iogurte natural',
        search_terms: ['iogurte natural', 'iogurte'],
        quantity: 1,
        measure_name: 'pote',
        category: 'dairy'
      },
      {
        food_name: 'Morango',
        search_terms: ['morango'],
        quantity: 5,
        measure_name: 'unidade',
        category: 'fruit'
      },
      {
        food_name: 'Castanha',
        search_terms: ['castanha', 'castanha do para'],
        quantity: 3,
        measure_name: 'unidade',
        category: 'fat'
      }
    ],
    tags: ['saudavel', 'fitness', 'rico-fibra']
  },
  {
    id: 'almoco-executivo',
    name: 'Almoço Executivo',
    description: 'Arroz, feijão, frango e salada',
    meal_type: 'lunch',
    target_kcal: 650,
    items: [
      {
        food_name: 'Arroz branco',
        search_terms: ['arroz branco', 'arroz'],
        quantity: 4,
        measure_name: 'colher de sopa',
        category: 'base'
      },
      {
        food_name: 'Feijão preto',
        search_terms: ['feijao preto', 'feijão'],
        quantity: 1,
        measure_name: 'concha',
        category: 'protein'
      },
      {
        food_name: 'Peito de frango',
        search_terms: ['frango peito', 'peito de frango', 'frango'],
        quantity: 1,
        measure_name: 'filé',
        category: 'protein'
      },
      {
        food_name: 'Alface',
        search_terms: ['alface'],
        quantity: 3,
        measure_name: 'folha',
        category: 'vegetable'
      },
      {
        food_name: 'Tomate',
        search_terms: ['tomate'],
        quantity: 4,
        measure_name: 'rodela',
        category: 'vegetable'
      }
    ],
    tags: ['tradicional', 'brasileiro', 'balanceado']
  },
  {
    id: 'almoco-lowcarb',
    name: 'Almoço Low Carb',
    description: 'Carne, legumes e verduras',
    meal_type: 'lunch',
    target_kcal: 550,
    items: [
      {
        food_name: 'Carne bovina',
        search_terms: ['carne bovina', 'carne'],
        quantity: 1,
        measure_name: 'bife',
        category: 'protein'
      },
      {
        food_name: 'Brócolis',
        search_terms: ['brocolis', 'brócolis'],
        quantity: 1,
        measure_name: 'xícara',
        category: 'vegetable'
      },
      {
        food_name: 'Couve-flor',
        search_terms: ['couve flor', 'couve-flor'],
        quantity: 1,
        measure_name: 'xícara',
        category: 'vegetable'
      },
      {
        food_name: 'Azeite',
        search_terms: ['azeite'],
        quantity: 1,
        measure_name: 'colher de sopa',
        category: 'fat'
      }
    ],
    tags: ['low-carb', 'rico-proteina']
  },
  {
    id: 'jantar-leve',
    name: 'Jantar Leve',
    description: 'Sopa de legumes com frango',
    meal_type: 'dinner',
    target_kcal: 450,
    items: [
      {
        food_name: 'Sopa de legumes',
        search_terms: ['sopa legumes', 'sopa'],
        quantity: 1,
        measure_name: 'prato',
        category: 'base'
      },
      {
        food_name: 'Frango desfiado',
        search_terms: ['frango desfiado', 'frango'],
        quantity: 3,
        measure_name: 'colher de sopa',
        category: 'protein'
      }
    ],
    tags: ['leve', 'facil-digestao']
  },
  {
    id: 'jantar-tradicional',
    name: 'Jantar Tradicional',
    description: 'Arroz, carne e salada',
    meal_type: 'dinner',
    target_kcal: 580,
    items: [
      {
        food_name: 'Arroz integral',
        search_terms: ['arroz integral', 'arroz'],
        quantity: 3,
        measure_name: 'colher de sopa',
        category: 'base'
      },
      {
        food_name: 'Carne moída',
        search_terms: ['carne moida', 'carne'],
        quantity: 2,
        measure_name: 'colher de sopa',
        category: 'protein'
      },
      {
        food_name: 'Salada verde',
        search_terms: ['alface', 'salada'],
        quantity: 1,
        measure_name: 'prato',
        category: 'vegetable'
      }
    ],
    tags: ['tradicional', 'balanceado']
  },
  {
    id: 'lanche-fruta',
    name: 'Lanche de Fruta',
    description: 'Fruta com oleaginosas',
    meal_type: 'afternoon_snack',
    target_kcal: 150,
    items: [
      {
        food_name: 'Maçã',
        search_terms: ['maca', 'maçã'],
        quantity: 1,
        measure_name: 'unidade',
        category: 'fruit'
      },
      {
        food_name: 'Amendoim',
        search_terms: ['amendoim'],
        quantity: 10,
        measure_name: 'unidade',
        category: 'fat'
      }
    ],
    tags: ['pratico', 'natural']
  }
];

export const getTemplatesByMealType = (mealType: string) => {
  return MEAL_TEMPLATES.filter(t => t.meal_type === mealType);
};

export const getTemplatesByCalorieRange = (minKcal: number, maxKcal: number) => {
  return MEAL_TEMPLATES.filter(t => t.target_kcal >= minKcal && t.target_kcal <= maxKcal);
};
