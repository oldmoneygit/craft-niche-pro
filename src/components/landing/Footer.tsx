import { Link } from 'react-router-dom';
import { useState } from 'react';
import { subscribeNewsletter } from '@/lib/supabase-landing';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await subscribeNewsletter(email);
      toast({
        title: "Sucesso!",
        description: "Você foi inscrito na nossa newsletter.",
      });
      setEmail('');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível completar a inscrição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 32 32" className="w-6 h-6" fill="white">
                  <path d="M16 2L4 7v10c0 7.5 5 14 12 15 7-1 12-7.5 12-15V7L16 2z"/>
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">KorLab Nutri</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Plataforma completa para nutricionistas gerenciarem seus consultórios.
            </p>
            <p className="text-xs text-gray-500 font-mono">
              CNPJ: 63.084.240/0001-31
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rua Lina Margarida de Oliveira, 330<br/>
              Parque Bom Retiro - Paulínia/SP<br/>
              CEP: 13142-110
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Início</Link></li>
              <li><a href="/#features" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Funcionalidades</a></li>
              <li><a href="/#pricing" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Preços</a></li>
              <li><Link to="/sobre" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Sobre Nós</Link></li>
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacidade" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Termos de Uso</Link></li>
              <li><Link to="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Política de Cookies</Link></li>
              <li><Link to="/seguranca" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">Segurança</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Newsletter</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Receba novidades e dicas para o seu consultório.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Inscrevendo...' : 'Inscrever'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 KorLab Nutri - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
