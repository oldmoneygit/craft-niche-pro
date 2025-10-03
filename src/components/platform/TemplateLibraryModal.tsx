import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  reference_calories: number;
  reference_protein: number;
  reference_carbs: number;
  reference_fat: number;
  tags: string[] | null;
  times_used: number;
  created_at: string;
}

interface TemplateLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateLibraryModal({ 
  open, 
  onClose, 
  onSelectTemplate 
}: TemplateLibraryModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      const { data, error } = await supabase
        .from('meal_plan_templates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "Nenhum template encontrado",
          description: "Crie seu primeiro template salvando um plano existente."
        });
      }

    } catch (error: any) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro ao carregar templates",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Biblioteca de Templates</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2">
          {isLoading && (
            <p className="text-center text-muted-foreground py-8">
              Carregando templates...
            </p>
          )}

          {!isLoading && filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                {searchTerm 
                  ? 'Nenhum template encontrado para esta busca'
                  : 'Nenhum template salvo ainda'
                }
              </p>
              {!searchTerm && (
                <p className="text-sm text-muted-foreground">
                  Salve um plano existente como template para começar
                </p>
              )}
            </div>
          )}

          {filteredTemplates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleSelectTemplate(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Calorias</p>
                        <p className="font-semibold">{template.reference_calories} kcal</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Proteínas</p>
                        <p className="font-semibold">{template.reference_protein.toFixed(1)}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Carboidratos</p>
                        <p className="font-semibold">{template.reference_carbs.toFixed(1)}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Gorduras</p>
                        <p className="font-semibold">{template.reference_fat.toFixed(1)}g</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{template.times_used}x usado</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(template.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
