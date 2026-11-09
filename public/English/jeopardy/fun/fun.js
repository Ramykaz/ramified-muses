/* Fun English games: picture games and speaking games for class teams.
   Pictures and words come from fun-data.js (window.FUN). Scores add up across the games. */
(() => {
  "use strict";
  const F = window.FUN;
  // Every game reads its words from here: the built-in lists, or the game pack the teacher chose.
  const BUILT = F.pics.map(([c, w, e, say], i) => ({ c, w, e, say, i }));
  let CATS = F.cats, PICS = BUILT, CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
  const R = { pack: null, words: F.words, movies: F.movies, rather: F.rather, talk: F.talk, taboo: F.taboo || [], facts: F.facts || [] };

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
    if (p.say === "-") return F.clues && F.clues[p.w] && !R.pack ? `${p.w}: ${F.clues[p.w][0].toLowerCase()}${F.clues[p.w].slice(1)}` : p.w;
    if (p.say && p.say.length > 3) return p.say;
    if (p.say === "p") return `They're ${p.w}.`;
    if (p.say === "n") return `It's ${p.w}.`;
    if (p.say === "the") return `It's the ${p.w}.`;
    if (p.c === "jobs" || p.c === "people") return `This is ${art(p.w)} ${p.w}.`;
    if (p.c === "feelings") return `They're ${p.w}.`;
    if (p.c === "body") return `It's ${art(p.w)} ${p.w}.`;
    return `It's ${art(p.w)} ${p.w}.`;
  }

  /* ================= state ================= */
  const PFX = F.key || "fun"; // "fun" = Fun English 1, "fun2" = the harder set; packs are shared
  const KEY = PFX + ".state";
  const S = Object.assign({ teams: NAMES.slice(0, 2).map((name, i) => ({ name, color: COLORS[i], score: 0 })), cats: F.cats.map(c => c.id), timer: 0, sound: true, pack: "" }, store.get(KEY, {}));
  const save = () => store.set(KEY, S);
  const LV = () => F.levels ? (S.level || "both") : "both";
  const lvlOk = l => LV() === "both" || !l || l === "both" || l === LV();
  const pool = () => PICS.filter(p => S.cats.includes(p.c) && (R.pack || !F.lvl || lvlOk(F.lvl[p.w])));

  /* ================= saved online ================= */
  // A shelf of items kept in this browser and in the site's database (/api/class-games),
  // so every device has the same game packs. Last change wins; deletes spread too.
  function shelf(library, key) {
    const K = "fun." + key, KD = K + ".del";
    const me = { items: store.get(K, []), busy: false, again: false, onChange: null };
    me.save = () => { store.set(K, me.items); me.sync(); };
    me.remove = id => { me.items = me.items.filter(x => x.id !== id); const d = store.get(KD, {}); d[id] = Date.now(); store.set(KD, d); me.save(); };
    me.sync = async () => {
      if (me.busy) { me.again = true; return; }
      me.busy = true;
      const dels = store.get(KD, {}), sent = {};
      const payload = me.items.map(x => { sent[x.id] = x.updatedAt; return { id: x.id, updatedAt: x.updatedAt, deleted: false, data: x }; })
        .concat(Object.entries(dels).map(([id, t]) => { sent[id] = t; return { id, updatedAt: t, deleted: true }; }));
      try {
        const r = await fetch("/api/class-games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ library, games: payload }) });
        const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "save failed");
        const result = new Map(j.games.filter(x => !x.deleted && x.data).map(x => [x.id, { ...x.data, id: x.id, updatedAt: x.updatedAt }]));
        // keep what changed here while the request was on its way
        for (const x of me.items) if (!(x.id in sent) || x.updatedAt > sent[x.id]) { result.set(x.id, x); me.again = true; }
        const nowDels = store.get(KD, {});
        for (const [id, t] of Object.entries(nowDels)) { if (id in sent && t <= sent[id]) delete nowDels[id]; else { result.delete(id); me.again = true; } }
        const before = JSON.stringify(me.items);
        me.items = [...result.values()].sort((a, b) => a.updatedAt - b.updatedAt);
        store.set(K, me.items); store.set(KD, nowDels);
        if (JSON.stringify(me.items) !== before && me.onChange) me.onChange();
      } catch (e) { /* kept on this device; saved online next time */ }
      finally { me.busy = false; if (me.again) { me.again = false; setTimeout(me.sync, 300); } }
    };
    return me;
  }
  const PACKS = shelf("fun", "packs"), STOPS = shelf("stop", "stopSets");
  const packById = id => PACKS.items.find(x => x.id === id) || null;
  const GROUP_COLORS = ["#E2725B", "#1A8A8F", "#7C5CBF", "#E39B2B", "#5E8C4F", "#D6457A", "#4C5FD5", "#2E9E6B", "#C9A84C", "#9C5FC4", "#1a6b72"];
  // a word from a pack: "They're grapes." for plurals, "It's an apple." otherwise
  const sayOf = w => /^[A-Z]/.test(w) ? "n" : /[^su]s$/i.test(w) && !/(ss|us|is)$/i.test(w) ? "p" : "";
  function applyPack() {
    const pk = packById(S.pack);
    R.pack = pk;
    if (pk && pk.groups && pk.groups.some(g => g.items.length)) {
      CATS = pk.groups.map((g, i) => ({ id: "g" + i, name: g.name, plural: g.name }));
      PICS = pk.groups.flatMap((g, i) => g.items.map(x => ({ c: "g" + i, w: x.w, e: x.e || "", say: sayOf(x.w) }))).map((x, i) => ({ ...x, i }));
    } else { CATS = F.cats; PICS = BUILT; }
    CAT = Object.fromEntries(CATS.map(c => [c.id, c]));
    R.words = pk && pk.words && pk.words.length ? pk.words : pk && pk.movies && pk.movies.length ? [] : F.words;
    R.movies = pk && pk.movies && pk.movies.length ? pk.movies : pk && pk.words && pk.words.length ? [] : F.movies;
    R.rather = pk && pk.rather && pk.rather.length ? pk.rather : F.rather;
    R.taboo = pk && pk.taboo && pk.taboo.length ? pk.taboo : F.taboo || [];
    R.facts = pk && pk.facts && pk.facts.length ? pk.facts : F.facts || [];
    R.talk = pk && pk.talk && pk.talk.length >= 2 ? pk.talk.map((x, i) => ({ ...x, c: x.c || GROUP_COLORS[i % GROUP_COLORS.length] })) : F.talk;
    S.cats = (S.cats || []).filter(id => CAT[id]); if (!S.cats.length) S.cats = CATS.map(c => c.id);
  }
  applyPack();
  const packTag = () => R.pack ? R.pack.id : "built";
  // goes through every picture once before repeating
  const decks = {};
  function deck(name, filt) {
    const sig = packTag() + ":" + LV() + ":" + S.cats.join(",");
    if (!decks[name] || decks[name].sig !== sig) { const p = pool(), f = filt ? p.filter(filt) : p; decks[name] = { sig, order: shuffle((f.length ? f : p).slice()), pos: 0 }; }
    const d = decks[name];
    return { take() { if (d.pos >= d.order.length) { d.order = shuffle(d.order); d.pos = 0; toast("All the pictures done! Starting again."); } return d.order[d.pos++]; }, get pos() { return d.pos; }, get size() { return d.order.length; } };
  }
  // a list that goes round without repeats
  function cycle(name, list) {
    const d = decks[name + ":" + packTag()] ??= { order: shuffle(list.slice()), pos: 0 };
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
  const cleanup = () => { stopAll.forEach(f => f()); stopAll = []; keys = null; PACKS.onChange = STOPS.onChange = null; };
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
  const catColor = c => GROUP_COLORS[Math.max(0, CATS.findIndex(x => x.id === c)) % GROUP_COLORS.length];
  const seg = (opts, val, set) => el("div", { class: "seg" }, opts.map(([v, label]) => el("button", { class: val === v ? "on" : "", onclick: e => { set(v); [...e.currentTarget.parentNode.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, label)));

  /* ================= hub ================= */
  const GAMES = [
    { id: "reading", name: "Reading Race", art: "📖", g: "linear-gradient(135deg,#4C5FD5,#7C5CBF)", p: "Read a story at your level (A1.2 or A2.2), then race to answer the questions.", tag: "Reading", need: () => !!(F.readings || []).length },
    { id: "grammar", name: "Grammar Battle", art: "A / B", g: "linear-gradient(135deg,#C9A84C,#E39B2B 55%,#E2725B)", p: "Choose the right grammar. Every answer shows the rule.", tag: "Grammar", need: () => lvItems(F.grammar).length > 0 },
    { id: "minitest", name: "Mini Test", art: "✅", g: "linear-gradient(135deg,#4C5FD5,#1A8A8F)", p: "Ten questions for one student, with a score and a review of the mistakes. Good on a phone!", tag: "Exam practice", need: () => lvItems(F.grammar).length >= 10 },
    { id: "lightning", name: "Lightning Round", art: "⚡", g: "linear-gradient(135deg,#E39B2B,#D64545)", p: "Quick questions against the clock. How many can your team get right?", tag: "Speed", need: () => !!(F.quickTopics || []).length && lvItems(F.grammar).some(g => F.quickTopics.includes(g.t)) },
    { id: "mistake", name: "Spot the Mistake", art: "🔍", g: "linear-gradient(135deg,#D64545,#9C5FC4)", p: "Every sentence has one mistake. Tap the wrong word, then say it correctly.", tag: "Exam practice", need: () => !!(F.mistakes || []).length },
    { id: "halves", name: "Sentence Match", art: "½ + ½", g: "linear-gradient(135deg,#2E9E6B,#1A8A8F)", p: "The first half of a sentence and three endings. Which one is right?", tag: "Grammar", need: () => lvItems(F.halves).length > 2 },
    { id: "say", name: "What Do You Say?", art: "💬", g: "linear-gradient(135deg,#D6457A,#9C5FC4)", p: "A situation and three things to say. Choose, then act it out!", tag: "Speaking", need: () => lvItems(F.say).length > 0 },
    { id: "map", name: "City Map", art: "🗺️", g: "linear-gradient(135deg,#E39B2B,#E2725B)", p: "Opposite, next to, between: find the places on the map.", tag: "Prepositions", need: () => !!F.map },
    { id: "clock", name: "What Time Is It?", art: "🕘", g: "linear-gradient(135deg,#1A8A8F,#4C5FD5)", p: "Read the clock: quarter past, half past, quarter to.", tag: "Telling the time", need: () => !!F.clock },
    { id: "wordle", name: "Wordle", art: "🟩", g: "linear-gradient(135deg,#5E8C4F,#2E9E6B)", p: "Teams take turns to guess the word. Green, yellow, grey: six tries!", tag: "Spelling", need: () => !!F.wordle },
    { id: "pics", name: "What's This?", art: "🐘", g: "linear-gradient(135deg,#1A8A8F,#3DB2A6)", p: "A big picture and three words. The easiest game: say the word, then the sentence.", tag: "Easiest" },
    { id: "odd", name: "Odd One Out", art: "🍎🚗", g: "linear-gradient(135deg,#E2725B,#E39B2B)", p: "Four pictures. One is different! Find it and say why.", tag: "Easy" },
    { id: "hangman", name: "Hangman", art: "🔤", g: "linear-gradient(135deg,#D6457A,#9C5FC4)", p: "Guess the word letter by letter. Every wrong letter adds a part to the drawing!", tag: "Spelling" },
    { id: "mixed", name: "Mixed Letters", art: "🔀", g: "linear-gradient(135deg,#9C5FC4,#4C5FD5)", p: "The letters are all mixed up. Which team can find the word first?", tag: "Spelling" },
    { id: "countdown", name: "Clue Countdown", art: "⏳", g: "linear-gradient(135deg,#1a6b72,#2E9E6B)", p: "Clues one by one. Guess early for 400 points, or wait for more clues and get less!", tag: "Thinking" },
    { id: "riddles", need: () => R.words.length + R.movies.length > 0, name: "Emoji Riddles", art: "🦁👑", g: "linear-gradient(135deg,#4C5FD5,#5AA9E6)", p: "Sun + flower = ? Two pictures make one word, or guess what the pictures show.", tag: "Puzzle" },
    { id: "facts", need: () => R.facts.length > 0, name: "Fact or Fake?", art: "🤔", g: "linear-gradient(135deg,#2E9E6B,#5E8C4F)", p: "Surprising sentences. Every team votes: is it true or not? The answer is often a surprise!", tag: "Reading" },
    { id: "taboo", need: () => R.taboo.length > 0, name: "Taboo", art: "🤐", g: "linear-gradient(135deg,#D64545,#E2725B)", p: "Describe the word, but you can't say the words in red! How many can your team get?", tag: "Speaking" },
    { id: "draw", name: F.mime ? "Draw It! / Act It Out" : "Draw It!", art: "✏️", g: "linear-gradient(135deg,#5E8C4F,#7FB069)", p: "One student draws on the board. The team shouts the word in English.", tag: "Drawing" },
    { id: "rather", name: "Would You Rather?", art: "🐱🐶", g: "linear-gradient(135deg,#7C5CBF,#D6457A)", p: "Fly or be invisible? Everyone votes, then says why.", tag: "Speaking" },
    { id: "stop", name: "Stop!", art: "A–Z", g: "linear-gradient(135deg,#C9A84C,#E39B2B)", p: "A letter and five categories. Write an answer for each one before time is up!", tag: "Writing" },
    { id: "spin", name: "Spin & Talk", art: "🎡", g: "linear-gradient(135deg,#2E4A6B,#1a6b72)", p: "Spin the wheel and talk about the question. Easy, fun questions.", tag: "Speaking" }
  ];
  const LIST = () => GAMES.filter(g => (!g.need || g.need()) && !(F.hide || []).includes(g.id)).map(g => F.names && F.names[g.id] ? { ...g, name: F.names[g.id] } : g);
  // which games use the chosen pack (the others use the built-in lists)
  function packUse() {
    const pk = R.pack; if (!pk) return null;
    const pics = (pk.groups || []).reduce((n, g) => n + g.items.length, 0);
    return { pics: pics > 0, odd: (pk.groups || []).filter(g => g.items.length).length >= 2, hangman: pics > 0 || !!(pk.hang || []).length, draw: pics > 0, riddles: !!((pk.words || []).length + (pk.movies || []).length), rather: !!(pk.rather || []).length, stop: !!pk.stop, spin: (pk.talk || []).length >= 2,
      mixed: pics > 0 || !!(pk.hang || []).length, countdown: !!(pk.hang || []).length, taboo: !!(pk.taboo || []).length, facts: !!(pk.facts || []).length };
  }
  function packPanel() {
    const sel = el("select", { class: "set-sel", "aria-label": "Game pack", onchange: e => { S.pack = e.target.value; S.cats = []; applyPack(); save(); hub(); } },
      el("option", { value: "" }, `Built-in: everyday English (${BUILT.length} words)`),
      PACKS.items.map(x => el("option", { value: x.id, selected: x.id === S.pack }, x.title)));
    const pk = R.pack;
    return el("section", { class: "panel pack-panel" },
      el("div", { class: "row" }, el("h2", { style: "font-size:28px" }, "Game pack"), el("span", { class: "spacer" }), el("a", { class: "btn gold", href: "#/make" }, "+ Make a game pack")),
      el("p", { class: "muted", style: "margin:0" }, "A pack is your own words for one topic. Paste it from ChatGPT once, and all the games use it."),
      sel,
      pk ? el("div", { class: "set-cats" }, packSummary(pk).map(t => el("span", {}, t))) : null,
      pk ? el("div", { class: "row" }, el("a", { class: "btn", href: "#/make/" + pk.id }, "See or edit the text"),
        el("button", { class: "btn danger-t", onclick: () => { if (!confirm(`Delete the pack "${pk.title}"?`)) return; PACKS.remove(pk.id); S.pack = ""; S.cats = []; applyPack(); save(); hub(); toast("Pack deleted"); } }, "Delete pack")) : null);
  }
  function hub() {
    document.title = F.title || "Fun English Games";
    PACKS.onChange = () => { applyPack(); hub(); };
    const n = pool().length, use = packUse();
    const chips = el("div", { class: "sec-chips" }, CATS.map(c => el("button", { class: "chip" + (S.cats.includes(c.id) ? " on" : ""), style: `--cc:${catColor(c.id)}`, "aria-pressed": S.cats.includes(c.id) ? "true" : "false",
      onclick: () => { const nx = S.cats.includes(c.id) ? S.cats.filter(x => x !== c.id) : S.cats.concat(c.id); if (!nx.length) { toast("Keep at least one group on"); return; } S.cats = CATS.map(x => x.id).filter(id => nx.includes(id)); save(); hub(); } },
      c.name, el("small", {}, String(PICS.filter(p => p.c === c.id).length)))));
    const teams = el("div", { class: "team-edit" }, S.teams.map((t, i) => el("div", { class: "team-line" },
      el("span", { class: "dot", style: `background:${t.color}` }),
      el("input", { type: "text", value: t.name, maxlength: 20, "aria-label": `Team ${i + 1} name`, oninput: e => { t.name = e.target.value.trim() || `Team ${i + 1}`; save(); } }),
      el("button", { class: "mini", "aria-label": `Take 100 from ${t.name}`, onclick: () => { t.score -= 100; save(); hub(); } }, "−"),
      el("button", { class: "mini", "aria-label": `Give 100 to ${t.name}`, onclick: () => { t.score += 100; save(); hub(); } }, "+"),
      el("b", {}, String(t.score)))));
    put($("#app"),
      el("div", { class: "hub-hero" },
        el("div", {}, el("div", { class: "eyebrow" }, F.eyebrow || "Easy English · Pictures and speaking"), el("h1", {}, PFX === "fun2" ? ["Fun English ", el("em", {}, "2")] : ["Fun English ", el("em", {}, "Games")]),
          el("p", { class: "lede" }, R.pack ? `Playing with your pack "${R.pack.title}": ${PICS.length} words. Points add up across the games.` : F.lede ? `${F.lede} ${LIST().length} games, ${F.countQuestions ? (F.grammar || []).length + " questions" : PICS.length + " words"}.` : `${LIST().length} team games with ${PICS.length} everyday words and pictures. No hard vocabulary: animals, food, clothes, jobs and more. Points add up across the games.`),
          F.other ? el("a", { class: "btn other-set", href: F.other.href }, F.other.label + " →") : null),
        el("div", { class: "panel fun-pics", "aria-hidden": "true" }, shuffle(PICS.filter(p => p.e)).slice(0, 12).map(p => el("span", {}, p.e)))),
      packPanel(),
      el("div", { class: "games" }, LIST().map(g => el("a", { class: "gcard", href: "#/" + g.id, style: `--g:${g.g};text-decoration:none` },
        el("span", { class: "art pic-art", "aria-hidden": "true" }, g.art),
        el("div", {}, el("div", { class: "num" }, g.tag, use ? (use[g.id] ? " · your pack" : " · built-in words") : ""), el("h3", {}, g.name), el("p", {}, g.p)),
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
            el("button", { class: "btn", style: "padding:5px 12px;font-size:13px", onclick: () => { S.cats = CATS.map(c => c.id); save(); hub(); } }, "All")), chips),
          F.levels ? el("div", {}, el("b", { style: "display:block;margin-bottom:8px" }, "Level"), seg([["a1", "A1.2"], ["a2", "A2.2"], ["both", "Both (mixed class)"]], LV(), v => { S.level = v; save(); hub(); })) : null,
          el("div", {}, el("b", { style: "display:block;margin-bottom:8px" }, "Timer for each question"), seg([[0, "Off"], [15, "15 s"], [30, "30 s"], [45, "45 s"]], S.timer, v => { S.timer = v; save(); })))));
  }

  /* ================= 1. what's this? ================= */
  function pics() {
    const d = deck("pics", x => !!x.e);
    let mode = store.get(PFX + ".picmode", "word"), p, opts, tried, done, t;
    const modes = seg([["word", "Picture → word"], ["pic", "Word → picture"]], mode, v => { mode = v; store.set(PFX + ".picmode", v); next(); });
    function choose3() { const same = shuffle(pool().filter(x => x !== p && x.w !== p.w && x.e && x.e !== p.e)); return shuffle([p, ...same.slice(0, mode === "pic" ? 3 : 2)]); }
    function next() { if (t) t.stop(); p = d.take(); opts = choose3(); tried = []; done = false; draw(true); setCounter(`${CAT[p.c].name} · ${d.pos} of ${d.size}`); beep("open"); }
    function draw(fresh) {
      const color = catColor(p.c);
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 50 : 100;
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, CAT[p.c].name), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        mode === "word" || done ? el("div", { class: "pic big" + (done ? " pop" : "") }, p.e) : el("div", { class: "hs-word" }, p.w),
        done ? el("div", { class: "say" }, el("b", {}, p.w), el("span", {}, sentence(p)), F.tr && F.tr[p.w] && !R.pack ? el("span", { class: "tr-line" }, "Türkçe: " + F.tr[p.w]) : null) :
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
      const cats = shuffle(S.cats.filter(c => PICS.filter(p => p.c === c).length >= 3));
      const groups = CATS.map(c => c.id).filter(id => PICS.some(p => p.c === id));
      if (!cats.length || groups.length < 2) { toast("Odd One Out needs at least two picture groups"); location.hash = "#/"; return; }
      // groups that share words (a beach is nature and a place) are never mixed
      const CLOSE = ["nature|places", "sports|home", "clothes|home", "food|nature", "jobs|feelings", "body|feelings"];
      const main = cats[0], others = groups.filter(id => id !== main && !CLOSE.includes(main + "|" + id) && !CLOSE.includes(id + "|" + main));
      const other = pick(others.length ? others : groups.filter(id => id !== main));
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

  /* ================= 3. hangman ================= */
  // The board game figure: an orange wooden gallows on a little stage, and a white
  // figure with a cowboy hat. Each wrong letter adds one piece of the figure.
  const STAGE = `<g class="stage-wood">
      <path class="dk" d="M10 222h18v8H10zM14 214h14v8H14z"/>
      <rect x="26" y="200" width="160" height="16" rx="3"/>
      <rect class="dk" x="30" y="216" width="152" height="16" rx="2"/>
      <path class="ln" d="M58 200v16M90 200v16M122 200v16M154 200v16"/>
      <rect class="dk" x="34" y="232" width="12" height="8" rx="2"/><rect class="dk" x="166" y="232" width="12" height="8" rx="2"/>
      <rect x="42" y="24" width="15" height="178" rx="3"/>
      <rect x="42" y="16" width="120" height="15" rx="3"/>
      <path d="M57 58l30-27h12L57 70z"/>
      <path class="ln" d="M49 40v150"/>
    </g>
    <path class="hook" d="M150 31v9"/><circle class="hook" cx="150" cy="45" r="5"/>`;
  // [z-order, svg]: the order a piece is added is its place in this list; z keeps the hat on top
  const HANG_PARTS = [
    [5, `<g class="head"><ellipse cx="150" cy="84" rx="22" ry="24"/><circle class="eye" cx="142" cy="84" r="2.6"/><circle class="eye" cx="158" cy="84" r="2.6"/><path class="mouth" d="M144 95q6 4 12 0"/></g>`],
    [6, `<g class="hat"><path d="M131 64c0-18 6-24 19-24s19 6 19 24z"/><path class="band" d="M131 58h38v6h-38z"/><ellipse cx="150" cy="65" rx="34" ry="7"/></g>`],
    [4, `<path class="scarf" d="M136 106h28l-14 14z"/>`],
    [3, `<rect class="white" x="135" y="108" width="30" height="42" rx="13"/>`],
    [2, `<ellipse class="white" cx="128" cy="126" rx="6.5" ry="15" transform="rotate(32 128 126)"/>`],
    [2, `<ellipse class="white" cx="172" cy="126" rx="6.5" ry="15" transform="rotate(-32 172 126)"/>`],
    [1, `<g class="white"><rect x="137" y="146" width="11" height="34" rx="5"/><ellipse cx="140" cy="182" rx="9" ry="6"/></g>`],
    [1, `<g class="white"><rect x="152" y="146" width="11" height="34" rx="5"/><ellipse cx="160" cy="182" rx="9" ry="6"/></g>`]
  ];
  const LENGTHS = { short: [4, 5], mid: [6, 7], long: [8, 40], all: [4, 40] };
  const letterCount = w => w.replace(/[^a-z]/gi, "").length;
  function hangSvg(wrong, lost) {
    const shown = HANG_PARTS.map(([z, svg], i) => ({ z, svg, i })).filter(x => x.i < wrong).sort((a, b) => a.z - b.z);
    let man = shown.map(x => `<g class="hp${x.i === wrong - 1 ? " new" : ""}">${x.svg}</g>`).join("");
    if (lost) man = man.replace(/<circle class="eye"[^>]*\/><circle class="eye"[^>]*\/><path class="mouth"[^>]*\/>/, '<path class="xeye" d="M138 80l7 7m0-7l-7 7M154 80l7 7m0-7l-7 7"/><path class="mouth" d="M143 99q7-5 14 0"/>');
    const box = el("div", { class: "hang" + (lost ? " lost" : "") });
    // fixed markup only
    box.innerHTML = `<svg viewBox="0 0 200 244" aria-hidden="true">${STAGE}<g class="man">${man}</g></svg>`;
    return box;
  }
  // the words Hangman uses: the pack's [HANGMAN] list, or the pictures, or the built-in words
  function hangWords() {
    const pk = R.pack;
    if (pk && pk.hang && pk.hang.length) {
      const groupOf = w => { const g = (pk.groups || []).find(g => g.items.some(x => x.w.toLowerCase() === w.toLowerCase())); return g ? g.name : ""; };
      return pk.hang.map((x, i) => ({ c: "hang", w: x.w, clue: x.clue, cat: x.cat || groupOf(x.w) || pk.title, i }));
    }
    const clues = pk ? Object.fromEntries((pk.hang || []).map(x => [x.w.toLowerCase(), x.clue])) : F.clues || {};
    return pool().map(p => ({ ...p, clue: clues[p.w] || clues[p.w.toLowerCase()] || "" }));
  }
  function hangman() {
    const LIVES = HANG_PARTS.length;
    let len = store.get(PFX + ".hlen", F.hangLen || "short"), order = [], pos = 0, p, got, wrong, over, starter, hints;
    turn = turn % S.teams.length;
    const okWord = w => /^[a-z][a-z -]*[a-z]$/i.test(w);
    const makeDeck = () => {
      const [a, b] = LENGTHS[len] || LENGTHS.short, all = hangWords().filter(x => okWord(x.w) && letterCount(x.w) >= 4);
      const fit = all.filter(x => letterCount(x.w) >= a && letterCount(x.w) <= b);
      order = shuffle((fit.length ? fit : all).slice()); pos = 0;
    };
    const lens = seg([["short", "4–5 letters"], ["mid", "6–7 letters"], ["long", "8+ letters"], ["all", "All"]], len, v => { len = v; store.set(PFX + ".hlen", v); makeDeck(); next(); });
    function next() {
      if (!order.length) { toast("No words of 4 letters or more here"); location.hash = "#/"; return; }
      if (pos >= order.length) { order = shuffle(order); pos = 0; toast("All the words done! Starting again."); }
      p = order[pos++]; got = new Set(); wrong = []; over = null; starter = turn; hints = 0;
      paint(); setCounter(`Word ${pos} of ${order.length}`); beep("open");
    }
    const letters = () => [...p.w.toUpperCase()].filter(ch => /[A-Z]/.test(ch));
    const solved = () => letters().every(ch => got.has(ch));
    const bonus = () => Math.max(40, 100 - hints * 30);
    // the category is always on screen: Animals, Things, Places...
    const groupName = () => p.cat || (CAT[p.c] || {}).name || "";
    function hint() {
      if (over) return;
      hints++; beep("pass");
      if (hints >= 2 || !p.clue) {
        // show one letter
        const miss = letters().filter(ch => !got.has(ch));
        if (miss.length > 1) got.add(pick(miss));
      }
      paint();
    }
    function paint() {
      const tm = S.teams[turn], lost = over === "lost";
      const clue = p.clue || "";
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, over ? el("b", { style: "font-size:20px" }, over === "won" ? "Well done!" : "Oh no! The figure is finished.") : el("b", { style: `color:${tm.color};font-size:20px` }, `${tm.name}: pick a letter`), el("span", { class: "pos" }, `Mistakes: ${wrong.length} / ${LIVES}`)),
        el("div", { class: "hang-row" }, hangSvg(wrong.length, lost),
          el("div", { class: "hang-side" },
            groupName() ? el("div", { class: "cat-tag" }, el("small", {}, "Category"), el("b", {}, groupName())) : null,
            over && p.e ? el("span", { class: "pic mid pop" }, p.e) : null,
            !over && hints && clue ? el("div", { class: "clue-box" }, el("b", {}, "Hint: "), clue) : null,
            over && p.clue ? el("div", { class: "clue-box" }, p.clue) : null,
            el("div", { class: "hang-wrong" }, wrong.map(ch => el("s", {}, ch))))),
        el("div", { class: "slots" + (letterCount(p.w) > 8 ? " long" : ""), style: `--n:${p.w.length}` }, [...p.w.toUpperCase()].map(ch => ch === " " ? el("div", { class: "slot gap" }) : !/[A-Z]/.test(ch) ? el("div", { class: "slot fixed" }, ch) :
          el("div", { class: "slot" + (got.has(ch) || over ? " on" : "") + (lost && !got.has(ch) ? " miss" : "") }, got.has(ch) || over ? ch : ""))),
        over ? el("div", { class: "say" }, el("span", {}, p.c === "hang" ? p.w : sentence(p))) :
          el("div", { class: "keys" }, [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(ch => el("button", { class: "key" + (got.has(ch) ? " good" : "") + (wrong.includes(ch) ? " bad" : ""), disabled: got.has(ch) || wrong.includes(ch), onclick: () => guess(ch) }, ch))),
        over ? el("button", { class: "btn gold huge", onclick: () => { turn = (starter + 1) % S.teams.length; next(); } }, "Next word") :
          el("div", { class: "actions" },
            el("button", { class: "btn big hint-b", onclick: hint, disabled: hints >= 2 || (!clue && hints >= 1) }, hints === 0 ? (clue ? "Hint" : "Hint: show a letter") : hints === 1 && clue ? "One more hint: a letter" : "No more hints"),
            el("button", { class: "btn", onclick: () => { over = "lost"; beep("end"); paint(); } }, "Show the word")),
        el("div", { class: "hint" }, over ? "Everyone: spell it out loud together!" : `Right letter = +20 and play again. Wrong letter = one more piece of the figure, and the next team plays. Finish the word = +${bonus()}${hints ? " (hints used)" : ""}.`));
      swap(stage, "Hangman", lens, over ? -1 : turn);
      paintTurn(over ? -1 : turn);
    }
    function guess(ch) {
      if (over || got.has(ch) || wrong.includes(ch)) return;
      const n = letters().filter(x => x === ch).length;
      if (n) { got.add(ch); award(turn, 20 * n); if (solved()) { over = "won"; award(turn, bonus()); beep("win"); } }
      else { wrong.push(ch); beep("no"); if (wrong.length >= LIVES) { over = "lost"; beep("end"); } else turn = (turn + 1) % S.teams.length; }
      paint();
    }
    keys = e => { const k = e.key.toUpperCase(); if (over) { if (k === "ENTER" || k === " ") $(".btn.gold.huge").click(); return; } if (/^[A-Z]$/.test(k)) guess(k); else if (k === "?") hint(); };
    frame("Hangman", lens, stageOf("var(--c6)"), turn);
    makeDeck(); next();
  }


  /* ================= mixed letters ================= */
  function mixed() {
    const ok = x => /^[a-z][a-z -]*[a-z]$/i.test(x.w) && letterCount(x.w) >= 4 && letterCount(x.w) <= 12;
    const list = shuffle(hangWords().filter(ok));
    if (!list.length) { toast("No words for this game here"); location.hash = "#/"; return; }
    const nextW = cycle("mixed" + list.length, list);
    let p, tiles, hints, done, t, n = 0;
    const L = () => [...p.w.toUpperCase()].filter(ch => /[A-Z]/.test(ch));
    const mix = () => { let m; for (let k = 0; k < 20; k++) { m = shuffle(L()); if (m.join("") !== L().join("")) break; } return m; };
    const worth = () => Math.max(50, 200 - hints * 50);
    function next() { if (t) t.stop(); p = nextW(); tiles = mix(); hints = 0; done = false; n++; paint(true); setCounter(`Word ${n}`); beep("open"); }
    function paint(fresh) {
      const color = catColor(p.c);
      if (fresh) t = timer(S.timer);
      let k = 0;
      const cat = p.cat || (CAT[p.c] || {}).name || "";
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, cat ? el("div", { class: "cat-tag" }, el("small", {}, "Category"), el("b", {}, cat)) : el("span"), el("b", { style: "color:var(--gold)" }, `Worth ${worth()}`)),
        el("div", { class: "slots" + (letterCount(p.w) > 8 ? " long" : ""), style: `--n:${p.w.length}` }, [...p.w.toUpperCase()].map(ch => ch === " " ? el("div", { class: "slot gap" }) : !/[A-Z]/.test(ch) ? el("div", { class: "slot fixed" }, ch) : (done || k++ < hints ? el("div", { class: "slot on" }, ch) : el("div", { class: "slot" })))),
        done ? null : el("div", { class: "ltiles" }, tiles.map((ch, i) => el("div", { class: "ltile", style: `--i:${i};--r:${((i * 37) % 13) - 6}deg;--cc:${color}` }, ch))),
        done ? el("div", { class: "say" }, p.e ? el("span", { class: "pic mid pop" }, p.e) : null, el("span", {}, p.c === "hang" ? p.w : sentence(p))) : null,
        done ? null : t.node,
        done ? awardRow(worth(), next) : el("div", { class: "actions" },
          el("button", { class: "btn gold big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); paint(false); } }, "Show the word"),
          el("button", { class: "btn big", onclick: () => { tiles = mix(); beep("flip"); paint(false); } }, "Mix again"),
          el("button", { class: "btn big", disabled: hints >= L().length - 1, onclick: () => { hints++; beep("pass"); paint(false); } }, "Hint: a letter (−50)")),
        el("div", { class: "hint" }, done ? "Click the team that found it, or press N." : "Teams shout the word. Space = show the word · M = mix again · H = hint"));
      swap(stage, "Mixed Letters", null);
    }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } if (k === " " || k === "enter") { done = true; if (t) t.stop(); beep("ok"); paint(false); } else if (k === "m") { tiles = mix(); paint(false); } else if (k === "h" && hints < L().length - 1) { hints++; paint(false); } else if (k === "p" && t) t.toggle(); };
    frame("Mixed Letters", null, stageOf("#9C5FC4"));
    next();
  }

  /* ================= clue countdown ================= */
  // clue 1 = the category (400), clue 2 = the hint (300), clue 3 = first letter and length (200), clue 4 = the picture (100)
  function countdown() {
    const list = shuffle(hangWords().filter(x => x.clue));
    if (!list.length) { toast("This game needs words with clues"); location.hash = "#/"; return; }
    const nextW = cycle("countdown" + list.length, list);
    let p, step, done, n = 0;
    const steps = () => {
      const cat = p.cat || (CAT[p.c] || {}).name || "";
      const out = [];
      if (cat) out.push(["Category", cat]);
      out.push(["Clue", p.clue]);
      out.push(["Letters", `It starts with ${p.w[0].toUpperCase()} and has ${letterCount(p.w)} letters${/ /.test(p.w) ? " (two words)" : ""}.`]);
      if (p.e) out.push(["Picture", el("span", { class: "pic mid" }, p.e)]);
      return out;
    };
    const worth = () => [400, 300, 200, 100, 50][step] || 50;
    function next() { p = nextW(); step = 0; done = false; n++; paint(); setCounter(`Word ${n}`); beep("open"); }
    function paint() {
      const st = steps(), color = catColor(p.c);
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, `Clue ${Math.min(step + 1, st.length)} of ${st.length}`), el("b", { style: "color:var(--gold);font-size:20px" }, done ? "" : `Worth ${worth()}`)),
        el("div", { class: "clue-list" }, st.slice(0, done ? st.length : step + 1).map(([h, v], i) => el("div", { class: "clue-card" + (i === step && !done ? " new" : "") }, el("small", {}, h), el("div", {}, v)))),
        done ? el("div", { class: "say" }, el("b", {}, p.w)) : null,
        done ? awardRow(worth(), next) : el("div", { class: "actions" },
          step < st.length - 1 ? el("button", { class: "btn big", onclick: () => { step++; beep("pass"); paint(); } }, `Next clue (worth ${[400, 300, 200, 100, 50][step + 1]})`) : null,
          el("button", { class: "btn gold big", onclick: () => { done = true; beep("ok"); paint(); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that guessed it first." : "Teams can guess at any time, but only one guess per clue! Space = next clue · Enter = show the answer"));
      swap(stage, "Clue Countdown", null);
    }
    keys = e => { const k = e.key.toLowerCase(); if (done) { if (k === "n" || k === "enter") $("[data-nobody]").click(); return; } if (k === " " && step < steps().length - 1) { step++; paint(); } else if (k === "enter") { done = true; paint(); } };
    frame("Clue Countdown", null, stageOf("#1a6b72"));
    next();
  }

  /* ================= fact or fake? ================= */
  function facts() {
    if (!R.facts.length) { toast("No facts here yet"); location.hash = "#/"; return; }
    const nextF = cycle("facts", R.facts);
    let f, votes, shown, n = 0;
    function newQ() { f = nextF(); votes = S.teams.map(() => null); shown = false; n++; paint(); setCounter(`Sentence ${n}`); beep("open"); }
    function paint() {
      const stage = stageOf("#2E9E6B",
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, "Fact or fake?"), el("b", { style: "color:var(--gold)" }, "Worth 100")),
        el("div", { class: "fact-q" }, f.s),
        shown ? el("div", { class: "verdict " + (f.t ? "yes" : "no") }, f.t ? "FACT!" : "FAKE!") : null,
        shown && f.why ? el("div", { class: "why", style: `--cc:${f.t ? "var(--green)" : "var(--red)"}` }, f.why) : null,
        el("div", { class: "fact-votes" }, S.teams.map((tm, i) => el("div", { class: "fv", style: `--c:${tm.color}` }, el("b", {}, tm.name),
          el("div", { class: "fv-b" }, [true, false].map(v => el("button", { class: "fvb" + (votes[i] === v ? " on" : "") + (shown && votes[i] === v ? (v === f.t ? " right" : " wrong") : ""), disabled: shown, onclick: () => { votes[i] = v; beep("flip"); paint(); } }, v ? "Fact" : "Fake")))))),
        shown ? el("button", { class: "btn gold huge", onclick: newQ }, "Next sentence") : el("button", { class: "btn gold huge", disabled: votes.every(v => v === null), onclick: reveal }, "Show the answer"),
        el("div", { class: "hint" }, shown ? "Ask a student: say it again in your own words." : "Each team talks for 20 seconds, then chooses. Every right team gets +100."));
      swap(stage, "Fact or Fake?", null);
    }
    function reveal() { shown = true; let any = false; votes.forEach((v, i) => { if (v === f.t) { award(i, 100); any = true; } }); if (!any) beep("no"); paint(); }
    keys = e => { if (e.key === "Enter" || e.key === " ") { if (shown) newQ(); else if (!votes.every(v => v === null)) reveal(); } };
    frame("Fact or Fake?", null, stageOf("#2E9E6B"));
    newQ();
  }

  /* ================= taboo ================= */
  function taboo() {
    if (!R.taboo.length) { toast("No Taboo cards here yet"); location.hash = "#/"; return; }
    const nextC = cycle("taboo", R.taboo);
    let secs = store.get(PFX + ".taboo", 60), card, live = false, rg, got = [];
    turn = turn % S.teams.length;
    const lens = seg([[45, "45 s"], [60, "60 s"], [90, "90 s"]], secs, v => { secs = v; store.set(PFX + ".taboo", v); });
    function intro() {
      live = false; if (rg) rg.stop();
      const tm = S.teams[turn];
      const stage = stageOf(tm.color,
        el("div", { class: "eyebrow" }, "Next to describe"), el("div", { class: "hs-word", style: `color:${tm.color}` }, tm.name),
        el("div", { class: "rules" },
          el("div", {}, el("b", {}, "1. "), "One student comes to the screen (or takes the phone) and holds the card."),
          el("div", {}, el("b", {}, "2. "), "Describe the word in English. Don't say the word or the words in red!"),
          el("div", {}, el("b", {}, "3. "), `The team guesses: correct = +100. Said a red word? Oops = −50. You have ${secs} seconds: get as many as you can!`)),
        el("button", { class: "btn gold huge", onclick: start }, "Start"));
      swap(stage, "Taboo", lens, turn); paintTurn(turn);
    }
    function start() { live = true; got = []; card = nextC(); rg = ring(secs, end); paint(); beep("open"); }
    function paint() {
      const tm = S.teams[turn];
      const peek = el("button", { class: "peek taboo-card", "aria-label": "Hold to see the card",
        onpointerdown: e => { e.preventDefault(); peek.classList.add("open"); }, onpointerup: () => peek.classList.remove("open"), onpointerleave: () => peek.classList.remove("open"), onpointercancel: () => peek.classList.remove("open"), oncontextmenu: e => e.preventDefault() },
        el("span", { class: "cover" }, el("b", {}, "Describer only"), el("small", {}, "Hold here to see the card")),
        el("span", { class: "secret" }, el("b", {}, card.w), el("small", {}, "Don't say:"), el("span", { class: "no-words" }, card.no.map(x => el("i", {}, x)))));
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${tm.color};font-size:20px` }, tm.name), rg.node, el("b", { style: "font-size:20px" }, `Correct: ${got.filter(x => x.k === "ok").length}`)),
        peek,
        el("div", { class: "actions" },
          el("button", { class: "btn huge", style: "background:var(--green);border-color:var(--green);color:#fff", onclick: () => mark("ok") }, "Got it"),
          el("button", { class: "btn big", onclick: () => mark("skip") }, "Skip"),
          el("button", { class: "btn big", style: "border-color:var(--red);color:var(--red)", onclick: () => mark("oops") }, "Oops! (−50)"),
          el("button", { class: "btn big", "data-pause": "1", onclick: e => { e.currentTarget.textContent = rg.toggle() ? "Resume" : "Pause"; } }, "Pause")),
        el("div", { class: "hint" }, "Space = got it · S = skip · O = oops · W = peek on a laptop"));
      swap(stage, "Taboo", lens, turn);
    }
    function mark(k) { if (!live) return; got.push({ w: card.w, k }); if (k === "ok") award(turn, 100); else if (k === "oops") award(turn, -50); else beep("pass"); card = nextC(); paint(); }
    function end() {
      live = false; const tm = S.teams[turn], n = got.filter(x => x.k === "ok").length, o = got.filter(x => x.k === "oops").length;
      const stage = stageOf(tm.color,
        el("div", { class: "eyebrow" }, "Time's up!"), el("div", { class: "hs-word", style: `color:${tm.color}` }, `${tm.name}: ${n * 100 - o * 50 >= 0 ? "+" : ""}${n * 100 - o * 50}`),
        el("div", { class: "got" }, got.map(x => el("span", { class: x.k === "ok" ? "" : "skip" }, x.w))),
        el("button", { class: "btn gold huge", onclick: () => { turn = (turn + 1) % S.teams.length; intro(); } }, `Next: ${S.teams[(turn + 1) % S.teams.length].name}`));
      swap(stage, "Taboo", lens, turn);
    }
    keys = e => {
      const k = e.key.toLowerCase();
      if (!live) { if (k === "enter") { const b = $(".stage .btn.gold.huge"); if (b) b.click(); } return; }
      if (k === " " || k === "enter") mark("ok"); else if (k === "s") mark("skip"); else if (k === "o") mark("oops"); else if (k === "p") $("[data-pause]").click();
      else if (k === "w") { const q = $(".peek"); if (q) { q.classList.add("open"); setTimeout(() => q.classList.remove("open"), 1500); } }
    };
    frame("Taboo", lens, stageOf("#D64545"), turn);
    intro();
  }


  /* ================= class games (shown when the word set has their data) ================= */
  const lvItems = list => (list || []).filter(x => lvlOk(x.lv));
  const optRow = (opts, tried, done, right, pick, keysOn = true) => el("div", { class: "opts4" + (opts.length === 3 ? " g3" : opts.length === 2 ? " g2" : "") }, opts.map((o, i) => el("button", { class: "opt4" + (tried.includes(o) ? " wrong" : "") + (done && o === right ? " right" : ""), disabled: done, onclick: () => pick(o) }, keysOn ? el("span", { class: "k" }, "ABCD"[i]) : null, o)));
  const pickKeys = (opts, pick) => e => { const i = "abcd".indexOf(e.key.toLowerCase()); if (i >= 0 && opts[i]) pick(opts[i]); };

  /* ----- reading race: the four stories, at A1.2 or A2.2 ----- */
  function reading() {
    const RD = F.readings;
    let story = null, ver = LV() === "a2" ? "a2" : "a1", qi = 0, opts = [], tried = [], done = false, phase = "pick", showText = true;
    const V = () => story.versions[ver];
    function paint() {
      if (phase === "pick") {
        const stage = stageOf("#4C5FD5",
          el("div", { class: "eyebrow" }, "Choose a story"),
          el("div", { class: "row", style: "justify-content:center" }, el("b", {}, "Level:"), seg([["a1", "A1.2"], ["a2", "A2.2"]], ver, v => { ver = v; })),
          el("div", { class: "story-list" }, RD.map((r, i) => el("button", { class: "story-card", style: `--cc:${GROUP_COLORS[i]}`, onclick: () => { story = r; phase = "read"; qi = 0; paint(); beep("open"); } },
            el("small", {}, `Story ${i + 1} · ${r.kind}`), el("b", {}, r.title), el("span", {}, `${r.versions.a1.qs.length} questions (A1.2) · ${r.versions.a2.qs.length} questions (A2.2)`)))),
          el("div", { class: "hint" }, "Both versions tell the same story with the same people, so the two groups can read it at their own level."));
        swap(stage, "Reading Race", null); setCounter(""); return;
      }
      const v = V(), color = ver === "a1" ? "#2E9E6B" : "#7C5CBF";
      const text = el("div", { class: "reading" + (phase === "quiz" && !showText ? " closed" : "") }, el("div", { class: "reading-h" }, el("span", { class: "lvl-tag " + ver }, ver === "a1" ? "A1.2" : "A2.2"), el("b", {}, v.title)), v.text.split(/\n\n+/).map(par => el("p", {}, par)));
      if (phase === "read") {
        const stage = stageOf(color, text,
          el("div", { class: "actions" }, el("button", { class: "btn gold big", onclick: () => { phase = "quiz"; qi = 0; showText = false; newQ(); } }, `Start the questions (${v.qs.length})`),
            el("button", { class: "btn big", onclick: () => { ver = ver === "a1" ? "a2" : "a1"; paint(); } }, ver === "a1" ? "Read the A2.2 version" : "Read the A1.2 version"),
            el("button", { class: "btn big", onclick: () => { phase = "pick"; paint(); } }, "Other stories")),
          el("div", { class: "hint" }, "Read together, or give the class 3 minutes to read alone. Then start the questions."));
        swap(stage, "Reading Race", null); setCounter(story.title); return;
      }
      if (phase === "end") {
        const stage = stageOf(color, el("div", { class: "hs-word", style: `color:${color}` }, "Well done!"), el("p", { class: "muted" }, `You finished the ${ver === "a1" ? "A1.2" : "A2.2"} questions for "${story.title}".`),
          el("div", { class: "actions" }, el("button", { class: "btn gold big", onclick: () => { ver = ver === "a1" ? "a2" : "a1"; phase = "read"; paint(); } }, ver === "a1" ? "Now the A2.2 version" : "Now the A1.2 version"), el("button", { class: "btn big", onclick: () => { phase = "pick"; paint(); } }, "Other stories")));
        swap(stage, "Reading Race", null); return;
      }
      const q = v.qs[qi], worth = tried.length ? 50 : 100;
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, `Question ${qi + 1} of ${v.qs.length}`), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "fact-q" }, q.q),
        optRow(opts, tried, done, q.a, choose, true),
        done ? awardRow(worth, () => { qi++; if (qi >= v.qs.length) { phase = "end"; paint(); } else newQ(); }) : el("div", { class: "actions" },
          el("button", { class: "btn big", onclick: () => { showText = !showText; paint(); } }, showText ? "Hide the text" : "Read the text again"),
          el("button", { class: "btn big", onclick: () => { done = true; beep("ok"); paint(); } }, "Show the answer")),
        text,
        el("div", { class: "hint" }, done ? "Ask: where is the answer in the text?" : "Teams find the answer in the text. Tap it (or press A–C). Wrong = red, the next team tries for 50."));
      swap(stage, "Reading Race", null); setCounter(story.title);
    }
    function newQ() { const q = V().qs[qi]; opts = shuffle(q.o.slice()); tried = []; done = false; paint(); beep("open"); }
    function choose(o) { const q = V().qs[qi]; if (done || tried.includes(o)) return; if (o === q.a) { done = true; beep("ok"); } else { tried.push(o); beep("no"); } paint(); }
    keys = e => { if (phase !== "quiz") return; if (done) { if (e.key === "n" || e.key === "Enter") $("[data-nobody]").click(); return; } pickKeys(opts, choose)(e); };
    frame("Reading Race", null, stageOf("#4C5FD5"));
    paint();
  }

  /* ----- grammar battle ----- */
  function grammar() {
    const GNAME = (F.names && F.names.grammar) || "Grammar Battle";
    const TOP = F.grammarTopics || [], ALL = lvItems(F.grammar);
    const have = TOP.map((_, i) => ALL.some(g => g.t === i));
    let on = store.get(PFX + ".gtop", TOP.map((_, i) => i)).filter(i => have[i]); if (!on.length) on = TOP.map((_, i) => i).filter(i => have[i]);
    let order, pos, q, opts, tried, done, t;
    const chips = el("div", { class: "sec-chips gtops" });
    function paintChips() {
      put(chips, TOP.map((name, i) => have[i] ? el("button", { class: "chip" + (on.includes(i) ? " on" : ""), style: `--cc:${GROUP_COLORS[i % GROUP_COLORS.length]}`, onclick: () => { const nx = on.includes(i) ? on.filter(x => x !== i) : on.concat(i).sort((a, b) => a - b); if (!nx.length) { toast("Keep at least one topic on"); return; } on = nx; store.set(PFX + ".gtop", on); paintChips(); restart(); } }, name, el("small", {}, String(ALL.filter(g => g.t === i).length))) : null));
    }
    function restart() { order = shuffle(ALL.filter(g => on.includes(g.t))); pos = 0; next(); }
    function next() { if (t) t.stop(); if (pos >= order.length) { order = shuffle(order); pos = 0; toast("All the questions done! Starting again."); } q = order[pos++]; opts = shuffle(q.o.slice()); tried = []; done = false; paint(true); setCounter(`Question ${pos} of ${order.length}`); beep("open"); }
    const filled = () => { const parts = q.q.split("___"); if (parts.length > 2) return gapParts(q, true); const [a, b] = parts; return [q.a[0] === "'" ? a.trimEnd() : a, el("mark", {}, q.a), b]; };
    const blanked = () => gapParts(q, false);
    function paint(fresh) {
      const color = GROUP_COLORS[q.t % GROUP_COLORS.length];
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 100 : 200;
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, TOP[q.t] + (F.levels && q.lv !== "both" ? ` · ${q.lv === "a1" ? "A1.2" : "A2.2"}` : "")), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "sentence" }, done ? filled() : blanked()),
        done ? null : optRow(opts, tried, done, q.a, choose),
        done ? null : t.node,
        done ? el("div", { class: "why", style: `--cc:${color}` }, el("b", {}, "Why? "), q.why) : null,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); paint(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : "Tap the answer a team says (or press A–C). A wrong answer turns red and the next team can steal it for 100."));
      swap(stage, GNAME, null, -1);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === q.a) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } paint(false); }
    keys = e => { if (done) { if (e.key === "n" || e.key === "Enter") $("[data-nobody]").click(); return; } pickKeys(opts, choose)(e); };
    put($("#app"), el("div", { class: "game-head" }, el("a", { class: "btn", href: "#/" }, "← All games"), el("h2", {}, GNAME), el("span", { class: "counter", id: "counter" }, "")), el("div", { class: "gwrap" }, chips, stageOf("#C9A84C")), scorebar());
    paintChips(); restart();
  }

  /* ----- sentence match: join the two halves ----- */
  function halves() {
    const list = lvItems(F.halves);
    const nextH = cycle("halves" + LV(), list);
    let h, opts, tried, done, t, n = 0;
    function next() {
      if (t) t.stop(); h = nextH(); n++;
      const others = shuffle(list.filter(x => x !== h && x.lv === h.lv)).slice(0, 2).map(x => x.b);
      opts = shuffle([h.b, ...others]); tried = []; done = false; paint(true); setCounter(`Sentence ${n}`); beep("open");
    }
    function paint(fresh) {
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 50 : 100, color = h.lv === "a1" ? "#2E9E6B" : "#7C5CBF";
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, F.levels ? (h.lv === "a1" ? "A1.2" : "A2.2") : "Finish the sentence"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "sentence" }, h.a, " ", done ? el("mark", {}, h.b) : el("span", { class: "blank" }, " ")),
        done ? null : optRow(opts, tried, done, h.b, choose),
        done ? null : t.node,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); paint(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Everyone: read the whole sentence together!" : "Which ending is right? Tap it (or press A–C). Wrong = red, the next team tries for 50."));
      swap(stage, "Sentence Match", null);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === h.b) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(o); beep("no"); } paint(false); }
    keys = e => { if (done) { if (e.key === "n" || e.key === "Enter") $("[data-nobody]").click(); return; } pickKeys(opts, choose)(e); };
    frame("Sentence Match", null, stageOf("#2E9E6B"));
    next();
  }

  /* ----- what do you say? everyday expressions ----- */
  function sayIt() {
    const list = lvItems(F.say);
    const nextS = cycle("say" + LV(), list);
    let s, opts, tried, done, n = 0;
    function next() { s = nextS(); opts = shuffle(s.o.slice()); tried = []; done = false; n++; paint(); setCounter(`Situation ${n}`); beep("open"); }
    function paint() {
      const worth = tried.length ? 50 : 100, color = s.lv === "a1" ? "#2E9E6B" : "#7C5CBF";
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, "What do you say?" + (F.levels ? ` · ${s.lv === "a1" ? "A1.2" : "A2.2"}` : "")), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "fact-q" }, s.s),
        optRow(opts, tried, done, s.a, choose),
        done ? el("div", { class: "why", style: `--cc:${color}` }, el("b", {}, "Act it! "), "Two students say it as a short dialogue. Can you add one more line?") : null,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; beep("ok"); paint(); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : "Which is the best thing to say? Tap it (or press A–C)."));
      swap(stage, "What Do You Say?", null);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === s.a) { done = true; beep("ok"); } else { tried.push(o); beep("no"); } paint(); }
    keys = e => { if (done) { if (e.key === "n" || e.key === "Enter") $("[data-nobody]").click(); return; } pickKeys(opts, choose)(e); };
    frame("What Do You Say?", null, stageOf("#D6457A"));
    next();
  }

  /* ----- city map: prepositions of place ----- */
  const MAP_PLACES = [["museum", "🏛️"], ["bank", "🏦"], ["park", "🌳"], ["library", "📚"], ["hospital", "🏥"], ["post office", "🏣"], ["café", "☕"], ["mosque", "🕌"], ["hotel", "🏨"], ["school", "🏫"], ["cinema", "🎬"], ["supermarket", "🛒"]];
  function cityMap() {
    let grid, q, opts, tried, done, n = 0;
    const cell = (r, c) => grid[r * 4 + c];
    function newMap() { grid = shuffle(MAP_PLACES.slice()).slice(0, 8); next(); }
    function next() {
      n++;
      const kinds = ["opposite", "between", "rel", "where"], k = pick(kinds), r = Math.floor(Math.random() * 2);
      const nm = x => `the ${x[0]}`;
      if (k === "opposite") { const c = Math.floor(Math.random() * 4); q = { text: `What is opposite ${nm(cell(r, c))}?`, a: cell(1 - r, c)[0], hl: [cell(r, c)] }; }
      else if (k === "between") { const c = 1 + Math.floor(Math.random() * 2); q = { text: `What is between ${nm(cell(r, c - 1))} and ${nm(cell(r, c + 1))}?`, a: cell(r, c)[0], hl: [cell(r, c - 1), cell(r, c + 1)] }; }
      else {
        const c = Math.floor(Math.random() * 4), A = cell(r, c);
        const rel = pick(c > 0 && c < 3 ? ["next to", "opposite", "between"] : ["next to", "opposite"]);
        const B = rel === "opposite" ? cell(1 - r, c) : rel === "next to" ? cell(r, c === 3 ? 2 : c + 1) : cell(r, c - 1), C = rel === "between" ? cell(r, c + 1) : null;
        const sent = rel === "between" ? `It's between ${nm(B)} and ${nm(C)}.` : `It's ${rel} ${nm(B)}.`;
        if (k === "rel") q = { text: rel === "between" ? `The ${A[0]} is ___ ${nm(B)} and ${nm(C)}.` : `The ${A[0]} is ___ ${nm(B)}.`, a: rel, choices: ["next to", "opposite", "between"], hl: [A] };
        else {
          // two wrong sentences about other buildings
          const wrong = shuffle(grid.filter(x => x !== A && x !== B && x !== C)).slice(0, 2).map((x, i) => i ? `It's opposite ${nm(x)}.` : `It's next to ${nm(x)}.`);
          q = { text: `Where is the ${A[0]}?`, a: sent, choices: [sent, ...wrong], hl: [A] };
        }
      }
      if (!q.choices) q.choices = [q.a, ...shuffle(grid.map(x => x[0]).filter(x => x !== q.a && !q.hl.some(h => h[0] === x))).slice(0, 2)];
      opts = shuffle(q.choices.slice()); tried = []; done = false; paint(); setCounter(`Question ${n}`); beep("open");
    }
    function paint() {
      const worth = tried.length ? 50 : 100;
      const tile = x => el("div", { class: "map-b" + (q.hl.includes(x) ? " hl" : "") + (done && x[0] === q.a ? " ans" : "") }, el("span", { class: "pic" }, x[1]), el("b", {}, x[0]));
      const stage = stageOf("#E39B2B",
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, "Look at the map"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "city-map" }, el("div", { class: "map-row" }, grid.slice(0, 4).map(tile)), el("div", { class: "map-road" }, el("span", {}, "Station Street")), el("div", { class: "map-row" }, grid.slice(4).map(tile))),
        el("div", { class: "fact-q" }, q.text),
        optRow(opts, tried, done, q.a, choose),
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; beep("ok"); paint(); } }, "Show the answer"), el("button", { class: "btn big", onclick: newMap }, "New map")),
        el("div", { class: "hint" }, done ? "Now ask your own question about the map!" : "opposite = across the street · next to = beside · between = in the middle of two"));
      swap(stage, "City Map", null);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === q.a) { done = true; beep("ok"); } else { tried.push(o); beep("no"); } paint(); }
    keys = e => { if (done) { if (e.key === "n" || e.key === "Enter") $("[data-nobody]").click(); return; } pickKeys(opts, choose)(e); };
    frame("City Map", null, stageOf("#E39B2B"));
    newMap();
  }

  /* ----- what time is it? ----- */
  const NUM = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const MIN = { 5: "five", 10: "ten", 15: "quarter", 20: "twenty", 25: "twenty-five", 30: "half" };
  function timeWords(h, m) {
    const hh = h % 12 || 12, nx = h % 12 + 1;
    if (m === 0) return `${NUM[hh]} o'clock`;
    if (m <= 30) return `${MIN[m]} past ${NUM[hh]}`;
    return `${MIN[60 - m]} to ${NUM[nx]}`;
  }
  function clockSvg(h, m) {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    const nums = Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * 30 * Math.PI / 180; return `<text x="${100 + 72 * Math.sin(a)}" y="${100 - 72 * Math.cos(a) + 7}" text-anchor="middle">${i + 1}</text>`; }).join("");
    const ticks = Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 88 : 84; return `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 92 * Math.sin(a)}" y2="${100 - 92 * Math.cos(a)}" class="${i % 5 ? "tk" : "tk big"}"/>`; }).join("");
    const box = el("div", { class: "clock" });
    // fixed markup only
    box.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" class="face"/>${ticks}${nums}<line x1="100" y1="100" x2="${100 + 46 * Math.sin(ha * Math.PI / 180)}" y2="${100 - 46 * Math.cos(ha * Math.PI / 180)}" class="hh"/><line x1="100" y1="100" x2="${100 + 70 * Math.sin(ma * Math.PI / 180)}" y2="${100 - 70 * Math.cos(ma * Math.PI / 180)}" class="mh"/><circle cx="100" cy="100" r="6" class="pin"/></svg>`;
    return box;
  }
  function clock() {
    let h, m, opts, tried, done, n = 0, step = store.get(PFX + ".clockstep", 15);
    const steps = seg([[15, "Easy: o'clock, quarter, half"], [5, "Every 5 minutes"]], step, v => { step = v; store.set(PFX + ".clockstep", v); next(); });
    function next() {
      h = 1 + Math.floor(Math.random() * 12); m = step * Math.floor(Math.random() * (60 / step));
      const right = timeWords(h, m), set = new Set([right]);
      const alt = [timeWords(h % 12 + 1, m), m ? timeWords(h, 60 - m) : timeWords(h + 6, 0), m > 0 && m < 60 ? timeWords(h, (m + 30) % 60 || 30) : timeWords(h + 1, 0)];
      for (const a of shuffle(alt)) { if (set.size >= 3) break; set.add(a); }
      while (set.size < 3) set.add(timeWords(1 + Math.floor(Math.random() * 12), step * Math.floor(Math.random() * (60 / step))));
      opts = shuffle([...set]); tried = []; done = false; n++; paint(); setCounter(`Clock ${n}`); beep("open");
    }
    const digital = () => `${h}:${String(m).padStart(2, "0")}`;
    function paint() {
      const worth = tried.length ? 50 : 100;
      const stage = stageOf("#1A8A8F",
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, "What time is it?"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        clockSvg(h, m),
        done ? el("div", { class: "say" }, el("b", {}, `It's ${timeWords(h, m)}.`), el("span", {}, `${digital()} · You can also say: "It's ${NUM[h % 12 || 12]} ${m === 0 ? "o'clock" : m < 10 ? "oh " + NUM[m] : ({ 15: "fifteen", 20: "twenty", 25: "twenty-five", 30: "thirty", 35: "thirty-five", 40: "forty", 45: "forty-five", 50: "fifty", 55: "fifty-five", 10: "ten" })[m]}."`)) : null,
        optRow(opts, tried, done, timeWords(h, m), choose),
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; beep("ok"); paint(); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Ask a student: What time do you get up? What time does school start?" : "The long hand shows the minutes, the short hand shows the hour."));
      swap(stage, "What Time Is It?", steps);
    }
    function choose(o) { if (done || tried.includes(o)) return; if (o === timeWords(h, m)) { done = true; beep("ok"); } else { tried.push(o); beep("no"); } paint(); }
    keys = e => { if (done) { if (e.key === "n" || e.key === "Enter") $("[data-nobody]").click(); return; } pickKeys(opts, choose)(e); };
    frame("What Time Is It?", steps, stageOf("#1A8A8F"));
    next();
  }

  /* ----- wordle: teams take turns to guess a word ----- */
  function wordle() {
    const lens = Object.keys(F.wordle || {}).filter(k => (F.wordle[k] || []).length);
    let L = store.get(PFX + ".wlen", lens[0]); if (!lens.includes(String(L))) L = lens[0];
    let word, guesses, cur, over, starter;
    turn = turn % S.teams.length;
    const ctr = seg(lens.map(k => [k, `${k} letters`]), String(L), v => { L = v; store.set(PFX + ".wlen", v); next(); });
    function next() { word = cycle("wordle" + L, F.wordle[L])().toUpperCase(); guesses = []; cur = ""; over = null; starter = turn; paint(); setCounter(`${L}-letter word`); beep("open"); }
    function score(g) {
      const res = Array(g.length).fill("no"), left = {};
      for (let i = 0; i < g.length; i++) if (g[i] === word[i]) res[i] = "ok"; else left[word[i]] = (left[word[i]] || 0) + 1;
      for (let i = 0; i < g.length; i++) if (res[i] !== "ok" && left[g[i]] > 0) { res[i] = "near"; left[g[i]]--; }
      return res;
    }
    function keyState() { const st = {}; for (const g of guesses) score(g).forEach((r, i) => { const k = g[i], rank = { ok: 3, near: 2, no: 1 }; if (!st[k] || rank[r] > rank[st[k]]) st[k] = r; }); return st; }
    function paint() {
      const tm = S.teams[turn], ks = keyState(), worth = (7 - (guesses.length + 1)) * 100;
      const rows = Array.from({ length: 6 }, (_, r) => {
        const g = guesses[r], res = g ? score(g) : null, live = r === guesses.length && !over;
        return el("div", { class: "w-row" }, Array.from({ length: +L }, (_, i) => el("div", { class: "w-cell" + (res ? " " + res[i] : "") + (live && cur[i] ? " typed" : "") }, g ? g[i] : live ? cur[i] || "" : "")));
      });
      const kb = ["QWERTYUIOP", "ASDFGHJKL", "+ZXCVBNM-"].map(row => el("div", { class: "w-kb-row" }, [...row].map(ch => ch === "+" ? el("button", { class: "w-key wide", onclick: enter }, "Enter") : ch === "-" ? el("button", { class: "w-key wide", onclick: back, "aria-label": "Delete" }, "Del") : el("button", { class: "w-key " + (ks[ch] || ""), onclick: () => type(ch) }, ch))));
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, over ? el("b", { style: "font-size:20px" }, over === "won" ? `${S.teams[turn].name} found it!` : "No more tries!") : el("b", { style: `color:${tm.color};font-size:20px` }, `${tm.name}: guess a word`), el("b", { style: "color:var(--gold)" }, over ? "" : `Worth ${worth}`)),
        el("div", { class: "w-grid" }, rows),
        over ? el("div", { class: "say" }, el("b", {}, word)) : el("div", { class: "w-kb" }, kb),
        over ? el("button", { class: "btn gold huge", onclick: () => { turn = (starter + 1) % S.teams.length; next(); } }, "Next word") : el("div", { class: "actions" }, el("button", { class: "btn", onclick: () => { over = "lost"; beep("end"); paint(); } }, "Show the word")),
        el("div", { class: "hint" }, over ? "Everyone: make a sentence with the word!" : "Green = right letter, right place. Yellow = in the word, wrong place. Grey = not in the word. Each team guesses once, then the next team."));
      swap(stage, "Wordle", ctr, over ? -1 : turn); paintTurn(over ? -1 : turn);
    }
    function type(ch) { if (over || cur.length >= +L) return; cur += ch; beep("flip"); paint(); }
    function back() { if (over) return; cur = cur.slice(0, -1); paint(); }
    function enter() {
      if (over) return; if (cur.length < +L) { toast(`The word has ${L} letters`); return; }
      guesses.push(cur); const won = cur === word; cur = "";
      if (won) { over = "won"; award(turn, (7 - guesses.length) * 100); beep("win"); }
      else if (guesses.length >= 6) { over = "lost"; beep("end"); }
      else { beep("no"); turn = (turn + 1) % S.teams.length; }
      paint();
    }
    keys = e => { const k = e.key; if (over) { if (k === "Enter") $(".stage .btn.gold.huge").click(); return; } if (k === "Enter") enter(); else if (k === "Backspace") back(); else if (/^[a-z]$/i.test(k)) type(k.toUpperCase()); };
    frame("Wordle", ctr, stageOf("#5E8C4F"), turn);
    next();
  }


  /* ----- shared by the exam games: a sentence with one or more gaps ----- */
  const gapParts = (q, fill) => { const parts = q.q.split("___"), ans = q.a.split(" / "); return parts.flatMap((p, i) => i < parts.length - 1 ? [p, fill ? el("mark", {}, ans[i] || "") : el("span", { class: "blank" }, " ")] : [p]); };
  // topic chips that remember their choice; calls change() when it changes
  function topicChips(change) {
    const TOP = F.grammarTopics || [], ALL = lvItems(F.grammar), have = TOP.map((_, i) => ALL.some(g => g.t === i));
    let on = store.get(PFX + ".gtop", TOP.map((_, i) => i)).filter(i => have[i]); if (!on.length) on = TOP.map((_, i) => i).filter(i => have[i]);
    const box = el("div", { class: "sec-chips gtops" });
    const paint = () => put(box, TOP.map((name, i) => have[i] ? el("button", { class: "chip" + (on.includes(i) ? " on" : ""), style: `--cc:${GROUP_COLORS[i % GROUP_COLORS.length]}`, onclick: () => { const nx = on.includes(i) ? on.filter(x => x !== i) : on.concat(i).sort((a, b) => a - b); if (!nx.length) { toast("Keep at least one topic on"); return; } on = nx; store.set(PFX + ".gtop", on); paint(); change(); } }, name, el("small", {}, String(ALL.filter(g => g.t === i).length))) : null));
    paint();
    return { node: box, items: () => ALL.filter(g => on.includes(g.t)) };
  }

  /* ----- mini test: ten questions for one student, with a score and a review ----- */
  function minitest() {
    let qs = [], i = 0, picks = [], opts = [], phase = "start";
    const chips = topicChips(() => { if (phase === "start") paint(); });
    function begin() { qs = shuffle(chips.items().slice()).slice(0, 10); i = 0; picks = []; phase = "q"; newQ(); }
    function newQ() { opts = shuffle(qs[i].o.slice()); paint(); beep("open"); }
    function paint() {
      if (phase === "start") {
        const stage = stageOf("#4C5FD5", el("div", { class: "eyebrow" }, "Practise for the exam"), el("div", { class: "hs-word", style: "color:#4C5FD5;font-size:clamp(40px,7vw,80px)" }, "Mini Test"),
          el("p", { class: "lede", style: "margin:0;text-align:center" }, "Ten short questions from the topics you choose. You see the right answer and the rule after each one, and your score at the end."),
          chips.node, el("button", { class: "btn gold huge", onclick: begin }, "Start the test"),
          el("div", { class: "hint" }, "Students can also do it alone on their phones."));
        swap(stage, "Mini Test", null, -1); setCounter(""); return;
      }
      if (phase === "end") {
        const n = picks.filter((p, k) => p === qs[k].a).length, pct = Math.round(n / qs.length * 100);
        const msg = n === qs.length ? "Perfect! You are ready for the exam." : pct >= 80 ? "Excellent! Just a few things to check." : pct >= 60 ? "Good! Look at your mistakes below." : pct >= 40 ? "Not bad. Practise these topics again." : "Keep practising. You can do it!";
        const ring = el("div", { class: "score-ring", style: `--p:${pct}` }, el("b", {}, `${n}/${qs.length}`), el("small", {}, `${pct}%`));
        const wrong = qs.map((q, k) => ({ q, p: picks[k] })).filter(x => x.p !== x.q.a);
        const stage = stageOf(pct >= 60 ? "#2E9E6B" : "#E39B2B", ring, el("div", { class: "say" }, el("b", { style: "font-size:clamp(26px,4vw,40px)" }, msg)),
          wrong.length ? el("div", { class: "review" }, el("b", {}, "Check your mistakes:"), wrong.map(x => el("div", { class: "rv" }, el("div", { class: "rv-s" }, gapParts(x.q, true)), el("div", { class: "rv-you" }, "Your answer: ", el("s", {}, x.p)), el("div", { class: "rv-why" }, x.q.why)))) : null,
          el("div", { class: "actions" }, el("button", { class: "btn gold big", onclick: begin }, "New test"), el("button", { class: "btn big", onclick: () => { phase = "start"; paint(); } }, "Change topics")));
        if (pct >= 80) beep("win");
        swap(stage, "Mini Test", null, -1); setCounter(""); return;
      }
      const q = qs[i], answered = picks.length > i, mine = picks[i], color = GROUP_COLORS[q.t % GROUP_COLORS.length];
      const stage = stageOf(color,
        el("div", { class: "dots" }, qs.map((x, k) => el("i", { class: k < picks.length ? (picks[k] === x.a ? "ok" : "no") : k === i ? "now" : "" }))),
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, (F.grammarTopics || [])[q.t]), el("b", {}, `${i + 1} / ${qs.length}`)),
        el("div", { class: "sentence" }, gapParts(q, answered)),
        el("div", { class: "opts4" + (opts.length === 3 ? " g3" : " g2") }, opts.map((o, k) => el("button", { class: "opt4" + (answered && o === q.a ? " right" : "") + (answered && o === mine && o !== q.a ? " wrong" : ""), disabled: answered, onclick: () => { picks.push(o); beep(o === q.a ? "ok" : "no"); paint(); } }, el("span", { class: "k" }, "ABC"[k]), o))),
        answered ? el("div", { class: "why", style: `--cc:${mine === q.a ? "var(--green)" : "var(--red)"}` }, el("b", {}, mine === q.a ? "Right! " : "Not this one. "), q.why) : null,
        answered ? el("button", { class: "btn gold huge", onclick: () => { i++; if (i >= qs.length) { phase = "end"; paint(); } else newQ(); } }, i + 1 >= qs.length ? "See my score" : "Next question") : null);
      swap(stage, "Mini Test", null, -1); setCounter("");
    }
    keys = e => { if (phase !== "q") return; const answered = picks.length > i; if (answered) { if (e.key === "Enter" || e.key === " ") $(".stage .btn.gold.huge").click(); return; } const k = "abc".indexOf(e.key.toLowerCase()); if (k >= 0 && opts[k]) { picks.push(opts[k]); beep(opts[k] === qs[i].a ? "ok" : "no"); paint(); } };
    frame("Mini Test", null, stageOf("#4C5FD5"), -1);
    paint();
  }

  /* ----- lightning round: as many as you can before the time is up ----- */
  function lightning() {
    const pool = lvItems(F.grammar).filter(g => (F.quickTopics || []).includes(g.t) && g.q.length <= 80);
    let secs = store.get(PFX + ".light", 45), live = false, rg, q, opts, res = [], flash = null;
    turn = turn % S.teams.length;
    const lens = seg([[30, "30 s"], [45, "45 s"], [60, "60 s"]], secs, v => { secs = v; store.set(PFX + ".light", v); });
    const nextQ = cycle("light" + pool.length, pool);
    function intro() {
      live = false; if (rg) rg.stop();
      const tm = S.teams[turn];
      const stage = stageOf(tm.color, el("div", { class: "eyebrow" }, "Next team"), el("div", { class: "hs-word", style: `color:${tm.color}` }, tm.name),
        el("div", { class: "rules" },
          el("div", {}, el("b", {}, "1. "), "Quick questions: irregular verbs, for or since, already / yet / just and more."),
          el("div", {}, el("b", {}, "2. "), "The team says the answer, the teacher taps it. Right = +50, and the next question comes at once."),
          el("div", {}, el("b", {}, "3. "), `You have ${secs} seconds. How many can you get?`)),
        el("button", { class: "btn gold huge", onclick: start }, "Start"));
      swap(stage, "Lightning Round", lens, turn); paintTurn(turn);
    }
    function start() { live = true; res = []; next(); rg = ring(secs, end); paint(); beep("open"); }
    function next() { q = nextQ(); opts = shuffle(q.o.slice()); }
    function paint() {
      const tm = S.teams[turn], ok = res.filter(x => x.ok).length;
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${tm.color};font-size:20px` }, tm.name), rg.node, el("b", { style: "font-size:20px" }, `Right: ${ok}`)),
        el("div", { class: "sentence light-q" + (flash ? " " + flash : "") }, gapParts(q, false)),
        el("div", { class: "opts4" + (opts.length === 3 ? " g3" : " g2") }, opts.map((o, k) => el("button", { class: "opt4 big-opt", onclick: () => answer(o) }, el("span", { class: "k" }, "ABC"[k]), o))),
        el("div", { class: "hint" }, "Tap the answer the team says (or press A, B, C). Keep going!"));
      swap(stage, "Lightning Round", lens, turn);
    }
    function answer(o) {
      if (!live) return;
      const ok = o === q.a; res.push({ q, ok, said: o });
      if (ok) award(turn, 50); else beep("no");
      flash = ok ? "flash-ok" : "flash-no"; next(); paint(); setTimeout(() => { flash = null; const s = $(".light-q"); if (s) s.classList.remove("flash-ok", "flash-no"); }, 350);
    }
    function end() {
      live = false; const tm = S.teams[turn], ok = res.filter(x => x.ok).length, bad = res.filter(x => !x.ok);
      const stage = stageOf(tm.color, el("div", { class: "eyebrow" }, "Time's up!"), el("div", { class: "hs-word", style: `color:${tm.color}` }, `${tm.name}: ${ok} right`),
        bad.length ? el("div", { class: "review" }, el("b", {}, "Let's check these:"), bad.map(x => el("div", { class: "rv" }, el("div", { class: "rv-s" }, gapParts(x.q, true)), el("div", { class: "rv-you" }, "Said: ", el("s", {}, x.said))))) : el("p", { class: "muted" }, "No mistakes!"),
        el("button", { class: "btn gold huge", onclick: () => { turn = (turn + 1) % S.teams.length; intro(); } }, `Next: ${S.teams[(turn + 1) % S.teams.length].name}`));
      swap(stage, "Lightning Round", lens, turn);
    }
    keys = e => { if (!live) { if (e.key === "Enter") { const b = $(".stage .btn.gold.huge"); if (b) b.click(); } return; } const k = "abc".indexOf(e.key.toLowerCase()); if (k >= 0 && opts[k]) answer(opts[k]); };
    frame("Lightning Round", lens, stageOf("#E39B2B"), turn);
    intro();
  }

  /* ----- spot the mistake: tap the wrong word ----- */
  function mistake() {
    const nextM = cycle("mistakes", F.mistakes || []);
    let m, tried, done, t, n = 0;
    const clean = w => w.replace(/[.,?!"]/g, "");
    function next() { if (t) t.stop(); m = nextM(); tried = []; done = false; n++; paint(true); setCounter(`Sentence ${n}`); beep("open"); }
    function paint(fresh) {
      if (fresh) t = timer(S.timer);
      const worth = tried.length ? 50 : 100;
      const words = m.s.split(" ");
      const stage = stageOf("#D64545",
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, "Find the mistake"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        el("div", { class: "mis-words" }, words.map((w, k) => el("button", { class: "mis-w" + (tried.includes(k) ? " wrong" : "") + (done && m.bad.includes(clean(w)) ? " bad" : ""), disabled: done || tried.includes(k), onclick: () => tap(k, w) }, w))),
        done ? el("div", { class: "fix" }, el("small", {}, "Correct sentence"), el("b", {}, m.fix)) : null,
        done ? null : t.node,
        done ? awardRow(worth, next) : el("div", { class: "actions" }, el("button", { class: "btn big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); paint(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Everyone: read the correct sentence aloud." : "Each sentence has one mistake. Tap the wrong word. Then say the correct sentence!"));
      swap(stage, "Spot the Mistake", null);
    }
    function tap(k, w) { if (done) return; if (m.bad.includes(clean(w))) { done = true; if (t) t.stop(); beep("ok"); } else { tried.push(k); beep("no"); } paint(false); }
    keys = e => { if (done && (e.key === "n" || e.key === "Enter")) $("[data-nobody]").click(); };
    frame("Spot the Mistake", null, stageOf("#D64545"));
    next();
  }

  /* ================= 4. emoji riddles ================= */
  function riddles() {
    const have = { words: R.words.length > 0, movies: R.movies.length > 0 };
    let kind = store.get(PFX + ".rkind", "words"); if (!have[kind]) kind = have.words ? "words" : "movies";
    let r, choices, done, t, worth;
    const nextWord = have.words ? cycle("words", R.words) : null, nextMovie = have.movies ? cycle("movies", R.movies) : null;
    const moviesLabel = R.pack ? "Picture puzzles" : "Guess the movie";
    const kinds = have.words && have.movies ? seg([["words", "Two pictures, one word"], ["movies", moviesLabel]], kind, v => { kind = v; store.set(PFX + ".rkind", v); next(); }) : null;
    function next() {
      if (t) t.stop();
      r = kind === "words" ? nextWord() : nextMovie();
      const list = kind === "words" ? R.words : R.movies;
      choices = null; done = false; worth = 200;
      r.opts = shuffle([r, ...shuffle(list.filter(x => x !== r)).slice(0, 2)]);
      draw(true); beep("open"); setCounter(kind === "words" ? "Words" : "Movies");
    }
    function draw(fresh) {
      const color = kind === "words" ? "#4C5FD5" : "#D6457A";
      if (fresh) t = timer(S.timer);
      const pics = kind === "words" ? el("div", { class: "riddle" }, r.e.map((x, i) => [i ? el("b", { class: "plus" }, "+") : null, el("span", { class: "pic mid" }, x)]), el("b", { class: "plus" }, "="), el("b", { class: "q" }, "?"))
        : el("div", { class: "riddle" }, el("span", { class: "pic mid movie" }, r.e));
      const stage = stageOf(color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("span", { class: "pos" }, kind === "words" ? "Put the words together" : R.pack ? "What is it?" : "Which movie is it?"), el("b", { style: "color:var(--gold)" }, `Worth ${worth}`)),
        pics,
        done ? el("div", { class: "say" }, el("b", {}, r.a), kind === "words" && r.p && r.p.length ? el("span", {}, `${r.p.join(" + ")} = ${r.a}`) : null) : null,
        !done && choices ? el("div", { class: "opts4 g3" }, r.opts.map((o, i) => el("button", { class: "opt4" + (o.bad ? " wrong" : ""), onclick: () => choose(o) }, el("span", { class: "k" }, "ABC"[i]), o.a))) : null,
        done ? null : t.node,
        done ? awardRow(worth, next) : el("div", { class: "actions" },
          choices ? null : el("button", { class: "btn big", onclick: () => { choices = true; worth = 100; r.opts.forEach(o => o.bad = false); beep("pass"); draw(false); } }, "Show 3 choices (worth 100)"),
          el("button", { class: "btn gold big", onclick: () => { done = true; if (t) t.stop(); beep("ok"); draw(false); } }, "Show the answer")),
        el("div", { class: "hint" }, done ? "Click the team that got it, or press N." : kind === "words" ? "Say each word in English, then join them. Space = show the answer." : R.pack ? "Shout the answer in English! Space = show the answer." : "Shout the movie name in English! Space = show the answer."));
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
    let secs = store.get(PFX + ".draw", 60), p, live = false, shown = false, rg, mode = F.mime ? store.get(PFX + ".drawmode", "draw") : "draw";
    const mimes = lvItems(F.mime), nextMime = mimes.length ? cycle("mime" + LV(), mimes) : null;
    const isAct = () => mode === "act" && nextMime;
    turn = turn % S.teams.length;
    const lens0 = seg([[45, "45 s"], [60, "60 s"], [90, "90 s"]], secs, v => { secs = v; store.set(PFX + ".draw", v); });
    const lens = nextMime ? el("span", { class: "ctr2" }, seg([["draw", "Draw it"], ["act", "Act it out"]], mode, v => { mode = v; store.set(PFX + ".drawmode", v); intro(); }), lens0) : lens0;
    function intro() {
      live = false; shown = false; if (rg) rg.stop();
      const tm = S.teams[turn];
      const stage = stageOf(tm.color,
        el("div", { class: "eyebrow" }, isAct() ? "Next to act" : "Next to draw"), el("div", { class: "hs-word", style: `color:${tm.color}` }, tm.name),
        el("div", { class: "rules" },
          el("div", {}, el("b", {}, "1. "), isAct() ? "One student comes to the front." : "One student comes to the board."),
          el("div", {}, el("b", {}, "2. "), isAct() ? "They hold the card to see the words, then act them out. No talking, no sounds!" : "They hold the card to see the word, then draw it. No letters, no talking!"),
          el("div", {}, el("b", {}, "3. "), `Their team shouts the word in English. Correct = +100. You have ${secs} seconds.`)),
        el("button", { class: "btn gold huge", onclick: start }, "Start"));
      swap(stage, "Draw It!", lens, turn); paintTurn(turn);
      setCounter(`${d.pos} of ${d.size} words used`);
    }
    function start() { p = isAct() ? { ...nextMime(), c: "mime", e: "" } : d.take(); live = true; shown = false; rg = ring(secs, () => reveal(false)); paint(); beep("open"); }
    function paint() {
      const tm = S.teams[turn];
      const peek = el("button", { class: "peek", "aria-label": "Hold to see the word",
        onpointerdown: e => { e.preventDefault(); peek.classList.add("open"); }, onpointerup: () => peek.classList.remove("open"), onpointerleave: () => peek.classList.remove("open"), onpointercancel: () => peek.classList.remove("open"), oncontextmenu: e => e.preventDefault() },
        el("span", { class: "cover" }, el("b", {}, isAct() ? "Actor only" : "Drawer only"), el("small", {}, "Hold here to see the word")),
        el("span", { class: "secret" }, el("span", { class: "pic mid" }, p.e), el("b", {}, p.w)));
      const stage = stageOf(tm.color,
        el("div", { class: "row", style: "width:100%;justify-content:space-between" }, el("b", { style: `color:${tm.color};font-size:20px` }, tm.name), rg.node, el("span", { class: "pos" }, (CAT[p.c] || {}).name || "Act it out")),
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
        p.e ? el("div", { class: "pic big pop" }, p.e) : null, el("div", { class: "say" }, el("b", {}, p.w), p.c === "mime" ? null : el("span", {}, sentence(p))),
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
    const nextQ = cycle("rather", R.rather);
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
  // Category sets: the built-in one, the [STOP] part of each game pack, and older pasted sets.
  const BUILTIN = { id: "builtin", title: F.stop.title, cats: F.stop.cats.map(x => ({ c: x.c, w: x.w.split(",").map(s => s.trim()).filter(Boolean) })) };
  const allSets = () => [BUILTIN, ...PACKS.items.filter(x => x.stop).map(x => ({ ...x.stop, id: "pack:" + x.id, title: x.title, pack: true })), ...STOPS.items.filter(x => Array.isArray(x.cats))];
  // "category: word, word" lines
  function parseStop(text) {
    let title = "", letters = "", cats = [];
    for (let line of String(text || "").split(/\r?\n/)) {
      line = line.replace(/\*\*/g, "").replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim();
      if (!line || line.startsWith("#")) continue;
      const k = line.indexOf(":"); if (k < 1) continue;
      const head = line.slice(0, k).trim(), rest = line.slice(k + 1).trim();
      if (/^(title|name|topic)$/i.test(head)) { if (!title) title = rest; continue; }
      if (/^letters?$/i.test(head)) { letters = rest; continue; }
      if (/^level$/i.test(head)) continue;
      cats.push({ c: head.slice(0, 60), w: rest.split(/[,;]/).map(s => s.replace(/\.\.\.|…/g, "").trim().slice(0, 40)).filter(Boolean).slice(0, 120) });
    }
    const seen = new Set();
    cats = cats.filter(x => x.c && x.w.length >= 3 && !seen.has(x.c.toLowerCase()) && seen.add(x.c.toLowerCase())).slice(0, 30);
    return { title, letters: String(letters).toUpperCase().replace(/[^A-Z]/g, ""), cats };
  }
  const first = w => (String(w).normalize("NFKD").replace(/[^\p{L}]/gu, "")[0] || "").toUpperCase();
  function stop() {
    let secs = store.get(PFX + ".stop", 60), many = store.get(PFX + ".stopN", 5), setId = store.get(PFX + ".stopSet", "builtin");
    let letter = "", cats = [], rg = null, phase = "start", spinId = null, showEx = false;
    if (R.pack && R.pack.stop && !store.get(PFX + ".stopPicked." + R.pack.id, false)) { setId = "pack:" + R.pack.id; store.set(PFX + ".stopPicked." + R.pack.id, true); store.set(PFX + ".stopSet", setId); }
    const lens = seg([[45, "45 s"], [60, "60 s"], [90, "90 s"]], secs, v => { secs = v; store.set(PFX + ".stop", v); });
    const cur = () => allSets().find(x => x.id === setId) || BUILTIN;
    PACKS.onChange = STOPS.onChange = () => { if (phase === "start") paint(); };
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
      const sel = el("select", { class: "set-sel", "aria-label": "Category set", onchange: e => { setId = e.target.value; store.set(PFX + ".stopSet", setId); paint(); } },
        allSets().map(x => el("option", { value: x.id, selected: x.id === cur().id }, `${x.title} (${x.cats.length} categories)`)));
      const set = cur();
      return el("div", { class: "set-box" },
        el("div", { class: "set-row" }, el("b", {}, "Category set"), sel),
        el("div", { class: "set-row" }, el("b", {}, "Categories each round"), seg([[4, "4"], [5, "5"], [6, "6"]], many, v => { many = v; store.set(PFX + ".stopN", v); paint(); })),
        el("div", { class: "set-cats" }, set.cats.map(x => el("span", {}, x.c))),
        el("div", { class: "actions" },
          el("a", { class: "btn", href: "#/make" }, "Make a new set (game pack)"),
          set.id === "builtin" || set.pack ? null : el("button", { class: "btn danger-t", onclick: () => {
            if (!confirm(`Delete "${set.title}"?`)) return;
            STOPS.remove(set.id); setId = "builtin"; store.set(PFX + ".stopSet", setId); paint(); toast("Set deleted");
          } }, "Delete this set")));
    }
    function paint() {
      const stage = stageOf("#E39B2B",
        phase === "start" ? el("div", { class: "rules" },
          el("div", {}, el("b", {}, "1. "), "Each team needs paper and a pen."),
          el("div", {}, el("b", {}, "2. "), `You get one letter and ${many} categories.`),
          el("div", {}, el("b", {}, "3. "), "Write one English word for each category. It must start with the letter!"),
          el("div", {}, el("b", {}, "4. "), "Finished? Shout STOP! Then check the answers: +10 for each good word.")) : null,
        phase === "start" ? setPicker() : null,
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
        phase === "spin" ? null : el("div", { class: "actions" },
          el("button", { class: "btn gold huge", onclick: newRound }, phase === "start" ? "Get a letter" : "New letter"),
          phase === "start" ? null : el("button", { class: "btn big", onclick: () => { if (rg) rg.stop(); phase = "start"; paint(); } }, "Change set")),
        el("div", { class: "hint" }, phase === "score" ? "Other good words are fine too! Same word as another team? You can give only +5." : phase === "start" ? `Set: ${cur().title}` : "The letter always has answers in these categories."));
      swap(stage, "Stop!", lens);
    }
    keys = e => { if (e.key === "Enter" && phase !== "spin" && phase !== "start") newRound(); };
    frame("Stop!", lens, stageOf("#E39B2B"));
    paint(); PACKS.sync(); STOPS.sync();
  }

  /* ================= 8. spin & talk ================= */
  function spin() {
    const T = R.talk, N = T.length, step = 360 / N;
    let angle = store.get(PFX + ".wheel", 0) % 360, shown = angle, spinning = false, topic = null, question = "", rg = null, talkSecs = store.get(PFX + ".talk", 30);
    turn = turn % S.teams.length;
    const used = {};
    const lens = seg([[20, "20 s"], [30, "30 s"], [45, "45 s"]], talkSecs, v => { talkSecs = v; store.set(PFX + ".talk", v); });
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
      store.set(PFX + ".wheel", angle % 360);
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

  /* ================= make a game pack ================= */
  const PACK_PROMPT = `Make a game pack for my English class.
Level: A2 (easy, everyday words)
Topic: [WRITE THE TOPIC HERE, for example: food and cooking]

Answer in exactly the format below and nothing else. Keep the lines in [BRACKETS].
- PICTURES: 4 to 6 groups about the topic, 8 to 12 easy words in each group. Put one emoji after each word.
- HANGMAN: 20 words about the topic (4 to 8 letters). After each word, its category in brackets (like animal, thing, place, food, job), then a short clue in easy English that does not say the word and is not too easy.
- RIDDLES: 8 riddles. Two emoji that make one English word (like sun + flower = sunflower), or a few emoji that show a thing, a place or a film.
- WOULD YOU RATHER: 8 fun questions about the topic. Two choices, one emoji after each choice.
- STOP: 6 categories about the topic, 25 easy words each, with many different first letters (A to W).
- FACTS: 10 surprising sentences about the topic. Some are true (= fact) and some are false (= fake). Add a short explanation after |.
- TABOO: 10 words about the topic. After each word, 4 words that the student can't say when they describe it.
- TALK: 4 small topics, 4 easy speaking questions each.

Title: Food and Cooking

[PICTURES]
fruit: apple 🍎, banana 🍌, grapes 🍇, lemon 🍋
drinks: milk 🥛, tea 🍵, coffee ☕, water 💧

[HANGMAN]
lemon (fruit): It is yellow and very sour.
bread (food): We buy it at the bakery and make sandwiches with it.

[RIDDLES]
🍳 + 🎂 = pancake
☕ + 🎂 = cupcake
🍕🇮🇹 = pizza from Italy

[FACTS]
Honey can stay good for thousands of years. = fact | People found good honey in very old tombs.
Tomatoes are vegetables. = fake | They have seeds, so they are fruits.

[TABOO]
pizza: Italy, cheese, round, slice

[WOULD YOU RATHER]
eat pizza every day 🍕 | eat burgers every day 🍔

[STOP]
a fruit: apple, apricot, banana, cherry, date, fig, grape, kiwi, lemon, mango
a drink: ayran, coffee, juice, lemonade, milk, smoothie, tea, water

[TALK]
Breakfast: What do you eat for breakfast? | Do you drink tea or milk? | Who makes breakfast at home? | What is the best breakfast?

(This example only shows the format. Write new content about my topic.)`;
  const EMOJI_RE = /(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}])(?:[\u{1F3FB}-\u{1F3FF}️⃣]|‍(?:\p{Extended_Pictographic}|[♀♂]))*/u;
  const EMOJI_ALL = new RegExp(EMOJI_RE.source, "gu");
  const SECTIONS = [["hang", /^hang ?man$/], ["pics", /^(pictures?|words|vocabulary|groups?)$/], ["riddles", /^(emoji )?riddles?$/], ["rather", /^would you rather\??$/], ["stop", /^(stop!?|categories)$/], ["talk", /^(talk|spin|speaking|questions?|spin (and|&) talk)$/], ["taboo", /^taboo$/], ["facts", /^(facts?|fact or fake\??|true or false\??)$/]];
  // the text from the AI -> a pack. Every section is optional; plain "category: words" lines with no sections are a Stop! set.
  function parsePack(text) {
    text = String(text || "").replace(/\r/g, "");
    if (!text.trim()) throw "";
    let title = "", sec = null, any = false;
    const pk = { groups: [], words: [], movies: [], rather: [], talk: [], hang: [], taboo: [], facts: [], stopText: "" };
    let loose = "";
    for (let raw of text.split("\n")) {
      let line = raw.replace(/\*\*|__|`/g, "").trim();
      if (!line) continue;
      const h = line.replace(/^#+\s*/, "").replace(/^\[|\]$/g, "").replace(/:$/, "").trim().toLowerCase();
      const found = SECTIONS.find(([, re]) => re.test(h));
      if (found && (line.startsWith("[") || line.startsWith("#") || line === line.toUpperCase() || /:$/.test(line))) { sec = found[0]; any = true; continue; }
      line = line.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "");
      const t = line.match(/^(title|name)\s*:\s*(.+)$/i);
      if (t) { if (!title) title = t[2].trim(); continue; }
      if (/^\(.*\)$/.test(line) || /^(level|topic)\s*:/i.test(line)) continue;
      if (sec === "pics") {
        const k = line.indexOf(":"); if (k < 1) continue;
        const items = line.slice(k + 1).split(/[,;]/).map(x => {
          const e = (x.match(EMOJI_ALL) || []).join("");
          const w = x.replace(EMOJI_ALL, "").replace(/[()"]/g, "").replace(/\s+/g, " ").trim();
          return { w: w.slice(0, 30), e };
        }).filter(x => /\p{L}/u.test(x.w));
        if (items.length) pk.groups.push({ name: line.slice(0, k).replace(EMOJI_ALL, "").trim().slice(0, 40), items: items.slice(0, 60) });
      } else if (sec === "riddles") {
        const k = line.lastIndexOf("="); if (k < 1) continue;
        const left = line.slice(0, k).trim(), ans = line.slice(k + 1).replace(/\(.*\)\s*$/, "").trim();
        const partsTxt = (line.slice(k + 1).match(/\(([^)]*\+[^)]*)\)/) || [])[1];
        if (!ans || !EMOJI_RE.test(left)) continue;
        if (left.includes("+")) {
          const e = left.split("+").map(x => (x.match(EMOJI_ALL) || []).join("")).filter(Boolean);
          if (e.length >= 2) pk.words.push({ e: e.slice(0, 4), a: ans.slice(0, 60), p: partsTxt ? partsTxt.split("+").map(x => x.trim()) : null });
        } else pk.movies.push({ e: (left.match(EMOJI_ALL) || []).join("").slice(0, 40), a: ans.slice(0, 60) });
      } else if (sec === "rather") {
        const q = line.replace(/^would you rather\s*/i, "").replace(/\?$/, "");
        const sides = (q.includes("|") ? q.split("|") : q.split(/\s+or\s+/i)).map(x => x.trim()).filter(Boolean);
        if (sides.length < 2) continue;
        const side = x => [x.replace(EMOJI_ALL, "").replace(/\s+/g, " ").trim().slice(0, 60), (x.match(EMOJI_ALL) || []).join("").slice(0, 12) || "❓"];
        const [a, b] = [side(sides[0]), side(sides[1])];
        if (a[0] && b[0]) pk.rather.push([a[0], a[1], b[0], b[1]]);
      } else if (sec === "talk") {
        const k = line.indexOf(":"); if (k < 1) continue;
        const q = line.slice(k + 1).split("|").map(x => x.trim()).filter(x => x.length > 3);
        if (q.length) pk.talk.push({ t: line.slice(0, k).trim().slice(0, 18), q: q.slice(0, 12) });
      } else if (sec === "taboo") {
        const k = line.indexOf(":"); if (k < 1) continue;
        const no = line.slice(k + 1).split(/[,;]/).map(x => x.trim()).filter(Boolean).slice(0, 6);
        if (no.length) pk.taboo.push({ w: line.slice(0, k).trim().slice(0, 40), no: no.map(x => x.slice(0, 30)) });
      } else if (sec === "facts") {
        const m = line.match(/^(.*?)\s*=\s*(fact|fake|true|false)\b\s*(?:[|:–—-]\s*(.*))?$/i);
        if (m && m[1].length > 5) pk.facts.push({ s: m[1].trim().slice(0, 200), t: /^(fact|true)$/i.test(m[2]), why: (m[3] || "").trim().slice(0, 200) });
      } else if (sec === "hang") {
        const m = line.match(/^([A-Za-z][A-Za-z '-]{2,30}?)\s*(?:[([]([^)\]]{1,30})[)\]])?\s*(?::|=|–|—| - )\s*(.+)$/);
        if (m) pk.hang.push({ w: m[1].trim(), cat: (m[2] || "").trim().slice(0, 30), clue: m[3].trim().slice(0, 140) });
      } else if (sec === "stop") pk.stopText += line + "\n";
      else if (!sec) loose += line + "\n";
    }
    // no [SECTIONS] at all: plain "category: words" lines are a Stop! set
    if (!any) pk.stopText = loose;
    const st = parseStop(pk.stopText); delete pk.stopText;
    pk.stop = st.cats.length >= 3 ? { title: st.title || title, letters: st.letters, cats: st.cats } : null;
    pk.title = (title || st.title || "My game pack").slice(0, 60);
    pk.talk = pk.talk.slice(0, 12); pk.rather = pk.rather.slice(0, 60); pk.words = pk.words.slice(0, 80); pk.movies = pk.movies.slice(0, 80); pk.groups = pk.groups.slice(0, 12); pk.hang = pk.hang.slice(0, 100); pk.taboo = pk.taboo.slice(0, 80); pk.facts = pk.facts.slice(0, 80);
    if (!pk.groups.length && !pk.hang.length && !pk.taboo.length && !pk.facts.length && !pk.words.length && !pk.movies.length && !pk.rather.length && !pk.stop && !pk.talk.length) throw "No game parts found yet. Keep the [PICTURES], [HANGMAN], [RIDDLES], [FACTS], [TABOO], [WOULD YOU RATHER], [STOP] and [TALK] lines.";
    return pk;
  }
  function packSummary(pk) {
    const n = (pk.groups || []).reduce((a, g) => a + g.items.length, 0), out = [];
    if (n) out.push(`${n} pictures in ${pk.groups.length} groups`);
    if ((pk.hang || []).length) out.push(`${pk.hang.length} hangman words with hints`);
    const r = (pk.words || []).length + (pk.movies || []).length; if (r) out.push(`${r} riddles`);
    if ((pk.rather || []).length) out.push(`${pk.rather.length} would you rather`);
    if (pk.stop) out.push(`${pk.stop.cats.length} Stop! categories`);
    if ((pk.facts || []).length) out.push(`${pk.facts.length} facts or fakes`);
    if ((pk.taboo || []).length) out.push(`${pk.taboo.length} Taboo cards`);
    if ((pk.talk || []).length) out.push(`${pk.talk.length} talk topics`);
    return out;
  }
  function make(id) {
    document.title = "Make a game pack · Fun English";
    const old = id ? packById(id) : null;
    const status = el("div", { class: "paste-status" }), parts = el("div", { class: "set-cats" });
    const ta = el("textarea", { class: "paste-ta", rows: 14, spellcheck: "false", placeholder: "Paste the AI answer here.\n\nTitle: Food and Cooking\n\n[PICTURES]\nfruit: apple 🍎, banana 🍌, grapes 🍇\n\n[HANGMAN]\nlemon (fruit): It is yellow and very sour.\n\n[RIDDLES]\n🍳 + 🎂 = pancake\n\n[WOULD YOU RATHER]\neat pizza 🍕 | eat burgers 🍔\n\n[STOP]\na fruit: apple, banana, cherry, ...\n\n[TALK]\nBreakfast: What do you eat? | Do you like tea?" });
    ta.value = old ? old.text || "" : store.get(PFX + ".packDraft", "");
    let parsed = null;
    const saveB = el("button", { class: "btn gold big", disabled: true, onclick: () => {
      if (!parsed) return;
      const now = Date.now(), pk = { ...parsed, text: ta.value.slice(0, 60000), id: old ? old.id : "p" + now.toString(36) + Math.random().toString(36).slice(2, 6), updatedAt: now };
      if (JSON.stringify(pk).length > 95000) { toast("This pack is too big. Make it a little shorter."); return; }
      PACKS.items = PACKS.items.filter(x => x.id !== pk.id).concat(pk); PACKS.save();
      store.set(PFX + ".packDraft", ""); S.pack = pk.id; S.cats = []; applyPack(); save();
      toast(`Saved: ${pk.title}. All the games use it now.`); location.hash = "#/";
    } }, old ? "Save changes" : "Save the pack and play");
    const check = () => {
      if (!old) store.set(PFX + ".packDraft", ta.value);
      status.className = "paste-status"; put(parts);
      try {
        parsed = parsePack(ta.value); saveB.disabled = false;
        status.classList.add("ok"); status.textContent = `"${parsed.title}" is ready:`;
        put(parts, packSummary(parsed).map(t => el("span", {}, t)));
      } catch (e) { parsed = null; saveB.disabled = true; if (e) { status.classList.add("bad"); status.textContent = e; } else status.textContent = "Paste the AI answer here."; }
    };
    ta.addEventListener("input", check);
    const copy = async () => { try { await navigator.clipboard.writeText(PACK_PROMPT); toast("Prompt copied. Change the topic, then paste it into the AI."); } catch (e) { ta.value = PACK_PROMPT; check(); ta.select(); toast("Copy this prompt from the box, then clear the box"); } };
    put($("#app"),
      el("div", { class: "game-head" }, el("a", { class: "btn", href: "#/" }, "← All games"), el("h2", {}, old ? "Edit game pack" : "Make a game pack")),
      el("div", { class: "stage make", style: "--cc:var(--gold);align-content:start" },
        el("ol", { class: "paste-steps big" },
          el("li", {}, "Press ", el("b", {}, "Copy AI prompt"), " and paste it into ChatGPT, Gemini or any AI."),
          el("li", {}, "Change the topic line (for example: animals, my town, holidays, sports), then send it."),
          el("li", {}, "Copy the AI's whole answer and paste it in the box below. Then press Save.")),
        el("div", { class: "actions" }, el("button", { class: "btn big", onclick: copy }, "Copy AI prompt")),
        ta, status, parts,
        el("div", { class: "actions" }, saveB, el("a", { class: "btn big", href: "#/" }, "Cancel")),
        el("details", { class: "fmt" }, el("summary", {}, "What can a pack have? (you can also type it yourself)"),
          el("ul", {},
            el("li", {}, el("b", {}, "[PICTURES]"), " group: word emoji, word emoji … for What's This?, Odd One Out, Hangman and Draw It!"),
            el("li", {}, el("b", {}, "[HANGMAN]"), " word (category): a clue … the words, categories and hints for Hangman"),
            el("li", {}, el("b", {}, "[RIDDLES]"), " emoji + emoji = word, or emoji emoji = answer, for Emoji Riddles"),
            el("li", {}, el("b", {}, "[WOULD YOU RATHER]"), " choice emoji | choice emoji"),
            el("li", {}, el("b", {}, "[STOP]"), " category: word, word, word … (the example answers)"),
            el("li", {}, el("b", {}, "[FACTS]"), " sentence = fact | why, or sentence = fake | why, for Fact or Fake?"),
            el("li", {}, el("b", {}, "[TABOO]"), " word: forbidden, forbidden, forbidden, forbidden"),
            el("li", {}, el("b", {}, "[TALK]"), " topic: question | question | question, for Spin & Talk")),
          el("p", { class: "muted" }, "Every part is optional. A game with no part in your pack uses the built-in words."))));
    check();
  }

  /* ================= winner ================= */
  function showWinner() {
    const ranked = [...S.teams].sort((a, b) => b.score - a.score), best = ranked[0].score, winners = ranked.filter(t => t.score === best).map(t => t.name);
    put($("#winBox"), el("div", { class: "eyebrow" }, (F.title || "Fun English") + " champion"),
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
  const ROUTES = { "": hub, reading, grammar, minitest, lightning, mistake, halves, say: sayIt, map: cityMap, clock, wordle, pics, odd, hangman, balloon: hangman, mixed, countdown, riddles, facts, taboo, draw, rather, stop, spin };
  function route() {
    cleanup();
    const id = location.hash.replace(/^#\/?/, "");
    if (id === "make" || id.startsWith("make/")) { make(id.slice(5)); window.scrollTo(0, 0); return; }
    const g = LIST().find(x => x.id === id) || GAMES.find(x => x.id === id); document.title = g ? `${g.name} · ${F.title || "Fun English"}` : F.title || "Fun English Games";
    (g && !LIST().some(x => x.id === g.id) ? hub : ROUTES[id] || hub)(); window.scrollTo(0, 0);
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
  PACKS.sync(); STOPS.sync();
})();
