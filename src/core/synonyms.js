// Sinonim va antonimlar lug‘ati.
import { normalize } from "./normalize.js";
import { analyzeForm, inflectLike, isDerivational } from "./morphology.js";

/**
 * @typedef {object} Sense — so‘zning bir ma’nosi
 * @property {string} [t] turkumi (ot, sifat, fe’l…)
 * @property {string} [u] uslubi (badiiy, so‘zlashuv…); neytral bo‘lsa yo‘q
 * @property {string} m ma’nosi
 * @property {string} [e] misol
 * @property {string[]} [s] sinonimlari
 * @property {string[]} [a] antonimlari
 */

export class Synonyms {
  /** kalit → kalitlar (tartib saqlanadi) */
  #synonyms = new Map();
  #antonyms = new Map();
  /** kalit → Sense[] */
  #senses = new Map();

  /** @param {{ sinonimlar?: Record<string, string[]>, manolar?: Record<string, Sense[]> }} [data] — data/sinonimlar.json */
  constructor(data) {
    if (data) this.add(data);
  }

  add({ sinonimlar = {}, manolar = {} }) {
    const synonymPairs = [];
    const antonymPairs = [];
    for (const [word, senses] of Object.entries(manolar)) {
      this.#senses.set(normalize(word), senses);
      for (const { s = [], a = [] } of senses) {
        s.forEach((synonym) => synonymPairs.push([word, synonym]));
        a.forEach((antonym) => antonymPairs.push([word, antonym]));
      }
    }
    for (const [word, synonyms] of Object.entries(sinonimlar)) {
      synonyms.forEach((synonym) => synonymPairs.push([word, synonym]));
    }
    linkBothWays(this.#synonyms, synonymPairs);
    linkBothWays(this.#antonyms, antonymPairs);
  }

  /** Sinonimi bor so‘zlar soni. */
  get size() { return this.#synonyms.size; }

  /** So‘zning sinonimlari (lotin, kichik harf); yo‘q bo‘lsa bo‘sh ro‘yxat. */
  of(word) {
    return [...(this.#synonyms.get(normalize(word)) ?? [])];
  }

  antonymsOf(word) {
    return [...(this.#antonyms.get(normalize(word)) ?? [])];
  }

  /** @returns {Sense[]} */
  sensesOf(word) {
    return this.#senses.get(normalize(word)) ?? [];
  }

  /**
   * Matndagi shakl o‘rniga qo‘yiladigan sinonimlar, o‘sha qo‘shimchalar bilan:
   * "abadiylikka" → ["mangulikka", …].
   * `isWord(key)` — imlo lug‘atida bormi: yasalgan shakllar (mangulik) shu bilan tekshiriladi.
   */
  forms(word, isWord = () => false) {
    const key = normalize(word);
    const analysis = analyzeForm(key, (k) => this.#synonyms.has(k));
    if (!analysis) return [];
    // Lug‘atdagi so‘z faqat so‘z yasovchilarga ajratiladi (abadiy|lik), aks holda olma → ol|ma bo‘lib qoladi
    if (analysis.suffixes.length && isWord(key) && !analysis.suffixes.every(isDerivational)) return [];

    const forms = this.of(analysis.base).map((synonym) => inflectLike(synonym, analysis, isWord));
    return [...new Set(forms.filter(Boolean))];
  }
}

/** Munosabat ikki tomonlama: avval so‘zning o‘z ro‘yxati, keyin uni ko‘rsatganlar. */
function linkBothWays(map, pairs) {
  for (const [word, other] of pairs) link(map, word, other);
  for (const [word, other] of pairs) link(map, other, word);
}

function link(map, word, other) {
  const key = normalize(word);
  const otherKey = normalize(other);
  if (!key || !otherKey || key === otherKey) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(otherKey);
}
