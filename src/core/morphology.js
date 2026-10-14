// So‘z shakllarini lug‘atdagi asosga qaytarish (soddalashtirilgan qo‘shimcha ajratish).

const MAX_DEPTH = 4;
const MIN_STEM_LENGTH = 2;

const SUFFIXES = [
  // ko‘plik va kelishik
  "lardan", "larning", "larni", "larga", "larda", "lari", "lar",
  "ning", "dagi", "dan", "tan", "ga", "ka", "qa", "da", "ta", "ni", "na",
  // egalik
  "ingizning", "imizning", "ingiz", "imiz", "ngiz", "miz", "ing", "im", "ng", "m", "si", "i",
  // fe’l shakllari
  "moqda", "yotgan", "ayapti", "yapti", "apti", "ganlar", "ganda", "guncha", "gach",
  "gan", "kan", "qan", "masdan", "mas", "may", "madi", "ma", "aydi", "adi", "ydi",
  "dingiz", "dilar", "ding", "dik", "dim", "di", "tik", "tim", "ti",
  "ib", "b", "sa", "sin", "ish", "sh", "ar", "r", "moq",
  // so‘z yasovchi va yuklamalar
  "uvchi", "ovchi", "vchi", "uv", "ov", "ylik", "lik", "li", "siz", "chi", "cha", "roq",
  "gina", "kina", "qina", "dek", "day", "dir", "mi", "yu", "u",
].sort((a, b) => b.length - a.length);

/** Qo‘shimcha ajratilgandan keyin asosning mumkin bo‘lgan lug‘aviy shakllari. */
function baseForms(stem) {
  const forms = [stem, stem + "moq"];
  if (stem.endsWith("g‘")) forms.push(stem.slice(0, -2) + "q"); // qishlog‘i → qishloq
  else if (stem.endsWith("g")) forms.push(stem.slice(0, -1) + "k"); // yuragim → yurak
  if (stem.endsWith("y")) forms.push(stem.slice(0, -1)); // o‘qiyapti → o‘qi
  return forms;
}

/**
 * Qo‘shimchali shaklni asos va qo‘shimchalarga ajratadi (eng kam qo‘shimchali variant).
 * `stem` — asosning matndagi ko‘rinishi.
 * @example analyzeForm("qishlog‘imizda", has) → { base: "qishloq", stem: "qishlog‘", suffixes: ["imiz", "da"] }
 * @example analyzeForm("yozdi", has) → { base: "yozmoq", stem: "yoz", suffixes: ["di"] }
 */
export function analyzeForm(key, hasKey) {
  if (hasKey(key)) return { base: key, stem: key, suffixes: [] };
  for (let count = 1; count <= MAX_DEPTH; count++) {
    const found = splitSuffixes(key, hasKey, count);
    if (found) return found;
  }
  return null;
}

/** Aynan `count` ta qo‘shimchaga ajratish. */
function splitSuffixes(key, hasKey, count) {
  for (const suffix of SUFFIXES) {
    if (!key.endsWith(suffix) || key.length - suffix.length < MIN_STEM_LENGTH) continue;
    const stem = key.slice(0, -suffix.length);
    if (count === 1) {
      const base = baseForms(stem).find(hasKey);
      if (base) return { base, stem, suffixes: [suffix] };
    } else {
      const inner = splitSuffixes(stem, hasKey, count - 1);
      if (inner) return { ...inner, suffixes: [...inner.suffixes, suffix] };
    }
  }
  return null;
}

/** So‘z yasovchi qo‘shimchalar: har qanday asosga ham qo‘shilavermaydi (mangulik bor, toabadlik yo‘q). */
const DERIVATIONAL = new Set(["uvchi", "ovchi", "vchi", "uv", "ov", "ylik", "lik", "li", "siz", "chi", "cha", "roq"]);

export const isDerivational = (suffix) => DERIVATIONAL.has(suffix);

const VOWEL_END = /(?:[aeiou]|o‘)$/;
const GKQ_SUFFIXES = new Set(["ga", "ka", "qa", "gan", "kan", "qan", "ganlar", "ganda", "guncha", "gach",
  "gina", "kina", "qina"]);
/** Undosh bilan tugagan asosdagi shakl → unli bilan tugagandagi shakl. */
const AFTER_VOWEL = new Map([["i", "si"], ["im", "m"], ["ing", "ng"], ["imiz", "miz"], ["ingiz", "ngiz"],
  ["imizning", "mizning"], ["ingizning", "ngizning"], ["ib", "b"], ["ish", "sh"], ["ar", "r"], ["adi", "ydi"],
  ["u", "yu"]]);
const AFTER_CONSONANT = new Map([...AFTER_VOWEL].map(([consonantForm, vowelForm]) => [vowelForm, consonantForm]));

/** Qo‘shimchani asosga ulaydi; to‘g‘ri shakli aniq bo‘lmasa null. */
function attach(stem, suffix, isVerbStem) {
  if (GKQ_SUFFIXES.has(suffix)) {
    const letter = stem.endsWith("k") ? "k" : stem.endsWith("q") ? "q" : "g"; // yurakka, qishloqqa, uyga
    return stem + letter + suffix.slice(1);
  }
  const vowelEnd = VOWEL_END.test(stem);
  if (vowelEnd && AFTER_VOWEL.has(suffix)) return stem + AFTER_VOWEL.get(suffix);
  if (!vowelEnd && AFTER_CONSONANT.has(suffix)) return stem + AFTER_CONSONANT.get(suffix);
  if (/^[aeiou]/.test(suffix)) {
    if (vowelEnd) return null;
    // yurak → yuragi, lekin ishtirok → ishtiroki: qaysi biri ekanini bilmaymiz
    if (!isVerbStem && /[kq]$/.test(stem)) return null;
  }
  return stem + suffix;
}

/**
 * `analyzeForm` topgan qo‘shimchalarni boshqa so‘zga qo‘shadi; so‘z turkumi yoki shakli mos kelmasa null.
 * So‘z yasovchi qo‘shimchadan keyingi shakl `isWord` dan o‘tishi kerak.
 * @example inflectLike("mangu", { base: "abadiy", stem: "abadiy", suffixes: ["lik", "ka"] }, isWord) → "mangulikka"
 */
export function inflectLike(word, { base, stem, suffixes }, isWord = () => true) {
  if (!suffixes.length) return word;
  if (word.endsWith("moq") !== base.endsWith("moq")) return null;

  const isVerbStem = base === stem + "moq"; // yoz|di ← yozmoq
  const [first, ...rest] = suffixes;
  let form = attach(isVerbStem ? word.slice(0, -"moq".length) : word, first, isVerbStem);
  if (form === null || (isDerivational(first) && !isWord(form))) return null;
  for (const suffix of rest) {
    form += suffix;
    if (isDerivational(suffix) && !isWord(form)) return null;
  }
  return form;
}

/** So‘z (yoki uning qo‘shimchali shakli) lug‘atda bormi. */
export function isKnownForm(key, hasKey, depth = 0) {
  if (hasKey(key)) return true;

  if (key.includes("-")) {
    const parts = key.split("-");
    if (parts.every((part) => part && isKnownForm(part, hasKey, depth))) return true;
  }

  if (depth >= MAX_DEPTH) return false;

  return SUFFIXES.some((suffix) => {
    if (!key.endsWith(suffix) || key.length - suffix.length < MIN_STEM_LENGTH) return false;
    const stem = key.slice(0, -suffix.length);
    return baseForms(stem).some((form) => isKnownForm(form, hasKey, depth + 1));
  });
}
