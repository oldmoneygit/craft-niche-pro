import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { FeedbackRange } from "./types/questionnaire";

interface FeedbackRangeEditorProps {
  feedbackRanges: FeedbackRange[];
  maxPossibleScore: number;
  onChange: (ranges: FeedbackRange[]) => void;
}

export const FeedbackRangeEditor: React.FC<FeedbackRangeEditorProps> = ({
  feedbackRanges,
  maxPossibleScore,
  onChange
}) => {
  const [newRange, setNewRange] = useState<Partial<FeedbackRange>>({
    minScore: 0,
    maxScore: 0,
    message: "",
    type: "text"
  });

  const handleAddRange = () => {
    if (newRange.minScore !== undefined && 
        newRange.maxScore !== undefined && 
        newRange.message) {
      const range: FeedbackRange = {
        id: Date.now().toString(),
        minScore: newRange.minScore,
        maxScore: newRange.maxScore,
        message: newRange.message,
        type: newRange.type || "text"
      };
      
      onChange([...feedbackRanges, range]);
      setNewRange({
        minScore: 0,
        maxScore: 0,
        message: "",
        type: "text"
      });
    }
  };

  const handleRemoveRange = (id: string) => {
    onChange(feedbackRanges.filter(range => range.id !== id));
  };

  const validateRanges = () => {
    const issues = [];
    const sortedRanges = [...feedbackRanges].sort((a, b) => a.minScore - b.minScore);
    
    // Check for overlaps
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i];
      const next = sortedRanges[i + 1];
      
      if (current.maxScore >= next.minScore) {
        issues.push(`Sobreposição entre faixas: ${current.minScore}-${current.maxScore} e ${next.minScore}-${next.maxScore}`);
      }
    }
    
    // Check for gaps
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const current = sortedRanges[i];
      const next = sortedRanges[i + 1];
      
      if (current.maxScore + 1 < next.minScore) {
        issues.push(`Lacuna entre faixas: ${current.maxScore} e ${next.minScore}`);
      }
    }
    
    return issues;
  };

  const validationIssues = validateRanges();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuração de Feedback
          <Badge variant="outline">
            Pontuação Máxima: {maxPossibleScore}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationIssues.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Atenção</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {validationIssues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {feedbackRanges.map((range) => (
            <div key={range.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">
                    {range.minScore} - {range.maxScore} pontos
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{range.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRange(range.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Adicionar Nova Faixa de Feedback</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pontuação Mínima</Label>
              <Input
                type="number"
                value={newRange.minScore || ""}
                onChange={(e) => setNewRange({
                  ...newRange,
                  minScore: parseInt(e.target.value) || 0
                })}
                placeholder="0"
                min="0"
                max={maxPossibleScore}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Pontuação Máxima</Label>
              <Input
                type="number"
                value={newRange.maxScore || ""}
                onChange={(e) => setNewRange({
                  ...newRange,
                  maxScore: parseInt(e.target.value) || 0
                })}
                placeholder="0"
                min="0"
                max={maxPossibleScore}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mensagem de Feedback</Label>
            <Textarea
              value={newRange.message || ""}
              onChange={(e) => setNewRange({
                ...newRange,
                message: e.target.value
              })}
              placeholder="Digite a mensagem que será exibida para esta faixa de pontuação..."
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleAddRange}
            disabled={!newRange.message || 
                     newRange.minScore === undefined || 
                     newRange.maxScore === undefined ||
                     newRange.minScore > newRange.maxScore}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Faixa
          </Button>
        </div>

        {feedbackRanges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma faixa de feedback configurada.</p>
            <p className="text-sm">Adicione pelo menos uma faixa para fornecer feedback aos usuários.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};