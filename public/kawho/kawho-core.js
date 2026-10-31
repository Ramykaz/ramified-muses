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
  // CSS variables, so day and night can use their own shades
  const COLORS = ["var(--a1)", "var(--a2)", "var(--a3)", "var(--a4)", "var(--a5)", "var(--a6)"];
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
    const cols = ["#FF5B3A", "#2D5BFF", "#FFC21A", "#19C39C", "#B48CFF", "#FF7AB6", "#E8B84B"];
    const bits = Array.from({ length: 180 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height, s: 6 + Math.random() * 9, v: 2 + Math.random() * 4, w: Math.random() * 2 - 1, r: Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    const end = Date.now() + ms;
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      for (const b of bits) { b.y += b.v; b.x += b.w; b.r += .12; if (b.y > c.height + 20 && Date.now() < end) b.y = -20; x.save(); x.translate(b.x, b.y); x.rotate(b.r); x.fillStyle = b.c; x.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); x.restore(); }
      if (Date.now() < end + 3000) requestAnimationFrame(f); else c.remove();
    })();
  }

  /* ---------- icons (line icons, no emoji anywhere) ---------- */
  const IC = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    vol: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    mute: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>',
    full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>', right: '<path d="M5 12h14M13 6l6 6-6 6"/>', ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>', pause: '<path d="M8 5v14M16 5v14"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z"/>',
    flame: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-1 3-3 4-4 6-1-1-1.5-2-1.5-3C6 10 5 12.5 5 15a7 7 0 0 0 7 7z"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    medal: '<circle cx="12" cy="15" r="6"/><path d="M8.5 10L6 3h4l2 5M15.5 10L18 3h-4l-1.4 3.5"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>', spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    cloud: '<path d="M7 18a5 5 0 1 1 1.2-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z"/>',
    // question types
    quiz: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>', tf: '<path d="M3 12.5l3.5 3.5L13 9.5M14 9l6 6M20 9l-6 6"/>',
    multi: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M7.5 12l3 3 6-6"/>', type: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
    slider: '<path d="M3 12h18"/><circle cx="14" cy="12" r="3.5" fill="currentColor"/>', order: '<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>',
    poll: '<path d="M5 20V12M12 20V5M19 20v-6"/>',
    // reactions
    like: '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>',
    haha: '<circle cx="12" cy="12" r="9"/><path d="M7.5 13.5a4.5 4.5 0 0 0 9 0zM8 9.5l2 1-2 1M16 9.5l-2 1 2 1"/>',
    wow: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="15.5" r="2"/>',
    fire: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-1 3-3 4-4 6-1-1-1.5-2-1.5-3C6 10 5 12.5 5 15a7 7 0 0 0 7 7z"/>',
    love: '<path d="M12 20s-7.5-4.6-9.5-9.3C1 7.4 3 4 6.6 4c2.1 0 3.6 1.2 5.4 3.2C13.8 5.2 15.3 4 17.4 4 21 4 23 7.4 21.5 10.7 19.5 15.4 12 20 12 20z"/>',
    clap: '<path d="M8 13l-2.5-2.5a1.5 1.5 0 0 1 2.1-2.1L11 11.8M9.5 8.5L8 7a1.5 1.5 0 0 1 2.1-2.1l5.4 5.4M12.5 7.5l.5-.5a1.5 1.5 0 0 1 2.1 0l3.4 3.4a6 6 0 0 1-8.5 8.5L6 15a1.5 1.5 0 0 1 2.1-2.1L10 14.8M18 3l.5 2M21 6l-2 .5"/>'
  };
  const ic = (name, size = 20, cls = "") => el("span", { class: "ic " + cls, style: `--i:${size}px`, "aria-hidden": "true", html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${IC[name] || ""}</svg>` });
  const REACTS = ["like", "haha", "wow", "fire", "love", "clap"];

  // 24 little critters in the owl's style: 8 colours x 3 ear shapes
  const AV_COLORS = ["#FF5B3A", "#2D5BFF", "#FFC21A", "#19C39C", "#B48CFF", "#FF7AB6", "#38B6FF", "#8BC34A"];
  const AVATARS = Array.from({ length: 24 }, (_, i) => "a" + i);
  function avatar(id, size = 40) {
    const n = Math.max(0, AVATARS.indexOf(id)), c = AV_COLORS[n % 8], ears = Math.floor(n / 8);
    const earPath = ears === 0 ? '<circle cx="11" cy="11" r="6"/><circle cx="37" cy="11" r="6"/>' : ears === 1 ? '<path d="M7 20L9 3l11 9zM41 20L39 3 28 12z"/>' : '<path d="M14 9q4-8 10-6-4 2-4 8zM34 9q-4-8-10-6 4 2 4 8z"/>';
    return el("span", { class: "avatar", style: `--a:${size}px`, "aria-hidden": "true", html: `<svg viewBox="0 0 48 48"><g fill="${c}" stroke="#151515" stroke-width="2.5" stroke-linejoin="round">${earPath}<rect x="5" y="9" width="38" height="35" rx="17"/></g><circle cx="17" cy="24" r="6.5" fill="#fff" stroke="#151515" stroke-width="2.2"/><circle cx="31" cy="24" r="6.5" fill="#fff" stroke="#151515" stroke-width="2.2"/><circle cx="18" cy="25" r="2.8" fill="#151515"/><circle cx="32" cy="25" r="2.8" fill="#151515"/><path d="M21 33q3 3 6 0" fill="none" stroke="#151515" stroke-width="2.4" stroke-linecap="round"/></svg>` });
  }
  const TYPE_NAMES = { quiz: "Quiz", tf: "True or false", multi: "Pick all correct", type: "Type the answer", slider: "Slider", order: "Put in order", poll: "Poll", cloud: "Word cloud" };
  const logo = (size = "") => el("div", { class: "logo " + size }, owl("idle", size === "big" ? 92 : 40), el("span", { class: "logo-word" }, "Ka", el("i", {}, "-"), el("b", {}, "Who?")));

  /* ---------- day / night look ---------- */
  const theme = () => document.documentElement.dataset.theme === "night" ? "night" : "day";
  function setTheme(t, save = true) {
    document.documentElement.dataset.theme = t === "night" ? "night" : "day";
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "night" ? "#0D1017" : "#F4EBDC");
    if (save) store.set("kw.theme", t);
    document.querySelectorAll(".theme-b").forEach(b => put(b, ic(t === "night" ? "sun" : "moon", 18)));
  }
  const toggleTheme = () => { const t = theme() === "night" ? "day" : "night"; setTheme(t); return t; };
  const themeButton = () => el("button", { class: "btn-x small ghost theme-b", type: "button", title: "Day or night look", "aria-label": "Switch day or night look", onclick: toggleTheme }, ic(theme() === "night" ? "sun" : "moon", 18));
  setTheme(store.get("kw.theme", "day"), false);

  window.KW = { ic, avatar, REACTS, theme, setTheme, toggleTheme, themeButton, $, el, put, add, toast, store, fold, sleep, api, COLORS, shape, owl, sound, confetti, AVATARS, TYPE_NAMES, logo };
})();
