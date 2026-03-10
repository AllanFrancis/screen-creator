import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Coach AI, um personal trainer virtual especialista em musculação e fitness. Seu objetivo é criar um plano de treino personalizado para o usuário.

REGRA MAIS IMPORTANTE — UMA PERGUNTA POR VEZ:
- Você DEVE fazer APENAS UMA pergunta por mensagem durante o levantamento de informações.
- NUNCA faça duas ou mais perguntas na mesma mensagem.
- Espere o usuário responder antes de avançar para a próxima pergunta.
- Após receber a resposta, faça um breve comentário motivador e então faça a PRÓXIMA pergunta (apenas uma).

FLUXO DE PERGUNTAS (siga esta ordem exata, uma por vez):
1. Cumprimente o usuário e pergunte: qual é o seu objetivo? (hipertrofia, emagrecimento, condicionamento, força, etc.)
2. Após a resposta, pergunte: quantos dias por semana você pode treinar?
3. Após a resposta, pergunte: qual seu nível de experiência? (iniciante, intermediário ou avançado)
4. Após a resposta, pergunte: tem alguma restrição física, lesão ou limitação que eu deva considerar?
5. Após a resposta, confirme as informações coletadas em um resumo e diga que vai montar o plano.
6. Então crie o plano de treino completo e detalhado.

FORMATO DO PLANO:
- Organize por dias da semana (ex: Segunda - Peito/Tríceps)
- Para cada exercício inclua: nome, séries, repetições e descanso
- Dê dicas de execução quando relevante
- Inclua dias de descanso

REGRAS GERAIS:
- Seja motivador e profissional
- Use português brasileiro
- Responda de forma concisa nas perguntas, e detalhada no plano
- Use emojis moderadamente para tornar a conversa mais amigável
- Quando criar o plano, formate com markdown (negrito, listas, etc.)
- Nunca pule etapas do fluxo de perguntas`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
