import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PlatformTemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (templateId) {
      navigate(`/platform/templates/${templateId}/visualizar?edit=true`);
    }
  }, [templateId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando editor...</p>
      </div>
    </div>
  );
}
