import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectToAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para o dashboard administrativo
    navigate('/admin', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}