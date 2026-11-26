/* Unit 4 Practice: the book's exercises as choice questions, one at a time, in book order.
   Keys: 1-4 choose, Enter or the right arrow goes on. Scores are kept in this browser. */
(() => {
  "use strict";
  const P = window.PRACTICE, S = P.sections, app = document.getElementById("app");
  const KEY = P.key || "u4practice";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ } };
  let mem = load(); mem.best = mem.best || {};
  const el = (tag, props, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c));
    return n;
  };
  const svg = d => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "2.4"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.innerHTML = d; return s; };
  const ICON = { ok: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>', no: '<circle cx="12" cy="12" r="10"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>' };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const total = S.reduce((t, s) => t + s.qs.length, 0);
  const before = i => S.slice(0, i).reduce((t, s) => t + s.qs.length, 0);
  let keys = null;
  addEventListener("keydown", e => { if (keys && !e.ctrlKey && !e.metaKey && !e.altKey) keys(e); });

  // a question line: "Name: text" gets the name in colour, ___ becomes a blank
  const line = (t, fill) => {
    const m = t.match(/^([A-Z][a-z]+|[AB]):\s(.*)$/);
    const body = (m ? m[2] : t).split("___");
    const parts = []; body.forEach((b, i) => { if (i) parts.push(el("span", { class: "blank" }, fill || " ")); parts.push(b); });
    return el("span", { class: "line" }, m ? el("span", { class: "who" }, m[1] + ": ") : null, parts);
  };

  /* ---------- the list of sections ---------- */
  function home() {
    keys = null; document.title = P.title;
    const parts = [];
    S.forEach((s, i) => { let p = parts.find(x => x.book === s.book); if (!p) parts.push(p = { book: s.book, items: [] }); p.items.push(i); });
    const doneCount = S.filter((_, i) => mem.best[i] != null).length;
    const next = mem.pos != null && mem.pos < S.length ? mem.pos : 0;
    app.replaceChildren(
      el("section", { class: "hero" },
        el("div", { class: "eyebrow" }, P.eyebrow || "Book practice · " + P.sub),
        el("h1", {}, (P.heading || ["", P.title, ""])[0], el("em", {}, (P.heading || ["", P.title, ""])[1]), (P.heading || ["", P.title, ""])[2]),
        el("p", { class: "lede" }, `${P.lede} ${total} questions in ${S.length} parts.`),
        el("div", { class: "start-row" },
          el("button", { class: "btn gold big", type: "button", onclick: () => go(next) }, doneCount && next ? `Continue: ${S[next].book} · ${S[next].title}` : "Start from the beginning"),
          P.noMode ? null : modeBtn(home),
          doneCount ? el("button", { class: "btn big", type: "button", onclick: () => { if (confirm("Clear all scores and start again?")) { mem = { best: {} }; save(mem); home(); } } }, "Reset scores") : null)),
      el("div", { class: "list" }, parts.map(p => el("section", { class: "part" },
        el("h2", {}, p.book),
        el("div", { class: "secs" }, p.items.map(i => {
          const s = S[i], b = mem.best[i];
          return el("button", { class: "sec" + (b != null ? " done" : ""), type: "button", onclick: () => go(i) },
            el("span", { class: "num" }, String(i + 1)),
            el("span", {}, el("b", {}, s.title), el("small", {}, `${s.qs.length} questions`)),
            el("span", { class: "score" }, b != null ? `${b}/${s.qs.length}` : ""));
        }))))));
    scrollTo(0, 0);
  }
  const go = i => { location.hash = "#/s/" + (i + 1); };
  // typing mode: the student writes the answer; the three possible answers are shown as a hint
  const mode = () => mem.mode || P.mode || "choose";
  const modeBtn = after => el("button", { class: "btn mode-btn", type: "button", title: "Switch between typing the answer and choosing it", onclick: () => { mem.mode = mode() === "type" ? "choose" : "type"; save(mem); after(); } }, mode() === "type" ? "Mode: type the answer" : "Mode: choose the answer");
  const norm = x => " " + String(x ?? "").toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ")
    .replace(/\bwon't\b/g, "will not").replace(/\bcan't\b/g, "can not").replace(/\bcannot\b/g, "can not").replace(/n't\b/g, " not")
    .replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").replace(/'re\b/g, " are").replace(/'m\b/g, " am")
    .replace(/[.,!?;:"()]/g, " ").replace(/\s+/g, " ").trim();
  const kwOk = (q, p) => { const t = " " + norm(p).replace(/-/g, " ") + " "; return q.kw.every(g => g.split("|").some(k => t.includes(norm(k).replace(/-/g, " ")))); };
  const isRight = (q, p) => p != null && ([q.a, ...(q.alt || [])].some(x => norm(x) === norm(p)) || (q.kw ? kwOk(q, p) : false));

  /* ---------- one section, one question at a time ---------- */
  function section(si) {
    const s = S[si]; let qi = 0, readOpen = true; const picks = [];
    document.title = `${s.book} · ${s.title} · ${P.title}`;
    mem.pos = si; save(mem);
    const show = () => {
      const q = s.qs[qi], done = picks[qi] != null, ask = q.ask || s.ask;
      // ask "type": the book gives no choices, so the student writes; the teacher can show the choices
      const typing = ask === "type" ? !(mem.show && q.o) : ask === "choose" ? false : mode() === "type" && !s.choose && !q.choose;
      const order = q._o || (q._o = !q.o ? [] : s.fixed || q.fixed ? q.o.slice() : shuffle(q.o));
      const choose = o => { if (picks[qi] != null) return; picks[qi] = o; show(); };
      const next = () => { if (picks[qi] == null) return; if (qi < s.qs.length - 1) { qi++; show(); } else finish(); };
      // the passage, with the gaps answered so far filled in
      let passage = null;
      if (s.passage) {
        const bits = s.passage.split(/\{(\d+)\}/);
        passage = el("div", { class: "card passage" }, bits.map((b, k) => {
          if (k % 2 === 0) return b;
          const n = Number(b), at = s.qs.findIndex(x => x.n === n), ans = picks[at];
          const now = at === qi;
          return el("span", { class: "gap" + (now ? " now" : "") + (ans != null && !now ? " ok" : "") }, ans != null && !now ? s.qs[at].a : `(${n})`);
        }));
      }
      const right = done && isRight(q, picks[qi]);
      const typedOpt = done ? order.find(o => norm(o) === norm(picks[qi])) : null;
      const inp = typing && !done ? el("input", { class: "type-in", type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", enterkeyhint: "done", "aria-label": "Your answer", placeholder: "Type your answer" }) : null;
      const check = e => { if (e) e.preventDefault(); const v = inp.value.trim(); if (!v) { inp.focus(); return; } picks[qi] = v; show(); };
      const hint = ask ? null : el("div", { class: "hint-row" }, el("span", {}, "Use one:"), order.map(o => el("b", {}, o)));
      const bank = s.bank ? el("div", { class: "card bank" }, el("span", { class: "bank-t" }, s.bankTitle || "Word box"),
        el("div", { class: "bank-w" }, s.bank.map(w => el(inp ? "button" : "span", { class: "bw", type: inp ? "button" : null, onclick: inp ? () => { inp.value = w; inp.focus(); } : null }, w)))) : null;
      const showBtn = ask === "type" && q.o && !done ? el("button", { class: "btn mode-btn", type: "button", onclick: () => { mem.show = !mem.show; save(mem); show(); } }, mem.show ? "Hide the choices" : "Show the choices") : null;
      app.replaceChildren(el("div", { class: "qwrap" },
        el("div", { class: "qtop" },
          el("a", { class: "link", href: "#/" }, "← All parts"),
          el("span", { class: "chip" }, el("i", {}, s.book), s.title),
          el("span", { class: "count" }, `${qi + 1} / ${s.qs.length}`)),
        el("div", { class: "bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": total, "aria-valuenow": before(si) + qi + 1, "aria-label": "Progress in the unit" }, el("i", { style: `width:${((before(si) + qi + (done ? 1 : 0)) / total) * 100}%` })),
        el("p", { class: "task" }, s.task),
        bank,
        s.reading ? el("details", { class: "card story", open: readOpen, ontoggle: e => { readOpen = e.target.open; } }, el("summary", {}, "The text"), s.reading.split(/\n\n+/).map(t => el("p", {}, t))) : null,
        passage,
        q.text ? el("div", { class: "reading" }, q.text) : null,
        q.q ? el("p", { class: "q" }, q.q.split("\n").map(t => line(t, done ? q.a : ""))) : (s.passage ? el("p", { class: "q" }, `Gap (${q.n})`) : null),
        inp ? el("form", { class: "type-row", onsubmit: check }, hint, el("div", { class: "type-box" }, inp, el("button", { class: "btn teal big", type: "submit" }, "Check"))) : null,
        inp ? null : el("div", { class: "opts" + (order.length === 2 || order.every(o => o.length < 18) ? " two" : "") }, order.map((o, k) =>
          el("button", { class: "opt" + (done && o === q.a ? " right" : "") + (done && !right && (o === picks[qi] || o === typedOpt) && o !== q.a ? " wrong" : "") + (done && q.w ? " noted" : ""), type: "button", disabled: done, onclick: () => choose(o) },
            el("span", { class: "k" }, done && q.w ? svg(o === q.a ? ICON.ok : ICON.no) : String(k + 1)),
            el("span", { class: "ot" }, o, done && q.w && (o === q.a ? q.why : q.w[o]) ? el("span", { class: "note" }, o === q.a ? q.why : q.w[o]) : null)))),
        done ? el("div", { class: "why " + (right ? "good" : "bad"), role: "status" }, svg(right ? ICON.ok : ICON.no), el("span", {}, right ? (norm(picks[qi]) !== norm(q.a) ? `Correct! ("${q.a}" is right too.) ` : "Correct! ") : typing && !typedOpt ? `You wrote "${picks[qi]}". The answer is "${q.a}". ` : `Not quite. The answer is "${q.a}". `, ask === "type" && !(mem.show && q.o) ? (q.o && q.w ? (right ? "" : "See why above.") : q.why || "") : q.w ? (right ? "See why the others are wrong above." : "See why above each choice.") : (q.why || ""))) : null,
        el("div", { class: "nav" },
          el("button", { class: "btn", type: "button", disabled: qi === 0, onclick: () => { qi--; show(); } }, "← Back"),
          el("button", { class: "btn teal big", type: "button", disabled: !done, id: "nextB", onclick: next }, qi < s.qs.length - 1 ? "Next →" : "See my score →")),
        el("p", { class: "keys" }, typing ? "Press Enter to check, Enter again for next" : "Keys: 1–" + order.length + " to choose, Enter for next"),
        el("div", { style: "text-align:center" }, P.noMode ? showBtn : modeBtn(show))));
      keys = e => {
        if (e.target && e.target.tagName === "INPUT") return;
        const n = Number(e.key);
        if (n >= 1 && n <= order.length && !done && !typing) { e.preventDefault(); choose(order[n - 1]); }
        else if ((e.key === "Enter" || e.key === "ArrowRight") && done) { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft" && qi > 0) { qi--; show(); }
      };
      if (done) { const b = document.getElementById("nextB"); if (b) b.focus({ preventScroll: true }); }
      if (!done) { scrollTo(0, 0); if (inp && matchMedia("(pointer: fine)").matches) inp.focus({ preventScroll: true }); }
    };
    const finish = () => {
      const score = s.qs.filter((q, i) => isRight(q, picks[i])).length;
      mem.best[si] = Math.max(score, mem.best[si] ?? 0); mem.pos = si + 1; save(mem);
      const misses = s.qs.map((q, i) => ({ q, p: picks[i] })).filter(x => !isRight(x.q, x.p));
      const last = si === S.length - 1;
      const all = S.reduce((t, _, i) => t + (mem.best[i] || 0), 0);
      app.replaceChildren(el("div", { class: "qwrap result" },
        el("span", { class: "chip" }, el("i", {}, s.book), s.title),
        el("div", { class: "big-score" }, `${score} / ${s.qs.length}`),
        el("p", { class: "lede" }, score === s.qs.length ? "All correct. Well done!" : score >= s.qs.length * .7 ? "Good work! Look at the mistakes below." : "Look at the mistakes below, then try again."),
        last ? el("p", { class: "lede" }, `That's everything: ${all} / ${total} (best scores).`) : null,
        el("div", { class: "nav", style: "justify-content:center" },
          !last ? el("button", { class: "btn gold big", type: "button", id: "nextB", onclick: () => go(si + 1) }, `Next: ${S[si + 1].book} · ${S[si + 1].title} →`) : el("a", { class: "btn gold big", href: "#/", id: "nextB" }, "All parts"),
          el("button", { class: "btn big", type: "button", onclick: () => section(si) }, "Try again")),
        s.revise ? (() => { const b = el("div", { class: "revise-body" }); b.innerHTML = s.revise.html; return el("section", { class: "card revise" }, el("h3", {}, s.revise.title), b); })() : null,
        misses.length ? el("div", { class: "miss" }, misses.map(x => el("div", { class: "m" },
          el("b", {}, x.q.q || (x.q.text ? x.q.text.slice(0, 90) + "…" : `Gap (${x.q.n})`)),
          el("span", {}, "Your answer: " + x.p + " · "), el("span", { class: "ans" }, "Answer: " + x.q.a)))) : null));
      keys = e => { if (e.key === "Enter") { e.preventDefault(); document.getElementById("nextB").click(); } };
      scrollTo(0, 0);
    };
    s.qs.forEach(q => { delete q._o; });
    show();
  }

  function route() {
    const m = location.hash.match(/^#\/s\/(\d+)/);
    const i = m ? Number(m[1]) - 1 : -1;
    if (i >= 0 && i < S.length) section(i); else home();
  }
  addEventListener("hashchange", route);
  const fs = document.getElementById("fsBtn");
  if (fs) fs.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); };
  route();
})();
