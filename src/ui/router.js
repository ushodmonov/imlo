// URL hash orqali sahifalar: havolani ulashish va brauzer tarixi uchun.
//   #q=so‘z      → qidiruv
//   #matn        → matnni tekshirish
//   #konverter   → lotin ⇄ kirill
//   #lugat=a     → lug‘at, "a" harfi

const ROUTES = [
  { view: "search", prefix: "q=" },
  { view: "text", exact: "matn" },
  { view: "converter", exact: "konverter" },
  { view: "browse", prefix: "lugat=" },
];

const DEFAULT_ROUTE = { view: "search" };

/** Joriy hash → { view, param } */
export function currentRoute() {
  const hash = decodeURIComponent(location.hash.slice(1));
  for (const route of ROUTES) {
    if (route.exact === hash) return { view: route.view };
    if (route.prefix && hash.startsWith(route.prefix)) {
      return { view: route.view, param: hash.slice(route.prefix.length) };
    }
  }
  return DEFAULT_ROUTE;
}

/** Tarixga yangi yozuv qo‘shmasdan hashni yangilaydi. */
export function setHash(value) {
  history.replaceState(null, "", value ? `#${value}` : location.pathname + location.search);
}

export const onRouteChange = (listener) => window.addEventListener("hashchange", listener);
