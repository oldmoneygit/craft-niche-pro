import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Send, Eye, Trash2, Copy, X, Edit, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientConfig } from '@/core/contexts/ClientConfigContext';

const QUESTIONNAIRE_TEMPLATES = [
  {
    title: "Avaliação de Hábitos Alimentares Completa",
    description: "Questionário completo para avaliar rotina alimentar do paciente",
    questions: [
      {
        id: '1',
        type: 'text',
        question: 'Qual seu objetivo principal com a nutrição?',
        required: true
      },
      {
        id: '2',
        type: 'textarea',
        question: 'Descreva sua rotina alimentar típica (café, almoço, jantar, lanches)',
        required: true
      },
      {
        id: '3',
        type: 'radio',
        question: 'Quantas refeições você faz por dia?',
        options: ['1-2 refeições', '3-4 refeições', '5-6 refeições', 'Mais de 6 refeições'],
        required: true
      },
      {
        id: '4',
        type: 'checkbox',
        question: 'Marque os alimentos que você consome diariamente:',
        options: ['Frutas', 'Verduras/Legumes', 'Cereais integrais', 'Proteínas', 'Laticínios', 'Doces/Açúcar', 'Refrigerantes', 'Fast food'],
        required: true
      },
      {
        id: '5',
        type: 'scale',
        question: 'Em uma escala de 1 a 10, como você avalia sua alimentação atual?',
        required: true
      },
      {
        id: '6',
        type: 'radio',
        question: 'Você pratica atividade física regularmente?',
        options: ['Sim, todos os dias', 'Sim, 3-4x por semana', 'Sim, 1-2x por semana', 'Não pratico'],
        required: true
      },
      {
        id: '7',
        type: 'checkbox',
        question: 'Marque se você tem alguma restrição alimentar:',
        options: ['Lactose', 'Glúten', 'Vegetariano/Vegano', 'Alergia a frutos do mar', 'Alergia a oleaginosas', 'Diabetes', 'Nenhuma'],
        required: false
      },
      {
        id: '8',
        type: 'textarea',
        question: 'Existe algum alimento que você não gosta ou não consome?',
        required: false
      },
      {
        id: '9',
        type: 'scale',
        question: 'Quanta água você bebe por dia? (1=menos de 500ml, 10=mais de 3 litros)',
        required: true
      },
      {
        id: '10',
        type: 'text',
        question: 'Você toma algum suplemento ou medicação?',
        required: false
      }
    ]
  },
  {
    title: "Frequência Alimentar Rápida",
    description: "Avaliação rápida de consumo alimentar semanal",
    questions: [
      {
        id: '1',
        type: 'radio',
        question: 'Com que frequência você consome FRUTAS?',
        options: ['Todos os dias', '3-5x por semana', '1-2x por semana', 'Raramente', 'Nunca'],
        required: true
      },
      {
        id: '2',
        type: 'radio',
        question: 'Com que frequência você consome VERDURAS/LEGUMES?',
        options: ['Todos os dias', '3-5x por semana', '1-2x por semana', 'Raramente', 'Nunca'],
        required: true
      },
      {
        id: '3',
        type: 'radio',
        question: 'Com que frequência você consome FAST FOOD?',
        options: ['Todos os dias', '3-5x por semana', '1-2x por semana', 'Raramente', 'Nunca'],
        required: true
      },
      {
        id: '4',
        type: 'radio',
        question: 'Com que frequência você consome DOCES/AÇÚCAR?',
        options: ['Todos os dias', '3-5x por semana', '1-2x por semana', 'Raramente', 'Nunca'],
        required: true
      },
      {
        id: '5',
        type: 'radio',
        question: 'Com que frequência você consome REFRIGERANTES?',
        options: ['Todos os dias', '3-5x por semana', '1-2x por semana', 'Raramente', 'Nunca'],
        required: true
      }
    ]
  },
  {
    title: "Recordatório 24 Horas Simplificado",
    description: "O que o paciente consumiu nas últimas 24 horas",
    questions: [
      {
        id: '1',
        type: 'textarea',
        question: 'CAFÉ DA MANHÃ - O que você comeu/bebeu?',
        required: true
      },
      {
        id: '2',
        type: 'text',
        question: 'CAFÉ DA MANHÃ - Que horas foi?',
        required: true
      },
      {
        id: '3',
        type: 'textarea',
        question: 'LANCHE DA MANHÃ - O que você comeu/bebeu?',
        required: false
      },
      {
        id: '4',
        type: 'textarea',
        question: 'ALMOÇO - O que você comeu/bebeu?',
        required: true
      },
      {
        id: '5',
        type: 'text',
        question: 'ALMOÇO - Que horas foi?',
        required: true
      },
      {
        id: '6',
        type: 'textarea',
        question: 'LANCHE DA TARDE - O que você comeu/bebeu?',
        required: false
      },
      {
        id: '7',
        type: 'textarea',
        question: 'JANTAR - O que você comeu/bebeu?',
        required: true
      },
      {
        id: '8',
        type: 'text',
        question: 'JANTAR - Que horas foi?',
        required: true
      },
      {
        id: '9',
        type: 'textarea',
        question: 'CEIA/LANCHE NOTURNO - O que você comeu/bebeu?',
        required: false
      }
    ]
  },
  {
    title: "Avaliação de Satisfação - Retorno",
    description: "Para pacientes em acompanhamento avaliarem evolução",
    questions: [
      {
        id: '1',
        type: 'scale',
        question: 'Como você avalia sua evolução desde a última consulta? (1=nenhuma evolução, 10=excelente evolução)',
        required: true
      },
      {
        id: '2',
        type: 'radio',
        question: 'Você conseguiu seguir o plano alimentar?',
        options: ['Sim, 100%', 'Sim, na maior parte do tempo', 'Parcialmente', 'Pouco', 'Não consegui'],
        required: true
      },
      {
        id: '3',
        type: 'checkbox',
        question: 'Quais foram suas maiores dificuldades?',
        options: ['Falta de tempo', 'Falta de planejamento', 'Ansiedade', 'Eventos sociais', 'Falta de ingredientes', 'Sabor das refeições', 'Quantidade de comida', 'Nenhuma dificuldade'],
        required: true
      },
      {
        id: '4',
        type: 'textarea',
        question: 'Conte como foi sua experiência seguindo o plano:',
        required: false
      },
      {
        id: '5',
        type: 'scale',
        question: 'Nível de satisfação com o atendimento (1=muito insatisfeito, 10=muito satisfeito)',
        required: true
      },
      {
        id: '6',
        type: 'textarea',
        question: 'Sugestões ou comentários adicionais:',
        required: false
      }
    ]
  }
];

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale';
  question: string;
  options?: string[];
  required: boolean;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  active: boolean;
  created_at: string;
}

