import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Use AI with tool calling to extract structured training plan
    const extractionResponse = await fetch(
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
            {
              role: "system",
              content: `Analise a conversa e extraia o plano de treino que foi sugerido. 
Use a ferramenta save_training_plan para retornar os dados estruturados.
Se não houver plano de treino na conversa, use a ferramenta com plan_name vazio.`,
            },
            ...messages,
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_training_plan",
                description: "Salva o plano de treino extraído da conversa",
                parameters: {
                  type: "object",
                  properties: {
                    plan_name: {
                      type: "string",
                      description: "Nome do plano (ex: 'Treino Hipertrofia 5x')",
                    },
                    workout_days: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          day_key: {
                            type: "string",
                            description: "Identificador do dia (ex: 'dia-a', 'dia-b')",
                          },
                          title: {
                            type: "string",
                            description: "Título do dia (ex: 'Peito e Tríceps')",
                          },
                          sort_order: { type: "number" },
                          exercises: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                sets: { type: "number" },
                                reps: { type: "string" },
                                rest: { type: "string" },
                                sort_order: { type: "number" },
                              },
                              required: ["name", "sets", "reps", "rest", "sort_order"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["day_key", "title", "sort_order", "exercises"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["plan_name", "workout_days"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_training_plan" } },
        }),
      }
    );

    if (!extractionResponse.ok) {
      const errText = await extractionResponse.text();
      console.error("AI extraction error:", extractionResponse.status, errText);
      throw new Error("Erro ao extrair plano de treino");
    }

    const extractionData = await extractionResponse.json();
    const toolCall = extractionData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("IA não conseguiu extrair o plano de treino");
    }

    const planData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted plan:", JSON.stringify(planData));

    if (!planData.plan_name || !planData.workout_days?.length) {
      return new Response(
        JSON.stringify({ error: "Nenhum plano de treino encontrado na conversa. Continue conversando com o Coach AI." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deactivate existing plans
    await supabase
      .from("training_plans")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Create new plan
    const { data: plan, error: planError } = await supabase
      .from("training_plans")
      .insert({ name: planData.plan_name, user_id: user.id, is_active: true })
      .select()
      .single();

    if (planError) {
      console.error("Plan insert error:", planError);
      throw new Error("Erro ao salvar plano");
    }

    // Create workout days
    for (const day of planData.workout_days) {
      const { data: workoutDay, error: dayError } = await supabase
        .from("workout_days")
        .insert({
          plan_id: plan.id,
          user_id: user.id,
          day_key: day.day_key,
          title: day.title,
          sort_order: day.sort_order,
        })
        .select()
        .single();

      if (dayError) {
        console.error("Day insert error:", dayError);
        continue;
      }

      // Create exercises for this day
      if (day.exercises?.length) {
        const exercises = day.exercises.map((ex: any) => ({
          workout_day_id: workoutDay.id,
          user_id: user.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          sort_order: ex.sort_order,
        }));

        const { error: exError } = await supabase.from("exercises").insert(exercises);
        if (exError) console.error("Exercise insert error:", exError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, plan_id: plan.id, plan_name: planData.plan_name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("save-training-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
