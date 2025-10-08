import { Link } from 'react-router-dom';
import { Mail, MessageCircle, FileText } from 'lucide-react';

export default function Help() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Central de Ajuda
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Como podemos ajudar você hoje?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link
            to="/contato"
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Enviar Email
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Entre em contato por email e responderemos em breve.
            </p>
          </Link>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Chat Online
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Converse com nossa equipe de suporte em tempo real.
            </p>
          </div>

          <Link
            to="/blog"
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Base de Conhecimento
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tutoriais e guias para usar a plataforma.
            </p>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Como faço para começar a usar o KorLab Nutri?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                É simples! Basta se cadastrar, confirmar seu email e começar a usar. Não precisa de cartão de crédito para o período de teste gratuito.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sim! Você pode cancelar sua assinatura a qualquer momento, sem burocracias ou taxas de cancelamento.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Meus dados estão seguros?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutamente. Utilizamos criptografia de ponta e estamos em total conformidade com a LGPD. Seus dados e os de seus pacientes estão 100% seguros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
