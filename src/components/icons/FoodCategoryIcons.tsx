import { 
  UtensilsCrossed, 
  Wine, 
  Beef, 
  Wheat, 
  Apple, 
  Droplet,
  Bean,
  Milk,
  Package,
  Nut,
  ShoppingBag,
  Egg,
  Fish,
  Candy,
  Pill,
  Leaf
} from 'lucide-react';

export const FoodCategoryIcons = {
  'Alimentos preparados': UtensilsCrossed,
  'Bebidas (alcoólicas e não alcoólicas)': Wine,
  'Carnes e derivados': Beef,
  'Cereais e derivados': Wheat,
  'Frutas e derivados': Apple,
  'Gorduras e óleos': Droplet,
  'Leguminosas e derivados': Bean,
  'Leite e derivados': Milk,
  'Miscelâneas': Package,
  'Nozes e sementes': Nut,
  'Outros alimentos industrializados': ShoppingBag,
  'Ovos e derivados': Egg,
  'Pescados e frutos do mar': Fish,
  'Produtos açucarados': Candy,
  'Suplementos': Pill,
  'Verduras, hortaliças e derivados': Leaf,
};

export const getCategoryIcon = (categoryName: string) => {
  return FoodCategoryIcons[categoryName as keyof typeof FoodCategoryIcons] || Package;
};
