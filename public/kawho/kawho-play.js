/* Kawho player app (phones): join with a PIN, answer, see your result. */
(() => {
  "use strict";
  const { $, el, put, toast, store, api, COLORS, shape, sound, confetti, AVATARS, TYPE_NAMES, logo, sleep } = window.KW;
  const app = $("#app");
  const SESSION = "kw.player";
  let me = store.get(SESSION, null);         // { pin, pid, secret, name, avatar }
  let offset = 0;                            // server clock minus ours
  let S = null;                              // latest game state
  let shownKey = "", answered = {}, results = {}, failures = 0, alive = true, tickT = null;
  const now = () => Date.now() + offset;
  const vibrate = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* not supported */ } };
  const pathPin = (location.pathname.replace(/^\/kawho\/?/, "").match(/^\d{6}/) || [])[0] || new URLSearchParams(location.search).get("pin");

  function screen(cls, ...kids) { put(app, el("main", { class: "p-screen " + (cls || "") }, kids)); }

  /* ================= joining ================= */
  function pinScreen(err) {
    shownKey = "";
    const inp = el("input", { class: "pin-input", inputmode: "numeric", autocomplete: "off", maxlength: 7, placeholder: "Game PIN", "aria-label": "Game PIN", value: pathPin || "" });
    const msg = el("div", { class: "err", role: "alert" }, err || "");
    const go = async () => {
      const pin = inp.value.replace(/\D/g, "");
      if (pin.length !== 6) { msg.textContent = "The PIN has 6 numbers."; inp.focus(); return; }
      btn.disabled = true; btn.textContent = "Checking…";
      try { const st = await api("state", { query: { pin, t: Math.floor(Date.now() / 1000) } }); nameScreen(pin, st); }
      catch (e) { msg.textContent = e.status === 404 ? "No game with that PIN. Check the number on the screen." : e.message; btn.disabled = false; btn.textContent = "Enter"; }
    };
    const btn = el("button", { class: "btn-x primary", onclick: go }, "Enter");
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    inp.addEventListener("input", () => { const d = inp.value.replace(/\D/g, "").slice(0, 6); inp.value = d.length > 3 ? d.slice(0, 3) + " " + d.slice(3) : d; msg.textContent = ""; });
    screen("center", logo("big"), el("div", { class: "join-card" }, inp, btn, msg),
      el("p", { class: "fine" }, "Look for the PIN on the big screen."),
      el("a", { class: "host-link", href: "/kawho/host" }, "Host a game →"));
    inp.dispatchEvent(new Event("input"));
    setTimeout(() => inp.focus(), 100);
  }

  function nameScreen(pin, st) {
    let avatar = store.get("kw.avatar", AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    const name = el("input", { class: "name-input", maxlength: 20, autocomplete: "nickname", autocapitalize: "words", placeholder: "Your nickname", "aria-label": "Your nickname", value: store.get("kw.name", "") });
    const msg = el("div", { class: "err", role: "alert" });
    const big = el("div", { class: "avatar-big" }, avatar);
    const grid = el("div", { class: "avatars" }, AVATARS.map(a => el("button", { class: "av" + (a === avatar ? " on" : ""), type: "button", "aria-label": "Avatar " + a, onclick: e => { avatar = a; big.textContent = a; grid.querySelectorAll(".av").forEach(b => b.classList.toggle("on", b === e.currentTarget)); vibrate(10); } }, a)));
    const go = async () => {
      if (name.value.trim().length < 2) { msg.textContent = "Write a nickname with at least 2 letters."; name.focus(); return; }
      btn.disabled = true; btn.textContent = "Joining…";
      try {
        const r = await api("join", { method: "POST", body: { pin, name: name.value, avatar } });
        offset = r.serverNow - Date.now();
        me = { pin, pid: r.pid, secret: r.secret, name: r.name, avatar: r.avatar };
        store.set(SESSION, me); store.set("kw.name", r.name); store.set("kw.avatar", r.avatar);
        sound.play("join"); vibrate(40);
        if (location.pathname !== "/kawho/" + pin) history.replaceState(null, "", "/kawho/" + pin);
        start();
      } catch (e) { msg.textContent = e.message; btn.disabled = false; btn.textContent = "Join"; }
    };
    const btn = el("button", { class: "btn-x primary", onclick: go }, "Join");
    name.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    screen("center", el("div", { class: "quiz-name" }, st.title || "Quiz"), big, el("div", { class: "join-card" }, name, el("div", { class: "fine left" }, "Pick your avatar"), grid, btn, msg),
      el("button", { class: "host-link", onclick: () => { history.replaceState(null, "", "/kawho"); pinScreen(); } }, "← Different PIN"));
    setTimeout(() => name.focus(), 100);
  }

  /* ================= game loop ================= */
  function start() { alive = true; failures = 0; loop(); clearInterval(tickT); tickT = setInterval(render, 200); }
  function leave(msg) {
    alive = false; clearInterval(tickT); store.del(SESSION); me = null; shownKey = "";
    history.replaceState(null, "", "/kawho");
    pinScreen(msg);
  }
  async function loop() {
    while (alive && me) {
      try {
        // the time bucket makes every phone ask for the same URL each second, so the CDN answers most of them
        const st = await api("state", { query: { pin: me.pin, t: Math.floor(now() / 1000) } });
        failures = 0; setOffline(false);
        S = st; render();
      } catch (e) {
        if (e.status === 404) { leave("That game has ended."); return; }
        if (++failures >= 3) setOffline(true);
      }
      await sleep(850 + Math.random() * 300);
    }
  }
  function setOffline(on) {
    let b = $(".offline");
    if (on && !b) document.body.append(el("div", { class: "offline" }, "Reconnecting…"));
    else if (!on && b) b.remove();
  }
  async function fetchMe(q) {
    try {
      const r = await api("me", { query: { pin: me.pin, pid: me.pid, secret: me.secret, q } });
      offset = r.serverNow - Date.now(); return r;
    } catch (e) { if (e.status === 404) leave("You were removed from the game."); return null; }
  }

  function render() {
    if (!S || !me) return;
    const t = now();
    let sub = "";
    if (S.phase === "question") sub = t < S.startAt ? "ready" : answered[S.q] ? "sent" : t > S.endAt + 300 ? "late" : "answer";
    const key = `${S.phase}:${S.q}:${sub}`;
    if (S.phase === "question" && (sub === "ready" || sub === "answer")) tickTimers(t);
    if (key === shownKey) return;
    shownKey = key;
    if (S.phase === "lobby") return lobby();
    if (S.phase === "question") return sub === "ready" ? ready() : sub === "answer" ? answer() : sub === "sent" ? sent() : late();
    if (S.phase === "reveal") return result();
    if (S.phase === "leaderboard") return standing();
    if (S.phase === "podium") return final();
  }
  function tickTimers(t) {
    const r = $(".count-big"); if (r) r.textContent = Math.max(1, Math.ceil((S.startAt - t) / 1000));
    const bar = $(".p-timer i"), out = $(".p-timer b");
    if (bar) { const left = Math.max(0, S.endAt - t), all = S.endAt - S.startAt; bar.style.transform = `scaleX(${left / all})`; out.textContent = Math.ceil(left / 1000); bar.parentElement.classList.toggle("low", left < 5000); }
  }
  const head = () => el("div", { class: "p-head" }, el("span", { class: "me" }, el("span", { class: "me-av" }, me.avatar), me.name), el("span", { class: "q-of" }, S.phase === "lobby" ? `${S.players} playing` : `${S.q + 1} / ${S.total}`));

  function lobby() {
    let last = 0;
    const react = e => {
      if (Date.now() - last < 1500) return; last = Date.now();
      const em = e.currentTarget.dataset.e; vibrate(15); sound.play("pop");
      const f = el("span", { class: "float-emoji" }, em); e.currentTarget.append(f); setTimeout(() => f.remove(), 1200);
      api("react", { method: "POST", body: { pin: me.pin, pid: me.pid, secret: me.secret, emoji: em } }).catch(() => {});
    };
    screen("center lobby-p", head(), el("div", { class: "avatar-big bounce" }, me.avatar),
      el("h1", { class: "p-title" }, "You're in!"), el("p", { class: "p-sub" }, "See your name on the screen? The game starts soon."),
      el("div", { class: "reacts" }, ["👍", "😂", "😮", "🔥", "❤️", "👏"].map(x => el("button", { class: "react", "data-e": x, onclick: react, "aria-label": "Send " + x }, x))),
      el("p", { class: "fine" }, "Tap to cheer"));
  }
  function ready() {
    const q = S.question;
    screen("center ready", head(), el("div", { class: "pill" }, TYPE_NAMES[q.type] || "Question", q.points === 2 ? " · Double points!" : q.points === 0 ? " · No points" : ""),
      el("h1", { class: "p-q" }, q.q), el("div", { class: "count-big" }, Math.max(1, Math.ceil((S.startAt - now()) / 1000))), el("p", { class: "p-sub" }, "Get ready…"));
    sound.play("tick");
  }
  function timerBar() { return el("div", { class: "p-timer" }, el("i"), el("b", {}, "")); }

  async function send(answer) {
    if (answered[S.q]) return;
    const q = S.q; answered[q] = "sending"; vibrate(30);
    shownKey = ""; render();
    try { await api("answer", { method: "POST", body: { pin: me.pin, pid: me.pid, secret: me.secret, q, answer } }); answered[q] = true; }
    catch (e) {
      if (e.status === 404) { leave("You were removed from the game."); return; }
      if (/already/.test(e.message)) answered[q] = true;
      else { answered[q] = false; toast(e.message); }
    }
    shownKey = ""; render();
  }
  function answer() {
    const q = S.question, opts = q.options || [];
    let bodyEl;
    if (q.type === "quiz" || q.type === "tf" || q.type === "poll") {
      bodyEl = el("div", { class: "tiles n" + opts.length }, opts.map((o, i) => el("button", { class: "tile", style: `--c:${COLORS[i]}`, onclick: () => send(i) }, shape(i, 30), o.img ? el("img", { src: o.img, alt: "" }) : null, el("span", {}, o.t))));
    } else if (q.type === "multi") {
      const pick = new Set();
      const go = el("button", { class: "btn-x primary", disabled: true, onclick: () => send([...pick]) }, "Send answer");
      bodyEl = el("div", { class: "stack" }, el("p", { class: "p-sub" }, "Pick every right answer"),
        el("div", { class: "tiles n" + opts.length }, opts.map((o, i) => el("button", { class: "tile multi", style: `--c:${COLORS[i]}`, "aria-pressed": "false", onclick: e => { const b = e.currentTarget; if (pick.has(i)) pick.delete(i); else pick.add(i); b.classList.toggle("on", pick.has(i)); b.setAttribute("aria-pressed", pick.has(i)); go.disabled = !pick.size; vibrate(10); } }, shape(i, 30), o.img ? el("img", { src: o.img, alt: "" }) : null, el("span", {}, o.t), el("i", { class: "chk" }, "✓")))), go);
    } else if (q.type === "type" || q.type === "cloud") {
      const inp = el("input", { class: "name-input", maxlength: q.type === "cloud" ? 25 : 40, autocomplete: "off", autocapitalize: "off", spellcheck: "false", placeholder: q.type === "cloud" ? "One or two words" : "Type your answer", "aria-label": "Your answer" });
      const go = () => { if (inp.value.trim()) send(inp.value.trim()); };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      bodyEl = el("div", { class: "stack" }, inp, el("button", { class: "btn-x primary", onclick: go }, "Send"));
      setTimeout(() => inp.focus(), 50);
    } else if (q.type === "slider") {
      const mid = Math.round(((q.min + q.max) / 2) / q.step) * q.step;
      const val = el("div", { class: "slider-val" }, String(mid), q.unit ? el("small", {}, " " + q.unit) : null);
      const r = el("input", { type: "range", class: "range", min: q.min, max: q.max, step: q.step, value: mid, "aria-label": "Your answer", oninput: e => { val.firstChild.textContent = e.target.value; } });
      bodyEl = el("div", { class: "stack" }, val, r, el("div", { class: "range-ends" }, el("span", {}, String(q.min)), el("span", {}, String(q.max))), el("button", { class: "btn-x primary", onclick: () => send(Number(r.value)) }, "Send"));
    } else if (q.type === "order") {
      const order = [];
      const list = el("div", { class: "order-list" });
      const go = el("button", { class: "btn-x primary", disabled: true, onclick: () => send(order) }, "Send answer");
      const draw = () => {
        put(list, order.map((i, k) => el("button", { class: "ord on", onclick: () => { order.splice(k, 1); draw(); } }, el("b", {}, String(k + 1)), q.items[i])),
          q.items.map((t, i) => order.includes(i) ? null : el("button", { class: "ord", onclick: () => { order.push(i); vibrate(10); draw(); } }, el("b", {}, "+"), t)));
        go.disabled = order.length !== q.items.length;
      };
      draw();
      bodyEl = el("div", { class: "stack" }, el("p", { class: "p-sub" }, "Tap them in the right order. Tap again to undo."), list, go);
    }
    screen("answer-s", head(), timerBar(), el("h2", { class: "p-q small" }, q.q), bodyEl);
    tickTimers(now());
  }
  const QUIPS = ["Lightning fingers! ⚡", "Answer locked in 🔒", "Fingers crossed 🤞", "Bold choice 😎", "Let's see… 👀"];
  function sent() {
    screen("center", head(), answered[S.q] === "sending" ? el("div", { class: "spin" }) : el("div", { class: "big-emoji pop" }, "🚀"),
      el("h1", { class: "p-title" }, answered[S.q] === "sending" ? "Sending…" : QUIPS[S.q % QUIPS.length]), el("p", { class: "p-sub" }, "Waiting for the others"));
  }
  function late() { screen("center", head(), el("div", { class: "big-emoji" }, "⏰"), el("h1", { class: "p-title" }, "Time's up!"), el("p", { class: "p-sub" }, "Be quicker next time")); }

  async function result() {
    const q = S.q, qtype = S.question.type;
    screen("center", head(), el("div", { class: "spin" }));
    const r = results[q] || (results[q] = await fetchMe(q)); if (!r || shownKey !== `reveal:${q}:`) return;
    const scored = !["poll", "cloud"].includes(qtype) && S.question.points !== 0;
    const ok = r.last && r.last.correct;
    if (!scored) { screen("center", head(), el("div", { class: "big-emoji pop" }, r.last ? "🙌" : "🤐"), el("h1", { class: "p-title" }, r.last ? "Thanks for answering!" : "No answer this time"), standingLine(r)); return; }
    sound.play(ok ? "right" : "wrong"); vibrate(ok ? [30, 40, 30] : 120);
    put(app, el("main", { class: "p-screen center result " + (ok ? "good" : "bad") }, head(),
      el("div", { class: "res-mark pop" }, ok ? "✓" : r.last ? "✗" : "…"),
      el("h1", { class: "p-title" }, ok ? "Correct!" : r.last ? "Not this time" : "No answer"),
      ok ? el("div", { class: "points-pill" }, "+" + r.last.points) : null,
      r.streak >= 2 ? el("div", { class: "streak" }, "🔥 ", r.streak, " in a row") : null,
      standingLine(r)));
  }
  function standingLine(r) {
    return el("div", { class: "standing" }, el("div", {}, el("b", {}, ordinal(r.rank)), ` of ${r.total}`), el("div", { class: "score" }, r.score.toLocaleString(), " pts"),
      r.above ? el("div", { class: "fine" }, `${r.above.gap.toLocaleString()} behind ${r.above.name}`) : r.rank === 1 && r.score > 0 ? el("div", { class: "fine" }, "You're in the lead! 👑") : null);
  }
  const ordinal = n => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");
  async function standing() {
    const q = S.q, key = shownKey;
    const r = results[q] || (results[q] = await fetchMe(q)); if (!r || shownKey !== key) return;
    screen("center", head(), el("div", { class: "avatar-big" }, me.avatar), el("h1", { class: "p-title" }, r.rank <= 3 ? "On the podium! 🏆" : "Keep going!"), standingLine(r), el("p", { class: "p-sub" }, "Next question coming up"));
  }
  async function final() {
    const key = shownKey;
    const r = await fetchMe(-1); if (!r || shownKey !== key) return;
    const medal = ["🥇", "🥈", "🥉"][r.rank - 1];
    if (medal) { confetti(5000); sound.play("win"); }
    screen("center final", head(), el("div", { class: "big-emoji pop" }, medal || me.avatar),
      el("h1", { class: "p-title" }, medal ? `You came ${ordinal(r.rank)}!` : `You finished ${ordinal(r.rank)}`),
      el("div", { class: "standing" }, el("div", { class: "score" }, r.score.toLocaleString(), " pts"), el("div", {}, `out of ${r.total} players`)),
      el("button", { class: "btn-x", onclick: () => leave() }, "Leave game"));
    alive = false; clearInterval(tickT);
  }

  /* ================= start ================= */
  (async () => {
    if (me && (!pathPin || pathPin === me.pin)) {
      screen("center", logo("big"), el("div", { class: "spin" }));
      const r = await fetchMe(-1);
      if (r) { if (location.pathname !== "/kawho/" + me.pin) history.replaceState(null, "", "/kawho/" + me.pin); start(); return; }
      return;
    }
    if (me) store.del(SESSION), me = null;
    if (pathPin) {
      try { const st = await api("state", { query: { pin: pathPin, t: Math.floor(Date.now() / 1000) } }); nameScreen(pathPin, st); return; }
      catch (e) { pinScreen(e.status === 404 ? "That game isn't running. Check the PIN." : e.message); return; }
    }
    pinScreen();
  })();
})();
