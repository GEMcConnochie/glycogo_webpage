/* Glycogo site search — UI wiring.
 * Injects the RRF-powered modal. No visible trigger: open with
 * Ctrl/Cmd+K or "/"; Esc closes; ↑/↓ navigate; Enter opens.
 * Reads ?q= from the URL to deep-link a query.
 */
(function () {
  'use strict';

  const ROOT_ID = 'glyco-search-root';
  const CSS_URL = '/search/search.css';
  const JS_URL = '/search/search-rrf.js';
  const SEARCH = window.GlycogoSearch;
  const INDEX = window.GLYCOGO_INDEX || [];

  /* ---------- guard: only run once, only where the engine loaded ---------- */
  if (document.getElementById(ROOT_ID) || !SEARCH) return;

  /* ---------- inject stylesheet if not already present ---------- */
  if (!document.querySelector('link[href="' + CSS_URL + '"]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    document.head.appendChild(link);
  }

  /* ---------- icons ---------- */
  var ICON_MAG = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var ICON_EMPTY = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

  /* ---------- build DOM ---------- */
  var root = document.createElement('div');
  root.id = ROOT_ID;
  root.innerHTML =
    '<div class="gs-overlay" role="dialog" aria-modal="true" aria-label="Site search">' +
      '<div class="gs-panel">' +
        '<div class="gs-input-wrap">' +
          '<span class="gs-ico">' + ICON_MAG + '</span>' +
          '<input class="gs-input" type="text" placeholder="Ask anything — search the site…" autocomplete="off" spellcheck="false" aria-label="Search">' +
          '<button type="button" class="gs-esc" aria-label="Close">esc</button>' +
        '</div>' +
        '<div class="gs-sources">' +
          '<span class="gs-sources-label">Sources</span>' +
        '</div>' +
        '<div class="gs-results" role="listbox" aria-label="Results"></div>' +
        '<button type="button" class="gs-debug-toggle" hidden>Why these results?</button>' +
        '<div class="gs-debug"></div>' +
        '<div class="gs-footer">' +
          '<span class="gs-note">RRF search — phrase · BM25 · title · aliases · prefix</span>' +
          '<span class="gs-keys"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></span>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(root);

  var overlay = root.querySelector('.gs-overlay');
  var input = root.querySelector('.gs-input');
  var resultsEl = root.querySelector('.gs-results');
  var sourcesEl = root.querySelector('.gs-sources');
  var debugToggle = root.querySelector('.gs-debug-toggle');
  var debugEl = root.querySelector('.gs-debug');

  var open = false;
  var lastQuery = '';
  var lastResults = [];
  var selectedIndex = -1;
  var debounceTimer = null;

  /* ---------- open / close ---------- */
  function openSearch(initial) {
    if (open) { input.focus(); return; }
    open = true;
    overlay.classList.add('open');
    overlay.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    if (initial != null) {
      input.value = initial;
      doSearch(initial);
    }
    input.focus();
    input.select();
  }
  function closeSearch() {
    if (!open) return;
    open = false;
    overlay.classList.add('closing');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.classList.remove('open', 'closing'); }, 170);
  }
  overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeSearch(); });
  root.querySelector('.gs-esc').addEventListener('click', closeSearch);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { e.preventDefault(); closeSearch(); return; }
    var tag = (e.target && e.target.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable);
    if (!typing && (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openSearch();
    } else if (!typing && e.key === '/' && !open) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ---------- search + render ---------- */
  function doSearch(q) {
    var results = SEARCH.search(q);
    lastQuery = q;
    lastResults = results;
    selectedIndex = results.length ? 0 : -1;
    renderSources(results);
    renderResults(results);
    debugToggle.hidden = !results.length;
  }

  input.addEventListener('input', function () {
    var q = input.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { doSearch(q); }, 70);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var r = lastResults[selectedIndex >= 0 ? selectedIndex : 0];
      if (r) window.open(r.url, r.url.indexOf('#') !== -1 ? '_self' : '_blank');
    }
  });
  function move(d) {
    if (!lastResults.length) return;
    selectedIndex = Math.min(Math.max(selectedIndex + d, 0), lastResults.length - 1);
    renderResults(lastResults);
    var sel = resultsEl.querySelector('.gs-result.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function renderSources(results) {
    if (!results.length) { sourcesEl.classList.remove('show'); return; }
    sourcesEl.classList.add('show');
    var seen = {};
    var chips = [];
    results.forEach(function (r) {
      if (!seen[r.url]) { seen[r.url] = true; chips.push(r); }
    });
    chips.slice(0, 5).forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'gs-source-chip';
      a.href = r.url;
      a.target = r.url.indexOf('#') !== -1 ? '_self' : '_blank';
      a.textContent = r.type;
      sourcesEl.appendChild(a);
    });
    // replace previous chips
    var old = sourcesEl.querySelectorAll('.gs-source-chip');
    for (var i = 0; i < old.length; i++) old[i].remove();
    chips.slice(0, 5).forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'gs-source-chip';
      a.href = r.url;
      if (r.url.indexOf('#') === -1) a.target = '_blank';
      a.textContent = r.type;
      sourcesEl.appendChild(a);
    });
  }

  function renderResults(results) {
    resultsEl.textContent = '';
    if (!lastQuery || lastQuery.length < 2) {
      var hint = document.createElement('div');
      hint.className = 'gs-hint';
      hint.innerHTML = 'Type at least 2 characters — try <span class="gs-kbd-inline">carb ratio</span>, <span class="gs-kbd-inline">creatine</span>, <span class="gs-kbd-inline">Intervals.icu</span> or <span class="gs-kbd-inline">delete account</span>';
      resultsEl.appendChild(hint);
      return;
    }
    if (!results.length) {
      var empty = document.createElement('div');
      empty.className = 'gs-empty';
      empty.innerHTML =
        ICON_EMPTY +
        '<strong>No results for “' + escapeHtml(lastQuery) + '”</strong>' +
        '<p>Try different wording, or a broader topic like <em>fuelling</em>, <em>calculator</em>, or <em>settings</em>.</p>';
      resultsEl.appendChild(empty);
      return;
    }
    results.forEach(function (r, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gs-result' + (i === selectedIndex ? ' selected' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
      btn.innerHTML =
        '<div class="gs-result-top">' +
          '<span class="gs-result-title">' + escapeHtml(r.title) + '</span>' +
          '<span class="gs-result-type">' + escapeHtml(r.type) + '</span>' +
        '</div>' +
        (r.sectionLabel ? '<div class="gs-result-section">' + escapeHtml(r.sectionLabel) + '</div>' : '') +
        '<div class="gs-result-snippet">' + r.snippet + '</div>' +
        '<div class="gs-result-signals">' +
          ['phrase', 'terms', 'title', 'alias', 'prefix'].map(function (s) {
            var hit = r.signals.indexOf(s) !== -1;
            return '<span class="gs-sig' + (hit ? ' hit' : '') + '">' + s + (hit ? ' #' + r.ranks[s] : '') + '</span>';
          }).join('') +
        '</div>';
      btn.addEventListener('click', function () {
        window.open(r.url, r.url.indexOf('#') !== -1 ? '_self' : '_blank');
      });
      btn.addEventListener('mousemove', function () {
        if (selectedIndex !== i) { selectedIndex = i; renderResults(lastResults); }
      });
      resultsEl.appendChild(btn);
    });
  }

  /* ---------- debug panel ---------- */
  debugToggle.addEventListener('click', function () {
    var isOpen = debugEl.classList.toggle('open');
    debugToggle.textContent = isOpen ? 'Hide the maths' : 'Why these results?';
    if (isOpen) renderDebug();
  });
  function renderDebug() {
    var ex = SEARCH.explain(lastQuery);
    var html = '<div><b>Reciprocal Rank Fusion</b> — score = Σ w/(k + rank), k=' + ex.k + '<br>';
    ex.lists.forEach(function (l) {
      html += '&nbsp;· ' + l.name + ' (' + l.count + ' docs): ' + l.top.map(esc).join(', ') + '<br>';
    });
    html += '</div>';
    ex.fused.forEach(function (f) {
      var contribs = ex.lists.map(function (l) {
        return f.ranks[l.name] ? '<span class="gs-dbg-row"><span>' + l.name + ' #' + f.ranks[l.name] + '</span><span class="gs-dbg-score">+' + (ex.weights[l.name] / (ex.k + f.ranks[l.name])).toFixed(5) + '</span></span>' : '';
      }).filter(Boolean).join('');
      html += '<div class="gs-dbg-row"><span><b>' + esc(f.id) + '</b></span><span class="gs-dbg-score">' + f.score + '</span></div>' + contribs;
    });
    debugEl.innerHTML = html;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function escapeHtml(s) { return esc(s); }

  /* ---------- deep-link ?q= ---------- */
  (function () {
    try {
      var p = new URLSearchParams(window.location.search);
      var q = p.get('q');
      if (q) setTimeout(function () { openSearch(q); }, 350);
    } catch (e) { /* no-op */ }
  })();

  /* expose for debugging */
  window.GlycogoSearchUI = { open: openSearch, close: closeSearch };
})();
