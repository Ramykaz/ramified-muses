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

  /* ================= host ================= */
  let H = store.get("imp.host", null), hostCats = store.get("imp.cats", []), hostImps = store.get("imp.imps", 1), CATS = [];
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
    const impBox = el("div", { class: "row" });
    const drawImps = () => impBox.replaceChildren(el("span", { class: "muted" }, "Imposters:"), ...[1, 2, 3].map(n => el("button", { class: "cat" + (hostImps === n ? " on" : ""), onclick: () => { hostImps = n; store.set("imp.imps", n); drawImps(); } }, String(n))));
    drawImps();
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
          el("div", { class: "panel", style: "display:grid;gap:12px" }, el("h2", {}, "Settings"), el("div", { class: "muted" }, "Pick topics for the words, or keep Everything."), catBox, impBox))));
    fixLogo();
    loadQR().then(() => drawQR(qr, `${location.origin}/imposter/${H.pin}`)).catch(() => qr.remove());
    let last = null;
    const draw = s => {
      count.textContent = String(s.players.length);
      plist.replaceChildren(...[s.players.length ? s.players.map(p => el("span", { class: "pl" + (s.state.round && !p.inRound ? " wait" : ""), title: s.state.round && !p.inRound ? "Joined during this round: plays from the next one" : null }, el("span", {}, p.name),
        el("button", { "aria-label": "Remove " + p.name, onclick: async () => { if (!confirm(`Remove ${p.name}?`)) return; await api("kick", { method: "POST", body: { pin: H.pin, host: H.host, pid: p.id } }).catch(e => toast(e.message)); poll(); } }, "×")))
        : el("span", { class: "muted dots" }, "Waiting for players")].flat());
      const st = s.state, key = JSON.stringify([st.round, st.revealed, st.first, s.players.length]);
      if (key === last) return; last = key;
      if (!st.round) {
        roundBox.replaceChildren(el("div", { class: "num" }, "Ready?"), el("div", { class: "cat-big" }, "Scan and join"),
          el("p", { class: "muted", style: "margin:0;max-width:520px" }, "When everyone is in, press Next round. Each phone shows a word. Most people have the same word. The imposter has a different, similar word and doesn't know it."),
          s.players.length < 3 ? el("p", { class: "muted", style: "margin:0" }, "You need at least 3 players.") : null, nextBtn);
        nextBtn.disabled = s.players.length < 3;
        return;
      }
      nextBtn.disabled = false;
      roundBox.replaceChildren(
        el("div", { class: "num" }, "Round " + st.round),
        el("div", { class: "cat-big" }, s.cat || ""),
        el("div", { class: "first" }, el("b", {}, st.first), " starts"),
        el("ol", { class: "steps" },
          el("li", {}, "Look at your word. Don't show anyone!"),
          el("li", {}, "Go round: each person says one thing about their word. Don't say the word."),
          el("li", {}, "Vote: who is the imposter?")),
        s.reveal ? el("div", { class: "reveal" },
          el("div", { class: "muted" }, s.reveal.imposters.length > 1 ? "The imposters were" : "The imposter was"),
          el("div", { class: "who" }, s.reveal.imposters.join(" & ") || "(left the game)"),
          el("div", { class: "pair" }, el("div", {}, el("small", {}, "Everyone's word"), el("b", {}, s.reveal.main)), el("div", { class: "odd" }, el("small", {}, "Imposter's word"), el("b", {}, s.reveal.odd))))
          : el("button", { class: "btn cyan big", onclick: reveal }, "Reveal the imposter"),
        nextBtn);
    };
    async function poll() { try { const s = await api("host-state", { query: { pin: H.pin, host: H.host } }); draw(s); } catch (e) { if (e.status === 404) { store.del("imp.host"); H = null; clearInterval(hostTimer); toast("That game has ended."); hostStart(); } } }
    async function next() {
      nextBtn.disabled = true;
      try { await api("next", { method: "POST", body: { pin: H.pin, host: H.host, cats: hostCats, imps: hostImps } }); await poll(); }
      catch (e) { toast(e.message); } finally { nextBtn.disabled = false; }
    }
    async function reveal() { try { await api("reveal", { method: "POST", body: { pin: H.pin, host: H.host } }); poll(); } catch (e) { toast(e.message); } }
    clearInterval(hostTimer); hostTimer = setInterval(poll, 2000); poll();
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
      if (!mine.word) { root.replaceChildren(top, el("div", { class: "wordcard" }, el("div", {}, el("div", { class: "label" }, "Round " + S.round), el("div", { class: "word", style: "font-size:26px" }, "You joined during this round"), el("div", { class: "muted" }, "You'll get a word in the next round.")))); fixLogo(); return; }
      const card = el("button", { class: "wordcard" + (shown ? "" : " hidden"), type: "button", "aria-label": shown ? "Hide my word" : "Show my word", onclick: () => { shown = !shown; render(); } },
        el("div", {}, el("div", { class: "label" }, mine.cat), el("div", { class: "word" }, mine.word), el("div", { class: "tap" }, shown ? "Tap to hide" : "Tap to see your word")));
      const out = [top, el("div", { class: "hint" }, "Round " + S.round, " · ", el("b", {}, S.first), " starts"), card];
      if (S.reveal) {
        const was = S.reveal.imposters.includes(ME.name);
        out.push(el("div", { class: "panel", style: "display:grid;gap:10px;justify-items:center;text-align:center" },
          was ? el("div", { class: "you-were" }, "You were the imposter!") : el("div", {}, el("span", { class: "muted" }, S.reveal.imposters.length > 1 ? "The imposters were " : "The imposter was "), el("b", { style: "color:var(--red)" }, S.reveal.imposters.join(" & "))),
          el("div", { class: "pair" }, el("div", {}, el("small", {}, "Everyone's word"), el("b", {}, S.reveal.main)), el("div", { class: "odd" }, el("small", {}, "Imposter's word"), el("b", {}, S.reveal.odd)))));
      } else out.push(el("p", { class: "muted", style: "text-align:center;margin:0" }, "Say one thing about your word, but not the word. Who is the imposter?"));
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
