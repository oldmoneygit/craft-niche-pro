const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { profile, calculatedData } = await req.json();

    if (!profile || !calculatedData) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ 
          error: "Chave da API não configurada. Entre em contato com o suporte." 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("API key found, calling Lovable AI Gateway...");

    const systemPrompt = `Você auxilia nutricionistas gerando rascunhos de planos alimentares.

LIMITAÇÕES:
- Você sugere, o nutricionista valida
- Não prescreve - apenas economiza tempo
- Baseado em diretrizes brasileiras

DIRETRIZES:
- Alimentos brasileiros acessíveis
- Distribua macros equilibradamente
- Porções realistas e variadas

FORMATO JSON:
{
  "meals": [
    {
      "name": "string",
      "time": "HH:MM",
      "targetCalories": number,
      "items": [
        {
          "food_name": "string",
          "quantity": number,
          "measure": "string",
          "estimated_kcal": number,
          "estimated_protein": number,
          "estimated_carb": number,
          "estimated_fat": number
        }
      ]
    }
  ],
  "reasoning": "string",
  "educationalNotes": "string"
}`;

    const activityLabels: Record<string, string> = {
      sedentary: "Sedentário",
      light: "Leve",
      moderate: "Moderado",
      intense: "Intenso",
      very_intense: "Muito Intenso",
    };

    const goalLabels: Record<string, string> = {
      maintenance: "Manutenção de peso",
      weight_loss: "Perda de peso",
      muscle_gain: "Ganho de massa muscular",
      health: "Saúde geral",
    };

    const userPrompt = `PERFIL:
${profile.name}, ${profile.age}a, ${profile.gender === "male" ? "M" : "F"}, ${profile.weight_kg}kg, ${profile.height_cm}cm
Atividade: ${activityLabels[profile.activity_level] || profile.activity_level}
Objetivo: ${goalLabels[profile.goal] || profile.goal}

RESTRIÇÕES:
${profile.dietary_restrictions?.length > 0 ? profile.dietary_restrictions.join(", ") : "Nenhuma"}
${profile.allergies?.length > 0 ? "Alergias: " + profile.allergies.join(", ") : ""}
${profile.dislikes?.length > 0 ? "Não gosta: " + profile.dislikes.join(", ") : ""}
${profile.medical_conditions?.length > 0 ? "Condições: " + profile.medical_conditions.join(", ") : ""}
${profile.notes ? "Obs: " + profile.notes : ""}

METAS:
Meta: ${calculatedData.targetCalories} kcal (P:${calculatedData.macros.protein_g}g C:${calculatedData.macros.carb_g}g G:${calculatedData.macros.fat_g}g)

REFEIÇÕES (5):
Café(08:00): ${Math.round(calculatedData.targetCalories * 0.20)}kcal
Lanche1(10:00): ${Math.round(calculatedData.targetCalories * 0.10)}kcal
Almoço(12:00): ${Math.round(calculatedData.targetCalories * 0.35)}kcal
Lanche2(15:00): ${Math.round(calculatedData.targetCalories * 0.10)}kcal
Jantar(19:00): ${Math.round(calculatedData.targetCalories * 0.25)}kcal

ALIMENTOS (use EXATOS):
Pão, forma, integral | Pão, francês | Ovo, cozido | Banana, prata | Maçã | Mamão | Laranja
Leite, vaca, desnatado | Leite, vaca, integral | Iogurte, natural | Arroz, integral, cozido
Arroz, branco, cozido | Feijão, carioca, cozido | Feijão, preto, cozido | Frango, peito, grelhado
Carne, bovina, sem gordura | Macarrão, cozido | Alface | Tomate | Cenoura, crua
Brócolis, cozido | Batata, cozida | Aveia, flocos | Azeite de oliva | Queijo, minas

REGRAS:
- Quantity em GRAMAS (não unidades)
- Measure: "gramas" ou "ml"
- 3-4 alimentos/refeição
- Respeite restrições
- JSON válido só

Retorne apenas JSON.`;

    console.log("Calling Lovable AI Gateway...");

    let aiResponse;
    try {
      aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
          }),
        }
      );
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao conectar com a API de IA.",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "Erro da API de IA", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "";

    console.log("Response received from AI Gateway");

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON response from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ...parsed,
        targetCalories: calculatedData.targetCalories,
        macros: calculatedData.macros,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-meal-plan:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});