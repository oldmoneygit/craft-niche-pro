import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  UserCheck, 
  ArrowRight,
  Stethoscope,
  Apple,
  Calendar,
  MessageSquare,
  BarChart,
  Users
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Sistema de Gestão em Saúde</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma completa para profissionais da saúde com IA integrada e automação inteligente
          </p>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Nutricionista Platform */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Nutricionista
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Apple className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Sistema Nutricionista</CardTitle>
              <p className="text-muted-foreground">
                Plataforma completa para nutricionistas com IA especializada em nutrição
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>Gestão completa de pacientes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>Agendamento inteligente</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span>Chat IA & WhatsApp integrado</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BarChart className="h-4 w-4 text-green-600" />
                  <span>Relatórios e analytics avançados</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">AI Agent Especializado:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Atendimento automático 24/7</li>
                  <li>• Agendamentos inteligentes</li>
                  <li>• Qualificação de leads</li>
                  <li>• Planos alimentares personalizados</li>
                </ul>
              </div>

              <Button 
                className="w-full action-primary group"
                onClick={() => navigate('/nutricionista')}
              >
                Acessar Plataforma Nutricionista
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Clinica Platform */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Clínica
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Sistema Clínica</CardTitle>
              <p className="text-muted-foreground">
                Gestão hospitalar com IA terapêutica e automação médica
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Gestão de pacientes clínicos</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Agendamento de consultas</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span>IA Terapêutica integrada</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BarChart className="h-4 w-4 text-blue-600" />
                  <span>Relatórios médicos detalhados</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">IA Terapêutica:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Suporte emocional 24/7</li>
                  <li>• Análise de humor</li>
                  <li>• Sessões interativas</li>
                  <li>• Acompanhamento contínuo</li>
                </ul>
              </div>

              <Button 
                className="w-full action-primary group"
                onClick={() => navigate('/clinic')}
              >
                Acessar Plataforma Clínica
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Recursos Avançados Integrados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">IA Conversacional</h3>
              <p className="text-sm text-muted-foreground">
                Agentes especializados para cada área com treinamento específico
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Agendamento Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Sistema automatizado de agendamentos com integração WhatsApp
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Analytics Avançado</h3>
              <p className="text-sm text-muted-foreground">
                Relatórios detalhados com insights acionáveis para seu negócio
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
