/* Interactive graphics for the GRE Quant lessons. Each widget builds sliders and an SVG that redraws live.
   QW[name]() returns a DOM element. */
(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const h = (tag, props, ...kids) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(props || {})) { if (v == null || v === false) continue; if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v); } for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c)); return n; };
  const s = (tag, attrs = {}, text) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v); if (text != null) n.textContent = text; return n; };
  // append children, skipping empty ones (append(null) would add the text "null")
  const add = (node, ...kids) => { for (const k of kids.flat(Infinity)) if (k != null && k !== false) node.append(k); return node; };
  const r2 = x => Math.round(x * 100) / 100;
  const fmt = x => Number.isInteger(x) ? String(x) : String(r2(x));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const sup = n => String(n).split("").map(c => "⁰¹²³⁴⁵⁶⁷⁸⁹"["0123456789".indexOf(c)] || (c === "-" ? "⁻" : c)).join("");

  // a widget: sliders on top, a picture, and a line of results
  function frame(controls, svgW, svgH, draw) {
    const svg = s("svg", { viewBox: `0 0 ${svgW} ${svgH}`, class: "wsvg", role: "img" });
    const out = h("div", { class: "wout" });
    const box = h("div", { class: "widget" }, h("div", { class: "wctl" }, controls.map(c => c.el)), svg, out);
    const vals = () => Object.fromEntries(controls.filter(c => c.key).map(c => [c.key, c.get()]));
    const redraw = () => { svg.replaceChildren(); out.replaceChildren(); draw(vals(), svg, out); };
    controls.forEach(c => c.on && c.on(redraw));
    redraw();
    return box;
  }
  function slider(key, label, min, max, step, value, show = v => fmt(v)) {
    const inp = h("input", { type: "range", min, max, step, value, "aria-label": label });
    const val = h("b", {}, show(+value));
    let cb = null;
    inp.addEventListener("input", () => { val.textContent = show(+inp.value); cb && cb(); });
    return { key, el: h("label", { class: "wsl" }, h("span", {}, label, " ", val), inp), get: () => +inp.value, on: f => { cb = f; }, set: v => { inp.value = v; val.textContent = show(+v); } };
  }
  function toggle(key, opts, value) {
    let v = value, cb = null;
    const wrap = h("div", { class: "wseg" });
    const paint = () => wrap.replaceChildren(...opts.map(([id, label]) => h("button", { type: "button", class: id === v ? "on" : "", onclick: () => { v = id; paint(); cb && cb(); } }, label)));
    paint();
    return { key, el: wrap, get: () => v, on: f => { cb = f; } };
  }
  const line = (...items) => h("div", { class: "wline" }, items);
  // a result: maths between ⟦ and ⟧ is typeset with KaTeX (window.MATH comes from math.js)
  const kv = (k, v, cls) => { const b = h("b"); const t = String(v); if (t.includes("⟦") && window.MATH) b.innerHTML = window.MATH(t); else b.textContent = t; return h("span", { class: "kv" + (cls ? " " + cls : "") }, h("small", {}, k), b); };
  const tex = x => "⟦" + x + "⟧";
  // 1x → x, −1x → −x, as maths is written
  const co = m => m === 1 ? "" : m === -1 ? "-" : String(m);
  // a coordinate plane
  function plane(svg, W, H, x0, x1, y0, y1, step = 1) {
    const X = x => (x - x0) / (x1 - x0) * W, Y = y => H - (y - y0) / (y1 - y0) * H;
    for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) add(svg, s("line", { x1: X(x), x2: X(x), y1: 0, y2: H, class: "grid" }));
    for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) add(svg, s("line", { y1: Y(y), y2: Y(y), x1: 0, x2: W, class: "grid" }));
    if (x0 <= 0 && x1 >= 0) add(svg, s("line", { x1: X(0), x2: X(0), y1: 0, y2: H, class: "axis" }));
    if (y0 <= 0 && y1 >= 0) add(svg, s("line", { y1: Y(0), y2: Y(0), x1: 0, x2: W, class: "axis" }));
    const fn = (f, cls = "curve", n = 200) => { let d = "", pen = false; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = f(x); if (!isFinite(y) || y < y0 - 50 || y > y1 + 50) { pen = false; continue; } d += (pen ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1); pen = true; } add(svg, s("path", { d, class: cls })); };
    const dot = (x, y, cls = "dot", r = 5) => add(svg, s("circle", { cx: X(x), cy: Y(y), r, class: cls }));
    const label = (x, y, t, cls = "lbl") => add(svg, s("text", { x: X(x), y: Y(y), class: cls }, t));
    return { X, Y, fn, dot, label };
  }

  const QW = {};

  QW.factor = () => frame([slider("n", "Number", 2, 500, 1, 360)], 320, 190, ({ n }, svg, out) => {
    const pf = []; let m = n;
    for (let p = 2; p * p <= m; p++) while (m % p === 0) { pf.push(p); m /= p; }
    if (m > 1) pf.push(m);
    // tree: split off the smallest prime each step
    let cur = n, y = 22, x = 160;
    add(svg, s("text", { x, y, class: "lbl big mid" }, n));
    pf.slice(0, -1).forEach((p, i) => {
      const next = cur / p, ny = y + 30;
      add(svg, s("line", { x1: x, y1: y + 4, x2: x - 26, y2: ny - 12, class: "thin" }), s("line", { x1: x, y1: y + 4, x2: x + 26, y2: ny - 12, class: "thin" }));
      add(svg, s("circle", { cx: x - 30, cy: ny - 5, r: 13, class: "prime" }), s("text", { x: x - 30, y: ny, class: "lbl mid" }, p), s("text", { x: x + 30, y: ny, class: "lbl mid" }, next));
      cur = next; x += 30; y = ny;
    });
    if (pf.length > 1) { add(svg, s("circle", { cx: x, cy: y - 5, r: 13, class: "prime" })); }
    const counts = {}; pf.forEach(p => counts[p] = (counts[p] || 0) + 1);
    const nf = Object.values(counts).reduce((t, a) => t * (a + 1), 1);
    const factors = []; for (let d = 1; d <= n; d++) if (n % d === 0) factors.push(d);
    add(out, line(kv("Prime factors", pf.length === 1 ? n + " is prime" : tex(n + " = " + Object.entries(counts).map(([p, a]) => p + (a > 1 ? "^{" + a + "}" : "")).join(" \\cdot "))),
      kv("Number of factors", tex(Object.values(counts).map(a => `(${a}+1)`).join("") + " = " + nf))),
      h("div", { class: "wsmall" }, "Factors: " + (factors.length > 30 ? factors.slice(0, 30).join(", ") + " …" : factors.join(", "))));
  });

  QW.fraction = () => frame([slider("a", "Top (numerator)", 0, 12, 1, 3), slider("b", "Bottom (denominator)", 1, 12, 1, 8)], 320, 170, ({ a, b }, svg, out) => {
    const cx = 85, cy = 85, r = 70;
    for (let i = 0; i < b; i++) {
      const t0 = i / b * 2 * Math.PI - Math.PI / 2, t1 = (i + 1) / b * 2 * Math.PI - Math.PI / 2;
      const p = b === 1 ? s("circle", { cx, cy, r, class: i < a ? "fillA" : "slice" }) : s("path", { d: `M${cx} ${cy} L${cx + r * Math.cos(t0)} ${cy + r * Math.sin(t0)} A${r} ${r} 0 0 1 ${cx + r * Math.cos(t1)} ${cy + r * Math.sin(t1)} Z`, class: i < a ? "fillA" : "slice" });
      add(svg, p);
    }
    // number line 0..2
    const X = v => 180 + v / 2 * 130;
    add(svg, s("line", { x1: X(0), x2: X(2), y1: 120, y2: 120, class: "axis" }));
    [0, 0.5, 1, 1.5, 2].forEach(v => add(svg, s("line", { x1: X(v), x2: X(v), y1: 114, y2: 126, class: "axis" }), s("text", { x: X(v), y: 144, class: "lbl mid" }, v)));
    const val = a / b;
    if (val <= 2) add(svg, s("circle", { cx: X(val), cy: 120, r: 6, class: "dotA" }));
    add(svg, s("text", { x: 250, y: 70, class: "lbl big mid" }, `${a}/${b}`));
    const g = gcd(a, b) || 1;
    add(out, line(kv("Simplest", a === 0 ? "0" : tex(`\\frac{${a}}{${b}} = \\frac{${a / g}}{${b / g}}`)), kv("Decimal", r2(val * 1000) / 1000 + ""), kv("Percent", r2(val * 100) + "%"), kv("vs ½", val > 0.5 ? "bigger" : val < 0.5 ? "smaller" : "equal")));
  });

  QW.power = () => frame([slider("x", "Base x", -3, 3, 0.5, 2), slider("n", "Exponent n", -3, 5, 1, 3)], 320, 200, ({ x, n }, svg, out) => {
    const P = plane(svg, 320, 200, -3, 3, -8, 8, 1);
    P.fn(t => Math.pow(t, n), "curve");
    const v = Math.pow(x, n);
    if (isFinite(v) && Math.abs(v) <= 8) P.dot(x, v, "dotA", 6);
    P.label(-2.9, 7.2, `y = x${sup(n)}`);
    add(out, line(kv("Value", isFinite(v) ? tex(`(${fmt(x)})^{${n}} = ${fmt(r2(v))}`) : "undefined (÷0)"),
      kv("Sign", !isFinite(v) ? "–" : v > 0 ? "positive" : v < 0 ? "negative" : "zero"),
      kv("Note", x < 0 ? (n % 2 === 0 ? "negative base, even power → positive" : "negative base, odd power → negative") : x > 0 && x < 1 ? (n > 1 ? "between 0 and 1: powers get smaller" : n < 0 ? "negative power → bigger" : "") : n < 0 ? "negative power = 1 ÷ positive power" : "")));
  });

  QW.percent = () => frame([slider("p1", "First change", -50, 50, 5, 20, v => (v > 0 ? "+" : "") + v + "%"), slider("p2", "Second change", -50, 50, 5, -20, v => (v > 0 ? "+" : "") + v + "%")], 320, 170, ({ p1, p2 }, svg, out) => {
    const v0 = 100, v1 = v0 * (1 + p1 / 100), v2 = v1 * (1 + p2 / 100), max = 230;
    [["Start", v0], ["After 1st", v1], ["After 2nd", v2]].forEach(([t, v], i) => {
      const x = 30 + i * 100, hgt = v / max * 130;
      add(svg, s("rect", { x, y: 140 - hgt, width: 60, height: hgt, rx: 6, class: i === 2 ? "barA" : "bar" }), s("text", { x: x + 30, y: 134 - hgt, class: "lbl mid" }, r2(v)), s("text", { x: x + 30, y: 160, class: "lbl mid small" }, t));
    });
    add(svg, s("line", { x1: 20, x2: 310, y1: 140 - 100 / max * 130, y2: 140 - 100 / max * 130, class: "dash" }));
    const net = v2 - 100;
    add(out, line(kv("Multipliers", `${r2(1 + p1 / 100)} × ${r2(1 + p2 / 100)} = ${r2(v2 / 100 * 100) / 100}`), kv("Net change", (net > 0 ? "+" : "") + r2(net) + "%", net < 0 ? "neg" : "pos")));
  });

  QW.ratio = () => frame([slider("a", "Part A", 1, 9, 1, 3), slider("b", "Part B", 1, 9, 1, 5), slider("k", "Size of one part", 1, 10, 1, 5)], 320, 110, ({ a, b, k }, svg, out) => {
    const tot = a + b, w = 300 / tot;
    for (let i = 0; i < tot; i++) add(svg, s("rect", { x: 10 + i * w, y: 20, width: w - 3, height: 46, rx: 5, class: i < a ? "barA" : "barB" }), s("text", { x: 10 + i * w + w / 2 - 1.5, y: 49, class: "lbl mid small" }, k));
    add(svg, s("text", { x: 10, y: 92, class: "lbl" }, `A = ${a} parts`), s("text", { x: 310, y: 92, class: "lbl end" }, `B = ${b} parts`));
    add(out, line(kv("Ratio", `${a} : ${b}`), kv("A", `${a} × ${k} = ${a * k}`), kv("B", `${b} × ${k} = ${b * k}`), kv("Total", `${tot} parts = ${tot * k}`)), h("div", { class: "wsmall" }, `A is ${a}/${tot} of the total, not ${a}/${b}.`));
  });

  QW.numline = () => frame([slider("a", "Point a", -8, 8, 1, 2), slider("x", "Point x", -10, 10, 1, -3)], 320, 90, ({ a, x }, svg, out) => {
    const X = v => 160 + v * 14.5;
    add(svg, s("line", { x1: 5, x2: 315, y1: 50, y2: 50, class: "axis" }));
    for (let v = -10; v <= 10; v++) add(svg, s("line", { x1: X(v), x2: X(v), y1: 45, y2: 55, class: v === 0 ? "axis" : "thin" }), v % 2 === 0 ? s("text", { x: X(v), y: 74, class: "lbl mid small" }, v) : null);
    add(svg, s("line", { x1: X(Math.min(a, x)), x2: X(Math.max(a, x)), y1: 30, y2: 30, class: "spanA" }));
    add(svg, s("circle", { cx: X(a), cy: 50, r: 6, class: "dotB" }), s("circle", { cx: X(x), cy: 50, r: 6, class: "dotA" }), s("text", { x: X((a + x) / 2), y: 22, class: "lbl mid" }, `distance ${Math.abs(x - a)}`));
    add(out, line(kv("|x − a|", `|${x} − (${a})| = ${Math.abs(x - a)}`), kv("|x − a| = " + Math.abs(x - a) + " means", `x = ${a - Math.abs(x - a)} or ${a + Math.abs(x - a)}`)));
  });

  QW.interest = () => frame([slider("r", "Rate", 1, 20, 1, 8, v => v + "%"), slider("t", "Years", 1, 30, 1, 15)], 320, 180, ({ r, t }, svg, out) => {
    const P = 1000, simple = y => P * (1 + r / 100 * y), comp = y => P * Math.pow(1 + r / 100, y), max = Math.max(comp(t), 2000);
    const pl = plane(svg, 320, 180, 0, t, 0, max * 1.05, Math.max(1, Math.round(t / 6)));
    pl.fn(simple, "curve"); pl.fn(comp, "curveA");
    pl.dot(t, comp(t), "dotA"); pl.dot(t, simple(t), "dot");
    add(out, line(kv("Simple", "$" + Math.round(simple(t)).toLocaleString("en-US")), kv("Compound", "$" + Math.round(comp(t)).toLocaleString("en-US"), "pos"), kv("Difference", "$" + Math.round(comp(t) - simple(t)).toLocaleString("en-US"))), h("div", { class: "wsmall" }, "$1,000 invested. Straight line = simple interest; curve = compound."));
  });

  QW.lines = () => frame([slider("m1", "Slope of line 1", -3, 3, 0.5, 1), slider("b1", "Intercept 1", -5, 5, 1, 1), slider("m2", "Slope of line 2", -3, 3, 0.5, -1), slider("b2", "Intercept 2", -5, 5, 1, 3)], 300, 220, ({ m1, b1, m2, b2 }, svg, out) => {
    const P = plane(svg, 300, 220, -6, 6, -6, 6, 1);
    P.fn(x => m1 * x + b1, "curve"); P.fn(x => m2 * x + b2, "curveA");
    let res;
    if (m1 === m2) res = b1 === b2 ? "Same line: infinitely many solutions" : "Parallel: no solution";
    else { const x = (b2 - b1) / (m1 - m2), y = m1 * x + b1; P.dot(x, y, "dotA", 6); res = `They meet at (${fmt(r2(x))}, ${fmt(r2(y))}): one solution`; }
    add(out, line(kv("Line 1 (blue)", tex(m1 === 0 ? `y = ${b1}` : `y = ${co(m1)}x ${b1 >= 0 ? "+" : "-"} ${Math.abs(b1)}`)), kv("Line 2 (red)", tex(m2 === 0 ? `y = ${b2}` : `y = ${co(m2)}x ${b2 >= 0 ? "+" : "-"} ${Math.abs(b2)}`))), h("div", { class: "wsmall" }, res));
  });

  QW.ineq = () => frame([slider("c", "Centre c", -5, 5, 1, 2), slider("d", "Distance d", 1, 6, 1, 3), toggle("op", [["lt", "|x − c| < d"], ["gt", "|x − c| > d"]], "lt")], 320, 90, ({ c, d, op }, svg, out) => {
    const X = v => 160 + v * 14;
    add(svg, s("line", { x1: 5, x2: 315, y1: 50, y2: 50, class: "axis" }));
    for (let v = -10; v <= 10; v++) add(svg, s("line", { x1: X(v), x2: X(v), y1: 45, y2: 55, class: "thin" }), v % 2 === 0 ? s("text", { x: X(v), y: 76, class: "lbl mid small" }, v) : null);
    if (op === "lt") add(svg, s("line", { x1: X(c - d), x2: X(c + d), y1: 50, y2: 50, class: "spanA" }));
    else add(svg, s("line", { x1: 5, x2: X(c - d), y1: 50, y2: 50, class: "spanA" }), s("line", { x1: X(c + d), x2: 315, y1: 50, y2: 50, class: "spanA" }));
    [c - d, c + d].forEach(v => add(svg, s("circle", { cx: X(v), cy: 50, r: 6, class: "open" })));
    add(svg, s("circle", { cx: X(c), cy: 50, r: 4, class: "dotB" }));
    add(out, line(kv("Solution", op === "lt" ? `${c - d} < x < ${c + d}` : `x < ${c - d} or x > ${c + d}`)), h("div", { class: "wsmall" }, op === "lt" ? `Within ${d} of ${c}.` : `More than ${d} away from ${c}.`));
  });

  QW.parabola = () => frame([slider("a", "a", -2, 2, 0.5, 1), slider("b", "b", -6, 6, 1, -2), slider("c", "c", -8, 8, 1, -3)], 300, 220, ({ a, b, c }, svg, out) => {
    const P = plane(svg, 300, 220, -6, 6, -10, 10, 1);
    if (a === 0) { P.fn(x => b * x + c, "curveA"); add(out, h("div", { class: "wsmall" }, "a = 0 makes a straight line, not a parabola.")); return; }
    P.fn(x => a * x * x + b * x + c, "curveA");
    const D = b * b - 4 * a * c, vx = -b / (2 * a), vy = a * vx * vx + b * vx + c;
    P.dot(vx, vy, "dotB", 5);
    let roots = "none (D < 0)";
    if (D >= 0) { const r1 = (-b - Math.sqrt(D)) / (2 * a), r2_ = (-b + Math.sqrt(D)) / (2 * a); P.dot(r1, 0, "dotA", 6); P.dot(r2_, 0, "dotA", 6); roots = D === 0 ? `x = ${fmt(r2(r1))} (one root)` : `x = ${fmt(r2(Math.min(r1, r2_)))} and ${fmt(r2(Math.max(r1, r2_)))}`; }
    add(out, line(kv("Equation", tex(`y = ${a}x^2 ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)}`)), kv("Discriminant", tex(`b^2 - 4ac = ${D}`), D > 0 ? "pos" : D < 0 ? "neg" : ""), kv("Roots", roots), kv("Vertex", `(${fmt(r2(vx))}, ${fmt(r2(vy))})`)));
  });

  QW.sequence = () => frame([toggle("type", [["ar", "Arithmetic (+d)"], ["ge", "Geometric (×r)"]], "ar"), slider("a1", "First term", -5, 10, 1, 3), slider("d", "d or r", -3, 4, 1, 2)], 320, 170, ({ type, a1, d }, svg, out) => {
    const terms = Array.from({ length: 8 }, (_, i) => type === "ar" ? a1 + i * d : a1 * Math.pow(d, i));
    const max = Math.max(1, ...terms.map(Math.abs)), mid = 85;
    terms.forEach((t, i) => { const hgt = t / max * 70, x = 14 + i * 38; add(svg, s("rect", { x, y: t >= 0 ? mid - hgt : mid, width: 28, height: Math.abs(hgt) || 1, rx: 4, class: "barA" }), s("text", { x: x + 14, y: t >= 0 ? mid - hgt - 4 : mid - hgt + 12, class: "lbl mid small" }, fmt(t)), s("text", { x: x + 14, y: 166, class: "lbl mid small" }, "a" + (i + 1))); });
    add(svg, s("line", { x1: 0, x2: 320, y1: mid, y2: mid, class: "axis" }));
    const sum = terms.reduce((x, y) => x + y, 0);
    add(out, line(kv("Rule", tex(type === "ar" ? `a_n = ${a1} + (n - 1)(${d})` : `a_n = ${a1} \\cdot (${d})^{n-1}`)), kv("Sum of 8 terms", fmt(sum))), type === "ar" ? h("div", { class: "wsmall" }, `Check: 8 × (first + last)/2 = 8 × (${a1} + ${terms[7]})/2 = ${fmt(8 * (a1 + terms[7]) / 2)}`) : null);
  });

  QW.points = () => frame([slider("x1", "x₁", -6, 6, 1, -3), slider("y1", "y₁", -6, 6, 1, -2), slider("x2", "x₂", -6, 6, 1, 3), slider("y2", "y₂", -6, 6, 1, 6)], 280, 280, ({ x1, y1, x2, y2 }, svg, out) => {
    const P = plane(svg, 280, 280, -7, 7, -7, 7, 1);
    add(svg, s("path", { d: `M${P.X(x1)} ${P.Y(y1)} L${P.X(x2)} ${P.Y(y1)} L${P.X(x2)} ${P.Y(y2)}`, class: "dash" }), s("line", { x1: P.X(x1), y1: P.Y(y1), x2: P.X(x2), y2: P.Y(y2), class: "curveA" }));
    P.dot(x1, y1, "dotB", 6); P.dot(x2, y2, "dotA", 6); P.dot((x1 + x2) / 2, (y1 + y2) / 2, "dot", 4);
    const dx = x2 - x1, dy = y2 - y1;
    add(out, line(kv("Slope", dx === 0 && dy === 0 ? "same point" : dx === 0 ? "none (vertical line)" : tex(`m = \\frac{${dy}}{${dx}} = ${fmt(r2(dy / dx))}`)), kv("Distance", tex(`\\sqrt{${dx}^2 + ${dy}^2} = ${fmt(r2(Math.hypot(dx, dy)))}`)), kv("Midpoint", `(${fmt((x1 + x2) / 2)}, ${fmt((y1 + y2) / 2)})`)), h("div", { class: "wsmall" }, "The dashed legs are Δx and Δy: distance is the Pythagorean theorem."));
  });

  QW.rate = () => frame([slider("va", "Speed of A (km/h)", 10, 100, 5, 60), slider("vb", "Speed of B (km/h)", 10, 100, 5, 40), slider("t", "Time (hours)", 0, 5, 0.25, 1)], 320, 110, ({ va, vb, t }, svg, out) => {
    const gap = 300, meet = gap / (va + vb), tt = Math.min(t, meet), X = d => 10 + d / gap * 300;
    add(svg, s("line", { x1: 10, x2: 310, y1: 55, y2: 55, class: "axis" }));
    add(svg, s("line", { x1: X(0), x2: X(va * tt), y1: 55, y2: 55, class: "spanA" }), s("line", { x1: X(gap - vb * tt), x2: X(gap), y1: 55, y2: 55, class: "spanB" }));
    add(svg, s("circle", { cx: X(va * tt), cy: 55, r: 9, class: "dotA" }), s("circle", { cx: X(gap - vb * tt), cy: 55, r: 9, class: "dotB" }));
    add(svg, s("text", { x: 10, y: 92, class: "lbl" }, "A starts here"), s("text", { x: 310, y: 92, class: "lbl end" }, "B starts 300 km away"));
    add(out, line(kv("Closing speed", `${va} + ${vb} = ${va + vb} km/h`), kv("They meet after", `300 ÷ ${va + vb} = ${fmt(r2(meet))} h`, "pos"), kv("Gap now", fmt(r2(Math.max(0, gap - (va + vb) * t))) + " km")));
  });

  QW.transversal = () => frame([slider("a", "Angle", 20, 160, 5, 65, v => v + "°")], 300, 200, ({ a }, svg, out) => {
    const rad = a * Math.PI / 180, ys = [60, 140], cx = 150, cot = 1 / Math.tan(rad);
    ys.forEach(y => add(svg, s("line", { x1: 10, x2: 290, y1: y, y2: y, class: "axis" })));
    // the transversal goes through (150, 100) at angle a above the horizontal
    const xAt = y => cx + (100 - y) * cot;
    add(svg, s("line", { x1: xAt(195), y1: 195, x2: xAt(5), y2: 5, class: "curveA" }));
    ys.forEach(y => {
      const x = xAt(y);
      add(svg, s("text", { x: x + 16, y: y - 8, class: "lbl small" }, a + "°"), s("text", { x: x - 16, y: y - 8, class: "lbl small end muted2" }, (180 - a) + "°"),
        s("text", { x: x - 16, y: y + 18, class: "lbl small end" }, a + "°"), s("text", { x: x + 16, y: y + 18, class: "lbl small muted2" }, (180 - a) + "°"));
    });
    add(out, line(kv("Angle sizes", `only ${a}° and ${180 - a}°`), kv("Sum", `${a} + ${180 - a} = 180°`)), h("div", { class: "wsmall" }, "Every angle at both crossings is one of the two sizes."));
  });

  QW.triangle = () => {
    const A = slider("a", "Leg a", 1, 12, 1, 6), B = slider("b", "Leg b", 1, 12, 1, 8);
    const pre = { el: h("div", { class: "wseg" }, [["3-4-5", 3, 4], ["5-12-13", 5, 12], ["45-45-90", 5, 5]].map(([t, x, y]) => h("button", { type: "button", onclick: () => { A.set(x); B.set(y); A.el.querySelector("input").dispatchEvent(new Event("input")); } }, t))) };
    return frame([A, B, pre], 300, 200, ({ a, b }, svg, out) => {
      const k = Math.min(240 / b, 160 / a), x0 = 30, y0 = 180;
      const pts = `${x0},${y0} ${x0 + b * k},${y0} ${x0},${y0 - a * k}`;
      add(svg, s("polygon", { points: pts, class: "tri" }), s("path", { d: `M${x0} ${y0 - 12}h12v12`, class: "thin" }));
      const c = Math.hypot(a, b);
      add(svg, s("text", { x: x0 - 8, y: y0 - a * k / 2, class: "lbl end" }, a), s("text", { x: x0 + b * k / 2, y: y0 + 16, class: "lbl mid" }, b), s("text", { x: x0 + b * k / 2 + 8, y: y0 - a * k / 2 - 4, class: "lbl" }, "c = " + fmt(r2(c))));
      const isInt = Number.isInteger(c);
      add(out, line(kv("Pythagoras", tex(`c^2 = ${a}^2 + ${b}^2 = ${a * a + b * b}`)), kv("Hypotenuse", tex(isInt ? `c = ${c}` : `c = \\sqrt{${a * a + b * b}} \\approx ${r2(c)}`), isInt ? "pos" : ""), kv("Area", tex(`\\tfrac{1}{2} \\cdot ${a} \\cdot ${b} = ${fmt(a * b / 2)}`))), a === b ? h("div", { class: "wsmall" }, `45-45-90: c = ${a}√2`) : isInt ? h("div", { class: "wsmall" }, "A Pythagorean triple!") : null);
    });
  };

  QW.polygon = () => frame([slider("n", "Number of sides", 3, 12, 1, 6)], 300, 200, ({ n }, svg, out) => {
    const cx = 150, cy = 100, r = 85, pts = Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI - Math.PI / 2; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });
    add(svg, s("polygon", { points: pts.map(p => p.join(",")).join(" "), class: "tri" }));
    for (let i = 2; i < n; i++) add(svg, s("line", { x1: pts[0][0], y1: pts[0][1], x2: pts[i][0], y2: pts[i][1], class: "dash" }));
    const sum = (n - 2) * 180;
    add(out, line(kv("Triangles from one corner", n - 2), kv("Angle sum", `(${n} − 2) × 180 = ${sum}°`), kv("Each angle (regular)", fmt(r2(sum / n)) + "°"), kv("Each exterior", fmt(r2(360 / n)) + "°")));
  });

  QW.circle = () => frame([slider("r", "Radius", 1, 10, 1, 6), slider("t", "Central angle", 10, 360, 10, 90, v => v + "°")], 300, 200, ({ r, t }, svg, out) => {
    const cx = 150, cy = 100, R = 80, a = t * Math.PI / 180;
    add(svg, s("circle", { cx, cy, r: R, class: "slice" }));
    const x2 = cx + R * Math.cos(-a), y2 = cy + R * Math.sin(-a);
    add(svg, t >= 360 ? s("circle", { cx, cy, r: R, class: "fillA" }) : s("path", { d: `M${cx} ${cy} L${cx + R} ${cy} A${R} ${R} 0 ${t > 180 ? 1 : 0} 0 ${x2} ${y2} Z`, class: "fillA" }));
    add(svg, s("text", { x: cx + 18, y: cy - 6, class: "lbl" }, t + "°"), s("text", { x: cx + R / 2, y: cy + 16, class: "lbl mid" }, "r = " + r));
    const frac = t / 360, g = gcd(t, 360);
    add(out, line(kv("Fraction of circle", `${t}/360 = ${t / g}/${360 / g}`), kv("Arc length", tex(`${fmt(r2(frac * 2 * r))}\\pi \\approx ${r2(frac * 2 * Math.PI * r)}`)), kv("Sector area", tex(`${fmt(r2(frac * r * r))}\\pi \\approx ${r2(frac * Math.PI * r * r)}`))), h("div", { class: "wsmall" }, `Whole circle: circumference ${2 * r}π, area ${r * r}π.`));
  });

  QW.box = () => frame([slider("l", "Length", 1, 12, 1, 4), slider("w", "Width", 1, 12, 1, 3), slider("h", "Height", 1, 12, 1, 12)], 300, 200, ({ l, w, h: hh }, svg, out) => {
    const k = Math.min(150 / (l + w * 0.6), 140 / (hh + w * 0.5)), L = l * k, W = w * k * 0.6, H = hh * k, x0 = 40, y0 = 185;
    const P = (x, y) => `${x},${y}`;
    add(svg, s("polygon", { points: [P(x0, y0), P(x0 + L, y0), P(x0 + L, y0 - H), P(x0, y0 - H)].join(" "), class: "tri" }));
    add(svg, s("polygon", { points: [P(x0, y0 - H), P(x0 + W, y0 - H - W * 0.8), P(x0 + L + W, y0 - H - W * 0.8), P(x0 + L, y0 - H)].join(" "), class: "slice" }));
    add(svg, s("polygon", { points: [P(x0 + L, y0), P(x0 + L + W, y0 - W * 0.8), P(x0 + L + W, y0 - H - W * 0.8), P(x0 + L, y0 - H)].join(" "), class: "slice" }));
    add(svg, s("line", { x1: x0, y1: y0, x2: x0 + L + W, y2: y0 - H - W * 0.8, class: "curveA" }));
    const d = Math.sqrt(l * l + w * w + hh * hh);
    add(out, line(kv("Volume", `${l}·${w}·${hh} = ${l * w * hh}`), kv("Surface area", `2(${l * w} + ${l * hh} + ${w * hh}) = ${2 * (l * w + l * hh + w * hh)}`), kv("Diagonal", Number.isInteger(d) ? String(d) : `√${l * l + w * w + hh * hh} ≈ ${r2(d)}`, "pos")));
  });

  QW.dotplot = () => {
    let data = [2, 4, 4, 5, 7, 9];
    const wrap = h("div", { class: "widget" });
    const draw = () => {
      const svg = s("svg", { viewBox: "0 0 320 150", class: "wsvg" }), X = v => 20 + v * 28;
      add(svg, s("line", { x1: 10, x2: 310, y1: 120, y2: 120, class: "axis" }));
      for (let v = 0; v <= 10; v++) { add(svg, s("text", { x: X(v), y: 140, class: "lbl mid small" }, v)); const n = data.filter(x => x === v).length; for (let i = 0; i < n; i++) add(svg, s("circle", { cx: X(v), cy: 110 - i * 14, r: 6, class: "dotA" })); }
      const sorted = data.slice().sort((a, b) => a - b), n = data.length, mean = data.reduce((a, b) => a + b, 0) / n;
      const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const sd = Math.sqrt(data.reduce((t, x) => t + (x - mean) ** 2, 0) / n);
      add(svg, s("line", { x1: X(mean), x2: X(mean), y1: 10, y2: 125, class: "curveA" }), s("text", { x: X(mean) + 4, y: 20, class: "lbl small" }, "mean"));
      add(svg, s("line", { x1: X(med), x2: X(med), y1: 30, y2: 125, class: "dash" }), s("text", { x: X(med) + 4, y: 40, class: "lbl small" }, "median"));
      const counts = {}; data.forEach(x => counts[x] = (counts[x] || 0) + 1); const top = Math.max(...Object.values(counts)), modes = Object.keys(counts).filter(k => counts[k] === top);
      wrap.replaceChildren(
        h("div", { class: "wsmall" }, "Tap a number to add a value. Tap a dot's number with \"remove\" on to take one away."),
        h("div", { class: "wkeys" }, Array.from({ length: 11 }, (_, v) => h("button", { type: "button", onclick: () => { if (rm) { const i = data.indexOf(v); if (i >= 0 && data.length > 1) data.splice(i, 1); } else if (data.length < 30) data.push(v); draw(); } }, v)),
          h("button", { type: "button", class: rm ? "on" : "", onclick: () => { rm = !rm; draw(); } }, rm ? "remove: on" : "remove")),
        svg,
        h("div", { class: "wout" }, line(kv("Values", sorted.join(", ")), kv("Mean", fmt(r2(mean))), kv("Median", fmt(med)), kv("Mode", modes.join(", ")), kv("Range", sorted[n - 1] - sorted[0]), kv("SD", fmt(r2(sd))))));
    };
    let rm = false; draw(); return wrap;
  };

  QW.boxplot = () => {
    const wrap = h("div", { class: "widget" });
    const inp = h("input", { class: "winput", value: "2, 4, 5, 7, 8, 10, 12, 15", "aria-label": "Data" });
    const svg = s("svg", { viewBox: "0 0 320 110", class: "wsvg" }), out = h("div", { class: "wout" });
    const median = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
    const draw = () => {
      const d = inp.value.split(/[ ,;]+/).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
      svg.replaceChildren(); out.replaceChildren();
      if (d.length < 4) { add(out, h("div", { class: "wsmall" }, "Type at least 4 numbers.")); return; }
      const n = d.length, lo = d.slice(0, Math.floor(n / 2)), hi = d.slice(Math.ceil(n / 2));
      const q1 = median(lo), q2 = median(d), q3 = median(hi), mn = d[0], mx = d[n - 1], X = v => 20 + (v - mn) / ((mx - mn) || 1) * 280;
      add(svg, s("line", { x1: X(mn), x2: X(q1), y1: 50, y2: 50, class: "axis" }), s("line", { x1: X(q3), x2: X(mx), y1: 50, y2: 50, class: "axis" }));
      add(svg, s("rect", { x: X(q1), y: 30, width: X(q3) - X(q1), height: 40, class: "fillA", rx: 4 }), s("line", { x1: X(q2), x2: X(q2), y1: 30, y2: 70, class: "curve" }));
      [mn, mx].forEach(v => add(svg, s("line", { x1: X(v), x2: X(v), y1: 40, y2: 60, class: "axis" })));
      [["min", mn], ["Q1", q1], ["median", q2], ["Q3", q3], ["max", mx]].forEach(([t, v], i) => add(svg, s("text", { x: X(v), y: i % 2 ? 22 : 92, class: "lbl mid small" }, `${t} ${fmt(v)}`)));
      add(out, line(kv("Q1", fmt(q1)), kv("Median", fmt(q2)), kv("Q3", fmt(q3)), kv("IQR", fmt(r2(q3 - q1)), "pos"), kv("Range", fmt(mx - mn))));
    };
    inp.addEventListener("input", draw);
    wrap.append(h("div", { class: "wsmall" }, "Change the data and watch the box move:"), inp, svg, out); draw(); return wrap;
  };

  QW.normal = () => frame([slider("k", "Shade within ± k SD", 0.5, 3, 0.5, 1)], 320, 170, ({ k }, svg, out) => {
    const X = z => 160 + z * 45, Y = z => 140 - Math.exp(-z * z / 2) * 115;
    let d = `M${X(-k)} 140`; for (let z = -k; z <= k + 1e-9; z += 0.05) d += ` L${X(z)} ${Y(z)}`; d += ` L${X(k)} 140 Z`;
    add(svg, s("path", { d, class: "fillA" }));
    let c = ""; for (let z = -3.5; z <= 3.5; z += 0.05) c += (c ? " L" : "M") + `${X(z)} ${Y(z)}`;
    add(svg, s("path", { d: c, class: "curve" }), s("line", { x1: 0, x2: 320, y1: 140, y2: 140, class: "axis" }));
    for (let z = -3; z <= 3; z++) add(svg, s("text", { x: X(z), y: 158, class: "lbl mid small" }, z === 0 ? "mean" : (z > 0 ? "+" : "") + z));
    // erf approximation
    const erf = x => { const t = 1 / (1 + 0.3275911 * x); return 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); };
    const p = erf(k / Math.SQRT2) * 100;
    add(out, line(kv("Within ±" + k + " SD", r2(p) + "%", "pos"), kv("Above +" + k + " SD", r2((100 - p) / 2) + "%"), kv("Rule of thumb", "68 · 95 · 99.7")));
  });

  QW.combo = () => frame([slider("n", "n (things)", 1, 10, 1, 5), slider("k", "k (chosen)", 0, 10, 1, 3)], 320, 70, ({ n, k }, svg, out) => {
    k = Math.min(k, n);
    const fact = m => m <= 1 ? 1 : m * fact(m - 1), P = fact(n) / fact(n - k), C = P / fact(k);
    const letters = "ABCDEFGHIJ".slice(0, n).split("");
    letters.forEach((L, i) => add(svg, s("circle", { cx: 20 + i * 30, cy: 30, r: 12, class: i < k ? "dotA" : "slice" }), s("text", { x: 20 + i * 30, y: 35, class: "lbl mid small" }, L)));
    const combos = []; const go = (start, cur) => { if (combos.length >= 12) return; if (cur.length === k) { combos.push(cur.join("")); return; } for (let i = start; i < n; i++) go(i + 1, [...cur, letters[i]]); }; go(0, []);
    add(out, line(kv("Order matters", tex(`{}_{${n}}P_{${k}} = \\frac{${n}!}{${n - k}!} = ${P}`)), kv("Order doesn't", tex(`\\binom{${n}}{${k}} = \\frac{${P}}{${k}!} = ${C}`), "pos")), h("div", { class: "wsmall" }, `Every group of ${k} can be arranged in ${k}! = ${fact(k)} ways, so P = C × ${fact(k)}. Groups: ${combos.join(", ")}${C > 12 ? " …" : ""}`));
  });

  QW.venn = () => frame([slider("a", "P(A)", 0, 1, 0.05, 0.5), slider("b", "P(B)", 0, 1, 0.05, 0.4), slider("ab", "P(A and B)", 0, 1, 0.05, 0.2)], 320, 170, ({ a, b, ab }, svg, out) => {
    ab = Math.min(ab, a, b); const lo = Math.max(0, a + b - 1); if (ab < lo) ab = lo;
    add(svg, s("rect", { x: 5, y: 5, width: 310, height: 160, rx: 10, class: "slice" }));
    add(svg, s("circle", { cx: 125, cy: 85, r: 62, class: "vennA" }), s("circle", { cx: 195, cy: 85, r: 62, class: "vennB" }));
    add(svg, s("text", { x: 92, y: 90, class: "lbl mid" }, r2(a - ab)), s("text", { x: 160, y: 90, class: "lbl mid" }, r2(ab)), s("text", { x: 228, y: 90, class: "lbl mid" }, r2(b - ab)), s("text", { x: 290, y: 155, class: "lbl mid small" }, r2(1 - a - b + ab)), s("text", { x: 80, y: 30, class: "lbl" }, "A"), s("text", { x: 232, y: 30, class: "lbl" }, "B"));
    const ind = Math.abs(a * b - ab) < 0.001;
    add(out, line(kv("P(A or B)", `${a} + ${b} − ${r2(ab)} = ${r2(a + b - ab)}`, "pos"), kv("Neither", r2(1 - a - b + ab)), kv("Independent?", ind ? "yes: P(A)·P(B) = P(A and B)" : `no: P(A)·P(B) = ${r2(a * b)}`)));
  });

  QW.chart = () => {
    const data = [["2019", 120], ["2020", 90], ["2021", 135], ["2022", 162], ["2023", 150]];
    let sel = 3;
    const wrap = h("div", { class: "widget" });
    const draw = () => {
      const svg = s("svg", { viewBox: "0 0 320 180", class: "wsvg" });
      data.forEach(([y, v], i) => { const hh = v / 180 * 130, x = 20 + i * 60; const g = s("g", { class: "tap" }); g.append(s("rect", { x, y: 150 - hh, width: 42, height: hh, rx: 5, class: i === sel ? "barA" : "bar" }), s("text", { x: x + 21, y: 144 - hh, class: "lbl mid small" }, v), s("text", { x: x + 21, y: 168, class: "lbl mid small" }, y)); g.addEventListener("click", () => { sel = i; draw(); }); add(svg, g); });
      const [y, v] = data[sel], prev = data[sel - 1];
      wrap.replaceChildren(h("div", { class: "wsmall" }, "Sales (thousands of units). Tap a bar."), svg,
        h("div", { class: "wout" }, line(kv(y, v + " thousand"), prev ? kv(`Change from ${prev[0]}`, `${v - prev[1] > 0 ? "+" : ""}${v - prev[1]} → ${r2((v - prev[1]) / prev[1] * 100)}%`, v >= prev[1] ? "pos" : "neg") : kv("Change", "first year")),
          h("div", { class: "wsmall" }, "Try it: which year had the biggest percent increase? (2021: +50%, because it started from a low 90.)")));
    };
    draw(); return wrap;
  };

  QW.plugin = () => {
    const pairs = [["x²", "x", x => x * x, x => x], ["x³", "x²", x => x ** 3, x => x * x], ["1/x", "x", x => 1 / x, x => x], ["2x", "x + 2", x => 2 * x, x => x + 2], ["√x", "x", x => Math.sqrt(x), x => x], ["x/2", "−x", x => x / 2, x => -x]];
    let sel = 0;
    const wrap = h("div", { class: "widget" });
    const draw = () => {
      const [an, bn, fa, fb] = pairs[sel], xs = [-2, -1, -0.5, 0, 0.5, 1, 2, 10];
      const rows = xs.map(x => { const A = fa(x), B = fb(x); const ok = isFinite(A) && isFinite(B); return [x, ok ? r2(A) : "–", ok ? r2(B) : "–", !ok ? "–" : A > B ? "A" : A < B ? "B" : "="]; });
      const res = new Set(rows.map(r => r[3]).filter(x => x !== "–"));
      wrap.replaceChildren(
        h("div", { class: "wseg" }, pairs.map((p, i) => h("button", { type: "button", class: i === sel ? "on" : "", onclick: () => { sel = i; draw(); } }, `${p[0]} vs ${p[1]}`))),
        h("table", { class: "wtable" }, h("tr", {}, h("th", {}, "x"), h("th", {}, "A: " + an), h("th", {}, "B: " + bn), h("th", {}, "Bigger")), rows.map(r => h("tr", {}, r.map((c, j) => h("td", { class: j === 3 ? "c" + (c === "A" ? "A" : c === "B" ? "B" : "") : "" }, String(c)))))),
        h("div", { class: "wout" }, line(kv("Verdict with no limits on x", res.size > 1 ? "(D) can't be determined" : res.has("A") ? "(A)" : res.has("B") ? "(B)" : "(C)", "pos")), h("div", { class: "wsmall" }, "Always test 0, 1, −1, a fraction and a big number.")));
    };
    draw(); return wrap;
  };


  /* ---------- data graphs for questions (bar, line, pie, scatter, table) ---------- */
  const COLORS = ["#2F6FED", "#E0A100", "#0E8F80", "#D64545", "#7C5CBF"];
  const nice = m => { const raw = m / 5, p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  window.QCHART = spec => {
    if (spec.type === "table") return h("div", { class: "dchart" }, h("div", { class: "dtitle" }, spec.title), h("div", { class: "dtable-wrap" }, h("table", { class: "dtable" }, h("tr", {}, spec.head.map(c => h("th", {}, c))), spec.rows.map(r => h("tr", {}, r.map((c, i) => h(i ? "td" : "th", {}, typeof c === "number" ? c.toLocaleString("en-US") : c)))))));
    const W = 340, H = 220, L = 42, R = 10, Tp = 14, B = 40, svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "wsvg dsvg", role: "img", "aria-label": spec.title });
    if (spec.type === "pie") {
      const cx = 105, cy = 110, r = 88; let a0 = -Math.PI / 2;
      spec.parts.forEach(([name, pct], i) => {
        const a1 = a0 + pct / 100 * 2 * Math.PI, large = pct > 50 ? 1 : 0;
        add(svg, s("path", { d: `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`, fill: COLORS[i % 5], stroke: "#fff", "stroke-width": 2 }));
        const am = (a0 + a1) / 2; if (pct >= 8) add(svg, s("text", { x: cx + r * 0.62 * Math.cos(am), y: cy + r * 0.62 * Math.sin(am) + 4, class: "lbl mid", fill: "#fff", style: "fill:#fff" }, pct + "%"));
        add(svg, s("rect", { x: 212, y: 34 + i * 26, width: 14, height: 14, rx: 3, fill: COLORS[i % 5] }), s("text", { x: 232, y: 46 + i * 26, class: "lbl" }, `${name} ${pct}%`));
        a0 = a1;
      });
      return h("div", { class: "dchart" }, h("div", { class: "dtitle" }, spec.title), svg);
    }
    let xs, ymin = spec.ymin ?? 0, ymax;
    if (spec.type === "scatter") { ymax = spec.ymax ?? Math.max(...spec.points.map(p => p[1])); }
    else ymax = Math.max(...spec.series.flatMap(x => x.values));
    const step = nice((ymax - ymin) || 1); ymax = Math.ceil(ymax / step) * step;
    const Y = v => Tp + (H - Tp - B) * (1 - (v - ymin) / (ymax - ymin));
    for (let v = ymin; v <= ymax + 1e-9; v += step) add(svg, s("line", { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: "grid" }), s("text", { x: L - 6, y: Y(v) + 4, class: "lbl end small" }, fmt(r2(v))));
    add(svg, s("line", { x1: L, x2: L, y1: Tp, y2: H - B, class: "axis" }), s("line", { x1: L, x2: W - R, y1: H - B, y2: H - B, class: "axis" }));
    if (spec.type === "scatter") {
      const xmax = spec.xmax ?? Math.max(...spec.points.map(p => p[0])), xstep = nice(xmax), X = v => L + (W - L - R) * v / xmax;
      for (let v = 0; v <= xmax + 1e-9; v += xstep) add(svg, s("text", { x: X(v), y: H - B + 16, class: "lbl mid small" }, fmt(v)));
      spec.points.forEach(([x, y]) => add(svg, s("circle", { cx: X(x), cy: Y(y), r: 4.5, fill: COLORS[0], "fill-opacity": .8, stroke: "#fff" })));
      add(svg, s("text", { x: (L + W) / 2, y: H - 6, class: "lbl mid small" }, spec.x), s("text", { x: 10, y: Tp - 2, class: "lbl small" }, spec.y));
      return h("div", { class: "dchart" }, h("div", { class: "dtitle" }, spec.title), svg);
    }
    const n = spec.labels.length, slot = (W - L - R) / n, ns = spec.series.length;
    spec.labels.forEach((t, i) => add(svg, s("text", { x: L + slot * (i + 0.5), y: H - B + 16, class: "lbl mid small" }, t)));
    if (spec.type === "bar") {
      const bw = Math.min(34, slot * 0.7 / ns);
      spec.series.forEach((ser, k) => ser.values.forEach((v, i) => { const x = L + slot * (i + 0.5) - bw * ns / 2 + k * bw; add(svg, s("rect", { x: x + 1, y: Y(v), width: bw - 2, height: Y(ymin) - Y(v), rx: 2, fill: COLORS[k] }), s("text", { x: x + bw / 2, y: Y(v) - 4, class: "lbl mid small" }, fmt(v))); }));
    } else {
      spec.series.forEach((ser, k) => { const pts = ser.values.map((v, i) => [L + slot * (i + 0.5), Y(v)]); add(svg, s("polyline", { points: pts.map(p => p.join(",")).join(" "), fill: "none", stroke: COLORS[k], "stroke-width": 2.5 })); pts.forEach((p, i) => add(svg, s("circle", { cx: p[0], cy: p[1], r: 4, fill: COLORS[k], stroke: "#fff" }), s("text", { x: p[0], y: p[1] - 8, class: "lbl mid small" }, fmt(ser.values[i])))); });
    }
    const legend = ns > 1 ? h("div", { class: "dlegend" }, spec.series.map((ser, k) => h("span", {}, h("i", { style: `background:${COLORS[k]}` }), ser.name))) : null;
    return h("div", { class: "dchart" }, h("div", { class: "dtitle" }, spec.title), legend, svg);
  };

  /* ---------- widgets for the new lessons ---------- */
  QW.units = () => frame([slider("b", "Base", 2, 9, 1, 7), slider("n", "Exponent", 1, 40, 1, 22)], 320, 90, ({ b, n }, svg, out) => {
    const cyc = []; let d = b % 10; while (!cyc.includes(d)) { cyc.push(d); d = d * b % 10; }
    const pos = (n - 1) % cyc.length;
    cyc.forEach((c, i) => add(svg, s("circle", { cx: 30 + i * 60, cy: 45, r: 22, class: i === pos ? "fillA" : "slice" }), s("text", { x: 30 + i * 60, y: 51, class: "lbl mid big" }, c)));
    add(out, line(kv("Cycle of units digits", cyc.join(", ") + " (length " + cyc.length + ")"), kv("Units digit", tex(`${b}^{${n}} \\to ${cyc[pos]}`), "pos")), h("div", { class: "wsmall" }, `${n} = ${cyc.length} × ${Math.floor((n - 1) / cyc.length)} + ${pos + 1}: position ${pos + 1} in the cycle.`));
  });
  QW.region = () => frame([slider("m", "Slope m", -3, 3, 0.5, 1), slider("b", "Intercept b", -4, 4, 1, 1), toggle("op", [[">", "y > mx + b"], ["<", "y < mx + b"], [">=", "y ≥ mx + b"], ["<=", "y ≤ mx + b"]], ">")], 280, 280, ({ m, b, op }, svg, out) => {
    const P = plane(svg, 280, 280, -6, 6, -6, 6, 1), up = op[0] === ">";
    const yl = x => m * x + b, d = `M${P.X(-6)} ${P.Y(yl(-6))} L${P.X(6)} ${P.Y(yl(6))} L${P.X(6)} ${P.Y(up ? 7 : -7)} L${P.X(-6)} ${P.Y(up ? 7 : -7)} Z`;
    add(svg, s("path", { d, class: "fillA", style: "stroke:none" }));
    add(svg, s("line", { x1: P.X(-6), y1: P.Y(yl(-6)), x2: P.X(6), y2: P.Y(yl(6)), class: op.length === 1 ? "dash" : "curve", style: op.length === 1 ? "stroke:#2F6FED;stroke-width:2.5" : "" }));
    const inside = up ? (op.length === 1 ? 0 > b : 0 >= b) : (op.length === 1 ? 0 < b : 0 <= b);
    P.dot(0, 0, inside ? "dotB" : "dotA", 6);
    add(out, line(kv("Shaded region", tex(`y ${op.replace(">=", "\\ge").replace("<=", "\\le")} ${m === 0 ? "" : co(m) + "x "}${m === 0 ? b : (b >= 0 ? "+ " : "- ") + Math.abs(b)}`)), kv("Line", op.length === 1 ? "dashed: not included" : "solid: included"), kv("Test (0, 0)", inside ? "inside" : "outside", inside ? "pos" : "neg")));
  });
  QW.similar = () => frame([slider("k", "Scale factor k", 0.5, 3, 0.5, 2)], 320, 170, ({ k }, svg, out) => {
    const tri = (x0, f, cls) => add(svg, s("polygon", { points: `${x0},150 ${x0 + 40 * f},150 ${x0},${150 - 30 * f}`, class: cls }));
    tri(20, 1, "tri"); tri(90, k, "fillA");
    add(svg, s("text", { x: 22, y: 166, class: "lbl small" }, "3-4-5"), s("text", { x: 92, y: 166, class: "lbl small" }, `${fmt(3 * k)}-${fmt(4 * k)}-${fmt(5 * k)}`));
    add(out, line(kv("Lengths", tex(`\\times ${k}`)), kv("Perimeter", tex(`12 \\to ${fmt(12 * k)}`)), kv("Area", tex(`6 \\to ${fmt(r2(6 * k * k))} \;(\\times ${fmt(k * k)})`), "pos"), kv("Volume (solids)", tex(`\\times ${fmt(r2(k ** 3))}`))));
  });
  QW.twoway = () => frame([slider("a", "Girls who play", 0, 60, 5, 40), slider("b", "Girls who don't", 0, 120, 5, 80), slider("c", "Boys who play", 0, 60, 5, 40), slider("d", "Boys who don't", 0, 120, 5, 40)], 320, 150, ({ a, b, c, d }, svg, out) => {
    const rows = [["Girls", a, b], ["Boys", c, d], ["Total", a + c, b + d]], X = [10, 110, 190, 270];
    ["", "Sport", "No sport", "Total"].forEach((t, i) => add(svg, s("text", { x: X[i] + (i ? 30 : 0), y: 24, class: "lbl" + (i ? " mid" : "") }, t)));
    rows.forEach((r, j) => { const y = 56 + j * 34; add(svg, s("line", { x1: 6, x2: 314, y1: y - 22, y2: y - 22, class: "thin" }), s("text", { x: X[0], y, class: "lbl" }, r[0]), s("text", { x: X[1] + 30, y, class: "lbl mid" + (j === 0 ? " big" : "") }, r[1]), s("text", { x: X[2] + 30, y, class: "lbl mid" }, r[2]), s("text", { x: X[3] + 30, y, class: "lbl mid" }, r[1] + r[2])); });
    const tot = a + b + c + d || 1, sport = a + c || 1, girls = a + b || 1;
    const pS = (a + c) / tot, pSg = a / girls;
    add(out, line(kv("P(sport)", tex(`\\frac{${a + c}}{${tot}} = ${r2(pS)}`)), kv("P(sport | girl)", tex(`\\frac{${a}}{${a + b}} = ${r2(pSg)}`), "pos"), kv("P(girl | sport)", tex(`\\frac{${a}}{${a + c}} = ${r2(a / sport)}`))), h("div", { class: "wsmall" }, Math.abs(pS - pSg) < 0.005 ? "Sport and being a girl are independent here: P(sport | girl) = P(sport)." : "Not independent: knowing it's a girl changes the chance of playing a sport."));
  });
  QW.expect = () => frame([slider("p0", "P(win $0)", 0, 1, 0.05, 0.6), slider("p1", "P(win $5)", 0, 1, 0.05, 0.3), slider("cost", "Ticket price ($)", 0, 10, 1, 3)], 320, 160, ({ p0, p1, cost }, svg, out) => {
    p1 = Math.min(p1, 1 - p0); const p2 = Math.max(0, 1 - p0 - p1), vals = [[0, p0], [5, p1], [20, p2]];
    vals.forEach(([v, p], i) => { const hh = p * 110, x = 40 + i * 95; add(svg, s("rect", { x, y: 130 - hh, width: 56, height: hh, rx: 4, class: "barA" }), s("text", { x: x + 28, y: 124 - hh, class: "lbl mid" }, r2(p)), s("text", { x: x + 28, y: 150, class: "lbl mid" }, "$" + v)); });
    const E = vals.reduce((t, [v, p]) => t + v * p, 0);
    add(out, line(kv("P(win $20)", r2(p2) + " (the rest)"), kv("Expected prize", tex(`0(${r2(p0)}) + 5(${r2(p1)}) + 20(${r2(p2)}) = ${r2(E)}`)), kv("Expected gain", tex(`${r2(E)} - ${cost} = ${r2(E - cost)}`), E - cost >= 0 ? "pos" : "neg")));
  });

  window.QW = QW;
})();
