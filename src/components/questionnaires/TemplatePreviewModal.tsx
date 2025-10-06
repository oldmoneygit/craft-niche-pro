import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    description?: string;
    category: string;
    template_data: {
      title: string;
      description?: string;
      questions: any[];
    };
    created_at: string;
    times_used?: number;
  };
}

const categoryLabels: Record<string, string> = {
  anamnese: 'Anamnese',
  habitos: 'Hábitos',
  recordatorio: 'Recordatório',
  satisfacao: 'Satisfação',
  outro: 'Outro',
};

const questionTypeLabels: Record<string, string> = {
  single_choice: 'Escolha Única',
  multiple_choice: 'Múltipla Escolha',
  text: 'Texto Curto',
  textarea: 'Texto Longo',
  number: 'Número',
  scale: 'Escala',
};

export function TemplatePreviewModal({ open, onOpenChange, template }: TemplatePreviewModalProps) {
  const questions = template.template_data?.questions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-base">
                {template.description || 'Sem descrição'}
              </DialogDescription>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {categoryLabels[template.category] || 'Outro'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{questions.length} pergunta{questions.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Usado {template.times_used || 0}x</span>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Template Data Info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {template.template_data?.title || 'Sem título'}
              </h3>
              {template.template_data?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {template.template_data.description}
                </p>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Perguntas:</h4>
              {questions.map((question: any, index: number) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {question.text || question.question_text || 'Sem texto'}
                        </span>
                      </div>
                      {question.required || question.is_required ? (
                        <Badge variant="outline" className="text-xs">
                          Obrigatória
                        </Badge>
                      ) : null}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {questionTypeLabels[question.type || question.question_type] || 'Texto'}
                    </Badge>
                  </div>

                  {/* Options (if applicable) */}
                  {question.options && question.options.length > 0 && (
                    <div className="pl-8 space-y-1.5">
                      {question.options.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
