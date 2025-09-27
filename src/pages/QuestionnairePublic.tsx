import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionnairePlayer } from "@/components/questionnaires/QuestionnairePlayer";
import { Questionnaire, QuestionnaireResponse } from "@/components/questionnaires/types/questionnaire";

// Mock data - in real app this would come from API
const mockQuestionnaires: Questionnaire[] = [
  {
    id: "1",
    title: "Avaliação Nutricional Rápida",
    description: "Este questionário ajuda a avaliar seus hábitos alimentares e oferece feedback personalizado para melhorar sua saúde.",
    questions: [
      {
        id: "q1",
        type: "single_select",
        title: "Quantas porções de frutas você consumiu por dia nos últimos dias?",
        options: [
          { id: "o1", text: "Três ou mais porções", score: 3 },
          { id: "o2", text: "Uma a duas porções", score: 1 },
          { id: "o3", text: "Nenhuma porção", score: 0 }
        ],
        required: true
      },
      {
        id: "q2",
        type: "single_select",
        title: "Com que frequência você consome vegetais?",
        options: [
          { id: "o4", text: "Diariamente", score: 5 },
          { id: "o5", text: "Algumas vezes por semana", score: 3 },
          { id: "o6", text: "Raramente", score: 1 }
        ],
        required: true
      },
      {
        id: "q3",
        type: "single_select",
        title: "Você bebe água suficiente durante o dia?",
        options: [
          { id: "o7", text: "Sim, mais de 2 litros", score: 3 },
          { id: "o8", text: "Sim, cerca de 1-2 litros", score: 2 },
          { id: "o9", text: "Menos de 1 litro", score: 0 }
        ],
        required: true
      },
      {
        id: "q4",
        type: "scale",
        title: "Como você avalia sua disposição física? (1-10)",
        required: true,
        minScore: 1,
        maxScore: 10
      },
      {
        id: "q5",
        type: "single_select",
        title: "Você pratica exercícios regularmente?",
        options: [
          { id: "o10", text: "Sim, mais de 3 vezes por semana", score: 4 },
          { id: "o11", text: "Sim, 1-2 vezes por semana", score: 2 },
          { id: "o12", text: "Não pratico exercícios", score: 0 }
        ],
        required: true
      },
      {
        id: "q6",
        type: "multi_select",
        title: "Quais destes alimentos você consome regularmente? (Selecione todos que se aplicam)",
        options: [
          { id: "o13", text: "Grãos integrais", score: 2 },
          { id: "o14", text: "Peixes", score: 2 },
          { id: "o15", text: "Castanhas e nozes", score: 1 },
          { id: "o16", text: "Laticínios", score: 1 },
          { id: "o17", text: "Leguminosas (feijão, lentilha)", score: 2 }
        ],
        required: false
      },
      {
        id: "q7",
        type: "text",
        title: "Há algum objetivo específico relacionado à sua alimentação que gostaria de alcançar?",
        required: false
      }
    ],
    feedbackRanges: [
      {
        id: "f1",
        minScore: 0,
        maxScore: 8,
        message: "Seus hábitos alimentares precisam de atenção especial. Recomendamos consultar um nutricionista para desenvolver um plano alimentar personalizado que melhore sua saúde e bem-estar.",
        type: "text"
      },
      {
        id: "f2",
        minScore: 9,
        maxScore: 18,
        message: "Você está no caminho certo! Seus hábitos mostram consciência sobre alimentação saudável, mas ainda há espaço para melhorias. Continue se esforçando e considere pequenos ajustes na sua rotina.",
        type: "text"
      },
      {
        id: "f3",
        minScore: 19,
        maxScore: 25,
        message: "Parabéns! Seus hábitos alimentares são muito bons. Você demonstra ter uma relação saudável com a comida e exercícios. Continue mantendo essa rotina equilibrada!",
        type: "text"
      },
      {
        id: "f4",
        minScore: 26,
        maxScore: 35,
        message: "Excelente! Você tem hábitos alimentares exemplares e um estilo de vida muito saudável. Seus cuidados com a alimentação e exercícios são inspiradores. Continue assim!",
        type: "text"
      }
    ],
    active: true,
    frequency: "weekly",
    responses: 127,
    createdAt: "2024-01-15",
    maxPossibleScore: 35
  }
];

export default function QuestionnairePublic() {
  const { questionnaireId } = useParams<{ questionnaireId: string }>();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const found = mockQuestionnaires.find(q => q.id === questionnaireId);
      setQuestionnaire(found || null);
      setLoading(false);
    }, 500);
  }, [questionnaireId]);

  const handleComplete = (response: QuestionnaireResponse) => {
    console.log('Questionário respondido:', response);
    // Here you would save the response to your backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Questionário não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O questionário solicitado não existe ou não está mais disponível.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionnaire.active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Questionário indisponível</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Este questionário não está ativo no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {questionnaire.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {questionnaire.description}
          </p>
        </div>

        <QuestionnairePlayer
          questionnaire={questionnaire}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}