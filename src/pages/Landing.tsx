import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Brain,
  Zap,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: 'IA Personalizada',
      description: 'Agente inteligente treinado especificamente para o seu negócio',
    },
    {
      icon: Zap,
      title: 'Criação Automática',
      description: 'Plataforma gerada automaticamente via questionário inteligente',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integrado',
      description: 'Comunicação direta com clientes via WhatsApp Business',
    },
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Dados protegidos com criptografia e conformidade LGPD',
    },
  ];

  const benefits = [
    'Plataforma personalizada em minutos',
    'Agendamento automatizado',
    'Atendimento 24/7 com IA',
    'Relatórios e analytics avançados',
    'Integração WhatsApp nativa',
    'Suporte especializado',
  ];

  const testimonials = [
    {
      name: 'Dra. Ana Silva',
      role: 'Psicóloga Clínica',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      quote: 'Revolucionou minha clínica! O agendamento ficou 100% automatizado e meus pacientes adoram o atendimento via WhatsApp.',
    },
    {
      name: 'Dr. Carlos Mendes',
      role: 'Neuropsicólogo',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      quote: 'Em 2 semanas dobrei minha agenda. A IA entende perfeitamente meus procedimentos e agenda com precisão.',
    },
    {
      name: 'Dra. Lucia Santos',
      role: 'Terapia de Casal',
      image: 'https://images.unsplash.com/photo-1594824930756-5f4695b4bb3a?w=150&h=150&fit=crop&crop=face',
      quote: 'Meus pacientes se sentem mais à vontade para marcar consultas. O processo ficou muito mais humanizado.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transforme Seu
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Negócio Local
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Crie uma plataforma completa de gestão com IA personalizada e integração WhatsApp em apenas 10 minutos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-glow"
                asChild
              >
                <Link to="/create">
                  Criar Minha Plataforma
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to="/demo">Ver Demonstração</Link>
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-4">
              ✨ Sem necessidade de conhecimento técnico • 🚀 Resultado em minutos • 💰 A partir de R$ 197/mês
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Funcionalidades Únicas</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cada plataforma é personalizada para o seu tipo de negócio com IA especializada
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center hover:shadow-hover transition-shadow bg-gradient-card">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Tudo que seu negócio precisa em uma plataforma
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Nossa IA analisa seu tipo de negócio e cria uma solução completa personalizada
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className="mt-8 bg-gradient-primary hover:shadow-hover"
                asChild
              >
                <Link to="/create">Começar Agora</Link>
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                alt="Dashboard da plataforma"
                className="rounded-lg shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
            <p className="text-xl text-muted-foreground">
              Resultados reais de profissionais que transformaram seus negócios
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 bg-gradient-card">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Crie sua plataforma personalizada em minutos e comece a atender melhor seus clientes hoje mesmo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-glow"
              asChild
            >
              <Link to="/create">
                Criar Agora - R$ 197/mês
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link to="/contact">Falar com Especialista</Link>
            </Button>
          </div>
          <p className="text-sm text-white/70 mt-6">
            🎯 7 dias grátis • ⚡ Cancelamento a qualquer momento • 🛡️ Dados protegidos
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;