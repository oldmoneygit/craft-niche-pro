export default function Cookies() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Política de Cookies
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: Janeiro de 2025
          </p>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              O que são Cookies?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles nos ajudam a melhorar sua experiência e fornecer funcionalidades personalizadas.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Como Usamos Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Manter você conectado à sua conta</li>
              <li>Lembrar suas preferências (tema, idioma)</li>
              <li>Analisar o uso da plataforma para melhorias</li>
              <li>Garantir a segurança da sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tipos de Cookies
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Cookies Essenciais
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Necessários para o funcionamento básico do site. Não podem ser desativados.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Cookies de Preferências
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Lembram suas configurações e preferências pessoais.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Cookies de Análise
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Nos ajudam a entender como você usa o site para melhorar a experiência.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Gerenciar Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Você pode controlar e gerenciar cookies através das configurações do seu navegador. Note que desabilitar certos cookies pode afetar a funcionalidade do site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
