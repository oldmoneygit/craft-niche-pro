import { Check } from 'lucide-react';
import { trackPricingClick } from '@/lib/supabase-landing';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      description: 'Perfeito para começar',
      price: '97',
      period: '/mês',
      featured: false,
      features: [
        'Até 30 clientes ativos',
        'Planos alimentares com IA',
        'Agendamento básico',
        'Suporte por email',
        'Armazenamento 5GB',
      ],
    },
    {
      name: 'Professional',
      description: 'Para consultórios em crescimento',
      price: '197',
      period: '/mês',
      featured: true,
      badge: 'Mais Popular',
      savings: 'Economize R$ 576/ano',
      features: [
        'Clientes ilimitados',
        'IA avançada + templates',
        'Agendamento + WhatsApp',
        'Suporte prioritário',
        'Armazenamento 50GB',
        'Questionários personalizados',
        'Relatórios avançados',
        'Integrações completas',
      ],
    },
    {
      name: 'Enterprise',
      description: 'Para equipes e clínicas',
      price: 'Custom',
      period: '',
      featured: false,
      features: [
        'Tudo do Professional',
        'Múltiplos profissionais',
        'Gestão de equipe',
        'API personalizada',
        'Armazenamento ilimitado',
        'Suporte 24/7',
        'Onboarding dedicado',
        'SLA garantido',
      ],
    },
  ];

  const handlePricingClick = (planName: string, buttonText: string) => {
    trackPricingClick(planName, buttonText, 'home');
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Comece grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.featured
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-105'
                  : 'border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {plan.price !== 'Custom' && (
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                      R$
                    </span>
                  )}
                  <span className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  )}
                </div>
                {plan.savings && (
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mt-2">
                    {plan.savings}
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePricingClick(plan.name, plan.price === 'Custom' ? 'Falar com Vendas' : 'Começar Grátis')}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  plan.featured
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-1'
                    : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                {plan.price === 'Custom' ? 'Falar com Vendas' : 'Começar Grátis'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          💳 Sem cartão de crédito • ❌ Cancele quando quiser • 🔒 Dados 100% seguros
        </p>
      </div>
    </section>
  );
}
