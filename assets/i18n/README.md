# Website translations

The language picker in the site nav is driven by [`../i18n.js`](../i18n.js) plus one
catalog per language in this folder. A catalog is a plain script that registers
itself on `window.GLYCOGO_I18N`:

```js
window.GLYCOGO_I18N = window.GLYCOGO_I18N || {};
window.GLYCOGO_I18N.es = {
  common: { "Features": "Funciones" },
  home: { "Set up in minutes": "Configúralo en minutos" }
};
```

## How matching works

Keys are the **English text itself**, normalised (whitespace collapsed, entities
decoded). On load the engine walks text nodes and the `placeholder`, `alt`,
`title`, `aria-label`, `value` and meta `content` attributes, and swaps any
exactly matching string. Anything without a translation stays in English, so a
missing key degrades to English rather than blank text.

`common` is merged with the block for the current page. Page blocks come from
the first path segment (`/instructions` → `instructions`), with aliases in
`PAGE_ALIASES` for the two directories whose catalog name is camelCase.

Content injected later (calculator outputs, search results) is picked up by a
`MutationObserver`, so dynamic pages keep translating after a language switch.

## Adding or changing copy

1. Edit the HTML.
2. `node tools/i18n-extract.cjs` regenerates `tools/i18n-strings.json`.
3. `node tools/i18n-check.cjs` lists catalog keys that no longer exist on their
   page — those are typos or stale copy, and the exit code is non-zero.
4. Add the new English string to each `*.js` catalog under the right block.

Run both scripts from the repository root. `i18n-check.cjs` also prints coverage
per language, which is the quickest way to see what is still untranslated.

## Coverage

| Page | Catalog block | es | fr | it | de | nl |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `home` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/beta` | `beta` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/delete-account` | `deleteAccount` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/instructions` | `instructions` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/terms` | `terms` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/privacy` | `privacy` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/fuel-ratio-calculator` | `fuelRatio` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/substrate-explorer` | `substrate` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/athlete_supplement_timer` | `supplementTimer` | ✓ | ✓ | ✓ | ✓ | ✓ |

Calculator strings that several pages share live in `common`, so the same key
translates on every tool page.

Deliberately left in English on translated pages: academic citation titles and
journal names, `Glycogo` / `Intervals.icu` product names, brand and product names
in the fuel-ratio product table, numeric defaults such as `90 g/h` or `60 min`,
and the footer's GEM acronym tagline.

## Templated strings

The engine matches whole text nodes, so a sentence that interpolates a value
cannot be translated while the value sits inside the same node. Where a
calculator builds such a sentence, the source wraps the literal parts in their
own elements, which makes each fragment a translatable node:

```js
`Your mix runs <b>${pct}% <span>glucose</span></b> and ${verdict} …`
```

Text drawn on `<canvas>` (the substrate chart's empty state and axis labels) is
not reachable this way and stays in English.

## Prerendered pages

Every page also exists as static HTML under a language prefix, so search
engines get translated copy without running JavaScript:

```
/de/  /de/fuel-ratio-calculator/  /de/privacy/  …  (same for es, fr, it, nl)
```

```bash
node tools/build-i18n-pages.cjs   # after changing a catalog or English copy
```

The build translates each English page with the same catalogue the runtime
uses, rewrites its `<html lang>`, title, meta description, canonical and
internal links, inserts reciprocal `hreflang` alternates (including
`x-default`), and regenerates `sitemap.xml` with every language URL.

Run it whenever you edit a catalog or English page copy; the output is
committed. The two route lists — `PAGES` in the build script and `ROUTES` in
`assets/i18n.js` — must stay in step, because the picker navigates between
those routes.

## Which language a visitor sees

A page under `/de/` is German, whatever the browser or a stored choice says:
the URL wins. Otherwise, resolved at boot, highest priority first:

1. `?lang=es|fr|it|de|nl` — remembered afterwards.
2. A choice stored in `localStorage` under `glycogo:lang` — that is, anything the
   visitor picked in the nav.
3. The browser's preferred language (`navigator.languages`, then
   `navigator.language`), matched on the primary subtag so `de-AT`, `es-419` and
   `nl-BE` all resolve. The first supported entry wins; unsupported ones are
   skipped, so `pt-BR, fr-CA` gives French.
4. English.

Detection is never written to `localStorage`, so a visitor who later changes
their browser language sees the site follow it. Only a deliberate choice is
remembered — including choosing English, which pins the site to English. An
unrecognised stored value (for example a language we no longer ship) is dropped
so detection applies again.

Because the language is in the URL, the nav picker navigates (to `/de/…`,
`/es/…` or `/` for English) and stores the choice first, so the landing page's
first-visit redirect cannot override it. A first visit to `/` with a stored
non-English choice is redirected to that language's prefix.

## Notes

- `<html lang>` is set to the resolved language before the catalog arrives, and
  updated on every switch; prerendered pages are written with it already set.
- Catalogs are fetched only for the selected language, cached by the browser.
