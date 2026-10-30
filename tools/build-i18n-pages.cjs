/**
 * Prerender the translated site so search engines get real HTML per language.
 *
 *   node tools/build-i18n-pages.cjs           # English pages + /de /es /fr /it /nl
 *
 * What it writes:
 *   - an hreflang + canonical block into each English page (between the
 *     markers below, so re-runs replace rather than duplicate it)
 *   - <lang>/<route>/index.html for every language, translated from the
 *     catalogs in assets/i18n/ with the same normalisation the runtime uses
 *   - sitemap.xml listing all six language variants with xhtml:link alternates,
 *     plus any English-only URLS that have no translated copies
 *
 * The runtime engine (assets/i18n.js) still loads on the generated pages, so
 * strings the calculators build in JavaScript are translated after paint.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://glycogo.fit";
const LANGS = ["en", "de", "es", "fr", "it", "nl"];

const PAGES = [
  { route: "/", file: "index.html", block: "home", priority: "1.0", changefreq: "monthly" },
  { route: "/fuel-ratio-calculator/", file: "fuel-ratio-calculator/index.html", block: "fuelRatio", priority: "0.8", changefreq: "monthly" },
  { route: "/substrate-explorer/", file: "substrate-explorer/index.html", block: "substrate", priority: "0.8", changefreq: "monthly" },
  { route: "/athlete_supplement_timer.html", file: "athlete_supplement_timer.html", block: "supplementTimer", priority: "0.8", changefreq: "monthly" },
  { route: "/instructions/", file: "instructions/index.html", block: "instructions", priority: "0.6", changefreq: "yearly" },
  { route: "/beta/", file: "beta/index.html", block: "beta", priority: "0.6", changefreq: "monthly" },
  { route: "/privacy/", file: "privacy/index.html", block: "privacy", priority: "0.3", changefreq: "yearly" },
  { route: "/terms/", file: "terms/index.html", block: "terms", priority: "0.3", changefreq: "yearly" },
  { route: "/delete-account/", file: "delete-account/index.html", block: "deleteAccount", priority: "0.3", changefreq: "yearly" },
];

/* English-only pages: indexed and listed in the sitemap, but not translated
   and not part of the language picker, so they get no hreflang alternates. */
const EXTRA_URLS = [
  { route: "/compare-sports-nutrition-apps/", priority: "0.7", changefreq: "monthly" },
];

const ROUTES = new Set(PAGES.map((p) => p.route));
const ATTRS = ["placeholder", "alt", "title", "aria-label"];
const SKIP_TAGS = new Set(["script", "style", "textarea", "pre", "code", "template", "svg"]);
const BLOCK_START = "<!-- i18n:alternates -->";
const BLOCK_END = "<!-- /i18n:alternates -->";

/* -------------------------------------------------------------- helpers */

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

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const normalise = (s) => decode(s).replace(/\s+/g, " ").trim();

function loadCatalog(lang) {
  const file = path.join(ROOT, "assets", "i18n", lang + ".js");
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox);
  const catalog = sandbox.window.GLYCOGO_I18N && sandbox.window.GLYCOGO_I18N[lang];
  if (!catalog) throw new Error("catalog did not register: " + file);
  return catalog;
}

function dictionary(catalog, block) {
  return Object.assign({}, catalog.common, catalog[block]);
}

function urlFor(lang, route) {
  return lang === "en" ? SITE + route : SITE + "/" + lang + route;
}

/* ------------------------------------------------------------- translate */

function translateText(raw, ctx) {
  if (!/\S/.test(raw)) return raw;
  const key = normalise(raw);
  if (!key) return raw;
  const value = ctx.dict[key];
  if (value == null) return raw;
  ctx.hits++;
  const lead = /^\s*/.exec(raw)[0];
  const tail = /\s*$/.exec(raw)[0];
  return lead + escapeHtml(value) + tail;
}

function tagEnd(html, start) {
  let quote = null;
  for (let i = start + 1; i < html.length; i++) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      return i;
    }
  }
  return -1;
}

function rewriteHref(href, lang) {
  if (lang === "en") return href;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  const bare = hashAt === -1 ? href : href.slice(0, hashAt);
  if (!ROUTES.has(bare)) return href;
  return "/" + lang + bare + hash;
}

