import { useState } from 'react';
import { 
  FileText, HelpCircle, BookOpen, Package, 
  MessageCircle, Plus, Edit, Trash2, TrendingUp
} from 'lucide-react';
import './BaseConhecimento.css';

type Category = 'faq' | 'policies' | 'educational' | 'services' | 'tone';
type Filter = 'all' | 'most-used' | 'recent';

interface KnowledgeItem {
  id: string;
  category: Category;
  title: string;
  description: string;
  tags: string[];
  usageCount: number;
}

export function BaseConhecimento() {
  const [activeCategory, setActiveCategory] = useState<Category>('faq');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const categories = [
    { id: 'faq' as Category, name: 'Perguntas Frequentes', count: 5, icon: HelpCircle },
    { id: 'policies' as Category, name: 'Políticas e Regras', count: 2, icon: FileText },
    { id: 'educational' as Category, name: 'Conteúdo Educativo', count: 1, icon: BookOpen },
    { id: 'services' as Category, name: 'Serviços', count: 1, icon: Package },
    { id: 'tone' as Category, name: 'Tom de Voz', count: 1, icon: MessageCircle }
  ];

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      category: 'faq',
      title: 'Frutas à noite engordam?',
      description: 'Não! Frutas à noite não engordam mais do que em qualquer outro horário. O que realmente importa é o total de calorias que você consome durante o dia todo. Se você está dentro das suas necessidades calóricas, pode comer frutas à noite tranquilamente. Na verdade, frutas são ótimas opções para sobremesa ou lanche noturno!',
      tags: ['frutas', 'noite', 'engorda', 'carboidrato', 'banana', 'maçã'],
      usageCount: 4
    },
    {
      id: '2',
      category: 'services',
      title: 'Plano Alimentar Personalizado',
      description: 'Monto seu plano alimentar 100% personalizado considerando: - Seus objetivos (emagrecer, ganhar massa, saúde) - Sua rotina (trabalho, treino, horários) - Suas preferências (não coloco comida que você não gosta!) - Restrições alimentares - Seu orçamento O plano inclui: - Café, almoço, jantar e lanches - Lista de compras - Dicas de preparo - Sugestões de substituições Você recebe tudo por WhatsApp e e-mail!',
      tags: ['plano alimentar', 'cardápio', 'dieta', 'alimentação', 'refeições'],
      usageCount: 4
    },
    {
      id: '3',
      category: 'faq',
      title: 'Preciso comer antes e depois do treino?',
      description: 'Depende do seu objetivo e intensidade do treino. Para treinos leves (caminhada, yoga), não é obrigatório. Para treinos intensos, uma refeição leve 1-2h antes ajuda na performance. Depois do treino, é importante se alimentar em até 2h para recuperação muscular. Mas não precisa ser exatamente nos minutos seguintes - seu corpo não vai catabolizar se você não comer imediatamente!',
      tags: ['pré treino', 'pós treino', 'treino', 'academia', 'musculação', 'performance'],
      usageCount: 3
    }
  ];

  const getCategoryIcon = (categoryId: Category) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || FileText;
  };

  const handleAddKnowledge = () => {
    console.log('Add knowledge');
  };

  const handleEdit = (id: string) => {
    console.log('Edit:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete:', id);
  };

  return (
    <div className="base-conhecimento-page">
      {/* Header */}
      <div className="kb-header">
        <div className="header-content">
          <h1>
            <FileText size={32} />
            Base de Conhecimento
          </h1>
          <p>Ensine sua assistente a responder como você responderia</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddKnowledge}>
            <Plus size={18} />
            Adicionar Conhecimento
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className={`category-card ${category.id} ${
                activeCategory === category.id ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <div className="category-icon">
                <Icon size={20} />
              </div>
              <div className="category-name">{category.name}</div>
              <div className="category-count">{category.count}</div>
            </div>
          );
        })}
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Conteúdos Cadastrados</h2>
          <div className="section-filter">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Todos
            </button>
            <button
              className={`filter-btn ${activeFilter === 'most-used' ? 'active' : ''}`}
              onClick={() => setActiveFilter('most-used')}
            >
              Mais usados
            </button>
            <button
              className={`filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveFilter('recent')}
            >
              Recentes
            </button>
          </div>
        </div>

        <div className="content-list">
          {knowledgeItems.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const categoryName = categories.find(c => c.id === item.category)?.name;

            return (
              <div key={item.id} className={`content-item ${item.category}`}>
                <div className="content-header">
                  <div className="content-meta">
                    <div className="content-category">
                      <CategoryIcon size={14} />
                      {categoryName}
                    </div>
                    <div className="usage-badge">
                      <TrendingUp size={12} />
                      Usada {item.usageCount}x pela IA
                    </div>
                  </div>
                  <div className="content-actions">
                    <button className="icon-btn" onClick={() => handleEdit(item.id)}>
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="content-title">{item.title}</h3>
                <p className="content-description">{item.description}</p>

                <div className="content-tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
