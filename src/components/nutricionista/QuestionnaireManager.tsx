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
  Circle,
  Settings,
  Eye,
  Link
} from "lucide-react";

// Import new types and components
import { Questionnaire, Question, FeedbackRange, QuestionOption } from "@/components/questionnaires/types/questionnaire";
import { QuestionEditor } from "@/components/questionnaires/QuestionEditor";
import { FeedbackRangeEditor } from "@/components/questionnaires/FeedbackRangeEditor";

const QuestionnaireManager = () => {
  const [activeTab, setActiveTab] = useState("questionnaires");
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([
    {
      id: "1",
      title: "Avaliação Nutricional Rápida",
      description: "Questionário para avaliar hábitos alimentares e receber feedback personalizado",
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
          type: "scale",
          title: "Como você avalia sua disposição? (1-10)",
          required: true,
          minScore: 1,
          maxScore: 10
        },
        {
          id: "q4",
          type: "single_select",
          title: "Você pratica exercícios regularmente?",
          options: [
            { id: "o7", text: "Sim, mais de 3 vezes por semana", score: 4 },
            { id: "o8", text: "Sim, 1-2 vezes por semana", score: 2 },
            { id: "o9", text: "Não pratico exercícios", score: 0 }
          ],
          required: true
        }
      ],
      feedbackRanges: [
        {
          id: "f1",
          minScore: 0,
          maxScore: 5,
          message: "Seus hábitos precisam de atenção. Considere consultar um nutricionista para melhorar sua alimentação e saúde.",
          type: "text"
        },
        {
          id: "f2",
          minScore: 6,
          maxScore: 12,
          message: "Você está no caminho certo! Continue se alimentando de forma saudável e mantendo uma rotina de exercícios.",
          type: "text"
        },
        {
          id: "f3",
          minScore: 13,
          maxScore: 22,
          message: "Parabéns! Seus hábitos alimentares e de vida são excelentes. Continue assim!",
          type: "text"
        }
      ],
      active: true,
      frequency: "weekly",
      responses: 24,
      createdAt: "2024-01-15",
      maxPossibleScore: 22
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const calculateMaxScore = (questions: Question[]): number => {
    return questions.reduce((total, question) => {
      switch (question.type) {
        case "single_select":
          return total + Math.max(...(question.options?.map(opt => opt.score) || [0]));
        case "multi_select":
          return total + (question.options?.reduce((sum, opt) => sum + Math.max(0, opt.score), 0) || 0);
        case "scale":
        case "number":
          return total + (question.maxScore || 10);
        default:
          return total;
      }
    }, 0);
  };

  const handleCreateQuestionnaire = () => {
    const newQuestionnaire: Questionnaire = {
      id: Date.now().toString(),
      title: "Novo Questionário",
      description: "",
      questions: [],
      feedbackRanges: [],
      active: false,
      frequency: "weekly",
      responses: 0,
      createdAt: new Date().toISOString().split('T')[0],
      maxPossibleScore: 0
    };
    setEditingQuestionnaire(newQuestionnaire);
    setIsCreating(true);
  };

  const handleSaveQuestionnaire = () => {
    if (editingQuestionnaire) {
      const updatedQuestionnaire = {
        ...editingQuestionnaire,
        maxPossibleScore: calculateMaxScore(editingQuestionnaire.questions)
      };
      
      if (isCreating) {
        setQuestionnaires([...questionnaires, updatedQuestionnaire]);
      } else {
        setQuestionnaires(questionnaires.map(q => 
          q.id === updatedQuestionnaire.id ? updatedQuestionnaire : q
        ));
      }
      setEditingQuestionnaire(null);
      setIsCreating(false);
    }
  };

  const handleSaveQuestion = (question: Question) => {
    if (editingQuestionnaire) {
      let updatedQuestions;
      if (editingQuestion) {
        // Update existing question
        updatedQuestions = editingQuestionnaire.questions.map(q => 
          q.id === question.id ? question : q
        );
      } else {
        // Add new question
        updatedQuestions = [...editingQuestionnaire.questions, question];
      }
      
      setEditingQuestionnaire({
        ...editingQuestionnaire,
        questions: updatedQuestions
      });
    }
    
    setShowQuestionEditor(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionEditor(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (editingQuestionnaire) {
      setEditingQuestionnaire({
        ...editingQuestionnaire,
        questions: editingQuestionnaire.questions.filter(q => q.id !== questionId)
      });
    }
  };

  const handleUpdateFeedbackRanges = (feedbackRanges: FeedbackRange[]) => {
    if (editingQuestionnaire) {
      setEditingQuestionnaire({
        ...editingQuestionnaire,
        feedbackRanges
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

  if (showQuestionEditor) {
    return (
      <div className="space-y-6">
        <QuestionEditor
          question={editingQuestion || undefined}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowQuestionEditor(false);
            setEditingQuestion(null);
          }}
        />
      </div>
    );
  }

  if (editingQuestionnaire) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isCreating ? "Criar Questionário" : "Editar Questionário"}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditingQuestionnaire(null);
              setIsCreating(false);
            }}>
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
            <div className="flex items-center justify-between">
              <CardTitle>Perguntas ({editingQuestionnaire.questions.length})</CardTitle>
              <Badge variant="outline">
                Pontuação Máxima: {calculateMaxScore(editingQuestionnaire.questions)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingQuestionnaire.questions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    <Badge variant="secondary">{question.type.replace('_', ' ')}</Badge>
                    {question.required && <Badge variant="destructive" className="text-xs">Obrigatória</Badge>}
                    {question.options && (
                      <Badge variant="outline">{question.options.length} opções</Badge>
                    )}
                  </div>
                  <p className="font-medium mt-1">{question.title}</p>
                  {question.options && (
                    <div className="flex gap-1 mt-2">
                      {question.options.slice(0, 3).map(option => (
                        <Badge key={option.id} variant="outline" className="text-xs">
                          {option.text}: +{option.score}
                        </Badge>
                      ))}
                      {question.options.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{question.options.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              onClick={() => setShowQuestionEditor(true)}
              className="action-primary w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Pergunta
            </Button>
          </CardContent>
        </Card>

        <FeedbackRangeEditor
          feedbackRanges={editingQuestionnaire.feedbackRanges}
          maxPossibleScore={calculateMaxScore(editingQuestionnaire.questions)}
          onChange={handleUpdateFeedbackRanges}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Questionários</h2>
        <Button className="action-primary" onClick={handleCreateQuestionnaire}>
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
                        onClick={() => {
                          window.open(`/questionnaire/${questionnaire.id}`, '_blank');
                        }}
                        title="Visualizar questionário público"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/questionnaire/${questionnaire.id}`);
                        }}
                        title="Copiar link público"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
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
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {questionnaire.maxPossibleScore} pts máx
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      {questionnaire.feedbackRanges.length} feedbacks
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