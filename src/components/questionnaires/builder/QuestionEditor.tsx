import { ChevronUp, ChevronDown, Copy, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Question } from '@/pages/QuestionariosBuilder';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}: QuestionEditorProps) {
  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    onUpdate({ options: newOptions });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    onUpdate({ options: newOptions });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
          Pergunta {index + 1}
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onMoveUp}
            className="h-8 w-8"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onMoveDown}
            className="h-8 w-8"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDuplicate}
            className="h-8 w-8"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pergunta */}
      <div className="mb-3">
        <Label className="text-gray-700 dark:text-gray-300">Pergunta *</Label>
        <Input
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Digite a pergunta..."
          className="mt-1.5"
        />
      </div>

      {/* Tipo */}
      <div className="mb-3">
        <Label className="text-gray-700 dark:text-gray-300">Tipo de Resposta</Label>
        <Select
          value={question.type}
          onValueChange={(type: any) => onUpdate({ type })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">📋 Escolha Única</SelectItem>
            <SelectItem value="multiple_choice">☑️ Múltipla Escolha</SelectItem>
            <SelectItem value="text">📝 Texto Curto</SelectItem>
            <SelectItem value="textarea">📄 Texto Longo</SelectItem>
            <SelectItem value="number">🔢 Número</SelectItem>
            <SelectItem value="scale">📊 Escala (1-5)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opções (se aplicável) */}
      {['single_choice', 'multiple_choice'].includes(question.type) && (
        <div className="mb-3">
          <Label className="text-gray-700 dark:text-gray-300">Opções</Label>
          <div className="space-y-2 mt-1.5">
            {(question.options || []).map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Opção ${i + 1}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeOption(i)}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={addOption}
            className="mt-2 text-emerald-600 dark:text-emerald-400"
          >
            + Adicionar opção
          </Button>
        </div>
      )}

      {/* Obrigatória */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pergunta obrigatória
        </span>
      </label>
    </div>
  );
}
