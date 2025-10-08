import { Shield, Lock, Server, Eye } from 'lucide-react';

export default function Security() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Segurança e Conformidade
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Seus dados e os de seus pacientes estão protegidos com os mais altos padrões de segurança.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Conformidade LGPD
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              100% compatível com a Lei Geral de Proteção de Dados. Todos os dados são tratados com máxima segurança e transparência.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Criptografia Ponta a Ponta
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Todos os dados são criptografados em trânsito e em repouso usando algoritmos de última geração.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Infraestrutura Segura
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Hospedados em servidores seguros com backups diários e redundância para garantir disponibilidade.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Monitoramento 24/7
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitoramento contínuo de segurança para detectar e prevenir qualquer atividade suspeita.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Certificações e Conformidade
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full" />
              <span>LGPD - Lei Geral de Proteção de Dados</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full" />
              <span>SSL/TLS - Certificado de segurança</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full" />
              <span>Backups diários automatizados</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full" />
              <span>Auditoria de segurança regular</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
