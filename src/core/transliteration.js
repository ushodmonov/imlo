// Lotin ⇄ kirill transliteratsiyasi.
import { APOSTROPHE, APOSTROPHE_CHARS, unifyApostrophes, splitQuotes } from "./apostrophe.js";

const LATIN_WORD = new RegExp(`[A-Za-z${APOSTROPHE_CHARS}]+`, "g");
const CYRILLIC_WORD = /[а-яёўқғҳ]+/gi;
const CYRILLIC_CHAR = /[а-яёўқғҳ]/i;

const LATIN_VOWELS = "aeiou";
const CYRILLIC_VOWELS = "аеёиоуэюяўъь";
const IOTATED_VOWELS = "еёюя";

const LATIN_DIGRAPHS = {
  [`o${APOSTROPHE}`]: "ў", [`g${APOSTROPHE}`]: "ғ",
  sh: "ш", ch: "ч", yo: "ё", yu: "ю", ya: "я", ye: "е",
};

const LATIN_LETTERS = {
  a: "а", b: "б", c: "ц", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж",
  k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т",
  u: "у", v: "в", w: "в", x: "х", y: "й", z: "з", [APOSTROPHE]: "ъ",
};

const CYRILLIC_LETTERS = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ё: "yo", ж: "j", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "x", ч: "ch", ш: "sh", щ: "sh", ъ: "ʼ", ы: "i", ь: "", э: "e",
  ю: "yu", я: "ya", ў: "o‘", қ: "q", ғ: "g‘", ҳ: "h",
};

// -tsiya, -tsion kabi o‘zlashma qo‘shimchalardagi "ts" kirillda "ц" bo‘ladi
const TS_AS_TSE = /^ts(iya|io|ia)/;

export const isCyrillic = (text) => CYRILLIC_CHAR.test(text);

/** Asl so‘zning registrini (kichik / Bosh harf / KATTA) natijaga ko‘chiradi. */
function matchCase(source, result) {
  if (!result) return result;
  const isAllCaps = source.length > 1 && source === source.toUpperCase() && source !== source.toLowerCase();
  if (isAllCaps) return result.toUpperCase();
  const isCapitalized = source[0] !== source[0].toLowerCase();
  return isCapitalized ? result[0].toUpperCase() + result.slice(1) : result;
}

function latinWordToCyrillic(token) {
  const [lead, word, trail] = splitQuotes(token);
  if (!word) return token;

  const lower = unifyApostrophes(word).toLowerCase();
  let out = "";
  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    const pair = lower.slice(i, i + 2);
    const atSyllableStart = i === 0 || LATIN_VOWELS.includes(lower[i - 1]);

    if (LATIN_DIGRAPHS[pair]) {
      out += LATIN_DIGRAPHS[pair];
      i++;
    } else if (TS_AS_TSE.test(lower.slice(i))) {
      out += "ц";
      i++;
    } else if (char === "e" && atSyllableStart) {
      out += "э"; // ertak → эртак, aeroport → аэропорт
    } else {
      out += LATIN_LETTERS[char] ?? char;
    }
  }
  return lead + matchCase(word, out) + trail;
}

function cyrillicWordToLatin(word) {
  const lower = word.toLowerCase();
  let out = "";
  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    const afterVowel = i > 0 && CYRILLIC_VOWELS.includes(lower[i - 1]);

    if (char === "е") {
      out += i === 0 || afterVowel ? "ye" : "e"; // ер → yer, келди → keldi
    } else if (char === "ц") {
      out += afterVowel ? "ts" : "s"; // милиция → militsiya, цирк → sirk
    } else if (char === "ъ" && IOTATED_VOWELS.includes(lower[i + 1])) {
      // съезд → syezd: y harfi bo‘g‘inni o‘zi ajratadi
    } else {
      out += CYRILLIC_LETTERS[char] ?? char;
    }
  }
  return matchCase(word, out);
}

export const toCyrillic = (text) => text.replace(LATIN_WORD, latinWordToCyrillic);

export const toLatin = (text) => text.replace(CYRILLIC_WORD, cyrillicWordToLatin);
