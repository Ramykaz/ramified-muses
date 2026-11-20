/* Imposter: /imposter/host is the big screen, /imposter and /imposter/<PIN> are the phones.
   Talks to /api/imposter. */
(() => {
  "use strict";
  const app = document.getElementById("app");
  const $ = s => document.querySelector(s);
  const el = (tag, props, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k === "value") n.value = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c));
    return n;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600); }
  async function api(action, { method = "GET", body, query = {} } = {}) {
    let r;
    try { r = await fetch("/api/imposter?" + new URLSearchParams({ action, ...query }), { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { throw Object.assign(new Error("No connection. Check your internet."), { status: 0 }); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "Something went wrong."), { status: r.status });
    return j;
  }
  const LOGO = () => { const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "14 18 36 26"); svg.setAttribute("aria-hidden", "true"); svg.innerHTML = '<path d="M16 28c6-7 26-7 32 0 0 9-6 13-11 13-3 0-4-3-5-3s-2 3-5 3c-5 0-11-4-11-13z" fill="#FF5A5F"/><ellipse cx="25" cy="29.5" rx="4" ry="2.6" fill="#16122B"/><ellipse cx="39" cy="29.5" rx="4" ry="2.6" fill="#16122B"/>'; return el("div", { class: "logo" }, svg, el("span", {}, "Impos", el("b", {}, "ter"))); };
  const fixLogo = () => {};
  const joinUrl = () => location.host + "/imposter";

  const pairBox = r => el("div", { class: "pair" }, el("div", {}, el("small", {}, r.odd ? "Everyone's word" : "The word was"), el("b", {}, r.main)), r.odd ? el("div", { class: "odd" }, el("small", {}, "Imposter's word"), el("b", {}, r.odd)) : null);

  // the games: same words and phones, different ways to play
  const G = {
    imposter: { name: "Imposter", short: "Say one thing", imp: true, steps: ["Look at your word. Don't show anyone!", "Go round: each person says one thing about their word. Don't say the word.", "Vote: who is the imposter?"], phone: "Say one thing about your word, but not the word. Who is the imposter?", impPhone: "Say something that fits the topic. Don't get caught!", reveal: "Reveal the imposter" },
    draw: { name: "Draw it", short: "One line each on the board", imp: true, steps: ["Look at your word. Don't show anyone!", "Go round: each person draws ONE line on the board. No letters or words!", "Vote: who is the imposter?"], phone: "Draw one line on the board for your word. No letters!", impPhone: "Look at the drawing and add a line that fits. Don't get caught!", reveal: "Reveal the imposter" },
    act: { name: "Act it out", short: "Mime it, no talking", imp: true, steps: ["Look at your word. Don't show anyone!", "Go round: act out your word for 5 seconds. No talking, no sounds!", "Vote: who is the imposter?"], phone: "Act out your word. No talking!", impPhone: "Watch the others and act something that fits. Don't get caught!", reveal: "Reveal the imposter" },
    teams: { name: "Two teams", short: "Who has my word?", imp: false, steps: ["Half of you have one word. The other half have a different word. You don't know which team you are on!", "Go round: each person says one thing about their word.", "Stand with the people you think have your word."], phone: "Say one thing about your word. Who has the same word as you?", reveal: "Show the teams" },
    pairs: { name: "Find your partner", short: "Walk and talk", imp: false, steps: ["One other person has the same word as you.", "Stand up and walk around. Tell each person one thing about your word. Don't say the word!", "Found your partner? Stand together!"], phone: "Walk around and find the person with the same word!", reveal: "Show the partners" },
  };
  const groupsBox = (r, me) => el("div", { class: "groups" }, r.groups.map(g => el("div", { class: "grp" + (me && g.names.includes(me) ? " mine" : "") }, el("b", {}, g.word), el("span", {}, g.names.join(", ")))));

  /* ================= host ================= */
  let H = store.get("imp.host", null), hostCats = store.get("imp.cats", []), hostImps = store.get("imp.imps", 1), hostMode = store.get("imp.mode", "topic"), hostGame = G[store.get("imp.game", "imposter")] ? store.get("imp.game", "imposter") : "imposter", hostPack = store.get("imp.pack", ""), CATS = [], PACKS = [];
  async function hostStart() {
    app.replaceChildren(el("div", { class: "center" }, el("div", { class: "stack" }, LOGO(),
      el("p", { class: "muted" }, "Everyone gets the same word, except the imposter, who gets a similar one and doesn't know it. Go round, each person says one thing about their word, then vote."),
      el("button", { class: "btn primary big", onclick: async e => { e.currentTarget.disabled = true; try { H = await api("create", { method: "POST" }); store.set("imp.host", H); hostScreen(); } catch (x) { toast(x.message); e.currentTarget.disabled = false; } } }, "Start a game"),
      H ? el("button", { class: "btn", onclick: hostScreen }, "Back to game " + H.pin) : null)));
    fixLogo();
  }
  let hostTimer = null;
  async function hostScreen() {
    if (!H) return hostStart();
    try { CATS = CATS.length ? CATS : (await api("cats")).cats; } catch (e) { /* shown later */ }
    const qr = el("canvas", { class: "qr", width: 420, height: 420, "aria-label": "QR code to join" });
    const plist = el("div", { class: "players" }), count = el("b", {}, "0");
    const roundBox = el("div", { class: "panel round" });
    const nextBtn = el("button", { class: "btn primary big", onclick: next }, "Next round");
    const catBox = el("div", { class: "cats" });
    const drawCats = () => catBox.replaceChildren(...[
      el("button", { class: "cat" + (!hostCats.length ? " on" : ""), onclick: () => { hostCats = []; store.set("imp.cats", hostCats); drawCats(); } }, "Everything"),
      CATS.map(c => el("button", { class: "cat" + (hostCats.includes(c.id) ? " on" : ""), onclick: () => { hostCats = hostCats.includes(c.id) ? hostCats.filter(x => x !== c.id) : [...hostCats, c.id]; store.set("imp.cats", hostCats); drawCats(); } }, `${c.name} (${c.n})`))].flat());
    drawCats();
    const modeBox = el("div", { class: "row" }), packBox = el("div", { class: "cats" }), topicRow = el("div", { style: "display:grid;gap:8px" }, el("div", { class: "muted" }, "Topics (or keep Everything):"), catBox);
    const gameBox = el("div", { class: "games" });
    const drawGame = () => { gameBox.replaceChildren(...Object.entries(G).map(([id, g]) => el("button", { class: "game" + (hostGame === id ? " on" : ""), onclick: () => { hostGame = id; store.set("imp.game", id); drawGame(); last = null; poll(); } }, el("b", {}, g.name), el("small", {}, g.short)))); modeBox.hidden = impBox.hidden = !G[hostGame].imp; };
    const drawMode = () => modeBox.replaceChildren(el("span", { class: "muted" }, "The imposter sees:"),
      ...[["topic", "Only the topic"], ["word", "A similar word"]].map(([m, t]) => el("button", { class: "cat" + (hostMode === m ? " on" : ""), onclick: () => { hostMode = m; store.set("imp.mode", m); drawMode(); } }, t)));
    drawMode();
    const drawPacks = () => {
      if (hostPack && !PACKS.some(p => p.id === hostPack)) { hostPack = ""; store.set("imp.pack", ""); }
      packBox.replaceChildren(
        el("button", { class: "cat" + (!hostPack ? " on" : ""), onclick: () => { hostPack = ""; store.set("imp.pack", ""); drawPacks(); } }, "Built-in words"),
        ...PACKS.map(p => el("button", { class: "cat" + (hostPack === p.id ? " on" : ""), onclick: () => { hostPack = p.id; store.set("imp.pack", p.id); drawPacks(); } }, `${p.title} (${p.pairs.length})`)),
        el("button", { class: "cat make", onclick: () => packMaker(() => { drawPacks(); }) }, "+ Make your own"));
      topicRow.hidden = !!hostPack;
    };
    api("packs").then(r => { PACKS = r.packs; drawPacks(); }).catch(() => drawPacks());
    drawPacks();
    const impBox = el("div", { class: "row" });
    const drawImps = () => impBox.replaceChildren(el("span", { class: "muted" }, "Imposters:"), ...[1, 2, 3].map(n => el("button", { class: "cat" + (hostImps === n ? " on" : ""), onclick: () => { hostImps = n; store.set("imp.imps", n); drawImps(); } }, String(n))));
    drawImps(); drawGame();
    app.replaceChildren(
      el("div", { class: "top" }, LOGO(), el("div", { class: "row" },
        el("button", { class: "btn small", onclick: () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); } }, "Full screen"),
        el("button", { class: "btn small", onclick: () => { if (confirm("End this game and start a new one?")) { store.del("imp.host"); H = null; clearInterval(hostTimer); hostStart(); } } }, "New game"))),
      el("div", { class: "host" },
        el("div", { class: "panel join" },
          el("span", { class: "muted" }, "Join at"), el("span", { class: "url" }, joinUrl()),
          el("span", { class: "pin-big" }, H.pin), qr,
          el("span", { class: "muted" }, "Players: ", count)),
        el("div", { style: "display:grid;gap:18px;min-width:0" },
          roundBox,
          el("div", { class: "panel", style: "display:grid;gap:12px" }, el("h2", {}, "Players"), plist),
          el("div", { class: "panel", style: "display:grid;gap:12px" }, el("h2", {}, "Game"), gameBox, el("h2", {}, "Settings"), modeBox, el("div", { class: "muted" }, "Words:"), packBox, topicRow, impBox))));
    fixLogo();
    loadQR().then(() => drawQR(qr, `${location.origin}/imposter/${H.pin}`)).catch(() => qr.remove());
    let last = null;
    const putR = (...kids) => roundBox.replaceChildren(...kids.flat().filter(k => k != null && k !== false));
    const draw = s => {
      count.textContent = String(s.players.length);
      plist.replaceChildren(...[s.players.length ? s.players.map(p => el("span", { class: "pl" + (s.state.round && !p.inRound ? " wait" : ""), title: s.state.round && !p.inRound ? "Joined during this round: plays from the next one" : null }, el("span", {}, p.name),
        el("button", { "aria-label": "Remove " + p.name, onclick: async () => { if (!confirm(`Remove ${p.name}?`)) return; await api("kick", { method: "POST", body: { pin: H.pin, host: H.host, pid: p.id } }).catch(e => toast(e.message)); poll(); } }, "×")))
        : el("span", { class: "muted dots" }, "Waiting for players")].flat());
      const st = s.state, key = JSON.stringify([st.round, st.revealed, st.first, s.players.length, hostGame]);
      const gm = G[st.round ? st.game || "imposter" : hostGame] || G.imposter;
      if (key === last) return; last = key;
      if (!st.round) {
        putR(el("div", { class: "num" }, "Ready? · " + gm.name), el("div", { class: "cat-big" }, "Scan and join"),
          el("ol", { class: "steps" }, gm.steps.map(t => el("li", {}, t))),
          el("p", { class: "muted", style: "margin:0;max-width:520px" }, "When everyone is in, press Next round. Choose another game below at any time."),
          s.players.length < 3 ? el("p", { class: "muted", style: "margin:0" }, "You need at least 3 players.") : null, nextBtn);
        nextBtn.disabled = s.players.length < 3;
        return;
      }
      nextBtn.disabled = false;
      putR(
        el("div", { class: "num" }, "Round " + st.round + " · " + gm.name),
        el("div", { class: "cat-big" }, s.cat || gm.name),
        st.game === "pairs" ? null : el("div", { class: "first" }, el("b", {}, st.first), " starts"),
        el("ol", { class: "steps" }, gm.steps.map(t => el("li", {}, t))),
        s.reveal && s.reveal.kind === "groups" ? el("div", { class: "reveal" }, el("div", { class: "muted" }, st.game === "teams" ? "The two teams" : "The partners"), groupsBox(s.reveal))
        : s.reveal ? el("div", { class: "reveal" },
          el("div", { class: "muted" }, s.reveal.imposters.length > 1 ? "The imposters were" : "The imposter was"),
          el("div", { class: "who" }, s.reveal.imposters.join(" & ") || "(left the game)"),
          pairBox(s.reveal))
          : el("button", { class: "btn cyan big", onclick: reveal }, gm.reveal),
        nextBtn);
    };
    async function poll() { try { const s = await api("host-state", { query: { pin: H.pin, host: H.host } }); draw(s); } catch (e) { if (e.status === 404) { store.del("imp.host"); H = null; clearInterval(hostTimer); toast("That game has ended."); hostStart(); } } }
    async function next() {
      nextBtn.disabled = true;
      try { await api("next", { method: "POST", body: { pin: H.pin, host: H.host, cats: hostCats, imps: hostImps, mode: hostMode, pack: hostPack || undefined, game: hostGame } }); await poll(); }
      catch (e) { toast(e.message); } finally { nextBtn.disabled = false; }
    }
    async function reveal() { try { await api("reveal", { method: "POST", body: { pin: H.pin, host: H.host } }); poll(); } catch (e) { toast(e.message); } }
    clearInterval(hostTimer); hostTimer = setInterval(poll, 2000); poll();
  }
  /* ---------- make your own words ---------- */
  const PROMPT = `Make words for an "Imposter" party game for my English class. My students are Turkish, level A2 to B1.
Topic: [WRITE YOUR TOPIC, e.g. Unit 4 vocabulary, jobs, food, our city]

Give me 30 lines. Each line is: topic | word | a similar word
- The topic is a short category students will see (e.g. Food, Jobs, Weather).
- Use words my students know. Turkish things are welcome (places, food, famous people).
- The similar word must be in the same topic and close in meaning, but different.
- If an English word is difficult, add the Turkish meaning in brackets, like: pharmacy (eczane)
Write only the 30 lines, nothing else.

Example:
Food | simit | poğaça
Jobs | nurse (hemşire) | doctor
Weather | snow (kar) | rain (yağmur)`;
  function parsePairs(text) {
    text = String(text || "").trim().replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/, "").trim();
    if (!text) return [];
    if (/^[\[{]/.test(text)) { try { const j = JSON.parse(text); const arr = Array.isArray(j) ? j : j.pairs || j.words || []; return arr.map(x => Array.isArray(x) ? x : [x.topic || x.category, x.word, x.similar || x.odd]).filter(x => x[0] && x[1]); } catch (e) { /* fall back to lines */ } }
    return text.split(/\n+/).map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean)
      .map(l => l.split(/\s*[|;\t]\s*/)).filter(x => x.length >= 2 && x[0] && x[1] && !/^topic$/i.test(x[0])).map(x => [x[0], x[1], x[2] || ""]);
  }
  function packMaker(done) {
    const title = el("input", { class: "input small-in", maxlength: 60, placeholder: "Name, e.g. Unit 4 words", "aria-label": "Pack name" });
    const ta = el("textarea", { class: "input area", rows: 9, placeholder: "Paste the AI's answer here.\nOne line each: topic | word | similar word", "aria-label": "Words" });
    const status = el("div", { class: "muted" }, "Copy the prompt, give it to an AI (ChatGPT, Claude…), then paste the answer here.");
    const save = el("button", { class: "btn primary", disabled: true }, "Save pack");
    const check = () => { const p = parsePairs(ta.value); save.disabled = p.length < 3; status.textContent = ta.value.trim() ? (p.length ? `${p.length} words ready. ${p.filter(x => x[2]).length} have a similar word. First: ${p[0][0]} | ${p[0][1]}${p[0][2] ? " | " + p[0][2] : ""}` : "I can't read that. Use one line each: topic | word | similar word") : "Copy the prompt, give it to an AI (ChatGPT, Claude…), then paste the answer here."; };
    ta.addEventListener("input", check);
    const close = () => { sheet.remove(); document.removeEventListener("keydown", esc); };
    const esc = e => { if (e.key === "Escape") close(); };
    save.onclick = async () => {
      save.disabled = true;
      try { const r = await api("pack-save", { method: "POST", body: { title: title.value, pairs: parsePairs(ta.value) } }); PACKS = (await api("packs")).packs; hostPack = r.id; store.set("imp.pack", r.id); toast(`Saved "${r.title}": ${r.n} words`); close(); done(); }
      catch (e) { toast(e.message); save.disabled = false; }
    };
    const list = el("div", { class: "packlist" }, PACKS.map(p => el("div", { class: "pk" }, el("span", {}, el("b", {}, p.title), el("small", { class: "muted" }, ` ${p.pairs.length} words`)),
      el("button", { class: "btn small", onclick: async e => { if (!confirm(`Delete "${p.title}"?`)) return; await api("pack-delete", { method: "POST", body: { id: p.id } }).catch(x => toast(x.message)); PACKS = PACKS.filter(x => x.id !== p.id); e.target.closest(".pk").remove(); done(); } }, "Delete"))));
    const sheet = el("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": "Make your own words", onclick: e => { if (e.target === sheet) close(); } },
      el("div", { class: "panel sheet-in" },
        el("div", { class: "row", style: "justify-content:space-between" }, el("h2", {}, "Make your own words"), el("button", { class: "btn small", onclick: close }, "Close")),
        el("ol", { class: "steps" },
          el("li", {}, "Copy the prompt and change the topic line."),
          el("li", {}, "Paste it into an AI and copy its answer."),
          el("li", {}, "Paste the answer below and save. Your packs are saved online for all your devices.")),
        el("div", { class: "row" }, el("button", { class: "btn cyan", onclick: async () => { try { await navigator.clipboard.writeText(PROMPT); toast("Prompt copied"); } catch (e) { ta.value = PROMPT; check(); toast("Copy it from the box"); } } }, "Copy the prompt"),
          el("button", { class: "btn small", onclick: () => { ta.value = "Food | simit | poğaça\nJobs | nurse (hemşire) | doctor\nWeather | snow (kar) | rain (yağmur)\nAnimals | seagull (martı) | pigeon (güvercin)"; check(); } }, "Fill an example")),
        title, ta, status, el("div", { class: "row" }, save),
        PACKS.length ? el("div", { style: "display:grid;gap:8px" }, el("h2", {}, "Your packs"), list) : null));
    document.body.append(sheet); document.addEventListener("keydown", esc); setTimeout(() => title.focus(), 50);
  }

  let qrLib = null;
  const loadQR = () => qrLib ??= new Promise((ok, no) => { const s = el("script", { src: "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js" }); s.onload = ok; s.onerror = () => { qrLib = null; no(); }; document.head.append(s); });
  function drawQR(c, text) {
    const q = window.qrcode(0, "M"); q.addData(text); q.make();
    const n = q.getModuleCount(), g = c.getContext("2d"), cell = 420 / (n + 4);
    g.fillStyle = "#fff"; g.fillRect(0, 0, 420, 420); g.fillStyle = "#16122B";
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect(Math.floor((k + 2) * cell), Math.floor((r + 2) * cell), Math.ceil(cell), Math.ceil(cell));
  }

  /* ================= phone ================= */
  let ME = store.get("imp.me", null);
  function pinScreen(msg) {
    const inp = el("input", { class: "input pin", inputmode: "numeric", autocomplete: "off", maxlength: 6, placeholder: "PIN", "aria-label": "Game PIN" });
    const err = el("div", { class: "err" }, msg || "");
    const go = async e => {
      e.preventDefault(); const pin = inp.value.replace(/\D/g, "");
      if (pin.length !== 6) { err.textContent = "The PIN has 6 numbers."; return; }
      try { await api("state", { query: { pin, t: Math.floor(Date.now() / 1000) } }); nameScreen(pin); } catch (x) { err.textContent = x.message; }
    };
    app.replaceChildren(el("div", { class: "center" }, el("form", { class: "stack", onsubmit: go }, LOGO(),
      el("p", { class: "muted", style: "margin:0" }, "Type the PIN on the screen."), inp, el("button", { class: "btn primary big", type: "submit" }, "Enter"), err,
      el("a", { class: "muted", href: "/imposter/host", style: "margin-top:20px" }, "Host a game"))));
    fixLogo(); setTimeout(() => inp.focus(), 80);
  }
  function nameScreen(pin) {
    const inp = el("input", { class: "input", maxlength: 20, autocomplete: "nickname", placeholder: "Your name", "aria-label": "Your name", value: store.get("imp.name", "") });
    const err = el("div", { class: "err" });
    const go = async e => {
      e.preventDefault(); const b = e.submitter || $("form button"); b.disabled = true;
      try { const r = await api("join", { method: "POST", body: { pin, name: inp.value } }); ME = { pin, ...r }; store.set("imp.me", ME); store.set("imp.name", r.name); history.replaceState(null, "", "/imposter/" + pin); play(); }
      catch (x) { err.textContent = x.message; b.disabled = false; }
    };
    app.replaceChildren(el("div", { class: "center" }, el("form", { class: "stack", onsubmit: go }, LOGO(),
      el("span", { class: "badge" }, "PIN " + pin), inp, el("button", { class: "btn primary big", type: "submit" }, "Join"), err,
      el("button", { class: "btn small", type: "button", onclick: () => { history.replaceState(null, "", "/imposter"); pinScreen(); } }, "Different PIN"))));
    fixLogo(); setTimeout(() => inp.focus(), 80);
  }
  function leave(msg) { ME = null; store.del("imp.me"); history.replaceState(null, "", "/imposter"); pinScreen(msg); }
  async function play() {
    let S = null, mine = null, shown = false, fails = 0;
    const root = el("div", { class: "phone" }); app.replaceChildren(root);
    const render = () => {
      const top = el("div", { class: "top", style: "margin:0" }, LOGO(), el("span", { class: "badge" }, ME.name));
      if (!S || !S.round) { root.replaceChildren(top, el("div", { class: "wordcard" }, el("div", {}, el("div", { class: "label" }, "You're in!"), el("div", { class: "word", style: "font-size:28px" }, "Look at the screen"), el("div", { class: "muted dots" }, "Waiting for the first round")))); fixLogo(); return; }
      if (!mine || mine.round !== S.round) { root.replaceChildren(top, el("div", { class: "wordcard" }, el("div", { class: "muted dots" }, "Getting your word"))); fixLogo(); return; }
      if (mine.waiting) { root.replaceChildren(top, el("div", { class: "wordcard" }, el("div", {}, el("div", { class: "label" }, "Round " + S.round), el("div", { class: "word", style: "font-size:26px" }, "You joined during this round"), el("div", { class: "muted" }, "You'll get a word in the next round.")))); fixLogo(); return; }
      // every hidden card looks the same, so nobody can tell the imposter's phone from across the room
      const face = !shown ? el("div", { class: "word" }, "• • • • •")
        : mine.imposter ? [el("div", { class: "word imp" }, "You are the imposter!"), el("div", { class: "muted" }, "You don't know the word. Listen, blend in and try to guess it.")]
        : el("div", { class: "word" }, mine.word);
      const card = el("button", { class: "wordcard" + (shown ? "" : " hidden"), type: "button", "aria-label": shown ? "Hide my card" : "Show my card", onclick: () => { shown = !shown; render(); } },
        el("div", {}, el("div", { class: "label" }, "Topic: " + mine.cat), face, el("div", { class: "tap" }, shown ? "Tap to hide" : "Tap to see your card")));
      const gm = G[S.game] || G.imposter;
      const out = [top, el("div", { class: "hint" }, "Round " + S.round, " · ", gm.name, S.game === "pairs" ? null : [" · ", el("b", {}, S.first), " starts"]), card];
      if (S.reveal && S.reveal.kind === "groups") {
        const myG = S.reveal.groups.find(g => g.names.includes(ME.name));
        out.push(el("div", { class: "panel", style: "display:grid;gap:10px;justify-items:center;text-align:center" },
          myG ? el("div", {}, el("span", { class: "muted" }, S.game === "teams" ? "Your team: " : myG.names.length > 2 ? "Your partners: " : "Your partner: "), el("b", { style: "color:var(--gold)" }, myG.names.filter(n => n !== ME.name).join(", ") || "(nobody else)")) : null,
          groupsBox(S.reveal, ME.name)));
      } else if (S.reveal) {
        const was = S.reveal.imposters.includes(ME.name);
        out.push(el("div", { class: "panel", style: "display:grid;gap:10px;justify-items:center;text-align:center" },
          was ? el("div", { class: "you-were" }, "You were the imposter!") : el("div", {}, el("span", { class: "muted" }, S.reveal.imposters.length > 1 ? "The imposters were " : "The imposter was "), el("b", { style: "color:var(--red)" }, S.reveal.imposters.join(" & "))),
          pairBox(S.reveal)));
      } else out.push(el("p", { class: "muted", style: "text-align:center;margin:0" }, mine.imposter ? gm.impPhone : gm.phone));
      root.replaceChildren(...out); fixLogo();
    };
    render();
    while (ME) {
      try {
        const st = await api("state", { query: { pin: ME.pin, t: Math.floor(Date.now() / 1000) } });
        fails = 0; $(".offline")?.remove();
        if (st.round && (!mine || mine.round !== st.round)) {
          mine = await api("me", { query: { pin: ME.pin, pid: ME.pid, secret: ME.secret } }); shown = false;
          if (navigator.vibrate) navigator.vibrate(60);
        }
        const changed = JSON.stringify(st) !== JSON.stringify(S); S = st; if (changed) render();
      } catch (e) {
        if (e.status === 404) { leave(e.message); return; }
        if (++fails >= 3 && !$(".offline")) document.body.append(el("div", { class: "offline" }, "Reconnecting…"));
      }
      await sleep(1200 + Math.random() * 400);
    }
  }

  /* ================= start ================= */
  const seg = location.pathname.replace(/^\/imposter\/?/, "").split("/")[0];
  if (seg === "host") { if (H) hostScreen(); else hostStart(); }
  else if (ME && (!/^\d{6}$/.test(seg) || seg === ME.pin)) { history.replaceState(null, "", "/imposter/" + ME.pin); play(); }
  else if (/^\d{6}$/.test(seg)) nameScreen(seg);
  else pinScreen();
})();
