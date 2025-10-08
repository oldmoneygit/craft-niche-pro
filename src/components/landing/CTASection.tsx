import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Comece sua transformação hoje</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Pronto para revolucionar seu consultório?
        </h2>
        
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Junte-se a centenas de nutricionistas que já economizam tempo e aumentam resultados com o KorLab Nutri
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Começar Grátis por 14 Dias
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/contato"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all"
          >
            Falar com Especialista
          </a>
        </div>

        <p className="mt-6 text-white/80 text-sm">
          ✨ Sem cartão de crédito • ❌ Cancele quando quiser • 🔒 Dados 100% seguros
        </p>
      </div>
    </section>
  );
}
