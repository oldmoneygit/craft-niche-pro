export const restaurantData = {
  id: 'rest-001',
  name: 'Sabor & Arte Delivery',
  owner: 'Chef Carlos Mendes',
  type: 'restaurante',
  phone: '(11) 94567-8901',
  email: 'contato@saborarte.com.br',
  address: 'Rua das Delícias, 123 - Vila Gourmet, São Paulo - SP',
  avatar: '/placeholder.svg',
  businessHours: {
    seg: '18:00 - 23:30',
    ter: '18:00 - 23:30',
    qua: '18:00 - 23:30',
    qui: '18:00 - 23:30',
    sex: '18:00 - 00:30',
    sab: '12:00 - 00:30',
    dom: '12:00 - 23:00'
  },
  deliveryZones: ['Vila Madalena', 'Pinheiros', 'Jardins', 'Itaim', 'Vila Olímpia'],
  avgDeliveryTime: '35-45 min',
  minOrderValue: 25.00,
  deliveryFee: 8.90
};

export const menuCategories = [
  {
    id: 'entradas',
    name: 'Entradas',
    icon: '🥗',
    items: [
      {
        id: 'entrada-1',
        name: 'Bruschetta Artesanal',
        description: 'Pão italiano tostado com tomate, manjericão e mozzarella de búfala',
        price: 18.90,
        image: '/placeholder.svg',
        popular: true,
        preparationTime: '10-15 min'
      },
      {
        id: 'entrada-2',
        name: 'Carpaccio de Salmão',
        description: 'Salmão fresco em fatias finas com alcaparras e molho de mostarda',
        price: 32.90,
        image: '/placeholder.svg',
        preparationTime: '5-10 min'
      }
    ]
  },
  {
    id: 'principais',
    name: 'Pratos Principais',
    icon: '🍝',
    items: [
      {
        id: 'prato-1',
        name: 'Risotto de Camarão',
        description: 'Arroz arbóreo cremoso com camarões grelhados e aspargos frescos',
        price: 42.90,
        image: '/placeholder.svg',
        popular: true,
        preparationTime: '25-30 min'
      },
      {
        id: 'prato-2',
        name: 'Filé à Parmegiana',
        description: 'Filé mignon empanado com molho de tomate e queijo derretido',
        price: 48.90,
        image: '/placeholder.svg',
        preparationTime: '20-25 min'
      },
      {
        id: 'prato-3',
        name: 'Salmão Grelhado',
        description: 'Salmão grelhado com risotto de limão siciliano e legumes salteados',
        price: 45.90,
        image: '/placeholder.svg',
        preparationTime: '20-25 min'
      }
    ]
  },
  {
    id: 'massas',
    name: 'Massas',
    icon: '🍜',
    items: [
      {
        id: 'massa-1',
        name: 'Espaguete à Carbonara',
        description: 'Massa artesanal com bacon, ovos, parmesão e pimenta do reino',
        price: 28.90,
        image: '/placeholder.svg',
        popular: true,
        preparationTime: '15-20 min'
      },
      {
        id: 'massa-2',
        name: 'Lasanha da Casa',
        description: 'Lasanha de carne com molho bechamel e queijo derretido',
        price: 35.90,
        image: '/placeholder.svg',
        preparationTime: '30-35 min'
      }
    ]
  },
  {
    id: 'sobremesas',
    name: 'Sobremesas',
    icon: '🍰',
    items: [
      {
        id: 'sobremesa-1',
        name: 'Tiramisu Tradicional',
        description: 'Sobremesa italiana com café, mascarpone e cacau em pó',
        price: 16.90,
        image: '/placeholder.svg',
        preparationTime: '5 min'
      },
      {
        id: 'sobremesa-2',
        name: 'Petit Gateau',
        description: 'Bolinho de chocolate quente com sorvete de baunilha',
        price: 19.90,
        image: '/placeholder.svg',
        popular: true,
        preparationTime: '10-12 min'
      }
    ]
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    icon: '🥤',
    items: [
      {
        id: 'bebida-1',
        name: 'Suco Natural Laranja',
        description: 'Suco de laranja natural espremido na hora (500ml)',
        price: 8.90,
        image: '/placeholder.svg',
        preparationTime: '2-3 min'
      },
      {
        id: 'bebida-2',
        name: 'Água com Gás',
        description: 'Água mineral com gás (500ml)',
        price: 4.50,
        image: '/placeholder.svg',
        preparationTime: '1 min'
      },
      {
        id: 'bebida-3',
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná ou Fanta (350ml)',
        price: 5.90,
        image: '/placeholder.svg',
        preparationTime: '1 min'
      }
    ]
  }
];

