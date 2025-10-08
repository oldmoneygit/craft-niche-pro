import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Dra. Ana Silva',
      role: 'Nutricionista Clínica • CRN3 12345',
      avatar: 'AS',
      text: 'O KorLab revolucionou meu consultório. Economizo mais de 10 horas por semana na criação de planos alimentares. A IA é impressionante!',
      rating: 5,
    },
    {
      name: 'Dr. Carlos Santos',
      role: 'Nutricionista Esportivo • CRN4 67890',
      avatar: 'CS',
      text: 'A melhor ferramenta para gestão de clientes que já usei. O agendamento automático e os lembretes via WhatsApp aumentaram minha taxa de comparecimento em 40%.',
      rating: 5,
    },
    {
      name: 'Dra. Mariana Costa',
      role: 'Nutricionista Funcional • CRN2 54321',
      avatar: 'MC',
      text: 'Interface intuitiva e recursos poderosos. Meus pacientes adoram receber os planos digitais personalizados. Recomendo para todos os colegas!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            O que os nutricionistas dizem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Junte-se a centenas de profissionais que já transformaram seus consultórios
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-950 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
