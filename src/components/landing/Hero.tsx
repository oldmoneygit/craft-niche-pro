import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-black" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Plataforma com IA para Nutricionistas</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Gerencie seu consultório com
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent"> inteligência</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Economize até 70% do tempo com planos alimentares personalizados, agendamento inteligente e comunicação automatizada.
            </p>

            {/* Benefits List */}
            <ul className="space-y-3 mb-8">
              {[
                'IA que cria planos alimentares em minutos',
                'Gestão completa de clientes e consultas',
                'Comunicação automática via WhatsApp',
                'LGPD compliant desde o início'
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/contato"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
              >
                Agendar Demo
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              ✨ Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Plano Criado com IA</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Em menos de 2 minutos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-full" />
                  <div className="h-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-3/4" />
                  <div className="h-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full w-5/6" />
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">95%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Satisfação</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">300+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Nutricionistas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