function rewriteTag(tag, ctx) {
  const name = (/^<\s*([a-zA-Z0-9:-]+)/.exec(tag) || [])[1];
  if (!name) return tag;
  const lower = name.toLowerCase();
  let out = tag;

  if (lower === "html") {
    out = out.replace(/\slang="[^"]*"/i, ' lang="' + ctx.lang + '"');
    if (!/\slang="/i.test(out)) out = out.replace("<html", '<html lang="' + ctx.lang + '"');
    return out;
  }

  if (lower === "a") {
    out = out.replace(/(\shref=")([^"]*)(")/i, (m, pre, href, post) => pre + rewriteHref(href, ctx.lang) + post);
  }

  // Pages live one directory deeper under /<lang>/, so a relative asset URL
  // would resolve to /<lang>/assets/... and 404. Anchor them at the root.
  if (ctx.lang !== "en") {
    out = out.replace(/(\s(?:src|poster|data-src)=")([^"]*)(")/gi, (m, pre, value, post) => {
      if (/^(\/|#|data:|https?:|\/\/|mailto:|tel:|javascript:)/i.test(value)) return m;
      return pre + "/" + value + post;
    });
    if (lower === "link" || lower === "script") {
      out = out.replace(/(\shref=")([^"]*)(")/i, (m, pre, value, post) => {
        if (/^(\/|#|data:|https?:|\/\/)/i.test(value)) return m;
        return pre + "/" + value + post;
      });
    }
  }

  if (lower === "meta") {
    const kind = (/\s(?:name|property)="([^"]*)"/i.exec(out) || [])[1];
    if (kind && /^(description|og:title|og:description)$/i.test(kind)) {
      out = out.replace(/(\scontent=")([^"]*)(")/i, (m, pre, value, post) => {
        const written = translateText(decode(value), ctx);
        return pre + written.replace(/"/g, "&quot;") + post;
      });
    }
    return out;
  }

  const attrPattern = new RegExp('(\\s(?:' + ATTRS.join("|") + ')=")([^"]*)(")', "gi");
  out = out.replace(attrPattern, (m, pre, value, post) => {
    if (!/\S/.test(decode(value))) return m;
    const written = translateText(decode(value), ctx);
    return pre + written.replace(/"/g, "&quot;") + post;
  });

  return out;
}

function transform(html, ctx) {
  let out = "";
  let i = 0;
  const lowerHtml = html.toLowerCase();

  while (i < html.length) {
    if (html[i] === "<") {
      if (html.startsWith("<!--", i)) {
        const end = html.indexOf("-->", i);
        const stop = end === -1 ? html.length : end + 3;
        out += html.slice(i, stop);
        i = stop;
        continue;
      }
      if (html.startsWith("<!", i) || html.startsWith("<?", i)) {
        const end = html.indexOf(">", i);
        const stop = end === -1 ? html.length : end + 1;
        out += html.slice(i, stop);
        i = stop;
        continue;
      }
      const end = tagEnd(html, i);
      if (end === -1) {
        out += html.slice(i);
        break;
      }
      const tag = html.slice(i, end + 1);
      out += rewriteTag(tag, ctx);
      i = end + 1;

      const m = /^<\s*([a-zA-Z0-9:-]+)/.exec(tag);
      const name = m ? m[1].toLowerCase() : "";
      if (name && SKIP_TAGS.has(name) && !/\/>$/.test(tag)) {
        const closeAt = lowerHtml.indexOf("</" + name, i);
        if (closeAt === -1) {
          out += html.slice(i);
          break;
        }
        const closeEnd = html.indexOf(">", closeAt);
        const stop = closeEnd === -1 ? html.length : closeEnd + 1;
        out += html.slice(i, stop);
        i = stop;
      }
      continue;
    }

    const next = html.indexOf("<", i);
    const stop = next === -1 ? html.length : next;
    out += translateText(html.slice(i, stop), ctx);
    i = stop;
  }

  return out;
}

/* ---------------------------------------------------------------- markers */

function alternatesBlock(route, eol) {
  const lines = [BLOCK_START];
  for (const lang of LANGS) {
    lines.push(`<link rel="alternate" hreflang="${lang}" href="${urlFor(lang, route)}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${urlFor("en", route)}">`);
  lines.push(BLOCK_END);
  return lines.join(eol);
}

function setHeadUrls(html, route, lang) {
  const canonical = urlFor(lang, route);
  let out = html.replace(
    /<link rel="canonical" href="[^"]*">/i,
    '<link rel="canonical" href="' + canonical + '">'
  );
  out = out.replace(
    /(<meta property="og:url" content=")[^"]*(")/i,
    "$1" + canonical + "$2"
  );
  return out;
}

function insertBlock(html, block) {
  if (html.includes(BLOCK_START)) {
    return html.replace(new RegExp(BLOCK_START + "[\\s\\S]*?" + BLOCK_END), block);
  }
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  const canonical = /<link rel="canonical" href="[^"]*">\r?\n?/i;
  if (canonical.test(html)) {
    return html.replace(canonical, (m) => m.replace(/\r?\n?$/, "") + eol + block + eol);
  }
  return html.replace(/<head[^>]*>\r?\n?/i, (m) => m + block + eol);
}

/* ------------------------------------------------------------------ build */

const catalogs = {};
for (const lang of LANGS) {
  if (lang === "en") continue;
  catalogs[lang] = loadCatalog(lang);
}

let written = 0;
const stats = [];

for (const page of PAGES) {
  const sourcePath = path.join(ROOT, page.file);
  const source = fs.readFileSync(sourcePath, "utf8");
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  const block = alternatesBlock(page.route, eol);

  // 1. English page gains the reciprocals and self-canonical.
  let english = insertBlock(source, block);
  english = setHeadUrls(english, page.route, "en");
  if (english !== source) fs.writeFileSync(sourcePath, english, "utf8");

  // 2. One translated copy per language.
  for (const lang of LANGS) {
    if (lang === "en") continue;
    const dict = dictionary(catalogs[lang], page.block);
    const ctx = { lang, dict, hits: 0 };
    let out = transform(english, ctx);
    out = setHeadUrls(out, page.route, lang);

    // ".html" routes are written as files; directory routes get index.html so
    // the trailing-slash URL the canonical points at resolves directly.
    const rel = page.route.replace(/^\//, "");
    const outPath = /\.html$/.test(rel)
      ? path.join(ROOT, lang, rel)
      : path.join(ROOT, lang, rel, "index.html");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, out, "utf8");
    written++;
    stats.push({ lang, route: page.route, strings: ctx.hits });
  }
}

/* ----------------------------------------------------------------- sitemap */

const sitemapLines = ['<?xml version="1.0" encoding="UTF-8"?>'];
sitemapLines.push(
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
);
for (const page of PAGES) {
  for (const lang of LANGS) {
    sitemapLines.push("  <url>");
    sitemapLines.push("    <loc>" + urlFor(lang, page.route) + "</loc>");
    sitemapLines.push("    <changefreq>" + page.changefreq + "</changefreq>");
    sitemapLines.push("    <priority>" + page.priority + "</priority>");
    for (const alt of LANGS) {
      sitemapLines.push(
        '    <xhtml:link rel="alternate" hreflang="' + alt + '" href="' + urlFor(alt, page.route) + '"/>'
      );
    }
    sitemapLines.push(
      '    <xhtml:link rel="alternate" hreflang="x-default" href="' + urlFor("en", page.route) + '"/>'
    );
    sitemapLines.push("  </url>");
  }
}
for (const page of EXTRA_URLS) {
  sitemapLines.push("  <url>");
  sitemapLines.push("    <loc>" + SITE + page.route + "</loc>");
  sitemapLines.push("    <changefreq>" + page.changefreq + "</changefreq>");
  sitemapLines.push("    <priority>" + page.priority + "</priority>");
  sitemapLines.push("  </url>");
}
sitemapLines.push("</urlset>");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemapLines.join("\n") + "\n", "utf8");

console.log("wrote " + written + " translated pages + sitemap.xml");
for (const s of stats) console.log("  " + s.lang + " " + s.route.padEnd(32) + " " + s.strings + " strings replaced");
