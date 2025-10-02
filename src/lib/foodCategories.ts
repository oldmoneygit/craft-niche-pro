export const FOOD_CATEGORIES = [
  {
    name: 'Alimentos preparados',
    slug: 'alimentos-preparados',
    icon: '🍱',
  },
  {
    name: 'Bebidas (alcoólicas e não alcoólicas)',
    slug: 'bebidas',
    icon: '🥤',
  },
  {
    name: 'Carnes e derivados',
    slug: 'carnes-derivados',
    icon: '🥩',
  },
  {
    name: 'Cereais e derivados',
    slug: 'cereais-derivados',
    icon: '🌾',
  },
  {
    name: 'Frutas e derivados',
    slug: 'frutas-derivados',
    icon: '🍎',
  },
  {
    name: 'Gorduras e óleos',
    slug: 'gorduras-oleos',
    icon: '🫒',
  },
  {
    name: 'Leguminosas e derivados',
    slug: 'leguminosas-derivados',
    icon: '🫘',
  },
  {
    name: 'Leite e derivados',
    slug: 'leite-derivados',
    icon: '🥛',
  },
  {
    name: 'Miscelâneas',
    slug: 'miscelaneas',
    icon: '🍽️',
  },
  {
    name: 'Nozes e sementes',
    slug: 'nozes-sementes',
    icon: '🥜',
  },
  {
    name: 'Outros alimentos industrializados',
    slug: 'industrializados',
    icon: '📦',
  },
  {
    name: 'Ovos e derivados',
    slug: 'ovos-derivados',
    icon: '🥚',
  },
  {
    name: 'Pescados e frutos do mar',
    slug: 'pescados-frutos-mar',
    icon: '🐟',
  },
  {
    name: 'Produtos açucarados',
    slug: 'produtos-acucarados',
    icon: '🍯',
  },
  {
    name: 'Suplementos',
    slug: 'suplementos',
    icon: '💊',
  },
  {
    name: 'Verduras, hortaliças e derivados',
    slug: 'verduras-hortalicas',
    icon: '🥬',
  },
];

export const getCategoryIcon = (categoryName: string): string => {
  const category = FOOD_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName?.toLowerCase()
  );
  return category?.icon || '🍽️';
};
