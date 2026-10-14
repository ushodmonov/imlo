import { test } from "node:test";
import assert from "node:assert/strict";
import { toCyrillic, toLatin } from "../src/core/transliteration.js";
import { splitQuotes } from "../src/core/apostrophe.js";
import { normalize, skeleton } from "../src/core/normalize.js";

test("lotin → kirill", () => {
  assert.equal(toCyrillic("O‘zbekiston"), "Ўзбекистон");
  assert.equal(toCyrillic("shahar choy"), "шаҳар чой");
  assert.equal(toCyrillic("ertak, aeroport"), "эртак, аэропорт");
  assert.equal(toCyrillic("ma’no"), "маъно");
  assert.equal(toCyrillic("abbreviatsiya"), "аббревиация");
  assert.equal(toCyrillic("SHAHAR"), "ШАҲАР");
  assert.equal(toCyrillic("yo‘q, Yo‘lak, yoʻrgʻa, yoz"), "йўқ, Йўлак, йўрға, ёз");
});

test("kirill → lotin", () => {
  assert.equal(toLatin("Ўзбекистон"), "O‘zbekiston");
  assert.equal(toLatin("ер, келди"), "yer, keldi");
  assert.equal(toLatin("цирк, милиция"), "sirk, militsiya");
  assert.equal(toLatin("съезд, маъно"), "syezd, maʼno");
});

test("qo‘shtirnoq apostroflari so‘zdan ajratiladi", () => {
  assert.deepEqual(splitQuotes("'go‘zal'"), ["'", "go‘zal", "'"]);
  assert.deepEqual(splitQuotes("bo‘"), ["", "bo‘", ""]);
  assert.equal(toCyrillic("'go‘zal'"), "'гўзал'");
});

test("normalize va skeleton", () => {
  assert.equal(normalize("  O'g`il "), "o‘g‘il");
  assert.equal(normalize("ўғил"), "o‘g‘il");
  assert.equal(skeleton("o‘g‘il"), "ogil");
});
