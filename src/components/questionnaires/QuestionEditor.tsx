import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";
import { Question, QuestionOption } from "./types/questionnaire";

interface QuestionEditorProps {
  question?: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<Question>>(
    question || {
      type: "single_select",
      title: "",
      required: true,
      options: []
    }
  );
  
  const [newOption, setNewOption] = useState<Partial<QuestionOption>>({
    text: "",
    score: 0
  });

  const handleAddOption = () => {
    if (newOption.text && newOption.score !== undefined) {
      const option: QuestionOption = {
        id: Date.now().toString(),
        text: newOption.text,
        score: newOption.score
      };
      
      setFormData({
        ...formData,
        options: [...(formData.options || []), option]
      });
      
      setNewOption({ text: "", score: 0 });
    }
  };

  const handleRemoveOption = (optionId: string) => {
    setFormData({
      ...formData,
      options: formData.options?.filter(opt => opt.id !== optionId)
    });
  };

  const handleSave = () => {
    if (formData.title && formData.type) {
      const savedQuestion: Question = {
        id: question?.id || Date.now().toString(),
        type: formData.type,
        title: formData.title,
        options: formData.options,
        required: formData.required || false,
        minScore: formData.minScore,
        maxScore: formData.maxScore
      };
      
      onSave(savedQuestion);
    }
  };

  const requiresOptions = formData.type === "single_select" || formData.type === "multi_select";
  const isScaleType = formData.type === "scale";

  const calculateMaxScore = () => {
    if (isScaleType) {
      return formData.maxScore || 10;
    }
    if (requiresOptions) {
      if (formData.type === "single_select") {
        return Math.max(...(formData.options?.map(opt => opt.score) || [0]));
      } else {
        // multi_select - sum of all positive scores
        return (formData.options?.reduce((sum, opt) => sum + Math.max(0, opt.score), 0) || 0);
      }
    }
    return 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {question ? "Editar Pergunta" : "Nova Pergunta"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo da Pergunta</Label>
            <Select
              value={formData.type}
              onValueChange={(value: Question["type"]) =>
                setFormData({ ...formData, type: value, options: [] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_select">Múltipla Escolha (Uma opção)</SelectItem>
                <SelectItem value="multi_select">Múltipla Escolha (Várias opções)</SelectItem>
                <SelectItem value="text">Texto Livre</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="scale">Escala (1-10)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Obrigatória?</Label>
            <RadioGroup
              value={formData.required ? "yes" : "no"}
              onValueChange={(value) =>
                setFormData({ ...formData, required: value === "yes" })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="required-yes" />
                <Label htmlFor="required-yes">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="required-no" />
                <Label htmlFor="required-no">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pergunta</Label>
          <Input
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Digite sua pergunta aqui..."
          />
        </div>

        {isScaleType && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Mínimo</Label>
              <Input
                type="number"
                value={formData.minScore || 1}
                onChange={(e) => setFormData({
                  ...formData,
                  minScore: parseInt(e.target.value) || 1
                })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Máximo</Label>
              <Input
                type="number"
                value={formData.maxScore || 10}
                onChange={(e) => setFormData({
                  ...formData,
                  maxScore: parseInt(e.target.value) || 10
                })}
                min="1"
              />
            </div>
          </div>
        )}

        {requiresOptions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Opções de Resposta</Label>
              <Badge variant="outline">
                Pontuação Máxima: {calculateMaxScore()}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {formData.options?.map((option) => (
                <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{option.text}</span>
                  </div>
                  <Badge variant={option.score > 0 ? "default" : "secondary"}>
                    {option.score > 0 ? "+" : ""}{option.score} pts
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Adicionar Nova Opção</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input
                    value={newOption.text || ""}
                    onChange={(e) => setNewOption({
                      ...newOption,
                      text: e.target.value
                    })}
                    placeholder="Texto da opção..."
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={newOption.score || ""}
                    onChange={(e) => setNewOption({
                      ...newOption,
                      score: parseInt(e.target.value) || 0
                    })}
                    placeholder="Pontos"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleAddOption}
                disabled={!newOption.text || newOption.score === undefined}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            {(!formData.options || formData.options.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                <p>Adicione pelo menos uma opção de resposta.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title || (requiresOptions && (!formData.options || formData.options.length === 0))}
          >
            Salvar Pergunta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};