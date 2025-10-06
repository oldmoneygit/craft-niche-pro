import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: any) => void;
}

export function AIAssistantModal({ open, onOpenChange, onGenerate }: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const examples = [
    'Criar questionário para avaliar compulsão alimentar com escala de gravidade',
    'Questionário sobre hidratação diária e consumo de água',
    'Avaliação de adesão ao plano alimentar com perguntas sobre dificuldades',
    'Questionário para identificar gatilhos emocionais relacionados à alimentação'
  ];

  const handleGenerate = async () => {
    if (!prompt || prompt.length < 20) {
      toast({
        title: 'Descreva com mais detalhes o questionário que você precisa',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Mock data - Replace with actual AI API call
      const mockData = {
        title: 'Questionário Gerado por IA',
        description: 'Descrição gerada pela IA',
        category: 'habitos',
        questions: [
          {
            text: 'Com que frequência você consome água durante o dia?',
            type: 'single_choice',
            options: ['Menos de 1L', '1-2L', '2-3L', 'Mais de 3L'],
            required: true
          },
          {
            text: 'Como você descreveria seus hábitos alimentares?',
            type: 'textarea',
            required: true
          }
        ]
      };

      onGenerate(mockData);
      toast({ title: 'Questionário gerado com sucesso!' });
      onOpenChange(false);
      setPrompt('');
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao gerar questionário', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Assistente de IA para Questionários
          </DialogTitle>
          <DialogDescription>
            Descreva o que você precisa e a IA criará o questionário completo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!loading ? (
            <>
              <div>
                <Label>Descreva seu questionário</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Exemplo: Preciso de um questionário para avaliar sintomas de intolerância à lactose, com perguntas sobre frequência de consumo de laticínios, sintomas após consumo e histórico familiar..."
                  rows={5}
                  className="resize-none mt-1.5"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                  💡 Exemplos de solicitações:
                </p>
                <div className="space-y-2">
                  {examples.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left text-sm p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Gerando questionário com IA...
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Questionário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
