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
