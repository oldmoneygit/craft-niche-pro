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
  Smartphone,
  Apple,
  Stethoscope,
  TrendingUp,
  Briefcase,
  Home,
  Gavel,
  Car,
  Utensils,
  Scissors,
  Calculator,
  Wrench,
  Camera
} from "lucide-react";

// Configuração dos tipos de negócios
const businessTypes = {
  saude: {
    name: "Saúde & Bem-Estar",
    icon: Stethoscope,
    color: "bg-blue-500",
    subcategories: [
      { id: "nutricionista", name: "Nutricionista", icon: Apple, questions: ["Você atende qual faixa etária?", "Qual sua especialização (emagrecimento, ganho de massa, etc.)?", "Quantos pacientes você atende por mês?"] },
      { id: "psicologo", name: "Psicólogo", icon: Brain, questions: ["Qual sua abordagem terapêutica?", "Atende crianças, adolescentes ou adultos?", "Oferece terapia online?"] },
      { id: "fisioterapeuta", name: "Fisioterapeuta", icon: TrendingUp, questions: ["Qual sua especialidade (ortopedia, neurologia, etc.)?", "Atende em domicílio?", "Trabalha com RPG, pilates?"] },
      { id: "medico", name: "Médico", icon: Stethoscope, questions: ["Qual sua especialidade médica?", "Trabalha em clínica própria ou hospital?", "Atende convênios?"] },
      { id: "dentista", name: "Dentista", icon: Sparkles, questions: ["Oferece quais tratamentos?", "Trabalha com estética dental?", "Atende emergências?"] },
    ]
  },
  servicos: {
    name: "Serviços Profissionais",
    icon: Briefcase,
    color: "bg-purple-500",
    subcategories: [
      { id: "advocacia", name: "Advocacia", icon: Gavel, questions: ["Qual sua área de atuação (civil, criminal, trabalhista)?", "Atende pessoa física ou jurídica?", "Oferece consulta online?"] },
      { id: "contabilidade", name: "Contabilidade", icon: Calculator, questions: ["Atende qual porte de empresas?", "Oferece serviços de abertura de empresa?", "Trabalha com planejamento tributário?"] },
      { id: "arquitetura", name: "Arquitetura", icon: Building2, questions: ["Projeta residencial ou comercial?", "Oferece acompanhamento de obra?", "Trabalha com interiores?"] },
    ]
  },
  comercio: {
    name: "Comércio & Varejo",
    icon: Building2,
    color: "bg-green-500",
    subcategories: [
      { id: "autopecas", name: "Loja de Autopeças", icon: Car, questions: ["Trabalha com quais marcas de veículos?", "Oferece instalação das peças?", "Atende oficinas ou público geral?"] },
      { id: "loja-roupas", name: "Loja de Roupas", icon: Sparkles, questions: ["Qual seu público-alvo?", "Trabalha com qual estilo (casual, formal, infantil)?", "Oferece delivery?"] },
    ]
  },
  alimentacao: {
    name: "Alimentação",
    icon: Utensils,
    color: "bg-orange-500",
    subcategories: [
      { id: "restaurante", name: "Restaurante", icon: Utensils, questions: ["Qual tipo de culinária?", "Oferece delivery?", "Atende eventos?"] },
      { id: "lanchonete", name: "Lanchonete", icon: Utensils, questions: ["Qual horário de funcionamento?", "Oferece opções veganas/vegetarianas?", "Trabalha com delivery?"] },
    ]
  },
  beleza: {
    name: "Beleza & Estética",
    icon: Scissors,
    color: "bg-pink-500",
    subcategories: [
      { id: "salao", name: "Salão de Beleza", icon: Scissors, questions: ["Oferece quais serviços?", "Atende homens e mulheres?", "Trabalha com produtos específicos?"] },
      { id: "estetica", name: "Clínica de Estética", icon: Sparkles, questions: ["Oferece quais procedimentos?", "Trabalha com qual tecnologia?", "Atende qual faixa etária?"] },
    ]
  },
  fitness: {
    name: "Fitness & Esportes",
    icon: TrendingUp,
    color: "bg-red-500",
    subcategories: [
      { id: "academia", name: "Academia", icon: TrendingUp, questions: ["Qual modalidades oferece?", "Tem personal trainer?", "Oferece aulas em grupo?"] },
      { id: "personal", name: "Personal Trainer", icon: Users, questions: ["Treina em domicílio ou academia?", "Qual sua especialidade?", "Atende grupos ou individual?"] },
    ]
  },
  imoveis: {
    name: "Imóveis",
    icon: Home,
    color: "bg-teal-500",
    subcategories: [
      { id: "imobiliaria", name: "Imobiliária", icon: Home, questions: ["Trabalha com venda ou locação?", "Qual região de atuação?", "Atende residencial ou comercial?"] },
    ]
  },
  tecnicos: {
    name: "Serviços Técnicos",
    icon: Wrench,
    color: "bg-gray-500",
    subcategories: [
      { id: "eletricista", name: "Eletricista", icon: Wrench, questions: ["Atende residencial ou industrial?", "Oferece serviço 24h?", "Trabalha com qual voltagem?"] },
      { id: "fotografo", name: "Fotógrafo", icon: Camera, questions: ["Qual tipo de fotografia (casamento, produto, social)?", "Oferece edição das fotos?", "Trabalha em estúdio ou external?"] },
    ]
  }
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    // Step 1 - Informações Pessoais & Tipo de Negócio
    name: "",
    email: "",
    phone: "",
    businessCategory: "",
    businessType: "",
    
    // Step 2 - Detalhes do Negócio (dinâmico baseado no tipo)
    businessName: "",
    description: "",
    specificAnswers: {},
    
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

  const availableFeatures = [
    { id: "chat", name: "Chat IA & WhatsApp", icon: MessageSquare },
    { id: "scheduling", name: "Agendamento Inteligente", icon: Calendar },
    { id: "customers", name: "Gestão de Clientes", icon: Users },
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
    if (formData.businessType === "nutricionista") {
      navigate('/nutricionista');
    } else {
      navigate('/clinic');
    }
  };

  const getSelectedBusinessData = () => {
    if (!formData.businessCategory || !formData.businessType) return null;
    
    const category = businessTypes[formData.businessCategory];
    if (!category) return null;
    
    return category.subcategories.find(sub => sub.id === formData.businessType);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Vamos nos conhecer!</h2>
              <p className="text-muted-foreground">Conte-nos sobre você e que tipo de negócio você tem</p>
            </div>
            
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="João Silva"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="joao@exemplo.com"
                  />
                </div>
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
              
              {/* Categoria de Negócio */}
              <div className="pt-4">
                <Label className="text-base font-semibold mb-4 block">Qual o tipo do seu negócio?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(businessTypes).map(([key, category]) => {
                    const IconComponent = category.icon;
                    return (
                      <Card 
                        key={key}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          formData.businessCategory === key ? 'border-2 border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setFormData({...formData, businessCategory: key, businessType: ""})}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {/* Subcategoria específica */}
              {formData.businessCategory && (
                <div className="pt-4">
                  <Label className="text-base font-semibold mb-4 block">
                    Especificamente, qual o seu negócio em {businessTypes[formData.businessCategory]?.name}?
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {businessTypes[formData.businessCategory]?.subcategories.map((subcat) => {
                      const IconComponent = subcat.icon;
                      return (
                        <Card 
                          key={subcat.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            formData.businessType === subcat.id ? 'border-2 border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setFormData({...formData, businessType: subcat.id})}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <span className="font-medium">{subcat.name}</span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        const selectedBusiness = getSelectedBusinessData();
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Detalhes do seu {selectedBusiness?.name}</h2>
              <p className="text-muted-foreground">Vamos personalizar sua plataforma para suas necessidades específicas</p>
            </div>
            
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <Label htmlFor="businessName">Nome do Seu Negócio</Label>
                <Input 
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  placeholder={`Ex: ${selectedBusiness?.name === "Nutricionista" ? "Clínica Nutrir Bem" : "Meu Negócio"}`}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição do Negócio</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Conte um pouco sobre seu negócio, diferenciais, público-alvo..."
                  rows={3}
                />
              </div>
              
              {/* Perguntas específicas do tipo de negócio */}
              {selectedBusiness?.questions && (
                <div className="pt-4">
                  <Label className="text-base font-semibold mb-4 block">
                    Algumas perguntas específicas para {selectedBusiness.name}:
                  </Label>
                  <div className="space-y-4">
                    {selectedBusiness.questions.map((question, index) => (
                      <div key={index}>
                        <Label className="text-sm font-medium">{question}</Label>
                        <Textarea 
                          value={formData.specificAnswers[index] || ""}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specificAnswers: {
                              ...formData.specificAnswers,
                              [index]: e.target.value
                            }
                          })}
                          placeholder="Sua resposta..."
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              <p className="text-muted-foreground">Defina como seu assistente virtual especializado vai atender seus clientes</p>
            </div>
            
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <Label htmlFor="aiPersonality">Personalidade e Especialização do Agent</Label>
                <Textarea 
                  id="aiPersonality"
                  value={formData.aiPersonality}
                  onChange={(e) => setFormData({...formData, aiPersonality: e.target.value})}
                  placeholder={`Ex: Sou um assistente especializado em ${getSelectedBusinessData()?.name || "seu negócio"}. Sou profissional, empático e sempre busco ajudar da melhor forma. Tenho conhecimento específico sobre ${formData.businessType === "nutricionista" ? "nutrição, dietas e hábitos saudáveis" : "a área do negócio"}...`}
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
                    <div><strong>Tipo:</strong> {getSelectedBusinessData()?.name || "Não definido"}</div>
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
                (currentStep === 1 && (!formData.name || !formData.email || !formData.businessType)) ||
                (currentStep === 2 && (!formData.businessName)) ||
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