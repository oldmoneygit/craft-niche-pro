import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { trackPageView } from '@/lib/supabase-landing';

export default function LandingLayout() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
