// Variantes du favicon de base (réticule HUD + 天) : même dessin, autres couleurs ou autre ambiance.
// Les images sont dans public/favicons ; au choix, elles sont envoyées au serveur qui sert l'icône du site.
export const FAVICONS = [
  { key: "origine", label: "Origine", hint: "Le favicon de base, bleu et cyan" },
  { key: "nuit", label: "Nuit", hint: "Sans nébuleuse : les anneaux et le 天 sur noir" },
  { key: "argent", label: "Argent", hint: "Sans couleur, lueur blanche" },
  { key: "duo", label: "Duo", hint: "Anneaux extérieurs orange, cœur cyan" },
  { key: "or", label: "Or", hint: "Lueur dorée" },
  { key: "orange", label: "Orange", hint: "L'orange de l'Atelier" },
  { key: "rouge", label: "Rouge", hint: "Rouge néon" },
  { key: "magenta", label: "Magenta", hint: "Rose néon" },
  { key: "violet", label: "Violet", hint: "Violet profond" },
  { key: "emeraude", label: "Émeraude", hint: "Vert néon" },
].map((f) => ({ ...f, src: `/favicons/${f.key}.webp`, base: f.key === "origine" }));

export const faviconPng = (src, size = 512) => new Promise((res, rej) => {
  const img = new Image(); img.onerror = rej;
  img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = size; c.getContext("2d").drawImage(img, 0, 0, size, size); res(c.toDataURL("image/png")); };
  img.src = src;
});