export const recentOrders = [
  {
    id: 'PED-001',
    customer: 'Marina Santos',
    phone: '(11) 98765-4321',
    address: 'Rua Augusta, 456 - Vila Madalena',
    items: [
      { name: 'Risotto de Camarão', quantity: 1, price: 42.90 },
      { name: 'Petit Gateau', quantity: 1, price: 19.90 }
    ],
    total: 71.70,
    status: 'preparing',
    orderTime: '2024-01-15T19:30:00',
    estimatedDelivery: '2024-01-15T20:15:00',
    paymentMethod: 'PIX'
  },
  {
    id: 'PED-002',
    customer: 'Roberto Silva',
    phone: '(11) 99876-5432',
    address: 'Av. Paulista, 789 - Jardins',
    items: [
      { name: 'Filé à Parmegiana', quantity: 1, price: 48.90 },
      { name: 'Espaguete à Carbonara', quantity: 1, price: 28.90 },
      { name: 'Suco Natural Laranja', quantity: 2, price: 17.80 }
    ],
    total: 104.50,
    status: 'ready',
    orderTime: '2024-01-15T19:15:00',
    estimatedDelivery: '2024-01-15T20:00:00',
    paymentMethod: 'Cartão de Crédito'
  },
  {
    id: 'PED-003',
    customer: 'Ana Costa',
    phone: '(11) 91234-5678',
    address: 'Rua dos Pinheiros, 321 - Pinheiros',
    items: [
      { name: 'Lasanha da Casa', quantity: 2, price: 71.80 },
      { name: 'Tiramisu Tradicional', quantity: 2, price: 33.80 }
    ],
    total: 114.50,
    status: 'delivered',
    orderTime: '2024-01-15T18:45:00',
    deliveredAt: '2024-01-15T19:25:00',
    paymentMethod: 'Dinheiro'
  },
  {
    id: 'PED-004',
    customer: 'Carlos Oliveira',
    phone: '(11) 95555-1234',
    address: 'Rua Bela Vista, 159 - Itaim',
    items: [
      { name: 'Salmão Grelhado', quantity: 1, price: 45.90 },
      { name: 'Bruschetta Artesanal', quantity: 1, price: 18.90 }
    ],
    total: 73.70,
    status: 'out_for_delivery',
    orderTime: '2024-01-15T19:00:00',
    estimatedDelivery: '2024-01-15T19:50:00',
    paymentMethod: 'PIX'
  }
];

export const restaurantAnalytics = {
  today: {
    revenue: 2847.30,
    orders: 47,
    avgOrderValue: 60.50,
    topItem: 'Risotto de Camarão'
  },
  thisWeek: {
    revenue: 18350.40,
    orders: 298,
    avgOrderValue: 61.60,
    newCustomers: 34
  },
  thisMonth: {
    revenue: 67890.20,
    orders: 1124,
    avgOrderValue: 60.40,
    customerRetention: 72
  },
  peakHours: [
    { hour: '19:00', orders: 12 },
    { hour: '20:00', orders: 18 },
    { hour: '21:00', orders: 15 },
    { hour: '22:00', orders: 9 }
  ],
  topItems: [
    { name: 'Risotto de Camarão', orders: 89, revenue: 3816.10 },
    { name: 'Filé à Parmegiana', orders: 76, revenue: 3716.40 },
    { name: 'Espaguete à Carbonara', orders: 94, revenue: 2716.60 },
    { name: 'Petit Gateau', orders: 67, revenue: 1333.30 }
  ],
  deliveryZones: [
    { zone: 'Vila Madalena', orders: 78, avgTime: '32 min' },
    { zone: 'Pinheiros', orders: 65, avgTime: '28 min' },
    { zone: 'Jardins', orders: 54, avgTime: '38 min' },
    { zone: 'Itaim', orders: 43, avgTime: '35 min' }
  ]
};

export const customerReviews = [
  {
    id: 'rev-1',
    customer: 'Marina Santos',
    rating: 5,
    comment: 'Risotto de camarão estava perfeito! Entrega rápida e comida quentinha.',
    date: '2024-01-15',
    orderId: 'PED-001'
  },
  {
    id: 'rev-2',
    customer: 'Roberto Silva',
    rating: 4,
    comment: 'Filé à parmegiana muito saboroso. Só demorou um pouquinho mais que o esperado.',
    date: '2024-01-14',
    orderId: 'PED-025'
  },
  {
    id: 'rev-3',
    customer: 'Ana Costa',
    rating: 5,
    comment: 'Lasanha estava divina! Já virei cliente fiel. Recomendo!',
    date: '2024-01-13',
    orderId: 'PED-018'
  }
];