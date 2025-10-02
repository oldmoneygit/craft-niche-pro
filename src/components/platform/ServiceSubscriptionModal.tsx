import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateEndDate, calculateMonthlyEquivalent, formatCurrency } from '@/lib/serviceCalculations';

interface ServiceSubscriptionModalProps {
  clientId: string;
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceSubscriptionModal = ({ 
  clientId, 
  tenantId, 
  isOpen, 
  onClose, 
  onSuccess 
}: ServiceSubscriptionModalProps) => {
  const { toast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    service_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    price: 0,
    payment_status: 'pending' as 'pending' | 'paid' | 'overdue',
    notes: ''
  });

  const [selectedService, setSelectedService] = useState<any>(null);

  // Buscar serviços ativos
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('name');
      
      setServices(data || []);
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen, tenantId]);

  // Atualizar quando selecionar serviço
  useEffect(() => {
    if (selectedService) {
      const endDate = calculateEndDate(
        new Date(formData.start_date),
        selectedService.duration_type,
        selectedService.duration_days
      );

      setFormData(prev => ({
        ...prev,
        price: selectedService.price,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedService, formData.start_date]);

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service);
    setFormData(prev => ({ ...prev, service_id: serviceId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔍 DEBUG - Iniciando contratação de serviço...');
    console.log('📋 Dados do formulário:', formData);
    console.log('🏢 Tenant ID:', tenantId);
    console.log('👤 Client ID:', clientId);

    try {
      const insertData = {
        tenant_id: tenantId,
        client_id: clientId,
        service_id: formData.service_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        price: formData.price,
        payment_status: formData.payment_status,
        status: 'active',
        notes: formData.notes || null
      };

      console.log('📤 Dados sendo enviados para o banco:', insertData);

      const { data, error } = await supabase
        .from('service_subscriptions')
        .insert(insertData)
        .select();

      if (error) {
        console.error('❌ Erro ao salvar:', error);
        throw error;
      }

      console.log('✅ Serviço contratado com sucesso!', data);

      toast({
        title: '✓ Serviço contratado!',
        description: 'O serviço foi vinculado ao cliente com sucesso.',
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        service_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        price: 0,
        payment_status: 'pending',
        notes: ''
      });
      setSelectedService(null);
      
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error);
      toast({
        title: 'Erro ao contratar serviço',
        description: error.message || 'Erro desconhecido ao salvar',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Contratar Serviço</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Seleção de Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serviço *
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => handleServiceChange(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="">Selecione um serviço...</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.duration_type} - {formatCurrency(service.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Preview do Serviço Selecionado */}
          {selectedService && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-700 font-medium">Duração</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedService.duration_type}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium">Modalidade</p>
                  <p className="text-sm text-gray-900 capitalize">{selectedService.modality}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium">Valor Total</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(selectedService.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium">Valor Mensal</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(calculateMonthlyEquivalent(selectedService.price, selectedService.duration_type))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Término
              </label>
              <input
                type="date"
                value={formData.end_date}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Calculado automaticamente</p>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$) *
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
                placeholder="0,00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Você pode ajustar o valor para descontos/promoções</p>
          </div>

          {/* Status de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status de Pagamento *
            </label>
            <div className="grid grid-cols-3 gap-3">
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
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_status: 'overdue' }))}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.payment_status === 'overdue'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-300'
                }`}
              >
                Atrasado
              </button>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              placeholder="Informações adicionais sobre este contrato..."
            />
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
              disabled={loading || !formData.service_id}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Contratando...' : 'Confirmar Contratação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
