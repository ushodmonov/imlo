// Qidiruv kalitlari: so‘zni lug‘at bilan solishtirish uchun yagona ko‘rinishga keltirish.
import { APOSTROPHE, unifyApostrophes } from "./apostrophe.js";
import { isCyrillic, toLatin } from "./transliteration.js";

const SKELETON_NOISE = new RegExp(`[${APOSTROPHE}\\- ]`, "g");

/** Lotin, kichik harf, yagona apostrof, ortiqcha bo‘shliqsiz: " O'g'il " → "o‘g‘il" */
export function normalize(text) {
  const latin = isCyrillic(text) ? toLatin(text) : text;
  return unifyApostrophes(latin.trim().toLowerCase())
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-");
}

/** Apostrof, defis va bo‘shliqlarsiz shakl — "ogil" → "o‘g‘il" kabi xatolarni topish uchun. */
export const skeleton = (key) => key.replace(SKELETON_NOISE, "");
