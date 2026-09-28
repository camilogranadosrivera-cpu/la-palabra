// Edge Function de Netlify: intermediario seguro entre la app y la IA.
// Se usa Edge (y no una función normal) porque las funciones normales se cortan a los 10 segundos
// y una respuesta completa tarda más. Aquí la respuesta se transmite en vivo, sin ese límite.
// La clave vive en Netlify: Environment variables > ANTHROPIC_API_KEY. Nunca va en el HTML.

const MODELO = "claude-sonnet-5"; // cámbialo aquí si quieres otro modelo

const LUGARES = "jerusalen, belen, nazaret, capernaum (Mar de Galilea), jerico, hebron, betel, siquem, carmelo, jope, gaza, beerseba, engadi, jordan, cesarea, nebo, damasco, egipto, sinai, babilonia, ninive, ur, haran, susa, antioquia, tarso";

const LAMINAS = "1 Creation of Eve; 2 Expulsion from the Garden; 3 Murder of Abel; 4 The Deluge; 5 Noah cursing Ham; 6 Tower of Babel; 7 Abraham entertains three strangers; 8 Destruction of Sodom; 9 Expulsion of Hagar; 10 Hagar in the wilderness; 11 Trial of Abraham's faith (Isaac); 12 Burial of Sarah; 13 Eliezer and Rebekah; 14 Isaac blessing Jacob; 15 Jacob tending Laban's flocks; 16 Joseph sold into Egypt; 17 Joseph interpreting Pharaoh's dream; 18 Joseph making himself known to his brethren; 19 Moses in the bulrushes; 20 War against Gibeon; 21 Sisera slain by Jael; 22 Deborah's song; 23 Jephthah met by his daughter; 24 Jephthah's daughter and companions; 25 Samson slaying the lion; 26 Samson and Delilah; 27 Death of Samson; 28 Naomi and her daughters-in-law (Ruth); 29 Ruth and Boaz; 30 Return of the Ark; 31 Saul and David; 32 David sparing Saul; 33 Death of Saul; 34 Death of Absalom; 35 David mourning over Absalom; 36 Solomon; 37 Judgment of Solomon; 38 Cedars for the Temple; 39 Prophet slain by a lion; 40 Elijah destroying the messengers of Ahaziah; 41 Elijah's ascent in a chariot of fire; 42 Death of Jezebel; 43 Esther confounding Haman; 44 Isaiah; 45 Destruction of Sennacherib's host; 46 Baruch; 47 Ezekiel prophesying; 48 Vision of Ezekiel; 49 Daniel; 50 The fiery furnace; 51 Belshazzar's feast; 52 Daniel in the lions' den; 53 The prophet Amos; 54 Jonah calling Nineveh to repentance; 55 Daniel confounding the priests of Bel; 56 Heliodorus punished in the Temple; 57 The Nativity; 58 Star in the East; 59 Flight into Egypt; 60 Massacre of the Innocents; 61 Jesus questioning the doctors; 62 Jesus healing the sick; 63 Sermon on the Mount; 64 Christ stilling the tempest; 65 The dumb man possessed; 66 Christ in the synagogue; 67 Disciples plucking corn on the Sabbath; 68 Jesus walking on the water (Peter); 69 Entry into Jerusalem; 70 Jesus and the tribute money; 71 The widow's mite; 72 Raising of Jairus' daughter; 73 The Good Samaritan; 74 Samaritan arriving at the inn; 75 The Prodigal Son; 76 Lazarus and the rich man; 77 Pharisee and the publican; 78 Jesus and the woman of Samaria; 79 Jesus and the woman taken in adultery; 80 Resurrection of Lazarus; 81 Mary Magdalene; 82 The Last Supper; 83 Agony in the garden; 84 Prayer in the Garden of Olives; 85 The betrayal; 86 Christ fainting under the cross; 87 The flagellation; 88 The Crucifixion; 89 Close of the Crucifixion; 90 Burial of Jesus; 91 Angel at the sepulcher; 92 Journey to Emmaus; 93 The Ascension; 94 Martyrdom of Stephen; 95 Saul's conversion; 96 Deliverance of Peter from prison; 97 Paul at Ephesus; 98 Paul menaced by the Jews; 99 Paul's shipwreck; 100 Death on the pale horse";

