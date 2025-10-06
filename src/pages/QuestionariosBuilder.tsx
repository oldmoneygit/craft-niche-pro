import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BasicInfoCard } from '@/components/questionnaires/builder/BasicInfoCard';
import { QuestionsBuilderCard } from '@/components/questionnaires/builder/QuestionsBuilderCard';
import { MobilePreview } from '@/components/questionnaires/builder/MobilePreview';
import { SaveTemplateModal } from '@/components/questionnaires/builder/SaveTemplateModal';
import { AIAssistantModal } from '@/components/questionnaires/builder/AIAssistantModal';
import { useQuestionnaires } from '@/hooks/useQuestionnaires';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

export interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'textarea' | 'number' | 'scale';
  options?: string[];
  required: boolean;
  order_index: number;
}

export default function QuestionariosBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tenantId } = useTenantId();
  const { createQuestionnaire, updateQuestionnaire } = useQuestionnaires();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('anamnese');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestionnaire(id);
    }
  }, [id]);

  const loadQuestionnaire = async (questionnaireId: string) => {
    const { data: questionnaire } = await supabase
      .from('questionnaires')
      .select('*, questionnaire_questions(*)')
      .eq('id', questionnaireId)
      .single();

    if (questionnaire) {
      setTitle(questionnaire.title);
      setCategory(questionnaire.category);
      setDescription(questionnaire.description || '');
      
      const loadedQuestions = questionnaire.questionnaire_questions
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((q: any) => ({
          id: q.id,
          text: q.question_text,
          type: q.question_type,
          options: q.options || [],
          required: q.is_required,
          order_index: q.order_index
        }));
      
      setQuestions(loadedQuestions);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    if (!templateId) return;

    const { data: template } = await (supabase as any)
      .from('questionnaire_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (template && template.template_data) {
      const data = template.template_data as any;
      setTitle(data.title || '');
      setDescription(data.description || '');
      setCategory(template.category || 'anamnese');
      
      const templateQuestions = (data.questions || []).map((q: any, index: number) => ({
        id: Date.now().toString() + index,
        text: q.text || q.question_text || '',
        type: q.type || q.question_type || 'text',
        options: q.options || [],
        required: q.required || q.is_required || false,
        order_index: index
      }));
      
      setQuestions(templateQuestions);
      toast({ title: 'Template carregado com sucesso!' });
    }
  };

  const handleAIGenerate = (generatedData: any) => {
    setTitle(generatedData.title || '');
    setDescription(generatedData.description || '');
    setCategory(generatedData.category || 'anamnese');
    
    const aiQuestions = (generatedData.questions || []).map((q: any, index: number) => ({
      id: Date.now().toString() + index,
      text: q.text,
      type: q.type,
      options: q.options || [],
      required: q.required !== undefined ? q.required : true,
      order_index: index
    }));
    
    setQuestions(aiQuestions);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: 'Preencha o título do questionário', variant: 'destructive' });
      return;
    }

    if (questions.length === 0) {
      toast({ title: 'Adicione pelo menos uma pergunta', variant: 'destructive' });
      return;
    }

    const invalidQuestions = questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast({ title: 'Preencha o texto de todas as perguntas', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      if (id) {
        // Update existing
        await updateQuestionnaire.mutateAsync({
          id,
          title,
          category,
          description,
          questions: questions.map(q => ({
            question_text: q.text,
            question_type: q.type,
            options: q.options && q.options.length > 0 ? q.options : null,
            is_required: q.required,
            order_index: q.order_index
          }))
        });
      } else {
        // Create new
        await createQuestionnaire.mutateAsync({
          title,
          category,
          description,
          questions: questions.map(q => ({
            question_text: q.text,
            question_type: q.type,
            options: q.options && q.options.length > 0 ? q.options : null,
            is_required: q.required,
            order_index: q.order_index
          }))
        });
      }

      toast({ title: 'Questionário salvo com sucesso!' });
      navigate('/questionarios');
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar questionário', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {id ? 'Editar Questionário' : 'Criar Novo Questionário'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure seu questionário e veja o preview em tempo real
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/questionarios')}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={() => setSaveTemplateModalOpen(true)}
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              💾 Salvar como Template
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30"
            >
              {loading ? 'Salvando...' : 'Salvar Questionário'}
            </Button>
          </div>
        </div>

        {/* Layout 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* COLUNA ESQUERDA: Editor */}
          <div className="space-y-6">
            <BasicInfoCard
              title={title}
              setTitle={setTitle}
              category={category}
              setCategory={setCategory}
              description={description}
              setDescription={setDescription}
              onLoadTemplate={handleLoadTemplate}
              onOpenAI={() => setAiModalOpen(true)}
            />
            
            <QuestionsBuilderCard
              questions={questions}
              setQuestions={setQuestions}
            />
          </div>

          {/* COLUNA DIREITA: Preview Mobile */}
          <div className="sticky top-6">
            <MobilePreview
              title={title}
              description={description}
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
            />
          </div>
        </div>
      </div>

      {/* Modais */}
      <SaveTemplateModal
        open={saveTemplateModalOpen}
        onOpenChange={setSaveTemplateModalOpen}
        questionnaireData={{ title, description, category, questions }}
      />

      <AIAssistantModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}
