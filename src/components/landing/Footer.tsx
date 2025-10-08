import { Link } from 'react-router-dom';
import { useState } from 'react';
import { subscribeNewsletter } from '@/lib/supabase-landing';
import { toast } from 'sonner';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await subscribeNewsletter(email, undefined, 'footer');
      toast.success('Inscrição realizada com sucesso!');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao se inscrever. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/90 rounded-lg flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 32 32" className="w-6 h-6" fill="white">
                  <path d="M16 2L4 7v10c0 7.5 5 14 12 15 7-1 12-7.5 12-15V7L16 2z"/>
                </svg>
              </div>
              <span className="font-bold text-lg text-foreground">KorLab Nutri</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Plataforma completa para nutricionistas gerenciarem seus consultórios.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              CNPJ: 63.084.240/0001-31
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Rua Lina Margarida de Oliveira, 330<br/>
              Parque Bom Retiro - Paulínia/SP<br/>
              CEP: 13142-110
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Início</Link></li>
              <li><a href="/#features" className="text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="/#pricing" className="text-muted-foreground hover:text-primary transition-colors">Preços</a></li>
              <li><Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Política de Cookies</Link></li>
              <li><Link to="/seguranca" className="text-muted-foreground hover:text-primary transition-colors">Segurança</Link></li>
            </ul>
          </div>

          {/* Suporte & Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Suporte</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li><Link to="/contato" className="text-muted-foreground hover:text-primary transition-colors">Contato</Link></li>
              <li><Link to="/ajuda" className="text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</Link></li>
              <li><a href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><Link to="/status" className="text-muted-foreground hover:text-primary transition-colors">Status do Sistema</Link></li>
            </ul>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-4">
              <h4 className="font-semibold mb-2 text-sm text-foreground">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? '...' : 'OK'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 KorLab Nutri - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}
