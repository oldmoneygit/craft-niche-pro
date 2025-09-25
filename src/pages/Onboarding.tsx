import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  Building2,
  Palette,
  Bot,
  Rocket,
  CheckCircle,
  Brain,
  MessageSquare,
  Calendar,
  Users,
  BarChart,
  Globe,
  Smartphone
} from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    // Step 1 - Informações Pessoais
    name: "",
    email: "",
    phone: "",
    speciality: "",
    
    // Step 2 - Tipo de Plataforma
    platformType: "",
    businessName: "",
    description: "",
    
    // Step 3 - Personalização
    primaryColor: "#2563eb",
    logo: null,
    features: [],
    
    // Step 4 - IA Configuration
    aiPersonality: "",
    aiSpecialties: [],
    automationLevel: "medium",
    
    // Step 5 - Deploy
    domain: "",
    whatsappNumber: ""
  });

  const specialities = [
    "Nutricionista",
    "Psicólogo",
    "Fisioterapeuta", 
    "Médico Clínico",
    "Dentista",
    "Enfermeiro",
    "Outro"
  ];

  const platformTypes = [
    {
      id: "nutrition",
      name: "Plataforma Nutricional",
      description: "Para nutricionistas e profissionais da alimentação",
      icon: "🥗",
      features: ["Planos alimentares", "Cálculos nutricionais", "Acompanhamento de peso"]
    },
    {
      id: "psychology", 
      name: "Plataforma Psicológica",
      description: "Para psicólogos e terapeutas",
      icon: "🧠",
      features: ["Sessões online", "Análise de humor", "Acompanhamento emocional"]
    },
    {
      id: "medical",
      name: "Plataforma Médica",
      description: "Para clínicas e consultórios médicos",
      icon: "⚕️",
      features: ["Prontuários eletrônicos", "Prescrições", "Exames"]
    },
    {
      id: "fitness",
      name: "Plataforma Fitness", 
      description: "Para personal trainers e academias",
      icon: "💪",
      features: ["Treinos personalizados", "Evolução física", "Medidas corporais"]
    }
  ];

  const availableFeatures = [
    { id: "chat", name: "Chat IA & WhatsApp", icon: MessageSquare },
    { id: "scheduling", name: "Agendamento Inteligente", icon: Calendar },
    { id: "patients", name: "Gestão de Pacientes", icon: Users },
    { id: "analytics", name: "Relatórios & Analytics", icon: BarChart },
    { id: "website", name: "Site Responsivo", icon: Globe },
    { id: "app", name: "App Mobile (PWA)", icon: Smartphone }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const generatePlatform = () => {
    // Simular criação da plataforma
    console.log("Generating platform with data:", formData);
    
    // Redirecionar baseado no tipo de plataforma
    if (formData.platformType === "nutrition") {
      navigate('/nutricionista');
    } else {
      navigate('/clinic');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Vamos nos conhecer!</h2>
              <p className="text-muted-foreground">Conte-nos um pouco sobre você e sua profissão</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Dr. João Silva"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail Profissional</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="joao@clinica.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">WhatsApp</Label>
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="speciality">Especialidade</Label>
                <Select value={formData.speciality} onValueChange={(value) => setFormData({...formData, speciality: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((spec) => (
                      <SelectItem key={spec} value={spec.toLowerCase()}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Que tipo de plataforma você quer?</h2>
              <p className="text-muted-foreground">Escolha o modelo que melhor se adapta ao seu negócio</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {platformTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    formData.platformType === type.id ? 'border-2 border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setFormData({...formData, platformType: type.id})}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {formData.platformType && (
              <div className="space-y-4 max-w-md mx-auto mt-8">
                <div>
                  <Label htmlFor="businessName">Nome do Seu Negócio</Label>
                  <Input 
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Clínica Bem-Estar"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Textarea 
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Conte um pouco sobre seu negócio..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Palette className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Personalize sua plataforma</h2>
              <p className="text-muted-foreground">Escolha as funcionalidades e aparência da sua plataforma</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <Label className="text-base font-semibold mb-4 block">Funcionalidades Incluídas</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div 
                        key={feature.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.features.includes(feature.id) 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleFeatureToggle(feature.id)}
                      >
                        <Checkbox 
                          checked={formData.features.includes(feature.id)}
                          onChange={() => handleFeatureToggle(feature.id)}
                        />
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-semibold mb-4 block">Cor Principal</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                    className="w-16 h-16 rounded-lg border cursor-pointer"
                  />
                  <div>
                    <p className="font-medium">Cor do seu tema</p>
                    <p className="text-sm text-muted-foreground">{formData.primaryColor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Configure seu AI Agent</h2>
              <p className="text-muted-foreground">Defina a personalidade e especialidades do seu assistente de IA</p>
            </div>
            
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <Label htmlFor="aiPersonality">Personalidade do Agent</Label>
                <Textarea 
                  id="aiPersonality"
                  value={formData.aiPersonality}
                  onChange={(e) => setFormData({...formData, aiPersonality: e.target.value})}
                  placeholder="Ex: Profissional, empático, sempre disposto a ajudar. Especialista em nutrição com foco em resultados saudáveis..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="text-base font-semibold mb-3 block">Nível de Automação</Label>
                <div className="space-y-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.automationLevel === 'low' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData({...formData, automationLevel: 'low'})}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                        {formData.automationLevel === 'low' && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <div>
                        <h4 className="font-medium">Básico</h4>
                        <p className="text-sm text-muted-foreground">Responde dúvidas simples e coleta informações básicas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.automationLevel === 'medium' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData({...formData, automationLevel: 'medium'})}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                        {formData.automationLevel === 'medium' && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <div>
                        <h4 className="font-medium">Avançado <Badge className="ml-2">Recomendado</Badge></h4>
                        <p className="text-sm text-muted-foreground">Agenda consultas, qualifica leads e oferece orientações especializadas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.automationLevel === 'high' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setFormData({...formData, automationLevel: 'high'})}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                        {formData.automationLevel === 'high' && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                      <div>
                        <h4 className="font-medium">Completo</h4>
                        <p className="text-sm text-muted-foreground">Máxima automação com conversão avançada e follow-up inteligente</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pronto para o lançamento!</h2>
              <p className="text-muted-foreground">Configure os detalhes finais e sua plataforma será criada</p>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <Label htmlFor="domain">Domínio Personalizado (Opcional)</Label>
                <Input 
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  placeholder="meusite.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sem domínio? Será criado automaticamente: {formData.businessName?.toLowerCase().replace(/\s+/g, '')}.plataformai.com
                </p>
              </div>
              
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Business (Opcional)</Label>
                <Input 
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Para integração completa com WhatsApp Business API
                </p>
              </div>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Resumo da sua plataforma:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {formData.businessName}</div>
                    <div><strong>Tipo:</strong> {platformTypes.find(p => p.id === formData.platformType)?.name}</div>
                    <div><strong>Funcionalidades:</strong> {formData.features.length} selecionadas</div>
                    <div><strong>IA:</strong> Nível {formData.automationLevel === 'low' ? 'Básico' : formData.automationLevel === 'medium' ? 'Avançado' : 'Completo'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PlataformAI</span>
            </div>
          </div>
          <Badge variant="outline">
            Passo {currentStep} de {totalSteps}
          </Badge>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 py-6">
        <Progress value={(currentStep / totalSteps) * 100} className="max-w-2xl mx-auto" />
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="container mx-auto flex justify-between items-center max-w-4xl">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          {currentStep < totalSteps ? (
            <Button 
              className="action-primary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!formData.name || !formData.email || !formData.speciality)) ||
                (currentStep === 2 && (!formData.platformType || !formData.businessName)) ||
                (currentStep === 3 && formData.features.length === 0)
              }
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className="action-primary"
              onClick={generatePlatform}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Criar Plataforma
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;