/* Glycogo site search engine — Reciprocal Rank Fusion (RRF).
 *
 * Mirrors the approach ChatGPT uses to combine multiple search results:
 * several independent "retrievers" each produce a ranked list, and RRF
 * fuses them:  score(doc) = sum over lists of  w / (k + rank_in_list)
 * with k = 60 (the standard constant). Rank-based fusion is scale-free,
 * so a retriever that only emits scores (BM25, term counts) still
 * contributes through the *order* it produces, never through raw scores.
 *
 * Retrievers:
 *   1. phrase  — exact contiguous phrase match in page text
 *   2. terms   — BM25 (k1=1.2, b=0.75) over title + keywords + text
 *   3. title   — query tokens found in the page title / keywords
 *   4. alias   — configured keywords & synonyms (e.g. "maurten" -> calculator)
 *   5. prefix  — prefix / edit-distance-1 token matching (typos, plurals)
 *
 * Exposes window.GlycogoSearch.search(query) and .explain(query).
 */
(function () {
  'use strict';

  const INDEX = (window.GLYCOGO_INDEX || []).slice();
  const K = 60;
  const WEIGHTS = { phrase: 1.0, terms: 0.85, title: 1.0, alias: 1.0, prefix: 0.5 };
  const MAX_RESULTS = 8;

  /* ---------- text utilities ---------- */
  function normalize(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
  const STOPWORDS = new Set(('a an and are as at be by for from has have how in is it its of on or that the this to was what when where which who will with you your do does did not but if so than too very can just about into them then').split(' '));
  function tokens(s) {
    const t = normalize(s);
    if (!t) return [];
    return t.split(/\s+/).filter(function (w) { return !STOPWORDS.has(w); });
  }
  function countOccurrences(haystack, needle) {
    if (!needle) return 0;
    let n = 0, i = 0;
    while ((i = haystack.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
  }
  function firstIndex(haystack, needle) {
    return needle ? haystack.indexOf(needle) : -1;
  }

  /* ---------- precomputed corpus ---------- */
  const docs = INDEX.map(function (d) {
    const kw = (d.keywords || []).join(' ');
    const secText = (d.sections || []).map(function (s) { return s.label + ' ' + s.text; }).join(' ');
    const all = [d.title, kw, d.text, secText].join(' ');
    return {
      doc: d,
      titleT: normalize(d.title),
      kwT: normalize(kw),
      textT: normalize(d.text),
      allT: normalize(all),
      sectionTexts: (d.sections || []).map(function (s) {
        return { label: s.label, url: s.url, t: normalize(s.label + ' ' + s.text), raw: s.label + ' — ' + s.text };
      })
    };
  });

  /* BM25 corpus stats (lazy) */
  let bm25Cache = null;
  function bm25Stats() {
    if (bm25Cache) return bm25Cache;
    const N = docs.length;
    const df = {};               // document frequency per token
    let avgdl = 0;
    const lengths = docs.map(function (d) {
      const toks = tokens(d.allT);
      const seen = new Set();
      toks.forEach(function (t) { seen.add(t); });
      seen.forEach(function (t) { df[t] = (df[t] || 0) + 1; });
      avgdl += toks.length;
      return toks.length;
    });
    avgdl = avgdl / N;
    bm25Cache = { N: N, df: df, avgdl: avgdl, lengths: lengths };
    return bm25Cache;
  }

  /* ---------- retrievers: each returns [{ id, rank }...] sorted ---------- */

  /* 1. exact phrase match */
  function retrievePhrase(qT) {
    const q = qT;
    if (q.length < 2) return [];
    const scored = [];
    docs.forEach(function (d, i) {
      const n = countOccurrences(d.allT, q);
      if (n > 0) {
        scored.push({ id: i, score: n, pos: firstIndex(d.allT, q) });
      }
    });
    scored.sort(function (a, b) { return b.score - a.score || a.pos - b.pos; });
    return scored.map(function (s) { return s.id; });
  }

  /* 2. BM25 over title + keywords + text */
  function retrieveTerms(qTokens) {
    const S = bm25Stats();
    const k1 = 1.2, b = 0.75;
    const scored = docs.map(function (d, i) {
      let score = 0;
      const qtf = {};
      qTokens.forEach(function (t) { qtf[t] = (qtf[t] || 0) + 1; });
      Object.keys(qtf).forEach(function (t) {
        const df = S.df[t] || 0;
        if (!df) return;
        const idf = Math.log(1 + (S.N - df + 0.5) / (df + 0.5));
        const tf = countOccurrences(d.allT, t);
        if (!tf) return;
        const len = S.lengths[i];
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (len / S.avgdl))));
      });
      return { id: i, score: score };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.filter(function (s) { return s.score > 0; }).map(function (s) { return s.id; });
  }

  /* 3. title / keyword tokens */
  function retrieveTitle(qTokens) {
    const qset = new Set(qTokens);
    const scored = docs.map(function (d, i) {
      let titleHits = 0, kwHits = 0;
      qset.forEach(function (t) {
        if (d.titleT.split(' ').indexOf(t) !== -1) titleHits++;
        if (d.kwT.split(' ').indexOf(t) !== -1) kwHits++;
      });
      return { id: i, score: titleHits * 2 + kwHits };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.filter(function (s) { return s.score > 0; }).map(function (s) { return s.id; });
  }

  /* 4. configured keywords / aliases / synonyms */
  function retrieveAlias(qTokens, qT) {
    const scored = [];
    docs.forEach(function (d, i) {
      const aliases = (d.doc.aliases || []).concat(d.doc.keywords || []);
      let hits = 0;
      aliases.forEach(function (a) {
        const aT = normalize(a);
        if (aT && (aT === qT || qT.indexOf(aT) !== -1 || aT.indexOf(qT) !== -1)) { hits += 1; return; }
        const aToks = tokens(a);
        if (aToks.length > 1 && qT.indexOf(aToks[0]) !== -1 && qT.indexOf(aToks[aToks.length - 1]) !== -1) { hits += 0.5; return; }
        aToks.forEach(function (t) {
          if (qTokens.indexOf(t) !== -1) hits += 0.25;
        });
      });
      if (hits > 0) scored.push({ id: i, score: hits });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (s) { return s.id; });
  }

  /* 5. prefix + edit-distance-1 (typo / plural recovery) */
  function editDistance1(a, b) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 1) return 99;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (i === a.length || i === b.length) return 1;
    // skip one char in either string
    if (a.slice(i + 1) === b.slice(i)) return 1;
    if (a.slice(i) === b.slice(i + 1)) return 1;
    return 99;
  }
  function retrievePrefix(qTokens) {
    const scored = [];
    docs.forEach(function (d, i) {
      const docToks = new Set(tokens(d.allT));
      let hits = 0;
      qTokens.forEach(function (qt) {
        if (qt.length < 3) return;
        let best = 99;
        docToks.forEach(function (dt) {
          if (dt.startsWith(qt) || qt.startsWith(dt)) { best = Math.min(best, 1); return; }
          if (dt.length >= 4 && qt.length >= 4) {
            const d = editDistance1(dt.slice(0, 4), qt.slice(0, 4));
            if (d < best) best = d;
          }
        });
        if (best <= 1) hits++;
      });
      if (hits > 0) scored.push({ id: i, score: hits });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (s) { return s.id; });
  }

  /* ---------- RRF fusion ---------- */
  function rrf(rankedLists, weights) {
    const scores = {};      // id -> { score, signals: [retriever...], ranks: {retriever: rank} }
    rankedLists.forEach(function (list, li) {
      const name = list.name;
      const w = (weights && weights[name] != null) ? weights[name] : 1;
      list.items.forEach(function (id, idx) {
        const rank = idx + 1; // 1-based
        if (!scores[id]) scores[id] = { score: 0, signals: [], ranks: {} };
        scores[id].score += w / (K + rank);
        scores[id].signals.push(name);
        scores[id].ranks[name] = rank;
      });
    });
    return Object.keys(scores)
      .map(function (id) { return { id: Number(id), score: scores[id].score, signals: scores[id].signals, ranks: scores[id].ranks }; })
      .sort(function (a, b) { return b.score - a.score; });
  }

  /* ---------- snippet + highlight ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function highlight(text, qTokens) {
    let out = escapeHtml(text);
    const terms = qTokens.filter(function (t) { return t.length >= 2; })
      .sort(function (a, b) { return b.length - a.length; });
    terms.forEach(function (t) {
      const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }
  function makeSnippet(d, qTokens) {
    // find the best matching section, else the page text
    const qset = new Set(qTokens);
    let best = null, bestScore = -1;
    d.sectionTexts.forEach(function (s) {
      let score = 0;
      qset.forEach(function (t) {
        if (s.t.indexOf(t) !== -1) {
          // a match in the section label (e.g. FAQ question) is a stronger signal
          score += normalize(s.label).indexOf(t) !== -1 ? 2 : 1;
        }
      });
      if (score > bestScore) { bestScore = score; best = s; }
    });
    const text = best ? best.t : d.textT;
    const url = best ? best.url : d.doc.url;
    const label = best ? best.label : '';

    // find a window around the first hit
    let start = 0;
    let firstHit = -1;
    qTokens.forEach(function (t) {
      const p = text.indexOf(t);
      if (p !== -1 && (firstHit === -1 || p < firstHit)) firstHit = p;
    });
    if (firstHit !== -1) {
      start = Math.max(0, firstHit - 70);
    }
    let slice = text.slice(start, start + 200);
    const ellipsis = start > 0 ? '…' : '';
    if (start + 200 < text.length) slice = slice.replace(/\s+\S*$/, '') + '…';
    return { html: ellipsis + highlight(slice, qTokens), url: url, label: label };
  }

  /* ---------- public API ---------- */
  function runRetrievers(qT, qTokens) {
    return [
      { name: 'phrase', items: retrievePhrase(qT) },
      { name: 'terms', items: retrieveTerms(qTokens) },
      { name: 'title', items: retrieveTitle(qTokens) },
      { name: 'alias', items: retrieveAlias(qTokens, qT) },
      { name: 'prefix', items: retrievePrefix(qTokens) }
    ].filter(function (l) { return l.items.length > 0; });
  }

  function search(query) {
    const qT = normalize(query);
    if (!qT || qT.length < 2) return [];
    const qTokens = tokens(qT);
    const lists = runRetrievers(qT, qTokens);
    if (!lists.length) return [];
    const fused = rrf(lists, WEIGHTS);
    return fused.slice(0, MAX_RESULTS).map(function (f) {
      const d = docs[f.id];
      const snip = makeSnippet(d, qTokens);
      return {
        id: d.doc.id,
        title: d.doc.title,
        type: d.doc.type,
        url: snip.url || d.doc.url,
        sectionLabel: snip.label,
        snippet: snip.html,
        score: f.score,
        rank: fused.indexOf(f) + 1,
        signals: f.signals,
        ranks: f.ranks
      };
    });
  }

  function explain(query) {
    const qT = normalize(query);
    if (!qT || qT.length < 2) return { query: qT, lists: [], fused: [] };
    const qTokens = tokens(qT);
    const lists = runRetrievers(qT, qTokens);
    const fused = rrf(lists, WEIGHTS);
    return {
      query: qT,
      k: K,
      weights: WEIGHTS,
      lists: lists.map(function (l) {
        return {
          name: l.name,
          count: l.items.length,
          top: l.items.slice(0, 5).map(function (id) { return docs[id].doc.id; })
        };
      }),
      fused: fused.slice(0, MAX_RESULTS).map(function (f) {
        return {
          id: docs[f.id].doc.id,
          score: +f.score.toFixed(5),
          signals: f.signals,
          ranks: f.ranks
        };
      })
    };
  }

  window.GlycogoSearch = { search: search, explain: explain };
})();
