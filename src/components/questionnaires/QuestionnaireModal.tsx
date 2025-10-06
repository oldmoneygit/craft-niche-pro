import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { QuestionBuilder } from './QuestionBuilder';
import { useQuestionnaires, type Question, type Questionnaire } from '@/hooks/useQuestionnaires';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaire?: Questionnaire | null;
}

export function QuestionnaireModal({ open, onOpenChange, questionnaire }: QuestionnaireModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('outro');
  const [description, setDescription] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('15');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const { createQuestionnaire, updateQuestionnaire } = useQuestionnaires();
  const isEditing = !!questionnaire;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (questionnaire) {
      setTitle(questionnaire.title);
      setCategory(questionnaire.category);
      setDescription(questionnaire.description || '');
      setEstimatedTime(String(questionnaire.estimated_time || 15));
      // TODO: Load questions from database
      setQuestions([]);
    } else {
      resetForm();
    }
  }, [questionnaire]);

  const resetForm = () => {
    setTitle('');
    setCategory('outro');
    setDescription('');
    setEstimatedTime('15');
    setQuestions([]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_required: false,
        order_index: questions.length,
      },
    ]);
  };

  const updateQuestion = (index: number, data: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...data };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item, i) => i === active.id);
        const newIndex = items.findIndex((item, i) => i === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || questions.length === 0) {
      return;
    }

    const data = {
      title,
      category,
      description,
      estimated_time: parseInt(estimatedTime) || 15,
      questions,
    };

    if (isEditing && questionnaire) {
      await updateQuestionnaire.mutateAsync({ id: questionnaire.id, ...data });
    } else {
      await createQuestionnaire.mutateAsync(data);
    }

    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Questionário' : 'Novo Questionário'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              Informações Básicas
            </h3>
            
            <div className="space-y-2">
              <Label>Título do Questionário *</Label>
              <Input
                placeholder="Ex: Anamnese Nutricional Completa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anamnese">Anamnese</SelectItem>
                    <SelectItem value="habitos">Avaliação de Hábitos</SelectItem>
                    <SelectItem value="recordatorio">Recordatório Alimentar</SelectItem>
                    <SelectItem value="satisfacao">Satisfação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tempo Estimado (minutos) *</Label>
                <Input
                  type="number"
                  placeholder="15"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o objetivo deste questionário..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Perguntas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Perguntas ({questions.length})
              </h3>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={questions.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <QuestionBuilder
                      key={index}
                      question={question}
                      index={index}
                      onUpdate={(data) => updateQuestion(index, data)}
                      onDelete={() => deleteQuestion(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 font-semibold hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
            >
              <Plus className="w-5 h-5 inline-block mr-2" />
              Adicionar Pergunta
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || questions.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isEditing ? 'Atualizar' : 'Criar'} Questionário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}