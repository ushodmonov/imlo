import { $, el, debounce } from "../ui/dom.js";
import { show } from "../ui/script-mode.js";
import { normalize } from "../core/normalize.js";

const ALPHABET = ["a", "b", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q",
  "r", "s", "t", "u", "v", "x", "y", "z", "o‘", "g‘", "sh", "ch", "ng"];
const PAGE_SIZE = 240;

const capitalize = (letter) => letter[0].toUpperCase() + letter.slice(1);

export function createBrowseView({ dictionary, setHash, onWordSelected }) {
  const alphabet = $("#alphabet");
  const title = $("#browse-title");
  const filter = $("#browse-filter");
  const grid = $("#word-grid");
  const pager = $("#pager");

  const groups = dictionary.groupByLetter();
  const extraLetters = [...groups.keys()].filter((letter) => !ALPHABET.includes(letter));
  const letters = [...ALPHABET, ...extraLetters].filter((letter) => groups.has(letter));

  let letter = letters[0];
  let page = 0;

  function selectLetter(next) {
    letter = next;
    page = 0;
    filter.value = "";
    render();
  }

  function goToPage(next) {
    page = next;
    render();
    title.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function filteredWords() {
    const query = normalize(filter.value);
    const indices = groups.get(letter);
    return query ? indices.filter((index) => dictionary.key(index).includes(query)) : indices;
  }

  function renderAlphabet() {
    alphabet.replaceChildren(...letters.map((l) => el("button", {
      type: "button",
      className: l === letter ? "is-active" : "",
      title: `${groups.get(l).length}`,
      onclick: () => selectLetter(l),
    }, show(capitalize(l)))));
  }

  function renderWords(indices) {
    grid.replaceChildren(...indices.map((index) => {
      const word = show(dictionary.word(index));
      return el("li", {}, el("button", { type: "button", title: word, onclick: () => onWordSelected(index) }, word));
    }));
  }

  function renderPager(pageCount) {
    if (pageCount <= 1) return pager.replaceChildren();
    pager.replaceChildren(
      el("button", { type: "button", disabled: page === 0, onclick: () => goToPage(page - 1) }, "←"),
      el("span", {}, `${page + 1} / ${pageCount}`),
      el("button", { type: "button", disabled: page >= pageCount - 1, onclick: () => goToPage(page + 1) }, "→"),
    );
  }

  function render() {
    setHash(`lugat=${letter}`);
    const words = filteredWords();
    const pageCount = Math.max(1, Math.ceil(words.length / PAGE_SIZE));
    page = Math.min(page, pageCount - 1);

    renderAlphabet();
    title.textContent = `${show(capitalize(letter))} — ${words.length} ${show("ta so‘z")}`;
    renderWords(words.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
    renderPager(pageCount);
  }

  filter.addEventListener("input", debounce(() => { page = 0; render(); }, 150));

  return {
    enter(requestedLetter) {
      if (groups.has(requestedLetter)) letter = requestedLetter;
      render();
    },
    refresh: render,
  };
}
