import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuestionnaires } from '@/hooks/useQuestionnaires';
import { useClientsData } from '@/hooks/useClientsData';
import { Info } from 'lucide-react';

interface SendQuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaireId: string | null;
  questionnaireTitle?: string;
}

export function SendQuestionnaireModal({ 
  open, 
  onOpenChange, 
  questionnaireId,
  questionnaireTitle 
}: SendQuestionnaireModalProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  
  const { sendToClient } = useQuestionnaires();
  const { clients } = useClientsData();

  const handleSend = async () => {
    if (!questionnaireId || !selectedClientId) return;

    await sendToClient.mutateAsync({
      questionnaire_id: questionnaireId,
      client_id: selectedClientId,
      custom_message: customMessage,
    });

    onOpenChange(false);
    setSelectedClientId('');
    setCustomMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Questionário</DialogTitle>
          {questionnaireTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {questionnaireTitle}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Selecione o Cliente *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mensagem Personalizada (opcional)</Label>
            <Textarea
              placeholder="Adicione uma mensagem para o cliente..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              O cliente receberá um link para preencher o questionário. Você será notificado quando ele concluir.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedClientId}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Enviar Questionário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}