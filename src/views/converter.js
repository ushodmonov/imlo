import { $, copyToClipboard } from "../ui/dom.js";
import { show } from "../ui/script-mode.js";
import { toCyrillic, toLatin } from "../core/transliteration.js";

const DIRECTIONS = {
  "lat-cyr": { from: "Lotin", to: "Кирилл", convert: toCyrillic },
  "cyr-lat": { from: "Кирилл", to: "Lotin", convert: toLatin },
};

export function createConverterView({ setHash }) {
  const source = $("#convert-source");
  const target = $("#convert-target");
  const fromLabel = $("#convert-from");
  const toLabel = $("#convert-to");

  let direction = "lat-cyr";

  function convert() {
    target.value = DIRECTIONS[direction].convert(source.value);
  }

  function render() {
    fromLabel.textContent = DIRECTIONS[direction].from;
    toLabel.textContent = DIRECTIONS[direction].to;
    convert();
  }

  function swap() {
    direction = direction === "lat-cyr" ? "cyr-lat" : "lat-cyr";
    source.value = target.value;
    render();
    source.focus();
  }

  function copyResult() {
    if (target.value) copyToClipboard(target.value, show("Nusxalandi"));
  }

  source.addEventListener("input", convert);
  $("#convert-swap").addEventListener("click", swap);
  $("#convert-copy").addEventListener("click", copyResult);
  $("#convert-clear").addEventListener("click", () => {
    source.value = "";
    convert();
    source.focus();
  });

  render();

  return {
    enter() {
      setHash("konverter");
      source.focus();
    },
    refresh() {},
  };
}
