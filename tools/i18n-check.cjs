/**
 * Dev helper: sanity-check the translation catalogs.
 *
 *   node tools/i18n-extract.cjs && node tools/i18n-check.cjs
 *
 * Flags (a) keys that do not exist on the page they are filed under, which
 * almost always means a typo or altered copy, and (b) coverage per page so the
 * untranslated surface is visible.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const strings = JSON.parse(fs.readFileSync(path.join(__dirname, "i18n-strings.json"), "utf8"));
const union = new Set();
for (const list of Object.values(strings)) list.forEach((s) => union.add(s));

const dir = path.join(__dirname, "..", "assets", "i18n");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));

let failed = false;

for (const file of files) {
  const code = fs.readFileSync(path.join(dir, file), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  const code2 = file.replace(/\.js$/, "");
  const catalog = sandbox.window.GLYCOGO_I18N && sandbox.window.GLYCOGO_I18N[code2];
  if (!catalog) {
    console.log("!" + code2 + ": catalog did not register");
    failed = true;
    continue;
  }

  const unknown = [];
  for (const [block, entries] of Object.entries(catalog)) {
    if (block === "common") continue;
    const pageStrings = new Set(strings[block] || []);
    for (const key of Object.keys(entries)) {
      if (!pageStrings.has(key)) unknown.push(block + " :: " + key);
    }
  }

  let covered = 0;
  let total = 0;
  let charsCovered = 0;
  let charsTotal = 0;
  for (const [page, list] of Object.entries(strings)) {
    const dict = Object.assign({}, catalog.common, catalog[page]);
    for (const s of list) {
      total++;
      charsTotal += s.length;
      if (Object.prototype.hasOwnProperty.call(dict, s)) {
        covered++;
        charsCovered += s.length;
      }
    }
  }

  console.log(
    code2.padEnd(3),
    "coverage",
    ((covered / total) * 100).toFixed(1) + "%",
    "strings |",
    ((charsCovered / charsTotal) * 100).toFixed(1) + "%",
    "chars |",
    covered + "/" + total
  );

  if (unknown.length) {
    failed = true;
    console.log("  " + code2 + ": " + unknown.length + " keys not found on their page:");
    unknown.slice(0, 40).forEach((k) => console.log("    " + k));
  }
}

if (failed) process.exitCode = 1;
