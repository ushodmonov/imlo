# Imlo — o‘zbek tili imlo lug‘ati

[imlo.uz](https://imlo.uz/) ga o‘xshash statik sayt: ~87 000 so‘zli lug‘at asosida
so‘zning to‘g‘ri yozilishini tekshiradi. Server yoki build kerak emas.

## Imkoniyatlar

- **Qidiruv** — avtoto‘ldirish, xato yozilgan so‘zga o‘xshash variantlar
  (`kitop` → `kitob`, `ogil` → `o‘g‘il`), shu so‘zdan yasalgan so‘zlar.
- **Matnni tekshirish** — lug‘atda yo‘q so‘zlarni belgilaydi, bosilganda tuzatish taklif qiladi.
  Qo‘shimchali shakllar ham tanib olinadi (`kitoblarimizdan`, `o‘qiyapti`).
- **Konverter** — lotin ⇄ kirill matn o‘girish.
- **Lug‘at** — alifbo bo‘yicha barcha so‘zlar.
- Interfeys lotin va kirill yozuvida, kunduzgi/tungi mavzu (tanlov eslab qolinadi), `#q=so‘z` havolalari bilan ulashish.

## Tuzilishi

```
index.html
assets/css/style.css
data/imlo_uz_words.txt      lug‘at: har qatorda bitta so‘z
src/
  main.js                   ishga tushirish
  core/                     sof mantiq (DOM’siz)
    apostrophe.js           o‘, g‘, ʼ belgilari
    transliteration.js      lotin ⇄ kirill
    normalize.js            qidiruv kalitlari
    distance.js             Damerau–Levenshtein masofasi
    morphology.js           qo‘shimchalarni ajratish
    dictionary.js           lug‘at va qidiruv
  ui/                       interfeys yordamchilari
    dom.js, router.js, script-mode.js, theme.js
  views/                    sahifalar
    search.js, text-check.js, converter.js, browse.js
```

## Lokal ishga tushirish

ES-modullar va `fetch` `file://` da ishlamaydi, shuning uchun oddiy server kerak:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## GitHub Pages’ga joylash

1. Repozitoriyga push qiling.
2. **Settings → Pages → Build and deployment**: *Deploy from a branch*, `main` / `/ (root)`.
3. Sayt `https://<username>.github.io/<repo>/` manzilida ochiladi.

Barcha yo‘llar nisbiy, shuning uchun subpapkada ham ishlaydi.
Lug‘atni yangilash uchun `data/imlo_uz_words.txt` ni almashtiring.
