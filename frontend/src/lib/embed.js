// Transforme un lien en version intégrable dans la Station (ou signale qu'il faut l'ouvrir à côté)
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

export function toEmbed(raw) {
  const url = (raw || "").trim();
  const h = host(url);
  let m;
  if (!h) return null;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/))) {
    const list = (url.match(/[?&]list=([\w-]+)/) || [])[1];
    return { provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1${list ? `&list=${list}` : ""}`, ratio: "video" };
  }
  if ((m = url.match(/youtube\.com\/playlist\?list=([\w-]+)/))) return { provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/videoseries?list=${m[1]}`, ratio: "video" };
  if (h === "youtube.com" || h === "m.youtube.com") return { provider: "YouTube", blocked: true };
  if ((m = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist|artist|episode|show)\/(\w+)/))) return { provider: "Spotify", src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, ratio: "audio" };
  if ((m = url.match(/deezer\.com\/(?:\w{2}\/)?(track|album|playlist)\/(\d+)/))) return { provider: "Deezer", src: `https://widget.deezer.com/widget/dark/${m[1]}/${m[2]}`, ratio: "audio" };
  if (h === "soundcloud.com") return { provider: "SoundCloud", src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff2f5f&visual=true`, ratio: "audio" };
  if ((m = url.match(/music\.apple\.com\/(.+)/))) return { provider: "Apple Music", src: `https://embed.music.apple.com/${m[1]}`, ratio: "audio" };
  if ((m = url.match(/vimeo\.com\/(\d+)/))) return { provider: "Vimeo", src: `https://player.vimeo.com/video/${m[1]}?autoplay=1`, ratio: "video" };
  if ((m = url.match(/dailymotion\.com\/video\/(\w+)/))) return { provider: "Dailymotion", src: `https://www.dailymotion.com/embed/video/${m[1]}?autoplay=1`, ratio: "video" };
  if (h === "twitch.tv") {
    const p = window.location.hostname;
    if ((m = url.match(/twitch\.tv\/videos\/(\d+)/))) return { provider: "Twitch", src: `https://player.twitch.tv/?video=${m[1]}&parent=${p}`, ratio: "video" };
    if ((m = url.match(/twitch\.tv\/([\w]+)/))) return { provider: "Twitch", src: `https://player.twitch.tv/?channel=${m[1]}&parent=${p}`, ratio: "video" };
  }
  if ((m = url.match(/canva\.com\/design\/([\w-]+)\/([\w-]+)/))) return { provider: "Canva", src: `https://www.canva.com/design/${m[1]}/${m[2]}/view?embed`, ratio: "video", note: "Aperçu intégré — l'édition s'ouvre à côté." };
  if ((m = url.match(/docs\.google\.com\/(document|spreadsheets|presentation|forms)\/d\/([\w-]+)/))) return { provider: "Google Docs", src: `https://docs.google.com/${m[1]}/d/${m[2]}/${m[1] === "forms" ? "viewform?embedded=true" : "preview"}`, ratio: "page", note: "Aperçu intégré (document partagé). L'édition s'ouvre à côté." };
  if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) return { provider: "Google Drive", src: `https://drive.google.com/file/d/${m[1]}/preview`, ratio: "video", note: "Les vidéos Drive (films, animes à toi) se lisent ici." };
  if ((m = url.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)/))) return { provider: "Google Drive", src: `https://drive.google.com/embeddedfolderview?id=${m[1]}#grid`, ratio: "page" };
  if (h === "figma.com") return { provider: "Figma", src: `https://www.figma.com/embed?embed_host=nexus&url=${encodeURIComponent(url)}`, ratio: "page" };
  if ((m = url.match(/t\.me\/([\w]+)\/(\d+)/))) return { provider: "Telegram", src: `https://t.me/${m[1]}/${m[2]}?embed=1&dark=1`, ratio: "page" };
  if ((m = url.match(/t\.me\/s?\/?([\w]+)\/?$/))) return { provider: "Telegram", src: `https://t.me/s/${m[1]}`, ratio: "page", note: "Aperçu public de la chaîne." };
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes("/api/atelier-files/")) return { provider: "Vidéo", video: url, ratio: "video" };
  if (/\.(mp3|ogg|wav|m4a|flac)(\?|$)/i.test(url)) return { provider: "Audio", audio: url, ratio: "audio" };
  if (["drive.google.com", "docs.google.com", "music.youtube.com"].includes(h)) return { provider: h, blocked: true };
  const BLOCKED = ["discord.com", "discord.gg", "steampowered.com", "steamcommunity.com", "swisstransfer.com", "emergent.sh", "emergentagent.com", "amazon.com", "amazon.fr", "netflix.com", "crunchyroll.com", "primevideo.com", "disneyplus.com", "web.telegram.org", "telegram.org", "chatgpt.com", "chat.openai.com", "canva.com", "notion.so", "instagram.com", "facebook.com", "x.com", "twitter.com", "adn.fr", "animationdigitalnetwork.com", "mail.google.com", "claude.ai", "gemini.google.com"];
  if (BLOCKED.some((b) => h === b || h.endsWith("." + b))) return { provider: h, blocked: true };
  return { provider: h, src: url, ratio: "page", maybe: true };
}

