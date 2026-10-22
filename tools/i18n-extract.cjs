/**
 * Dev helper: list the translatable strings on each page.
 *
 * Emits tools/i18n-strings.json — { pageKey: [string, ...] } — using the same
 * normalisation the runtime applies (whitespace collapsed, entities decoded),
 * so every string can be copied straight into a catalog as a key.
 *
 *   node tools/i18n-extract.cjs
 */
const fs = require("fs");
const path = require("path");

const PAGES = {
  home: "index.html",
  instructions: "instructions/index.html",
  beta: "beta/index.html",
  terms: "terms/index.html",
  privacy: "privacy/index.html",
  deleteAccount: "delete-account/index.html",
  fuelRatio: "fuel-ratio-calculator/index.html",
  substrate: "substrate-explorer/index.html",
  supplementTimer: "athlete_supplement_timer.html",
};

const ATTRS = ["placeholder", "alt", "title", "aria-label", "value"];

function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&times;/g, "\u00d7")
    .replace(/&deg;/g, "\u00b0")
    .replace(/&middot;/g, "\u00b7");
}

function normalise(s) {
  return decode(s).replace(/\s+/g, " ").trim();
}

const out = {};
for (const [key, file] of Object.entries(PAGES)) {
  const html = fs.readFileSync(file, "utf8");
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const strings = new Set();
  for (const m of body.matchAll(/>([^<>]+)</g)) {
    const s = normalise(m[1]);
    if (s && /[A-Za-z]/.test(s)) strings.add(s);
  }
  for (const m of body.matchAll(/<[a-z][^>]*>/gi)) {
    for (const attr of ATTRS) {
      const a = new RegExp(`\\b${attr}="([^"]*)"`, "i").exec(m[0]);
      if (!a) continue;
      const s = normalise(a[1]);
      if (s && /[A-Za-z]/.test(s)) strings.add(s);
    }
  }
  out[key] = [...strings];
}

fs.writeFileSync(
  path.join(__dirname, "i18n-strings.json"),
  JSON.stringify(out, null, 2) + "\n"
);

let total = 0;
for (const [key, list] of Object.entries(out)) {
  const chars = list.reduce((n, s) => n + s.length, 0);
  total += chars;
  console.log(String(list.length).padStart(4), "strings", String(chars).padStart(6), "chars", key);
}
console.log("total chars to translate:", total);
