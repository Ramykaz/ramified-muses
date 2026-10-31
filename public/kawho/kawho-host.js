/* Ka-Who? host studio: sign in, build quizzes (visual editor or paste), and run
   the big-screen game: lobby with PIN and QR, questions, results, leaderboard,
   podium and Excel export. */
(() => {
  "use strict";
  const { $, el, put, add, toast, store, fold, sleep, api, COLORS, shape, owl, sound, confetti, TYPE_NAMES, logo, ic, avatar } = window.KW;
  const app = $("#app");
  const TIMES = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240];
  const TYPES = ["quiz", "tf", "multi", "type", "slider", "order", "poll", "cloud"];
  const TYPE_ICON = { quiz: "quiz", tf: "tf", multi: "multi", type: "type", slider: "slider", order: "order", poll: "poll", cloud: "cloud" };
  const tIcon = (t, size = 18) => ic(TYPE_ICON[t] || "quiz", size);
  const LIBS = { xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", qr: "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js" };
  const scripts = {};
  const loadScript = src => scripts[src] ??= new Promise((ok, fail) => { const s = el("script", { src }); s.onload = ok; s.onerror = () => { delete scripts[src]; fail(new Error("Could not load " + src)); }; document.head.append(s); });
  document.body.classList.add("host");

  /* ================= quiz format ================= */
  const str = v => v == null ? "" : String(v).trim();
  const isUrl = v => /^https:\/\/\S+$/i.test(str(v));
  const ALIAS = { quiz: "quiz", single: "quiz", choice: "quiz", mc: "quiz", "multiple-choice": "quiz", tf: "tf", truefalse: "tf", "true-false": "tf", "true/false": "tf", boolean: "tf", multi: "multi", multiple: "multi", checkbox: "multi", "select-all": "multi", type: "type", text: "type", typeanswer: "type", "type-answer": "type", open: "type", slider: "slider", range: "slider", number: "slider", order: "order", puzzle: "order", sort: "order", ranking: "order", poll: "poll", survey: "poll", cloud: "cloud", wordcloud: "cloud", "word-cloud": "cloud" };
  const DEFAULT_TIME = { quiz: 20, tf: 10, multi: 30, type: 30, slider: 30, order: 45, poll: 20, cloud: 30 };
  const nearestTime = t => TIMES.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a, 20);
  // one question in any reasonable shape -> the clean shape the game uses
  function normQ(r) {
    if (typeof r === "string") r = { q: r };
    r = r || {};
    const rawOpts = Array.isArray(r.options) ? r.options : Array.isArray(r.choices) ? r.choices : null;
    let type = ALIAS[str(r.type).toLowerCase().replace(/\s+/g, "")] || "";
    const q = { type: "", q: str(r.q ?? r.question ?? r.text ?? r.title) };
    let opts = (rawOpts || []).map(o => typeof o === "object" && o ? { t: str(o.t ?? o.text ?? o.label ?? o.answer), img: isUrl(o.img ?? o.image) ? str(o.img ?? o.image) : undefined, ok: !!(o.ok ?? o.correct ?? o.isCorrect) } : { t: str(o).replace(/^\*\s*/, ""), ok: /^\*/.test(str(o)) });
    const c = r.correct ?? r.answer;
    if (opts.length && c != null && typeof c !== "boolean") {
      for (const x of [].concat(c)) {
        if (typeof x === "number" && opts[x]) opts[x].ok = true;
        else if (typeof x === "string") { const k = opts.findIndex(o => fold(o.t) === fold(x)); if (k >= 0) opts[k].ok = true; else if (/^\d+$/.test(x) && opts[+x]) opts[+x].ok = true; }
      }
    }
    if (!type) {
      if (r.items || r.order) type = "order";
      else if (r.min != null || r.max != null) type = "slider";
      else if (!opts.length && (r.answers || typeof c === "string")) type = "type";
      else if (!opts.length && typeof c === "boolean") type = "tf";
      else if (opts.length === 2 && opts.every(o => /^(true|false|doğru|yanlış)$/i.test(o.t))) type = "tf";
      else if (opts.filter(o => o.ok).length > 1) type = "multi";
      else if (opts.length && !opts.some(o => o.ok)) type = "poll";
      else type = opts.length ? "quiz" : "cloud";
    }
    q.type = type;
    if (isUrl(r.image ?? r.img)) q.image = str(r.image ?? r.img);
    const pt = str(r.points).toLowerCase();
    q.points = pt === "0" || pt === "none" || pt === "no" ? 0 : pt === "2" || pt === "double" ? 2 : 1;
    q.time = nearestTime(Number(r.time ?? r.seconds ?? r.timer) || DEFAULT_TIME[type]);
    if (type === "tf") {
      let right = typeof c === "boolean" ? c : opts.length ? /^(true|doğru)$/i.test((opts.find(o => o.ok) || {}).t || "") : /^(true|doğru|t|1)$/i.test(str(c));
      q.options = [{ t: "True", ok: right }, { t: "False", ok: !right }];
    } else if (["quiz", "multi", "poll"].includes(type)) {
      q.options = opts.map(o => { const x = { t: o.t, ok: type === "poll" ? false : o.ok }; if (o.img) x.img = o.img; return x; });
    } else if (type === "type") {
      q.answers = [...new Set([].concat(r.answers ?? r.accept ?? c ?? []).flatMap(x => String(x).split("|")).map(str).filter(Boolean))];
    } else if (type === "slider") {
      q.min = Number(r.min ?? 0); q.max = Number(r.max ?? 100); q.step = Number(r.step ?? 1) || 1;
      q.correct = Number(r.correct ?? r.answer ?? r.value ?? q.min); q.tol = Math.max(0, Number(r.tol ?? r.tolerance ?? r.margin ?? 0) || 0);
      if (str(r.unit)) q.unit = str(r.unit);
    } else if (type === "order") {
      q.items = (r.items ?? r.order ?? rawOpts ?? []).map(x => str(typeof x === "object" && x ? x.t ?? x.text : x)).filter(Boolean);
    }
    return q;
  }
  function problems(q) {
    const p = [];
    if (!q.q) p.push("Write the question.");
    if (["quiz", "multi", "poll"].includes(q.type)) {
      if (q.options.length < 2) p.push("Add at least 2 answers."); if (q.options.length > 6) p.push("Use at most 6 answers.");
      if (q.options.some(o => !o.t && !o.img)) p.push("One answer is empty.");
      if (q.type !== "poll" && !q.options.some(o => o.ok)) p.push("Mark the right answer.");
    }
    if (q.type === "type" && !q.answers.length) p.push("Add the accepted answer.");
    if (q.type === "slider") { if (!(q.max > q.min)) p.push("Max must be bigger than min."); else if (q.correct < q.min || q.correct > q.max) p.push("The right number must be between min and max."); }
    if (q.type === "order" && (q.items.length < 2 || q.items.length > 6)) p.push("Use 2 to 6 items.");
    return p;
  }
  function normQuiz(o) {
    if (Array.isArray(o)) o = { questions: o };
    const qs = (o.questions || o.items || []).map(normQ);
    const quiz = { title: str(o.title) || "My quiz", questions: qs };
    if (str(o.description)) quiz.description = str(o.description);
    if (isUrl(o.cover)) quiz.cover = str(o.cover);
    return quiz;
  }
  // the easy text format:  ? question [20s]  * right  - wrong  = typed answer  > order item
  function parseText(text) {
    const out = { title: "", questions: [] }; let cur = null;
    const startQ = (line) => {
      const tags = [...line.matchAll(/\[([^\]]+)\]/g)].map(m => m[1].trim());
      cur = { q: line.replace(/\[[^\]]+\]/g, "").trim(), opts: [], answers: [], items: [], tags };
      out.questions.push(cur);
    };
    for (let raw of String(text).split(/\r?\n/)) {
      const line = raw.trim(); if (!line) continue; let m;
      if ((m = line.match(/^title\s*:\s*(.+)$/i))) { out.title = m[1].trim(); continue; }
      if ((m = line.match(/^(?:\?|q\s*[:.)]|\d+\s*[.)])\s*(.+)$/i))) { startQ(m[1]); continue; }
      if (!cur) { startQ(line); continue; }
      if ((m = line.match(/^(?:image|img|picture)\s*:\s*(\S+)/i))) { cur.image = m[1]; continue; }
      if ((m = line.match(/^(?:time|timer)\s*:\s*(\d+)/i))) { cur.tags.push(m[1] + "s"); continue; }
      if ((m = line.match(/^[*+]\s*(.+)$/))) { cur.opts.push({ t: m[1], ok: true }); continue; }
      if ((m = line.match(/^[-–•]\s*(.+)$/))) { cur.opts.push({ t: m[1], ok: false }); continue; }
      if ((m = line.match(/^=\s*(.+)$/))) { cur.answers.push(m[1]); continue; }
      if ((m = line.match(/^>\s*(.+)$/))) { cur.items.push(m[1]); continue; }
      cur.q += (cur.q ? " " : "") + line;
    }
    const qs = out.questions.map(c => {
      const r = { q: c.q }; let type = "";
      for (const t of c.tags) {
        const tl = t.toLowerCase(); let m;
        if ((m = tl.match(/^(\d+)\s*s(ec)?$/)) || (m = tl.match(/^time\s*:?\s*(\d+)/))) r.time = +m[1];
        else if (/^(double|x2|2x)$/.test(tl)) r.points = 2;
        else if (/^(no points|0 points|practice)$/.test(tl)) r.points = 0;
        else if ((m = tl.match(/^slider\s*(-?[\d.]+)\s*[-–to]+\s*(-?[\d.]+)\s*(.*)$/))) { type = "slider"; r.min = +m[1]; r.max = +m[2]; if (m[3]) r.unit = m[3].trim(); }
        else if (/^(image|img)\s*:?\s*https/.test(tl)) r.image = t.replace(/^(image|img)\s*:?\s*/i, "");
        else if (ALIAS[tl.replace(/\s+/g, "")]) type = ALIAS[tl.replace(/\s+/g, "")];
      }
      if (c.image) r.image = c.image;
      if (c.items.length) { r.type = "order"; r.items = c.items; }
      else if (type === "slider") { r.type = "slider"; const v = (c.answers[0] || "").match(/(-?[\d.]+)(?:\s*(?:±|\+-|\+\/-)\s*([\d.]+))?/); if (v) { r.correct = +v[1]; if (v[2]) r.tol = +v[2]; } }
      else if (c.answers.length && !c.opts.length) { r.type = type === "cloud" ? "cloud" : "type"; r.answers = c.answers; }
      else { r.options = c.opts; if (type) r.type = type; }
      if (!c.opts.length && !c.answers.length && !c.items.length && !type) r.type = "cloud";
      return r;
    });
    return { title: out.title, questions: qs };
  }
  function parseAny(text) {
    const t = String(text).trim().replace(/^```[a-z]*\s*\n?/i, "").replace(/\n?```\s*$/, "").trim();
    if (!t) throw "Paste your questions first.";
    if (/^[[{]/.test(t)) {
      let o; try { o = JSON.parse(t); } catch (e) { try { o = JSON.parse(t.replace(/[“”]/g, '"').replace(/,\s*([\]}])/g, "$1")); } catch (e2) { throw "This looks like JSON but has a mistake: check commas and quotes."; } }
      return normQuiz(o);
    }
    return normQuiz(parseText(t));
  }

  const EXAMPLE_TEXT = `Title: Unit 1 Word Challenge

? What does "seldom" mean? [20s]
- every day
* almost never
- all the time
- twice a week

? "Rural" means in the city. [tf]
- True
* False

? Type the English word: kentleşme [30s]
= urbanisation
= urbanization

? Which of these are jobs? Pick all. [multi]
* accountant
* stunt performer
- iceberg
* line stander

? How many words are in Unit 1? [slider 0-200]
= 133 ± 10

? Put the routine in order, from never to always [order]
> never
> hardly ever
> sometimes
> constantly

? Which game should we play next? [poll]
- Word Scramble
- Hot Seat
- Memory Match

? One word to describe your hometown [cloud]

? Double points! A person you don't know is a… [double]
- colleague
* stranger
- resident
- crowd`;
  const AI_PROMPT = `Make a quiz for my students in this exact text format. Reply with ONLY the quiz.

Title: (quiz title)

? (question) [20s]
* (right answer)
- (wrong answer)
- (wrong answer)
- (wrong answer)

Rules:
- Start each question with "? ". Put the time in brackets, like [10s], [20s] or [30s].
- Mark right answers with "* " and wrong ones with "- ". 2 to 4 answers, short.
- True or false: add [tf] and write "* True" / "- False" (or the other way round).
- More than one right answer: add [multi].
- Typed answer: no options, write "= answer" (more lines for other accepted spellings).
- Number question: add [slider 0-100] and write "= 42" (or "= 42 ± 5").
- Put in order: add [order] and write the items with "> " in the right order.
- Poll (no right answer): add [poll]. Word cloud: add [cloud] with no options.
- Double points: add [double].

Topic: [WRITE THE TOPIC]
Level: [e.g. B1]
Number of questions: [e.g. 12]`;

  /* ================= sign in ================= */
  async function formsApi(action, body) {
    const r = await fetch("/api/forms?action=" + action, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(store.get("forms.token", null) ? { Authorization: "Bearer " + store.get("forms.token") } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "Something went wrong."); return j;
  }
  async function boot() {
    put(app, el("main", { class: "studio center" }, el("div", { class: "spin" })));
    let st; try { st = await formsApi("status"); } catch (e) { put(app, el("main", { class: "studio center" }, el("p", {}, e.message), el("button", { class: "btn-x", onclick: boot }, "Try again"))); return; }
    if (!st.admin) return auth(st.setup);
    addEventListener("hashchange", route); route();
  }
  function auth(isSet) {
    const pw = el("input", { class: "name-input", type: "password", placeholder: "Password", autocomplete: isSet ? "current-password" : "new-password" });
    const pw2 = isSet ? null : el("input", { class: "name-input", type: "password", placeholder: "Type it again", autocomplete: "new-password" });
    const msg = el("div", { class: "err" });
    const go = async e => {
      e.preventDefault(); msg.textContent = "";
      if (!isSet && pw.value !== pw2.value) { msg.textContent = "The two passwords are different."; return; }
      try { const r = await formsApi(isSet ? "login" : "setup", { password: pw.value }); store.set("forms.token", r.token); boot(); } catch (x) { msg.textContent = x.message; }
    };
    put(app, el("main", { class: "studio center" }, logo("big"), el("form", { class: "join-card", onsubmit: go },
      el("h2", { class: "s-h" }, isSet ? "Host sign in" : "Set your host password"),
      el("p", { class: "fine left" }, isSet ? "Same password as your Forms app." : "You'll use it to make quizzes and host games. Players never need it."),
      pw, pw2, el("button", { class: "btn-x primary", type: "submit" }, isSet ? "Sign in" : "Create password"), msg)));
    setTimeout(() => pw.focus(), 50);
  }
  const authApi = (action, opts = {}) => api(action, { ...opts, auth: true }).catch(e => { if (e.status === 401) { store.del("forms.token"); auth(true); } throw e; });

  /* ================= routing ================= */
  let stopGame = null;
  function route() {
    if (stopGame) { stopGame(); stopGame = null; }
    sound.music(false); document.body.classList.remove("on-air");
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "edit" || h[0] === "new") return editor(h[1] || null);
    if (h[0] === "play" && h[1]) return game(h[1]);
    return dashboard();
  }
  const topbar = (...right) => el("header", { class: "s-top" }, el("a", { href: "#/", class: "s-brand" }, logo(), el("span", { class: "studio-tag" }, "Studio")), el("span", { class: "spacer" }), window.KW.themeButton(), right);

  /* ================= dashboard ================= */
  let quizzes = [];
  async function dashboard() {
    document.title = "Ka-Who? Studio";
    const main = el("main", { class: "studio" }, el("div", { class: "spin" }));
    put(app, topbar(el("a", { class: "btn-x small", href: "/kawho", target: "_blank", "aria-label": "Open the player page" }, el("span", { class: "lbl" }, "Player page"), ic("ext", 16))), main);
    try { quizzes = (await authApi("quizzes")).quizzes; } catch (e) { put(main, el("p", { class: "err" }, e.message)); return; }
    put(main,
      el("div", { class: "s-hero" }, el("div", {}, el("h1", { class: "s-title" }, "Your quizzes"), el("p", { class: "s-sub" }, quizzes.length ? "Press Host to start a live game. Players join at " + location.host + "/kawho" : "Make your first quiz. Paste questions or build them one by one.")),
        el("div", { class: "row" }, el("a", { class: "btn-x primary", href: "#/new" }, "+ New quiz"))),
      quizzes.length ? el("div", { class: "q-grid" }, quizzes.map(card)) :
        el("div", { class: "empty-s" }, owl("happy", 100), el("h2", { class: "s-h" }, "No quizzes yet"),
          el("div", { class: "row center" }, el("button", { class: "btn-x primary", onclick: async () => { const r = await authApi("quiz-save", { method: "POST", body: { data: parseAny(EXAMPLE_TEXT) } }); location.hash = "#/edit/" + r.id; } }, "Start from an example"), el("a", { class: "btn-x", href: "#/new" }, "Blank quiz"))));
  }
  function card(x) {
    const d = x.data, n = d.questions.length;
    return el("article", { class: "q-card" },
      el("div", { class: "q-cover", style: d.cover ? `background-image:url("${encodeURI(d.cover)}")` : "" }, d.cover ? null : el("span", {}, ...d.questions.slice(0, 4).map((q, i) => shape(i, 34)))),
      el("div", { class: "q-body" }, el("h3", {}, d.title), el("div", { class: "fine left" }, `${n} question${n === 1 ? "" : "s"} · about ${Math.max(1, Math.round(d.questions.reduce((t, q) => t + q.time + 12, 0) / 60))} min`),
        el("div", { class: "row" }, el("button", { class: "btn-x primary", onclick: () => host(x.id) }, ic("play", 16), "Host"), el("a", { class: "btn-x", href: "#/edit/" + x.id }, "Edit"),
          el("button", { class: "btn-x ghost", title: "Duplicate", onclick: async () => { await authApi("quiz-save", { method: "POST", body: { data: { ...d, title: d.title + " (copy)" } } }); dashboard(); } }, "Copy"),
          el("button", { class: "btn-x ghost danger", title: "Delete", onclick: async () => { if (!confirm(`Delete "${d.title}"?`)) return; await authApi("quiz-delete", { method: "POST", body: { id: x.id } }); dashboard(); } }, "Delete"))));
  }
  async function host(id) {
    try { const r = await authApi("game-create", { method: "POST", body: { quizId: id } }); location.hash = "#/play/" + r.pin; }
    catch (e) { toast(e.message); }
  }

  /* ================= images ================= */
  function pickImage(maxW, done) {
    const inp = el("input", { type: "file", accept: "image/*", style: "display:none" });
    inp.onchange = async () => {
      const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
      toast("Uploading picture…");
      try {
        const url = URL.createObjectURL(f);
        const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("That file isn't a picture we can read.")); i.src = url; });
        const k = Math.min(1, maxW / img.naturalWidth), c = el("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        const r = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "kawho-" + Date.now() + ".jpg", contentType: "image/jpeg", data: c.toDataURL("image/jpeg", .85) }) });
        const j = await r.json().catch(() => ({})); if (!r.ok || !j.url) throw new Error("The upload didn't work. Try a smaller picture.");
        done(j.url); toast("Picture added");
      } catch (e) { toast(e.message); }
    };
    document.body.append(inp); inp.click();
  }

  /* ================= editor ================= */
  async function editor(id) {
    document.title = "Edit quiz · Ka-Who?";
    let Q = { title: "", questions: [normQ({ type: "quiz", q: "", options: [{ t: "" }, { t: "" }, { t: "" }, { t: "" }] })] }, dirty = false;
    if (id) {
      put(app, topbar(), el("main", { class: "studio" }, el("div", { class: "spin" })));
      try { if (!quizzes.length) quizzes = (await authApi("quizzes")).quizzes; const x = quizzes.find(z => z.id === id); if (!x) throw new Error("Quiz not found."); Q = JSON.parse(JSON.stringify(x.data)); }
      catch (e) { toast(e.message); location.hash = "#/"; return; }
    }
    const mark = () => { dirty = true; saveBtn.textContent = "Save"; };
    let tab = "visual";
    const list = el("div", { class: "ed-list" });
    const saveBtn = el("button", { class: "btn-x primary", onclick: () => save(false) }, "Save");
    async function save(thenHost) {
      Q.title = Q.title.trim() || "My quiz";
      const bad = Q.questions.map((q, i) => [i, problems(q)]).filter(([, p]) => p.length);
      if (!Q.questions.length) { toast("Add at least one question"); return; }
      if (bad.length) { toast(`Question ${bad[0][0] + 1}: ${bad[0][1][0]}`); const c = list.children[bad[0][0]]; if (c) c.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      saveBtn.disabled = true;
      try { const r = await authApi("quiz-save", { method: "POST", body: { id: id || undefined, data: Q } }); quizzes = []; dirty = false; put(saveBtn, ic("check", 18), "Saved"); if (!id) { id = r.id; history.replaceState(null, "", "#/edit/" + id); } if (thenHost) host(id); }
      catch (e) { toast(e.message); } finally { saveBtn.disabled = false; }
    }
    const coverBox = el("div");
    const drawCover = () => put(coverBox, Q.cover ? el("div", { class: "cover-prev", style: `background-image:url("${encodeURI(Q.cover)}")` }, el("button", { class: "x", "aria-label": "Remove cover", onclick: () => { delete Q.cover; mark(); drawCover(); } }, "×"))
      : el("button", { class: "btn-x small", onclick: () => pickImage(1600, u => { Q.cover = u; mark(); drawCover(); }) }, ic("image", 18), "Add cover picture"));
    drawCover();
    const head = el("div", { class: "ed-head" },
      el("input", { class: "title-input", placeholder: "Quiz title", value: Q.title, "aria-label": "Quiz title", oninput: e => { Q.title = e.target.value; mark(); } }),
      coverBox);
    const tabs = el("div", { class: "seg-x" }, [["visual", "Questions"], ["paste", "Paste / import"]].map(([k, l]) => el("button", { class: tab === k ? "on" : "", onclick: e => { tab = k; tabs.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === e.currentTarget)); body(); } }, l)));
    const bodyBox = el("div");
    function body() { if (tab === "visual") { put(bodyBox, list, addBar()); drawList(); } else put(bodyBox, pastePanel()); }
    function addBar() {
      return el("div", { class: "add-bar" }, el("b", {}, "Add a question"), el("div", { class: "row" }, TYPES.map(t => el("button", { class: "chip-x", onclick: () => {
        const base = { type: t, q: "" };
        if (t === "quiz" || t === "poll") base.options = ["", "", "", ""]; if (t === "multi") base.options = ["", "", "", ""]; if (t === "order") base.items = ["", "", ""];
        if (t === "slider") Object.assign(base, { min: 0, max: 100, correct: 50 });
        const nq = normQ(base); if (nq.options) nq.options = nq.options.map(o => ({ t: o.t, ok: false })); if (t === "tf") nq.options = [{ t: "True", ok: true }, { t: "False", ok: false }];
        Q.questions.push(nq); mark(); drawList(); setTimeout(() => { const c = list.lastElementChild; c.scrollIntoView({ behavior: "smooth", block: "center" }); c.querySelector("textarea").focus({ preventScroll: true }); }, 50);
      } }, tIcon(t, 16), TYPE_NAMES[t]))));
    }
    function drawList() { put(list, Q.questions.map((q, i) => qCard(q, i))); }
    function qCard(q, i) {
      const card = el("section", { class: "ed-q" });
      const warn = el("div", { class: "ed-warn" });
      const check = () => { const p = problems(q); put(warn, p.length ? [ic("alert", 16), " " + p.join(" ")] : ""); };
      const redraw = () => { card.replaceWith(qCard(q, i)); };
      const sel = (opts, val, on, label) => el("select", { class: "sel", "aria-label": label, onchange: e => on(e.target.value) }, opts.map(([v, l]) => el("option", { value: v, selected: String(v) === String(val) }, l)));
      const imgBox = el("div", { class: "q-img-box" });
      const drawImg = () => put(imgBox, q.image ? el("div", { class: "img-prev" }, el("img", { src: q.image, alt: "" }), el("button", { class: "x", "aria-label": "Remove picture", onclick: () => { delete q.image; mark(); drawImg(); } }, "×"))
        : el("button", { class: "btn-x small", onclick: () => pickImage(1280, u => { q.image = u; mark(); drawImg(); }) }, ic("image", 18), "Add picture"));
      drawImg();
      let typeUI;
      if (["quiz", "multi", "poll"].includes(q.type)) {
        const rows = el("div", { class: "opt-rows" });
        const draw = () => put(rows, q.options.map((o, k) => el("div", { class: "opt-row", style: `--c:${COLORS[k]}` }, shape(k, 22),
          el("input", { class: "opt-in", value: o.t, placeholder: `Answer ${k + 1}`, maxlength: 90, oninput: e => { o.t = e.target.value; mark(); check(); } }),
          o.img ? el("button", { class: "opt-img", title: "Remove picture", onclick: () => { delete o.img; mark(); draw(); }, style: `background-image:url("${encodeURI(o.img)}")` }, "×") : el("button", { class: "icon-b", title: "Add a picture", "aria-label": "Add a picture to this answer", onclick: () => pickImage(600, u => { o.img = u; mark(); draw(); check(); }) }, ic("image", 18)),
          q.type === "poll" ? null : el("button", { class: "ok-b" + (o.ok ? " on" : ""), "aria-pressed": o.ok ? "true" : "false", title: "Right answer", onclick: () => { if (q.type === "quiz") q.options.forEach(x => x.ok = x === o ? !o.ok : false); else o.ok = !o.ok; mark(); draw(); check(); } }, ic("check", 20)),
          el("button", { class: "icon-b", "aria-label": "Remove answer", disabled: q.options.length <= 2, onclick: () => { q.options.splice(k, 1); mark(); draw(); check(); } }, ic("x", 18)))),
          q.options.length < 6 ? el("button", { class: "btn-x small ghost", onclick: () => { q.options.push({ t: "", ok: false }); mark(); draw(); check(); } }, "+ Add answer") : null);
        draw(); typeUI = rows;
      } else if (q.type === "tf") {
        typeUI = el("div", { class: "row" }, el("span", { class: "fine" }, "The right answer is"), ["True", "False"].map((t, k) => el("button", { class: "chip-x" + (q.options[k].ok ? " on" : ""), onclick: () => { q.options.forEach((o, j) => o.ok = j === k); mark(); redraw(); } }, t)));
      } else if (q.type === "type") {
        typeUI = el("label", { class: "fld" }, el("span", {}, "Accepted answers (separate with commas). Capitals and accents don't matter."),
          el("input", { class: "opt-in", value: q.answers.join(", "), placeholder: "urbanisation, urbanization", oninput: e => { q.answers = e.target.value.split(",").map(s => s.trim()).filter(Boolean); mark(); check(); } }));
      } else if (q.type === "slider") {
        const num = (k, label) => el("label", { class: "fld small" }, el("span", {}, label), el("input", { class: "opt-in", type: "number", value: q[k] ?? "", oninput: e => { q[k] = Number(e.target.value); mark(); check(); } }));
        typeUI = el("div", { class: "row" }, num("min", "Min"), num("max", "Max"), num("step", "Step"), num("correct", "Right number"), num("tol", "± margin"),
          el("label", { class: "fld small" }, el("span", {}, "Unit"), el("input", { class: "opt-in", value: q.unit || "", placeholder: "km", oninput: e => { q.unit = e.target.value; mark(); } })));
      } else if (q.type === "order") {
        const rows = el("div", { class: "opt-rows" });
        const draw = () => put(rows, el("div", { class: "fine left" }, "Write them in the right order. Players get them mixed up."), q.items.map((t, k) => el("div", { class: "opt-row", style: `--c:${COLORS[k]}` }, el("b", { class: "ord-n" }, String(k + 1)),
          el("input", { class: "opt-in", value: t, maxlength: 60, placeholder: `Item ${k + 1}`, oninput: e => { q.items[k] = e.target.value; mark(); check(); } }),
          el("button", { class: "icon-b", "aria-label": "Move up", disabled: k === 0, onclick: () => { [q.items[k - 1], q.items[k]] = [q.items[k], q.items[k - 1]]; mark(); draw(); } }, ic("up", 18)),
          el("button", { class: "icon-b", "aria-label": "Remove item", disabled: q.items.length <= 2, onclick: () => { q.items.splice(k, 1); mark(); draw(); check(); } }, ic("x", 18)))),
          q.items.length < 6 ? el("button", { class: "btn-x small ghost", onclick: () => { q.items.push(""); mark(); draw(); check(); } }, "+ Add item") : null);
        draw(); typeUI = rows;
      } else typeUI = el("p", { class: "fine left" }, "Players type a word or two. Their answers appear as a word cloud. No points.");
      add(card,
        el("div", { class: "ed-q-head" }, el("span", { class: "qn" }, String(i + 1)),
          sel(TYPES.map(t => [t, TYPE_NAMES[t]]), q.type, v => { const nq = normQ({ ...q, type: v, options: (q.options || []).length ? q.options : v === "order" ? undefined : [{ t: "" }, { t: "" }], items: q.items || (q.options || []).map(o => o.t), answers: q.answers || [], correct: q.correct ?? 50, min: q.min ?? 0, max: q.max ?? 100 }); if (v === "poll" && nq.options) nq.options.forEach(o => o.ok = false); Q.questions[i] = nq; mark(); drawList(); }, "Question type"),
          sel(TIMES.map(t => [t, `${t} seconds`]), q.time, v => { q.time = +v; mark(); }, "Time"),
          ["poll", "cloud"].includes(q.type) ? null : sel([[1, "Standard points"], [2, "Double points"], [0, "No points"]], q.points, v => { q.points = +v; mark(); }, "Points"),
          el("span", { class: "spacer" }),
          el("button", { class: "icon-b", "aria-label": "Move up", disabled: i === 0, onclick: () => { [Q.questions[i - 1], Q.questions[i]] = [Q.questions[i], Q.questions[i - 1]]; mark(); drawList(); } }, ic("up", 18)),
          el("button", { class: "icon-b", "aria-label": "Move down", disabled: i === Q.questions.length - 1, onclick: () => { [Q.questions[i + 1], Q.questions[i]] = [Q.questions[i], Q.questions[i + 1]]; mark(); drawList(); } }, ic("down", 18)),
          el("button", { class: "icon-b", "aria-label": "Duplicate", onclick: () => { Q.questions.splice(i + 1, 0, JSON.parse(JSON.stringify(q))); mark(); drawList(); } }, ic("copy", 18)),
          el("button", { class: "icon-b danger", "aria-label": "Delete question", onclick: () => { if (Q.questions.length > 1 || confirm("Delete the last question?")) { Q.questions.splice(i, 1); mark(); drawList(); } } }, ic("trash", 18))),
        el("textarea", { class: "q-in", rows: 2, maxlength: 240, placeholder: "Type your question", oninput: e => { q.q = e.target.value; mark(); check(); } }, q.q),
        imgBox, typeUI, warn);
      check();
      return card;
    }
    function pastePanel() {
      const ta = el("textarea", { class: "paste-in", spellcheck: "false", placeholder: EXAMPLE_TEXT.split("\n").slice(0, 8).join("\n") + "\n…" });
      const status = el("div", { class: "paste-status" });
      let parsed = null;
      const check = () => {
        parsed = null; status.className = "paste-status";
        if (!ta.value.trim()) { status.textContent = "Paste questions in the easy text format or JSON. You can also copy the AI prompt."; return; }
        try {
          parsed = parseAny(ta.value);
          const bad = parsed.questions.map((q, i) => [i, problems(q)]).filter(([, p]) => p.length);
          status.classList.add(bad.length ? "bad" : "ok");
          put(status, el("span", { class: "st-line" }, ic(bad.length ? "alert" : "check", 18), ` ${parsed.questions.length} questions found` + (parsed.title ? ` · "${parsed.title}"` : "")),
            el("div", { class: "chips" }, parsed.questions.map((q, i) => el("span", { class: "mini-q" + (problems(q).length ? " bad" : ""), title: problems(q).join(" ") || q.q }, `${i + 1}. ${TYPE_NAMES[q.type]}`))),
            bad.length ? el("div", {}, `Question ${bad[0][0] + 1}: ${bad[0][1][0]} You can fix it after importing too.`) : null);
        } catch (e) { status.classList.add("bad"); status.textContent = String(e); }
      };
      ta.addEventListener("input", () => { clearTimeout(check.t); check.t = setTimeout(check, 200); });
      const use = replace => { if (!parsed || !parsed.questions.length) { toast("Nothing to import yet"); return; } if (parsed.title && (replace || !Q.title)) { Q.title = parsed.title; head.querySelector(".title-input").value = parsed.title; } Q.questions = replace ? parsed.questions : Q.questions.filter(q => q.q || problems(q).length === 0).concat(parsed.questions); mark(); toast(`${parsed.questions.length} questions imported`); tab = "visual"; tabs.querySelectorAll("button").forEach((b, k) => b.classList.toggle("on", k === 0)); body(); };
      return el("div", { class: "paste-panel" },
        el("div", { class: "row" }, el("button", { class: "btn-x small", onclick: () => { navigator.clipboard.writeText(AI_PROMPT).then(() => toast("Prompt copied. Paste it into ChatGPT."), () => { ta.value = AI_PROMPT; }); } }, ic("spark", 16), "Copy AI prompt"),
          el("button", { class: "btn-x small", onclick: () => { ta.value = EXAMPLE_TEXT; check(); } }, "Fill example")),
        ta, status,
        el("div", { class: "row" }, el("button", { class: "btn-x primary", onclick: () => use(true) }, "Replace all questions"), el("button", { class: "btn-x", onclick: () => use(false) }, "Add to the end")),
        el("details", { class: "help-x" }, el("summary", {}, "How to write questions"),
          el("pre", {}, `? Question text [20s]          start a question (time is optional)
* right answer                 - wrong answer
[tf]  true or false            [multi]  several right answers
= answer                       typed answer (add more = lines for other spellings)
[slider 0-100]  = 42 ± 5       number question
[order]  > first  > second     put in order
[poll]  [cloud]                no right answer
[double]  [no points]          points
image: https://…               picture for the question`)));
    }
    put(app, topbar(saveBtn, el("button", { class: "btn-x", onclick: () => save(true) }, ic("play", 16), el("span", { class: "lbl" }, "Save & host"))),
      el("main", { class: "studio narrow" }, el("a", { class: "back", href: "#/", onclick: e => { if (dirty && !confirm("Leave without saving?")) e.preventDefault(); } }, ic("left", 16), "All quizzes"), head, tabs, bodyBox));
    body();
    addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }, { once: true });
  }

  /* ================= live game ================= */
  async function game(pin) {
    document.title = `Ka-Who? · ${pin}`;
    document.body.classList.add("on-air");
    let H = null, offset = 0, key = "", busy = false, alive = true, seenReact = {}, music = store.get("kw.music", true), revealing = -1;
    const now = () => Date.now() + offset;
    const stage = el("main", { class: "stage-h" });
    put(app, stage);
    stopGame = () => { stopLb(); alive = false; sound.music(false); document.body.classList.remove("on-air"); };
    async function poll() {
      while (alive) {
        try { const r = await authApi("host-state", { query: { pin } }); offset = r.serverNow - Date.now(); H = r; draw(); }
        catch (e) { if (e.status === 404) { toast("This game no longer exists."); location.hash = "#/"; return; } }
        await sleep(800);
      }
    }
    async function act(what, extra) {
      if (busy) return; busy = true;
      try { const r = await authApi("host", { method: "POST", body: { pin, do: what, ...extra } }); if (H) { H.state = r.state; offset = r.serverNow - Date.now(); } key = ""; draw(); }
      catch (e) { toast(e.message); } finally { busy = false; }
    }
    const st = () => H.state, Qs = () => H.quiz.questions, cur = () => Qs()[st().q];
    const answeredN = () => H.players.filter(p => p.answered).length;
    function controls(...btns) {
      return el("div", { class: "h-bar" }, logo(), el("span", { class: "h-title" }, H.quiz.title), el("span", { class: "spacer" }),
        el("button", { class: "btn-x small ghost", title: "Sound", onclick: e => { const on = sound.toggle(); if (on && st().phase === "lobby" && music) sound.music(true); put(e.currentTarget, ic(on ? "vol" : "mute", 18)); } }, ic(sound.on ? "vol" : "mute", 18)),
        el("button", { class: "btn-x small ghost", title: "Full screen", onclick: () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); } }, ic("full", 18)),
        el("button", { class: "btn-x small ghost theme-b", title: "Day or night look (players follow)", onclick: () => { const t = window.KW.toggleTheme(); act("theme", { theme: t }); } }, ic(window.KW.theme() === "night" ? "sun" : "moon", 18)),
        el("button", { class: "btn-x small ghost", onclick: () => { if (confirm("End the game now and show the podium?")) act("end"); } }, "End"), btns);
    }
    const nextLabel = () => { const p = st().phase; return p === "lobby" ? ["Start", ic("play", 16)] : p === "question" ? ["Skip", ic("right", 18)] : p === "reveal" ? (st().q >= Qs().length - 1 ? [ic("trophy", 18), "Final results"] : ["Next", ic("right", 18)]) : p === "leaderboard" ? ["Next now", ic("right", 18)] : ""; };
    // the leaderboard shows itself after "Next", then counts down into the next question
    const LB_SECONDS = 6;
    let lbTimer = null, lbPaused = false;
    const stopLb = () => { clearInterval(lbTimer); lbTimer = null; };
    function next() {
      const p = st().phase;
      if (p === "lobby") { if (!H.players.length) { toast("Wait for at least one player"); return; } sound.music(false); act("next"); }
      else if (p === "question") act("reveal");
      else if (p === "reveal") act(st().q >= Qs().length - 1 ? "next" : "leaderboard");
      else if (p === "leaderboard") { stopLb(); act("next"); }
    }
    document.onkeydown = e => { if (!alive) return; if ((e.key === " " || e.key === "Enter" || e.key === "ArrowRight") && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); next(); } };

    function draw() {
      if (!H) return;
      const s = st(), t = now();
      // the host decides when a question ends: time is up or everyone answered
      if (s.phase === "question" && revealing !== s.q && t > s.startAt && (t > s.endAt + 400 || (H.players.length && answeredN() >= H.players.length))) { revealing = s.q; act("reveal"); return; }
      const sub = s.phase === "question" ? (t < s.startAt ? "ready" : "go") : "";
      const k = `${s.phase}:${s.q}:${sub}`;
      if (k !== key) { key = k; if (s.phase !== "leaderboard") stopLb(); full(); } else live();
    }
    // update counters without redrawing the whole screen
    function live() {
      const s = st(), t = now();
      if (s.phase === "lobby") lobbyPlayers();
      if (s.phase === "question") {
        const c = $(".h-count b"); if (c) c.textContent = `${answeredN()}`;
        const r = $(".h-ring"); if (r) { const left = Math.max(0, s.endAt - t), all = s.endAt - s.startAt; r.style.setProperty("--p", left / all); r.querySelector("b").textContent = Math.ceil(left / 1000); r.classList.toggle("low", left < 5000); }
        const g = $(".ready-n"); if (g) g.textContent = Math.max(1, Math.ceil((s.startAt - t) / 1000));
      }
    }
    setInterval(() => { if (alive && H && st().phase === "question") { live(); draw(); } }, 200);

    function full() {
      const s = st();
      if (s.phase === "lobby") return lobby();
      if (s.phase === "question") return now() < s.startAt ? ready() : question();
      if (s.phase === "reveal") return reveal();
      if (s.phase === "leaderboard") return board();
      if (s.phase === "podium") return podium();
    }

    async function lobby() {
      const url = location.host + "/kawho";
      const qr = el("canvas", { class: "qr", width: 420, height: 420, "aria-label": "QR code to join" });
      const lock = el("button", { class: "btn-x small", onclick: () => act(st().locked ? "unlock" : "lock") }, st().locked ? [ic("lock", 16), "Locked"] : [ic("unlock", 16), "Open"]);
      put(stage, controls(lock, el("button", { class: "btn-x small", onclick: e => { music = !music; store.set("kw.music", music); sound.music(music); put(e.currentTarget, ic("music", 16), music ? "Music on" : "Music off"); } }, ic("music", 16), music ? "Music on" : "Music off")),
        el("section", { class: "lobby-h" },
          el("div", { class: "join-box" }, el("div", { class: "join-l" }, el("div", { class: "j1" }, "Join at ", el("b", {}, url)), el("div", { class: "j2" }, "Game PIN:"), el("div", { class: "pin-big" }, pin.slice(0, 3) + " " + pin.slice(3))), qr),
          el("div", { class: "lobby-bottom" }, el("div", { class: "row" }, owl("idle", 64), el("div", { class: "p-count" }, "Who's here? ", el("b", { id: "pc" }, "0")), el("span", { class: "spacer" }), el("button", { class: "btn-x primary big", onclick: next }, "Start", ic("play", 18))),
            el("div", { class: "bubbles", id: "bubbles" }, el("div", { class: "waiting" }, "Nobody yet. Scan the code or go to ", url)))));
      lobbyPlayers(true);
      if (music) sound.music(true);
      loadScript(LIBS.qr).then(() => { const q = window.qrcode(0, "M"); q.addData(`${location.origin}/kawho/${pin}`); q.make(); const n = q.getModuleCount(), g = qr.getContext("2d"), cell = 420 / (n + 4); g.fillStyle = "#fff"; g.fillRect(0, 0, 420, 420); g.fillStyle = "#140F2E"; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(Math.floor((c + 2) * cell), Math.floor((r + 2) * cell), Math.ceil(cell), Math.ceil(cell)); }).catch(() => qr.remove());
    }
    let lobbyIds = "";
    function lobbyPlayers(force) {
      const box = $("#bubbles"); if (!box) return;
      const ids = H.players.map(p => p.id).join(",");
      $("#pc").textContent = H.players.length; box.classList.toggle("many", H.players.length > 24);
      if (ids !== lobbyIds || force) {
        const before = new Set(lobbyIds.split(","));
        if (H.players.length > (lobbyIds ? lobbyIds.split(",").length : 0) && !force) sound.play("join");
        lobbyIds = ids;
        put(box, H.players.length ? H.players.map(p => el("button", { class: "bubble" + (before.has(p.id) ? "" : " new"), "data-id": p.id, title: "Click to remove", onclick: () => { if (confirm(`Remove ${p.name} from the game?`)) act("kick", { pid: p.id }); } }, avatar(p.avatar, 30), p.name))
          : el("div", { class: "waiting" }, "Nobody yet. Scan the code or go to ", location.host + "/kawho"));
      }
      for (const p of H.players) if (p.react_at && p.react_at !== seenReact[p.id]) {
        const fresh = seenReact[p.id] !== undefined || Date.now() - (p.react_at - offset) < 5000; seenReact[p.id] = p.react_at;
        const b = box.querySelector(`[data-id="${p.id}"]`); if (b && fresh) { const f = el("span", { class: "float-emoji" }, ic(p.react || "like", 30)); b.append(f); setTimeout(() => f.remove(), 1600); }
      }
    }
    function qHead() { const s = st(), q = cur(); return el("div", { class: "q-top" }, el("span", { class: "q-num" }, `${s.q + 1} / ${Qs().length}`), el("span", { class: "q-type" }, tIcon(q.type, 18), " ", TYPE_NAMES[q.type], q.points === 2 ? " · ×2" : q.points === 0 && !["poll", "cloud"].includes(q.type) ? " · no points" : "")); }
    function ready() {
      const q = cur();
      put(stage, controls(), el("section", { class: "ready-h" }, qHead(), el("h1", { class: "q-text big" }, q.q), el("div", { class: "ready-row" }, owl("think", 150), el("div", { class: "ready-n" }, "3")), el("div", { class: "ready-bar" }, el("i"))));
      sound.play("go");
    }
    const optTiles = (q, mode) => el("div", { class: "h-opts n" + q.options.length }, q.options.map((o, i) => el("div", { class: "h-opt" + (mode === "reveal" ? (o.ok || q.type === "poll" ? " right" : " dim") : ""), style: `--c:${COLORS[i]}` }, shape(i, 40), o.img ? el("img", { src: o.img, alt: "" }) : null, el("span", {}, o.t), mode === "reveal" && o.ok ? el("b", { class: "tick" }, ic("check", 26)) : null)));
    function question() {
      const s = st(), q = cur();
      let bottom;
      if (q.options) bottom = optTiles(q);
      else if (q.type === "order") bottom = el("div", { class: "h-order" }, (s.order || []).map((ix, k) => el("div", { class: "h-opt", style: `--c:${COLORS[k]}` }, shape(k, 34), el("span", {}, q.items[ix]))));
      else if (q.type === "slider") bottom = el("div", { class: "h-hint" }, `Slide to a number between ${q.min} and ${q.max}${q.unit ? " " + q.unit : ""}`);
      else bottom = el("div", { class: "h-hint" }, q.type === "cloud" ? [ic("cloud", 30), " Type a word or two on your phone"] : [ic("keyboard", 30), " Type your answer on your phone"]);
      put(stage, controls(el("button", { class: "btn-x small primary", onclick: next }, "Skip", ic("right", 18))),
        el("section", { class: "q-h" }, qHead(), el("h1", { class: "q-text" }, q.q),
          el("div", { class: "q-mid" }, el("div", { class: "h-ring" }, el("b", {}, String(q.time))), q.image ? el("img", { class: "q-pic", src: q.image, alt: "" }) : el("div", { class: "q-art" }, owl("think", 170)), el("div", { class: "h-count" }, el("b", {}, "0"), el("span", {}, "answers"))),
          bottom));
      live();
    }
    function reveal() {
      const s = st(), q = cur(), x = s.stats || { answered: 0, right: 0 };
      let mid;
      if (q.options) {
        const max = Math.max(1, ...(x.counts || [0]));
        mid = el("div", { class: "chart" }, q.options.map((o, i) => el("div", { class: "col" + (q.type === "poll" || o.ok ? "" : " dim"), style: `--c:${COLORS[i]}` }, el("b", {}, String((x.counts || [])[i] || 0), o.ok ? ic("check", 22) : null), el("div", { class: "bar-box" }, el("div", { class: "bar", style: `height:${Math.max(3, ((x.counts || [])[i] || 0) / max * 100)}%` })), shape(i, 30))));
      } else if (q.type === "type" || q.type === "cloud") {
        const words = x.words || [], mx = Math.max(1, ...words.map(w => w.n)), accepted = new Set((q.answers || []).map(a => fold(a).replace(/[^a-z0-9]+/g, " ").trim()));
        mid = words.length ? el("div", { class: "cloud" }, words.map((w, i) => el("span", { class: q.type === "type" ? (accepted.has(fold(w.text).replace(/[^a-z0-9]+/g, " ").trim()) ? "w right" : "w dim") : "w", style: `font-size:${18 + 46 * (w.n / mx)}px;--c:${COLORS[i % 6]}` }, w.text, el("sub", {}, String(w.n))))) : el("div", { class: "h-hint" }, "No answers");
      } else if (q.type === "slider") {
        const vals = x.values || [], span = q.max - q.min || 1, pos = v => `${((v - q.min) / span) * 100}%`;
        mid = el("div", { class: "line-wrap" }, el("div", { class: "num-line" },
          q.tol ? el("div", { class: "tol", style: `left:${pos(Math.max(q.min, q.correct - q.tol))};width:${(Math.min(q.max, q.correct + q.tol) - Math.max(q.min, q.correct - q.tol)) / span * 100}%` }) : null,
          vals.map((v, i) => el("i", { class: "dot", style: `left:${pos(v)};bottom:${8 + (i % 6) * 14}px` })), el("div", { class: "target", style: `left:${pos(q.correct)}` }, el("b", {}, String(q.correct), q.unit ? " " + q.unit : ""))),
          el("div", { class: "range-ends wide" }, el("span", {}, String(q.min)), el("span", {}, String(q.max))));
      } else if (q.type === "order") {
        mid = el("div", { class: "h-order" }, q.items.map((t, k) => el("div", { class: "h-opt right", style: `--c:${COLORS[k]}` }, el("b", { class: "ord-n big" }, String(k + 1)), el("span", {}, t))));
      }
      const scored = !["poll", "cloud"].includes(q.type);
      put(stage, controls(el("button", { class: "btn-x small primary", onclick: next }, nextLabel())),
        el("section", { class: "rev-h" }, qHead(), el("h1", { class: "q-text" }, q.q),
          q.type === "type" ? el("div", { class: "answer-line" }, "Answer: ", el("b", {}, (q.answers || []).join(" / "))) : null,
          mid, q.options && q.type !== "poll" ? optTiles(q, "reveal") : null,
          el("div", { class: "rev-stat" }, scored ? `${x.right} of ${x.answered} got it right` : `${x.answered} answer${x.answered === 1 ? "" : "s"}`),
          el("button", { class: "btn-x primary big", onclick: next }, nextLabel())));
      sound.play("reveal");
    }
    function board() {
      const top = st().top || [];
      put(stage, controls(), el("section", { class: "lb-h" }, el("div", { class: "lb-head" }, owl("happy", 90), el("h1", { class: "lb-title" }, "Who's winning?")),
        el("div", { class: "lb" }, top.length ? top.map((p, i) => el("div", { class: "lb-row", style: `--d:${i * 120}ms` }, el("span", { class: "lb-rank" }, String(i + 1)), avatar(p.avatar, 44), el("span", { class: "lb-name" }, p.name, p.streak >= 3 ? el("span", { class: "fire" }, ic("flame", 18), p.streak) : null),
          p.move > 0 ? el("span", { class: "mv up" }, ic("up", 18), p.move) : p.move < 0 ? el("span", { class: "mv down" }, ic("down", 18), -p.move) : el("span", { class: "mv" }), el("b", { class: "lb-score" }, p.score.toLocaleString()))) : el("p", {}, "No players yet")),
        el("div", { class: "lb-next" }, el("span", { class: "lb-count" }, el("i", { id: "lbBar" }), el("b", { id: "lbN" }, `Next question in ${LB_SECONDS}`)),
          el("button", { class: "btn-x small", id: "lbPause", onclick: () => { lbPaused = !lbPaused; put($("#lbPause"), ic(lbPaused ? "play" : "pause", 16), lbPaused ? "Continue" : "Pause"); } }, ic("pause", 16), "Pause"),
          el("button", { class: "btn-x primary", onclick: next }, nextLabel()))));
      sound.play("go");
      stopLb(); lbPaused = false;
      let left = LB_SECONDS * 10;
      lbTimer = setInterval(() => {
        if (!alive || lbPaused) return;
        left--;
        const n = $("#lbN"), bar = $("#lbBar");
        if (n) n.textContent = `Next question in ${Math.ceil(left / 10)}`;
        if (bar) bar.style.width = `${100 - (left / (LB_SECONDS * 10)) * 100}%`;
        if (left <= 0) { stopLb(); act("next"); }
      }, 100);
    }
    async function podium() {
      const top = st().top || [];
      const spot = (p, place) => p ? el("div", { class: "pod p" + place }, el("div", { class: "pod-av" }, avatar(p.avatar, 76)), el("div", { class: "pod-name" }, p.name), el("div", { class: "pod-score" }, p.score.toLocaleString()), el("div", { class: "pod-block" }, String(place))) : el("div", { class: "pod p" + place + " empty" });
      put(stage, controls(), el("section", { class: "podium-h" }, el("div", { class: "lb-head" }, owl("happy", 100), el("h1", { class: "lb-title" }, "And the owl says… who?")),
        el("div", { class: "podium" }, spot(top[1], 2), spot(top[0], 1), spot(top[2], 3)),
        top.length > 3 ? el("div", { class: "rest" }, top.slice(3).map((p, i) => el("span", {}, `${i + 4}. `, avatar(p.avatar, 22), ` ${p.name} · ${p.score.toLocaleString()}`))) : null,
        el("div", { class: "row center" }, el("button", { class: "btn-x primary", onclick: e => exportXlsx(e.currentTarget) }, ic("download", 18), "Download results (Excel)"),
          el("button", { class: "btn-x", onclick: () => { if (H.quizId) host(H.quizId); else location.hash = "#/"; } }, "Play again"),
          el("a", { class: "btn-x ghost", href: "#/" }, "Back to studio"))));
      sound.play("win"); setTimeout(() => confetti(8000), 2200);
    }
    async function exportXlsx(btn) {
      btn.disabled = true; put(btn, "Preparing…");
      try {
        await loadScript(LIBS.xlsx);
        const r = await authApi("results", { query: { pin } }), X = window.XLSX, qs = r.quiz.questions;
        const byP = {}; for (const a of r.answers) (byP[a.player_id] ||= {})[a.q] = a;
        const txt = (q, a, qi) => { if (a == null) return ""; if (q.type === "multi") return [].concat(a).map(i => q.options[i] ? q.options[i].t : "").join("; "); if (q.options && typeof a === "number") return q.options[a] ? q.options[a].t : ""; if (q.type === "order") return [].concat(a).map(i => q.items[((r.orders || {})[qi] || [])[i]] ?? "?").join(" > "); return String(a); };
        const lb = [["Rank", "Name", "Score", "Right answers", "Accuracy"]].concat(r.players.map((p, i) => { const mine = Object.values(byP[p.id] || {}); const right = mine.filter(a => a.correct).length, scored = qs.filter(q => !["poll", "cloud"].includes(q.type)).length; return [i + 1, p.name, p.score, right, scored ? right / scored : 0]; }));
        const ans = [["Name", ...qs.map((q, i) => `${i + 1}. ${q.q}`)]].concat(r.players.map(p => [p.name, ...qs.map((q, i) => { const a = (byP[p.id] || {})[i]; return a ? `${txt(q, a.answer, i)}${a.correct === true ? " (right)" : a.correct === false ? " (wrong)" : ""}${a.points ? ` (+${a.points})` : ""}` : "—"; })]));
        const qst = [["#", "Question", "Type", "Answered", "Right", "% right", "Average time (s)"]].concat(qs.map((q, i) => { const a = r.answers.filter(x => x.q === i), right = a.filter(x => x.correct).length; return [i + 1, q.q, TYPE_NAMES[q.type], a.length, ["poll", "cloud"].includes(q.type) ? "" : right, ["poll", "cloud"].includes(q.type) || !a.length ? "" : right / a.length, a.length ? Math.round(a.reduce((t, x) => t + x.ms, 0) / a.length / 100) / 10 : ""]; }));
        const wb = X.utils.book_new(), s1 = X.utils.aoa_to_sheet(lb), s2 = X.utils.aoa_to_sheet(ans), s3 = X.utils.aoa_to_sheet(qst);
        for (let i = 1; i < lb.length; i++) { const c = s1[X.utils.encode_cell({ r: i, c: 4 })]; if (c) c.z = "0%"; }
        for (let i = 1; i < qst.length; i++) { const c = s3[X.utils.encode_cell({ r: i, c: 5 })]; if (c && typeof c.v === "number") c.z = "0%"; }
        s1["!cols"] = [{ wch: 6 }, { wch: 22 }, { wch: 10 }, { wch: 14 }, { wch: 10 }]; s2["!cols"] = [{ wch: 20 }, ...qs.map(() => ({ wch: 26 }))]; s3["!cols"] = [{ wch: 4 }, { wch: 50 }, { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 9 }, { wch: 16 }];
        X.utils.book_append_sheet(wb, s1, "Leaderboard"); X.utils.book_append_sheet(wb, s2, "Answers"); X.utils.book_append_sheet(wb, s3, "Questions");
        X.writeFile(wb, `kawho-${(r.quiz.title || "quiz").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      } catch (e) { toast(e.message); } finally { btn.disabled = false; put(btn, ic("download", 18), "Download results (Excel)"); }
    }
    poll();
  }

  window.KWH = { parseAny, normQ, problems, EXAMPLE_TEXT };
  boot();
})();