const SISTEMA = `Eres el consejero de "La Palabra", una app de consejo bíblico. Respondes como un teólogo y rabino con profundo conocimiento de toda la Biblia (Tanaj/Antiguo Testamento, deuterocanónicos y Nuevo Testamento), de sus idiomas originales (hebreo, arameo y griego) y de cuatro tradiciones: católica, evangélica/protestante, ortodoxa y judía (Talmud, midrash, comentaristas como Rashi o Maimónides).

Cómo respondes:
- Primero acoges a la persona con empatía, sin juzgarla ni minimizar su dolor.
- Nunca respaldas hacer daño a otros ni a uno mismo. Si la persona plantea venganza, violencia o algo destructivo, explicas con amor y firmeza qué dice la Escritura y hacia dónde lleva ese camino.
- Citas solo versículos reales con referencia exacta. Usa el texto de la Reina-Valera 1909 (dominio público) con ortografía modernizada. Si no recuerdas el texto exacto, parafrasea en "explicacion" y deja "texto" como una cita corta que sí conozcas con certeza. Nunca inventes versículos, números del Catecismo ni tratados del Talmud.
- Si citas un libro deuterocanónico, aclara que lo aceptan católicos y ortodoxos.
- Presenta cada tradición con respeto y precisión, sin decir que una es mejor que otra. En la tradición judía usa solo el Tanaj y fuentes rabínicas, no el Nuevo Testamento.
- Modo "joven": frases cortas, lenguaje cercano, ejemplos de la vida diaria de un joven latinoamericano. Modo "adulto": más profundidad teológica y contexto histórico.
- Recomienda buscar a un pastor, sacerdote, rabino o profesional cuando el caso lo amerite.
- Si hay señales de riesgo (suicidio, autolesión, abuso, violencia doméstica, amenaza a otros), pon "crisis": true y en "empatia" invita con claridad a buscar ayuda inmediata con una persona real.
- Escribe en español neutro latinoamericano.

Entrega SIEMPRE tu respuesta llamando a la herramienta "entregar_consejo", nunca como texto libre.
Reglas de cantidad: 3 a 5 versículos, 2 o 3 historias, 3 a 5 pasos, plan de 7 días.
Para "lugar" usa solo uno de estos ids: ${LUGARES}. Si la historia no ocurre en ninguno, usa null.
Para "lamina": elige de este catálogo de grabados de Gustave Doré el número que corresponda EXACTAMENTE a la historia; si ninguno la representa, usa null (nunca pongas uno que no corresponda): ${LAMINAS}.`;

const txt = d => ({ type: "string", description: d });
const HERRAMIENTA = {
  name: "entregar_consejo",
  description: "Entrega el consejo bíblico completo a la persona.",
  input_schema: {
    type: "object",
    properties: {
      crisis: { type: "boolean", description: "true si hay señales de riesgo para la persona o para otros" },
      tema: txt("Sobre ... (frase corta que nombra el tema)"),
      titulo: txt("Título breve y cálido, como el de un capítulo"),
      empatia: txt("2 a 4 frases de acogida"),
      versiculos: { type: "array", items: { type: "object", properties: {
        ref: txt("Libro cap:vers"), texto: txt("Texto del versículo"), explicacion: txt("Qué significa para esta persona")
      }, required: ["ref","texto","explicacion"] } },
      historias: { type: "array", items: { type: "object", properties: {
        titulo: txt(""), ref: txt(""), resumen: txt(""), leccion: txt(""),
        lugar: { type: ["string","null"], description: "id de lugar de la lista o null" },
        lamina: { type: ["integer","null"], description: "número de lámina de Doré o null" }
      }, required: ["titulo","ref","resumen","leccion"] } },
      tradiciones: { type: "object", properties: {
        catolica: txt(""), evangelica: txt(""), ortodoxa: txt(""), judia: txt("")
      }, required: ["catolica","evangelica","ortodoxa","judia"] },
      raiz: { type: "object", properties: {
        original: txt("Palabra en su escritura original"), transliteracion: txt(""),
        idioma: { type: "string", enum: ["hebreo","griego","arameo"] }, significado: txt("")
      }, required: ["original","transliteracion","idioma","significado"] },
      pasos: { type: "array", items: txt("Acción concreta y práctica") },
      oracion: txt("Oración breve en primera persona"),
      plan: { type: "array", items: { type: "object", properties: {
        dia: { type: "integer" }, lectura: txt("Referencia bíblica"), enfoque: txt("Frase corta")
      }, required: ["dia","lectura","enfoque"] } }
    },
    required: ["crisis","tema","titulo","empatia","versiculos","historias","tradiciones","raiz","pasos","oracion","plan"]
  }
};

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

export default async (req) => {
  if (req.method === "GET") return json({ ok: true, clave: Boolean(Netlify.env.get("ANTHROPIC_API_KEY")) });
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);
  const clave = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!clave) return json({ error: "Falta la clave ANTHROPIC_API_KEY en Netlify (Environment variables). Después de agregarla, vuelve a publicar." }, 500);

  let consulta, modo;
  try { ({ consulta, modo } = await req.json()); } catch { return json({ error: "Cuerpo inválido" }, 400); }
  consulta = String(consulta || "").trim().slice(0, 1500);
  modo = modo === "joven" ? "joven" : "adulto";
  if (consulta.length < 10) return json({ error: "Consulta muy corta" }, 400);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": clave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: Netlify.env.get("ANTHROPIC_MODEL") || MODELO,
      max_tokens: 8000,
      stream: true,
      tools: [HERRAMIENTA],
      tool_choice: { type: "tool", name: "entregar_consejo" },
      system: SISTEMA,
      messages: [{ role: "user", content: `Modo: ${modo}\nSituación de la persona: ${consulta}` }]
    })
  });
  if (!r.ok) {
    const t = await r.text(); let m = t;
    try { m = JSON.parse(t).error?.message || t; } catch {}
    return json({ error: m, estado: r.status }, 502);
  }
  // Se reenvía el flujo de Anthropic tal cual; la app arma la respuesta (JSON garantizado por la herramienta)
  return new Response(r.body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" } });
};

export const config = { path: "/api/consejo" };
