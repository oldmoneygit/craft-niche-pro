import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>Plataforma com IA para Nutricionistas</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Gerencie seu consultório com
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> inteligência</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
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
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all shadow-lg"
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                to="/contato"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground font-semibold rounded-xl border-2 border-border hover:border-primary transition-all"
              >
                Agendar Demo
              </Link>
            </div>

            {/* Trust Badge */}
            <p className="mt-6 text-sm text-muted-foreground">
              ✨ Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl p-8 shadow-2xl border border-primary/20">
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-xl flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Plano Criado com IA</h3>
                    <p className="text-sm text-muted-foreground">Em menos de 2 minutos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-primary/20 rounded-full w-full" />
                  <div className="h-3 bg-primary/20 rounded-full w-3/4" />
                  <div className="h-3 bg-primary/20 rounded-full w-5/6" />
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-xl border border-border backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-xs text-muted-foreground">Satisfação</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-xl border border-border backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">300+</div>
                <div className="text-xs text-muted-foreground">Nutricionistas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
