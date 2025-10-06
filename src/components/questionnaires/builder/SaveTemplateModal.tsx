import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';

interface SaveTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireData: {
    title: string;
    description: string;
    category: string;
    questions: any[];
  };
}

export function SaveTemplateModal({ open, onOpenChange, questionnaireData }: SaveTemplateModalProps) {
  const tenantId = useTenantId();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('anamnese');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Digite um nome para o template', variant: 'destructive' });
      return;
    }

    if (questionnaireData.questions.length === 0) {
      toast({ title: 'Adicione pelo menos uma pergunta', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('questionnaire_templates')
        .insert({
          tenant_id: tenantId,
          name: name,
          description: description,
          category: category,
          template_data: {
            title: questionnaireData.title,
            description: questionnaireData.description,
            questions: questionnaireData.questions
          },
          is_default: false
        });

      if (error) throw error;

      toast({ title: 'Template salvo com sucesso!' });
      onOpenChange(false);
      setName('');
      setDescription('');
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao salvar template', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Salvar como Template</DialogTitle>
          <DialogDescription>
            Salve este questionário para reutilizar no futuro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Nome do Template *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Avaliação Pré-Consulta"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva quando usar este template..."
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anamnese">Anamnese</SelectItem>
                <SelectItem value="habitos">Hábitos</SelectItem>
                <SelectItem value="recordatorio">Recordatório</SelectItem>
                <SelectItem value="satisfacao">Satisfação</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
