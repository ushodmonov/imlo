import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Synonyms } from "../src/core/synonyms.js";

const raw = readFileSync(new URL("../data/sinonimlar.json", import.meta.url), "utf8");
const synonyms = new Synonyms(JSON.parse(raw));

test("sinonimlar fayli yuklanadi: manbalar birlashgan", () => {
  assert.ok(synonyms.size > 5000);
  assert.ok(synonyms.of("abadiy").includes("mangu"));     // ikkalasida ham bor
  assert.ok(synonyms.of("abadiy").includes("jovidon"));   // GoldCore
  assert.ok(synonyms.antonymsOf("abadiy").includes("vaqtincha"));
  const [sense] = synonyms.sensesOf("abadiy");
  assert.equal(sense.t, "sifat");
  assert.match(sense.m, /oxiri yoʻq/);
});

test("sinonim har qanday apostrof va yozuvda topiladi", () => {
  for (const query of ["a’lo", "a'lo", "A`lo", "аъло"]) {
    assert.ok(synonyms.of(query).includes("afzal"), query);
  }
  assert.deepEqual(synonyms.of("абадий"), synonyms.of("abadiy"));
});

test("sinonimlik ikki tomonlama, o‘z ro‘yxati birinchi", () => {
  const s = new Synonyms({ sinonimlar: { katta: ["ulkan", "yirik"], ulkan: ["bahaybat"], buyuk: ["katta"] } });
  assert.deepEqual(s.of("katta"), ["ulkan", "yirik", "buyuk"]);
  assert.deepEqual(s.of("ulkan"), ["bahaybat", "katta"]);
  assert.deepEqual(s.of("yirik"), ["katta"]);
});

test("so‘zning o‘zi va takrorlar chiqarib tashlanadi", () => {
  const s = new Synonyms({ sinonimlar: { "o‘g‘il": ["o'g'il", "farzand", "Farzand"] } });
  assert.deepEqual(s.of("o‘g‘il"), ["farzand"]);
});

test("sinonimi yo‘q so‘z uchun bo‘sh ro‘yxat", () => {
  assert.deepEqual(synonyms.of("xyzqw"), []);
  assert.deepEqual(new Synonyms().of("abadiy"), []);
});

test("sinonim matndagi qo‘shimchalar bilan beriladi", () => {
  const s = new Synonyms({ sinonimlar: {
    yurak: ["qalb", "dil"], qishloq: ["ovul", "ovloq"], bajarmoq: ["ado etmoq"],
    ota: ["padar"], yozmoq: ["bitmoq"], kitob: ["asar"], abadiy: ["mangu", "toabad"], olmoq: ["tutmoq"],
  } });
  const isWord = (key) => ["olma", "mangulik", "abadiylik"].includes(key);
  const cases = {
    yurakka: ["qalbga", "dilga"],                  // -ga/-ka/-qa asosga moslanadi
    yuragimda: ["qalbimda", "dilimda"],
    "qishlog‘imizda": ["ovulimizda"],              // ovloq → ovlog‘i yoki ovloqi? noaniq, berilmaydi
    bajardi: ["ado etdi"],
    otam: ["padarim"],                             // -m ↔ -im
    yozadi: ["bitadi"],
    kitoblarimizdan: ["asarlarimizdan"],
    abadiylikka: ["mangulikka"],                   // toabadlik lug‘atda yo‘q
    abadiylik: ["mangulik"],
    olma: [],                                      // lug‘atdagi so‘z: ol + ma emas
    olmadi: ["tutmadi"],
  };
  for (const [word, expected] of Object.entries(cases)) {
    assert.deepEqual(s.forms(word, isWord), expected, word);
  }
});

test("so‘z turkumi mos kelmasa shakl yasalmaydi", () => {
  const s = new Synonyms({ sinonimlar: { yozmoq: ["bitmoq", "xat"] } });
  assert.deepEqual(s.forms("yozdi"), ["bitdi"]);
});

test("ma’nolardagi sinonim va antonimlar ikki tomonlama", () => {
  const s = new Synonyms({
    sinonimlar: { katta: ["ulkan"] },
    manolar: { katta: [{ t: "sifat", m: "Hajmi ortiq", s: ["yirik"], a: ["kichik"] }] },
  });
  assert.deepEqual(s.of("katta"), ["yirik", "ulkan"]);   // avval ma’nolardagi, keyin qolganlari
  assert.deepEqual(s.antonymsOf("katta"), ["kichik"]);
  assert.deepEqual(s.antonymsOf("Кичик"), ["katta"]);
  assert.equal(s.sensesOf("KATTA")[0].m, "Hajmi ortiq");
  assert.deepEqual(s.sensesOf("kichik"), []);
});

test("kech yuklangan ma’lumot qo‘shiladi", () => {
  const s = new Synonyms();
  assert.deepEqual(s.of("abadiy"), []);
  s.add({ sinonimlar: { abadiy: ["mangu"] } });
  assert.deepEqual(s.of("abadiy"), ["mangu"]);
});
