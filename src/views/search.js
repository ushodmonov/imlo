import { $, $$, el, copyToClipboard } from "../ui/dom.js";
import { show, isCyrillicMode } from "../ui/script-mode.js";
import { normalize } from "../core/normalize.js";
import { toCyrillic } from "../core/transliteration.js";

const SUGGESTION_LIMIT = 10;

export function createSearchView({ dictionary, synonyms, setHash }) {
  const form = $("#search-form");
  const input = $("#search-input");
  const suggestList = $("#suggest");
  const result = $("#result");
  const tips = $("#tips");

  let suggestions = [];
  let activeSuggestion = -1;
  let shownQuery = "";

  // ----- Avtoto‘ldirish -----

  function closeSuggestions() {
    suggestList.classList.remove("is-open");
    activeSuggestion = -1;
  }

  function suggestionItem(index, typed) {
    const word = show(dictionary.word(index));
    const label = word.toLowerCase().startsWith(typed)
      ? [el("mark", {}, word.slice(0, typed.length)), word.slice(typed.length)]
      : [word];
    return el("li", {
      role: "option",
      onmousedown: (event) => { event.preventDefault(); open(index); },
    }, ...label);
  }

  function renderSuggestions() {
    const query = normalize(input.value);
    suggestions = dictionary.startingWith(query, SUGGESTION_LIMIT);
    const typed = show(query);
    suggestList.replaceChildren(...suggestions.map((index) => suggestionItem(index, typed)));
    activeSuggestion = -1;
    suggestList.classList.toggle("is-open", suggestions.length > 0);
  }

  function moveSelection(step) {
    const items = $$("li", suggestList);
    if (!items.length) return;
    activeSuggestion = (activeSuggestion + step + items.length) % items.length;
    items.forEach((item, i) => item.classList.toggle("is-active", i === activeSuggestion));
    items[activeSuggestion].scrollIntoView({ block: "nearest" });
  }

  function insertAtCursor(text) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.focus();
    input.setSelectionRange(start + text.length, start + text.length);
    renderSuggestions();
  }

  // ----- Natija -----

  function wordChips(indices) {
    return el("div", { className: "chips" }, ...indices.map((index) =>
      el("button", { type: "button", className: "chip", onclick: () => open(index) }, show(dictionary.word(index)))));
  }

  /** Sinonim/antonimlar; imlo lug‘atida bori o‘sha yerdagi yozilishida ko‘rsatiladi. */
  function relatedChips(list) {
    return el("div", { className: "chips" }, ...list.map((synonym) => {
      const index = dictionary.indexOf(synonym);
      const word = index >= 0 ? dictionary.word(index) : synonym;
      return el("button", { type: "button", className: "chip", onclick: () => lookUp(word) }, show(word));
    }));
  }

  /** @param {import("../core/synonyms.js").Sense} sense */
  function senseItem({ t, u, m, e, s = [], a = [] }) {
    const relation = (label, list) => list.length
      ? el("div", { className: "sense__rel" }, el("span", { className: "sense__label" }, show(label)), relatedChips(list))
      : null;
    return el("li", { className: "sense" },
      el("div", {}, ...[t, u].filter(Boolean).map((tag) => el("span", { className: "tag" }, show(tag))), show(m)),
      e ? el("div", { className: "sense__example" }, show(e)) : null,
      relation("Sinonimlari:", s),
      relation("Antonimlari:", a),
    );
  }

  /** Ma’nolari, so‘ng ma’nolarda ko‘rsatilmagan sinonim va antonimlar. */
  function meaningNodes(word) {
    const senses = synonyms.sensesOf(word);
    const inSenses = (field) => new Set(senses.flatMap((sense) => (sense[field] ?? []).map(normalize)));
    const shownSynonyms = inSenses("s");
    const shownAntonyms = inSenses("a");
    const otherSynonyms = synonyms.of(word).filter((w) => !shownSynonyms.has(w));
    const otherAntonyms = synonyms.antonymsOf(word).filter((w) => !shownAntonyms.has(w));
    const prefix = senses.length ? "Boshqa " : "";

    return [
      senses.length ? el("h4", {}, show("Ma’nolari")) : null,
      senses.length ? el("ol", { className: "senses" }, ...senses.map(senseItem)) : null,
      otherSynonyms.length ? el("h4", {}, show(`${prefix}sinonimlari`)) : null,
      otherSynonyms.length ? relatedChips(otherSynonyms) : null,
      otherAntonyms.length ? el("h4", {}, show(`${prefix}antonimlari`)) : null,
      otherAntonyms.length ? relatedChips(otherAntonyms) : null,
    ];
  }

  function copyButton(text) {
    const copy = () => copyToClipboard(text, show("Nusxalandi"));
    return el("button", { type: "button", className: "copy-btn", onclick: copy }, show("Nusxalash"));
  }

  function foundCard(index) {
    const word = dictionary.word(index);
    const otherScript = isCyrillicMode() ? word : toCyrillic(word);
    const derived = dictionary.derivedFrom(index);

    return el("div", { className: "card card--ok" },
      el("span", { className: "status status--ok" }, show("✓ To‘g‘ri yozilgan")),
      el("div", { className: "result__word" }, show(word), copyButton(show(word))),
      el("div", { className: "result__alt" }, otherScript),
      ...meaningNodes(word),
      derived.length ? el("h4", {}, show("Shu so‘z bilan boshlanadigan so‘zlar")) : null,
      derived.length ? wordChips(derived) : null,
    );
  }

  function notFoundCard(query) {
    const similar = dictionary.similarTo(query, 12);
    return el("div", { className: "card card--bad" },
      el("span", { className: "status status--bad" }, show("✗ Lug‘atda topilmadi")),
      el("div", { className: "result__word" }, query.trim()),
      similar.length
        ? el("h4", {}, show("Balki siz shuni nazarda tutgandirsiz"))
        : el("p", { className: "muted" }, show("O‘xshash so‘z topilmadi. Yozilishini tekshirib, qayta urinib ko‘ring.")),
      similar.length ? wordChips(similar) : null,
      // imlo lug‘atida yo‘q, lekin sinonimlar lug‘atida bor so‘zlar (iboralar) uchun
      ...meaningNodes(query),
    );
  }

  function render(query) {
    const index = dictionary.indexOf(query);
    result.replaceChildren(index >= 0 ? foundCard(index) : notFoundCard(query));
  }

  function search(query) {
    const key = normalize(query);
    closeSuggestions();
    tips.hidden = Boolean(key);
    setHash(key ? `q=${key}` : "");
    shownQuery = key ? query : "";

    if (!key) return result.replaceChildren();
    render(query);
  }

  function lookUp(word) {
    input.value = show(word);
    search(word);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function open(index) {
    lookUp(dictionary.word(index));
  }

  // ----- Hodisalar -----

  input.addEventListener("input", renderSuggestions);
  input.addEventListener("blur", closeSuggestions);
  input.addEventListener("search", () => { if (!input.value) search(""); });
  input.addEventListener("keydown", (event) => {
    const keyActions = {
      ArrowDown: () => moveSelection(1),
      ArrowUp: () => moveSelection(-1),
      Escape: closeSuggestions,
    };
    if (!keyActions[event.key]) return;
    event.preventDefault();
    keyActions[event.key]();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (activeSuggestion >= 0) open(suggestions[activeSuggestion]);
    else search(input.value);
  });

  $$("[data-key]").forEach((button) =>
    button.addEventListener("click", () => insertAtCursor(show(button.dataset.key))));

  $("#random-btn").addEventListener("click", () => open(dictionary.randomIndex()));

  $("#word-count").textContent = dictionary.size.toLocaleString("ru-RU");
  input.disabled = false;

  return {
    /** Hash orqali kelgan so‘zni ochish. */
    enter(query = "") {
      if (query) input.value = show(query);
      search(input.value);
      input.focus();
    },
    /** Yozuv almashtirilganda natijani qayta chizish. */
    refresh() {
      const key = normalize(input.value);
      input.value = show(key);
      if (key) search(key);
    },
    /** Ko‘rsatilgan natijani qayta chizish (yozilayotgan matnga tegmaydi). */
    redraw() {
      if (shownQuery) render(shownQuery);
    },
    open,
  };
}
