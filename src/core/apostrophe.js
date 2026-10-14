// O‘zbek lotin yozuvidagi apostrof (o‘, g‘, tutuq belgisi) bilan ishlash.

/** Lug‘atda ishlatiladigan yagona belgi. */
export const APOSTROPHE = "‘";

/** Foydalanuvchi yozishi mumkin bo‘lgan barcha apostrof ko‘rinishlari. */
export const APOSTROPHE_CHARS = "‘'`ʻʼ’´";

const ANY_APOSTROPHE = new RegExp(`[${APOSTROPHE_CHARS}]`, "g");
const LEADING_QUOTES = new RegExp(`^[${APOSTROPHE_CHARS}]+`);
// o‘ va g‘ dagi belgi harfning bir qismi, shuning uchun ular ortidagisi qo‘shtirnoq emas
const TRAILING_QUOTES = new RegExp(`(?<![oOgGоО])[${APOSTROPHE_CHARS}]+$`);

export const unifyApostrophes = (text) => text.replace(ANY_APOSTROPHE, APOSTROPHE);

/**
 * So‘z chetidagi qo‘shtirnoq vazifasidagi apostroflarni ajratadi.
 * @example splitQuotes("'go‘zal'") → ["'", "go‘zal", "'"]
 */
export function splitQuotes(token) {
  const lead = token.match(LEADING_QUOTES)?.[0] ?? "";
  const rest = token.slice(lead.length);
  const trail = rest.match(TRAILING_QUOTES)?.[0] ?? "";
  const word = rest.slice(0, rest.length - trail.length);
  return [lead, word, trail];
}
