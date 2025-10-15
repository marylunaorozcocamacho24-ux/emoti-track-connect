import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("EMI: Processing chat request with", messages.length, "messages");

    const systemPrompt = `Eres EMI, un Asistente Emocional especializado en salud mental y bienestar psicológico. 
Tu rol es ofrecer apoyo emocional inmediato, contención y guía a pacientes que están experimentando momentos difíciles.

IMPORTANTES DIRECTRICES:
- Sé empático, cálido y comprensivo en todas tus respuestas
- Ofrece ejercicios prácticos de respiración y mindfulness cuando sea apropiado
- Si detectas crisis graves (ideación suicida, violencia), recomienda contactar al psicólogo inmediatamente
- Mantén un tono profesional pero accesible
- Nunca reemplaces la terapia profesional, eres un apoyo complementario
- Usa frases de validación emocional
- Mantén las respuestas concisas y claras (máximo 3-4 párrafos)

CAPACIDADES:
- Ejercicios de respiración guiada
- Técnicas de grounding
- Validación emocional
- Recomendaciones de actividades de autocuidado
- Recordatorios para contactar al psicólogo cuando sea necesario`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Por favor, intenta más tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Por favor, recarga tu cuenta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error en el servicio de AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("EMI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
