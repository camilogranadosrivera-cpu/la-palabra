// Descarga las 100 láminas de Doré (dominio público, Project Gutenberg #8710) a la carpeta laminas/.
// Netlify lo ejecuta solo en cada publicación (ver netlify.toml), así no necesitas computador.
// Si una lámina falla, la app la toma directamente de Gutenberg; la publicación nunca se detiene.
import { mkdir, writeFile, access } from "node:fs/promises";
await mkdir("laminas", { recursive: true });
let ok = 0;
for (let i = 1; i <= 100; i++) {
  const f = String(i).padStart(3, "0") + ".jpg";
  try { await access("laminas/" + f); ok++; continue; } catch {}
  try {
    const r = await fetch("https://www.gutenberg.org/cache/epub/8710/images/" + f);
    if (!r.ok) throw new Error(r.status);
    await writeFile("laminas/" + f, Buffer.from(await r.arrayBuffer())); ok++;
  } catch (e) { console.log("No se pudo descargar", f, String(e)); }
  await new Promise(s => setTimeout(s, 250)); // pausa corta para no saturar a Gutenberg
}
console.log(`Láminas listas: ${ok} de 100`);
