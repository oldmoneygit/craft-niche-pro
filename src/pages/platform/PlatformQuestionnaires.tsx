import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Send, Eye, Trash2, Copy, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

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
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isCreating, setIsCreating] = useState(false);
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
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Questionário
        </Button>
      </div>

      {/* Modal Criar */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Criar Questionário</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsCreating(false);
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
                  setFormData({ title: '', description: '', questions: [] });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                className="flex-1"
              >
                Criar Questionário
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Questionários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionnaires.map(q => (
          <div key={q.id} className="bg-card p-5 rounded-lg shadow border">
            <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
            {q.description && (
              <p className="text-sm text-muted-foreground mb-3">{q.description}</p>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              {q.questions.length} pergunta{q.questions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </Button>
              <Button
                size="sm"
                onClick={() => generatePublicLink(q.id)}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Link
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