export const popOut = (url, name) => {
  const n = name || "nexus-" + ((url.match(/^https?:\/\/(?:www\.)?([^/]+)/) || [])[1] || "app").replace(/\W/g, "");
  const w = window.open(url, n, "popup=yes,width=1320,height=860,left=70,top=50");
  if (!w) window.open(url, "_blank", "noopener");
};

// Applications du bureau (intégrables quand le service l'autorise, sinon fenêtre à côté)
export const DEFAULT_APPS = [
  { key: "youtube", title: "YouTube", url: "https://www.youtube.com", color: "#ff0033", k: "▶", tip: "Colle un lien de vidéo ou de playlist pour la regarder ici." },
  { key: "spotify", title: "Spotify", url: "https://open.spotify.com", color: "#1ed760", k: "♫", tip: "Colle un lien de playlist ou d'album pour l'écouter ici." },
  { key: "canva", title: "Canva", url: "https://www.canva.com", color: "#7d2ae8", k: "C", tip: "Colle le lien d'un design pour l'aperçu intégré." },
  { key: "telegram", title: "Telegram", url: "https://web.telegram.org", color: "#29a9eb", k: "✈" },
  { key: "chatgpt", title: "ChatGPT", url: "https://chatgpt.com", color: "#10a37f", k: "◍" },
  { key: "drive", title: "Google Drive", url: "https://drive.google.com", color: "#1fa463", k: "△", tip: "Parcours ton Drive connecté et ouvre tes fichiers ici.", view: "drive" },
  { key: "docs", title: "Google Docs", url: "https://docs.google.com", color: "#4285f4", k: "≡" },
  { key: "crunchyroll", title: "Crunchyroll", url: "https://www.crunchyroll.com", color: "#f47521", k: "◐" },
  { key: "netflix", title: "Netflix", url: "https://www.netflix.com", color: "#e50914", k: "N" },
  { key: "twitch", title: "Twitch", url: "https://www.twitch.tv", color: "#9146ff", k: "◈" },
  { key: "claude", title: "Claude", url: "https://claude.ai", color: "#d97757", k: "✳" },
  { key: "emergent", title: "Emergent", url: "https://app.emergent.sh", color: "#f2f2f2", k: "E" },
  { key: "swisstransfer", title: "SwissTransfer", url: "https://www.swisstransfer.com", color: "#e2001a", k: "⇪" },
  { key: "discord", title: "Discord", url: "https://discord.com/app", color: "#5865f2", k: "◉" },
  { key: "instagram", title: "Instagram", url: "https://www.instagram.com", color: "#e1306c", k: "◎" },
  { key: "steam", title: "Steam", url: "https://store.steampowered.com", color: "#66c0f4", k: "♨" },
  { key: "ytmusic", title: "YouTube Music", url: "https://music.youtube.com", color: "#ff0000", k: "♪" },
  { key: "primevideo", title: "Prime Video", url: "https://www.primevideo.com", color: "#00a8e1", k: "▷" },
];
