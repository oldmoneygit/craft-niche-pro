import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RotateCcw, Share } from "lucide-react";
import { Questionnaire } from "./types/questionnaire";

interface ResultsDisplayProps {
  questionnaire: Questionnaire;
  totalScore: number;
  maxScore: number;
  feedback: string;
  onRestart?: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  questionnaire,
  totalScore,
  maxScore,
  feedback,
  onRestart
}) => {
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  
  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = () => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: questionnaire.title,
          text: `Acabei de responder o questionário "${questionnaire.title}" e obtive ${totalScore} pontos!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para browsers que não suportam Web Share API
      navigator.clipboard.writeText(
        `Acabei de responder o questionário "${questionnaire.title}" e obtive ${totalScore} pontos! ${window.location.href}`
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Questionário Concluído!
        </h1>
        <p className="text-muted-foreground">
          Obrigado por responder ao questionário "{questionnaire.title}"
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            Sua Pontuação
            <Badge variant={getScoreBadgeVariant()}>
              {totalScore} / {maxScore}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className={getScoreColor()}>{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
          
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Seu Resultado:</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feedback}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        {onRestart && (
          <Button variant="outline" onClick={onRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Responder Novamente
          </Button>
        )}
        
        <Button variant="outline" onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Questionário respondido em {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};