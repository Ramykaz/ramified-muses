/* Commute Prep: TOEFL + GRE vocabulary for one person on a phone.
   Listen (hands-free audio), Review (spaced repetition), Quiz, GRE Verbal, Browse, Progress.
   Progress is kept in this browser (localStorage), with a backup you can copy. */
(() => {
  "use strict";
  const D = window.PREP;

  /* ================= helpers ================= */
  const $ = s => document.querySelector(s);
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k === "html") n.innerHTML = v; // fixed icon markup only
      else if (k === "value") n.value = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c));
    return n;
  };
  const put = (node, ...kids) => { node.replaceChildren(); for (const c of kids.flat(Infinity)) if (c != null && c !== false) node.append(c.nodeType ? c : String(c)); return node; };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const IC = {
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor" stroke="none"/>',
    next: '<path d="M5 5l10 7-10 7zM18 5v14"/>',
    prev: '<path d="M19 5L9 12l10 7zM6 5v14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    listen: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    gre: '<path d="M4 19V5h11l5 5v9z"/><path d="M8 13h8M8 16h5"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    speak: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-1 3-3 4-4 6-1-1-1.5-2-1.5-3C6 10 5 12.5 5 15a7 7 0 0 0 7 7z"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'
  };
  const ic = (name, size = 22) => el("span", { class: "ic", style: `--s:${size}px`, "aria-hidden": "true", html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[name] || ""}</svg>` });
  const POS = { adj: "adjective", n: "noun", v: "verb", adv: "adverb" };

  /* ================= content ================= */
  const lines = s => s.trim().split("\n").map(l => l.trim()).filter(Boolean).map(l => l.split("|").map(x => x.trim()));
  const GRE = lines(D.gre).map(([w, pos, cl, def, ex, syn]) => ({ deck: "gre", id: "gre:" + w, w, pos, cl, def, ex, syn: syn.split(",").map(s => s.trim()) }));
  const TOEFL = lines(D.toefl).map(([w, pos, m, grp, ex]) => ({ deck: "toefl", id: "toefl:" + w, w, pos, m, grp: grp || m, ex }));
  const ROOTS = lines(D.roots).map(([r, m, ex]) => ({ deck: "roots", id: "roots:" + r, w: r, m, ex }));
  const COLL = lines(D.coll).map(([t, a, wr, ex]) => ({ deck: "coll", id: "coll:" + t, t, a, wrong: wr.split(",").map(s => s.trim()), ex, w: t.replace("___", a) }));
  const PHR = lines(D.phrases).map(([p, u]) => ({ deck: "phr", id: "phr:" + p, w: p, u }));
  const DECKS = {
    gre: { name: "GRE words", short: "GRE", items: GRE },
    toefl: { name: "TOEFL academic", short: "TOEFL", items: TOEFL },
    roots: { name: "Word roots", short: "Roots", items: ROOTS },
    coll: { name: "Collocations", short: "Phrases+", items: COLL },
    phr: { name: "TOEFL speaking & writing", short: "Templates", items: PHR }
  };
  const ALL = Object.values(DECKS).flatMap(d => d.items);
  const BYID = Object.fromEntries(ALL.map(i => [i.id, i]));
  // what a card says, for the screen and for the voice
  function face(i) {
    if (i.deck === "gre") return { front: i.w, sub: POS[i.pos], back: i.def, ex: i.ex, extra: "Synonyms: " + i.syn.join(", ") };
    if (i.deck === "toefl") return { front: i.w, sub: POS[i.pos], back: i.m, ex: i.ex.replace(/\[|\]/g, ""), extra: "TOEFL reading: \"closest in meaning\"" };
    if (i.deck === "roots") return { front: i.w, sub: "root", back: i.m, ex: i.ex, extra: "" };
    if (i.deck === "coll") return { front: i.t.replace("___", "…"), sub: "collocation", back: i.w, ex: i.ex, extra: "" };
    return { front: i.w, sub: "phrase", back: i.u, ex: "", extra: "" };
  }

  /* ================= saved progress ================= */
  const KEY = "prep.v1";
  const S = Object.assign({ srs: {}, hist: {}, newDay: { d: "", n: 0 }, set: { rate: 0.95, voice: "", newPerDay: 20, gap: 4, theme: "dark", mode: "recall", ldecks: ["gre"], rdecks: ["gre", "toefl"], qdeck: "mix", reverse: false } }, store.get(KEY, {}));
  S.set = Object.assign({ rate: 0.95, voice: "", newPerDay: 20, gap: 4, theme: "dark", mode: "recall", ldecks: ["gre"], rdecks: ["gre", "toefl"], qdeck: "mix", reverse: false }, S.set);
  const save = () => store.set(KEY, S);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const day = () => (S.hist[today()] ||= { r: 0, ok: 0, l: 0 });
  function streak() { let n = 0; const d = new Date(); if (!S.hist[today()]) d.setDate(d.getDate() - 1); for (;;) { const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; const h = S.hist[k]; if (h && (h.r || h.l)) { n++; d.setDate(d.getDate() - 1); } else return n; } }
  document.documentElement.dataset.theme = S.set.theme;

  /* ================= spaced repetition ================= */
  const DAY = 864e5, IV = [0, 1, 3, 7, 14, 30, 60, 120];
  const newLeft = () => { if (S.newDay.d !== today()) S.newDay = { d: today(), n: 0 }; return Math.max(0, S.set.newPerDay - S.newDay.n); };
  function queue(decks) {
    const now = Date.now(), items = decks.flatMap(d => DECKS[d] ? DECKS[d].items : []);
    const due = items.filter(i => S.srs[i.id] && S.srs[i.id].due <= now).sort((a, b) => S.srs[a.id].due - S.srs[b.id].due);
    const fresh = shuffle(items.filter(i => !S.srs[i.id])).slice(0, newLeft());
    return { due, fresh };
  }
  const dueCount = decks => queue(decks).due.length;
  function nextState(st, g) {
    const s = { ...(st || { b: 0, due: 0, n: 0, lapse: 0 }) };
    if (g === 0) { s.b = 0; s.lapse++; s.due = Date.now() + 60e3; }
    else if (g === 1) { s.b = Math.max(1, s.b); s.due = Date.now() + Math.max(0.5, IV[s.b] * 0.5) * DAY; }
    else if (g === 2) { s.b = Math.min(7, s.b + 1); s.due = Date.now() + IV[s.b] * DAY; }
    else { s.b = Math.min(7, s.b + 2); s.due = Date.now() + IV[s.b] * DAY; }
    s.n++; return s;
  }
  const ivLabel = (st, g) => { if (g === 0) return "now"; const ms = nextState(st, g).due - Date.now(); const d = ms / DAY; return d < 1 ? `${Math.round(d * 24)}h` : d < 30 ? `${Math.round(d)}d` : `${Math.round(d / 30)}mo`; };
  function grade(item, g) {
    if (!S.srs[item.id]) { newLeft(); S.newDay.n++; }
    S.srs[item.id] = nextState(S.srs[item.id], g);
    const h = day(); h.r++; if (g > 0) h.ok++; save();
  }
  // a quiz mistake sends the card back to review
  function missed(item) { if (!item) return; const st = S.srs[item.id] || { b: 0, due: 0, n: 0, lapse: 0 }; S.srs[item.id] = { ...st, b: 0, lapse: st.lapse + 1, due: Date.now() }; save(); }

  /* ================= voice ================= */
  const synth = window.speechSynthesis;
  let voices = [];
  const loadVoices = () => { voices = synth ? synth.getVoices().filter(v => /^en/i.test(v.lang)) : []; };
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function voice() { return voices.find(v => v.name === S.set.voice) || voices.find(v => /en-US/i.test(v.lang) && /Google|Samantha|Aria|Jenny|Natural/i.test(v.name)) || voices.find(v => /en-US/i.test(v.lang)) || voices[0] || null; }
  function speak(text) {
    return new Promise(res => {
      if (!synth) return res();
      const u = new SpeechSynthesisUtterance(text);
      const v = voice(); if (v) u.voice = v; u.lang = v ? v.lang : "en-US"; u.rate = S.set.rate;
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1500 + text.length * 110 / S.set.rate); // some phones never fire onend
      synth.speak(u);
    });
  }
  const sayBtn = text => el("button", { class: "icon-b", "aria-label": "Say it", onclick: e => { e.stopPropagation(); if (synth) synth.cancel(); speak(text); } }, ic("speak", 20));

  /* ================= layout ================= */
  const app = $("#app");
  let cleanup = [];
  function screen(title, ...kids) {
    put(app, el("header", { class: "top" },
      title ? el("a", { class: "icon-b", href: "#/", "aria-label": "Home" }, ic("back")) : el("span", { class: "brand" }, ic("listen", 26), el("b", {}, "Commute Prep")),
      title ? el("h1", {}, title) : null,
      el("span", { class: "sp" }),
      el("a", { class: "icon-b", href: "#/settings", "aria-label": "Settings" }, ic("gear"))),
      el("main", { class: "main" }, kids));
  }
  const chips = (options, chosen, multi, onChange) => el("div", { class: "chips" }, options.map(([id, label]) => el("button", { class: "chip" + (chosen.includes(id) ? " on" : ""), onclick: () => {
    let nx = multi ? (chosen.includes(id) ? chosen.filter(x => x !== id) : chosen.concat(id)) : [id];
    if (!nx.length) { toast("Choose at least one"); return; }
    onChange(nx);
  } }, label)));

  /* ================= home ================= */
  function home() {
    const st = streak(), due = dueCount(Object.keys(DECKS)), h = S.hist[today()] || { r: 0, l: 0 };
    const tile = (href, icon, name, p, badge, cls = "") => el("a", { class: "tile " + cls, href }, el("span", { class: "t-ic" }, ic(icon, 26)), el("span", { class: "t-txt" }, el("b", {}, name), el("small", {}, p)), badge ? el("span", { class: "badge" }, badge) : null);
    screen(null,
      el("section", { class: "today" },
        el("div", { class: "stat" }, ic("flame", 22), el("b", {}, String(st)), el("small", {}, st === 1 ? "day streak" : "days streak")),
        el("div", { class: "stat" }, el("b", {}, String(due)), el("small", {}, "cards due")),
        el("div", { class: "stat" }, el("b", {}, String(h.r + h.l)), el("small", {}, "today"))),
      el("div", { class: "tiles" },
        tile("#/listen", "listen", "Listen", "Hands-free audio cards. Eyes optional.", null, "big"),
        tile("#/review", "cards", "Review", "Spaced repetition, one thumb.", due ? String(due) : null),
        tile("#/quiz", "bolt", "Quick Quiz", "10 questions. Mistakes go back to review."),
        tile("#/gre", "gre", "GRE Verbal", "Text completion and sentence equivalence."),
        tile("#/browse", "book", "Browse", "Every word, root and phrase."),
        tile("#/stats", "chart", "Progress", "Streak, words learned, weak words.")),
      el("p", { class: "foot" }, `${GRE.length} GRE words · ${TOEFL.length} TOEFL words · ${ROOTS.length} roots · ${COLL.length} collocations · ${PHR.length} phrases · ${D.tc.length + D.se.length} GRE questions`));
  }

  /* ================= listen: hands-free ================= */
  const L = { on: false, list: [], idx: 0, token: 0, phase: "", lock: null };
  function listenList() {
    const now = Date.now(), decks = S.set.ldecks;
    let items = decks.includes("weak") ? ALL.filter(i => (S.srs[i.id] || {}).lapse > 0) : decks.flatMap(d => DECKS[d] ? DECKS[d].items : []);
    const weak = items.filter(i => S.srs[i.id] && (S.srs[i.id].lapse > 0 || S.srs[i.id].b <= 1));
    const due = items.filter(i => S.srs[i.id] && S.srs[i.id].due <= now && !weak.includes(i));
    const rest = items.filter(i => !weak.includes(i) && !due.includes(i));
    return [...shuffle(weak), ...shuffle(due), ...shuffle(rest)];
  }
  // the parts of a card, in the order they are spoken; "gap" = time to think
  function script(i) {
    const f = face(i), mode = S.set.mode, gap = S.set.gap * 1000;
    let prompt, answer;
    if (i.deck === "gre") { prompt = [`${i.w}.`]; answer = [`${POS[i.pos]}. ${i.def}.`, `For example: ${i.ex}`, `Synonyms: ${i.syn.join(", ")}.`]; }
    else if (i.deck === "toefl") { prompt = [`${i.w}.`]; answer = [`It means: ${i.m}.`, f.ex]; }
    else if (i.deck === "roots") { prompt = [`The root ${i.w.split(" / ")[0]}.`]; answer = [`It means ${i.m}.`, `As in: ${i.ex.replace(/\(/g, ", ").replace(/\)/g, "")}.`]; }
    else if (i.deck === "coll") { prompt = [i.t.replace("___", "blank") + "."]; answer = [f.back + ".", i.ex]; }
    else { prompt = [i.w.replace(/\.\.\./g, ", dot dot dot, ")]; answer = [f.back]; }
    if (mode === "reverse" && (i.deck === "gre" || i.deck === "toefl")) return [{ say: i.deck === "gre" ? `${i.def}.` : `A word that means: ${i.m}.`, show: "q" }, { gap }, { say: `${i.w}.`, show: "a" }, ...answer.slice(1).map(a => ({ say: a, show: "a" }))];
    return [...prompt.map(p => ({ say: p, show: "q" })), mode === "recall" ? { gap } : null, ...answer.map(a => ({ say: a, show: "a" }))].filter(Boolean);
  }
  async function wakeLock(on) {
    try { if (on && "wakeLock" in navigator && !L.lock) { L.lock = await navigator.wakeLock.request("screen"); L.lock.addEventListener("release", () => { L.lock = null; }); } else if (!on && L.lock) { await L.lock.release(); L.lock = null; } } catch (e) { /* not allowed here */ }
  }
  async function playLoop() {
    const token = ++L.token;
    while (L.on && token === L.token) {
      if (!L.list.length) { L.list = listenList(); L.idx = 0; if (!L.list.length) { toast("No cards in these decks yet"); stopListen(); return; } }
      if (L.idx >= L.list.length) { L.list = listenList(); L.idx = 0; }
      const item = L.list[L.idx];
      L.phase = "q"; paintListen();
      if ("mediaSession" in navigator) try { navigator.mediaSession.metadata = new MediaMetadata({ title: face(item).front, artist: "Commute Prep", album: DECKS[item.deck].name }); } catch (e) { /* ignore */ }
      for (const part of script(item)) {
        if (!L.on || token !== L.token) return;
        if (part.gap) { L.phase = "gap"; paintListen(); await sleep(part.gap); continue; }
        if (part.show === "a" && L.phase !== "a") { L.phase = "a"; paintListen(); }
        await speak(part.say);
      }
      if (!L.on || token !== L.token) return;
      const h = day(); h.l++; save();
      await sleep(900);
      if (token === L.token) L.idx++;
    }
  }
  function startListen() { if (!synth) { toast("This browser can't speak. Try Chrome or Safari."); return; } L.on = true; wakeLock(true); playLoop(); paintListen(); }
  function stopListen() { L.on = false; L.token++; if (synth) synth.cancel(); wakeLock(false); paintListen(); }
  function skip(d) { const was = L.on; L.token++; if (synth) synth.cancel(); L.idx = Math.max(0, L.idx + d); L.phase = "q"; if (was) { L.on = true; playLoop(); } paintListen(); }
  if ("mediaSession" in navigator) try {
    navigator.mediaSession.setActionHandler("play", () => startListen());
    navigator.mediaSession.setActionHandler("pause", () => stopListen());
    navigator.mediaSession.setActionHandler("nexttrack", () => skip(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => skip(-1));
  } catch (e) { /* not supported */ }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && L.on) wakeLock(true); });

  function listen() {
    if (!L.list.length) L.list = listenList();
    screen("Listen",
      el("div", { id: "lcard" }),
      el("div", { class: "player" },
        el("button", { class: "icon-b big", "aria-label": "Previous", onclick: () => skip(-1) }, ic("prev", 28)),
        el("button", { class: "play", id: "playB", "aria-label": "Play or pause", onclick: () => L.on ? stopListen() : startListen() }, ic(L.on ? "pause" : "play", 34)),
        el("button", { class: "icon-b big", "aria-label": "Next", onclick: () => skip(1) }, ic("next", 28))),
      el("div", { class: "box" },
        el("b", { class: "lbl" }, "Decks"),
        chips([...Object.entries(DECKS).map(([id, d]) => [id, d.name]), ["weak", "My weak words"]], S.set.ldecks, true, nx => { S.set.ldecks = nx.includes("weak") && !S.set.ldecks.includes("weak") ? ["weak"] : nx.filter(x => x !== "weak" || nx.length === 1); save(); L.list = listenList(); L.idx = 0; if (L.on) skip(0); listen(); }),
        el("b", { class: "lbl" }, "Mode"),
        chips([["recall", "Recall: word, pause, meaning"], ["learn", "Learn: no pause"], ["reverse", "Reverse: meaning first"]], [S.set.mode], false, nx => { S.set.mode = nx[0]; save(); listen(); }),
        el("b", { class: "lbl" }, "Thinking pause"),
        chips([[2, "2 s"], [4, "4 s"], [6, "6 s"], [8, "8 s"]], [S.set.gap], false, nx => { S.set.gap = nx[0]; save(); listen(); }),
        el("b", { class: "lbl" }, `Speed: ${S.set.rate.toFixed(2)}×`),
        el("input", { type: "range", min: 0.7, max: 1.3, step: 0.05, value: S.set.rate, "aria-label": "Speed", oninput: e => { S.set.rate = +e.target.value; save(); e.target.previousSibling.textContent = `Speed: ${S.set.rate.toFixed(2)}×`; } })),
      el("p", { class: "foot" }, "The screen stays on while it plays. Headphone buttons work too: play, pause, next. Weak words and due cards come first."));
    paintListen();
  }
  function paintListen() {
    const box = $("#lcard"); if (!box) return;
    const item = L.list[L.idx]; const pb = $("#playB"); if (pb) put(pb, ic(L.on ? "pause" : "play", 34));
    if (!item) { put(box, el("div", { class: "card empty" }, "Press play")); return; }
    const f = face(item), showA = L.phase === "a" || !L.on && L.phase !== "q" && L.phase !== "gap", rev = S.set.mode === "reverse" && (item.deck === "gre" || item.deck === "toefl");
    put(box, el("div", { class: "card lc" + (L.phase === "gap" ? " thinking" : "") },
      el("div", { class: "c-top" }, el("span", { class: "tag" }, DECKS[item.deck].short), el("span", { class: "muted" }, `${L.idx + 1} / ${L.list.length}`)),
      rev && !showA ? el("div", { class: "c-def big" }, item.deck === "gre" ? item.def : item.m) : el("div", { class: "c-word" }, f.front),
      rev && !showA ? null : el("div", { class: "muted" }, f.sub),
      L.phase === "gap" ? el("div", { class: "think" }, el("i"), "Say it in your head…") : null,
      showA ? el("div", { class: "c-ans" }, rev ? el("div", { class: "c-word sm" }, item.w) : null, el("div", { class: "c-def" }, f.back), f.ex ? el("div", { class: "c-ex" }, f.ex) : null, f.extra ? el("div", { class: "c-syn" }, f.extra) : null) : null));
  }

  /* ================= review: spaced repetition ================= */
  function review() {
    let q = null, cur = null, flipped = false, done = 0;
    const build = () => { const { due, fresh } = queue(S.set.rdecks); q = [...due, ...fresh]; };
    function draw() {
      if (!q) build();
      cur = q[0];
      const top = el("div", { class: "box" }, el("b", { class: "lbl" }, "Decks"),
        chips(Object.entries(DECKS).map(([id, d]) => [id, d.name]), S.set.rdecks, true, nx => { S.set.rdecks = nx; save(); q = null; flipped = false; draw(); }),
        el("label", { class: "row-l" }, el("input", { type: "checkbox", checked: S.set.reverse || false, onchange: e => { S.set.reverse = e.target.checked; save(); draw(); } }), " Hard mode: show the meaning, recall the word"));
      if (!cur) {
        screen("Review", top, el("div", { class: "card done-c" }, ic("check", 48), el("b", {}, done ? `Done! ${done} cards reviewed.` : "Nothing due right now."),
          el("p", { class: "muted" }, newLeft() ? "Choose more decks above, or come back later." : `You learned ${S.set.newPerDay} new cards today (change this in Settings).`),
          el("a", { class: "btn", href: "#/quiz" }, "Do a quick quiz instead")));
        return;
      }
      const f = face(cur), st = S.srs[cur.id], isNew = !st, rev = S.set.reverse && (cur.deck === "gre" || cur.deck === "toefl");
      const front = rev ? el("div", { class: "c-def big" }, cur.deck === "gre" ? cur.def : cur.m) : el("div", { class: "c-word" }, f.front);
      screen("Review", top,
        el("div", { class: "counts" }, el("span", {}, el("b", {}, String(q.filter(i => S.srs[i.id]).length)), " due"), el("span", {}, el("b", {}, String(q.filter(i => !S.srs[i.id]).length)), " new"), el("span", {}, el("b", {}, String(done)), " done")),
        el("div", { class: "card rc" + (flipped ? " open" : ""), onclick: () => { if (!flipped) { flipped = true; draw(); } } },
          el("div", { class: "c-top" }, el("span", { class: "tag" }, DECKS[cur.deck].short + (isNew ? " · new" : "")), sayBtn(rev ? f.back : f.front.replace("…", "blank"))),
          front, rev ? null : el("div", { class: "muted" }, f.sub),
          flipped ? el("div", { class: "c-ans" }, rev ? el("div", { class: "c-word sm" }, cur.w) : null, el("div", { class: "c-def" }, f.back), f.ex ? el("div", { class: "c-ex" }, f.ex) : null, f.extra ? el("div", { class: "c-syn" }, f.extra) : null)
            : el("div", { class: "tap" }, "Tap to show the answer")),
        flipped ? el("div", { class: "grades" }, [["Again", 0, "g0"], ["Hard", 1, "g1"], ["Good", 2, "g2"], ["Easy", 3, "g3"]].map(([n, g, c]) => el("button", { class: "grade " + c, onclick: () => rate(g) }, el("b", {}, n), el("small", {}, ivLabel(st, g)))))
          : el("button", { class: "btn wide", onclick: () => { flipped = true; draw(); } }, "Show answer"));
    }
    function rate(g) {
      grade(cur, g); done++; q.shift();
      if (g === 0) q.splice(Math.min(3, q.length), 0, cur); // see it again soon
      flipped = false; draw();
    }
    draw();
  }

  /* ================= quick quiz ================= */
  const pickN = (arr, n) => shuffle(arr.slice()).slice(0, n);
  function makeQ(deck) {
    const d = deck === "mix" ? pickN(["gre", "gre", "toefl", "roots", "coll"], 1)[0] : deck;
    if (d === "gre") {
      const it = pickN(GRE, 1)[0], others = GRE.filter(x => x !== it && x.pos === it.pos && (!it.cl || x.cl !== it.cl));
      const type = pickN(["def", "word", "syn"], 1)[0], wr = pickN(others, 3);
      if (type === "def") return { item: it, kind: "GRE · meaning", q: it.w, sub: POS[it.pos], a: it.def, o: shuffle([it.def, ...wr.map(x => x.def)]), why: `${it.w}: ${it.def}. "${it.ex}"` };
      if (type === "word") return { item: it, kind: "GRE · which word?", q: it.def, a: it.w, o: shuffle([it.w, ...wr.map(x => x.w)]), why: `${it.w}: "${it.ex}"` };
      // wrong answers: the first synonym of words from other meaning groups
      const syn = it.syn[0], wrongSyn = [...new Set(wr.map(x => x.syn[0]).filter(s => !it.syn.includes(s) && s !== syn))];
      return { item: it, kind: "GRE · closest in meaning", q: it.w, sub: POS[it.pos], a: syn, o: shuffle([syn, ...wrongSyn]), why: `${it.w} = ${it.syn.join(", ")}. ${it.def}.` };
    }
    if (d === "toefl") {
      const it = pickN(TOEFL, 1)[0], wr = pickN(TOEFL.filter(x => x !== it && x.pos === it.pos && x.grp !== it.grp && x.m !== it.m), 3);
      return { item: it, kind: "TOEFL reading", ctx: it.ex, q: `The word "${it.w}" is closest in meaning to`, a: it.m, o: shuffle([it.m, ...wr.map(x => x.m)]), why: `${it.w} = ${it.m}.` };
    }
    if (d === "roots") {
      const it = pickN(ROOTS, 1)[0], wr = pickN(ROOTS.filter(x => x !== it), 3);
      if (Math.random() < .5) return { item: it, kind: "Root", q: it.w, sub: "What does this root mean?", a: it.m, o: shuffle([it.m, ...wr.map(x => x.m)]), why: `${it.w} = ${it.m}: ${it.ex}` };
      const word = it.ex.split(",")[0].replace(/\(.*\)/, "").trim();
      return { item: it, kind: "Root", q: word, sub: "The root in this word means…", a: it.m, o: shuffle([it.m, ...wr.map(x => x.m)]), why: `${word} contains ${it.w} = ${it.m}.` };
    }
    const it = pickN(COLL, 1)[0];
    return { item: it, kind: "Collocation", q: it.t, sub: "Which word completes the phrase?", a: it.a, o: shuffle([it.a, ...it.wrong]), why: it.ex };
  }
  function quiz() {
    let qs = [], i = 0, picks = [];
    const start = () => { qs = []; const seen = new Set(); while (qs.length < 10) { const x = makeQ(S.set.qdeck); if (!seen.has(x.item.id) && x.o.length >= 3) { seen.add(x.item.id); qs.push(x); } } i = 0; picks = []; draw(); };
    function draw() {
      const top = el("div", { class: "box" }, el("b", { class: "lbl" }, "Questions from"),
        chips([["mix", "Mix"], ["gre", "GRE words"], ["toefl", "TOEFL"], ["roots", "Roots"], ["coll", "Collocations"]], [S.set.qdeck], false, nx => { S.set.qdeck = nx[0]; save(); start(); }));
      if (i >= qs.length) {
        const n = picks.filter((p, k) => p === qs[k].a).length, wrong = qs.filter((x, k) => picks[k] !== x.a);
        screen("Quick Quiz", el("div", { class: "card done-c" }, el("div", { class: "score" }, `${n}/10`), el("b", {}, n === 10 ? "Perfect round." : n >= 8 ? "Strong." : n >= 6 ? "Getting there." : "These words are now in your review queue."),
          wrong.length ? el("div", { class: "rvw" }, wrong.map(x => el("div", { class: "rv" }, el("b", {}, x.a), el("span", {}, x.why)))) : null,
          el("button", { class: "btn wide", onclick: start }, "Next 10")), top);
        return;
      }
      const x = qs[i], answered = picks.length > i, mine = picks[i];
      screen("Quick Quiz", top,
        el("div", { class: "dots" }, qs.map((y, k) => el("i", { class: k < picks.length ? (picks[k] === y.a ? "ok" : "no") : k === i ? "now" : "" }))),
        el("div", { class: "card qc" }, el("div", { class: "c-top" }, el("span", { class: "tag" }, x.kind), el("span", { class: "muted" }, `${i + 1}/10`)),
          x.ctx ? el("div", { class: "c-ex ctx" }, x.ctx.split(/(\[[^\]]*\])/).map(p => /^\[/.test(p) ? el("mark", {}, p.slice(1, -1)) : p)) : null,
          el("div", { class: x.q.length > 40 ? "c-def big" : "c-word" }, x.q), x.sub ? el("div", { class: "muted" }, x.sub) : null),
        el("div", { class: "opts" }, x.o.map(o => el("button", { class: "opt" + (answered && o === x.a ? " right" : "") + (answered && o === mine && o !== x.a ? " wrong" : ""), disabled: answered, onclick: () => {
          picks.push(o); const h = day(); h.r++; if (o === x.a) h.ok++; else missed(x.item); save(); draw();
        } }, o))),
        answered ? el("div", { class: "why " + (mine === x.a ? "ok" : "no") }, x.why) : null,
        answered ? el("button", { class: "btn wide", onclick: () => { i++; draw(); } }, i + 1 >= qs.length ? "See score" : "Next") : null);
    }
    start();
  }

  /* ================= GRE verbal ================= */
  function gre() {
    let mode = store.get("prep.gremode", "mix"), qs = [], i = 0, sel = [], checked = false, score = 0;
    const start = () => { const tc = D.tc.map(x => ({ ...x, kind: "Text Completion" })), se = D.se.map(x => ({ ...x, kind: "Sentence Equivalence" })); qs = shuffle(mode === "tc" ? tc : mode === "se" ? se : [...tc, ...se]).slice(0, 8).map(x => ({ ...x, o: shuffle(x.o.slice()) })); i = 0; sel = []; checked = false; score = 0; draw(); };
    function draw() {
      const top = el("div", { class: "box" }, chips([["mix", "Mixed"], ["tc", "Text Completion"], ["se", "Sentence Equivalence"]], [mode], false, nx => { mode = nx[0]; store.set("prep.gremode", mode); start(); }));
      if (i >= qs.length) { screen("GRE Verbal", el("div", { class: "card done-c" }, el("div", { class: "score" }, `${score}/${qs.length}`), el("b", {}, "Set finished."), el("button", { class: "btn wide", onclick: start }, "New set")), top); return; }
      const x = qs[i], need = x.a.length, right = checked && x.a.every(a => sel.includes(a)) && sel.length === need;
      const parts = x.q.split("___");
      screen("GRE Verbal", top,
        el("div", { class: "dots" }, qs.map((y, k) => el("i", { class: k < i ? "done" : k === i ? "now" : "" }))),
        el("div", { class: "card qc" }, el("div", { class: "c-top" }, el("span", { class: "tag" }, x.kind), el("span", { class: "muted" }, need === 2 ? "Choose TWO" : "Choose one")),
          el("div", { class: "gre-q" }, parts[0], el("span", { class: "gblank" }, checked ? x.a.join(" / ") : "______"), parts[1])),
        el("div", { class: "opts" }, x.o.map(o => el("button", { class: "opt" + (sel.includes(o) ? " sel" : "") + (checked && x.a.includes(o) ? " right" : "") + (checked && sel.includes(o) && !x.a.includes(o) ? " wrong" : ""), disabled: checked, onclick: () => {
          if (need === 1) { sel = [o]; check(); return; }
          sel = sel.includes(o) ? sel.filter(s => s !== o) : sel.length < 2 ? sel.concat(o) : [sel[1], o]; draw();
        } }, o))),
        need === 2 && !checked ? el("button", { class: "btn wide", disabled: sel.length !== 2, onclick: check }, "Check") : null,
        checked ? el("div", { class: "why " + (right ? "ok" : "no") }, (right ? "Right. " : "Answer: " + x.a.join(" + ") + ". ") + x.why) : null,
        checked ? el("button", { class: "btn wide", onclick: () => { i++; sel = []; checked = false; draw(); } }, i + 1 >= qs.length ? "See score" : "Next") : null);
      function check() {
        checked = true; const ok = x.a.every(a => sel.includes(a)) && sel.length === need; if (ok) score++;
        const h = day(); h.r++; if (ok) h.ok++;
        // the words in the answer go to review if they are in the GRE deck
        if (!ok) for (const a of x.a) { const it = GRE.find(g => g.w === a); if (it) missed(it); }
        save(); draw();
      }
    }
    start();
  }

  /* ================= browse ================= */
  function browse() {
    let deck = store.get("prep.bdeck", "gre"), q = "";
    const list = el("div", { class: "list" });
    const fold = s => String(s).toLowerCase();
    const draw = () => {
      const items = DECKS[deck].items.filter(i => !q || fold(JSON.stringify(i)).includes(fold(q)));
      put(list, items.slice(0, 400).map(i => { const f = face(i), st = S.srs[i.id]; return el("details", { class: "li" },
        el("summary", {}, el("b", {}, f.front), el("span", { class: "muted" }, f.back.length > 46 ? f.back.slice(0, 44) + "…" : f.back), st ? el("i", { class: "lvl l" + Math.min(4, Math.ceil(st.b / 2)) }) : null),
        el("div", { class: "li-body" }, el("div", { class: "c-def" }, f.back), f.ex ? el("div", { class: "c-ex" }, f.ex) : null, f.extra ? el("div", { class: "c-syn" }, f.extra) : null, sayBtn(`${f.front.replace("…", "blank")}. ${f.back}. ${f.ex || ""}`))); }),
        items.length ? null : el("p", { class: "muted" }, "Nothing matches."));
    };
    screen("Browse",
      el("div", { class: "box" }, chips(Object.entries(DECKS).map(([id, d]) => [id, d.name]), [deck], false, nx => { deck = nx[0]; store.set("prep.bdeck", deck); browse(); }),
        el("div", { class: "search" }, ic("search", 18), el("input", { type: "search", placeholder: "Search", "aria-label": "Search", oninput: e => { q = e.target.value; draw(); } }))),
      list);
    draw();
  }

  /* ================= progress ================= */
  function stats() {
    const per = Object.entries(DECKS).map(([id, d]) => { const s = d.items.map(i => S.srs[i.id]); return { id, name: d.name, total: d.items.length, nw: s.filter(x => !x).length, learning: s.filter(x => x && x.b < 3).length, known: s.filter(x => x && x.b >= 3).length }; });
    const days = Array.from({ length: 14 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (13 - k)); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; const h = S.hist[key] || { r: 0, l: 0, ok: 0 }; return { key, n: h.r + h.l, d: d.getDate() }; });
    const mx = Math.max(10, ...days.map(x => x.n));
    const weak = Object.entries(S.srs).filter(([id, s]) => s.lapse > 0 && BYID[id]).sort((a, b) => b[1].lapse - a[1].lapse).slice(0, 15);
    const all = Object.values(S.hist).reduce((t, h) => ({ r: t.r + (h.r || 0), ok: t.ok + (h.ok || 0) }), { r: 0, ok: 0 });
    screen("Progress",
      el("section", { class: "today" },
        el("div", { class: "stat" }, ic("flame", 22), el("b", {}, String(streak())), el("small", {}, "day streak")),
        el("div", { class: "stat" }, el("b", {}, String(per.reduce((t, p) => t + p.known, 0))), el("small", {}, "words known")),
        el("div", { class: "stat" }, el("b", {}, all.r ? Math.round(all.ok / all.r * 100) + "%" : "–"), el("small", {}, "accuracy"))),
      el("div", { class: "box" }, el("b", { class: "lbl" }, "Last 14 days"),
        el("div", { class: "bars" }, days.map(x => el("div", { class: "bar" }, el("i", { style: `height:${Math.round(x.n / mx * 100)}%` }), el("small", {}, String(x.d)))))),
      el("div", { class: "box" }, per.map(p => el("div", { class: "deckp" }, el("div", { class: "dp-h" }, el("b", {}, p.name), el("span", { class: "muted" }, `${p.known} known · ${p.learning} learning · ${p.nw} new`)),
        el("div", { class: "pbar" }, el("i", { class: "k", style: `width:${p.known / p.total * 100}%` }), el("i", { class: "l", style: `width:${p.learning / p.total * 100}%` }))))),
      el("div", { class: "box" }, el("b", { class: "lbl" }, "Weak words (missed most)"),
        weak.length ? el("div", { class: "rvw" }, weak.map(([id, s]) => { const f = face(BYID[id]); return el("div", { class: "rv" }, el("b", {}, f.front), el("span", {}, `${f.back} · missed ${s.lapse}×`)); }), el("a", { class: "btn wide", href: "#/listen", onclick: () => { S.set.ldecks = ["weak"]; save(); L.list = []; } }, "Listen to my weak words"))
          : el("p", { class: "muted" }, "No weak words yet. Mistakes from quizzes and reviews show up here.")));
  }

  /* ================= settings ================= */
  function settings() {
    const vs = el("select", { "aria-label": "Voice", onchange: e => { S.set.voice = e.target.value; save(); speak("Ubiquitous. Present everywhere."); } },
      el("option", { value: "" }, "Automatic"), voices.map(v => el("option", { value: v.name, selected: v.name === S.set.voice }, `${v.name} (${v.lang})`)));
    const bk = el("textarea", { class: "bk", rows: 3, placeholder: "Paste a backup here to restore it" });
    screen("Settings",
      el("div", { class: "box" }, el("b", { class: "lbl" }, "Voice"), vs, el("button", { class: "btn", onclick: () => { if (synth) synth.cancel(); speak("Ubiquitous. Present, appearing, or found everywhere."); } }, ic("speak", 18), " Test the voice")),
      el("div", { class: "box" }, el("b", { class: "lbl" }, "New cards per day"), chips([[10, "10"], [20, "20"], [30, "30"], [50, "50"]], [S.set.newPerDay], false, nx => { S.set.newPerDay = nx[0]; save(); settings(); })),
      el("div", { class: "box" }, el("b", { class: "lbl" }, "Look"), chips([["dark", "Dark"], ["light", "Light"]], [S.set.theme], false, nx => { S.set.theme = nx[0]; document.documentElement.dataset.theme = nx[0]; save(); settings(); })),
      el("div", { class: "box" }, el("b", { class: "lbl" }, "Backup"),
        el("p", { class: "muted" }, "Your progress is saved on this phone. Copy a backup to move it to another device."),
        el("div", { class: "row" },
          el("button", { class: "btn", onclick: async () => { const t = JSON.stringify(S); try { await navigator.clipboard.writeText(t); toast("Backup copied"); } catch (e) { bk.value = t; bk.select(); toast("Copy the text in the box"); } } }, "Copy backup"),
          el("button", { class: "btn", onclick: () => { try { const v = JSON.parse(bk.value); if (!v.srs) throw 0; Object.assign(S, v); save(); toast("Backup restored"); home(); location.hash = "#/"; } catch (e) { toast("That isn't a backup"); } } }, "Restore")), bk),
      el("div", { class: "box" }, el("b", { class: "lbl" }, "Install"), el("p", { class: "muted" }, "Add this page to your home screen (Share, then Add to Home Screen) to open it like an app. It also works offline once opened.")),
      el("div", { class: "box" }, el("button", { class: "btn danger", onclick: () => { if (confirm("Delete all progress?")) { S.srs = {}; S.hist = {}; S.newDay = { d: "", n: 0 }; save(); toast("Progress reset"); } } }, "Reset progress")));
  }

  /* ================= routing ================= */
  const ROUTES = { "": home, listen, review, quiz, gre, browse, stats, settings };
  function route() {
    cleanup.forEach(f => f()); cleanup = [];
    const id = location.hash.replace(/^#\/?/, "");
    if (id !== "listen" && L.on) { /* keep playing in the background of other screens */ }
    (ROUTES[id] || home)(); window.scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("/prep/sw.js", { scope: "/prep/" }).catch(() => {});
})();
