import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RedirectToClinicaExemplo() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona para a nova plataforma da Clínica Exemplo
    navigate('/platform/clinica-exemplo', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}