// Builds the two Instagram posters from assets/instagram/data.json,
// which is dumped from the Glycogo sports food catalogue.
const fs = require("fs");
const path = require("path");

const dir = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));

const BG = "#0A101F";
const GRID = "#1E2A42";
const TEXT = "#F4F7FA";
const MUTED = "#8FA0B8";
const GREEN = "#4FE08B";
const ORANGE = "#FF8B4D";
const TEAL = "#5CC9DC";
const VIOLET = "#B08CFF";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function frame(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect width="1080" height="1080" fill="${BG}"/>
  <rect x="0" y="0" width="1080" height="6" fill="${GREEN}"/>
${inner}
</svg>`;
}

function footer(note) {
  return `<text x="72" y="1016" font-size="16" fill="${MUTED}">${esc(note)}</text>
  <text x="72" y="1046" font-size="16" fill="${MUTED}">glycogo.fit · @glycogo</text>`;
}

// ---------- chart 1: sodium vs glucose to fructose ----------

const bands = [
  { y: 292, label: "1:0.8", sub: "44% fructose" },
  { y: 386, label: "1:0.7", sub: "41% fructose" },
  { y: 480, label: "2:1", sub: "33% fructose" },
  { y: 574, label: "1:0", sub: "all glucose" },
];
const bandIndex = { "1:0.8": 0, "1:0.7": 1, "2:1": 2, "1:0.5": 2, "1:0": 3 };

const shortNames = {
  "Carbs Fuel Original Sports Drink Mix": "Carbs Fuel Original",
  "Flow Formulas Blueberry Agave Endurance Drink Mix": "Flow Formulas Agave",
  "Maurten Drink Mix 320 CAF 100 Hydration Mix Energy Powder": "Maurten 320 CAF 100",
  "Maurten Drink Mix 320 Energy Powder": "Maurten 320",
  "Maurten Drink Mix 160 Energy Powder": "Maurten 160",
  "Science in Sport Beta Fuel Energy Drink Mix": "SiS Beta Fuel",
  "Tailwind High Carb Ginger and Lime Energy Powder": "Tailwind High Carb",
  "Skratch Labs Super High Carb Energy Powder": "Skratch Super High Carb",
  "Hammer Nutrition Perpetuem - Endurance Drink for long-lasting energy": "Hammer Perpetuem",
  "Hammer Nutrition Perpetuem Energy Powder": "Hammer Perpetuem",
  "Named Sport ISONAM ENERGY Electrolyte Powder": "Named Sport ISONAM",
  "Named Sport ISONAM ENERGY Orange Electrolyte Powder": "Named Sport ISONAM Orange",
  "Overstim.s Boisson electrolytes Electrolyte Powder": "Overstim.s Electrolytes",
  "Mountain Fuel Xtreme Energy Fuel Energy Powder": "Mountain Fuel Xtreme",
  "Mountain Fuel Xtreme Energy Fuel - Raw Energy Powder": "Mountain Fuel Xtreme Raw",
  "High5 Isotonic Hydration Electrolyte Powder": "High5 Isotonic",
  "High 5 Orange Energy Drink": "High 5 Orange",
  "Hammer Nutrition HEED Sports Drink": "Hammer HEED",
  "ProAction Mineral Plus Electrolyte Powder": "ProAction Mineral Plus",
  "Torq Cola Caffeine Energy Powder": "Torq Cola Caffeine",
  "Torq Energy Drink Powder": "Torq Energy",
  "Never Second C30 Fuel Drink": "Never Second C30",
  "Never Second C90 High-Carb Drink Mix": "Never Second C90",
  "Naak Boost 60 Neutral Energy Powder": "Naak Boost 60",
  "Mountain Fuel Morning Fuel Energy Powder": "Mountain Fuel Morning",
};

function chart1() {
  const seen = new Set();
  const pts = [];
  for (const m of data.mixes) {
    if (!(m.gf in bandIndex)) continue;
    const key = `${Math.round(m.sodium)}|${m.gf}|${Math.round(m.carbs / 5)}|${m.name.split(" ")[0].toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pts.push(m);
  }
  pts.sort((a, b) => a.sodium - b.sodium || a.carbs - b.carbs);

  const x0 = 96, x1 = 900, xMax = 660;
  const X = (v) => x0 + (v / xMax) * (x1 - x0);

  let g = "";
  for (const v of [0, 165, 330, 495, 660]) {
    g += `<line x1="${X(v).toFixed(1)}" y1="244" x2="${X(v).toFixed(1)}" y2="620" stroke="${GRID}" stroke-width="1"/>`;
  }
  for (const y of [244, 339, 433, 527, 620]) {
    g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`;
  }
  for (const v of [0, 165, 330, 495, 660]) {
    g += `<text x="${X(v).toFixed(1)}" y="650" font-size="16" fill="${MUTED}" text-anchor="middle">${v}</text>`;
  }
  g += `<text x="${(x0 + x1) / 2}" y="684" font-size="19" fill="${TEXT}" text-anchor="middle" letter-spacing="0.4">Sodium (mg per serve)</text>`;

  g += `<text x="${x1 + 22}" y="258" font-size="14" fill="${MUTED}" letter-spacing="1.2">G:F RATIO</text>`;
  for (const b of bands) {
    g += `<text x="${x1 + 22}" y="${b.y + 2}" font-size="21" font-weight="700" fill="${TEXT}">${b.label}</text>`;
    g += `<text x="${x1 + 22}" y="${b.y + 22}" font-size="14" fill="${MUTED}">${b.sub}</text>`;
  }

  // Stagger points that share a sodium value inside the same ratio band,
  // keeping x true to the labelled value.
  const offsets = [0, -30, 30];
  const placed = [];
  let dots = "";
  pts.forEach((m, i) => {
    const bi = bandIndex[m.gf];
    const cx = X(m.sodium);
    const ry = bands[bi].y;
    let dy = 0;
    for (const cand of offsets) {
      const clash = placed.some((p) => p.bi === bi && p.dy === cand && Math.abs(p.cx - cx) < 36);
      if (!clash) { dy = cand; break; }
    }
    placed.push({ bi, dy, cx });
    const cy = ry + dy;
    const r = 10 + Math.min(m.carbs, 95) / 95 * 4;
    const warm = m.caf && m.caf > 0;
    const c = warm ? ORANGE : GREEN;
    dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${c}" fill-opacity="0.22" stroke="${c}" stroke-width="2"/>`;
    dots += `<text x="${cx.toFixed(1)}" y="${(cy + 4).toFixed(1)}" font-size="11" font-weight="700" fill="${TEXT}" text-anchor="middle">${i + 1}</text>`;
  });

  // key, three columns
  const cols = [72, 400, 728];
  const rows = Math.ceil(pts.length / 3);
  let key = "";
  pts.forEach((m, i) => {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const kx = cols[col];
    const ky = 736 + row * 26;
    const c = m.caf && m.caf > 0 ? ORANGE : GREEN;
    key += `<circle cx="${kx + 8}" cy="${ky - 5}" r="7" fill="${c}" fill-opacity="0.22" stroke="${c}" stroke-width="1.5"/>`;
    key += `<text x="${kx + 8}" y="${ky - 1}" font-size="9" font-weight="700" fill="${TEXT}" text-anchor="middle">${i + 1}</text>`;
    const name = shortNames[m.name] || m.name.replace(/\s+(Energy Powder|Drink Mix|Powder|Drink|Mix)$/i, "");
    key += `<text x="${kx + 24}" y="${ky}" font-size="14" fill="${TEXT}">${esc(name)}</text>`;
  });

  const inner = `
  <text x="72" y="104" font-size="48" font-weight="700" fill="${TEXT}" letter-spacing="-0.5">Sodium and the sugar blend</text>
  <text x="72" y="144" font-size="23" fill="${MUTED}">${pts.length} sports drink mixes, per serve. Dot size follows carbohydrate.</text>
  ${g}
  ${dots}
  ${key}
  ${footer("Source: Glycogo sports nutrition catalogue. Sodium and G:F as labelled per serve.")}
  `;
  return frame(inner);
}

