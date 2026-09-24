# Misja: Drogeria 🧴🇯🇵

Przeglądarkowa gra dla Asi. Wchodzisz do japońskiej drogerii z listą screenów z Instagrama.
Na półce stoi kilka prawie identycznych wersji każdego produktu, a różnią się tylko japońskim napisem.

## Jak się gra

- **📋 Lista**: screeny z prawdziwej listy zakupów, podpisane tak, jak zostały zapisane („Krem”, „Upał”…).
- **🔍 Produkt**: kliknij opakowanie, żeby zobaczyć etykietę i porównać ją obok ze screenem.
- **📷 Skan**: tłumacz pokazuje przekład (trochę „maszynowy”), ale zjada baterię.
- **📓 Notes**: każdy skan dopisuje słówka. Znane słowa są potem podkreślone na wszystkich etykietach
  i po kliknięciu pokazują znaczenie za darmo. Notes przechodzi między poziomami.
- **🙋‍♀️ Ekspedientka**: pokazujesz jej screena, a ona wskazuje półkę (ale nie konkretny produkt).
- **🧺 Kasa**: dopiero przy płaceniu wychodzi, co było dobrze. Każda pomyłka ma wyjaśnienie
  (np. 詰め替え/つめかえ用 to wkład, a nie produkt z butelką).
- Ograniczenia: budżet w jenach, bateria i zegar do zamknięcia sklepu. Tax-free powyżej ¥5 000.

Poziomy (odblokowują się po kolei):

| Stacja | Sklep | Temat |
|---|---|---|
| 池袋 Ikebukuro | Matsukiyo | Sana, Quality 1st, Deoco, Curél |
| 渋谷 Shibuya | Don Quijote | maseczki, kolagen Meiji, Gatsby, Pelican |
| 京都 Kioto | sklep z herbatą | matcha – rozpoznawanie po kanji |
| 大阪 Osaka | drogeria w Shinsaibashi | apteczka: leki, komary, upał |
| 長野 Nagano | drogeria przy dworcu | włosy: szampon vs odżywka vs olejek |
| 新宿 Shinjuku | wielka drogeria (finał) | Astalift, Elixir, Prior, serum VC, puder, kolagen |

## Uruchomienie

```bash
npm install
npm run dev
```

`?all=1` w adresie odblokowuje wszystkie poziomy (do testowania).

## GitHub Pages

1. Wrzuć repo na GitHuba (gałąź `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` sam zbuduje i opublikuje `dist/`.

Build tworzy jeden samodzielny plik `dist/index.html` (JS, CSS i zdjęcia w środku). Działa pod dowolną ścieżką na Pages, otwarty z dysku albo wysłany mailem.

## Personalizacja

- `src/config.ts`: imię gracza, tekst na zakończenie, koszt skanu.
- `src/data/levels.ts`, `src/data/levels2.ts`: poziomy, produkty, pułapki i wyjaśnienia.
- `src/data/vocab.ts`: słownik (klucz = tekst w `[nawiasach]` na etykietach).
- `src/img/`: screeny z listy (zmniejszone do ~520 px). Przy buildzie są wbudowywane w `index.html`.

Nowy poziom to nowy obiekt `Level` w `levels.ts` dodany do `LEVELS`.
