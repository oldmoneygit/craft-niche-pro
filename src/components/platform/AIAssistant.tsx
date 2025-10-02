import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Brain, Loader as Loader2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { ClientProfile } from '@/types/clientProfile';
import { generateAIBasedMealPlan, validateAIPlan } from '@/lib/aiNutritionService';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  clientProfile: ClientProfile;
  onApplyPlan: (plan: any) => void;
}

export const AIAssistant = ({ clientProfile, onApplyPlan }: AIAssistantProps) => {
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const aiPlan = await generateAIBasedMealPlan(clientProfile);

      const validation = validateAIPlan(aiPlan);

      setGeneratedPlan({
        ...aiPlan,
        validation
      });

      toast({
        title: validation.valid ? 'Sugestão gerada!' : 'Sugestão gerada com avisos',
        description: validation.valid
          ? 'Revise as sugestões antes de aplicar'
          : 'Alguns avisos foram detectados. Revise cuidadosamente.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar sugestão',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const activityLabels = {
    sedentary: 'Sedentário',
    light: 'Leve',
    moderate: 'Moderado',
    intense: 'Intenso',
    very_intense: 'Muito Intenso'
  };

  const goalLabels = {
    maintenance: 'Manutenção',
    weight_loss: 'Perda de Peso',
    muscle_gain: 'Ganho de Massa',
    health: 'Saúde'
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle>Assistente Nutricional IA</CardTitle>
        </div>
        <CardDescription>
          Gere sugestões personalizadas baseadas no perfil do cliente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            Este assistente gera <strong>sugestões</strong> baseadas em cálculos nutricionais padrão.
            Como profissional, você deve revisar, ajustar e validar todas as recomendações antes de aplicar.
          </AlertDescription>
        </Alert>

        {clientProfile && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <p><strong>Cliente:</strong> {clientProfile.name}</p>
            <p><strong>Idade:</strong> {clientProfile.age} anos</p>
            <p><strong>Peso:</strong> {clientProfile.weight_kg}kg | <strong>Altura:</strong> {clientProfile.height_cm}cm</p>
            <p><strong>Objetivo:</strong> {goalLabels[clientProfile.goal]}</p>
            <p><strong>Atividade:</strong> {activityLabels[clientProfile.activity_level]}</p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando sugestões...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Sugestão de Plano
            </>
          )}
        </Button>

        {generatedPlan && (
          <div className="space-y-3 pt-3 border-t">
            {generatedPlan.validation && generatedPlan.validation.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Avisos de Validação:</p>
                  <ul className="text-xs space-y-1">
                    {generatedPlan.validation.warnings.map((warning: string, i: number) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-sm">Sugestão Gerada</h4>
              <div className="text-sm space-y-1">
                <p><strong>Meta Calórica:</strong> {generatedPlan.targetCalories} kcal/dia</p>
                <p><strong>Proteínas:</strong> {generatedPlan.macros.protein_g}g</p>
                <p><strong>Carboidratos:</strong> {generatedPlan.macros.carb_g}g</p>
                <p><strong>Gorduras:</strong> {generatedPlan.macros.fat_g}g</p>
              </div>
            </div>

            {generatedPlan.reasoning && (
              <div className="text-xs bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                <strong>Por que essas escolhas?</strong>
                <p className="mt-1 whitespace-pre-line">{generatedPlan.reasoning}</p>
              </div>
            )}

            {generatedPlan.educationalNotes && (
              <div className="text-xs bg-green-50 dark:bg-green-950/20 p-3 rounded">
                <strong>Orientações para o cliente:</strong>
                <p className="mt-1 whitespace-pre-line">{generatedPlan.educationalNotes}</p>
              </div>
            )}

            {generatedPlan.meals && generatedPlan.meals.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs font-semibold">Refeições Sugeridas:</p>
                {generatedPlan.meals.map((meal: any, idx: number) => (
                  <div key={idx} className="border rounded p-2 text-xs">
                    <p className="font-semibold">{meal.name} - {meal.time}</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {meal.items.map((item: any, itemIdx: number) => (
                        <li key={itemIdx}>
                          • {item.quantity} {item.measure} de {item.food_name}
                          ({item.estimated_kcal} kcal)
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => onApplyPlan(generatedPlan)}
              variant="default"
              className="w-full"
            >
              Aplicar Sugestão ao Plano
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
