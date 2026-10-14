import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Dictionary } from "../src/core/dictionary.js";

const raw = readFileSync(new URL("../data/imlo_uz_words.txt", import.meta.url), "utf8");
const dictionary = new Dictionary(raw);
const words = (indices) => indices.map((index) => dictionary.word(index));

test("lug‘at yuklanadi", () => {
  assert.ok(dictionary.size > 80_000);
});

test("so‘z har qanday apostrof va yozuvda topiladi", () => {
  for (const query of ["o‘g‘il", "o'g'il", "o`g`il", "ўғил"]) {
    assert.notEqual(dictionary.indexOf(query), -1, query);
  }
  assert.equal(dictionary.indexOf("kitop"), -1);
});

test("xato so‘zga to‘g‘ri variant taklif qilinadi", () => {
  assert.equal(words(dictionary.similarTo("kitop", 1))[0], "kitob");
  assert.equal(words(dictionary.similarTo("shaxar", 1))[0], "shahar");
  assert.ok(words(dictionary.similarTo("ogil", 5)).includes("o‘g‘il"));
});

test("avtoto‘ldirish apostrofsiz prefiksni ham tushunadi", () => {
  assert.ok(words(dictionary.startingWith("ogi", 10)).includes("o‘g‘il"));
});

test("qo‘shimchali shakllar taniladi", () => {
  for (const form of ["kitoblarimizdan", "maktabga", "yozdi", "o‘qidik", "o‘qiyapti", "yuragim", "qishlog‘imiz"]) {
    assert.ok(dictionary.hasForm(form), form);
  }
  assert.equal(dictionary.hasForm("xyzqw"), false);
});
