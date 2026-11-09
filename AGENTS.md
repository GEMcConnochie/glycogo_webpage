# Glycogo website

Static marketing site for Glycogo (glycogo.fit). Plain HTML with inline CSS and JS, no
framework and no build step for the pages themselves. English pages live at the repo root
(`index.html`, `instructions/index.html`, `fuel-ratio-calculator/index.html`,
`substrate-explorer/index.html`, `athlete_supplement_timer.html`,
`compare-sports-nutrition-apps/index.html`, `terms/`, `privacy/`, `delete-account/`,
`beta/`). The `de/ es/ fr/ it/ nl/` trees are generated — never edit them by hand.

## House style for copy

Write like the site's author, not like a chatbot. Every visible string, meta
description, `alt` text, aria label, code comment and translation entry is covered by
this rule:

**Avoid the patterns catalogued at https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing**

In practice, the ones that keep turning up here:

- **Negative parallelism.** "Not just X, but Y", "not only", "isn't just", "more than
  just". Say the thing once, plainly.
  *Not* "Time your fuel, not just your training." *But* "Log the session and the food
  that covers it."
- **Copula avoidance.** "Serves as", "stands as", "functions as", "represents" where
  "is" would do; "features / offers / boasts" where "has" would do.
- **Puffery and significance claims.** "A testament to", "underscores the importance",
  "plays a pivotal role", "reflects broader trends", "enduring legacy", "where the
  journey began", "shaped the landscape". Delete them; they carry no information.
- **AI vocabulary.** align with, boasts, bolster, crucial, deep dive, delve, emphasize,
  enduring, enhance, foster, garner, highlight (as a verb), interplay, intricate,
  landscape (abstract), meticulous, pivotal, robust, showcase, seamless, tapestry,
  testament, underscore, valuable, vibrant, leverage, elevate, empower, unlock, holistic,
  myriad, plethora, realm. One of these might slip through by accident; several in one
  page is the tell.
- **Superficial -ing analysis** hung on the end of a sentence: "…, ensuring accurate
  targets", "…, reflecting its role in recovery", "…, contributing to better fuelling".
  If the clause adds nothing measurable, cut it.
- **Vague authority.** "Experts agree", "studies show", "many athletes find". Name the
  paper, the position stand or the number — the site already cites DOIs everywhere — or
  drop the claim.
- **Marketing filler.** "Everything you need", "in seconds", "with ease", "with
  precision", "powered by the latest research and technology", "designed for
  optimisation", "cutting-edge", "best-in-class", "unlock your potential". Replace with
  the concrete behaviour: what the app measures, what it shows, what the athlete does.
- **Outline formulas.** "Despite its X, Y faces several challenges", "Awards and
  recognition", "Future outlook", "Challenges and opportunities".
- **Paired synonyms** ("affordable, budget-friendly", "data and detail-driven") and
  decorative bolding. Pick one word. Bold is for interface labels, not for emphasis.
- **Em dashes.** The site uses none. Use a full stop, a comma or brackets. En dashes
  belong only in numeric ranges (`60–90 g/h`).

What to keep: second person, British spelling, sentence-case headings, numerals for
amounts, and the specific physiology (SGLT1, GLUT5, RER 0.85, 1:0.8). Specificity is what
makes the copy read as written by a person who knows the subject.

Run the checker before finishing any copy change:

```bash
node tools/lint-ai-writing.cjs
```

It scans the English pages for the patterns above and exits non-zero on a hit. Review
warnings are judgement calls, not failures.

A few strings sit in the tool's `APPROVED` list because they were reviewed line by line
and kept as written. Do not add to that list without the same deliberate decision, and do
not reword an approved line on the assumption that the checker missed it.

## Copy and translations

English pages are the source of truth. Every visible string is a key in
`assets/i18n/{de,es,fr,it,nl}.js`, matched on the normalised English text (see
`assets/i18n/README.md`). After changing English copy:

```bash
node tools/i18n-extract.cjs        # refresh tools/i18n-strings.json
node tools/i18n-check.cjs          # stale/missing catalog keys, non-zero on stale
node tools/build-i18n-pages.cjs    # regenerate de/ es/ fr/ it/ nl/ and sitemap.xml
```

Rewording a string changes its catalog key. Move the translation to the new key rather
than leaving the old entry behind; otherwise the page falls back to English and
`i18n-check.cjs` reports a stale key. If the meaning changes, reword the translation to
match — do not leave a translation describing text that is no longer there.

The two route lists (`PAGES` in the build script, `ROUTES` in `assets/i18n.js`) must stay
in step. Citations, journal names, product names and numeric defaults stay in English on
translated pages.
