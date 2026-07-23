export const DEFAULT_WELCOME_MESSAGES = [
  "Bon retour, {name} !",
  "Content de te revoir, {name}",
  "Amuse-toi bien, {name} !",
  "Ravi de te retrouver, {name}",
  "Prêt·e pour une nouvelle aventure, {name} ?",
];

export function pickWelcome(messages, name) {
  const list = messages && messages.length ? messages : DEFAULT_WELCOME_MESSAGES;
  const m = list[Math.floor(Math.random() * list.length)] || "Bon retour, {name} !";
  return m.replace(/\{name\}/g, name || "").trim();
}
