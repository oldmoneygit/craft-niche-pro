import { Package, Pill } from 'lucide-react';

// Baseado no site de referência da Tabela TACO Online
// Todas as categorias usam o ícone de Package, exceto Suplementos que usa Pill
export const FoodCategoryIcons = {
  'Alimentos preparados': Package,
  'Bebidas (alcoólicas e não alcoólicas)': Package,
  'Carnes e derivados': Package,
  'Cereais e derivados': Package,
  'Frutas e derivados': Package,
  'Gorduras e óleos': Package,
  'Leguminosas e derivados': Package,
  'Leite e derivados': Package,
  'Miscelâneas': Package,
  'Nozes e sementes': Package,
  'Outros alimentos industrializados': Package,
  'Ovos e derivados': Package,
  'Pescados e frutos do mar': Package,
  'Produtos açucarados': Package,
  'Suplementos': Pill,
  'Verduras, hortaliças e derivados': Package,
};

export const getCategoryIcon = (categoryName: string) => {
  return FoodCategoryIcons[categoryName as keyof typeof FoodCategoryIcons] || Package;
};
