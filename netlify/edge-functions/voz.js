// Edge Function: voz del "Abuelo Simeón" con ElevenLabs (sin el límite de 10 segundos).
// Variables en Netlify: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID y opcional ELEVENLABS_MODEL.
export default async (req) => {
  const clave = Netlify.env.get("ELEVENLABS_API_KEY"), vozId = Netlify.env.get("ELEVENLABS_VOICE_ID");
  if (req.method === "GET") return Response.json({ configurada: Boolean(clave && vozId) });
  if (req.method !== "POST") return new Response("Usa POST", { status: 405 });
  if (!clave || !vozId) return new Response("Voz natural no configurada", { status: 501 });
  let texto;
  try { ({ texto } = await req.json()); } catch { return new Response("Cuerpo inválido", { status: 400 }); }
  texto = String(texto || "").trim().slice(0, 1000);
  if (!texto) return new Response("Texto vacío", { status: 400 });
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vozId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": clave, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({
      text: texto,
      model_id: Netlify.env.get("ELEVENLABS_MODEL") || "eleven_multilingual_v2",
      voice_settings: { stability: 0.42, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true }
    })
  });
  if (!r.ok) return new Response("Error de voz: " + (await r.text()), { status: 502 });
  return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=604800" } });
};
export const config = { path: "/api/voz" };
