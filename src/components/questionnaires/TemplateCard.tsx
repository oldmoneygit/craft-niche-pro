import { Eye, Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TemplateCardProps {
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
  onView: (template: any) => void;
  onEdit: (template: any) => void;
  onDelete: (template: any) => void;
}

const categoryLabels: Record<string, string> = {
  anamnese: 'Anamnese',
  habitos: 'Hábitos',
  recordatorio: 'Recordatório',
  satisfacao: 'Satisfação',
  outro: 'Outro',
};

const categoryColors: Record<string, string> = {
  anamnese: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  habitos: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  recordatorio: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  satisfacao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  outro: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function TemplateCard({ template, onView, onEdit, onDelete }: TemplateCardProps) {
  const questionCount = template.template_data?.questions?.length || 0;
  const timesUsed = template.times_used || 0;
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {template.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
              {template.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <Badge className={categoryColors[template.category] || categoryColors.outro}>
            {categoryLabels[template.category] || 'Outro'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{questionCount} pergunta{questionCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Usado {timesUsed}x</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-500">
          Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(template)}
          className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          Visualizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(template)}
          className="flex-1 border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          <Edit className="w-4 h-4 mr-1.5" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(template)}
          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
