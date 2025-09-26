import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Plus,
  Edit,
  Trash2,
  Send,
  BarChart3,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Circle
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple-choice" | "text" | "number" | "scale" | "yes-no";
  title: string;
  options?: string[];
  required: boolean;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  active: boolean;
  frequency: "weekly" | "biweekly" | "monthly";
  responses: number;
  createdAt: string;
}

const QuestionnaireManager = () => {
  const [activeTab, setActiveTab] = useState("questionnaires");
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([
    {
      id: "1",
      title: "Avaliação Semanal de Rotina",
      description: "Questionário para acompanhar hábitos alimentares e de sono",
      questions: [
        {
          id: "q1",
          type: "number",
          title: "Quantas porções de frutas você consumiu por dia em média?",
          required: true
        },
        {
          id: "q2",
          type: "number",
          title: "Quantas horas de sono você teve por noite em média?",
          required: true
        },
        {
          id: "q3",
          type: "scale",
          title: "Como você avalia sua disposição durante a semana? (1-10)",
          required: true
        },
        {
          id: "q4",
          type: "yes-no",
          title: "Você conseguiu seguir o plano alimentar na maior parte da semana?",
          required: true
        },
        {
          id: "q5",
          type: "text",
          title: "Descreva como se sentiu durante a semana:",
          required: false
        }
      ],
      active: true,
      frequency: "weekly",
      responses: 24,
      createdAt: "2024-01-15"
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: "text",
    title: "",
    required: true
  });

  const handleCreateQuestionnaire = () => {
    const newQuestionnaire: Questionnaire = {
      id: Date.now().toString(),
      title: "Novo Questionário",
      description: "",
      questions: [],
      active: false,
      frequency: "weekly",
      responses: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEditingQuestionnaire(newQuestionnaire);
    setIsCreating(true);
  };

  const handleSaveQuestionnaire = () => {
    if (editingQuestionnaire) {
      if (isCreating) {
        setQuestionnaires([...questionnaires, editingQuestionnaire]);
      } else {
        setQuestionnaires(questionnaires.map(q => 
          q.id === editingQuestionnaire.id ? editingQuestionnaire : q
        ));
      }
      setEditingQuestionnaire(null);
      setIsCreating(false);
    }
  };

  const handleAddQuestion = () => {
    if (editingQuestionnaire && newQuestion.title) {
      const question: Question = {
        id: Date.now().toString(),
        type: newQuestion.type as Question["type"],
        title: newQuestion.title,
        options: newQuestion.options,
        required: newQuestion.required || false
      };
      
      setEditingQuestionnaire({
        ...editingQuestionnaire,
        questions: [...editingQuestionnaire.questions, question]
      });
      
      setNewQuestion({
        type: "text",
        title: "",
        required: true
      });
    }
  };

  const mockResponses = [
    {
      id: "1",
      patientName: "Maria Silva",
      submittedAt: "2024-01-20",
      responses: {
        "q1": "3",
        "q2": "7",
        "q3": "8",
        "q4": "sim",
        "q5": "Me senti bem disposta, consegui manter a rotina na maior parte dos dias."
      }
    },
    {
      id: "2",
      patientName: "João Santos",
      submittedAt: "2024-01-19",
      responses: {
        "q1": "2",
        "q2": "6",
        "q3": "6",
        "q4": "não",
        "q5": "Tive algumas dificuldades com o sono durante a semana."
      }
    }
  ];

  if (editingQuestionnaire) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isCreating ? "Criar Questionário" : "Editar Questionário"}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingQuestionnaire(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestionnaire}>
              Salvar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Questionário</Label>
              <Input
                id="title"
                value={editingQuestionnaire.title}
                onChange={(e) => setEditingQuestionnaire({
                  ...editingQuestionnaire,
                  title: e.target.value
                })}
                placeholder="Ex: Avaliação Semanal de Rotina"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={editingQuestionnaire.description}
                onChange={(e) => setEditingQuestionnaire({
                  ...editingQuestionnaire,
                  description: e.target.value
                })}
                placeholder="Descreva o objetivo do questionário..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Select
                value={editingQuestionnaire.frequency}
                onValueChange={(value: "weekly" | "biweekly" | "monthly") =>
                  setEditingQuestionnaire({
                    ...editingQuestionnaire,
                    frequency: value
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quinzenal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas ({editingQuestionnaire.questions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingQuestionnaire.questions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <Badge variant="secondary">{question.type}</Badge>
                    {question.required && <Badge variant="destructive" className="text-xs">Obrigatória</Badge>}
                  </div>
                  <p className="font-medium mt-1">{question.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingQuestionnaire({
                      ...editingQuestionnaire,
                      questions: editingQuestionnaire.questions.filter(q => q.id !== question.id)
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Adicionar Nova Pergunta</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo da Pergunta</Label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(value: Question["type"]) =>
                      setNewQuestion({ ...newQuestion, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto Livre</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="scale">Escala (1-10)</SelectItem>
                      <SelectItem value="yes-no">Sim/Não</SelectItem>
                      <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Obrigatória?</Label>
                  <RadioGroup
                    value={newQuestion.required ? "yes" : "no"}
                    onValueChange={(value) =>
                      setNewQuestion({ ...newQuestion, required: value === "yes" })
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
                  value={newQuestion.title || ""}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="Digite sua pergunta aqui..."
                />
              </div>

              <Button onClick={handleAddQuestion} disabled={!newQuestion.title}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Questionários</h2>
        <Button onClick={handleCreateQuestionnaire}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Questionário
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questionnaires">Questionários</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="questionnaires" className="space-y-4">
          <div className="grid gap-4">
            {questionnaires.map((questionnaire) => (
              <Card key={questionnaire.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {questionnaire.title}
                        {questionnaire.active ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {questionnaire.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuestionnaire(questionnaire)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuestionnaires(questionnaires.map(q =>
                            q.id === questionnaire.id
                              ? { ...q, active: !q.active }
                              : q
                          ));
                        }}
                      >
                        {questionnaire.active ? <Circle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {questionnaire.questions.length} perguntas
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {questionnaire.responses} respostas
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {questionnaire.frequency === "weekly" ? "Semanal" : questionnaire.frequency === "biweekly" ? "Quinzenal" : "Mensal"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <div className="space-y-4">
            {mockResponses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{response.patientName}</CardTitle>
                    <Badge variant="outline">{response.submittedAt}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(response.responses).map(([questionId, answer]) => {
                    const question = questionnaires[0]?.questions.find(q => q.id === questionId);
                    return (
                      <div key={questionId} className="border-l-4 border-primary/20 pl-4">
                        <p className="font-medium text-sm">{question?.title}</p>
                        <p className="text-muted-foreground">{answer}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Taxa de Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participantes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-sm text-muted-foreground">Pacientes responderam</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3min</div>
                <p className="text-sm text-muted-foreground">Para completar</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo das Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Média de porções de frutas</span>
                  <span className="text-lg font-bold">2.8 porções/dia</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Média de horas de sono</span>
                  <span className="text-lg font-bold">6.5 horas/noite</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Disposição média</span>
                  <span className="text-lg font-bold">7.2/10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">Seguem o plano alimentar</span>
                  <span className="text-lg font-bold">72%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionnaireManager;