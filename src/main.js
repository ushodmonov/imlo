import { Dictionary } from "./core/dictionary.js";
import { $, $$, el } from "./ui/dom.js";
import { currentRoute, setHash, onRouteChange } from "./ui/router.js";
import { translatePage, setScript, onScriptChange } from "./ui/script-mode.js";
import { setupThemeToggle } from "./ui/theme.js";
import { createSearchView } from "./views/search.js";
import { createTextCheckView } from "./views/text-check.js";
import { createConverterView } from "./views/converter.js";
import { createBrowseView } from "./views/browse.js";

const DICTIONARY_URL = "data/imlo_uz_words.txt";

async function fetchDictionary() {
  const response = await fetch(DICTIONARY_URL);
  if (!response.ok) throw new Error(`Lug‘at yuklanmadi: HTTP ${response.status}`);
  return new Dictionary(await response.text());
}

function showLoadError() {
  $("#result").replaceChildren(el("div", { className: "card card--bad" },
    el("span", { className: "status status--bad" }, "Xatolik"),
    el("p", {}, "Lug‘atni yuklab bo‘lmadi. Saytni veb-server orqali oching (README ga qarang)."),
  ));
}

function setupScriptToggle() {
  translatePage();
  $$("[data-script]").forEach((button) =>
    button.addEventListener("click", () => setScript(button.dataset.script)));
}

function setupViews(dictionary) {
  const views = {};
  let activeView = null;

  function showView(name, param) {
    activeView = name;
    $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === `view-${name}`));
    $$(".nav__link").forEach((link) => link.classList.toggle("is-active", link.dataset.nav === name));
    views[name].enter(param);
  }

  views.search = createSearchView({ dictionary, setHash });
  views.text = createTextCheckView({ dictionary, setHash });
  views.converter = createConverterView({ setHash });
  views.browse = createBrowseView({
    dictionary,
    setHash,
    onWordSelected: (index) => {
      showView("search");
      views.search.open(index);
    },
  });

  $$("[data-nav]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    showView(link.dataset.nav);
  }));

  const route = () => {
    const { view, param } = currentRoute();
    showView(view, param);
  };

  onScriptChange(() => views[activeView].refresh());
  onRouteChange(route);
  route();
}

async function start() {
  setupThemeToggle($("#theme-toggle"));
  setupScriptToggle();
  try {
    setupViews(await fetchDictionary());
  } catch (error) {
    console.error(error);
    showLoadError();
  }
}

start();
