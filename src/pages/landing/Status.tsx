import { CheckCircle2, Clock } from 'lucide-react';

export default function Status() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Status do Sistema
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            <span>Todos os sistemas operacionais</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Plataforma Web
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Funcionando normalmente
                  </p>
                </div>
              </div>
              <span className="text-emerald-600 font-medium">Operacional</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    API e Banco de Dados
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Funcionando normalmente
                  </p>
                </div>
              </div>
              <span className="text-emerald-600 font-medium">Operacional</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Integrações WhatsApp
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Funcionando normalmente
                  </p>
                </div>
              </div>
              <span className="text-emerald-600 font-medium">Operacional</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    IA - Geração de Planos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Funcionando normalmente
                  </p>
                </div>
              </div>
              <span className="text-emerald-600 font-medium">Operacional</span>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-gray-400 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Uptime: 99.9%
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Últimos 30 dias: Nenhuma interrupção reportada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
