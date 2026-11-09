#!/usr/bin/env node
/**
 * Flags phrasing listed at https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
 * in the English source pages.
 *
 *   node tools/lint-ai-writing.cjs
 *
 * Exit code 1 means at least one banned pattern is present, so this can gate a change.
 * Review patterns are printed as warnings and never fail the run.
 *
 * The translated pages are generated from the English copy plus the catalogs, so they
 * are not scanned: fix the English string and rebuild.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const PAGES = [
  'index.html',
  'instructions/index.html',
  'beta/index.html',
  'fuel-ratio-calculator/index.html',
  'substrate-explorer/index.html',
  'athlete_supplement_timer.html',
  'compare-sports-nutrition-apps/index.html',
  'terms/index.html',
  'privacy/index.html',
  'delete-account/index.html'
];

const BANNED = [
  [/\bnot just\b/i, 'negative parallelism ("not just X, but Y")'],
  [/\bnot only\b/i, 'negative parallelism ("not only")'],
  [/\bisn'?t just\b/i, 'negative parallelism ("isn\'t just")'],
  [/\bis not just\b/i, 'negative parallelism ("is not just")'],
  [/\bmore than just\b/i, 'negative parallelism ("more than just")'],
  [/\bserves? as\b/i, 'copula avoidance ("serves as")'],
  [/\bstands? as\b/i, 'copula avoidance ("stands as")'],
  [/\bfunctions? as\b/i, 'copula avoidance ("functions as")'],
  [/\bboasts?\b/i, 'copula avoidance ("boasts")'],
  [/\ba testament to\b|\btestament\b/i, 'puffery ("testament")'],
  [/\bunderscor(e|es|ed|ing)\b/i, 'puffery ("underscore" as a verb)'],
  [/\bshowcas(e|es|ed|ing)\b/i, 'puffery ("showcase")'],
  [/\bdelve\b|\bdeep dive\b/i, 'AI vocabulary ("delve", "deep dive")'],
  [/\btapestry\b|\bvibrant\b|\bintricate\b|\bmeticulous(ly)?\b|\binterplay\b/i, 'AI vocabulary'],
  [/\bmyriad\b|\bplethora\b|\bholistic\b|\brealm\b/i, 'AI vocabulary'],
  [/\brobust\b|\bcrucial\b|\bpivotal\b/i, 'AI vocabulary (robust, crucial, pivotal)'],
  [/\bseamless(ly)?\b|\bleverag(e|es|ed|ing)\b/i, 'AI vocabulary (seamless, leverage)'],
  [/\bfoster(s|ed|ing)?\b|\bgarner(s|ed|ing)?\b|\bbolster(s|ed|ing)?\b/i, 'AI vocabulary'],
  // "elevated" is left alone: elevated baseline and elevated breathing are physiology,
  // not the marketing sense of elevate.
  [/\bempower(s|ed|ing)?\b|\belevates?\b|\belevating\b|\bsupercharge\b/i, 'marketing verb'],
  [/\bunlock(s|ed|ing)? (your|the (power|potential|next|full))/i, 'marketing verb ("unlock your potential")'],
  [/\bcutting-edge\b|\bstate-of-the-art\b|\bgame-chang/i, 'marketing filler'],
  [/\bworld-class\b|\bbest-in-class\b|\bnext-level\b|\brevolutionary\b|\bunparalleled\b/i, 'marketing filler'],
  [/\beffortless(ly)?\b|\bwith ease\b|\bwith precision\b/i, 'marketing filler'],
  [/\bin seconds\b|\beverything you need\b/i, 'marketing filler'],
  [/\bpowered by the latest\b|\bdesigned for optimisation\b|\bdesigned to optimise\b/i, 'marketing filler'],
  [/\brather than generic\b/i, 'negative contrast ("rather than generic")'],
  [/\bwhether you'?re\b|\bwhether you are\b/i, 'second-person hedge ("whether you\'re")'],
  [/\bexpert(s)? (agree|say|argue)\b|\bstudies (show|suggest)\b|\bobservers have\b/i, 'vague authority'],
  [/\bdespite (its|these|their) [a-z]+, [^.]{0,40}\bfaces?\b/i, 'outline formula ("despite its X, faces challenges")'],
  [/\bawards and recognition\b|\bfuture outlook\b|\bchallenges and (opportunities|legacy)\b/i, 'outline formula heading']
];

// Copy the author reviewed line by line and chose to keep as written. Removing the
// approved wording before the patterns run keeps those decisions from turning into a
// permanent red check; anything new still has to pass. Add to this list only after a
// deliberate decision, not to silence a pattern.
const APPROVED = [
  'Everything you need to fuel smarter',
  'Track and plan your nutrition with ease using a data and detail-driven, customizable approach, powered by the latest research and technology.',
  'No more re-entering the same foods every day.',
  'Scan packaged food barcodes to pull accurate nutrition data straight from an extensive database in seconds.',
  'informed by your training sessions, remaining targets for the day, and what you have already logged.',
  'start fuelling with precision',
  'the foundation of your daily nutrition outside training sessions',
  'Grounded in Research, Designed for Optimisation',
  'The carbohydrate periodisation approach and intensity-based scaling are grounded in peer-reviewed research from leading sports science journals.',
  'to optimize energy levels over the day',
  'Glycogo is designed to be an affordable, budget-friendly tool. If you find it useful, a small donation goes a long way to help keep it running and support ongoing development.'
];

const REVIEW = [
  [/\blandscape\b/i, '"landscape" as an abstract noun'],
  [/(^|[.!?]\s+)(Additionally|Moreover|Furthermore|Notably),/i, 'sentence-opening connective'],
  [/\bno more\b/i, '"no more" — usually a slogan'],
  [/—/, 'em dash (house style avoids them)']
];

function stripNonCopy(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, function (m) { return m.replace(/[^\n]/g, ''); })
    .replace(/<style[\s\S]*?<\/style>/gi, function (m) { return m.replace(/[^\n]/g, ''); })
    .replace(/<!--[\s\S]*?-->/g, function (m) { return m.replace(/[^\n]/g, ''); });
}

function decode(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;|&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

let banned = 0;
let warnings = 0;

for (const page of PAGES) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) continue;
  const lines = stripNonCopy(fs.readFileSync(file, 'utf8')).split(/\r?\n/);

  lines.forEach(function (raw, idx) {
    let text = decode(raw.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (!text) return;
    for (const keep of APPROVED) text = text.split(keep).join(' ');

    for (const [re, why] of BANNED) {
      const m = text.match(re);
      if (!m) continue;
      banned++;
      console.log('FAIL ' + page + ':' + (idx + 1) + '  ' + why + '  →  "' + m[0] + '"');
    }
    for (const [re, why] of REVIEW) {
      const m = text.match(re);
      if (!m) continue;
      warnings++;
      console.log('warn ' + page + ':' + (idx + 1) + '  ' + why + '  →  "' + m[0] + '"');
    }
  });
}

console.log('\n' + (banned ? banned + ' banned pattern(s)' : 'no banned patterns') +
  ', ' + warnings + ' warning(s) across ' + PAGES.length + ' pages.');

process.exit(banned ? 1 : 0);
