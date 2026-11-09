/**
 * Append a page's translations to each language catalog.
 *
 * The catalogs are hand-written scripts, so this inserts one block rather than
 * rewriting the file: the existing entries keep their order, their formatting and
 * their comments, and only a `forCoaches: { … }` object is added before the
 * catalog's closing brace. Existing entries in the block are left untouched, so
 * re-running after adding a language only adds the new one.
 *
 *   node tools/i18n/add-page-block.cjs forCoaches forcoaches
 *
 * The second argument is the stem of the JSON files in tools/i18n/: a file named
 * `forcoaches.de.json` supplies the German entries.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const [blockName, stem] = process.argv.slice(2);
if (!blockName || !stem) {
  console.error("usage: node tools/i18n/add-page-block.cjs <block> <file-stem>");
  process.exit(1);
}

const dir = path.join(ROOT, "tools", "i18n");
const langs = fs
  .readdirSync(dir)
  .map((f) => f.match(new RegExp("^" + stem + "\\.([a-z]{2})\\.json$")))
  .filter(Boolean)
  .map((m) => m[1]);

if (!langs.length) {
  console.error("no " + stem + ".<lang>.json files found");
  process.exit(1);
}

for (const lang of langs) {
  const entries = JSON.parse(
    fs.readFileSync(path.join(dir, stem + "." + lang + ".json"), "utf8")
  );
  const file = path.join(ROOT, "assets", "i18n", lang + ".js");
  let source = fs.readFileSync(file, "utf8");

  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  const catalog = sandbox.window.GLYCOGO_I18N[lang];
  const existing = catalog[blockName] || {};
  const added = Object.entries(entries).filter(([k]) => !(k in existing));

  if (!(blockName in catalog)) {
    const lines = Object.entries(entries).map(
      ([k, v]) => "    " + JSON.stringify(k) + ": " + JSON.stringify(v) + ","
    );
    const block = "\n  " + blockName + ": {\n" + lines.join("\n") + "\n  },\n";
    const end = source.lastIndexOf("};");
    if (end === -1) throw new Error(lang + ": catalog has no closing brace");
    source = source.slice(0, end).replace(/\s*$/, "\n") + block + "};\n";
  } else if (added.length) {
    // Insert into the existing block, just before its closing brace.
    const start = source.indexOf("  " + blockName + ": {");
    const close = source.indexOf("\n  },", start);
    if (start === -1 || close === -1) {
      throw new Error(lang + ": could not find the " + blockName + " block");
    }
    const lines = added
      .map(([k, v]) => "    " + JSON.stringify(k) + ": " + JSON.stringify(v) + ",")
      .join("\n");
    source = source.slice(0, close) + "\n" + lines + source.slice(close);
  }

  fs.writeFileSync(file, source, "utf8");

  const check = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), check);
  const count = Object.keys(check.window.GLYCOGO_I18N[lang][blockName]).length;
  console.log(
    lang + ": " + count + " " + blockName + " entries (" + added.length + " added)"
  );
}