// ---------- chart 2: caffeine vs carbohydrate ----------

function typeOf(name) {
  const n = name.toLowerCase();
  if (/gel/.test(n)) return "gel";
  if (/chew|gum|jelly|pastille|sweets|block/.test(n)) return "chew";
  if (/mix|drink|powder|electrolyte|hydration|effervescent|tablet|sachet|concentrate/.test(n)) return "drink";
  if (/bar/.test(n)) return "bar";
  return "gel";
}

const typeColour = { gel: GREEN, chew: TEAL, bar: VIOLET, drink: ORANGE };
const typeName = { gel: "Gels", chew: "Chews", bar: "Bars", drink: "Drink mixes" };

function chart2() {
  const seen = new Set();
  const pts = [];
  for (const p of data.caffeinated) {
    const brand = p.name.split(" ")[0].toLowerCase();
    const type = typeOf(p.name);
    const key = `${brand}|${p.caf}|${Math.round(p.carbs)}|${type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pts.push({ ...p, type });
  }

  const x0 = 128, x1 = 948, y0 = 280, y1 = 820;
  const xMax = 210, yMax = 95;
  const X = (v) => x0 + (v / xMax) * (x1 - x0);
  const Y = (v) => y1 - (v / yMax) * (y1 - y0);

  let g = "";
  for (const v of [0, 52.5, 105, 157.5, 210]) {
    g += `<line x1="${X(v).toFixed(1)}" y1="${y0}" x2="${X(v).toFixed(1)}" y2="${y1}" stroke="${GRID}" stroke-width="1"/>`;
  }
  for (const v of [0, 23.75, 47.5, 71.25, 95]) {
    g += `<line x1="${x0}" y1="${Y(v).toFixed(1)}" x2="${x1}" y2="${Y(v).toFixed(1)}" stroke="${GRID}" stroke-width="1"/>`;
  }
  for (const v of [0, 50, 100, 150, 200]) {
    g += `<text x="${X(v).toFixed(1)}" y="${y1 + 28}" font-size="16" fill="${MUTED}" text-anchor="middle">${v}</text>`;
  }
  for (const v of [0, 25, 50, 75]) {
    g += `<text x="${x0 - 16}" y="${Y(v) + 5}" font-size="16" fill="${MUTED}" text-anchor="end">${v}</text>`;
  }
  g += `<text x="${(x0 + x1) / 2}" y="${y1 + 58}" font-size="19" fill="${TEXT}" text-anchor="middle" letter-spacing="0.4">Caffeine (mg per serve)</text>`;
  g += `<text x="${x0 - 52}" y="${(y0 + y1) / 2}" font-size="19" fill="${TEXT}" text-anchor="middle" transform="rotate(-90 ${x0 - 52} ${(y0 + y1) / 2})" letter-spacing="0.4">Carbohydrate (g per serve)</text>`;

  for (const v of [100, 200]) {
    g += `<line x1="${X(v).toFixed(1)}" y1="${y0}" x2="${X(v).toFixed(1)}" y2="${y1}" stroke="${MUTED}" stroke-opacity="0.35" stroke-dasharray="4 6"/>`;
  }

  let dots = "";
  for (const p of pts) {
    const c = typeColour[p.type] || GREEN;
    dots += `<circle cx="${X(p.caf).toFixed(1)}" cy="${Y(p.carbs).toFixed(1)}" r="7" fill="${c}" fill-opacity="0.3" stroke="${c}" stroke-width="2"/>`;
  }

  const callouts = [
    { name: "SiS Beta Fuel + Nootropics", caf: 200, carbs: 40, dx: -16, dy: -16, anchor: "end" },
    { name: "Voom caffeine bar", caf: 175, carbs: 45.1, dx: -14, dy: -16, anchor: "end" },
    { name: "226ers High Fructose", caf: 160, carbs: 55.1, dx: -15, dy: -16, anchor: "end" },
    { name: "Maurten 320 CAF 100", caf: 100, carbs: 78.8, dx: 14, dy: 18, anchor: "start" },
  ];
  let labels = "";
  for (const c of callouts) {
    labels += `<text x="${(X(c.caf) + c.dx).toFixed(1)}" y="${(Y(c.carbs) + c.dy).toFixed(1)}" font-size="15" fill="${TEXT}" text-anchor="${c.anchor}">${esc(c.name)}</text>`;
  }

  let legend = "";
  let lx = 128;
  for (const t of ["gel", "chew", "bar", "drink"]) {
    const n = pts.filter((p) => p.type === t).length;
    legend += `<circle cx="${lx}" cy="932" r="7" fill="${typeColour[t]}" fill-opacity="0.3" stroke="${typeColour[t]}" stroke-width="2"/>`;
    legend += `<text x="${lx + 16}" y="938" font-size="16" fill="${MUTED}">${typeName[t]} ${n}</text>`;
    lx += 156;
  }

  const inner = `
  <text x="72" y="104" font-size="48" font-weight="700" fill="${TEXT}" letter-spacing="-0.5">Caffeine against carbohydrate</text>
  <text x="72" y="144" font-size="23" fill="${MUTED}">${pts.length} caffeinated products, per serve. Dashed lines at 100 and 200 mg.</text>
  ${g}
  ${dots}
  ${labels}
  ${legend}
  ${footer("Source: Glycogo sports nutrition catalogue. Per-serve values from product labels.")}
  `;
  return frame(inner);
}

function page(svg) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:${BG};overflow:hidden}svg{display:block}</style></head><body>${svg}</body></html>`;
}

const one = chart1();
const two = chart2();
fs.writeFileSync(path.join(dir, "sodium-gf.svg"), one);
fs.writeFileSync(path.join(dir, "sodium-gf.html"), page(one));
fs.writeFileSync(path.join(dir, "caffeine-carbs.svg"), two);
fs.writeFileSync(path.join(dir, "caffeine-carbs.html"), page(two));
console.log("wrote posters");
