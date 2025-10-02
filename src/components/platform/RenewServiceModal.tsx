import { useState, useEffect } from 'react';
import { X, RefreshCw, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateEndDate, formatCurrency, formatDate } from '@/lib/serviceCalculations';

interface RenewServiceModalProps {
  subscription: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenewServiceModal = ({ subscription, isOpen, onClose, onSuccess }: RenewServiceModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    start_date: subscription?.end_date || '',
    price: subscription?.price || 0,
    payment_status: 'pending' as 'pending' | 'paid',
    keep_same_duration: true
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        start_date: subscription.end_date,
        price: subscription.price,
        payment_status: 'pending',
        keep_same_duration: true
      });
    }
  }, [subscription]);

  const calculatedEndDate = formData.keep_same_duration && subscription
    ? calculateEndDate(
        new Date(formData.start_date),
        subscription.services?.duration_type,
        subscription.services?.duration_days
      )
    : null;

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Marcar assinatura atual como 'renewed'
      await supabase
        .from('service_subscriptions')
        .update({ status: 'renewed' })
        .eq('id', subscription.id);

      // 2. Criar nova assinatura
      const { error } = await supabase
        .from('service_subscriptions')
        .insert({
          tenant_id: subscription.tenant_id,
          client_id: subscription.client_id,
          service_id: subscription.service_id,
          start_date: formData.start_date,
          end_date: calculatedEndDate!.toISOString().split('T')[0],
          price: formData.price,
          payment_status: formData.payment_status,
          status: 'active',
          notes: `Renovação de ${subscription.services?.name}`
        });

      if (error) throw error;

      toast({
        title: '✓ Serviço renovado!',
        description: 'Uma nova assinatura foi criada com sucesso.',
      });

      onSuccess();
      onClose();

    } catch (error: any) {
      toast({
        title: 'Erro ao renovar serviço',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-green-600" />
            Renovar Serviço
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleRenew} className="p-6 space-y-6">
          {/* Info do Serviço Atual */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">{subscription.services?.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-700 font-medium">Período Atual</p>
                <p className="text-gray-900">{formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Valor Atual</p>
                <p className="text-gray-900 font-bold">{formatCurrency(subscription.price)}</p>
              </div>
            </div>
          </div>

          {/* Nova Data de Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Data de Início *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Padrão: próximo dia após o término atual</p>
          </div>

          {/* Manter Mesma Duração */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="keep_duration"
              checked={formData.keep_same_duration}
              onChange={(e) => setFormData(prev => ({ ...prev, keep_same_duration: e.target.checked }))}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="keep_duration" className="text-sm text-gray-700">
              Manter mesma duração ({subscription.services?.duration_type})
            </label>
          </div>

          {/* Previsão de Término */}
          {calculatedEndDate && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium mb-1">Nova Data de Término</p>
              <p className="text-xl font-bold text-green-900">{formatDate(calculatedEndDate)}</p>
            </div>
          )}

          {/* Novo Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Renovação (R$) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_status: 'paid' }))}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.payment_status === 'paid'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
                }`}
              >
                Pago
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_status: 'pending' }))}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.payment_status === 'pending'
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Renovando...' : 'Confirmar Renovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
