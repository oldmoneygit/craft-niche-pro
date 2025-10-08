export default function Privacy() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Política de Privacidade
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <p className="text-gray-600 dark:text-gray-400">
            Última atualização: Janeiro de 2025
          </p>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introdução
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              O KorLab Nutri está comprometido em proteger a privacidade dos nossos usuários. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              2. Informações que Coletamos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Coletamos informações que você nos fornece diretamente, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Nome e informações de contato</li>
              <li>Dados profissionais (CRN)</li>
              <li>Informações de pagamento</li>
              <li>Dados de uso da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              3. Como Usamos suas Informações
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar pagamentos</li>
              <li>Enviar comunicações importantes</li>
              <li>Personalizar sua experiência</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              4. Conformidade com a LGPD
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Estamos em total conformidade com a Lei Geral de Proteção de Dados (LGPD). Você tem o direito de acessar, corrigir, excluir ou transferir seus dados a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              5. Contato
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Para dúvidas sobre privacidade, entre em contato: privacidade@korlabnutri.com.br
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
