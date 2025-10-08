export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Cadastre seus Clientes',
      description: 'Adicione informações completas dos seus pacientes em segundos.',
    },
    {
      number: '2',
      title: 'Use a IA para Criar Planos',
      description: 'Deixe a inteligência artificial criar planos alimentares personalizados.',
    },
    {
      number: '3',
      title: 'Agende Consultas',
      description: 'Gerencie agendamentos com confirmação automática via WhatsApp.',
    },
    {
      number: '4',
      title: 'Acompanhe Resultados',
      description: 'Monitore a evolução e engajamento dos seus pacientes em tempo real.',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-muted-foreground">
            Comece a usar em minutos e transforme seu consultório
          </p>
        </div>

        <div className="relative">
          {/* Linha conectora - desktop only */}
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-primary to-primary/90 rounded-full shadow-lg">
                  <span className="text-3xl font-bold text-primary-foreground">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
