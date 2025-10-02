import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    console.log('Atualizando status de serviços...');

    // Atualizar status para "expiring_soon" (próximos 7 dias)
    const { data: expiringSoon, error: expiringError } = await supabase
      .from('service_subscriptions')
      .update({ status: 'expiring_soon' })
      .eq('status', 'active')
      .lte('end_date', sevenDaysFromNow.toISOString().split('T')[0])
      .gte('end_date', today.toISOString().split('T')[0])
      .select();

    if (expiringError) {
      console.error('Erro ao atualizar serviços expirando:', expiringError);
    } else {
      console.log(`${expiringSoon?.length || 0} serviços marcados como expiring_soon`);
    }

    // Atualizar status para "expired" (vencidos)
    const { data: expired, error: expiredError } = await supabase
      .from('service_subscriptions')
      .update({ status: 'expired' })
      .in('status', ['active', 'expiring_soon'])
      .lt('end_date', today.toISOString().split('T')[0])
      .select();

    if (expiredError) {
      console.error('Erro ao atualizar serviços expirados:', expiredError);
    } else {
      console.log(`${expired?.length || 0} serviços marcados como expired`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        expiring_soon: expiringSoon?.length || 0,
        expired: expired?.length || 0
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Erro na função update-expiring-services:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
