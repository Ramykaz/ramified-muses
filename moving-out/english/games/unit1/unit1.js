/* Unit word games: a hub plus five team games that share one scoreboard.
   Words come from words.js (window.UNIT). Every answer shows the English
   word, the Turkish, the English meaning and the example sentence. */
(() => {
  "use strict";
  const U = window.UNIT;
  const WORDS = U.words.map((w, i) => ({ ...w, i }));

  /* ================= helpers ================= */
  const $ = s => document.querySelector(s);
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c));
    return n;
  };
  const put = (node, ...kids) => { node.replaceChildren(); for (const c of kids.flat(Infinity)) if (c != null && c !== false) node.append(c.nodeType ? c : String(c)); return node; };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  // the word as students say it: "move away (from)" -> "move away", "feel like + -ing" -> "feel like"
  const head = w => w.h || w.w.replace(/\([^)]*\)/g, "").replace(/\+\s*-?\w+/g, "").replace(/\.\.\./g, "").replace(/\s+/g, " ").trim();
  const COLORS = ["#E2725B", "#1A8A8F", "#7C5CBF", "#E39B2B", "#5E8C4F", "#D6457A"];
  const NAMES = ["Tulips", "Seagulls", "Simits", "Lions", "Comets", "Rockets"];
  const SEC_COLORS = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)", "var(--teal)", "var(--gold)", "#4C5FD5"];

  /* ================= state shared by all games ================= */
  const KEY = "u1.state." + (U.key || U.title || "unit").replace(/\W+/g, "");
  const S = Object.assign({ teams: NAMES.slice(0, 2).map((name, i) => ({ name, color: COLORS[i], score: 0 })), secs: U.sections.map((_, i) => i), clue: "both", timer: 0, sound: true, level: U.level || "normal" }, store.get(KEY, {}));
  const lvl = () => S.level || "normal", EN_ONLY = () => lvl() === "hard";
  const save = () => store.set(KEY, S);
  const pool = () => WORDS.filter(w => S.secs.includes(w.s));

  // goes through every word in the chosen lessons once before repeating
  const decks = {};
  function deck(name, filt) {
    const sig = S.secs.join(",");
    if (!decks[name] || decks[name].sig !== sig) { const p = pool(), f = filt ? p.filter(filt) : p; decks[name] = { sig, order: shuffle((f.length ? f : p).slice()), pos: 0 }; }
    const d = decks[name];
    return {
      take(n) { const out = []; for (let k = 0; k < n; k++) { if (d.pos >= d.order.length) { d.order = shuffle(d.order); d.pos = 0; toast("All the words done! Starting again."); } out.push(d.order[d.pos++]); } return out; },
      get pos() { return d.pos; }, get size() { return d.order.length; }
    };
  }

  /* ================= sound ================= */
  let actx = null;
  function beep(type) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const seq = { open: [[660, .08], [880, .12]], ok: [[523, .1], [659, .1], [784, .18]], no: [[180, .35]], tick: [[1400, .025]], end: [[300, .2], [200, .4]], flip: [[900, .04]], pass: [[700, .06], [1050, .1]], win: [[523, .12], [659, .12], [784, .12], [1046, .4]] }[type] || [];
      let t = actx.currentTime;
      for (const [f, d] of seq) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type === "no" || type === "end" ? "sawtooth" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
      }
    } catch (e) { /* no audio */ }
  }

  /* ================= shared pieces ================= */
  let turn = 0; // whose turn it is, for games that take turns
  function scorebar(turnIdx) {
    return el("div", { class: "scorebar", id: "scorebar" }, S.teams.map((t, i) => el("div", { class: "sc" + (i === turnIdx ? " turn" : ""), style: `--c:${t.color}` }, el("span", {}, t.name), el("b", { id: "sc" + i }, String(t.score)))));
  }
  function award(i, pts) {
    if (i < 0 || !S.teams[i]) return;
    S.teams[i].score += pts; save();
    const b = $("#sc" + i); if (b) { b.textContent = String(S.teams[i].score); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
    beep(pts > 0 ? "ok" : "no");
  }
  // "who got it?" buttons; calls done() after a team is chosen or nobody
  function awardRow(pts, done) {
    let used = false;
    const pick = i => { if (used) return; used = true; if (i >= 0) award(i, pts); setTimeout(done, i >= 0 ? 400 : 0); };
    return el("div", { style: "display:grid;gap:10px;justify-items:center" },
      el("div", { style: "font-weight:800" }, `Who got it? (+${pts})`),
      el("div", { class: "actions" }, S.teams.map((t, i) => el("button", { class: "btn big team", style: `--c:${t.color}`, onclick: () => pick(i) }, `${t.name} +${pts}`)),
        el("button", { class: "btn big", "data-nobody": "1", onclick: () => pick(-1) }, "Nobody, next")));
  }
  function clueBlock(w) {
    const clue = EN_ONLY() ? "en" : S.clue;
    return el("div", { class: "clue" },
      clue !== "en" ? el("div", { class: "tr" }, el("span", { class: "flag" }, "TR"), w.tr) : null,
      clue !== "tr" ? el("div", { class: "en" }, el("span", { class: "flag flag-en" }, "EN"), w.m) : null);
  }
  function exampleNode(w) {
    const s = w.ex, gaps = w.gap || [], parts = []; let last = 0;
    for (const [a, b] of gaps) { parts.push(s.slice(last, a), el("mark", {}, s.slice(a, b))); last = b; }
    parts.push(s.slice(last)); return el("div", { class: "ex" }, "“", parts, "”");
  }
  function answerCard(w, color) {
    return el("div", { class: "answer", style: `--cc:${color || "var(--teal)"}` },
      el("div", { class: "word" }, w.w), el("div", {}, el("span", { class: "pos" }, w.pos)),
      EN_ONLY() ? null : el("div", { class: "tr" }, el("span", { class: "flag" }, "TR"), w.tr),
      el("div", { class: "m" }, el("span", { class: "flag flag-en" }, "EN"), w.m),
      exampleNode(w));
  }
  // a countdown with pause; secs = 0 means no timer
  function timer(secs, onEnd) {
    if (!secs) return { node: null, stop() {}, toggle() {} };
    let left = secs, last = 0, id = null, paused = false;
    const bar = el("i"), out = el("output", {}, String(secs)), tb = el("div", { class: "timer" }, bar);
    const pb = el("button", { class: "btn", onclick: () => api.toggle() }, "Pause");
    const node = el("div", { class: "timer-row" }, tb, out, pb);
    const tick = () => {
      const now = Date.now(); left = Math.max(0, left - (now - last) / 1000); last = now;
      bar.style.transform = `scaleX(${left / secs})`; out.textContent = left > 0 ? String(Math.ceil(left)) : "Time!"; tb.classList.toggle("low", left <= 5);
      if (left <= 5 && left > 0 && Math.ceil(left) !== tick.l) { tick.l = Math.ceil(left); beep("tick"); }
      if (left <= 0) { clearInterval(id); id = null; pb.disabled = true; beep("end"); if (onEnd) onEnd(); }
    };
    const run = () => { clearInterval(id); last = Date.now(); id = setInterval(tick, 100); };
    const api = {
      node, stop() { clearInterval(id); id = null; pb.remove(); },
      toggle() { if (left <= 0 || !pb.isConnected) return; paused = !paused; if (paused) clearInterval(id); else run(); pb.textContent = paused ? "Resume" : "Pause"; node.style.opacity = paused ? ".55" : ""; }
    };
    run(); stopAll.push(() => clearInterval(id));
    return api;
  }
  let stopAll = [];
  const cleanup = () => { stopAll.forEach(f => f()); stopAll = []; keys = null; };
  let keys = null; // the current game's keyboard handler

  function frame(title, sub, controls, stage, turnIdx) {
    put($("#app"),
      el("div", { class: "game-head" }, el("a", { class: "btn", href: "#/" }, "← All games"), el("h2", {}, title), el("span", { class: "counter", id: "counter" }, sub || ""), controls),
      stage, scorebar(turnIdx));
  }
  const setCounter = t => { const c = $("#counter"); if (c) c.textContent = t; };

  /* ================= hub ================= */
  const GAMES = [
    { id: "tf", name: "True or False", art: "T / F", g: "linear-gradient(135deg,#2E9E6B,#5E8C4F 60%,#C9A84C)", p: "A word and a meaning. Do they match? Teams take turns: one tap, +100." },
    { id: "quick", name: "Quick Match", art: "A B C", g: "linear-gradient(135deg,#1A8A8F,#4C5FD5)", p: "See the word in Türkçe, pick the English. Big buttons, fast rounds." },
    { id: "scramble", name: "Word Scramble", art: "S·W·D", g: "linear-gradient(135deg,#7C5CBF,#9C5FC4 55%,#D6457A)", p: "Mixed-up letters and a clue. Which team finds the word first?" },
    { id: "memory", name: "Memory Match", art: "EN=TR", g: "linear-gradient(135deg,#1a6b72,#1A8A8F 60%,#3DB2A6)", p: "Flip two cards: find each English word and its Turkish meaning." },
    { id: "mime", name: "Act It Out", art: "MIME", g: "linear-gradient(135deg,#D6457A,#E2725B 60%,#E39B2B)", p: "One player acts a chore or a gesture. No talking! The team shouts the word.", need: () => U.sections.some(s => s.act) },
    { id: "hotseat", name: "Hot Seat", art: "60s", g: "linear-gradient(135deg,#E2725B,#E39B2B 70%,#F2C14E)", p: "One player can't see the board. The team explains words in English, fast!" },
    { id: "gap", name: "Missing Word", art: "___", g: "linear-gradient(135deg,#4C5FD5,#5AA9E6)", p: "A sentence with a gap and four choices. Pick the right word." },
    { id: "grammar", name: "Grammar Battle", art: "A/B", g: "linear-gradient(135deg,#C9A84C,#E39B2B 55%,#E2725B)", p: "Pick the right grammar: do or make, must or mustn't, will or not.", need: () => (U.grammar || []).length > 0 },
    { id: "board", name: "Quiz Board", art: "500", g: "linear-gradient(135deg,#2E4A6B,#1a6b72)", p: "Jeopardy with the unit words: Turkish, meanings, gaps and more." },
    { id: "cards", name: "Word Cards", art: String(WORDS.length), g: "linear-gradient(135deg,#5E8C4F,#7FB069)", p: "All the words. Tap a card to see the Turkish and an example." }
  ];
  for (let i = GAMES.length - 1; i >= 0; i--) if (GAMES[i].need && !GAMES[i].need()) GAMES.splice(i, 1);
  const NUM_WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  function hub() {
    document.title = `${U.title} Word Games`;
    const n = pool().length;
    const secChips = el("div", { class: "sec-chips" }, U.sections.map((s, i) => el("button", { class: "chip" + (S.secs.includes(i) ? " on" : ""), style: `--cc:${SEC_COLORS[i % SEC_COLORS.length]}`, "aria-pressed": S.secs.includes(i) ? "true" : "false",
      onclick: () => { S.secs = S.secs.includes(i) ? S.secs.filter(x => x !== i) : S.secs.concat(i).sort((a, b) => a - b); save(); hub(); } }, s.name, el("small", {}, String(WORDS.filter(w => w.s === i).length)))));
    const seg = (opts, val, set) => el("div", { class: "seg" }, opts.map(([v, label]) => el("button", { class: val === v ? "on" : "", onclick: () => { set(v); save(); hub(); } }, label)));
    const teams = el("div", { class: "team-edit" }, S.teams.map((t, i) => el("div", { class: "team-line" },
      el("span", { class: "dot", style: `background:${t.color}` }),
      el("input", { type: "text", value: t.name, maxlength: 20, "aria-label": `Team ${i + 1} name`, oninput: e => { t.name = e.target.value.trim() || `Team ${i + 1}`; save(); } }),
      el("button", { class: "mini", "aria-label": `Take 100 from ${t.name}`, onclick: () => { t.score -= 100; save(); hub(); } }, "−"),
      el("button", { class: "mini", "aria-label": `Give 100 to ${t.name}`, onclick: () => { t.score += 100; save(); hub(); } }, "+"),
      el("b", {}, String(t.score)))));
    put($("#app"),
      el("div", { class: "hub-hero" },
        el("div", {}, el("div", { class: "eyebrow" }, `${U.book} · ${U.title}`), el("h1", {}, (U.hero || ["Our Life and ", "Times"])[0], el("em", {}, (U.hero || ["", "Times"])[1])),
          el("p", { class: "lede" }, `All ${WORDS.length} words from ${U.title} in ${(n => NUM_WORDS[n] || n)(GAMES.filter(g => g.id !== "cards" && g.id !== "grammar").length)} team games${GAMES.some(g => g.id === "grammar") ? ", plus a grammar battle" : ""}. Points add up across the games, so play a few and crown the winner at the end.`)),
        el("div", { class: "panel", style: "align-content:center" }, el("div", { class: "eyebrow" }, "Words in play"), el("div", { style: "font:400 56px/1 var(--serif)" }, String(n)),
          el("div", { class: "muted", style: "font-size:14px" }, n === WORDS.length ? "All the lessons are on. Change them below." : `From ${S.secs.length} of ${U.sections.length} lessons.`),
          el("div", { class: "eyebrow", style: "margin-top:10px" }, "Level"),
          seg([["easy", "Easy"], ["normal", "Normal"], ["hard", "English only"]], lvl(), v => S.level = v),
          el("div", { class: "muted", style: "font-size:13px" }, { easy: "Short words, 3 choices, Türkçe help and a free first letter.", normal: "4 choices and the full word list.", hard: "No Türkçe anywhere: English meanings only. For strong students." }[lvl()]))),
      el("div", { class: "games" }, GAMES.map((g, i) => el("a", { class: "gcard", href: "#/" + g.id, style: `--g:${g.g};text-decoration:none` },
        el("span", { class: "art", "aria-hidden": "true" }, g.art),
        el("div", {}, el("div", { class: "num" }, g.id === "cards" ? "Review" : `Game ${i + 1}`), el("h3", {}, g.name), el("p", {}, g.p)),
        el("span", { class: "go" }, g.id === "cards" ? "Open →" : "Play →")))),
      el("div", { class: "panel-grid" },
        el("section", { class: "panel" }, el("div", { class: "row" }, el("h2", { style: "font-size:28px" }, "Teams"), el("span", { class: "spacer" }),
          el("button", { class: "mini", "aria-label": "Fewer teams", onclick: () => { if (S.teams.length > 1) { S.teams.pop(); save(); hub(); } } }, "−"),
          el("b", { style: "font:400 26px var(--serif);min-width:2ch;text-align:center" }, String(S.teams.length)),
          el("button", { class: "mini", "aria-label": "More teams", onclick: () => { if (S.teams.length < 6) { const k = S.teams.length; S.teams.push({ name: NAMES[k], color: COLORS[k], score: 0 }); save(); hub(); } } }, "+")),
          teams,
          el("div", { class: "row" }, el("button", { class: "btn gold", onclick: showWinner }, "Show the winner"), el("button", { class: "btn", onclick: () => { if (confirm("Set every team back to 0?")) { S.teams.forEach(t => t.score = 0); save(); hub(); } } }, "Reset scores"))),
        el("section", { class: "panel" }, el("h2", { style: "font-size:28px" }, "Settings"),
          el("div", {}, el("div", { class: "row", style: "margin-bottom:8px" }, el("b", {}, "Lessons"), el("span", { class: "spacer" }),
            el("button", { class: "btn", style: "padding:5px 12px;font-size:13px", onclick: () => { S.secs = U.sections.map((_, i) => i); save(); hub(); } }, "All"),
            el("button", { class: "btn", style: "padding:5px 12px;font-size:13px", onclick: () => { S.secs = []; save(); hub(); } }, "None")), secChips),
          EN_ONLY() ? el("div", {}, el("b", { style: "display:block;margin-bottom:8px" }, "Clues in"), el("div", { class: "muted" }, "English only (level: English only)")) : el("div", {}, el("b", { style: "display:block;margin-bottom:8px" }, "Clues in"), seg([["both", "Türkçe + English"], ["tr", "Türkçe"], ["en", "English"]], S.clue, v => S.clue = v)),
          el("div", {}, el("b", { style: "display:block;margin-bottom:8px" }, "Timer for each question"), seg([[0, "Off"], [20, "20 s"], [30, "30 s"], [45, "45 s"], [60, "60 s"]], S.timer, v => S.timer = v)))));
  }

  /* ================= true or false ================= */
  // teams take turns; a word and a meaning (Türkçe, or English at the hard level): do they match?
  function tf() {
    const d = deck("tf");
    let w, shown, truth, res, t;
    turn = turn % S.teams.length;
    const mean = x => EN_ONLY() ? x.m : x.tr;
    function next() {
      if (t) t.stop(); [w] = d.take(1); truth = Math.random() < .5; shown = w;
      if (!truth) { const others = shuffle(pool().filter(x => x !== w && mean(x) !== mean(w))); const near = others.find(x => lvl() === "easy" ? x.s !== w.s : x.s === w.s); shown = near || others[0] || w; if (shown === w) truth = true; }
      res = null; draw(true); setCounter(`Word ${d.pos} of ${d.size}`); beep("open");
    }
    function draw(fresh) {
      const tm = S.teams[turn], color = SEC_COLORS[w.s % SEC_COLORS.length];
      if (fresh) t = timer(S.timer, () => { if (!res) answer(null); });
      const stage = el("div", { class: "stage", style: `--cc:${color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${tm.color};font-size:20px` }, `${tm.name}'s turn`), el("b", { style: "color:var(--gold)" }, "Worth 100")),
        el("div", { class: "tfq" }, el("div", { class: "hs-word" }, head(w)), el("div", { class: "eq" }, "="), el("div", { class: "tfm" }, el("span", { class: "flag" + (EN_ONLY() ? " flag-en" : "") }, EN_ONLY() ? "EN" : "TR"), mean(shown))),
        res ? el("div", { class: "verdict " + (res.ok ? "yes" : "no") }, res.ok ? `Yes! +100 for ${tm.name}` : res.timeout ? "Time's up!" : "Not this time!", el("small", {}, truth ? "It's TRUE." : `It's FALSE. ${head(w)} = ${mean(w)}`)) : null,
        res ? answerCard(w, color) : null,
        res ? null : t.node,
        res ? el("button", { class: "btn gold huge", onclick: pass }, `Next: ${S.teams[(turn + 1) % S.teams.length].name}`)
          : el("div", { class: "tfbtns" }, el("button", { class: "tfb yes", onclick: () => answer(true) }, "True"), el("button", { class: "tfb no", onclick: () => answer(false) }, "False")),
        el("div", { class: "hint" }, res ? "Enter = next team" : "T = true · F = false · P = pause"));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("True or False", "", null, stage, turn);
      const sb = $("#scorebar"); if (sb) sb.replaceWith(scorebar(turn));
    }
    function answer(v) {
      if (res) return; if (t) t.stop();
      res = { ok: v === truth, timeout: v === null };
      if (res.ok) award(turn, 100); else beep("no");
      draw(false);
    }
    function pass() { turn = (turn + 1) % S.teams.length; next(); }
    keys = e => { const k = e.key.toLowerCase(); if (res) { if (k === "enter" || k === "n" || k === " ") pass(); return; } if (k === "t") answer(true); else if (k === "f") answer(false); else if (k === "p" && t) t.toggle(); };
    frame("True or False", "", null, el("div", { class: "stage" }), turn);
    next();
  }

  /* ================= quick match ================= */
  // Türkçe (or an English meaning at the hard level) -> pick the English word
  function quick() {
    const d = deck("quick" + lvl(), lvl() === "easy" ? w => head(w).length <= 18 : null);
    let w, opts, tried, done, t;
    function next() { if (t) t.stop(); [w] = d.take(1); opts = choices(w); tried = []; done = false; draw(true); setCounter(`Word ${d.pos} of ${d.size}`); beep("open"); }
    function draw(fresh) {
      const color = SEC_COLORS[w.s % SEC_COLORS.length];
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 50 : 100;
      const stage = el("div", { class: "stage", style: `--cc:${color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, U.sections[w.s].name), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        done ? null : EN_ONLY() ? el("div", { class: "clue" }, el("div", { class: "tr" }, el("span", { class: "flag flag-en" }, "EN"), w.m))
          : el("div", { class: "clue" }, el("div", { class: "tr", style: "font-size:clamp(34px,5vw,64px)" }, el("span", { class: "flag" }, "TR"), w.tr)),
        done ? null : el("div", { class: "muted", style: "font-weight:700" }, "Which English word is it?"),
        done ? null : el("div", { class: "opts4" + (opts.length === 3 ? " g3" : "") }, opts.map((o, i) => el("button", { class: "opt4" + (tried.includes(o) ? " wrong" : ""), onclick: () => choose(o) }, el("span", { class: "k" }, "ABCD"[i]), head(o)))),
        done ? null : t.node,
        done ? answerCard(w, color) : null,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : "Tap the answer a team says (or press A–D). Wrong = red, another team can try for 50."));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Quick Match", "", null, stage);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === w) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } const i = "abcd".indexOf(k); if (i >= 0 && opts[i]) choose(opts[i]); else if (k === "p" && t) t.toggle(); };
    frame("Quick Match", "", null, el("div", { class: "stage" }));
    next();
  }

  /* ================= 1. word scramble ================= */
  function scramble() {
    const max = { easy: 10, normal: 14, hard: 20 }[lvl()] || 14, base = lvl() === "easy" ? 1 : 0;
    const d = deck("scramble" + lvl(), w => [...head(w)].filter(ch => /[a-z]/i.test(ch)).length <= max);
    let w, mixed, hints, revealed, t;
    const isL = ch => /[a-z]/i.test(ch);
    const mix = () => { const letters = [...head(w)].filter(isL).map(c => c.toUpperCase()); let m; for (let k = 0; k < 20; k++) { m = shuffle(letters.slice()); if (m.join("") !== letters.join("") || letters.length < 2) break; } return m; };
    const worth = () => Math.max(100, 300 - (hints - base) * 100);
    function next() { if (t) t.stop(); [w] = d.take(1); mixed = mix(); hints = base; revealed = false; draw(true); setCounter(`Word ${d.pos} of ${d.size}`); beep("open"); }
    // fresh = a new word (new timer); anim = drop the tiles in again
    function draw(fresh, anim = fresh) {
      const color = SEC_COLORS[w.s % SEC_COLORS.length], word = head(w).toUpperCase(), letters = [...word].filter(isL);
      const shown = revealed ? letters.length : hints; let k = 0;
      const slots = el("div", { class: "slots" }, [...word].map(ch => ch === " " ? el("div", { class: "slot gap" }) : !isL(ch) ? el("div", { class: "slot fixed" }, ch) : (k++ < shown ? el("div", { class: "slot on" }, ch) : el("div", { class: "slot" }))));
      const used = {}; for (const ch of letters.slice(0, shown)) used[ch] = (used[ch] || 0) + 1;
      const tiles = el("div", { class: "ltiles" }, mixed.map((ch, i) => { const u = used[ch] > 0; if (u) used[ch]--; return el("div", { class: "ltile" + (u ? " used" : "") + (anim ? "" : " still"), style: `--i:${i};--r:${((i * 37) % 13) - 6}deg;--cc:${color}` }, ch); }));
      if (fresh && !revealed) t = timer(S.timer);
      const stage = el("div", { class: "stage", style: `--cc:${color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, U.sections[w.s].name), el("b", { style: "color:var(--gold)" }, `Worth ${worth()}`)),
        revealed ? null : clueBlock(w), slots, revealed ? null : tiles, revealed ? null : t.node,
        revealed ? answerCard(w, color) : null,
        revealed ? awardRow(worth(), next) : el("div", { class: "actions" },
          el("button", { class: "btn gold big", onclick: reveal }, "Show the word"),
          el("button", { class: "btn big", disabled: hints >= letters.length - 1, onclick: hint }, "Hint (−100)"),
          el("button", { class: "btn big", onclick: remix }, "Mix again")),
        el("div", { class: "hint" }, revealed ? "Click the team that got it, or press N." : "Space = show · H = hint · M = mix · P = pause"));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Word Scramble", "", null, stage);
    }
    function remix() { if (revealed) return; mixed = mix(); beep("flip"); draw(false, true); }
    function hint() { const n = [...head(w)].filter(isL).length; if (revealed || hints >= n - 1) return; hints++; beep("pass"); draw(false); }
    function reveal() { if (revealed) return; revealed = true; if (t) t.stop(); beep("ok"); draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (revealed) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } if (k === " " || k === "enter") reveal(); else if (k === "h") hint(); else if (k === "m") remix(); else if (k === "p" && t) t.toggle(); };
    frame("Word Scramble", "", null, el("div", { class: "stage" }));
    next();
  }

  /* ================= 2. memory match ================= */
  function memory() {
    const d = deck("memory");
    let pairs = store.get("u1.pairs", 8), cards, open, locked, found, words, from;
    turn = turn % S.teams.length;
    const sizes = el("div", { class: "seg" }, [6, 8, 10].map(n => el("button", { class: pairs === n ? "on" : "", onclick: () => { pairs = n; store.set("u1.pairs", n); round(); } }, `${n} pairs`)));
    function round() {
      from = d.pos + 1; words = d.take(pairs);
      cards = shuffle(words.flatMap(w => [{ w, side: "en" }, { w, side: "tr" }]));
      open = []; locked = false; found = 0;
      [...sizes.children].forEach((b, i) => b.classList.toggle("on", [6, 8, 10][i] === pairs));
      draw(); beep("open");
    }
    const info = el("div", { style: "min-height:30px;width:100%;display:grid;justify-items:center" });
    function draw() {
      const cols = pairs * 2 <= 12 ? 4 : 5;
      const grid = el("div", { class: "mem" + (EN_ONLY() ? " mlong" : ""), style: `--cols:${cols}` }, cards.map((c, i) => {
        const b = el("button", { class: "mcard" + (c.done ? " done" : "") + (open.includes(i) ? " up" : ""), style: c.done ? `--c:${c.done}` : "", "aria-label": c.done || open.includes(i) ? (c.side === "en" ? head(c.w) : (EN_ONLY() ? c.w.m : c.w.tr)) : `Card ${i + 1}`, onclick: () => flip(i) },
          el("div", { class: "in" }, el("div", { class: "face back" }, "?"), el("div", { class: "face front" + (c.side === "tr" ? (EN_ONLY() ? " trf mf" : " trf") : "") }, el("small", {}, c.side === "tr" ? (EN_ONLY() ? "MEANING" : "TR") : "EN"), c.side === "en" ? head(c.w) : (EN_ONLY() ? c.w.m : c.w.tr))));
        return b;
      }));
      const stage = el("div", { class: "stage", style: "--cc:var(--teal)" },
        el("div", { style: "font-weight:800;font-size:20px" }, found === pairs ? "All pairs found!" : el("span", {}, el("span", { style: `color:${S.teams[turn].color}` }, S.teams[turn].name), EN_ONLY() ? "'s turn: find a word and its meaning" : "'s turn: find an English word and its Turkish")),
        info, grid,
        found === pairs ? el("button", { class: "btn gold big", onclick: round }, "Next round →") : null);
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Memory Match", "", sizes, stage, turn);
      setCounter(`Words ${from}–${from + pairs - 1} of ${d.size}`);
      const sb = $("#scorebar"); if (sb) sb.replaceWith(scorebar(found === pairs ? -1 : turn));
    }
    function flip(i) {
      const c = cards[i]; if (locked || c.done || open.includes(i)) return;
      open.push(i); beep("flip"); draw();
      if (open.length < 2) return;
      const [a, b] = open.map(k => cards[k]);
      if (a.w === b.w) {
        a.done = b.done = S.teams[turn].color; open = []; found++;
        award(turn, 100);
        put(info, el("div", { class: "matched", style: `--c:${S.teams[turn].color}` }, el("b", {}, head(a.w)), " = ", EN_ONLY() ? el("span", {}, a.w.m) : [el("b", {}, a.w.tr), el("span", {}, " · " + a.w.m)]));
        setTimeout(draw, 50);
      } else {
        locked = true;
        setTimeout(() => { open = []; locked = false; turn = (turn + 1) % S.teams.length; beep("no"); draw(); }, 1300);
      }
    }
    keys = e => { if (e.key.toLowerCase() === "n" && found === pairs) round(); };
    frame("Memory Match", "", sizes, el("div", { class: "stage" }), turn);
    round();
  }

  /* ================= 3. hot seat ================= */
  function hotseat() {
    const d = deck("hotseat");
    let secs = store.get("u1.hs", 60), live = false, left, last, id, w, got = [], paused = false;
    turn = turn % S.teams.length;
    const lens = el("div", { class: "seg" }, [60, 90, 120].map(n => el("button", { class: secs === n ? "on" : "", onclick: e => { secs = n; store.set("u1.hs", n); [...lens.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, `${n} s`)));
    function intro() {
      live = false; clearInterval(id);
      const t = S.teams[turn];
      const stage = el("div", { class: "stage", style: `--cc:${t.color}` },
        el("div", { class: "eyebrow" }, "Next up"), el("div", { class: "hs-word", style: `color:${t.color}` }, t.name),
        el("div", { style: "display:grid;gap:8px;font-size:clamp(17px,1.8vw,22px);font-weight:600;text-align:left;max-width:640px" },
          el("div", {}, el("b", {}, "1. "), "One player sits with their back to the board."),
          el("div", {}, el("b", {}, "2. "), "The team explains each word in English. No Turkish, and don't say the word!"),
          el("div", {}, el("b", {}, "3. "), `Correct = +100. Skip if it's too hard. You have ${secs} seconds.`)),
        el("button", { class: "btn gold huge", onclick: startRound }, "Start"));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Hot Seat", "", lens, stage, turn);
      const sb = $("#scorebar"); if (sb) sb.replaceWith(scorebar(turn));
      setCounter(`${d.pos} of ${d.size} words used`);
    }
    function startRound() { live = true; got = []; left = secs; paused = false; [w] = d.take(1); last = Date.now(); clearInterval(id); id = setInterval(tick, 100); stopAll.push(() => clearInterval(id)); beep("open"); draw(); }
    function tick() {
      const now = Date.now(); left = Math.max(0, left - (now - last) / 1000); last = now;
      const r = $(".ring"); if (r) { r.style.setProperty("--p", left / secs); r.classList.toggle("low", left <= 10); r.querySelector("b").textContent = Math.ceil(left); }
      if (left <= 10 && left > 0 && Math.ceil(left) !== tick.l) { tick.l = Math.ceil(left); beep("tick"); }
      if (left <= 0) { clearInterval(id); beep("end"); summary(); }
    }
    function draw() {
      const t = S.teams[turn];
      const stage = el("div", { class: "stage", style: `--cc:${t.color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${t.color};font-size:20px` }, t.name), el("div", { class: "ring" }, el("b", {}, String(Math.ceil(left)))), el("b", { style: "font-size:20px" }, `Correct: ${got.filter(x => x.ok).length}`)),
        el("div", { class: "hs-word" }, head(w)),
        el("div", { class: "hs-sub" }, EN_ONLY() ? null : [el("span", { class: "flag" }, "TR"), w.tr, "  ·  "], w.pos),
        el("div", { class: "actions" }, el("button", { class: "btn huge", style: "background:var(--green);border-color:var(--green);color:#fff", onclick: () => mark(true) }, "Got it"),
          el("button", { class: "btn huge", onclick: () => mark(false) }, "Skip →"),
          el("button", { class: "btn big", onclick: () => { paused = !paused; if (paused) clearInterval(id); else { last = Date.now(); id = setInterval(tick, 100); } draw(); } }, paused ? "Resume" : "Pause")),
        el("div", { class: "hint" }, "Space or → = got it · S = skip · P = pause"));
      $("#app .stage").replaceWith(stage);
    }
    function mark(ok) { if (!live || paused) return; got.push({ w, ok }); if (ok) award(turn, 100); else beep("pass"); [w] = d.take(1); draw(); }
    function summary() {
      live = false; const t = S.teams[turn], n = got.filter(x => x.ok).length;
      const stage = el("div", { class: "stage", style: `--cc:${t.color}` },
        el("div", { class: "eyebrow" }, "Time's up!"), el("div", { class: "hs-word", style: `color:${t.color}` }, `${t.name}: +${n * 100}`),
        el("div", { class: "got" }, got.map(x => el("span", { class: x.ok ? "" : "skip", title: `${x.w.tr} · ${x.w.m}` }, head(x.w)))),
        el("p", { class: "muted", style: "margin:0" }, "Go over the skipped words together."),
        el("button", { class: "btn gold huge", onclick: () => { turn = (turn + 1) % S.teams.length; intro(); } }, `Next: ${S.teams[(turn + 1) % S.teams.length].name} →`));
      $("#app .stage").replaceWith(stage); setCounter(`${d.pos} of ${d.size} words used`);
    }
    keys = e => { if (!live) return; const k = e.key.toLowerCase(); if (k === " " || k === "arrowright" || k === "enter") mark(true); else if (k === "s") mark(false); else if (k === "p") $(".stage .actions .btn.big").click(); };
    frame("Hot Seat", "", lens, el("div", { class: "stage" }), turn);
    intro();
  }

  /* ================= 4. missing word ================= */
  function gapSentence(w) {
    // blank the word, and the same word anywhere else in the sentence
    const s = w.ex, gaps = w.gap || [];
    const texts = gaps.map(([a, b]) => s.slice(a, b).toLowerCase());
    const parts = []; let last = 0;
    for (const [a, b] of gaps) { parts.push(s.slice(last, a), el("span", { class: "blank" }, " ")); last = b; }
    let rest = s.slice(last);
    for (const t of texts) { const i = rest.toLowerCase().indexOf(t); if (t.length > 2 && i >= 0) { parts.push(rest.slice(0, i), el("span", { class: "blank" }, " ")); rest = rest.slice(i + t.length); } }
    parts.push(rest);
    return parts;
  }
  // easy: 3 choices that look different; normal and hard: 4, from the same word class
  function choices(w, n = lvl() === "easy" ? 3 : 4) {
    const ok = x => x !== w && !w.ex.toLowerCase().includes(head(x).toLowerCase());
    const same = lvl() === "easy" ? pool().filter(x => ok(x) && x.s !== w.s) : pool().filter(x => ok(x) && x.pos === w.pos);
    const any = WORDS.filter(ok);
    const picks = []; for (const x of shuffle(same).concat(shuffle(any))) { if (picks.length === n - 1) break; if (!picks.some(p => head(p) === head(x)) && head(x) !== head(w)) picks.push(x); }
    return shuffle([w, ...picks]);
  }
  function gap() {
    const d = deck("gap");
    let w, opts, tried, done, t;
    function next() { if (t) t.stop(); [w] = d.take(1); opts = choices(w); tried = []; done = false; draw(true); setCounter(`Sentence ${d.pos} of ${d.size}`); beep("open"); }
    function draw(fresh) {
      const color = SEC_COLORS[w.s % SEC_COLORS.length];
      if (fresh) t = timer(S.timer);
      const stage = el("div", { class: "stage", style: `--cc:${color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, U.sections[w.s].name), el("b", { style: "color:var(--gold)" }, "Worth 200")),
        done ? null : el("div", { class: "sentence" }, gapSentence(w)),
        done || lvl() !== "easy" ? null : el("div", { class: "hs-sub" }, el("span", { class: "flag" }, "TR"), w.tr),
        done ? null : el("div", { class: "opts4" + (opts.length === 3 ? " g3" : "") }, opts.map((o, i) => el("button", { class: "opt4" + (done && o === w ? " right" : "") + (tried.includes(o) ? " wrong" : ""), onclick: () => choose(o) }, el("span", { class: "k" }, "ABCD"[i]), head(o)))),
        done ? null : t.node,
        done ? answerCard(w, color) : null,
        done ? awardRow(200, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : "Tap the answer a team says (or press A–D). Wrong answers turn red, and another team can try."));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Missing Word", "", null, stage);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === w) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } const i = "abcd".indexOf(k); if (i >= 0 && opts[i]) choose(opts[i]); else if (k === "p" && t) t.toggle(); };
    frame("Missing Word", "", null, el("div", { class: "stage" }));
    next();
  }

  /* ================= act it out ================= */
  // the actor holds the card to peek at the word; the class only sees it when it's guessed
  function mime() {
    const d = deck("mime", w => U.sections[w.s].act);
    let secs = store.get("u1.mime", 90), live = false, left, last, id, w, got = [], paused = false, shown = false;
    turn = turn % S.teams.length;
    const lens = el("div", { class: "seg" }, [60, 90, 120].map(n => el("button", { class: secs === n ? "on" : "", onclick: e => { secs = n; store.set("u1.mime", n); [...lens.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, `${n} s`)));
    function intro() {
      live = false; clearInterval(id);
      const t = S.teams[turn];
      const stage = el("div", { class: "stage", style: `--cc:${t.color}` },
        el("div", { class: "eyebrow" }, "Next up"), el("div", { class: "hs-word", style: `color:${t.color}` }, t.name),
        el("div", { style: "display:grid;gap:8px;font-size:clamp(17px,1.8vw,22px);font-weight:600;text-align:left;max-width:640px" },
          el("div", {}, el("b", {}, "1. "), "One player comes to the screen (or takes the phone)."),
          el("div", {}, el("b", {}, "2. "), "They hold the card to see the word, then act it. No talking, no sounds!"),
          el("div", {}, el("b", {}, "3. "), `The team shouts the word in English. Correct = +100. You have ${secs} seconds.`)),
        el("button", { class: "btn gold huge", onclick: startRound }, "Start"));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Act It Out", "", lens, stage, turn);
      const sb = $("#scorebar"); if (sb) sb.replaceWith(scorebar(turn));
      setCounter(`${d.pos} of ${d.size} words used`);
    }
    function startRound() { live = true; got = []; left = secs; paused = false; shown = false; [w] = d.take(1); last = Date.now(); clearInterval(id); id = setInterval(tick, 100); stopAll.push(() => clearInterval(id)); beep("open"); draw(); }
    function tick() {
      const now = Date.now(); left = Math.max(0, left - (now - last) / 1000); last = now;
      const r = $(".ring"); if (r) { r.style.setProperty("--p", left / secs); r.classList.toggle("low", left <= 10); r.querySelector("b").textContent = Math.ceil(left); }
      if (left <= 10 && left > 0 && Math.ceil(left) !== tick.l) { tick.l = Math.ceil(left); beep("tick"); }
      if (left <= 0) { clearInterval(id); beep("end"); summary(); }
    }
    function draw() {
      const t = S.teams[turn];
      const peek = el("button", { class: "peek" + (shown ? " open" : ""), "aria-label": "Hold to see the word",
        onpointerdown: e => { e.preventDefault(); peek.classList.add("open"); }, onpointerup: () => peek.classList.remove("open"), onpointerleave: () => peek.classList.remove("open"), onpointercancel: () => peek.classList.remove("open"), oncontextmenu: e => e.preventDefault() },
        el("span", { class: "cover" }, el("b", {}, "Actor only"), el("small", {}, "Hold here to see the word")),
        el("span", { class: "secret" }, el("b", {}, head(w)), el("small", {}, w.tr)));
      const stage = el("div", { class: "stage", style: `--cc:${t.color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${t.color};font-size:20px` }, t.name), el("div", { class: "ring" }, el("b", {}, String(Math.ceil(left)))), el("b", { style: "font-size:20px" }, `Correct: ${got.filter(x => x.ok).length}`)),
        peek,
        el("div", { class: "actions" }, el("button", { class: "btn huge", style: "background:var(--green);border-color:var(--green);color:#fff", onclick: () => mark(true) }, "Got it"),
          el("button", { class: "btn huge", onclick: () => mark(false) }, "Skip"),
          el("button", { class: "btn big", "data-pause": "1", onclick: () => { paused = !paused; if (paused) clearInterval(id); else { last = Date.now(); id = setInterval(tick, 100); } draw(); } }, paused ? "Resume" : "Pause")),
        el("div", { class: "hint" }, "Space = got it · S = skip · P = pause · W = peek on a laptop"));
      $("#app .stage").replaceWith(stage);
    }
    function mark(ok) {
      if (!live || paused) return; got.push({ w, ok });
      if (ok) { award(turn, 100); toast(`${head(w)} = ${w.tr}`); } else beep("pass");
      [w] = d.take(1); draw();
    }
    function summary() {
      live = false; const t = S.teams[turn], n = got.filter(x => x.ok).length;
      const stage = el("div", { class: "stage", style: `--cc:${t.color}` },
        el("div", { class: "eyebrow" }, "Time's up!"), el("div", { class: "hs-word", style: `color:${t.color}` }, `${t.name}: +${n * 100}`),
        el("div", { class: "got" }, got.map(x => el("span", { class: x.ok ? "" : "skip", title: `${x.w.tr} · ${x.w.m}` }, head(x.w)))),
        el("p", { class: "muted", style: "margin:0" }, "Everyone: act the skipped words together!"),
        el("button", { class: "btn gold huge", onclick: () => { turn = (turn + 1) % S.teams.length; intro(); } }, `Next: ${S.teams[(turn + 1) % S.teams.length].name}`));
      $("#app .stage").replaceWith(stage); setCounter(`${d.pos} of ${d.size} words used`);
    }
    keys = e => {
      if (!live) return; const k = e.key.toLowerCase();
      if (k === " " || k === "enter") mark(true); else if (k === "s") mark(false); else if (k === "p") $("[data-pause]").click();
      else if (k === "w") { const p = $(".peek"); if (p) { p.classList.add("open"); setTimeout(() => p.classList.remove("open"), 1500); } }
    };
    frame("Act It Out", "", lens, el("div", { class: "stage" }), turn);
    intro();
  }

  /* ================= grammar battle ================= */
  function grammar() {
    const G = U.grammar.map((g, i) => ({ ...g, i })), TOP = U.grammarTopics || [];
    let on = store.get("u1.gtop." + KEY, TOP.map((_, i) => i)).filter(i => TOP[i]); if (!on.length) on = TOP.map((_, i) => i);
    let order, pos, q, opts, tried, done, t;
    const chips = el("div", { class: "sec-chips gtops" });
    function paintChips() {
      put(chips, TOP.map((name, i) => el("button", { class: "chip" + (on.includes(i) ? " on" : ""), style: `--cc:${SEC_COLORS[i % SEC_COLORS.length]}`, "aria-pressed": on.includes(i) ? "true" : "false",
        onclick: () => { const nx = on.includes(i) ? on.filter(x => x !== i) : on.concat(i).sort((a, b) => a - b); if (!nx.length) { toast("Keep at least one topic on"); return; } on = nx; store.set("u1.gtop." + KEY, on); paintChips(); restart(); } }, name, el("small", {}, String(G.filter(g => g.t === i).length)))));
    }
    function restart() { order = shuffle(G.filter(g => on.includes(g.t))); pos = 0; next(); }
    function next() {
      if (t) t.stop();
      if (pos >= order.length) { order = shuffle(order); pos = 0; toast("All the questions done! Starting again."); }
      q = order[pos++]; opts = q.o.slice(); tried = []; done = false; draw(true); setCounter(`Question ${pos} of ${order.length}`); beep("open");
    }
    const filled = () => { const [a, b] = q.q.split("___"); return [q.a[0] === "'" ? a.trimEnd() : a, el("mark", {}, q.a), b]; };
    const blanked = () => { const [a, b] = q.q.split("___"); return [a, el("span", { class: "blank" }, " "), b]; };
    function draw(fresh) {
      const color = SEC_COLORS[q.t % SEC_COLORS.length];
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 100 : 200;
      const stage = el("div", { class: "stage", style: `--cc:${color}` },
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, TOP[q.t]), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "sentence" }, done ? filled() : blanked()),
        done ? null : el("div", { class: "opts4 g" + opts.length }, opts.map((o, i) => el("button", { class: "opt4" + (tried.includes(o) ? " wrong" : ""), onclick: () => choose(o) }, el("span", { class: "k" }, "ABCD"[i]), o))),
        done ? null : t.node,
        done ? el("div", { class: "why", style: `--cc:${color}` }, el("b", {}, "Why? "), q.why) : null,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : "Tap the answer a team says (or press A–C). A wrong answer turns red and the next team can steal it for 100."));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Grammar Battle", "", null, el("div", { class: "gwrap" }, chips, stage));
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === q.a) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } const i = "abcd".indexOf(k); if (i >= 0 && opts[i]) choose(opts[i]); else if (k === "p" && t) t.toggle(); };
    frame("Grammar Battle", "", null, el("div", { class: "gwrap" }, chips, el("div", { class: "stage" })));
    paintChips(); restart();
  }

  /* ================= 5. quiz board ================= */
  const ALL_CATS = [
    { id: "tr", name: "Türkçe → English", sub: "Say it in English", c: "var(--c1)" },
    { id: "def", name: "What's the word?", sub: "From the meaning", c: "var(--c2)" },
    { id: "gap", name: "Missing word", sub: "Fill the gap", c: "var(--c3)" },
    { id: "scr", name: "Unscramble", sub: "Fix the letters", c: "var(--c4)" },
    { id: "use", name: "Use it!", sub: "Make a sentence", c: "var(--c6)" }
  ];
  const boardCats = () => ALL_CATS.map(c =>
    lvl() === "easy" && c.id === "use" ? { id: "en", name: "English → Türkçe", sub: "Say it in Türkçe", c: c.c } :
    EN_ONLY() && c.id === "tr" ? { id: "exp", name: "Explain it", sub: "Say what it means", c: c.c } : c);
  function board() {
    const CATS = boardCats();
    const d = deck("board");
    let cells, from, overlay = null;
    function newBoard() { from = d.pos + 1; const ws = d.take(25); cells = CATS.map((c, ci) => [0, 1, 2, 3, 4].map(r => ({ w: ws[ci * 5 + r], v: (r + 1) * 100, used: false }))); draw(); beep("open"); }
    function draw() {
      const grid = el("div", { class: "board" }, CATS.map(c => el("div", { class: "bcat", style: `--cc:${c.c}` }, el("span", {}, c.name, el("small", {}, c.sub)))),
        [0, 1, 2, 3, 4].map(r => CATS.map((c, ci) => { const cell = cells[ci][r]; return el("button", { class: "btile" + (cell.used ? " used" : ""), style: `--cc:${c.c}`, "aria-label": cell.used ? "Used" : `${c.name}, ${cell.v}`, onclick: () => open(ci, r) }, String(cell.v)); })));
      const left = cells.flat().filter(x => !x.used).length;
      const stage = el("div", { class: "stage", style: "align-content:start" }, grid, left ? el("div", { class: "hint" }, `${left} questions left`) : el("button", { class: "btn gold big", onclick: newBoard }, "All done! New board →"));
      const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame("Quiz Board", "", el("button", { class: "btn", onclick: () => { if (confirm("Start a new board with new words?")) newBoard(); } }, "New board"), stage);
      setCounter(`Words ${from}–${from + 24} of ${d.size}`);
    }
    function open(ci, r) {
      const c = CATS[ci], cell = cells[ci][r], w = cell.w; let shown = false, t = timer(S.timer);
      const body = el("div", { class: "body" });
      const paint = () => {
        let q;
        if (c.id === "tr") q = el("div", { class: "clue" }, el("div", { class: "tr", style: "font-size:clamp(38px,5vw,70px)" }, el("span", { class: "flag" }, "TR"), w.tr));
        else if (c.id === "def") q = el("div", { class: "clue" }, el("div", { class: "tr" }, w.m));
        else if (c.id === "en" || c.id === "exp") q = el("div", { style: "display:grid;gap:8px;justify-items:center" }, el("div", { class: "hs-word", style: "font-size:clamp(40px,6vw,90px)" }, head(w)), el("div", { class: "muted", style: "font-weight:700" }, c.id === "en" ? "What is it in Türkçe?" : "Explain it in English. Don't say the word!"));
        else if (c.id === "gap") q = el("div", { class: "sentence" }, gapSentence(w));
        else if (c.id === "scr") { const ls = shuffle([...head(w).toUpperCase()].filter(ch => /[A-Z]/.test(ch))); q = el("div", { class: "ltiles", style: `--cc:${c.c}` }, ls.map((ch, i) => el("div", { class: "ltile", style: `--i:${i};--cc:${c.c};--r:${((i * 37) % 13) - 6}deg` }, ch))); }
        else q = el("div", { style: "display:grid;gap:8px;justify-items:center" }, el("div", { class: "hs-word", style: "font-size:clamp(44px,6vw,90px)" }, head(w)), el("div", { class: "muted", style: "font-weight:700" }, "Make your own sentence with this word"));
        put(body, shown ? null : q, shown ? null : t.node, shown ? answerCard(w, c.c) : null,
          shown ? awardRow(cell.v, close) : el("div", { class: "actions" }, el("button", { class: "btn gold big", onclick: () => { shown = true; t.stop(); beep("ok"); paint(); } }, "Show the answer"), el("button", { class: "btn big", onclick: () => { t.stop(); overlay.remove(); overlay = null; } }, "Back (keep it)")),
          el("div", { class: "hint" }, shown ? "Click the team that got it, or press N." : "Space = show the answer · Esc = back · P = pause"));
      };
      const close = () => { cell.used = true; t.stop(); if (overlay) overlay.remove(); overlay = null; draw(); };
      overlay = el("div", { class: "overlay" }, el("div", { class: "modal", style: `--cc:${c.c}` }, el("div", { class: "band" }, el("span", {}, c.name), el("b", {}, String(cell.v))), body));
      document.body.append(overlay); paint(); beep("open");
      keys = e => {
        const k = e.key.toLowerCase();
        if (!overlay) return;
        if (k === "escape") { t.stop(); overlay.remove(); overlay = null; restoreKeys(); }
        else if (!shown && (k === " " || k === "enter")) { shown = true; t.stop(); beep("ok"); paint(); }
        else if (shown && k === "n") $(".overlay [data-nobody]").click();
        else if (k === "p") t.toggle();
      };
    }
    const restoreKeys = () => { keys = null; };
    stopAll.push(() => { if (overlay) overlay.remove(); });
    frame("Quiz Board", "", el("button", { class: "btn", onclick: () => { if (confirm("Start a new board with new words?")) newBoard(); } }, "New board"), el("div", { class: "stage" }));
    newBoard();
  }

  /* ================= word cards ================= */
  function cards() {
    let q = "", backs = false;
    const grid = el("div", { class: "cards" }), count = el("span", { class: "counter" });
    const fold = s => String(s).replace(/[İIı]/g, "i").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
    const draw = () => {
      const list = pool().filter(w => !q || fold(w.w + " " + w.tr + " " + w.m).includes(fold(q)));
      count.textContent = `${list.length} of ${WORDS.length} words`;
      put(grid, list.map(w => el("button", { class: "wcard" + (backs ? " flip" : ""), onclick: e => { e.currentTarget.classList.toggle("flip"); beep("flip"); } },
        el("div", { class: "in" },
          el("div", { class: "face" }, el("b", {}, w.w), el("div", {}, el("span", { class: "pos" }, w.pos)), el("div", { class: "muted", style: "font-size:12px" }, U.sections[w.s].name)),
          el("div", { class: "face back" }, EN_ONLY() ? null : el("div", { class: "tr" }, w.tr), el("div", { class: "m" }, w.m), exampleNode(w))))),
        list.length ? null : el("p", { class: "muted" }, "No words match."));
    };
    put($("#app"),
      el("div", { class: "game-head" }, el("a", { class: "btn", href: "#/" }, "← All games"), el("h2", {}, "Word Cards"), count),
      el("div", { class: "row", style: "margin-bottom:14px" },
        el("input", { class: "search", type: "search", placeholder: "Search in English or Türkçe", "aria-label": "Search words", oninput: e => { q = e.target.value; draw(); } }),
        el("button", { class: "btn", onclick: e => { backs = !backs; e.currentTarget.textContent = backs ? "Show English side" : "Show Turkish side"; draw(); } }, "Show Turkish side")),
      grid, el("div", { style: "height:40px" }));
    draw();
  }

  /* ================= winner ================= */
  function showWinner() {
    const ranked = [...S.teams].sort((a, b) => b.score - a.score), best = ranked[0].score, winners = ranked.filter(t => t.score === best).map(t => t.name);
    put($("#winBox"), el("div", { class: "eyebrow" }, `${U.title} champion`),
      el("h3", {}, winners.length > 1 ? `It's a tie: ${winners.join(" & ")}!` : `${ranked[0].name} win!`),
      el("div", { class: "rank" }, ranked.map((t, i) => el("div", { style: `border-left:7px solid ${t.color}` }, el("span", {}, `${i + 1}. ${t.name}`), el("span", {}, String(t.score))))),
      el("div", { class: "actions" }, el("button", { class: "btn gold big", onclick: hideWinner }, "Keep playing"),
        el("button", { class: "btn big", onclick: () => { S.teams.forEach(t => t.score = 0); save(); hideWinner(); location.hash = "#/"; route(); } }, "New game (scores to 0)")));
    $("#winner").hidden = false; beep("win"); confetti();
  }
  function hideWinner() { $("#winner").hidden = true; cancelAnimationFrame(confetti.raf); }
  function confetti() {
    const c = $("#confetti"), x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
    const bits = Array.from({ length: 160 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height, s: 6 + Math.random() * 8, v: 2 + Math.random() * 4, r: Math.random() * 6, c: COLORS[Math.floor(Math.random() * COLORS.length)] }));
    (function frameFn() {
      x.clearRect(0, 0, c.width, c.height);
      for (const b of bits) { b.y += b.v; b.r += .1; if (b.y > c.height + 20) b.y = -20; x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.fillStyle = b.c; x.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); x.restore(); }
      confetti.raf = requestAnimationFrame(frameFn);
    })();
  }

  /* ================= routing ================= */
  const ROUTES = { "": hub, tf, quick, scramble, memory, mime, hotseat, gap, grammar, board, cards };
  function route() {
    cleanup();
    const id = location.hash.replace(/^#\/?/, "");
    if (id && id !== "cards" && !pool().length) { toast("Choose at least one lesson first"); location.hash = "#/"; return; }
    const g = GAMES.find(x => x.id === id); document.title = g ? `${g.name} · ${U.title}` : `${U.title} Word Games`;
    (ROUTES[id] || hub)(); window.scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  document.addEventListener("keydown", e => {
    if (!$("#winner").hidden || !keys || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === " " || e.key === "Enter") e.preventDefault();
    keys(e);
  });
  const paintSound = () => { const b = $("#soundBtn"); b.textContent = "Sound: " + (S.sound ? "on" : "off"); b.setAttribute("aria-pressed", S.sound); };
  $("#soundBtn").onclick = () => { S.sound = !S.sound; save(); paintSound(); beep("ok"); };
  $("#fsBtn").onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch (e) { toast("Full screen isn't available here"); } };
  paintSound(); route();
})();
