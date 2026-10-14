import { normalize, skeleton } from "./normalize.js";
import { editDistance } from "./distance.js";
import { isKnownForm } from "./morphology.js";

const DIGRAPH_LETTERS = ["o‘", "g‘", "sh", "ch", "ng"];

/** "afta (lar)" → "afta", "kompensator ." → "kompensator" */
const cleanLine = (line) => line.trim().replace(/\s*\.$/, "").replace(/\s+/g, " ");
const withoutNotes = (key) => key.replace(/\s*\(.*?\)\s*/g, "").trim();

export const firstLetter = (key) => DIGRAPH_LETTERS.find((d) => key.startsWith(d)) ?? key[0];

export class Dictionary {
  #words = [];
  #keys = [];
  #skeletons = [];
  #byKey = new Map();
  #bySkeleton = new Map();

  constructor(rawText) {
    for (const line of rawText.split(/\r?\n/)) this.#add(cleanLine(line));
  }

  #add(word) {
    if (!word) return;
    const key = normalize(word);
    if (this.#byKey.has(key)) return;

    const index = this.#words.length;
    this.#words.push(word);
    this.#keys.push(key);
    this.#skeletons.push(skeleton(key));
    this.#byKey.set(key, index);

    const bare = withoutNotes(key);
    if (bare && !this.#byKey.has(bare)) this.#byKey.set(bare, index);

    const sk = skeleton(bare || key);
    if (!this.#bySkeleton.has(sk)) this.#bySkeleton.set(sk, []);
    this.#bySkeleton.get(sk).push(index);
  }

  get size() { return this.#words.length; }

  word(index) { return this.#words[index]; }

  key(index) { return this.#keys[index]; }

  /** So‘zning indeksi yoki -1. */
  indexOf(query) {
    return this.#byKey.get(normalize(query)) ?? -1;
  }

  hasForm(query) {
    return isKnownForm(normalize(query), (key) => this.#byKey.has(key));
  }

  randomIndex() {
    return Math.floor(Math.random() * this.size);
  }

  /** `predicate(key, index)` ga mos dastlabki `limit` ta indeks. */
  #collect(predicate, limit) {
    const found = [];
    for (let i = 0; i < this.#keys.length && found.length < limit; i++) {
      if (predicate(this.#keys[i], i)) found.push(i);
    }
    return found;
  }

  /** Avtoto‘ldirish: shu bilan boshlanadigan so‘zlar (apostrofsiz yozilgani ham hisobga olinadi). */
  startingWith(query, limit = 10) {
    const key = normalize(query);
    if (!key) return [];
    const found = this.#collect((k) => k.startsWith(key), limit);

    if (found.length < limit) {
      const sk = skeleton(key);
      const seen = new Set(found);
      found.push(...this.#collect((_, i) => !seen.has(i) && this.#skeletons[i].startsWith(sk), limit - found.length));
    }
    return found;
  }

  /** Berilgan so‘zdan yasalgan (u bilan boshlanadigan) boshqa so‘zlar. */
  derivedFrom(index, limit = 24) {
    const base = this.#keys[index];
    return this.#collect((k, i) => i !== index && k.length > base.length && k.startsWith(base), limit);
  }

  /** Xato yozilgan so‘zga eng yaqin variantlar. */
  similarTo(query, limit = 10) {
    const key = normalize(query);
    if (!key) return [];

    const scores = new Map();
    const score = (index, value) => {
      if (!scores.has(index) || scores.get(index) > value) scores.set(index, value);
    };

    for (const index of this.#bySkeleton.get(skeleton(key)) ?? []) score(index, 0.5);

    const maxDistance = key.length <= 3 ? 1 : key.length <= 7 ? 2 : 3;
    this.#keys.forEach((candidate, index) => {
      const distance = editDistance(key, candidate, maxDistance);
      if (distance > maxDistance) return;
      const firstLetterPenalty = candidate[0] === key[0] ? 0 : 0.3;
      score(index, distance + firstLetterPenalty);
    });

    const lengthGap = (index) => Math.abs(this.#keys[index].length - key.length);
    return [...scores]
      .sort(([a, sa], [b, sb]) => sa - sb || lengthGap(a) - lengthGap(b) || this.#keys[a].localeCompare(this.#keys[b]))
      .slice(0, limit)
      .map(([index]) => index);
  }

  /** Bosh harf (o‘, g‘, sh, ch, ng ham alohida harf) bo‘yicha guruhlar. */
  groupByLetter() {
    const groups = new Map();
    this.#keys.forEach((key, index) => {
      const letter = firstLetter(key);
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter).push(index);
    });
    return groups;
  }
}
