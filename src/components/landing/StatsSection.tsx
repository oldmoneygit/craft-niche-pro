export default function StatsSection() {
  const stats = [
    { number: '50+', label: 'Módulos Integrados', suffix: '' },
    { number: '300+', label: 'Nutricionistas Ativos', suffix: '' },
    { number: '95%', label: 'Satisfação dos Clientes', suffix: '' },
    { number: '70%', label: 'Economia de Tempo', suffix: '' },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
