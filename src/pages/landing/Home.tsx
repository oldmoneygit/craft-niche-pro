import Hero from '@/components/landing/Hero';

export default function Home() {
  return (
    <div className="pt-20">
      <Hero />
      
      {/* Features Section Placeholder */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Gerencie clientes, crie planos alimentares, agende consultas e muito mais.
          </p>
        </div>
      </section>

      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-20 px-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Comece grátis e escale conforme seu consultório cresce.
          </p>
        </div>
      </section>

      {/* FAQ Section Placeholder */}
      <section id="faq" className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center">
            Tire suas dúvidas sobre a plataforma.
          </p>
        </div>
      </section>
    </div>
  );
}
