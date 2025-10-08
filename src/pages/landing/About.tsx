export default function About() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Sobre o KorLab Nutri
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Somos uma plataforma dedicada a transformar a forma como nutricionistas gerenciam seus consultórios.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Nossa Missão
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Democratizar o acesso à tecnologia de ponta para nutricionistas, permitindo que foquem no que realmente importa: o cuidado com seus pacientes.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Nossa Visão
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ser a plataforma número 1 de gestão para nutricionistas no Brasil, reconhecida pela inovação e pelo impacto positivo na saúde da população.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
            Nossos Valores
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Inovação contínua</li>
            <li>Foco no cliente</li>
            <li>Privacidade e segurança</li>
            <li>Transparência</li>
            <li>Excelência no atendimento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
