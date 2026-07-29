// Resolve a user-provided video link (or pasted <iframe> embed) into a playable source.
// Supports YouTube, Vimeo, Dailymotion, generic embed/player URLs and direct video files.
export function resolveVideoEmbed(url, autoplay = true) {
  if (!url) return null;
  const raw = String(url).trim();
  const iframeMatch = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  const u = iframeMatch ? iframeMatch[1] : raw;
  const ap = autoplay ? "1" : "0";

  let m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  if (m) return { type: "iframe", src: `https://www.youtube.com/embed/${m[1]}?autoplay=${ap}&rel=0&modestbranding=1` };

  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return { type: "iframe", src: `https://player.vimeo.com/video/${m[1]}?autoplay=${ap}` };

  m = u.match(/(?:dailymotion\.com\/(?:video\/|embed\/video\/)|dai\.ly\/)([a-zA-Z0-9]+)/);
  if (m) return { type: "iframe", src: `https://www.dailymotion.com/embed/video/${m[1]}?autoplay=${ap}` };

  if (/\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(u)) return { type: "video", src: u };
  if (/player\.|\/embed\/|\/embed\?|youtube|vimeo|dailymotion/i.test(u)) return { type: "iframe", src: u };
  return { type: "iframe", src: u };
}