export const PlatformQuestionnaires = () => {
  const { tenantId } = useTenantId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const clientConfig = useClientConfig();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewingQuestionnaire, setViewingQuestionnaire] = useState<Questionnaire | null>(null);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [] as Question[]
  });

  useEffect(() => {
    if (tenantId) fetchQuestionnaires();
  }, [tenantId]);

  const fetchQuestionnaires = async () => {
    if (!tenantId) return;

    const { data, error } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questionnaires:', error);
    } else {
      setQuestionnaires((data || []) as unknown as Questionnaire[]);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      question: '',
      required: true
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const removeQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== id)
    });
  };

  const handleCreate = async () => {
    if (!tenantId || !formData.title || formData.questions.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e adicione pelo menos 1 pergunta",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from('questionnaires').insert({
      tenant_id: tenantId,
      title: formData.title,
      description: formData.description || '',
      questions: formData.questions as any
    });

    if (error) {
      console.error('Error creating questionnaire:', error);
      toast({ title: "Erro", description: "Não foi possível criar", variant: "destructive" });
    } else {
      toast({ title: "Criado!", description: "Questionário criado com sucesso" });
      setFormData({ title: '', description: '', questions: [] });
      setIsCreating(false);
      fetchQuestionnaires();
    }
  };

  const loadExampleQuestionnaire = () => {
    const exampleQuestions: Question[] = [
      {
        id: '1',
        type: 'text',
        question: 'Qual seu nome completo?',
        required: true
      },
      {
        id: '2',
        type: 'text',
        question: 'Qual sua idade?',
        required: true
      },
      {
        id: '3',
        type: 'textarea',
        question: 'Descreva sua rotina diária (horários de trabalho, estudo, etc)',
        required: true
      },
      {
        id: '4',
        type: 'radio',
        question: 'Qual seu principal objetivo?',
        options: ['Emagrecimento', 'Ganho de massa muscular', 'Melhora de saúde', 'Manutenção de peso'],
        required: true
      },
      {
        id: '5',
        type: 'checkbox',
        question: 'Quais refeições você costuma fazer? (pode marcar várias)',
        options: ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'],
        required: true
      },
      {
        id: '6',
        type: 'scale',
        question: 'De 1 a 10, como você avalia sua alimentação atual?',
        required: true
      },
      {
        id: '7',
        type: 'radio',
        question: 'Você pratica atividade física?',
        options: ['Não pratico', '1-2x por semana', '3-4x por semana', '5x ou mais por semana'],
        required: true
      },
      {
        id: '8',
        type: 'checkbox',
        question: 'Possui alguma restrição alimentar? (marque todas que se aplicam)',
        options: ['Nenhuma', 'Intolerância à lactose', 'Alergia a glúten', 'Vegetariano', 'Vegano', 'Diabetes', 'Hipertensão'],
        required: false
      },
      {
        id: '9',
        type: 'textarea',
        question: 'Liste os alimentos que você NÃO gosta ou não come',
        required: false
      },
      {
        id: '10',
        type: 'text',
        question: 'Quantos litros de água você bebe por dia?',
        required: true
      },
      {
        id: '11',
        type: 'radio',
        question: 'Com que frequência você come fora de casa?',
        options: ['Nunca', '1-2x por semana', '3-4x por semana', 'Diariamente'],
        required: true
      },
      {
        id: '12',
        type: 'scale',
        question: 'Numa escala de 1 a 10, quão comprometido você está em mudar seus hábitos?',
        required: true
      }
    ];

    setFormData({
      title: 'Avaliação Nutricional Completa',
      description: 'Este questionário nos ajuda a entender melhor seus hábitos alimentares e criar um plano personalizado para você.',
      questions: exampleQuestions
    });

    setIsCreating(true);

    toast({
      title: "Template Carregado",
      description: "Questionário de exemplo pronto para usar"
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja deletar o questionário "${title}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // Deletar todas as respostas relacionadas primeiro
      const { error: responsesError } = await supabase
        .from('questionnaire_responses')
        .delete()
        .eq('questionnaire_id', id);

      if (responsesError) throw responsesError;

      // Deletar o questionário
      const { error } = await supabase
        .from('questionnaires')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deletado!",
        description: "Questionário removido com sucesso"
      });

      fetchQuestionnaires();

    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o questionário",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (questionnaire: any) => {
    setEditingQuestionnaire(questionnaire);
    setFormData({
      title: questionnaire.title,
      description: questionnaire.description || '',
      questions: questionnaire.questions
    });
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!editingQuestionnaire || !tenantId || !formData.title || formData.questions.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e adicione pelo menos 1 pergunta",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('questionnaires')
      .update({
        title: formData.title,
        description: formData.description,
        questions: formData.questions as any
      })
      .eq('id', editingQuestionnaire.id);

    if (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível atualizar", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Atualizado!", 
        description: "Questionário atualizado com sucesso" 
      });
      setFormData({ title: '', description: '', questions: [] });
      setIsEditing(false);
      setEditingQuestionnaire(null);
      fetchQuestionnaires();
    }
  };

  const generatePublicLink = async (questionnaireId: string) => {
    if (!tenantId) return;

    const publicToken = `${questionnaireId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase
      .from('questionnaire_responses')
      .insert({
        questionnaire_id: questionnaireId,
        client_id: null,
        tenant_id: tenantId,
        public_token: publicToken,
        answers: {},
        status: 'pending'
      });

    if (error) {
      console.error('Error generating link:', error);
      toast({ title: "Erro", description: "Não foi possível gerar link", variant: "destructive" });
      return;
    }

    const publicLink = `${window.location.origin}/responder/${publicToken}`;
    
    navigator.clipboard.writeText(publicLink);
    
    toast({
      title: "Link copiado!",
      description: "Envie este link para o paciente responder"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-7 h-7" />
            Questionários
          </h2>
          <p className="text-muted-foreground mt-1">
            Crie questionários personalizados para seus pacientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadExampleQuestionnaire}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Carregar Exemplo
          </Button>
          <Button
            onClick={() => setShowTemplates(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Usar Template
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar do Zero
          </Button>
        </div>
      </div>

      {/* Modal de Templates */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Escolha um Template</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTemplates(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUESTIONNAIRE_TEMPLATES.map((template, index) => (
                <div 
                  key={index}
                  className="border-2 border-border rounded-lg p-4 hover:border-primary cursor-pointer transition"
                  onClick={async () => {
                    const { error } = await supabase.from('questionnaires').insert({
                      tenant_id: tenantId,
                      title: template.title,
                      description: template.description,
                      questions: template.questions as any
                    });

                    if (error) {
                      toast({ 
                        title: "Erro", 
                        description: "Não foi possível criar", 
                        variant: "destructive" 
                      });
                    } else {
                      toast({ 
                        title: "Template criado!", 
                        description: `"${template.title}" adicionado aos seus questionários` 
                      });
                      setShowTemplates(false);
                      fetchQuestionnaires();
                    }
                  }}
                >
                  <h4 className="font-semibold mb-2">{template.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {template.questions.length} perguntas
                    </span>
                    <span className="text-primary font-medium">
                      Usar Template →
                    </span>
                  </div>
                  
                  {/* Preview das perguntas */}
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {template.questions.slice(0, 3).map((q, i) => (
                      <p key={i} className="text-xs text-muted-foreground truncate">
                        {i + 1}. {q.question}
                      </p>
                    ))}
                    {template.questions.length > 3 && (
                      <p className="text-xs text-muted-foreground/70">
                        + {template.questions.length - 3} perguntas
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowTemplates(false)}
              variant="outline"
              className="mt-6 w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {viewingQuestionnaire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{viewingQuestionnaire.title}</h3>
                {viewingQuestionnaire.description && (
                  <p className="text-sm text-muted-foreground mt-1">{viewingQuestionnaire.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingQuestionnaire(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6 mt-6">
              {viewingQuestionnaire.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium">
                        {question.question}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tipo: {
                          question.type === 'text' ? 'Resposta curta' :
                          question.type === 'textarea' ? 'Resposta longa' :
                          question.type === 'radio' ? 'Múltipla escolha' :
                          question.type === 'checkbox' ? 'Caixas de seleção' :
                          'Escala (1-10)'
                        }
                      </p>
                    </div>
                  </div>

                  {question.type === 'text' && (
                    <input
                      type="text"
                      disabled
                      placeholder="Resposta curta..."
                      className="w-full border rounded-lg p-2 bg-muted/50 text-sm"
                    />
                  )}

                  {question.type === 'textarea' && (
                    <textarea
                      disabled
                      placeholder="Resposta longa..."
                      rows={3}
                      className="w-full border rounded-lg p-2 bg-muted/50 text-sm"
                    />
                  )}

                  {question.type === 'radio' && question.options && (
                    <div className="space-y-2 mt-2">
                      {question.options.map((option, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm">
                          <input type="radio" disabled name={`q-${question.id}`} className="rounded-full" />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-2 mt-2">
                      {question.options.map((option, i) => (
                        <label key={i} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" disabled className="rounded" />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'scale' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>1</span>
                        <span>10</span>
                      </div>
                      <input
                        type="range"
                        disabled
                        min="1"
                        max="10"
                        defaultValue="5"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setViewingQuestionnaire(null)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => generatePublicLink(viewingQuestionnaire.id)}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Link Público
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{isEditing ? 'Editar Questionário' : 'Criar Questionário'}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setEditingQuestionnaire(null);
                  setFormData({ title: '', description: '', questions: [] });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Avaliação de Hábitos Alimentares"
                  className="w-full border rounded-lg p-2 bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Instruções para o paciente..."
                  rows={2}
                  className="w-full border rounded-lg p-2 bg-background"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Perguntas</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addQuestion}
                    className="text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Pergunta
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.questions.map((q, index) => (
                    <div key={q.id} className="border rounded-lg p-3 space-y-2 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Pergunta {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(q.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <input
                        value={q.question}
                        onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                        placeholder="Digite a pergunta..."
                        className="w-full border rounded-lg p-2 text-sm bg-background"
                      />

                      <div className="flex gap-2 flex-wrap">
                        <select
                          value={q.type}
                          onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                          className="border rounded-lg p-2 text-sm bg-background"
                        >
                          <option value="text">Resposta curta</option>
                          <option value="textarea">Resposta longa</option>
                          <option value="radio">Múltipla escolha</option>
                          <option value="checkbox">Caixas de seleção</option>
                          <option value="scale">Escala (1-10)</option>
                        </select>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                            className="rounded"
                          />
                          Obrigatória
                        </label>
                      </div>

                      {(q.type === 'radio' || q.type === 'checkbox') && (
                        <input
                          placeholder="Opções (separadas por vírgula)"
                          onChange={e => updateQuestion(q.id, 'options', e.target.value.split(',').map(o => o.trim()))}
                          className="w-full border rounded-lg p-2 text-sm bg-background"
                        />
                      )}
                    </div>
                  ))}

                  {formData.questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma pergunta adicionada ainda
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setEditingQuestionnaire(null);
                  setFormData({ title: '', description: '', questions: [] });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={isEditing ? handleUpdate : handleCreate}
                className="flex-1"
              >
                {isEditing ? 'Atualizar Questionário' : 'Criar Questionário'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Questionários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionnaires.map(q => (
          <div key={q.id} className="bg-card p-5 rounded-lg shadow border relative">
            {/* Botão deletar no canto */}
            <button
              onClick={() => handleDelete(q.id, q.title)}
              className="absolute top-3 right-3 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition"
              title="Deletar questionário"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <h3 className="font-semibold text-lg mb-1 pr-10">{q.title}</h3>
            {q.description && (
              <p className="text-sm text-muted-foreground mb-3">{q.description}</p>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              {q.questions.length} pergunta{q.questions.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/platform/${clientId}/questionarios/${q.id}/respostas`)}
                className="flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Respostas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingQuestionnaire(q)}
                className="flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(q)}
                className="flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                size="sm"
                onClick={() => generatePublicLink(q.id)}
                className="flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </div>
          </div>
        ))}

        {questionnaires.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum questionário criado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro questionário
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Questionário
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformQuestionnaires;
