import { Dictionary } from "./core/dictionary.js";
import { Synonyms } from "./core/synonyms.js";
import { $, $$, el } from "./ui/dom.js";
import { currentRoute, setHash, onRouteChange } from "./ui/router.js";
import { translatePage, setScript, onScriptChange } from "./ui/script-mode.js";
import { setupThemeToggle } from "./ui/theme.js";
import { createSearchView } from "./views/search.js";
import { createTextCheckView } from "./views/text-check.js";
import { createConverterView } from "./views/converter.js";
import { createBrowseView } from "./views/browse.js";

const DICTIONARY_URL = "data/imlo_uz_words.txt";
const SYNONYMS_URL = "data/sinonimlar.json";

async function fetchDictionary() {
  const response = await fetch(DICTIONARY_URL);
  if (!response.ok) throw new Error(`Lug‘at yuklanmadi: HTTP ${response.status}`);
  return new Dictionary(await response.text());
}

/** Sinonimlar qo‘shimcha: yuklanmasa, sayt ularsiz ishlayveradi. */
async function fetchSynonymsData() {
  try {
    const response = await fetch(SYNONYMS_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("Sinonimlar yuklanmadi:", error);
    return null;
  }
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

function setupViews(dictionary, synonyms) {
  const views = {};
  let activeView = null;

  function showView(name, param) {
    activeView = name;
    $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === `view-${name}`));
    $$(".nav__link").forEach((link) => link.classList.toggle("is-active", link.dataset.nav === name));
    views[name].enter(param);
  }

  views.search = createSearchView({ dictionary, synonyms, setHash });
  views.text = createTextCheckView({ dictionary, synonyms, setHash });
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

  return {
    /** Sinonimlar kelgach, ko‘rsatilgan natijalarni qayta chizish. */
    onSynonymsLoaded() {
      views.search.redraw();
      views.text.refresh();
    },
  };
}

async function start() {
  setupThemeToggle($("#theme-toggle"));
  setupScriptToggle();
  // Sinonimlar fayli katta: sayt lug‘at bilan darhol ochiladi, sinonimlar keyinroq qo‘shiladi
  const synonymsData = fetchSynonymsData();
  try {
    const synonyms = new Synonyms();
    const app = setupViews(await fetchDictionary(), synonyms);
    const data = await synonymsData;
    if (data) {
      synonyms.add(data);
      app.onSynonymsLoaded();
    }
  } catch (error) {
    console.error(error);
    showLoadError();
  }
}

start();
