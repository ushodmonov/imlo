# Imlo — o‘zbek tili imlo lug‘ati

~87 000 so‘zli lug‘at asosida so‘zning to‘g‘ri yozilishini tekshiradigan statik sayt.
Server yoki build kerak emas.

## Imkoniyatlar

- **Qidiruv** — avtoto‘ldirish, xato yozilgan so‘zga o‘xshash variantlar
  (`kitop` → `kitob`, `ogil` → `o‘g‘il`), shu so‘zdan yasalgan so‘zlar.
- **Ma’no, sinonim va antonimlar** — topilgan so‘zning har bir ma’nosi: ta’rifi, turkumi, uslubi,
  misol, sinonim va antonimlari (`abadiy` → `mangu`, `umrboqiy`…; antonimi `vaqtincha`).
  Ma’lumotlarning bir qismi [UzWordNet-GoldCore](https://doi.org/10.17632/v7m7v3jdn5.1) dan olingan (CC BY 4.0).
- **Matnni tekshirish** — lug‘atda yo‘q so‘zlarni belgilaydi, bosilganda tuzatish taklif qiladi.
  Qo‘shimchali shakllar ham tanib olinadi (`kitoblarimizdan`, `o‘qiyapti`).
  Sinonimi bor so‘zlar ham belgilanadi: bosilsa, o‘sha qo‘shimchalar bilan ma’nodoshiga
  almashtiriladi (`yurakka` → `qalbga`, `abadiylikka` → `mangulikka`).
- **Konverter** — lotin ⇄ kirill matn o‘girish.
- **Lug‘at** — alifbo bo‘yicha barcha so‘zlar.
- Interfeys lotin va kirill yozuvida, kunduzgi/tungi mavzu (tanlov eslab qolinadi), `#q=so‘z` havolalari bilan ulashish.

## Tuzilishi

```
index.html
assets/css/style.css
data/imlo_uz_words.txt      lug‘at: har qatorda bitta so‘z
data/sinonimlar.json        sinonim, antonim va ma’nolar
src/
  main.js                   ishga tushirish
  core/                     sof mantiq (DOM’siz)
    apostrophe.js           o‘, g‘, ʼ belgilari
    transliteration.js      lotin ⇄ kirill
    normalize.js            qidiruv kalitlari
    distance.js             Damerau–Levenshtein masofasi
    morphology.js           qo‘shimchalarni ajratish va boshqa asosga ulash
    dictionary.js           lug‘at va qidiruv
    synonyms.js             sinonim, antonim va ma’nolar
  ui/                       interfeys yordamchilari
    dom.js, router.js, script-mode.js, theme.js
  views/                    sahifalar
    search.js, text-check.js, converter.js, browse.js
tests/                      node:test testlari
.github/workflows/          CI/CD
```

## Lokal ishga tushirish

ES-modullar va `fetch` `file://` da ishlamaydi, shuning uchun oddiy server kerak:

```sh
npm start        # python3 -m http.server 8000 → http://localhost:8000
npm test         # core/ mantiq testlari (Node 22+)
npm run build    # joylash uchun fayllar → dist/
```

## CI/CD

`.github/workflows/deploy.yml`:

- har bir push va pull request’da sintaksis tekshiruvi va testlar ishlaydi;
- `main` ga push bo‘lganda testlar o‘tsa, sayt `npm run build` bilan yig‘ilib, GitHub Pages’ga avtomatik joylanadi.

Bir martalik sozlash: **Settings → Pages → Source: GitHub Actions**.
Sayt manzili: https://ushodmonov.github.io/imlo/

Lug‘atni yangilash uchun `data/imlo_uz_words.txt` ni almashtirib, push qiling.
