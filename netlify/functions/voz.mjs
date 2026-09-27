// Función de Netlify: convierte texto en la voz del "Abuelo Simeón" con ElevenLabs.
// Variables en Netlify:
//   ELEVENLABS_API_KEY   tu clave de ElevenLabs
//   ELEVENLABS_VOICE_ID  el ID de la voz de anciano que diseñes o elijas
//   ELEVENLABS_MODEL     opcional; por defecto eleven_multilingual_v2
// Si no están configuradas, la app usa la voz del teléfono.

export default async (req) => {
  const clave = process.env.ELEVENLABS_API_KEY, vozId = process.env.ELEVENLABS_VOICE_ID;
  // GET: la app pregunta si la voz natural está lista (se muestra en Ajustes)
  if (req.method === "GET") return Response.json({ configurada: Boolean(clave && vozId) });
  if (req.method !== "POST") return new Response("Usa POST", { status: 405 });
  if (!clave || !vozId) return new Response("Voz natural no configurada", { status: 501 });

  let texto;
  try { ({ texto } = await req.json()); } catch { return new Response("Cuerpo inválido", { status: 400 }); }
  texto = String(texto || "").trim().slice(0, 1000); // límite por trozo para controlar costos
  if (!texto) return new Response("Texto vacío", { status: 400 });

  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vozId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": clave, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({
      text: texto,
      model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
      // Estabilidad media-baja = más expresivo y humano; estilo moderado = más cálido
      voice_settings: { stability: 0.42, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true }
    })
  });
  if (!r.ok) return new Response("Error de voz: " + (await r.text()), { status: 502 });
  return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=604800" } });
};
