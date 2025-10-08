import { Brain, Calendar, Users, MessageSquare, FileText, Shield, Zap, BarChart3, Sparkles } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: 'IA para Planos Alimentares',
      description: 'Crie planos personalizados em minutos com inteligência artificial avançada.',
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Centralize informações, histórico e evolução de todos os seus pacientes.',
    },
    {
      icon: Calendar,
      title: 'Agendamento Inteligente',
      description: 'Sistema completo de agendamento com lembretes automáticos via WhatsApp.',
    },
    {
      icon: MessageSquare,
      title: 'Comunicação Automatizada',
      description: 'Envie mensagens, lembretes e follow-ups automaticamente para seus clientes.',
    },
    {
      icon: FileText,
      title: 'Questionários Personalizados',
      description: 'Crie e envie anamneses e questionários digitais personalizados.',
    },
    {
      icon: Shield,
      title: 'LGPD Compliant',
      description: 'Total conformidade com a Lei Geral de Proteção de Dados desde o início.',
    },
    {
      icon: Zap,
      title: 'Integrações Poderosas',
      description: 'Conecte com WhatsApp, Google Calendar e outras ferramentas essenciais.',
    },
    {
      icon: BarChart3,
      title: 'Relatórios e Analytics',
      description: 'Acompanhe métricas de crescimento e resultados dos seus pacientes.',
    },
    {
      icon: Sparkles,
      title: 'Interface Intuitiva',
      description: 'Design moderno e fácil de usar, sem necessidade de treinamento.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-xl text-muted-foreground">
            Gerencie seu consultório de nutrição com tecnologia de ponta e recursos completos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card p-8 rounded-2xl border border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-primary/20">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
