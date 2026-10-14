import { $, el } from "../ui/dom.js";
import { show } from "../ui/script-mode.js";
import { splitQuotes } from "../core/apostrophe.js";
import { isCyrillic, toCyrillic } from "../core/transliteration.js";

const LETTER = "A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ‘'`ʻʼ’";
const WORD_PATTERN = new RegExp(`[${LETTER}]+(?:-[${LETTER}]+)*`, "g");

const SUGGESTION_LIMIT = 6;

/** Matndagi so‘zlar: { word, start } */
function* tokenize(text) {
  for (const match of text.matchAll(WORD_PATTERN)) {
    const [lead, word] = splitQuotes(match[0]);
    if (word) yield { word, start: match.index + lead.length };
  }
}

/** Taklifni asl so‘zning yozuvi va bosh harfiga moslaydi. */
function adaptTo(original, suggestion) {
  const word = isCyrillic(original) ? toCyrillic(suggestion) : suggestion;
  const isCapital = original[0] !== original[0].toLowerCase();
  return isCapital ? word[0].toUpperCase() + word.slice(1) : word;
}

export function createTextCheckView({ dictionary, setHash }) {
  const textarea = $("#text-input");
  const output = $("#text-output");
  const stats = $("#text-stats");
  let popover = null;

  function closePopover() {
    popover?.remove();
    popover = null;
  }

  function replaceWord({ start, word }, replacement) {
    const text = textarea.value;
    textarea.value = text.slice(0, start) + replacement + text.slice(start + word.length);
    check();
  }

  function openPopover(anchor, token) {
    closePopover();
    const options = dictionary.similarTo(token.word, SUGGESTION_LIMIT)
      .map((index) => adaptTo(token.word, dictionary.word(index)))
      .map((word) => el("button", { type: "button", onclick: () => replaceWord(token, word) }, word));

    popover = el("div", { className: "popover" },
      ...(options.length ? options : [el("div", { className: "popover__empty" }, show("Taklif yo‘q"))]));

    const rect = anchor.getBoundingClientRect();
    popover.style.top = `${window.scrollY + rect.bottom + 6}px`;
    popover.style.left = `${Math.max(8, Math.min(window.scrollX + rect.left, window.innerWidth - 270))}px`;
    document.body.append(popover);
  }

  function errorMark(token) {
    return el("span", {
      className: "err",
      onclick: (event) => { event.stopPropagation(); openPopover(event.currentTarget, token); },
    }, token.word);
  }

  function check() {
    closePopover();
    const text = textarea.value;
    output.classList.toggle("is-visible", Boolean(text.trim()));
    if (!text.trim()) {
      output.replaceChildren();
      stats.textContent = "";
      return;
    }

    const parts = [];
    let cursor = 0, total = 0, unknown = 0;
    for (const token of tokenize(text)) {
      total++;
      if (dictionary.hasForm(token.word)) continue;
      unknown++;
      parts.push(text.slice(cursor, token.start), errorMark(token));
      cursor = token.start + token.word.length;
    }
    parts.push(text.slice(cursor));

    output.replaceChildren(...parts);
    stats.textContent = show(`${total} ta so‘z, ${unknown} ta notanish`);
  }

  function clear() {
    textarea.value = "";
    check();
    textarea.focus();
  }

  $("#text-check").addEventListener("click", check);
  $("#text-clear").addEventListener("click", clear);
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) check();
  });
  document.addEventListener("click", (event) => {
    if (popover && !popover.contains(event.target)) closePopover();
  });

  return {
    enter() {
      setHash("matn");
      textarea.focus();
    },
    refresh() {
      if (output.classList.contains("is-visible")) check();
    },
  };
}
