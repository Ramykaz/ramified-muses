/* GRE Quant Prep: lessons with interactive graphics, step-by-step examples, practice, and timed mock tests.
   Progress is kept in this browser (localStorage). Content: l-*.js (window.QL), mock.js (window.QM), widgets.js (window.QW). */
(() => {
  "use strict";
  const app = document.getElementById("app");
  const L = window.QL, BYID = Object.fromEntries(L.map(l => [l.id, l]));
  const UNITS = [...new Set(L.map(l => l.unit))];
  const KEY = "quant.v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  let S = Object.assign({ done: {}, stats: {}, mocks: [], seen: {}, theme: "dark" }, load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } };

  const el = (tag, props, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k === "html") n.innerHTML = v; else if (k === "value") n.value = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c));
    return n;
  };
  // lesson and question text is written by us: HTML like <b>, and maths between ⟦ and ⟧, typeset with KaTeX
  const M = s => String(s ?? "").replace(/⟦([\s\S]+?)⟧/g, (_, tex) => { try { return window.katex.renderToString(tex, { throwOnError: false, strict: false }); } catch (e) { return tex; } });
  const rich = (tag, html, props = {}) => el(tag, { ...props, html: M(html) });
  window.MATH = M;
  const ICONS = { back: '<path d="M15 18l-6-6 6-6"/>', home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2M16 15v3"/>', flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>', next: '<path d="M9 6l6 6-6 6"/>' };
  const ic = (n, s = 22) => rich("span", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`, { class: "ic", style: `--s:${s}px`, "aria-hidden": "true" });
  function toast(m) { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400); }
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let cleanup = null;
  // back: a link for the back arrow ("/prep/" on the home screen goes to Commute Prep), or null during a mock test
  function screen(title, back, ...kids) {
    if (cleanup) { cleanup(); cleanup = null; }
    const home = back === "/prep/";
    app.replaceChildren(el("header", { class: "top" },
      back ? el("a", { class: "icon-b", href: back, "aria-label": home ? "Back to Commute Prep" : "Back" }, ic("back")) : el("span", { class: "logo-q" }, "∑"),
      el("h1", {}, title), el("span", { class: "sp" }),
      back && !home ? el("a", { class: "icon-b", href: "#/", "aria-label": "GRE Quant home" }, ic("home")) : null),
      el("main", { class: "main" }, kids));
    scrollTo(0, 0);
  }

  /* ================= questions ================= */
  const ALLQ = [
    ...L.flatMap(l => l.practice.map((q, i) => ({ ...q, topic: l.id, id: l.id + ":" + i }))),
    ...window.QM.map((q, i) => ({ ...q, id: "m:" + i })),
  ];
  const QC_OPTS = ["Quantity A is greater.", "Quantity B is greater.", "The two quantities are equal.", "The relationship cannot be determined from the information given."];
  const num = v => { v = String(v ?? "").replace(/[,\s$%]/g, "").replace(/−/g, "-"); if (!v) return NaN; if (/^-?\d*\.?\d+\/-?\d*\.?\d+$/.test(v)) { const [a, b] = v.split("/").map(Number); return a / b; } return /^-?\d*\.?\d+$/.test(v) ? Number(v) : NaN; };
  function isRight(q, ans) {
    if (ans == null) return false;
    if (q.t === "ne") { const a = num(q.a), b = num(ans); return Number.isFinite(b) && Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a)); }
    if (q.t === "ma") return Array.isArray(ans) && ans.slice().sort().join() === q.a.slice().sort().join();
    return ans === q.a;
  }
  const answerText = q => q.t === "ne" ? (String(q.a).includes("/") ? "⟦\\tfrac{" + q.a.split("/")[0] + "}{" + q.a.split("/")[1] + "}⟧" : q.a) + (q.unit ? " " + q.unit : "") : q.t === "qc" ? QC_OPTS[q.a] : q.t === "ma" ? q.a.map(i => q.o[i]).join(", ") : q.o[q.a];
  const TYPE = { mc: "Select one answer", ma: "Select all that apply", qc: "Quantitative Comparison", ne: "Numeric entry" };
  // draws a question; onChange(answer) is called when the student picks; locked shows the result
  function questionView(q, ans, onChange, locked) {
    const wrap = el("div", { class: "qv", "data-q": q.id || "" });
    wrap.append(el("div", { class: "qtype" }, TYPE[q.t]));
    if (q.t === "qc") {
      if (q.q) wrap.append(rich("div", q.q, { class: "qc-given" }));
      wrap.append(el("div", { class: "qc-grid" }, el("div", { class: "qc-box" }, el("small", {}, "Quantity A"), rich("div", q.A)), el("div", { class: "qc-box" }, el("small", {}, "Quantity B"), rich("div", q.B))));
    } else wrap.append(rich("div", q.q, { class: "qtext" }));
    if (q.fig && window.FIG[q.fig]) wrap.append(rich("div", window.FIG[q.fig], { class: "figwrap" }));
    const opts = q.t === "qc" ? QC_OPTS : q.o;
    if (q.t === "ne") {
      const frac = String(q.a).includes("/");
      const box = el("div", { class: "ne" });
      if (frac) {
        const [n0, d0] = String(ans ?? "").split("/");
        const a = el("input", { class: "ne-in", inputmode: "numeric", "aria-label": "Numerator", value: n0 || "", disabled: locked }), b = el("input", { class: "ne-in", inputmode: "numeric", "aria-label": "Denominator", value: d0 || "", disabled: locked });
        const ch = () => onChange(a.value.trim() && b.value.trim() ? `${a.value.trim()}/${b.value.trim()}` : null);
        a.addEventListener("input", ch); b.addEventListener("input", ch);
        box.append(el("div", { class: "frac" }, a, el("hr"), b), el("span", { class: "muted" }, "Enter a fraction (it doesn't need to be in lowest terms)."));
      } else {
        const a = el("input", { class: "ne-in wide", inputmode: "decimal", "aria-label": "Your answer", value: ans ?? "", disabled: locked });
        a.addEventListener("input", () => onChange(a.value.trim() || null));
        box.append(el("div", { class: "row-l" }, a, q.unit ? el("b", {}, q.unit) : null));
      }
      wrap.append(box);
    } else {
      const multi = q.t === "ma";
      const isOn = i => multi ? (ans || []).includes(i) : ans === i;
      const btns = opts.map((o, i) => {
        const right = locked && (multi ? q.a.includes(i) : q.a === i), wrong = locked && isOn(i) && !right;
        return el("button", { type: "button", class: "opt" + (isOn(i) ? " on" : "") + (right ? " right" : "") + (wrong ? " wrong" : ""), disabled: locked, "aria-pressed": isOn(i) ? "true" : "false",
          onclick: () => {
            if (multi) { const set = new Set(ans || []); set.has(i) ? set.delete(i) : set.add(i); ans = [...set].sort(); } else ans = i;
            btns.forEach((b, k) => { b.classList.toggle("on", isOn(k)); b.setAttribute("aria-pressed", isOn(k) ? "true" : "false"); });
            onChange(multi ? (ans.length ? ans : null) : i);
          } },
          el("span", { class: multi ? "box" : "radio" }, multi ? "" : "ABCDE"[i]), rich("span", o, { class: "ot" }));
      });
      wrap.append(el("div", { class: "opts" + (q.t === "qc" ? " qc" : "") }, btns));
    }
    return wrap;
  }
  function record(q, ok) { const t = S.stats[q.topic] || (S.stats[q.topic] = { n: 0, ok: 0 }); t.n++; if (ok) t.ok++; S.seen[q.id] = Date.now(); save(); }

  /* ================= home ================= */
  function home() {
    const done = L.filter(l => S.done[l.id]).length;
    const tot = Object.values(S.stats).reduce((t, x) => ({ n: t.n + x.n, ok: t.ok + x.ok }), { n: 0, ok: 0 });
    const next = L.find(l => !S.done[l.id]) || L[0];
    const lastMock = S.mocks[S.mocks.length - 1];
    screen("GRE Quant", "/prep/",
      el("section", { class: "hero" }, el("div", { class: "lbl" }, "GRE Quantitative Reasoning"), el("h2", {}, "Learn it, try it, test it."),
        el("div", { class: "stats3" }, el("div", {}, el("b", {}, `${done}/${L.length}`), el("small", {}, "lessons")), el("div", {}, el("b", {}, tot.n ? Math.round(tot.ok / tot.n * 100) + "%" : "–"), el("small", {}, `right of ${tot.n}`)), el("div", {}, el("b", {}, lastMock ? lastMock.est : "–"), el("small", {}, "last mock (est.)")))),
      el("a", { class: "btn wide", href: "#/l/" + next.id }, ic("book"), done ? "Continue: " + next.title : "Start: " + next.title),
      el("div", { class: "tiles" },
        el("a", { class: "tile", href: "#/mock" }, ic("clock", 26), el("b", {}, "Mock test"), el("small", {}, "Timed, GRE-style")),
        el("a", { class: "tile", href: "#/drill" }, ic("bolt", 26), el("b", {}, "Quick drill"), el("small", {}, "10 mixed questions")),
        el("a", { class: "tile", href: "#/formulas" }, ic("list", 26), el("b", {}, "Formula sheet"), el("small", {}, "Every rule")),
        el("a", { class: "tile", href: "#/stats" }, ic("chart", 26), el("b", {}, "Progress"), el("small", {}, "By topic"))),
      UNITS.map(u => el("section", { class: "box" }, el("div", { class: "lbl" }, u),
        L.filter(l => l.unit === u).map(l => { const st = S.stats[l.id]; return el("a", { class: "lrow" + (S.done[l.id] ? " done" : ""), href: "#/l/" + l.id },
          el("span", { class: "lnum" }, S.done[l.id] ? ic("check", 18) : String(L.indexOf(l) + 1)),
          el("span", { class: "lmain" }, el("b", {}, l.title), el("small", {}, `${l.mins} min · ${l.practice.length} questions`)),
          st && st.n ? el("span", { class: "lpct" + (st.ok / st.n >= 0.7 ? " good" : "") }, Math.round(st.ok / st.n * 100) + "%") : null); }))),
      el("p", { class: "foot" }, `${L.length} lessons · ${ALLQ.length} questions · Saved on this device`));
  }

  /* ================= lesson ================= */
  function lesson(id) {
    const l = BYID[id]; if (!l) return home();
    const i = L.indexOf(l), prev = L[i - 1], next = L[i + 1];
    const widget = window.QW[l.widget] ? window.QW[l.widget]() : null;
    screen(l.title, "#/",
      el("div", { class: "lbl" }, `${l.unit} · lesson ${i + 1} of ${L.length} · ${l.mins} min`),
      el("section", { class: "idea" }, el("small", {}, "The big idea"), rich("p", l.idea)),
      l.learn.map((x, k) => el("section", { class: "box learn" }, el("h3", {}, el("span", { class: "n" }, k + 1), x.h), rich("p", x.html))),
      widget ? el("section", { class: "box" }, el("div", { class: "lbl" }, "Try it: move the sliders"), widget) : null,
      el("section", { class: "box" }, el("div", { class: "lbl" }, "Rules to remember"), el("div", { class: "rules" }, l.rules.map(r => rich("span", "⟦\\displaystyle " + r + "⟧", { class: "rule" })))),
      el("div", { class: "lbl" }, "Worked examples: step by step"),
      l.examples.map((ex, k) => example(ex, k)),
      el("section", { class: "box tips" }, el("div", { class: "lbl" }, "Tips"), el("ul", {}, l.tips.map(t => rich("li", t)))),
      el("section", { class: "box traps" }, el("div", { class: "lbl" }, "Traps"), el("ul", {}, l.traps.map(t => rich("li", t)))),
      el("a", { class: "btn wide", href: "#/p/" + l.id, onclick: () => { S.done[l.id] = true; save(); } }, `Practice: ${l.practice.length} questions`, ic("next")),
      el("div", { class: "row spread" }, prev ? el("a", { class: "btn", href: "#/l/" + prev.id }, ic("back", 18), prev.title) : el("span"), next ? el("a", { class: "btn", href: "#/l/" + next.id }, next.title, ic("next", 18)) : el("span")));
  }
  function example(ex, k) {
    let shown = 0;
    const box = el("section", { class: "box ex" });
    const draw = () => box.replaceChildren(...[
      el("div", { class: "ex-h" }, el("span", { class: "badge" }, "Example " + (k + 1))),
      rich("div", ex.q, { class: "qtext" }),
      ex.fig && window.FIG[ex.fig] ? rich("div", window.FIG[ex.fig], { class: "figwrap" }) : null,
      el("ol", { class: "steps" }, ex.steps.slice(0, shown).map(s => rich("li", s))),
      shown >= ex.steps.length ? rich("div", "<small>Answer</small> " + ex.a, { class: "ans" }) : null,
      el("div", { class: "row" },
        shown < ex.steps.length ? el("button", { class: "btn gold", type: "button", onclick: () => { shown++; draw(); } }, shown ? `Next step (${shown + 1}/${ex.steps.length})` : "Show step 1") : null,
        shown < ex.steps.length ? el("button", { class: "btn", type: "button", onclick: () => { shown = ex.steps.length; draw(); } }, "Show all") : el("button", { class: "btn", type: "button", onclick: () => { shown = 0; draw(); } }, "Hide steps"))].filter(Boolean));
    draw(); return box;
  }

  /* ================= practice (feedback after each question) ================= */
  function practice(title, qs, back) {
    let i = 0, ans = null, checked = false, right = 0;
    const draw = () => {
      const q = qs[i];
      const ok = checked && isRight(q, ans);
      screen(title, back,
        el("div", { class: "prog" }, el("span", {}, `Question ${i + 1} of ${qs.length}`), el("span", {}, `${right} right`)),
        el("div", { class: "bar" }, el("i", { style: `width:${(i + (checked ? 1 : 0)) / qs.length * 100}%` })),
        el("section", { class: "box" }, questionView(q, ans, v => { ans = v; btn.disabled = v == null; }, checked)),
        checked ? el("section", { class: "box why " + (ok ? "good" : "bad") }, el("b", {}, ok ? "Correct!" : "Not quite."), ok ? null : rich("div", "Answer: <b>" + answerText(q) + "</b>"), rich("p", q.why), q.topic && BYID[q.topic] ? el("a", { class: "muted small-link", href: "#/l/" + q.topic }, "Lesson: " + BYID[q.topic].title) : null) : null,
        btn);
    };
    const btn = el("button", { class: "btn wide", type: "button", disabled: true, onclick: () => {
      if (!checked) { checked = true; const ok = isRight(qs[i], ans); if (ok) right++; record(qs[i], ok); btn.textContent = i < qs.length - 1 ? "Next question" : "See my score"; btn.disabled = false; draw(); }
      else if (i < qs.length - 1) { i++; ans = null; checked = false; btn.textContent = "Check"; btn.disabled = true; draw(); }
      else done();
    } }, "Check");
    const done = () => screen(title, back, el("section", { class: "box center" }, el("div", { class: "big" }, `${right} / ${qs.length}`), el("p", { class: "muted" }, right === qs.length ? "Perfect!" : right >= qs.length * 0.7 ? "Good work." : "Read the lesson again, then try the drill.")),
      el("button", { class: "btn wide", type: "button", onclick: () => practice(title, shuffle(qs), back) }, "Try again"), el("a", { class: "btn", href: back }, "Back"));
    draw();
  }
  function drill() {
    // more questions from weak or unseen topics
    const w = q => { const st = S.stats[q.topic]; const acc = st && st.n ? st.ok / st.n : 0.5; return (1.3 - acc) * (S.seen[q.id] ? 0.6 : 1) * Math.random(); };
    practice("Quick drill", ALLQ.slice().sort((a, b) => w(b) - w(a)).slice(0, 10), "#/");
  }

  /* ================= mock test ================= */
  function mockStart() {
    screen("Mock test", "#/",
      el("section", { class: "box" }, el("p", {}, "Like the real GRE: questions are not marked until the end, you can move back and forth, mark questions to come back to, and use the calculator."),
        el("ul", { class: "plain" }, el("li", {}, "Quantitative Comparison questions come first in each section."), el("li", {}, "Numeric entry: type a number or a fraction."), el("li", {}, "Your score is a rough estimate on the 130–170 scale."))),
      el("button", { class: "btn wide", type: "button", onclick: () => mock([[12, 21], [15, 26]]) }, ic("clock"), "Full test: 27 questions, 47 min"),
      el("button", { class: "btn", type: "button", onclick: () => mock([[12, 21]]) }, "Short test: 12 questions, 21 min"),
      S.mocks.length ? el("section", { class: "box" }, el("div", { class: "lbl" }, "Your mock tests"), S.mocks.slice(-8).reverse().map(m => el("div", { class: "lrow" }, el("span", { class: "lmain" }, el("b", {}, `${m.raw}/${m.n} · about ${m.est}`), el("small", {}, new Date(m.at).toLocaleDateString() + ` · ${Math.round(m.secs / 60)} min`))))) : null);
  }
  function pickSection(n, used) {
    // GRE-like mix: about a third Quantitative Comparison first, the rest mixed, spread over the four areas
    const unitOf = q => (BYID[q.topic] || {}).unit;
    const fresh = ALLQ.filter(q => !used.has(q.id)).sort((a, b) => (S.seen[a.id] || 0) - (S.seen[b.id] || 0) + (Math.random() - 0.5) * 6e8);
    // like the GRE: about 1/3 comparison, then mostly one-answer, a few select-all and numeric entry
    const nqc = Math.round(n / 3), nr = n - nqc, cap = { mc: nr, ma: Math.max(1, Math.round(nr / 5)), ne: Math.max(1, Math.round(nr / 4)) };
    const qc = [], rest = [], per = {}, typ = {};
    for (const q of fresh) {
      const u = unitOf(q); if ((per[u] || 0) >= Math.ceil(n / 3)) continue;
      if (q.t === "qc" && qc.length < nqc) { qc.push(q); per[u] = (per[u] || 0) + 1; }
      else if (q.t !== "qc" && rest.length < nr && (typ[q.t] || 0) < cap[q.t]) { rest.push(q); per[u] = (per[u] || 0) + 1; typ[q.t] = (typ[q.t] || 0) + 1; }
      if (qc.length + rest.length >= n) break;
    }
    // top up if the mix rules left gaps
    for (const q of fresh) { if (qc.length + rest.length >= n) break; if (!qc.includes(q) && !rest.includes(q)) (q.t === "qc" && qc.length < nqc + 1 ? qc : rest).push(q); }
    const out = [...qc, ...shuffle(rest)]; out.forEach(q => used.add(q.id)); return out;
  }
  function mock(plan) {
    const used = new Set(), sections = plan.map(([n, min]) => ({ qs: pickSection(n, used), min, ans: {}, marked: {} }));
    let si = 0, qi = 0, left = sections[0].min * 60, startedAt = Date.now(), calcOpen = false;
    const timer = setInterval(() => { left--; const t = document.getElementById("tmr"); if (t) { t.textContent = fmtT(left); t.classList.toggle("low", left <= 120); } if (left <= 0) endSection(true); }, 1000);
    const fmtT = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
    cleanup = () => clearInterval(timer);
    const sec = () => sections[si];
    function draw() {
      const q = sec().qs[qi];
      const keepCleanup = cleanup; cleanup = null;
      screen(`Section ${si + 1} of ${sections.length}`, null,
        el("div", { class: "mockbar" }, el("span", { id: "tmr", class: "tmr" }, ic("clock", 16), fmtT(left)), el("span", {}, `Question ${qi + 1} of ${sec().qs.length}`),
          el("button", { class: "icon-b sm" + (sec().marked[qi] ? " on" : ""), "aria-label": "Mark for review", onclick: () => { sec().marked[qi] = !sec().marked[qi]; draw(); } }, ic("flag", 18)),
          el("button", { class: "icon-b sm" + (calcOpen ? " on" : ""), "aria-label": "Calculator", onclick: () => { calcOpen = !calcOpen; draw(); } }, ic("calc", 18))),
        calcOpen ? calculator(v => { if (q.t === "ne" && !String(q.a).includes("/")) { sec().ans[qi] = v; draw(); } }) : null,
        el("section", { class: "box" }, questionView(q, sec().ans[qi], v => { if (v == null) delete sec().ans[qi]; else sec().ans[qi] = v; }, false)),
        el("div", { class: "row spread" }, el("button", { class: "btn", type: "button", disabled: qi === 0, onclick: () => { qi--; draw(); } }, ic("back", 18), "Back"),
          el("button", { class: "btn", type: "button", onclick: review }, "Review"),
          qi < sec().qs.length - 1 ? el("button", { class: "btn gold", type: "button", onclick: () => { qi++; draw(); } }, "Next", ic("next", 18)) : el("button", { class: "btn gold", type: "button", onclick: () => endSection(false) }, "End section")));
      cleanup = keepCleanup;
    }
    function review() {
      const keepCleanup = cleanup; cleanup = null;
      screen(`Section ${si + 1}: review`, null,
        el("div", { class: "mockbar" }, el("span", { id: "tmr", class: "tmr" }, ic("clock", 16), fmtT(left))),
        el("div", { class: "grid-q" }, sec().qs.map((q, k) => el("button", { type: "button", class: "gq" + (sec().ans[k] != null ? " ans" : "") + (sec().marked[k] ? " mk" : ""), onclick: () => { qi = k; draw(); } }, String(k + 1)))),
        el("p", { class: "muted" }, `${Object.keys(sec().ans).length} answered · ${Object.values(sec().marked).filter(Boolean).length} marked. Tap a number to go to it.`),
        el("button", { class: "btn wide", type: "button", onclick: () => endSection(false) }, si < sections.length - 1 ? "End section and go on" : "End the test"));
      cleanup = keepCleanup;
    }
    function endSection(timeUp) {
      if (!timeUp && !confirm(si < sections.length - 1 ? "End this section? You can't come back to it." : "End the test and see your score?")) return;
      if (timeUp) toast("Time is up for this section.");
      if (si < sections.length - 1) { si++; qi = 0; left = sec().min * 60; draw(); return; }
      clearInterval(timer); cleanup = null; results();
    }
    function results() {
      const all = sections.flatMap(s => s.qs.map((q, k) => ({ q, a: s.ans[k], ok: isRight(q, s.ans[k]) })));
      all.forEach(x => record(x.q, x.ok));
      const raw = all.filter(x => x.ok).length, n = all.length, est = estimate(raw / n);
      S.mocks.push({ at: Date.now(), raw, n, est, secs: Math.round((Date.now() - startedAt) / 1000) }); save();
      const byTopic = {}; all.forEach(x => { const t = byTopic[x.q.topic] || (byTopic[x.q.topic] = { n: 0, ok: 0 }); t.n++; if (x.ok) t.ok++; });
      const weak = Object.entries(byTopic).filter(([, t]) => t.ok < t.n).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n);
      screen("Mock results", "#/",
        el("section", { class: "box center" }, el("div", { class: "big" }, `${raw} / ${n}`), el("p", {}, "Estimated score: ", el("b", { class: "gold" }, String(est)), el("small", { class: "muted" }, " (rough guide, 130–170)"))),
        weak.length ? el("section", { class: "box" }, el("div", { class: "lbl" }, "Review these lessons"), weak.slice(0, 6).map(([t, x]) => el("a", { class: "lrow", href: "#/l/" + t }, el("span", { class: "lmain" }, el("b", {}, BYID[t].title), el("small", {}, `${x.ok}/${x.n} right`)), ic("next", 18)))) : null,
        el("div", { class: "lbl" }, "Every question"),
        all.map((x, k) => el("details", { class: "box rev" + (x.ok ? " good" : " bad") }, el("summary", {}, el("span", { class: "rv-n" }, x.ok ? ic("check", 16) : ic("x", 16)), `Question ${k + 1} · ${BYID[x.q.topic].title}`),
          questionView(x.q, x.a, () => {}, true), x.q.t === "ne" ? rich("div", `Your answer: <b>${x.a ?? "–"}</b> · Correct: <b>${answerText(x.q)}</b>`, { class: "muted" }) : null, rich("p", x.q.why))),
        el("button", { class: "btn wide", type: "button", onclick: mockStart }, "Another mock test"));
    }
    draw();
  }
  // a rough mapping from percent correct to the 130–170 scale
  function estimate(p) { const pts = [[0, 130], [0.3, 140], [0.52, 150], [0.74, 160], [0.93, 167], [1, 170]]; for (let i = 1; i < pts.length; i++) if (p <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return Math.round(y0 + (p - x0) / (x1 - x0) * (y1 - y0)); } return 170; }
  function calculator(transfer) {
    let expr = "";
    const disp = el("div", { class: "cdisp" }, "0");
    const show = () => { disp.textContent = expr || "0"; };
    const calc = () => { const e = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-"); if (!/^[0-9+\-*/(). ]+$/.test(e)) return NaN; try { const v = Function('"use strict";return (' + e + ")")(); return Number.isFinite(v) ? Math.round(v * 1e8) / 1e8 : NaN; } catch (x) { return NaN; } };
    const press = k => {
      if (k === "C") expr = "";
      else if (k === "⌫") expr = expr.slice(0, -1);
      else if (k === "=") { const v = calc(); expr = Number.isNaN(v) ? "" : String(v); if (Number.isNaN(v)) toast("Check the expression"); }
      else if (k === "√") { const v = calc(); if (v >= 0) expr = String(Math.round(Math.sqrt(v) * 1e8) / 1e8); }
      else if (k === "±") { const v = calc(); if (!Number.isNaN(v)) expr = String(-v); }
      else expr += k;
      show();
    };
    const keys = ["7", "8", "9", "÷", "C", "4", "5", "6", "×", "⌫", "1", "2", "3", "−", "√", "0", ".", "±", "+", "=", "(", ")"];
    return el("section", { class: "box calc" }, disp, el("div", { class: "ckeys" }, keys.map(k => el("button", { type: "button", class: k === "=" ? "eq" : /[÷×−+]/.test(k) ? "op" : "", onclick: () => press(k) }, k))),
      el("button", { class: "btn", type: "button", onclick: () => { const v = calc(); if (!Number.isNaN(v)) transfer(String(v)); } }, "Transfer display to the answer box"));
  }

  /* ================= formula sheet and progress ================= */
  function formulas() {
    screen("Formula sheet", "#/", UNITS.map(u => el("section", { class: "box" }, el("div", { class: "lbl" }, u), L.filter(l => l.unit === u).map(l => el("div", { class: "fgroup" }, el("a", { href: "#/l/" + l.id }, el("b", {}, l.title)), el("div", { class: "rules" }, l.rules.map(r => rich("span", "⟦\\displaystyle " + r + "⟧", { class: "rule" }))))))));
  }
  function stats() {
    screen("Progress", "#/",
      UNITS.map(u => el("section", { class: "box" }, el("div", { class: "lbl" }, u), L.filter(l => l.unit === u).map(l => { const st = S.stats[l.id] || { n: 0, ok: 0 }, p = st.n ? st.ok / st.n : 0; return el("a", { class: "srow", href: "#/l/" + l.id }, el("span", {}, l.title), el("span", { class: "sbar" }, el("i", { style: `width:${p * 100}%`, class: p >= 0.7 ? "good" : p >= 0.4 ? "mid" : "" })), el("small", {}, st.n ? `${st.ok}/${st.n}` : "–")); }))),
      el("button", { class: "btn danger", type: "button", onclick: () => { if (confirm("Delete all your progress on this device?")) { S = { done: {}, stats: {}, mocks: [], seen: {}, theme: S.theme }; save(); home(); } } }, "Reset progress"));
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "l" && BYID[h[1]]) return lesson(h[1]);
    if (h[0] === "p" && BYID[h[1]]) { const l = BYID[h[1]]; S.done[l.id] = true; save(); return practice(l.title, ALLQ.filter(q => q.topic === l.id && q.id.startsWith(l.id + ":")), "#/l/" + l.id); }
    if (h[0] === "drill") return drill();
    if (h[0] === "mock") return mockStart();
    if (h[0] === "formulas") return formulas();
    if (h[0] === "stats") return stats();
    home();
  }
  addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("/prep/sw.js", { scope: "/prep/" }).catch(() => {});
})();
