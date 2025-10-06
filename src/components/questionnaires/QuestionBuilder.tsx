import { GripVertical, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Question } from '@/hooks/useQuestionnaires';

interface QuestionBuilderProps {
  question: Question;
  index: number;
  onUpdate: (data: Partial<Question>) => void;
  onDelete: () => void;
}

export function QuestionBuilder({ question, index, onUpdate, onDelete }: QuestionBuilderProps) {
  const questionTypes = [
    { value: 'text', label: '📝 Texto Curto' },
    { value: 'textarea', label: '📄 Texto Longo' },
    { value: 'single_choice', label: '◉ Escolha Única' },
    { value: 'multiple_choice', label: '☑ Múltipla Escolha' },
    { value: 'scale', label: '📊 Escala (1-10)' },
    { value: 'yes_no', label: '✓ Sim/Não' },
    { value: 'date', label: '📅 Data' },
    { value: 'number', label: '🔢 Número' },
  ];

  return (
    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div className="cursor-move pt-2">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex-1 space-y-4">
          {/* Texto da pergunta */}
          <div className="space-y-2">
            <Label>Pergunta {index + 1} *</Label>
            <Input
              placeholder="Digite a pergunta..."
              value={question.question_text}
              onChange={(e) => onUpdate({ question_text: e.target.value })}
            />
          </div>
          
          {/* Tipo de pergunta e seção */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo de Resposta</Label>
              <Select
                value={question.question_type}
                onValueChange={(value: any) => onUpdate({ question_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Seção (opcional)</Label>
              <Input
                placeholder="Ex: Dados Pessoais"
                value={question.section || ''}
                onChange={(e) => onUpdate({ section: e.target.value })}
              />
            </div>
          </div>

          {/* Opções (se for choice) */}
          {['single_choice', 'multiple_choice'].includes(question.question_type) && (
            <div className="space-y-2">
              <Label>Opções de Resposta</Label>
              {(question.options || []).map((option, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Opção ${i + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[i] = e.target.value;
                      onUpdate({ options: newOptions });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = (question.options || []).filter((_, idx) => idx !== i);
                      onUpdate({ options: newOptions });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onUpdate({ options: [...(question.options || []), ''] })}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Adicionar opção
              </button>
            </div>
          )}
          
          {/* Obrigatória */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={question.is_required}
              onChange={(e) => onUpdate({ is_required: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pergunta obrigatória
            </span>
          </label>
        </div>
        
        {/* Botão deletar */}
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}