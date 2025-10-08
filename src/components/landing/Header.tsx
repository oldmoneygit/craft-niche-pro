import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="white">
                <path d="M16 2L4 7v10c0 7.5 5 14 12 15 7-1 12-7.5 12-15V7L16 2z" opacity="0.95"/>
                <path d="M12 16l2.5 2.5L20 13" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">KorLab Nutri</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              Início
            </Link>
            <a
              href="/#features"
              className="font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="/#pricing"
              className="font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors"
            >
              Preços
            </a>
            <Link
              to="/blog"
              className={`font-medium transition-colors ${
                location.pathname.startsWith('/blog') ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              Blog
            </Link>
            <Link
              to="/contato"
              className={`font-medium transition-colors ${
                isActive('/contato') ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              Contato
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              to="/"
              className={`block py-2 ${isActive('/') ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Início
            </Link>
            <a
              href="/#features"
              className="block py-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Funcionalidades
            </a>
            <a
              href="/#pricing"
              className="block py-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Preços
            </a>
            <Link
              to="/blog"
              className={`block py-2 ${location.pathname.startsWith('/blog') ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/contato"
              className={`block py-2 ${isActive('/contato') ? 'text-emerald-600' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contato
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
