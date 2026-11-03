/* Fun English games: picture games and speaking games for class teams.
   Pictures and words come from fun-data.js (window.FUN). Scores add up across the games. */
(() => {
  "use strict";
  const F = window.FUN;
  const PICS = F.pics.map(([c, w, e, say], i) => ({ c, w, e, say, i }));
  const CAT = Object.fromEntries(F.cats.map(c => [c.id, c]));

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
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  const COLORS = ["#E2725B", "#1A8A8F", "#7C5CBF", "#E39B2B", "#5E8C4F", "#D6457A"];
  const NAMES = ["Tulips", "Seagulls", "Simits", "Lions", "Comets", "Rockets"];
  const art = w => /^[aeiou]/i.test(w) ? "an" : "a";
  // "It's a cat." / "They're jeans." / "This is a doctor."
  function sentence(p) {
    if (p.say && p.say.length > 3) return p.say;
    if (p.say === "p") return `They're ${p.w}.`;
    if (p.say === "n") return `It's ${p.w}.`;
    if (p.say === "the") return `It's the ${p.w}.`;
    if (p.c === "jobs") return `This is ${art(p.w)} ${p.w}.`;
    if (p.c === "feelings") return `They're ${p.w}.`;
    if (p.c === "body") return `It's ${art(p.w)} ${p.w}.`;
    return `It's ${art(p.w)} ${p.w}.`;
  }

  /* ================= state ================= */
  const KEY = "fun.state";
  const S = Object.assign({ teams: NAMES.slice(0, 2).map((name, i) => ({ name, color: COLORS[i], score: 0 })), cats: F.cats.map(c => c.id), timer: 0, sound: true }, store.get(KEY, {}));
  S.cats = S.cats.filter(id => CAT[id]); if (!S.cats.length) S.cats = F.cats.map(c => c.id);
  const save = () => store.set(KEY, S);
  const pool = () => PICS.filter(p => S.cats.includes(p.c));
  // goes through every picture once before repeating
  const decks = {};
  function deck(name, filt) {
    const sig = S.cats.join(",");
    if (!decks[name] || decks[name].sig !== sig) { const p = pool(), f = filt ? p.filter(filt) : p; decks[name] = { sig, order: shuffle((f.length ? f : p).slice()), pos: 0 }; }
    const d = decks[name];
    return { take() { if (d.pos >= d.order.length) { d.order = shuffle(d.order); d.pos = 0; toast("All the pictures done! Starting again."); } return d.order[d.pos++]; }, get pos() { return d.pos; }, get size() { return d.order.length; } };
  }
  // a list that goes round without repeats
  function cycle(name, list) {
    const d = decks[name] ??= { order: shuffle(list.slice()), pos: 0 };
    return () => { if (d.pos >= d.order.length) { d.order = shuffle(d.order); d.pos = 0; } return d.order[d.pos++]; };
  }

  /* ================= sound ================= */
  let actx = null;
  function beep(type) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const seq = { open: [[660, .08], [880, .12]], ok: [[523, .1], [659, .1], [784, .18]], no: [[180, .35]], tick: [[1400, .025]], end: [[300, .2], [200, .4]], flip: [[900, .04]], pass: [[700, .06], [1050, .1]], pop: [[220, .05], [120, .12]], win: [[523, .12], [659, .12], [784, .12], [1046, .4]] }[type] || [];
      let t = actx.currentTime;
      for (const [f, d] of seq) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type === "no" || type === "end" || type === "pop" ? "sawtooth" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
      }
    } catch (e) { /* no audio */ }
  }

  /* ================= shared pieces ================= */
  let turn = 0;
  function scorebar(turnIdx) {
    return el("div", { class: "scorebar", id: "scorebar" }, S.teams.map((t, i) => el("div", { class: "sc" + (i === turnIdx ? " turn" : ""), style: `--c:${t.color}` }, el("span", {}, t.name), el("b", { id: "sc" + i }, String(t.score)))));
  }
  const paintTurn = i => { const sb = $("#scorebar"); if (sb) sb.replaceWith(scorebar(i)); };
  function award(i, pts) {
    if (i < 0 || !S.teams[i]) return;
    S.teams[i].score += pts; save();
    const b = $("#sc" + i); if (b) { b.textContent = String(S.teams[i].score); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
    beep(pts > 0 ? "ok" : "no");
  }
  function awardRow(pts, done, label = "Who got it?") {
    let used = false;
    const go = i => { if (used) return; used = true; if (i >= 0) award(i, pts); setTimeout(done, i >= 0 ? 400 : 0); };
    return el("div", { style: "display:grid;gap:10px;justify-items:center" },
      el("div", { style: "font-weight:800" }, `${label} (+${pts})`),
      el("div", { class: "actions" }, S.teams.map((t, i) => el("button", { class: "btn big team", style: `--c:${t.color}`, onclick: () => go(i) }, `${t.name} +${pts}`)),
        el("button", { class: "btn big", "data-nobody": "1", onclick: () => go(-1) }, "Nobody, next")));
  }
  let stopAll = [], keys = null;
  const cleanup = () => { stopAll.forEach(f => f()); stopAll = []; keys = null; onSets = null; };
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
  // a big round countdown (for drawing and talking)
  function ring(secs, onEnd) {
    let left = secs, last = Date.now(), id = null, paused = false;
    const b = el("b", {}, String(secs)), node = el("div", { class: "ring" }, b);
    const tick = () => {
      const now = Date.now(); left = Math.max(0, left - (now - last) / 1000); last = now;
      node.style.setProperty("--p", left / secs); node.classList.toggle("low", left <= 10); b.textContent = String(Math.ceil(left));
      if (left <= 5 && left > 0 && Math.ceil(left) !== tick.l) { tick.l = Math.ceil(left); beep("tick"); }
      if (left <= 0) { clearInterval(id); id = null; beep("end"); if (onEnd) onEnd(); }
    };
    id = setInterval(tick, 100); stopAll.push(() => clearInterval(id));
    return { node, stop() { clearInterval(id); id = null; }, toggle() { if (left <= 0) return paused; paused = !paused; if (paused) clearInterval(id); else { last = Date.now(); id = setInterval(tick, 100); } return paused; } };
  }
  function frame(title, controls, stage, turnIdx) {
    put($("#app"),
      el("div", { class: "game-head" }, el("a", { class: "btn", href: "#/" }, "← All games"), el("h2", {}, title), el("span", { class: "counter", id: "counter" }, ""), controls),
      stage, scorebar(turnIdx));
  }
  const setCounter = t => { const c = $("#counter"); if (c) c.textContent = t; };
  const stageOf = (color, ...kids) => el("div", { class: "stage", style: `--cc:${color}` }, kids);
  const swap = (stage, title, controls, turnIdx) => { const old = $("#app .stage"); if (old) old.replaceWith(stage); else frame(title, controls, stage, turnIdx); };
  const catColor = c => ["#E2725B", "#1A8A8F", "#7C5CBF", "#E39B2B", "#5E8C4F", "#D6457A", "#4C5FD5", "#2E9E6B", "#C9A84C", "#9C5FC4", "#1a6b72"][F.cats.findIndex(x => x.id === c) % 11];
  const seg = (opts, val, set) => el("div", { class: "seg" }, opts.map(([v, label]) => el("button", { class: val === v ? "on" : "", onclick: e => { set(v); [...e.currentTarget.parentNode.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, label)));

  /* ================= hub ================= */
  const GAMES = [
    { id: "pics", name: "What's This?", art: "🐘", g: "linear-gradient(135deg,#1A8A8F,#3DB2A6)", p: "A big picture and three words. The easiest game: say the word, then the sentence.", tag: "Easiest" },
    { id: "odd", name: "Odd One Out", art: "🍎🚗", g: "linear-gradient(135deg,#E2725B,#E39B2B)", p: "Four pictures. One is different! Find it and say why.", tag: "Easy" },
    { id: "balloon", name: "Balloon Pop", art: "🎈", g: "linear-gradient(135deg,#D6457A,#9C5FC4)", p: "Spell the word from the picture. Every wrong letter pops a balloon!", tag: "Spelling" },
    { id: "riddles", name: "Emoji Riddles", art: "🦁👑", g: "linear-gradient(135deg,#4C5FD5,#5AA9E6)", p: "Sun + flower = ? Two pictures make one word, or guess the movie.", tag: "Puzzle" },
    { id: "draw", name: "Draw It!", art: "✏️", g: "linear-gradient(135deg,#5E8C4F,#7FB069)", p: "One student draws on the board. The team shouts the word in English.", tag: "Drawing" },
    { id: "rather", name: "Would You Rather?", art: "🐱🐶", g: "linear-gradient(135deg,#7C5CBF,#D6457A)", p: "Fly or be invisible? Everyone votes, then says why.", tag: "Speaking" },
    { id: "stop", name: "Stop!", art: "A–Z", g: "linear-gradient(135deg,#C9A84C,#E39B2B)", p: "A letter and five categories. Write an answer for each one before time is up!", tag: "Writing" },
    { id: "spin", name: "Spin & Talk", art: "🎡", g: "linear-gradient(135deg,#2E4A6B,#1a6b72)", p: "Spin the wheel and talk about the question. Easy, fun questions.", tag: "Speaking" }
  ];
  function hub() {
    document.title = "Fun English Games";
    const n = pool().length;
    const chips = el("div", { class: "sec-chips" }, F.cats.map(c => el("button", { class: "chip" + (S.cats.includes(c.id) ? " on" : ""), style: `--cc:${catColor(c.id)}`, "aria-pressed": S.cats.includes(c.id) ? "true" : "false",
      onclick: () => { const nx = S.cats.includes(c.id) ? S.cats.filter(x => x !== c.id) : S.cats.concat(c.id); if (!nx.length) { toast("Keep at least one group on"); return; } S.cats = F.cats.map(x => x.id).filter(id => nx.includes(id)); save(); hub(); } },
      c.name, el("small", {}, String(PICS.filter(p => p.c === c.id).length)))));
    const teams = el("div", { class: "team-edit" }, S.teams.map((t, i) => el("div", { class: "team-line" },
      el("span", { class: "dot", style: `background:${t.color}` }),
      el("input", { type: "text", value: t.name, maxlength: 20, "aria-label": `Team ${i + 1} name`, oninput: e => { t.name = e.target.value.trim() || `Team ${i + 1}`; save(); } }),
      el("button", { class: "mini", "aria-label": `Take 100 from ${t.name}`, onclick: () => { t.score -= 100; save(); hub(); } }, "−"),
      el("button", { class: "mini", "aria-label": `Give 100 to ${t.name}`, onclick: () => { t.score += 100; save(); hub(); } }, "+"),
      el("b", {}, String(t.score)))));
    put($("#app"),
      el("div", { class: "hub-hero" },
        el("div", {}, el("div", { class: "eyebrow" }, "Easy English · Pictures and speaking"), el("h1", {}, "Fun English ", el("em", {}, "Games")),
          el("p", { class: "lede" }, `Eight team games with ${PICS.length} everyday words and pictures. No hard vocabulary: animals, food, clothes, jobs and more. Points add up across the games.`)),
        el("div", { class: "panel fun-pics", "aria-hidden": "true" }, shuffle(PICS.slice()).slice(0, 12).map(p => el("span", {}, p.e)))),
      el("div", { class: "games" }, GAMES.map(g => el("a", { class: "gcard", href: "#/" + g.id, style: `--g:${g.g};text-decoration:none` },
        el("span", { class: "art pic-art", "aria-hidden": "true" }, g.art),
        el("div", {}, el("div", { class: "num" }, g.tag), el("h3", {}, g.name), el("p", {}, g.p)),
        el("span", { class: "go" }, "Play →")))),
      el("div", { class: "panel-grid" },
        el("section", { class: "panel" }, el("div", { class: "row" }, el("h2", { style: "font-size:28px" }, "Teams"), el("span", { class: "spacer" }),
          el("button", { class: "mini", "aria-label": "Fewer teams", onclick: () => { if (S.teams.length > 1) { S.teams.pop(); save(); hub(); } } }, "−"),
          el("b", { style: "font:400 26px var(--serif);min-width:2ch;text-align:center" }, String(S.teams.length)),
          el("button", { class: "mini", "aria-label": "More teams", onclick: () => { if (S.teams.length < 6) { const k = S.teams.length; S.teams.push({ name: NAMES[k], color: COLORS[k], score: 0 }); save(); hub(); } } }, "+")),
          teams,
          el("div", { class: "row" }, el("button", { class: "btn gold", onclick: showWinner }, "Show the winner"), el("button", { class: "btn", onclick: () => { if (confirm("Set every team back to 0?")) { S.teams.forEach(t => t.score = 0); save(); hub(); } } }, "Reset scores"))),
        el("section", { class: "panel" }, el("h2", { style: "font-size:28px" }, "Settings"),
          el("div", {}, el("div", { class: "row", style: "margin-bottom:8px" }, el("b", {}, `Picture groups (${n} words)`), el("span", { class: "spacer" }),
            el("button", { class: "btn", style: "padding:5px 12px;font-size:13px", onclick: () => { S.cats = F.cats.map(c => c.id); save(); hub(); } }, "All")), chips),
          el("div", {}, el("b", { style: "display:block;margin-bottom:8px" }, "Timer for each question"), seg([[0, "Off"], [15, "15 s"], [30, "30 s"], [45, "45 s"]], S.timer, v => { S.timer = v; save(); })))));
  }

  /* ================= 1. what's this? ================= */
  function pics() {
    const d = deck("pics");
    let mode = store.get("fun.picmode", "word"), p, opts, tried, done, t;
    const modes = seg([["word", "Picture → word"], ["pic", "Word → picture"]], mode, v => { mode = v; store.set("fun.picmode", v); next(); });
    function choose3() { const same = shuffle(pool().filter(x => x !== p && x.w !== p.w)); return shuffle([p, ...same.slice(0, mode === "pic" ? 3 : 2)]); }
    function next() { if (t) t.stop(); p = d.take(); opts = choose3(); tried = []; done = false; draw(true); setCounter(`${CAT[p.c].name} · ${d.pos} of ${d.size}`); beep("open"); }
    function draw(fresh) {
      const color = catColor(p.c);
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 50 : 100;
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, CAT[p.c].name), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        mode === "word" || done ? el("div", { class: "pic big" + (done ? " pop" : "") }, p.e) : el("div", { class: "hs-word" }, p.w),
        done ? el("div", { class: "say" }, el("b", {}, p.w), el("span", {}, sentence(p))) :
          mode === "word" ? el("div", { class: "opts4 g3" }, opts.map((o, i) => el("button", { class: "opt4" + (tried.includes(o) ? " wrong" : ""), onclick: () => choose(o) }, el("span", { class: "k" }, "ABC"[i]), o.w)))
            : el("div", { class: "picopts" }, opts.map((o, i) => el("button", { class: "picopt" + (tried.includes(o) ? " wrong" : ""), "aria-label": `Picture ${"ABCD"[i]}`, onclick: () => choose(o) }, el("span", { class: "k" }, "ABCD"[i]), el("span", { class: "e" }, o.e)))),
        done ? null : t.node,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Everyone: say the sentence together! Then click the team." : "Teams shout the answer. Tap it (or press A, B, C). Wrong = red, the next team tries for 50."));
      swap(stage, "What's This?", modes);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === p) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } const i = "abcd".indexOf(k); if (i >= 0 && opts[i]) choose(opts[i]); else if (k === "p" && t) t.toggle(); };
    frame("What's This?", modes, stageOf("var(--teal)"));
    next();
  }

  /* ================= 2. odd one out ================= */
  function odd() {
    let set, oddOne, tried, done, t, round = 0;
    function next() {
      if (t) t.stop();
      const cats = shuffle(S.cats.filter(c => pool().filter(p => p.c === c).length >= 3));
      if (!cats.length || F.cats.length < 2) { toast("Turn on more picture groups"); location.hash = "#/"; return; }
      // groups that share words (a beach is nature and a place) are never mixed
      const CLOSE = ["nature|places", "sports|home", "clothes|home", "food|nature", "jobs|feelings", "body|feelings"];
      const main = cats[0], other = pick(F.cats.map(c => c.id).filter(id => id !== main && !CLOSE.includes(main + "|" + id) && !CLOSE.includes(id + "|" + main)));
      const three = shuffle(PICS.filter(p => p.c === main)).slice(0, 3);
      oddOne = pick(PICS.filter(p => p.c === other));
      set = shuffle([...three, oddOne]); tried = []; done = false; round++;
      draw(true); setCounter(`Round ${round}`); beep("open");
    }
    function draw(fresh) {
      const main = set.find(p => p !== oddOne).c, color = catColor(main);
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 50 : 100;
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: "font-size:20px" }, "Which one is different?"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "picopts four" }, set.map((o, i) => el("button", { class: "picopt" + (tried.includes(o) ? " wrong" : "") + (done && o === oddOne ? " right" : "") + (done && o !== oddOne ? " dim" : ""), onclick: () => choose(o) },
          el("span", { class: "k" }, "ABCD"[i]), el("span", { class: "e" }, o.e), el("span", { class: "w" }, o.w)))),
        done ? el("div", { class: "why", style: `--cc:${color}` }, el("b", {}, "Why? "), `The ${oddOne.w} is different. The other three are ${CAT[main].plural}.`) : null,
        done ? null : t.node,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Ask a student to say: \"The ... is different because ...\"" : "Tap the odd one (or press A–D). Wrong = red, the next team tries."));
      swap(stage, "Odd One Out", null);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === oddOne) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } const i = "abcd".indexOf(k); if (i >= 0 && set[i]) choose(set[i]); else if (k === "p" && t) t.toggle(); };
    frame("Odd One Out", null, stageOf("var(--c1)"));
    next();
  }

  /* ================= 3. balloon pop ================= */
  function balloon() {
    const BALLOONS = 7, d = deck("balloon", p => /^[a-z]{3,9}$/i.test(p.w));
    let p, got, wrong, over, starter;
    turn = turn % S.teams.length;
    const BCOL = ["#E2725B", "#E39B2B", "#5E8C4F", "#1A8A8F", "#4C5FD5", "#7C5CBF", "#D6457A"];
    function next() { p = d.take(); got = new Set(); wrong = []; over = null; starter = turn; draw(); setCounter(`${CAT[p.c].name} · word ${d.pos} of ${d.size}`); beep("open"); }
    const letters = () => [...p.w.toUpperCase()];
    const solved = () => letters().every(ch => got.has(ch));
    function draw() {
      const tm = S.teams[turn], left = BALLOONS - wrong.length;
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, over ? el("b", { style: "font-size:20px" }, over === "won" ? "Well done!" : "Oh no! All the balloons popped.") : el("b", { style: `color:${tm.color};font-size:20px` }, `${tm.name}: pick a letter`), el("span", { class: "pos" }, CAT[p.c].name)),
        el("div", { class: "balloons" }, Array.from({ length: BALLOONS }, (_, i) => el("span", { class: "bal" + (i >= left ? " popped" : ""), style: `--b:${BCOL[i]}` }))),
        el("div", { class: "pic mid" }, p.e),
        el("div", { class: "slots" }, letters().map(ch => el("div", { class: "slot" + (got.has(ch) || over ? " on" : "") + (over === "lost" && !got.has(ch) ? " miss" : "") }, got.has(ch) || over ? ch : ""))),
        over ? el("div", { class: "say" }, el("span", {}, sentence(p))) :
          el("div", { class: "keys" }, [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(ch => el("button", { class: "key" + (got.has(ch) ? " good" : "") + (wrong.includes(ch) ? " bad" : ""), disabled: got.has(ch) || wrong.includes(ch), onclick: () => guess(ch) }, ch))),
        over ? el("button", { class: "btn gold huge", onclick: () => { turn = (starter + 1) % S.teams.length; next(); } }, "Next word") : el("div", { class: "actions" }, el("button", { class: "btn", onclick: () => { over = "lost"; beep("end"); draw(); } }, "Show the word")),
        el("div", { class: "hint" }, over ? "Everyone: spell it out loud together!" : "Right letter = +20 and play again. Wrong letter = a balloon pops and the next team plays. The last letter wins +100!"));
      swap(stage, "Balloon Pop", null, over ? -1 : turn);
      paintTurn(over ? -1 : turn);
    }
    function guess(ch) {
      if (over || got.has(ch) || wrong.includes(ch)) return;
      const n = letters().filter(x => x === ch).length;
      if (n) { got.add(ch); award(turn, 20 * n); if (solved()) { over = "won"; award(turn, 100); beep("win"); } }
      else { wrong.push(ch); beep("pop"); if (wrong.length >= BALLOONS) { over = "lost"; beep("end"); } else turn = (turn + 1) % S.teams.length; }
      draw();
    }
    keys = e => { const k = e.key.toUpperCase(); if (over) { if (k === "ENTER" || k === " ") $(".btn.gold.huge").click(); return; } if (/^[A-Z]$/.test(k)) guess(k); };
    frame("Balloon Pop", null, stageOf("var(--c6)"), turn);
    next();
  }

  /* ================= 4. emoji riddles ================= */
  function riddles() {
    let kind = store.get("fun.rkind", "words"), r, choices, done, t, worth;
    const nextWord = cycle("words", F.words), nextMovie = cycle("movies", F.movies);
    const kinds = seg([["words", "Two pictures, one word"], ["movies", "Guess the movie"]], kind, v => { kind = v; store.set("fun.rkind", v); next(); });
    function next() {
      if (t) t.stop();
      r = kind === "words" ? nextWord() : nextMovie();
      const list = kind === "words" ? F.words : F.movies;
      choices = null; done = false; worth = 200;
      r.opts = shuffle([r, ...shuffle(list.filter(x => x !== r)).slice(0, 2)]);
      draw(true); beep("open"); setCounter(kind === "words" ? "Words" : "Movies");
    }
    function draw(fresh) {
      const color = kind === "words" ? "#4C5FD5" : "#D6457A";
      if (fresh) t = timer(S.timer);
      const pics = kind === "words" ? el("div", { class: "riddle" }, el("span", { class: "pic mid" }, r.e[0]), el("b", { class: "plus" }, "+"), el("span", { class: "pic mid" }, r.e[1]), el("b", { class: "plus" }, "="), el("b", { class: "q" }, "?"))
        : el("div", { class: "riddle" }, el("span", { class: "pic mid movie" }, r.e));
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, kind === "words" ? "Put the two words together" : "Which movie is it?"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        pics,
        done ? el("div", { class: "say" }, el("b", {}, r.a), kind === "words" ? el("span", {}, `${r.p[0]} + ${r.p[1]} = ${r.a}`) : null) : null,
        !done && choices ? el("div", { class: "opts4 g3" }, r.opts.map((o, i) => el("button", { class: "opt4" + (o.bad ? " wrong" : ""), onclick: () => choose(o) }, el("span", { class: "k" }, "ABC"[i]), o.a))) : null,
        done ? null : t.node,
        done ? awardRow(worth, next) : el("div", { class: "actions" },
          choices ? null : el("button", { class: "btn big", onclick: () => { choices = true; worth = 100; r.opts.forEach(o => o.bad = false); beep("pass"); draw(false); } }, "Show 3 choices (worth 100)"),
          el("button", { class: "btn gold big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : kind === "words" ? "Say the two words in English, then join them. Space = show the answer." : "Shout the movie name in English! Space = show the answer."));
      swap(stage, "Emoji Riddles", kinds);
    }
    function choose(o) { if (done || o.bad) return; if (o === r) { done = true; if (t) t.stop(); beep("ok"); } else { o.bad = true; beep("no"); } draw(false); }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } if (k === " " || k === "enter") { done = true; if (t) t.stop(); beep("ok"); draw(false); } else if (choices) { const i = "abc".indexOf(k); if (i >= 0) choose(r.opts[i]); } };
    frame("Emoji Riddles", kinds, stageOf("#4C5FD5"));
    next();
  }

  /* ================= 5. draw it! ================= */
  function draw() {
    const d = deck("draw", p => p.c !== "feelings");
    let secs = store.get("fun.draw", 60), p, live = false, shown = false, rg;
    turn = turn % S.teams.length;
    const lens = seg([[45, "45 s"], [60, "60 s"], [90, "90 s"]], secs, v => { secs = v; store.set("fun.draw", v); });
    function intro() {
      live = false; shown = false; if (rg) rg.stop();
      const tm = S.teams[turn];
      const stage = stageOf(tm.color,
        el("div", { class: "eyebrow" }, "Next to draw"), el("div", { class: "hs-word", style: `color:${tm.color}` }, tm.name),
        el("div", { class: "rules" },
          el("div", {}, el("b", {}, "1. "), "One student comes to the board."),
          el("div", {}, el("b", {}, "2. "), "They hold the card to see the word, then draw it. No letters, no talking!"),
          el("div", {}, el("b", {}, "3. "), `Their team shouts the word in English. Correct = +100. You have ${secs} seconds.`)),
        el("button", { class: "btn gold huge", onclick: start }, "Start"));
      swap(stage, "Draw It!", lens, turn); paintTurn(turn);
      setCounter(`${d.pos} of ${d.size} words used`);
    }
    function start() { p = d.take(); live = true; shown = false; rg = ring(secs, () => reveal(false)); paint(); beep("open"); }
    function paint() {
      const tm = S.teams[turn];
      const peek = el("button", { class: "peek", "aria-label": "Hold to see the word",
        onpointerdown: e => { e.preventDefault(); peek.classList.add("open"); }, onpointerup: () => peek.classList.remove("open"), onpointerleave: () => peek.classList.remove("open"), onpointercancel: () => peek.classList.remove("open"), oncontextmenu: e => e.preventDefault() },
        el("span", { class: "cover" }, el("b", {}, "Drawer only"), el("small", {}, "Hold here to see the word")),
        el("span", { class: "secret" }, el("span", { class: "pic mid" }, p.e), el("b", {}, p.w)));
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${tm.color};font-size:20px` }, tm.name), rg.node, el("span", { class: "pos" }, CAT[p.c].name)),
        peek,
        el("div", { class: "actions" }, el("button", { class: "btn huge", style: "background:var(--green);border-color:var(--green);color:#fff", onclick: () => reveal(true) }, "Got it"),
          el("button", { class: "btn big", onclick: () => reveal(false) }, "Give up"),
          el("button", { class: "btn big", "data-pause": "1", onclick: e => { e.currentTarget.textContent = rg.toggle() ? "Resume" : "Pause"; } }, "Pause")),
        el("div", { class: "hint" }, "Space = got it · P = pause · W = peek on a laptop"));
      swap(stage, "Draw It!", lens, turn);
    }
    function reveal(ok) {
      if (!live) return; live = false; rg.stop();
      const tm = S.teams[turn];
      if (ok) award(turn, 100); else beep("end");
      const stage = stageOf(tm.color,
        el("div", { class: "eyebrow" }, ok ? `+100 for ${tm.name}!` : "Time's up!"),
        el("div", { class: "pic big pop" }, p.e), el("div", { class: "say" }, el("b", {}, p.w), el("span", {}, sentence(p))),
        el("button", { class: "btn gold huge", onclick: () => { turn = (turn + 1) % S.teams.length; intro(); } }, `Next: ${S.teams[(turn + 1) % S.teams.length].name}`));
      swap(stage, "Draw It!", lens, turn);
    }
    keys = e => {
      const k = e.key.toLowerCase();
      if (!live) { if (k === "enter") { const b = $(".stage .btn.gold.huge"); if (b) b.click(); } return; }
      if (k === " " || k === "enter") reveal(true); else if (k === "p") $("[data-pause]").click();
      else if (k === "w") { const q = $(".peek"); if (q) { q.classList.add("open"); setTimeout(() => q.classList.remove("open"), 1500); } }
    };
    frame("Draw It!", lens, stageOf("var(--c5)"), turn);
    intro();
  }

  /* ================= 6. would you rather ================= */
  function rather() {
    const nextQ = cycle("rather", F.rather);
    let q, votes, asked, n = 0;
    function next() { q = nextQ(); votes = [0, 0]; asked = false; n++; paint(); setCounter(`Question ${n}`); beep("open"); }
    function paint() {
      const total = votes[0] + votes[1];
      const side = i => el("div", { class: "wyr-side s" + i },
        el("span", { class: "pic big" }, q[i * 2 + 1]), el("b", {}, q[i * 2]),
        el("div", { class: "vote" }, el("button", { class: "mini", "aria-label": "One vote less", onclick: () => { votes[i] = Math.max(0, votes[i] - 1); paint(); } }, "−"), el("output", {}, String(votes[i])), el("button", { class: "mini plus", "aria-label": "One vote more", onclick: () => { votes[i]++; beep("flip"); paint(); } }, "+")));
      const stage = stageOf("#7C5CBF",
        el("div", { class: "wyr-q" }, "Would you rather…"),
        el("div", { class: "wyr" }, side(0), el("b", { class: "or" }, "or"), side(1)),
        total ? el("div", { class: "wyr-bar" }, el("i", { style: `width:${Math.round(votes[0] / total * 100)}%` }, `${Math.round(votes[0] / total * 100)}%`), el("i", {}, `${100 - Math.round(votes[0] / total * 100)}%`)) : el("div", { class: "muted" }, "Hands up! Count the votes with + and −. Or: left side of the class / right side."),
        asked ? el("div", { class: "why", style: "--cc:#7C5CBF" }, el("b", {}, "Say it: "), `"I'd rather ${q[0]} because…"  or  "I'd rather ${q[2]} because…"`) : null,
        asked ? awardRow(50, next, "Best answer?") : el("div", { class: "actions" }, el("button", { class: "btn gold big", onclick: () => { asked = true; beep("pass"); paint(); } }, "Why? Ask a student"), el("button", { class: "btn big", onclick: next }, "Next question")),
        el("div", { class: "hint" }, "There is no wrong answer. Just say it in English!"));
      swap(stage, "Would You Rather?", null);
    }
    keys = e => { const k = e.key.toLowerCase(); if (k === "arrowleft") { votes[0]++; paint(); } else if (k === "arrowright") { votes[1]++; paint(); } else if (k === "n" && !asked) next(); };
    frame("Would You Rather?", null, stageOf("#7C5CBF"));
    next();
  }

  /* ================= 7. stop! ================= */
  // Category sets: the built-in one plus sets pasted by the teacher. Pasted sets are
  // saved online (/api/class-games, library "stop"), so every device has them.
  const K_SETS = "fun.stopSets", K_SDEL = "fun.stopDel";
  const BUILTIN = { id: "builtin", title: F.stop.title, cats: F.stop.cats.map(x => ({ c: x.c, w: x.w.split(",").map(s => s.trim()).filter(Boolean) })) };
  let SETS = store.get(K_SETS, []), setsBusy = false, setsAgain = false, onSets = null;
  const allSets = () => [BUILTIN, ...SETS];
  async function syncSets() {
    if (setsBusy) { setsAgain = true; return; }
    setsBusy = true;
    const dels = store.get(K_SDEL, {}), sent = {};
    const payload = SETS.map(x => { sent[x.id] = x.updatedAt; return { id: x.id, updatedAt: x.updatedAt, deleted: false, data: x }; })
      .concat(Object.entries(dels).map(([id, t]) => { sent[id] = t; return { id, updatedAt: t, deleted: true }; }));
    try {
      const r = await fetch("/api/class-games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ library: "stop", games: payload }) });
      const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "save failed");
      const result = new Map(j.games.filter(x => !x.deleted && x.data && Array.isArray(x.data.cats)).map(x => [x.id, { ...x.data, id: x.id, updatedAt: x.updatedAt }]));
      // keep what changed here while the request was on its way
      for (const x of SETS) if (!(x.id in sent) || x.updatedAt > sent[x.id]) { result.set(x.id, x); setsAgain = true; }
      const nowDels = store.get(K_SDEL, {});
      for (const [id, t] of Object.entries(nowDels)) { if (id in sent && t <= sent[id]) delete nowDels[id]; else { result.delete(id); setsAgain = true; } }
      const before = JSON.stringify(SETS);
      SETS = [...result.values()].sort((a, b) => a.updatedAt - b.updatedAt);
      store.set(K_SETS, SETS); store.set(K_SDEL, nowDels);
      if (JSON.stringify(SETS) !== before && onSets) onSets();
    } catch (e) { /* kept on this device; saved online next time */ }
    finally { setsBusy = false; if (setsAgain) { setsAgain = false; setTimeout(syncSets, 300); } }
  }
  const STOP_PROMPT = `Make a "Stop!" word game (like Scattergories) for my English class.
Level: A2 (easy words)
Topic: [WRITE THE TOPIC, for example: food and cooking]

Write 8 categories for this topic. For each category, write 30 easy English words that fit it. Use many different first letters (A to W, no X, Y or Z).
Answer in exactly this format, with no other text:

Title: [a short name for the set]
[category 1]: word, word, word, word, ...
[category 2]: word, word, word, word, ...

Example:
Title: Animals and Food
an animal: ant, bear, cat, dog, eagle, fox, goat, horse, ...
a fruit: apple, banana, cherry, date, fig, grape, kiwi, lemon, ...`;
  // "Title: ..." and "category: word, word" lines, or JSON { title, categories: [{ name, words }] }
  function parseStop(text) {
    text = String(text || "").trim(); if (!text) throw "";
    let title = "", letters = "", cats = [];
    const fromJson = j => {
      title = j.title || j.name || ""; letters = j.letters || "";
      cats = (j.categories || j.cats || []).map(x => ({ c: String(x.name || x.category || x.c || "").trim(), w: (Array.isArray(x.words || x.w) ? (x.words || x.w) : String(x.words || x.w || "").split(/[,;]/)).map(s => String(s).trim()).filter(Boolean) }));
    };
    const json = text.replace(/^```(json)?|```$/g, "").trim();
    if (/^[{[]/.test(json)) { try { const j = JSON.parse(json); fromJson(Array.isArray(j) ? { categories: j } : j); } catch (e) { throw "That JSON has a mistake. Try the simple text format."; } }
    else for (let line of text.split(/\r?\n/)) {
      line = line.replace(/\*\*/g, "").replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim();
      if (!line || line.startsWith("#") || /^example:?$/i.test(line)) continue;
      const k = line.indexOf(":"); if (k < 1) continue;
      const head = line.slice(0, k).trim(), rest = line.slice(k + 1).trim();
      if (/^(title|name|topic)$/i.test(head)) { if (!title) title = rest; continue; }
      if (/^letters?$/i.test(head)) { letters = rest; continue; }
      if (/^level$/i.test(head)) continue;
      cats.push({ c: head, w: rest.split(/[,;]/).map(s => s.replace(/\.\.\.|…/g, "").trim()).filter(Boolean) });
    }
    cats = cats.filter(x => x.c && x.w.length);
    const seen = new Set(); cats = cats.filter(x => { const k = x.c.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    if (cats.length < 3) throw "Write at least 3 categories, one per line: category: word, word, word";
    const thin = cats.filter(x => x.w.length < 3);
    if (thin.length) throw `Add more words to "${thin[0].c}" (at least 3).`;
    letters = String(letters).toUpperCase().replace(/[^A-Z]/g, "");
    return { title: (title || "My Stop! set").slice(0, 60), letters, cats: cats.slice(0, 30).map(x => ({ c: x.c.slice(0, 60), w: x.w.slice(0, 120).map(s => s.slice(0, 40)) })) };
  }
  const first = w => (String(w).normalize("NFKD").replace(/[^\p{L}]/gu, "")[0] || "").toUpperCase();
  function stop() {
    let secs = store.get("fun.stop", 60), many = store.get("fun.stopN", 5), setId = store.get("fun.stopSet", "builtin");
    let letter = "", cats = [], rg = null, phase = "start", spinId = null, showEx = false, pasting = false, pasteText = "";
    const lens = seg([[45, "45 s"], [60, "60 s"], [90, "90 s"]], secs, v => { secs = v; store.set("fun.stop", v); });
    const cur = () => allSets().find(x => x.id === setId) || BUILTIN;
    onSets = () => { if (phase === "start" && !pasting) paint(); };
    function newRound() {
      const set = cur();
      phase = "spin"; showEx = false; if (rg) rg.stop();
      cats = shuffle(set.cats.slice()).slice(0, many);
      // a letter that has example answers in every category (or nearly)
      const pool = [...(set.letters || (set.id === "builtin" ? "ABCDEFGHKLMPRST" : "ABCDEFGHIKLMNOPRSTW"))];
      const score = L => cats.filter(x => x.w.some(w => first(w) === L)).length;
      const best = Math.max(...pool.map(score));
      const final = pick(pool.filter(L => score(L) >= Math.min(best, cats.length)));
      let k = 0; const end = 14 + Math.floor(Math.random() * 6);
      clearInterval(spinId);
      spinId = setInterval(() => {
        letter = ++k >= end ? final : pick(pool); beep("flip");
        const b = $(".letter-box"); if (b) b.textContent = letter;
        if (k >= end) { clearInterval(spinId); phase = "write"; rg = ring(secs, () => { phase = "score"; beep("end"); paint(); }); paint(); beep("open"); }
      }, 90);
      stopAll.push(() => clearInterval(spinId));
      paint();
    }
    const examples = x => x.w.filter(w => first(w) === letter);
    function setPicker() {
      const sel = el("select", { class: "set-sel", "aria-label": "Category set", onchange: e => { setId = e.target.value; store.set("fun.stopSet", setId); paint(); } },
        allSets().map(x => el("option", { value: x.id, selected: x.id === cur().id }, `${x.title} (${x.cats.length} categories)`)));
      const set = cur();
      return el("div", { class: "set-box" },
        el("div", { class: "set-row" }, el("b", {}, "Category set"), sel),
        el("div", { class: "set-row" }, el("b", {}, "Categories each round"), seg([[4, "4"], [5, "5"], [6, "6"]], many, v => { many = v; store.set("fun.stopN", v); paint(); })),
        el("div", { class: "set-cats" }, set.cats.map(x => el("span", {}, x.c))),
        el("div", { class: "actions" },
          el("button", { class: "btn", onclick: () => { pasting = true; paint(); } }, "Paste a new set"),
          set.id === "builtin" ? null : el("button", { class: "btn danger-t", onclick: () => {
            if (!confirm(`Delete "${set.title}"?`)) return;
            SETS = SETS.filter(x => x.id !== set.id); store.set(K_SETS, SETS);
            const d = store.get(K_SDEL, {}); d[set.id] = Date.now(); store.set(K_SDEL, d);
            setId = "builtin"; store.set("fun.stopSet", setId); syncSets(); paint(); toast("Set deleted");
          } }, "Delete this set")));
    }
    function pasteBox() {
      const status = el("div", { class: "paste-status" }), ta = el("textarea", { class: "paste-ta", rows: 9, spellcheck: "false", placeholder: "Title: Food and Cooking\na fruit: apple, banana, cherry, ...\na vegetable: bean, carrot, ...\nsomething in the kitchen: bowl, cup, fork, ..." });
      ta.value = pasteText;
      const saveB = el("button", { class: "btn gold", disabled: true, onclick: () => {
        let set; try { set = parseStop(ta.value); } catch (e) { return; }
        const now = Date.now(); set.id = "s" + now.toString(36) + Math.random().toString(36).slice(2, 6); set.updatedAt = now;
        SETS.push(set); store.set(K_SETS, SETS); syncSets();
        setId = set.id; store.set("fun.stopSet", setId); pasting = false; pasteText = ""; paint(); toast(`Saved: ${set.title}`);
      } }, "Save set");
      const check = () => {
        pasteText = ta.value; status.className = "paste-status";
        try { const s = parseStop(ta.value); status.classList.add("ok"); status.textContent = `${s.title}: ${s.cats.length} categories, ${s.cats.reduce((n, x) => n + x.w.length, 0)} words`; saveB.disabled = false; }
        catch (e) { saveB.disabled = true; if (e) { status.classList.add("bad"); status.textContent = e; } else status.textContent = "Paste the AI answer here."; }
      };
      ta.addEventListener("input", check); check();
      return el("div", { class: "paste-box" },
        el("b", {}, "Make your own set"),
        el("ol", { class: "paste-steps" },
          el("li", {}, "Press ", el("b", {}, "Copy AI prompt"), " and paste it into ChatGPT (or any AI)."),
          el("li", {}, "Change the topic line, then send it."),
          el("li", {}, "Copy the AI's answer and paste it below.")),
        el("div", { class: "actions" }, el("button", { class: "btn", onclick: async () => { try { await navigator.clipboard.writeText(STOP_PROMPT); toast("Prompt copied. Change the topic, then paste it into the AI."); } catch (e) { ta.value = STOP_PROMPT; check(); ta.select(); toast("Copy this prompt, then clear the box"); } } }, "Copy AI prompt")),
        ta, status,
        el("div", { class: "actions" }, saveB, el("button", { class: "btn", onclick: () => { pasting = false; paint(); } }, "Cancel")),
        el("div", { class: "hint" }, "Format: one category per line, then a colon, then words with commas. A Title: line is optional."));
    }
    function paint() {
      const stage = stageOf("#E39B2B",
        phase === "start" ? el("div", { class: "rules" },
          el("div", {}, el("b", {}, "1. "), "Each team needs paper and a pen."),
          el("div", {}, el("b", {}, "2. "), `You get one letter and ${many} categories.`),
          el("div", {}, el("b", {}, "3. "), "Write one English word for each category. It must start with the letter!"),
          el("div", {}, el("b", {}, "4. "), "Finished? Shout STOP! Then check the answers: +10 for each good word.")) : null,
        phase === "start" ? (pasting ? pasteBox() : setPicker()) : null,
        phase === "start" ? null : el("div", { class: "stop-top" }, el("div", { class: "letter-box" + (phase === "spin" ? " spin" : "") }, letter || "?"), phase === "write" && rg ? rg.node : null),
        phase === "start" || phase === "spin" ? null : el("ol", { class: "stop-cats" }, cats.map(x => {
          const ex = examples(x);
          return el("li", { class: showEx ? "open" : "" }, el("div", { class: "cat-row" }, el("span", {}, x.c), el("i", {}, letter + "…")),
            showEx ? el("div", { class: "ex-words" }, ex.length ? ex.slice(0, 8).map(w => el("span", {}, w)) : el("em", {}, "No example here. Check together!")) : null);
        })),
        phase === "write" ? el("div", { class: "actions" }, el("button", { class: "btn huge", style: "background:var(--red);border-color:var(--red);color:#fff", onclick: () => { if (rg) rg.stop(); phase = "score"; beep("end"); paint(); } }, "STOP!")) : null,
        phase === "score" ? el("div", { class: "actions" }, el("button", { class: "btn big" + (showEx ? "" : " gold"), onclick: () => { showEx = !showEx; beep("pass"); paint(); } }, showEx ? "Hide example answers" : "Show example answers")) : null,
        phase === "score" ? el("div", { class: "stop-score" }, el("b", {}, "Check the answers. Give +10 for each good word:"),
          S.teams.map((tm, i) => el("div", { class: "team-line" }, el("span", { class: "dot", style: `background:${tm.color}` }), el("span", { class: "nm" }, tm.name),
            el("button", { class: "mini", "aria-label": `Take 10 from ${tm.name}`, onclick: () => award(i, -10) }, "−"),
            el("button", { class: "mini plus", "aria-label": `Give 10 to ${tm.name}`, onclick: () => award(i, 10) }, "+10")))) : null,
        phase === "spin" || (phase === "start" && pasting) ? null : el("div", { class: "actions" },
          el("button", { class: "btn gold huge", onclick: newRound }, phase === "start" ? "Get a letter" : "New letter"),
          phase === "start" ? null : el("button", { class: "btn big", onclick: () => { if (rg) rg.stop(); phase = "start"; paint(); } }, "Change set")),
        el("div", { class: "hint" }, phase === "score" ? "Other good words are fine too! Same word as another team? You can give only +5." : phase === "start" ? `Set: ${cur().title}` : "The letter always has answers in these categories."));
      swap(stage, "Stop!", lens);
    }
    keys = e => { if (e.key === "Enter" && phase !== "spin" && phase !== "start") newRound(); };
    frame("Stop!", lens, stageOf("#E39B2B"));
    paint(); syncSets();
  }

  /* ================= 8. spin & talk ================= */
  function spin() {
    const T = F.talk, N = T.length, step = 360 / N;
    let angle = store.get("fun.wheel", 0) % 360, shown = angle, spinning = false, topic = null, question = "", rg = null, talkSecs = store.get("fun.talk", 30);
    turn = turn % S.teams.length;
    const used = {};
    const lens = seg([[20, "20 s"], [30, "30 s"], [45, "45 s"]], talkSecs, v => { talkSecs = v; store.set("fun.talk", v); });
    const grad = `conic-gradient(${T.map((x, i) => `${x.c} ${i * step}deg ${(i + 1) * step}deg`).join(",")})`;
    function wheelNode() {
      return el("div", { class: "wheel-wrap" }, el("div", { class: "pointer" }),
        el("div", { class: "wheel", style: `background:${grad};transform:rotate(${shown}deg)` },
          T.map((x, i) => el("span", { class: "wl", style: `--a:${i * step + step / 2}deg` }, x.t))),
        el("div", { class: "hubdot" }));
    }
    function paint() {
      const tm = S.teams[turn];
      const stage = stageOf(topic ? topic.c : "#1a6b72",
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${tm.color};font-size:20px` }, `${tm.name}'s turn`), topic && rg ? rg.node : null),
        topic ? el("div", { class: "talk" }, el("span", { class: "pos", style: `background:${topic.c};color:#fff` }, topic.t), el("div", { class: "talk-q" }, question)) : wheelNode(),
        topic ? null : el("button", { class: "btn gold huge", disabled: spinning, onclick: doSpin }, spinning ? "Spinning…" : "Spin!"),
        topic ? (rg ? el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { rg.stop(); rg = null; paint(); } }, "Finished"), el("button", { class: "btn big", onclick: newQ }, "Other question")) : awardRow(100, () => { topic = null; turn = (turn + 1) % S.teams.length; paint(); }, "Good talking?")) : null,
        el("div", { class: "hint" }, topic ? (rg ? "Talk until the time is up! Easy sentences are fine." : "Did they talk well? Give the points.") : "Spin the wheel. A student answers the question in English."));
      swap(stage, "Spin & Talk", lens, turn); paintTurn(turn);
    }
    function newQ() {
      const u = used[topic.t] ??= [];
      const left = topic.q.filter(x => !u.includes(x)); if (!left.length) u.length = 0;
      question = pick(left.length ? left : topic.q); u.push(question);
      if (rg) rg.stop(); rg = ring(talkSecs, () => { rg = null; paint(); }); paint(); beep("open");
    }
    function doSpin() {
      if (spinning) return; spinning = true;
      const k = Math.floor(Math.random() * N);
      // the pointer is at the top: segment k is under it when the wheel is turned by -(k*step + step/2)
      const target = 360 - (k * step + step / 2) + (Math.random() - .5) * step * .6;
      angle = angle + 360 * 5 + ((target - angle % 360) + 360) % 360;
      store.set("fun.wheel", angle % 360);
      paint();
      const w = $(".wheel"); void w.offsetWidth;
      w.style.transition = "transform 3.6s cubic-bezier(.15,.85,.2,1)"; w.style.transform = `rotate(${angle}deg)`; shown = angle;
      let ticks = 0; const tid = setInterval(() => { beep("tick"); if (++ticks > 22) clearInterval(tid); }, 150); stopAll.push(() => clearInterval(tid));
      const done = setTimeout(() => { spinning = false; topic = T[k]; newQ(); }, 3800); stopAll.push(() => clearTimeout(done));
    }
    keys = e => { if ((e.key === " " || e.key === "Enter") && !topic) doSpin(); };
    frame("Spin & Talk", lens, stageOf("#1a6b72"), turn);
    paint();
  }

  /* ================= winner ================= */
  function showWinner() {
    const ranked = [...S.teams].sort((a, b) => b.score - a.score), best = ranked[0].score, winners = ranked.filter(t => t.score === best).map(t => t.name);
    put($("#winBox"), el("div", { class: "eyebrow" }, "Fun English champion"),
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
  const ROUTES = { "": hub, pics, odd, balloon, riddles, draw, rather, stop, spin };
  function route() {
    cleanup();
    const id = location.hash.replace(/^#\/?/, "");
    const g = GAMES.find(x => x.id === id); document.title = g ? `${g.name} · Fun English` : "Fun English Games";
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
