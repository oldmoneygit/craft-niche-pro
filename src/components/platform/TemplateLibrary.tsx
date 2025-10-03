import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  Clock, 
  TrendingUp,
  Eye,
  Trash2,
  Copy
} from "lucide-react";

export function TemplateLibrary({ onApplyTemplate }: { onApplyTemplate?: (templateId: string) => void }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  const loadTemplates = async () => {
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      setIsLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from('meal_plan_templates')
      .select(`
        *
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro ao carregar templates",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setTemplates(data || []);
    }
    
    setIsLoading(false);
  };
  
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o template "${templateName}"?`)) {
      return;
    }
    
    const { error } = await supabase
      .from('meal_plan_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Template excluído",
        description: `"${templateName}" foi removido da biblioteca.`
      });
      loadTemplates();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Biblioteca de Templates</h2>
        <p className="text-muted-foreground">
          Templates salvos para reutilização rápida
        </p>
      </div>
      
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates por nome, descrição ou tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Grid de templates */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando...</p>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Nenhum template encontrado com este termo.'
                : 'Nenhum template salvo ainda. Crie seu primeiro template!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {template.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {/* Informações nutricionais */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Calorias</p>
                    <p className="font-medium">{template.reference_calories} kcal</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Proteínas</p>
                    <p className="font-medium">{template.reference_protein}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carboidratos</p>
                    <p className="font-medium">{template.reference_carbs}g</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gorduras</p>
                    <p className="font-medium">{template.reference_fat}g</p>
                  </div>
                </div>
                
                {/* Metadados */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(template.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Usado {template.times_used || 0}x
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={() => onApplyTemplate?.(template.id)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Aplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {/* TODO: Preview */}}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(template.id, template.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
