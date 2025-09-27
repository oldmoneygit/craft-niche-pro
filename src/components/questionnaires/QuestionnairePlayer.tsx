import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Questionnaire, QuestionnaireResponse } from "./types/questionnaire";
import { ResultsDisplay } from "./ResultsDisplay";

interface QuestionnairePlayerProps {
  questionnaire: Questionnaire;
  onComplete?: (response: QuestionnaireResponse) => void;
}

export const QuestionnairePlayer: React.FC<QuestionnairePlayerProps> = ({
  questionnaire,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

  const calculateScore = (currentAnswers: Record<string, string | string[]>) => {
    let score = 0;
    
    questionnaire.questions.forEach(question => {
      const answer = currentAnswers[question.id];
      if (!answer) return;

      switch (question.type) {
        case "single_select":
        case "multi_select":
          const selectedOptions = Array.isArray(answer) ? answer : [answer];
          selectedOptions.forEach(optionId => {
            const option = question.options?.find(opt => opt.id === optionId);
            if (option) score += option.score;
          });
          break;
        case "scale":
        case "number":
          const numValue = parseInt(answer as string);
          if (!isNaN(numValue)) {
            // For scale questions, score equals the value
            score += numValue;
          }
          break;
        // Text questions don't contribute to score
      }
    });

    return score;
  };

  const getFeedbackForScore = (score: number): string => {
    const feedback = questionnaire.feedbackRanges.find(
      range => score >= range.minScore && score <= range.maxScore
    );
    return feedback?.message || "Obrigado por responder ao questionário!";
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const answer = answers[currentQuestion.id];
    return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim() !== "");
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionnaire.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete questionnaire
      const finalScore = calculateScore(answers);
      const feedback = getFeedbackForScore(finalScore);
      
      setTotalScore(finalScore);
      setFeedbackMessage(feedback);
      setIsCompleted(true);

      const response: QuestionnaireResponse = {
        id: Date.now().toString(),
        questionnaireId: questionnaire.id,
        patientName: "Usuário", // This would come from auth context
        submittedAt: new Date().toISOString(),
        answers,
        totalScore: finalScore,
        feedbackReceived: feedback
      };

      onComplete?.(response);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestion = () => {
    const answer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "single_select":
        return (
          <RadioGroup
            value={answer as string || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multi_select":
        const selectedValues = (answer as string[]) || [];
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedValues.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(currentQuestion.id, [...selectedValues, option.id]);
                    } else {
                      handleAnswerChange(
                        currentQuestion.id,
                        selectedValues.filter(id => id !== option.id)
                      );
                    }
                  }}
                />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "text":
        return (
          <Textarea
            value={answer as string || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Digite sua resposta..."
            className="min-h-[100px]"
          />
        );

      case "number":
      case "scale":
        return (
          <Input
            type="number"
            value={answer as string || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.type === "scale" ? "1-10" : "Digite um número..."}
            min={currentQuestion.type === "scale" ? 1 : undefined}
            max={currentQuestion.type === "scale" ? 10 : undefined}
          />
        );

      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <ResultsDisplay
        questionnaire={questionnaire}
        totalScore={totalScore}
        maxScore={questionnaire.maxPossibleScore}
        feedback={feedbackMessage}
        onRestart={() => {
          setCurrentQuestionIndex(0);
          setAnswers({});
          setIsCompleted(false);
          setTotalScore(0);
          setFeedbackMessage("");
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Pergunta {currentQuestionIndex + 1} de {questionnaire.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
          {currentQuestion.required && (
            <p className="text-sm text-muted-foreground">* Campo obrigatório</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestion()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentQuestionIndex === questionnaire.questions.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </>
              ) : (
                <>
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};