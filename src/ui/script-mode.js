// Tanlangan yozuv (lotin/kirill) holati va interfeys matnlarini unga moslash.
import { toCyrillic } from "../core/transliteration.js";
import { $$ } from "./dom.js";

const STORAGE_KEY = "imlo-script";
const listeners = new Set();

let current = readStored();

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "cyr" ? "cyr" : "lat";
  } catch {
    return "lat";
  }
}

export const isCyrillicMode = () => current === "cyr";

/** Lotincha matnni tanlangan yozuvda qaytaradi. */
export const show = (latin) => (isCyrillicMode() ? toCyrillic(latin) : latin);

export function setScript(script) {
  if (script === current) return;
  current = script;
  try { localStorage.setItem(STORAGE_KEY, script); } catch { /* maxfiy rejim */ }
  translatePage();
  listeners.forEach((listener) => listener());
}

export const onScriptChange = (listener) => listeners.add(listener);

/** data-i18n va placeholder matnlarini asl lotincha nusxadan qayta yozadi. */
export function translatePage() {
  $$("[data-i18n]").forEach((node) => {
    node.dataset.latin ??= node.textContent;
    node.textContent = show(node.dataset.latin);
  });
  $$("[placeholder]").forEach((node) => {
    node.dataset.latinPlaceholder ??= node.placeholder;
    node.placeholder = show(node.dataset.latinPlaceholder);
  });
  $$("[data-script]").forEach((button) =>
    button.classList.toggle("is-active", button.dataset.script === current));
  document.documentElement.lang = isCyrillicMode() ? "uz-Cyrl" : "uz";
}
