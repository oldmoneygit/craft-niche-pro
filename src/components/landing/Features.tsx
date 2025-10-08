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
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gerencie seu consultório de nutrição com tecnologia de ponta e recursos completos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
