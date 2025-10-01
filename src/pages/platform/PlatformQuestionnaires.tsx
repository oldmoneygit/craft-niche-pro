import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Send, Eye, Trash2, Copy, X, Edit, FileText, Calendar, ChevronDown } from 'lucide-react';
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
  scorable?: boolean;
  weight?: number;
  optionScores?: Record<string, number>;
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
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
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

  const loadWeeklyFeedbackTemplate = () => {
    const feedbackQuestions: Question[] = [
      {
        id: '1',
        type: 'text',
        question: 'Qual seu nome completo?',
        required: true
      },
      {
        id: '2',
        type: 'scale',
        question: 'Como você avalia sua semana em relação à dieta? (1 = Péssima, 10 = Excelente)',
        required: true,
        scorable: true,
        weight: 5
      },
      {
        id: '3',
        type: 'radio',
        question: 'Você conseguiu seguir o plano alimentar?',
        options: ['Sim, 100%', 'Sim, mais de 70%', 'Sim, entre 50-70%', 'Menos de 50%', 'Não consegui seguir'],
        required: true,
        scorable: true,
        weight: 8,
        optionScores: {
          'Sim, 100%': 100,
          'Sim, mais de 70%': 80,
          'Sim, entre 50-70%': 60,
          'Menos de 50%': 30,
          'Não consegui seguir': 0
        }
      },
      {
        id: '4',
        type: 'checkbox',
        question: 'Quais dificuldades você teve esta semana? (marque todas que se aplicam)',
        options: [
          'Nenhuma dificuldade',
          'Fome entre as refeições',
          'Dificuldade em preparar as refeições',
          'Falta de tempo',
          'Comer fora de casa',
          'Ansiedade/compulsão',
          'Custo dos alimentos',
          'Eventos sociais',
          'Outra'
        ],
        required: true,
        scorable: true,
        weight: 3,
        optionScores: {
          'Nenhuma dificuldade': 100,
          'Fome entre as refeições': 60,
          'Dificuldade em preparar as refeições': 50,
          'Falta de tempo': 50,
          'Comer fora de casa': 40,
          'Ansiedade/compulsão': 30,
          'Custo dos alimentos': 50,
          'Eventos sociais': 40,
          'Outra': 50
        }
      },
      {
        id: '5',
        type: 'textarea',
        question: 'Se marcou "Outra" ou quer detalhar alguma dificuldade, explique aqui:',
        required: false
      },
      {
        id: '6',
        type: 'radio',
        question: 'Como está seu nível de energia durante o dia?',
        options: ['Muito baixo', 'Baixo', 'Normal', 'Bom', 'Excelente'],
        required: true,
        scorable: true,
        weight: 4,
        optionScores: {
          'Muito baixo': 0,
          'Baixo': 25,
          'Normal': 50,
          'Bom': 75,
          'Excelente': 100
        }
      },
      {
        id: '7',
        type: 'radio',
        question: 'Como está seu sono?',
        options: ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'],
        required: true,
        scorable: true,
        weight: 4,
        optionScores: {
          'Péssimo': 0,
          'Ruim': 25,
          'Regular': 50,
          'Bom': 75,
          'Excelente': 100
        }
      },
      {
        id: '8',
        type: 'textarea',
        question: 'Há algo no plano alimentar que você gostaria de mudar ou ajustar?',
        required: false
      },
      {
        id: '9',
        type: 'radio',
        question: 'Você sentiu algum sintoma diferente esta semana?',
        options: ['Não', 'Sim, leve', 'Sim, moderado', 'Sim, forte'],
        required: true
      },
      {
        id: '10',
        type: 'textarea',
        question: 'Se sentiu sintomas, descreva quais:',
        required: false
      },
      {
        id: '11',
        type: 'scale',
        question: 'Qual sua motivação para continuar? (1 = Nenhuma, 10 = Muito motivado)',
        required: true,
        scorable: true,
        weight: 6
      },
      {
        id: '12',
        type: 'textarea',
        question: 'Observações adicionais ou dúvidas:',
        required: false
      }
    ];

    setFormData({
      title: 'Feedback Semanal - Acompanhamento',
      description: 'Questionário semanal para avaliar como você está se sentindo e adaptar melhor o seu plano alimentar às suas necessidades.',
      questions: feedbackQuestions
    });

    setIsCreating(true);

    toast({
      title: "Template Carregado",
      description: "Questionário de feedback semanal com pontuação automática"
    });
  };

  // TEMPLATE 1: Avaliação Inicial
  const loadTemplate1_AvaliacaoInicial = () => {
    setFormData({
      title: 'Avaliação Nutricional Completa',
      description: 'Questionário inicial para conhecer melhor você e criar um plano personalizado.',
      questions: [
        { id: '1', type: 'text', question: 'Qual seu nome completo?', required: true },
        { id: '2', type: 'text', question: 'Qual sua idade?', required: true },
        { id: '3', type: 'textarea', question: 'Descreva sua rotina diária (horários de trabalho, estudo, etc)', required: true },
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
          question: 'Quais refeições você costuma fazer?',
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
          question: 'Possui alguma restrição alimentar?',
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
          question: 'Qual sua motivação para continuar? (1 = Nenhuma, 10 = Muito motivado)',
          required: true
        },
        {
          id: '13',
          type: 'textarea',
          question: 'Tem alguma dúvida ou observação adicional?',
          required: false
        }
      ]
    });
    setIsCreating(true);
    toast({ title: "Template carregado", description: "Avaliação Inicial Completa" });
  };

  // TEMPLATE 3: Acompanhamento Mensal
  const loadTemplate3_AcompanhamentoMensal = () => {
    setFormData({
      title: 'Acompanhamento Mensal',
      description: 'Avaliação mensal da sua evolução e resultados.',
      questions: [
        { id: '1', type: 'text', question: 'Qual seu peso atual? (kg)', required: true },
        {
          id: '2',
          type: 'radio',
          question: 'Como você avalia seu progresso no último mês?',
          options: ['Excelente', 'Bom', 'Regular', 'Pouco progresso', 'Nenhum progresso'],
          required: true
        },
        {
          id: '3',
          type: 'scale',
          question: 'Nível de satisfação com os resultados (1-10):',
          required: true
        },
        {
          id: '4',
          type: 'textarea',
          question: 'Quais foram suas maiores conquistas este mês?',
          required: true
        },
        {
          id: '5',
          type: 'textarea',
          question: 'Quais foram seus maiores desafios?',
          required: true
        },
        {
          id: '6',
          type: 'radio',
          question: 'Você notou mudanças na sua disposição?',
          options: ['Sim, melhorou muito', 'Sim, melhorou um pouco', 'Sem mudanças', 'Piorou'],
          required: true
        },
        {
          id: '7',
          type: 'radio',
          question: 'Você notou mudanças no seu sono?',
          options: ['Sim, melhorou muito', 'Sim, melhorou um pouco', 'Sem mudanças', 'Piorou'],
          required: true
        },
        {
          id: '8',
          type: 'checkbox',
          question: 'Em quais áreas você gostaria de focar no próximo mês?',
          options: ['Perda de peso', 'Ganho de massa', 'Energia', 'Sono', 'Hidratação', 'Reduzir açúcar'],
          required: true
        },
        {
          id: '9',
          type: 'scale',
          question: 'Motivação para o próximo mês (1-10):',
          required: true
        },
        {
          id: '10',
          type: 'textarea',
          question: 'Observações finais:',
          required: false
        }
      ]
    });
    setIsCreating(true);
    toast({ title: "Template carregado", description: "Acompanhamento Mensal" });
  };

  // TEMPLATE 4: Hábitos de Sono
  const loadTemplate4_AvaliacaoHabitosSono = () => {
    setFormData({
      title: 'Avaliação de Hábitos de Sono e Recuperação',
      description: 'Entenda como seu sono e rotina noturna impactam seus resultados.',
      questions: [
        {
          id: '1',
          type: 'text',
          question: 'Que horas você costuma dormir?',
          required: true
        },
        {
          id: '2',
          type: 'text',
          question: 'Que horas você costuma acordar?',
          required: true
        },
        {
          id: '3',
          type: 'radio',
          question: 'Quantas horas você dorme por noite em média?',
          options: ['Menos de 5h', '5-6h', '6-7h', '7-8h', 'Mais de 8h'],
          required: true
        },
        {
          id: '4',
          type: 'radio',
          question: 'Como você classifica a qualidade do seu sono?',
          options: ['Péssima', 'Ruim', 'Regular', 'Boa', 'Excelente'],
          required: true
        },
        {
          id: '5',
          type: 'checkbox',
          question: 'Você tem dificuldade para:',
          options: ['Adormecer', 'Manter o sono', 'Acordar no meio da noite', 'Acordar cedo demais', 'Nenhuma dificuldade'],
          required: true
        },
        {
          id: '6',
          type: 'radio',
          question: 'Você usa telas (celular, TV) antes de dormir?',
          options: ['Sim, sempre', 'Sim, às vezes', 'Raramente', 'Nunca'],
          required: true
        },
        {
          id: '7',
          type: 'radio',
          question: 'Você consome cafeína? Se sim, até que horas?',
          options: ['Não consumo', 'Só pela manhã', 'Até meio-dia', 'Até 15h', 'Depois das 15h'],
          required: true
        },
        {
          id: '8',
          type: 'textarea',
          question: 'Descreva sua rotina antes de dormir:',
          required: false
        }
      ]
    });
    setIsCreating(true);
    toast({ title: "Template carregado", description: "Avaliação de Sono e Recuperação" });
  };

  // TEMPLATE 5: Saúde Intestinal
  const loadTemplate5_SaudeIntestinal = () => {
    setFormData({
      title: 'Avaliação de Saúde Intestinal',
      description: 'Questionário focado em sintomas digestivos e saúde intestinal.',
      questions: [
        {
          id: '1',
          type: 'radio',
          question: 'Com que frequência você vai ao banheiro?',
          options: ['Menos de 3x por semana', '3-6x por semana', '1x por dia', '2-3x por dia', 'Mais de 3x por dia'],
          required: true
        },
        {
          id: '2',
          type: 'radio',
          question: 'Como você descreveria suas fezes? (Escala de Bristol)',
          options: ['Muito duras (tipo 1-2)', 'Normais (tipo 3-4)', 'Moles/pastosas (tipo 5-6)', 'Líquidas (tipo 7)'],
          required: true
        },
        {
          id: '3',
          type: 'checkbox',
          question: 'Você sente algum destes sintomas?',
          options: ['Nenhum', 'Gases', 'Inchaço abdominal', 'Dor abdominal', 'Azia', 'Refluxo', 'Náusea'],
          required: true
        },
        {
          id: '4',
          type: 'radio',
          question: 'Com que frequência você sente gases/inchaço?',
          options: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
          required: true
        },
        {
          id: '5',
          type: 'checkbox',
          question: 'Quais alimentos parecem piorar seus sintomas?',
          options: ['Nenhum', 'Laticínios', 'Glúten/trigo', 'Leguminosas', 'Verduras cruas', 'Frituras', 'Doces'],
          required: false
        },
        {
          id: '6',
          type: 'radio',
          question: 'Você toma probióticos?',
          options: ['Sim, regularmente', 'Sim, às vezes', 'Não'],
          required: true
        },
        {
          id: '7',
          type: 'text',
          question: 'Quantas porções de frutas/vegetais você come por dia?',
          required: true
        },
        {
          id: '8',
          type: 'radio',
          question: 'Você consome alimentos fermentados? (iogurte, kefir, kombucha)',
          options: ['Sim, diariamente', 'Sim, algumas vezes por semana', 'Raramente', 'Nunca'],
          required: true
        },
        {
          id: '9',
          type: 'radio',
          question: 'Você já foi diagnosticado com alguma condição intestinal?',
          options: ['Não', 'Síndrome do intestino irritável', 'Doença de Crohn', 'Colite', 'Intolerâncias', 'Outra'],
          required: true
        },
        {
          id: '10',
          type: 'textarea',
          question: 'Se sim, qual? Detalhe:',
          required: false
        },
        {
          id: '11',
          type: 'textarea',
          question: 'Observações sobre sua saúde intestinal:',
          required: false
        }
      ]
    });
    setIsCreating(true);
    toast({ title: "Template carregado", description: "Avaliação de Saúde Intestinal" });
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
          {/* Dropdown de templates */}
          <div className="relative">
            <Button
              onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
              variant="outline"
              className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Templates Prontos
              <ChevronDown className={`w-4 h-4 transition-transform ${showTemplatesDropdown ? 'rotate-180' : ''}`} />
            </Button>
            
            {showTemplatesDropdown && (
              <>
                {/* Backdrop para fechar ao clicar fora */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowTemplatesDropdown(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-xl min-w-[280px] z-20 max-h-[400px] overflow-y-auto">
                  <button
                    onClick={() => {
                      loadTemplate1_AvaliacaoInicial();
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">📋 Avaliação Inicial Completa</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">13 perguntas • Conhecimento geral do paciente</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      loadWeeklyFeedbackTemplate();
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">📊 Feedback Semanal</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">12 perguntas</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full font-bold">
                        COM PONTUAÇÃO
                      </span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      loadTemplate3_AcompanhamentoMensal();
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">📅 Acompanhamento Mensal</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">10 perguntas • Avaliação de progresso</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      loadTemplate4_AvaliacaoHabitosSono();
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">😴 Hábitos de Sono</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">8 perguntas • Qualidade do sono e recuperação</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      loadTemplate5_SaudeIntestinal();
                      setShowTemplatesDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <p className="font-medium text-gray-900 dark:text-gray-100">🦠 Saúde Intestinal</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">11 perguntas • Sintomas digestivos</p>
                  </button>
                </div>
              </>
            )}
          </div>

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
                  {formData.questions.map((q, index) => {
                    const getQuestionIcon = (type: string) => {
                      switch (type) {
                        case 'text': return '✍️';
                        case 'textarea': return '📝';
                        case 'radio': return '🔘';
                        case 'checkbox': return '☑️';
                        case 'scale': return '📊';
                        default: return '❓';
                      }
                    };

                    const getQuestionTypeLabel = (type: string) => {
                      switch (type) {
                        case 'text': return 'Resposta Curta';
                        case 'textarea': return 'Resposta Longa';
                        case 'radio': return 'Múltipla Escolha';
                        case 'checkbox': return 'Caixas de Seleção';
                        case 'scale': return 'Escala 1-10';
                        default: return 'Desconhecido';
                      }
                    };

                    return (
                      <div key={q.id} className="border-2 rounded-lg p-4 space-y-3 bg-background hover:shadow-md transition">
                        {/* Header da pergunta com ícone */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getQuestionIcon(q.type)}</span>
                            <div>
                              <span className="text-sm font-bold text-foreground">Pergunta {index + 1}</span>
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                {getQuestionTypeLabel(q.type)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(q.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                      {/* Campo da pergunta */}
                      <input
                        value={q.question}
                        onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                        placeholder="Digite a pergunta..."
                        className="w-full border-2 border-input rounded-lg p-3 text-sm font-medium bg-background focus:border-primary"
                      />

                      {/* Tipo e obrigatória */}
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={q.type}
                          onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                          className="border-2 border-input rounded-lg p-2 text-sm bg-background"
                        >
                          <option value="text">Resposta curta</option>
                          <option value="textarea">Resposta longa</option>
                          <option value="radio">Múltipla escolha</option>
                          <option value="checkbox">Caixas de seleção</option>
                          <option value="scale">Escala (1-10)</option>
                        </select>

                        <label className="flex items-center gap-2 text-sm border-2 border-input rounded-lg p-2 cursor-pointer hover:bg-muted">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                            className="w-4 h-4"
                          />
                          Obrigatória
                        </label>
                      </div>

                      {/* Opções (apenas para radio/checkbox) */}
                      {(q.type === 'radio' || q.type === 'checkbox') && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Opções (separadas por vírgula):
                          </label>
                          <input
                            placeholder="Ex: Sim, Não, Talvez"
                            defaultValue={q.options?.join(', ') || ''}
                            onBlur={e => {
                              const options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
                              updateQuestion(q.id, 'options', options);
                            }}
                            className="w-full border-2 border-input rounded-lg p-2 text-sm bg-background"
                          />
                        </div>
                      )}

                      {/* ===== SEÇÃO DE PONTUAÇÃO (MELHORADA) ===== */}
                      <div className="border-t-2 pt-3 mt-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={q.scorable || false}
                            onChange={e => {
                              updateQuestion(q.id, 'scorable', e.target.checked);
                              if (e.target.checked && !q.weight) {
                                updateQuestion(q.id, 'weight', 5);
                              }
                            }}
                            className="w-5 h-5 cursor-pointer"
                          />
                          <div>
                            <span className="font-semibold text-foreground group-hover:text-primary">
                              Esta pergunta conta pontos
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Ative para incluir no cálculo da pontuação final
                            </p>
                          </div>
                        </label>

                        {/* Configuração de pontuação (aparece se ativado) */}
                        {q.scorable && (
                          <div className="mt-3 space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            {/* Peso da pergunta */}
                            <div>
                              <label className="block text-sm font-bold text-foreground mb-2">
                                Peso da pergunta: {q.weight || 5}
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Baixo</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={q.weight || 5}
                                  onChange={e => updateQuestion(q.id, 'weight', parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="text-xs text-muted-foreground">Alto</span>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                                  {q.weight || 5}/10
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Quanto maior o peso, mais esta pergunta impacta na nota final
                              </p>
                            </div>

                            {/* Pontuação por opção (radio/checkbox) */}
                            {(q.type === 'radio' || q.type === 'checkbox') && q.options && q.options.length > 0 && (
                              <div>
                                <label className="block text-sm font-bold text-foreground mb-2">
                                  Pontuação de cada opção (0-100):
                                </label>
                                <div className="space-y-2">
                                  {q.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border">
                                      <span className="text-sm flex-1 text-foreground">{option}</span>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={q.optionScores?.[option] || 0}
                                        onChange={e => {
                                          const newScores = { ...(q.optionScores || {}) };
                                          newScores[option] = parseInt(e.target.value) || 0;
                                          updateQuestion(q.id, 'optionScores', newScores);
                                        }}
                                        className="w-20 border-2 border-input rounded px-2 py-1 text-sm font-bold text-center focus:border-blue-500 bg-background"
                                        placeholder="0-100"
                                      />
                                      <span className="text-xs text-muted-foreground">pts</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground bg-white dark:bg-gray-800 rounded p-2">
                                  <strong>Dica:</strong> 100 = Ótimo • 70-90 = Bom • 40-60 = Neutro • 0-30 = Ruim
                                </div>
                              </div>
                            )}

                            {/* Para tipo escala */}
                            {q.type === 'scale' && (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                                <p className="text-sm text-foreground">
                                  <strong>Escala 1-10:</strong> Automaticamente convertida em 0-100 pontos
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ex: Resposta "8" = 80 pontos
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}

                  {formData.questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma pergunta adicionada ainda
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview de pontuação */}
            {formData.questions.some(q => q.scorable) && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
                <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                  📊 Resumo da Pontuação
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">
                    <strong>{formData.questions.filter(q => q.scorable).length}</strong> perguntas contam pontos
                  </p>
                  <p className="text-foreground">
                    Peso total: <strong>{formData.questions.filter(q => q.scorable).reduce((sum, q) => sum + (q.weight || 0), 0)}</strong>
                  </p>
                  <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-muted-foreground">
                      A pontuação final será calculada automaticamente e mostrada como porcentagem (0-100%)
                    </p>
                  </div>
                </div>
              </div>
            )}

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
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/questionario/preview/${q.id}`, '_blank')}
                className="flex items-center justify-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/platform/${clientId}/questionarios/${q.id}/respostas`)}
                className="flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Respostas
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
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
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
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
