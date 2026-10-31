/* Kawho shared core: DOM helpers, API calls, sounds, answer shapes, confetti. */
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

  // answer colours and shapes, in the order options are shown
  const COLORS = ["#E5484D", "#3E63DD", "#F5A524", "#2BA471", "#8E4EC6", "#12A5A5"];
  const SHAPES = [
    '<path d="M12 3l9.5 17h-19z"/>', '<path d="M12 2l10 10-10 10L2 12z"/>', '<circle cx="12" cy="12" r="9.5"/>',
    '<rect x="3" y="3" width="18" height="18" rx="2.5"/>', '<path d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/>', '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>'
  ];
  const shape = (i, size = 28) => el("span", { class: "shape", style: `width:${size}px;height:${size}px`, html: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${SHAPES[i % SHAPES.length]}</svg>` });

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
  const logo = (size = "") => el("div", { class: "logo " + size }, el("span", { class: "logo-mark", html: '<svg viewBox="0 0 48 48"><path d="M14 20l6-9 6 9z" fill="#fff"/><rect x="28" y="11" width="9" height="9" rx="2" transform="rotate(45 32.5 15.5)" fill="#FFD23F"/><circle cx="17" cy="31" r="5" fill="#38E1A0"/><rect x="28" y="26.5" width="9" height="9" rx="2.2" fill="#fff" opacity=".9"/></svg>' }), el("span", { class: "logo-word" }, "Kawho"));

  window.KW = { $, el, put, add, toast, store, fold, sleep, api, COLORS, shape, sound, confetti, AVATARS, TYPE_NAMES, logo };
})();
