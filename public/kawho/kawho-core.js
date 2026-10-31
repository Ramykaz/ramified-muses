/* Ka-Who? shared core: DOM helpers, API calls, sounds, the owl, answer cards, confetti. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const add = (n, ...kids) => { for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : String(c)); return n; };
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k === "html") n.innerHTML = v; // constant markup only
      else if (k === "value") n.value = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    return add(n, ...kids);
  };
  const put = (n, ...kids) => { n.replaceChildren(); return add(n, ...kids); };
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600); }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  };
  const fold = s => String(s ?? "").replace(/[İIı]/g, "i").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function api(action, { method = "GET", body, query = {}, auth = false } = {}) {
    const qs = new URLSearchParams({ action, ...query }).toString();
    const headers = { "Content-Type": "application/json" };
    if (auth) { const t = store.get("forms.token", null); if (t) headers.Authorization = "Bearer " + t; }
    let r;
    try { r = await fetch("/api/kawho?" + qs, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { throw Object.assign(new Error("No connection. Check your internet."), { status: 0 }); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "Something went wrong."), { status: r.status });
    return j;
  }

  // answer cards: a letter, a colour and a pattern each (patterns live in the CSS)
  const COLORS = ["#FF5B3A", "#2D5BFF", "#FFC21A", "#19C39C", "#B48CFF", "#FF7AB6"];
  const LETTERS = "ABCDEF";
  const shape = (i, size = 28) => el("span", { class: "letter", style: `--s:${size}px`, "aria-hidden": "true" }, LETTERS[i] || "•");

  // the Ka-Who? owl: idle (blinks), think, happy, sad
  function owl(mood = "idle", size = 120) {
    return el("span", { class: "owl " + mood, style: `--o:${size}px`, "aria-hidden": "true", html: `<svg viewBox="0 0 120 120">
      <path class="o-body" d="M60 14c-8 0-14 3-19 7l-9-12-3 20C21 36 18 48 18 62c0 30 19 48 42 48s42-18 42-48c0-14-3-26-11-33l-3-20-9 12c-5-4-11-7-19-7z"/>
      <path class="o-belly" d="M60 66c-14 0-24 12-24 26 0 9 10 14 24 14s24-5 24-14c0-14-10-26-24-26z"/>
      <path class="o-wing" d="M20 70q-6 18 8 30q2-16-8-30zM100 70q6 18-8 30q-2-16 8-30z"/>
      <g class="o-open"><circle class="o-eye" cx="42" cy="50" r="16"/><circle class="o-eye" cx="78" cy="50" r="16"/><circle class="o-pupil" cx="44" cy="52" r="7"/><circle class="o-pupil" cx="80" cy="52" r="7"/><circle class="o-shine" cx="47" cy="48" r="2.5"/><circle class="o-shine" cx="83" cy="48" r="2.5"/><rect class="o-lid" x="24" y="32" width="72" height="0" rx="8"/></g>
      <g class="o-happy"><circle class="o-eye" cx="42" cy="50" r="16"/><circle class="o-eye" cx="78" cy="50" r="16"/><path class="o-arc" d="M33 54q9-10 18 0M69 54q9-10 18 0"/></g>
      <g class="o-sad"><circle class="o-eye" cx="42" cy="52" r="15"/><circle class="o-eye" cx="78" cy="52" r="15"/><circle class="o-pupil" cx="42" cy="58" r="6"/><circle class="o-pupil" cx="78" cy="58" r="6"/><path class="o-brow" d="M28 38l22 6M92 38l-22 6"/></g>
      <path class="o-beak" d="M54 64l6 10 6-10z"/></svg>` });
  }

  /* ---------- sound (made in the browser, no files) ---------- */
  let ctx = null, musicTimer = null;
  const audio = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
  const sound = {
    on: store.get("kw.sound", true),
    play(type) {
      if (!this.on) return;
      try {
        const a = audio();
        const seq = { tick: [[1200, .03]], join: [[660, .06], [990, .1]], go: [[523, .09], [659, .09], [784, .16]], right: [[659, .1], [784, .1], [1046, .25]], wrong: [[220, .18], [165, .3]], reveal: [[392, .12], [523, .12], [659, .3]], end: [[300, .2], [200, .4]], pop: [[880, .05]], win: [[523, .14], [659, .14], [784, .14], [1046, .14], [784, .12], [1046, .5]] }[type] || [];
        let t = a.currentTime;
        for (const [f, d] of seq) {
          const o = a.createOscillator(), g = a.createGain();
          o.type = type === "wrong" || type === "end" ? "sawtooth" : "triangle"; o.frequency.value = f;
          g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
          o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02); t += d * .9;
        }
      } catch (e) { /* no audio */ }
    },
    // a soft looping tune for the lobby
    music(on) {
      clearInterval(musicTimer); musicTimer = null;
      if (!on || !this.on) return;
      const notes = [262, 330, 392, 330, 294, 349, 440, 349, 262, 330, 392, 523, 494, 392, 330, 294];
      let i = 0;
      const step = () => {
        try {
          const a = audio(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
          o.type = "sine"; o.frequency.value = notes[i++ % notes.length];
          g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.06, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .32);
          o.connect(g).connect(a.destination); o.start(t); o.stop(t + .34);
          if (i % 4 === 1) { const b = a.createOscillator(), h = a.createGain(); b.type = "triangle"; b.frequency.value = notes[(i - 1) % notes.length] / 2; h.gain.setValueAtTime(.0001, t); h.gain.exponentialRampToValueAtTime(.05, t + .02); h.gain.exponentialRampToValueAtTime(.0001, t + .9); b.connect(h).connect(a.destination); b.start(t); b.stop(t + .95); }
        } catch (e) { /* no audio */ }
      };
      step(); musicTimer = setInterval(step, 260);
    },
    toggle() { this.on = !this.on; store.set("kw.sound", this.on); if (!this.on) this.music(false); return this.on; }
  };

  function confetti(ms = 6000) {
    const c = el("canvas", { class: "confetti" }); document.body.append(c);
    const x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
    const cols = COLORS.concat(["#FFD23F", "#FF4FA3", "#7B5CFF"]);
    const bits = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height, s: 6 + Math.random() * 9, v: 2 + Math.random() * 4, w: Math.random() * 2 - 1, r: Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    const end = Date.now() + ms;
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      for (const b of bits) { b.y += b.v; b.x += b.w; b.r += .12; if (b.y > c.height + 20 && Date.now() < end) b.y = -20; x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.fillStyle = b.c; x.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); x.restore(); }
      if (Date.now() < end + 3000) requestAnimationFrame(f); else c.remove();
    })();
  }

  const AVATARS = ["🦊", "🐼", "🐸", "🐯", "🦁", "🐨", "🐙", "🦄", "🐝", "🐢", "🦉", "🐧", "🐬", "🦖", "🐳", "🦋", "🍉", "🌵", "🚀", "⚡", "🍩", "🎧", "🌈", "🐻"];
  const TYPE_NAMES = { quiz: "Quiz", tf: "True or false", multi: "Pick all correct", type: "Type the answer", slider: "Slider", order: "Put in order", poll: "Poll", cloud: "Word cloud" };
  const logo = (size = "") => el("div", { class: "logo " + size }, owl("idle", size === "big" ? 92 : 40), el("span", { class: "logo-word" }, "Ka", el("i", {}, "-"), el("b", {}, "Who?")));

  window.KW = { $, el, put, add, toast, store, fold, sleep, api, COLORS, shape, owl, sound, confetti, AVATARS, TYPE_NAMES, logo };
})();
