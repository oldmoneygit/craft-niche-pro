import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tenantId } = await req.json();

    if (!message || !tenantId) {
      console.error('Missing required parameters:', { message: !!message, tenantId: !!tenantId });
      return new Response(
        JSON.stringify({ error: 'Missing message or tenantId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching knowledge base for tenant:', tenantId);

    // 1. Buscar toda base de conhecimento do tenant
    const { data: knowledge, error: dbError } = await supabase
      .from('knowledge_base')
      .select('id, category, title, content, usage_count')
      .eq('tenant_id', tenantId)
      .eq('active', true);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Knowledge items found:', knowledge?.length || 0);

    // Se não tem conhecimento cadastrado
    if (!knowledge || knowledge.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "Ainda não tenho informações cadastradas para responder isso. Quer agendar uma consulta para conversarmos?",
          usedKnowledge: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Preparar contexto estruturado para OpenAI
    const knowledgeContext = knowledge
      .map(k => `[CATEGORIA: ${k.category}]\nTÍTULO: ${k.title}\nCONTEÚDO: ${k.content}`)
      .join('\n\n---\n\n');

    // 3. Chamar OpenAI com instruções específicas
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Calling OpenAI API...');

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é o assistente virtual de um nutricionista. Sua função é ajudar pacientes e leads com informações básicas.

REGRAS OBRIGATÓRIAS:
1. Use APENAS as informações fornecidas no CONHECIMENTO abaixo
2. Se a pergunta não está coberta no conhecimento, responda: "Para te responder corretamente, preciso que você agende uma consulta com o nutricionista"
3. NUNCA invente informações nutricionais ou médicas
4. Seja acolhedor, use linguagem simples e amigável
5. Para dúvidas complexas ou específicas, sempre sugira agendamento
6. Se mencionar preços, horários ou políticas, use EXATAMENTE o que está no conhecimento
7. Responda em português brasileiro, de forma natural

CONHECIMENTO DO NUTRICIONISTA:
${knowledgeContext}

Se a pergunta for sobre agendamento, preços ou disponibilidade, use as informações da categoria "policy" ou "service".`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 350
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices[0].message.content;

    console.log('OpenAI response received');

    // 4. Tentar identificar qual conhecimento foi usado (análise simples)
    let usedKnowledgeId = null;
    for (const k of knowledge) {
      if (answer && answer.toLowerCase().includes(k.title.toLowerCase().split(' ')[0])) {
        usedKnowledgeId = k.id;
        console.log('Updating usage count for knowledge:', k.id);
        // Incrementar contador de uso
        await supabase
          .from('knowledge_base')
          .update({ usage_count: k.usage_count + 1 })
          .eq('id', k.id);
        break;
      }
    }

    return new Response(
      JSON.stringify({
        answer,
        usedKnowledge: usedKnowledgeId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
