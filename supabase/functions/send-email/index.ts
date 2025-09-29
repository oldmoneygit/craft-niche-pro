import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { Resend } from "https://esm.sh/resend@2.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  clientId: string;
  templateId?: string;
  type: 'email' | 'whatsapp' | 'sms';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, content, clientId, templateId, type }: EmailRequest = await req.json();

    console.log('Sending email:', { to, subject, clientId, type });

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Plataforma Nutrição <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: content,
    });

    console.log('Email sent successfully:', emailResponse);

    // Save communication record to database
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', 'gabriel-gandin')
      .single();

    if (tenant) {
      const { error: commError } = await supabase
        .from('communications')
        .insert([{
          tenant_id: tenant.id,
          client_id: clientId,
          type: type,
          direction: 'sent',
          content: content,
          status: 'sent',
          template_used: templateId,
          metadata: { subject, email_id: emailResponse.data?.id }
        }]);

      if (commError) {
        console.error('Error saving communication:', commError);
      }
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);