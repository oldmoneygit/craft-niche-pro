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
  Users,
  Zap,
  Bot,
  Sparkles,
  CheckCircle,
  Star,
  Play,
  Globe,
  Smartphone,
  Brain,
  Target,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">PlataformAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#exemplos" className="text-muted-foreground hover:text-foreground transition-colors">Exemplos</a>
            <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
            <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">Preços</a>
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
            <Button className="action-primary" onClick={() => navigate('/onboarding')}>
              Criar Plataforma
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" />
            IA Generativa para Plataformas
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Transforme seu Negócio Local com IA
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Plataforma no-code que gera sistemas completos para pequenas empresas com IA conversacional, 
            automação de atendimento e gestão inteligente de clientes. Para qualquer nicho de negócio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="action-primary text-lg px-8 py-6"
              onClick={() => navigate('/onboarding')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Criar Minha Plataforma
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('exemplos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="h-5 w-5 mr-2" />
              Ver Exemplos
            </Button>
          </div>

          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Sem código necessário</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>IA integrada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Deploy em minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Examples */}
      <section id="exemplos" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              Exemplos Reais
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Plataformas Criadas com PlataformAI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Veja exemplos de plataformas completas geradas automaticamente para diferentes nichos de negócio
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {/* Nutricionista Platform */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Apple className="h-3 w-3 mr-1" />
                  Nutricionista
                </Badge>
              </div>
              
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Apple className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Dr. Gabriel Santos</CardTitle>
                <p className="text-muted-foreground">
                  Plataforma completa para nutricionistas com IA especializada
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Agent Nutricional:
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Atendimento automático 24/7</li>
                    <li>• Agendamentos inteligentes</li>
                    <li>• Planos alimentares personalizados</li>
                    <li>• Acompanhamento nutricional</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>450+ pacientes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>156 consultas/mês</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <span>94% automação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>R$ 2.8k economia</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white group"
                  onClick={() => navigate('/nutricionista')}
                >
                  Ver Plataforma em Ação
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Clinica Platform */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
              <div className="absolute top-4 right-4">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Clínica
                </Badge>
              </div>
              
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Clínica Bem-Estar</CardTitle>
                <p className="text-muted-foreground">
                  Sistema hospitalar com IA terapêutica integrada
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    IA Terapêutica:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Suporte emocional 24/7</li>
                    <li>• Análise de humor inteligente</li>
                    <li>• Sessões interativas personalizadas</li>
                    <li>• Acompanhamento contínuo</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>280+ pacientes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>95 consultas/mês</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span>87% automação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span>4.9/5 satisfação</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white group"
                  onClick={() => navigate('/clinic')}
                >
                  Ver Plataforma em Ação
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="action-primary"
              onClick={() => navigate('/onboarding')}
            >
              Criar Minha Plataforma Agora
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Nichos Atendidos */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
              <Target className="h-3 w-3 mr-1" />
              Diversos Nichos Atendidos
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Para Qualquer Tipo de Negócio Local</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa IA se adapta a qualquer setor, criando plataformas personalizadas para sua área de atuação
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Apple className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Nutrição & Saúde</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Clínicas & Consultórios</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Imobiliárias</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Salões de Beleza</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Academias</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Delivery & Restaurantes</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Advocacia</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Autopeças</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Estética</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Arquitetura</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">Contabilidade</span>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">E muitos outros...</span>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Não encontrou seu nicho? Não tem problema! Nossa IA se adapta a qualquer tipo de negócio local.
            </p>
            <Button 
              size="lg" 
              className="action-primary"
              onClick={() => navigate('/onboarding')}
            >
              Criar Plataforma para Meu Negócio
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
              Recursos Inclusos
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Tudo que Você Precisa, Automatizado</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cada plataforma gerada inclui todos os recursos essenciais com IA integrada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seu Funcionário Virtual Exclusivo</h3>
              <p className="text-muted-foreground mb-4">
                Cada negócio recebe seu próprio AI Agent exclusivo, treinado especificamente para sua área. 
                Funciona como um funcionário dedicado que trabalha 24/7 sem parar, atendendo no WhatsApp 
                de forma natural como se fosse uma pessoa real.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Agente 100% exclusivo</span> - só seu negócio tem acesso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium">WhatsApp automático</span> - atende naturalmente como pessoa
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Agenda via WhatsApp</span> - marca consultas/serviços
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Lembretes automáticos</span> - reativa clientes inativos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Trabalha 24/7</span> - nunca para, nunca tira férias
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agendamento Inteligente</h3>
              <p className="text-muted-foreground mb-4">
                Sistema automatizado que gerencia sua agenda, confirma consultas e 
                envia lembretes via WhatsApp e SMS.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Agenda sincronizada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Lembretes automáticos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Reagendamento fácil
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestão de Clientes</h3>
              <p className="text-muted-foreground mb-4">
                CRM completo para gerenciar histórico, evolução e comunicação 
                com todos os seus clientes em um só lugar.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Fichas completas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Histórico detalhado
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Evolução visual
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat Multicanal</h3>
              <p className="text-muted-foreground mb-4">
                Centralize todas as conversas do WhatsApp, site e aplicativo 
                em uma única interface com IA integrada.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  WhatsApp Business
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Chat no site
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Respostas automáticas
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics & Relatórios</h3>
              <p className="text-muted-foreground mb-4">
                Dashboards completos com métricas de conversão, satisfação 
                e performance do seu negócio.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Métricas em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Relatórios automáticos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Insights acionáveis
                </li>
              </ul>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Responsivo & PWA</h3>
              <p className="text-muted-foreground mb-4">
                Sua plataforma funciona perfeitamente em qualquer dispositivo 
                e pode ser instalada como aplicativo.
              </p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Design responsivo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  App instalável
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Offline funcional
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Revolucionar seu Atendimento?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Crie sua plataforma personalizada em minutos e tenha um assistente de IA 
            trabalhando 24/7 para converter mais pacientes e automatizar seu negócio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/onboarding')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Começar Agora - Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10"
              onClick={() => document.getElementById('exemplos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Mais Exemplos
            </Button>
          </div>

          <div className="mt-12 flex justify-center items-center gap-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Teste grátis por 14 dias</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PlataformAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 PlataformAI. Transformando o atendimento em saúde com IA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
