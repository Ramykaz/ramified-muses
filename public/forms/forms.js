/* Forms app. Respondents open BASE/<form-id>; the owner uses BASE/admin.
   Talks to /api/forms. Excel, PDF and QR libraries load only when needed. */
(() => {
  "use strict";

  /* ================= helpers ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === false || v == null) continue;
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k === "html") n.innerHTML = v; // only ever used with constant markup
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (k === "value") n.value = v;
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  };
  // append children, skipping null/false and flattening arrays
  const add = (node, ...kids) => { for (const c of kids.flat(Infinity)) if (c != null && c !== false) node.append(c.nodeType ? c : String(c)); return node; };
  const put = (node, ...kids) => { node.replaceChildren(); return add(node, ...kids); };
  const ICONS = {
    back: '<path d="M15 18l-6-6 6-6"/>', next: '<path d="M5 12h14M13 6l6 6-6 6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    share: '<path d="M12 3v13M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>', refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="none"/>', file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    form: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>', sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>', image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  const icon = name => el("span", { style: "display:contents", html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>` });
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600); }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;
  function rel(ts) {
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago"; if (s < 86400) return Math.floor(s / 3600) + " h ago";
    if (s < 172800) return "yesterday"; if (s < 604800) return Math.floor(s / 86400) + " days ago";
    return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: new Date(ts).getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
  }
  const fullDate = ts => new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const PALETTE = ["#4C5FD5", "#F28B54", "#1FA38A", "#E5B93B", "#D65C8F", "#5AA9E6", "#8C6BD8", "#7FB069", "#E36A6A", "#45B5C4", "#B08850", "#9A9DAB"];
  // lower case without accents, so "izmir" finds "İzmir" and "cok" finds "çok"
  const fold = s => String(s).replace(/[İIı]/g, "i").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const slugify = s => fold(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

  const BASE = location.hostname.startsWith("forms.") ? "" : "/forms";
  const formUrl = id => location.origin + BASE + "/" + id;
  const LIBS = {
    xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    autotable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
    qr: "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",
    font: "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf",
    fontBold: "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf"
  };
  const scripts = {};
  const loadScript = src => scripts[src] ??= new Promise((ok, fail) => { const s = el("script", { src }); s.onload = ok; s.onerror = () => { delete scripts[src]; fail(new Error("Could not load " + src)); }; document.head.append(s); });

  /* ================= API ================= */
  const TOKEN_KEY = "forms.token";
  async function api(action, { method = "GET", body, query = {} } = {}) {
    const qs = new URLSearchParams({ action, ...query }).toString();
    const headers = { "Content-Type": "application/json" };
    const token = store.get(TOKEN_KEY, null); if (token) headers.Authorization = "Bearer " + token;
    let r;
    try { r = await fetch("/api/forms?" + qs, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
    catch (e) { throw Object.assign(new Error("No connection. Check your internet and try again."), { status: 0 }); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || "Something went wrong."), { status: r.status });
    return j;
  }

  /* ================= form definition ================= */
  const TYPES = { text: "short", short: "short", shorttext: "short", "short-text": "short", input: "short", name: "short", long: "long", paragraph: "long", textarea: "long", longtext: "long", "long-text": "long", email: "email", phone: "phone", tel: "phone", number: "number", date: "date", single: "single", radio: "single", choice: "single", "single-choice": "single", multiple: "multiple", checkbox: "multiple", checkboxes: "multiple", multi: "multiple", "multiple-choice": "multiple", dropdown: "dropdown", select: "dropdown", scale: "scale", linear: "scale", "linear-scale": "scale", nps: "scale", rating: "rating", stars: "rating", yesno: "yesno", "yes-no": "yesno", boolean: "yesno", ranking: "ranking", rank: "ranking", matrix: "matrix", grid: "matrix", likert: "matrix", info: "info", statement: "info", text_block: "info" };
  const TYPE_NAMES = { short: "Short answer", long: "Paragraph", email: "Email", phone: "Phone", number: "Number", date: "Date", single: "Single choice", multiple: "Multiple choice", dropdown: "Dropdown", scale: "Scale", rating: "Rating", yesno: "Yes / No", ranking: "Ranking", matrix: "Grid", info: "Text" };
  const CHOICE = new Set(["single", "dropdown", "yesno"]);
  const TEXTISH = new Set(["short", "long", "email", "phone", "number", "date"]);
  function parseLoose(text) {
    text = String(text).trim().replace(/^```[a-z]*\s*\n?/i, "").replace(/\n?```\s*$/, "").trim();
    if (!text) throw "Paste your form JSON here.";
    try { return JSON.parse(text); }
    catch (e) {
      try { return JSON.parse(text.replace(/[“”]/g, '"').replace(/,\s*([\]}])/g, "$1")); }
      catch (e2) { throw "This isn't valid JSON yet: " + String(e.message).replace(/^JSON\.parse: /, "") + ". Check the commas, quotes and brackets."; }
    }
  }
  const str = v => v == null ? "" : String(v).trim();
  // turns whatever was pasted into a clean form; throws a message for the user
  function normalizeForm(o) {
    if (Array.isArray(o)) o = { questions: o };
    if (!o || typeof o !== "object") throw "The JSON should be an object with a title and questions.";
    const errors = [], warnings = [];
    let sections = Array.isArray(o.sections) ? o.sections : Array.isArray(o.questions) ? [{ questions: o.questions }] : Array.isArray(o.pages) ? o.pages : null;
    if (!sections) throw 'Add your questions: "questions": [ ... ] or "sections": [ { "title": ..., "questions": [ ... ] } ].';
    const used = new Set(); let n = 0;
    const out = {
      title: str(o.title || o.name) || "Untitled form",
      description: str(o.description || o.intro),
      sections: []
    };
    if (!str(o.title || o.name)) warnings.push("No title, so it's called \"Untitled form\".");
    // set inside the loop so per-question warnings can name the question
    let where = "";
    sections.forEach((s, si) => {
      if (Array.isArray(s)) s = { questions: s };
      s = s || {};
      const sec = { title: str(s.title || s.name), description: str(s.description), questions: [] };
      (Array.isArray(s.questions) ? s.questions : []).forEach((q, qi) => {
        if (typeof q === "string") q = { title: q, type: "short" };
        q = q || {};
        where = `Question ${n + 1}`;
        const rawType = str(q.type || (q.options || q.choices ? "single" : "short")).toLowerCase();
        const type = TYPES[rawType];
        const title = str(q.title || q.question || q.label || q.text);
        if (!type) { errors.push(`${where}: unknown type "${rawType}". Use one of: ${Object.keys(TYPE_NAMES).join(", ")}.`); n++; return; }
        if (!title) { errors.push(`${where}: add a "title".`); n++; return; }
        const qq = { id: "", type, title };
        const help = str(q.help || q.description || q.hint); if (help) qq.help = help;
        if (type !== "info") { qq.required = type === "multiple" ? q.optional !== true : !!q.required && q.optional !== true; if (q.optional === true) qq.optional = true; n++; }
        const qimg = str(q.image); if (/^https:\/\/\S+$/i.test(qimg)) qq.image = qimg; else if (qimg) warnings.push(`${where}: "image" should be a link starting with https://`);
        const ph = str(q.placeholder); if (ph && TEXTISH.has(type)) qq.placeholder = ph;
        const list = v => (Array.isArray(v) ? v : []).map(x => str(typeof x === "object" && x ? (x.label ?? x.value ?? x.text) : x)).filter(Boolean);
        if (["single", "multiple", "dropdown", "ranking"].includes(type)) {
          qq.options = [...new Set(list(q.options || q.choices))];
          if (qq.options.length < (type === "ranking" ? 2 : 1)) errors.push(`${where} ("${title}"): add "options": ["...", "..."].`);
          if (q.other && type !== "ranking") qq.other = typeof q.other === "string" ? str(q.other) : "Other";
          if (qq.other && qq.options.includes(qq.other)) qq.options = qq.options.filter(x => x !== qq.other);
        }
        if (type === "multiple" || type === "ranking") { const mx = parseInt(q.max, 10); if (mx > 0) qq.max = mx; }
        if (type === "multiple") { const mn = parseInt(q.min, 10); if (mn > 0) qq.min = mn; }
        if (type === "scale") {
          const nps = rawType === "nps";
          qq.min = Number.isFinite(+q.min) && q.min !== "" && q.min != null ? Math.round(+q.min) : nps ? 0 : 1;
          qq.max = Number.isFinite(+q.max) && q.max !== "" && q.max != null ? Math.round(+q.max) : nps ? 10 : 5;
          if (qq.max <= qq.min || qq.max - qq.min > 10) { errors.push(`${where}: a scale goes from "min" to "max", with at most 11 steps.`); }
          const labels = Array.isArray(q.labels) ? q.labels : [];
          const a = str(q.minLabel ?? labels[0]), b = str(q.maxLabel ?? labels[labels.length - 1]);
          if (a) qq.minLabel = a; if (b) qq.maxLabel = b;
        }
        if (type === "rating") { const mx = parseInt(q.max, 10); qq.max = mx >= 3 && mx <= 10 ? mx : 5; }
        if (type === "matrix") {
          qq.rows = list(q.rows || q.statements || q.items);
          qq.columns = list(q.columns || q.scale || q.options);
          if (!qq.rows.length || qq.columns.length < 2) errors.push(`${where} ("${title}"): a grid needs "rows" and at least 2 "columns".`);
        }
        let id = str(q.id).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").replace(/__other$/, "").slice(0, 40);
        if (!id) id = slugify(title) || "q" + (n || 1);
        let base = id, k = 2; while (used.has(id)) id = `${base}-${k++}`;
        used.add(id); qq.id = id;
        sec.questions.push(qq);
      });
      if (sec.questions.length) out.sections.push(sec);
      else if (s.questions && s.questions.length === 0) warnings.push(`Section ${si + 1} has no questions and was left out.`);
    });
    if (!n && !errors.length) errors.push("Add at least one question.");
    if (errors.length) throw errors;
    const img = str(o.image || o.headerImage || o.cover); if (/^https:\/\/\S+$/i.test(img)) out.image = img; else if (img) warnings.push('"image" should be a link starting with https://');
    const theme = str(o.theme || o.color); if (/^#[0-9a-f]{6}$/i.test(theme)) out.theme = theme; else if (theme) warnings.push('"theme" should be a colour like "#4C5FD5".');
    for (const k of ["thankYou", "closedMessage", "buttonText"]) { const v = str(o[k]); if (v) out[k] = v; }
    if (o.anonymous) out.anonymous = true;
    if (o.oneResponsePerDevice) out.oneResponsePerDevice = true;
    const slug = slugify(o.slug || ""); if (slug) out.slug = slug;
    const closes = str(o.closesAt); if (closes) { if (Number.isNaN(Date.parse(closes))) warnings.push('"closesAt" should be a date like "2026-12-31".'); else out.closesAt = closes; }
    return { form: out, count: n, warnings };
  }
  const allQuestions = f => f.sections.flatMap(s => s.questions);
  // saved forms are already clean; this only fills gaps in older or hand-made data
  const tidy = f => { try { return normalizeForm(f).form; } catch (e) { return f; } };
  const answerable = f => allQuestions(f).filter(q => q.type !== "info");
  function isEmpty(q, a) {
    const v = a[q.id];
    if (v == null || v === "") return true;
    if (Array.isArray(v)) return !v.length;
    if (q.type === "matrix") return !Object.keys(v).length;
    return false;
  }
  // a readable answer, used by the response view, search, Excel and PDF
  function fmt(q, a) {
    const v = a[q.id]; if (v == null || v === "") return "";
    const other = x => q.other && x === q.other ? `${q.other}: ${a[q.id + "__other"] || ""}`.trim() : x;
    switch (q.type) {
      case "single": case "dropdown": case "yesno": return other(String(v));
      case "multiple": return [].concat(v).map(other).join(", ");
      case "ranking": return [].concat(v).map((x, i) => `${i + 1}. ${x}`).join(", ");
      case "matrix": return q.rows.filter(r => v[r]).map(r => `${r}: ${v[r]}`).join("; ");
      case "rating": return `${v} / ${q.max}`;
      default: return String(v);
    }
  }

  const EXAMPLE = {
    title: "HAKID Member Engagement Questionnaire",
    description: "Before finalizing the program, we would like to hear your views on what you want, what prevents you from attending, and what would make HAKID more useful. It takes about 2 minutes, and your answers are anonymous.",
    slug: "hakid",
    theme: "#2E4A6B",
    anonymous: true,
    thankYou: "Thank you! The Social Affairs Department will summarize the most requested activities, the most common barriers and the preferred schedule, then share a short update on which suggestions will be acted on.",
    sections: [
      { title: "Your participation", questions: [
        { id: "participation", type: "single", title: "How often do you take part in HAKID activities?", required: true,
          options: ["I participate regularly.", "I participate occasionally.", "I rarely attend.", "I am a member but have not attended yet."] },
        { id: "barriers", type: "multiple", title: "What prevents you from attending?", help: "Select all that apply.",
          options: ["Busy academic schedule", "Work or other responsibilities", "Events announced too late", "Activities do not interest me", "I do not know many members yet", "Location or transportation", "Financial constraints", "Timing is inconvenient", "I do not feel sufficiently included"], other: "Other reasons" }
      ] },
      { title: "What you would like", questions: [
        { id: "programs", type: "multiple", title: "Which programs would you like to attend?", help: "Select all that apply.",
          options: ["Weekly ders program", "Online professional training", "Presentation and public-speaking practice", "Study sessions", "Breakfast gatherings", "Game nights", "Cultural events", "Career and networking events", "Community service", "Trips and outdoor activities", "Peer mentoring and skill-sharing"] },
        { id: "skills", type: "multiple", title: "Which skills would you most like to improve?",
          options: ["Public speaking", "Leadership", "Academic writing and research", "Career development", "Communication and teamwork", "Project management", "Digital skills"], other: "Other" },
        { id: "format", type: "single", title: "What format do you prefer?", options: ["In-person", "Online", "A mixture of both"] }
      ] },
      { title: "Your schedule and ideas", questions: [
        { id: "days", type: "multiple", title: "Which days usually work best for you?", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
        { id: "times", type: "multiple", title: "And which times?", options: ["Morning", "Afternoon", "Evening"], other: "A specific time" },
        { id: "changes", type: "long", title: "What changes would encourage you to attend HAKID programs more often?", help: "Please include ideas, preferred times, new activities, or concerns." }
      ] }
    ]
  };
  const AI_PROMPT = `Turn my questionnaire into JSON for my forms app. Reply with ONLY the JSON, nothing else.

Format:
{
  "title": "Form title",
  "description": "Short intro shown on the first screen",
  "slug": "short-link-name",
  "theme": "#4C5FD5",
  "anonymous": true,
  "thankYou": "Message after sending",
  "sections": [
    { "title": "Section name", "questions": [
      { "id": "short-id", "type": "single", "title": "Question?", "required": true, "options": ["A", "B"] }
    ] }
  ]
}

Question types:
- "short" (one line), "long" (paragraph), "email", "phone", "number", "date"
- "single" (pick one) and "multiple" (pick any; at least one is needed unless "optional": true; "max": 3 to limit) with "options": [...]. Add "other": "Other" for a write-in option.
- "dropdown" (pick one from a long list) with "options"
- "yesno"
- "scale" with "min": 1, "max": 5, "minLabel": "Not at all", "maxLabel": "Very much"
- "rating" (stars) with "max": 5
- "ranking" (put options in order) with "options"
- "matrix" (grid) with "rows": [...] and "columns": [...]
- "info" (just text, no answer)
Optional on any question: "help" (small text under it), "required": true, "placeholder", "image" (a picture link).
Optional on the form: "image" (a header picture link).

My questionnaire:
[PASTE IT HERE]`;

  /* ================= respondent ================= */
  // Renders a form into `root`. In preview mode nothing is sent.
  function runForm(root, form, { id, preview = false, onExit } = {}) {
    const accent = form.theme || "#4C5FD5";
    root.style.setProperty("--accent", accent);
    const draftKey = "forms.draft." + id, doneKey = "forms.done." + id;
    const steps = [];
    let num = 0;
    form.sections.forEach((s, si) => s.questions.forEach(q => steps.push({ q, si, num: q.type === "info" ? 0 : ++num })));
    const total = num, multiSection = form.sections.filter(s => s.title).length > 1;
    const draft = preview ? null : store.get(draftKey, null);
    let answers = draft && draft.answers ? draft.answers : {}, step = -1, dir = 1, sending = false;
    const save = () => { if (!preview) store.set(draftKey, { answers, step }); };
    const mins = Math.max(1, Math.round(steps.reduce((t, s) => t + ({ long: 40, matrix: 8 * ((s.q.rows || []).length || 1), ranking: 25, info: 8, short: 15, email: 12, phone: 12 }[s.q.type] || 10), 0) / 60));

    function shell(content, { progress = 0, meta = "", bottom = null } = {}) {
      root.replaceChildren(el("div", { class: "r-shell" + (bottom ? " has-bottom" : "") },
        el("div", { class: "r-top" }, el("div", { class: "bar" }, el("i", { style: `width:${progress}%` })),
          meta ? el("div", { class: "wrap narrow" }, el("div", { class: "meta" }, el("b", {}, form.title), el("span", { class: "spacer" }), el("span", {}, meta))) : null),
        el("main", { class: "r-main wrap narrow" }, content),
        bottom ? el("div", { class: "r-bottom" }, el("div", { class: "wrap narrow" }, bottom)) : el("div", { class: "r-brand" }, "Made with Forms")));
    }

    function cover() {
      step = -1;
      if (!preview && form.oneResponsePerDevice && store.get(doneKey, false)) return finished(true);
      const resume = draft && draft.step > 0 && Object.keys(answers).length;
      shell(el("div", { class: "cover r-step" },
        form.image ? el("img", { class: "cover-img", src: form.image, alt: "", onerror: e => e.currentTarget.remove() }) : el("div", { class: "logo" }, (form.title.trim()[0] || "F").toUpperCase()),
        el("h1", {}, form.title),
        form.description ? el("p", {}, form.description) : null,
        el("div", { class: "facts" },
          el("span", { class: "chip" }, icon("list"), plural(total, "question")),
          el("span", { class: "chip" }, icon("clock"), `About ${plural(mins, "minute")}`),
          form.anonymous ? el("span", { class: "chip" }, icon("lock"), "Anonymous") : null),
        el("div", { class: "row", style: "margin-top:6px" },
          el("button", { class: "btn primary big", onclick: () => go(resume ? draft.step : 0, 1) }, resume ? "Continue" : (form.buttonText || "Start"), icon("next")),
          resume ? el("button", { class: "btn big ghost", onclick: () => { answers = {}; store.del(draftKey); go(0, 1); } }, "Start over") : null),
        preview ? el("p", { class: "r-hint" }, "Preview: answers are not sent.") : null));
      const b = root.querySelector(".btn.primary"); if (b) b.focus({ preventScroll: true });
    }

    function go(i, d) { dir = d; step = Math.max(0, Math.min(i, steps.length - 1)); save(); render(); window.scrollTo(0, 0); }

    function setErr(msg) {
      const e = root.querySelector(".r-err"); if (!e) return;
      e.textContent = msg; const card = root.querySelector(".r-step"); card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    }
    function validate(q) {
      if (q.type === "info") return "";
      const v = answers[q.id];
      if (q.required && isEmpty(q, answers)) return q.type === "multiple" ? "Please choose at least one." : q.type === "matrix" ? "Please answer every row." : "Please answer this question.";
      if (q.type === "matrix" && q.required && Object.keys(v || {}).length < q.rows.length) return "Please answer every row.";
      if (q.other && ([].concat(v || [])).includes(q.other) && !str(answers[q.id + "__other"])) return `Please write your answer for "${q.other}".`;
      if (q.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please check the email address.";
      if (q.type === "number" && v !== undefined && v !== "" && !Number.isFinite(+v)) return "Please write a number.";
      if (q.type === "multiple" && v && q.min && v.length < q.min) return `Please choose at least ${q.min}.`;
      if (q.type === "ranking" && q.required && v) { const need = Math.min(q.max || q.options.length, q.options.length); if (v.length < need) return `Please rank ${need === q.options.length ? "all the options" : "your top " + need}.`; }
      return "";
    }
    function next() {
      const q = steps[step].q, e = validate(q);
      if (e) { setErr(e); return; }
      if (step < steps.length - 1) go(step + 1, 1); else submit();
    }
    function set(q, v, auto) {
      if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) delete answers[q.id]; else answers[q.id] = v;
      save(); const e = root.querySelector(".r-err"); if (e) e.textContent = "";
      paintNav(q);
      if (auto) { clearTimeout(set.t); set.t = setTimeout(() => { if (steps[step] && steps[step].q === q) next(); }, 320); }
    }

    function optionButton(label, i, on, multi, onclick) {
      return el("button", { type: "button", class: "opt" + (multi ? " multi" : "") + (on ? " on" : ""), "aria-pressed": on ? "true" : "false", onclick },
        el("span", { class: "key" }, i < 26 ? String.fromCharCode(65 + i) : "•"), el("span", { class: "lbl" }, label), el("span", { class: "tick", html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">${ICONS.check}</svg>` }));
    }
    function otherInput(q) {
      const inp = el("input", { class: "input other-in", type: "text", placeholder: "Type your answer", value: answers[q.id + "__other"] || "", "aria-label": q.other,
        oninput: e => { if (e.target.value) answers[q.id + "__other"] = e.target.value; else delete answers[q.id + "__other"]; save(); },
        onkeydown: e => { if (e.key === "Enter") { e.preventDefault(); next(); } } });
      setTimeout(() => inp.focus({ preventScroll: true }), 30);
      return inp;
    }

    function body(q) {
      const v = answers[q.id];
      const rerender = () => { const b = root.querySelector(".r-body"); b.replaceWith(body(q)); };
      switch (q.type) {
        case "info": return el("div", { class: "r-body" });
        case "short": case "email": case "phone": case "number": case "date": {
          const inp = el("input", { class: "input r-input", type: { email: "email", phone: "tel", number: "text", date: "date" }[q.type] || "text", inputmode: q.type === "number" ? "decimal" : null,
            autocomplete: q.type === "email" ? "email" : q.type === "phone" ? "tel" : /name|isim|\bad\b/i.test(q.title) ? "name" : "off",
            placeholder: q.placeholder || (q.type === "email" ? "name@example.com" : q.type === "date" ? "" : "Type your answer"), value: v || "",
            oninput: e => set(q, e.target.value.trim() === "" ? undefined : e.target.value), onkeydown: e => { if (e.key === "Enter") { e.preventDefault(); next(); } } });
          setTimeout(() => inp.focus({ preventScroll: true }), 50);
          return el("div", { class: "r-body" }, inp, el("div", { class: "r-hint hide-sm" }, "Press Enter ↵ to continue"));
        }
        case "long": {
          const ta = el("textarea", { class: "input r-input", rows: 5, placeholder: q.placeholder || "Type your answer", oninput: e => { set(q, e.target.value.trim() === "" ? undefined : e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight + 2, 480) + "px"; } }, v || "");
          ta.onkeydown = e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); next(); } };
          setTimeout(() => ta.focus({ preventScroll: true }), 50);
          return el("div", { class: "r-body" }, ta);
        }
        case "single": case "dropdown": case "yesno": {
          const opts = q.type === "yesno" ? ["Yes", "No"] : q.options.concat(q.other ? [q.other] : []);
          let filter = "";
          const listBox = el("div", { style: "display:grid;gap:10px" });
          const draw = () => listBox.replaceChildren(...opts.map((o, i) => [o, i]).filter(([o]) => !filter || fold(o).includes(fold(filter))).map(([o, i]) => optionButton(o, i, v === o, false, () => {
            const isOther = q.other && o === q.other;
            set(q, o, !isOther); rerender();
          })));
          draw();
          const search = q.type === "dropdown" && opts.length > 7 ? el("div", { class: "search" }, icon("search"), el("input", { class: "input", type: "search", placeholder: "Search the options", oninput: e => { filter = e.target.value; draw(); } })) : null;
          return el("div", { class: "r-body" + (q.type === "yesno" ? " yesno" : "") }, search, q.type === "yesno" ? listBox.childNodes.length && [...listBox.childNodes] : listBox, q.other && v === q.other ? otherInput(q) : null);
        }
        case "multiple": {
          const arr = [].concat(v || []), opts = q.options.concat(q.other ? [q.other] : []);
          const note = q.max ? `Choose up to ${q.max}` : "Choose as many as you like";
          return el("div", { class: "r-body" }, el("div", { class: "r-count" }, `${note}${arr.length ? ` · ${arr.length} selected` : ""}`),
            opts.map((o, i) => optionButton(o, i, arr.includes(o), true, () => {
              let a = [].concat(answers[q.id] || []);
              if (a.includes(o)) a = a.filter(x => x !== o);
              else { if (q.max && a.length >= q.max) { toast(`You can choose up to ${q.max}.`); return; } a.push(o); }
              if (q.other && !a.includes(q.other)) delete answers[q.id + "__other"];
              set(q, a); rerender();
            })), q.other && arr.includes(q.other) ? otherInput(q) : null);
        }
        case "scale": {
          const vals = []; for (let i = q.min; i <= q.max; i++) vals.push(i);
          return el("div", { class: "r-body" }, el("div", { class: "scale", style: vals.length > 6 ? "grid-template-columns:repeat(6,1fr)" : "" },
            vals.map(n => el("button", { type: "button", class: v === n ? "on" : "", "aria-pressed": v === n ? "true" : "false", onclick: () => { set(q, n, true); rerender(); } }, String(n)))),
            q.minLabel || q.maxLabel ? el("div", { class: "scale-labels" }, el("span", {}, q.minLabel ? `${q.min} = ${q.minLabel}` : ""), el("span", { style: "text-align:right" }, q.maxLabel ? `${q.max} = ${q.maxLabel}` : "")) : null);
        }
        case "rating": {
          const stars = [];
          for (let i = 1; i <= q.max; i++) stars.push(el("button", { type: "button", class: v >= i ? "on" : "", "aria-label": `${i} of ${q.max}`, onclick: () => { set(q, i, true); rerender(); }, html: `<svg viewBox="0 0 24 24">${ICONS.star}</svg>` }));
          return el("div", { class: "r-body" }, el("div", { class: "stars" }, stars), el("div", { class: "r-count" }, v ? `${v} of ${q.max}` : "Tap a star"));
        }
        case "ranking": {
          const order = [].concat(v || []), need = Math.min(q.max || q.options.length, q.options.length);
          return el("div", { class: "r-body" }, el("div", { class: "r-count" }, order.length ? `Tap to remove · ${order.length} of ${need} ranked` : `Tap the options in order, starting with your favourite${need < q.options.length ? ` (top ${need})` : ""}.`),
            el("div", { class: "rank-list" }, order.map((o, i) => el("button", { type: "button", class: "rank-item on", onclick: () => { set(q, order.filter(x => x !== o)); rerender(); } }, el("span", { class: "pos" }, String(i + 1)), el("span", {}, o))),
              q.options.filter(o => !order.includes(o)).map(o => el("button", { type: "button", class: "rank-item", disabled: order.length >= need, onclick: () => { set(q, order.concat(o)); rerender(); } }, el("span", { class: "pos" }, "+"), el("span", {}, o)))),
            order.length ? el("button", { class: "btn ghost", style: "justify-self:start", onclick: () => { set(q, undefined); rerender(); } }, "Reset") : null);
        }
        case "matrix": {
          const m = { ...(v || {}) };
          return el("div", { class: "r-body matrix" }, q.rows.map(r => el("div", { class: "mrow" + (m[r] ? " done" : "") }, el("b", {}, r),
            el("div", { class: "pills" }, q.columns.map(c => el("button", { type: "button", class: "pill" + (m[r] === c ? " on" : ""), onclick: () => { const n = { ...(answers[q.id] || {}) }; n[r] = c; set(q, n); rerender(); } }, c))))));
        }
      }
      return el("div", { class: "r-body" });
    }

    // keep the button label and progress in step with the answer
    function paintNav(q) {
      const b = $("#nextBtn", root); if (!b || step === steps.length - 1 || q.type === "info") return;
      b.firstChild.textContent = !q.required && isEmpty(q, answers) ? "Skip" : "Next";
      const bar = root.querySelector(".r-top .bar i"); if (bar) bar.style.width = Math.round(((step + (isEmpty(q, answers) ? 0 : 1)) / steps.length) * 100) + "%";
      const m = root.querySelector(".r-top .meta span:last-child"); if (m) m.textContent = `${steps.filter(s => s.q.type !== "info" && !isEmpty(s.q, answers)).length} of ${total} answered`;
    }
    function render() {
      const { q, si, num } = steps[step];
      const sec = form.sections[si];
      const last = step === steps.length - 1;
      const card = el("div", { class: "r-step" + (dir < 0 ? " back" : "") },
        el("div", { class: "r-eyebrow" }, num ? el("span", { class: "r-num" }, String(num)) : null, multiSection && sec.title ? sec.title : num ? `Question ${num} of ${total}` : ""),
        el("h2", { class: "r-q", id: "qtitle" }, q.title, q.required ? el("span", { class: "req", "aria-label": "required" }, " *") : null),
        q.help ? el("p", { class: "r-help" }, q.help) : null,
        q.image ? el("img", { class: "q-img", src: q.image, alt: "", onerror: e => e.currentTarget.remove() }) : null,
        body(q),
        el("div", { class: "r-err", role: "alert" }));
      const answered = steps.filter(s => s.q.type !== "info" && !isEmpty(s.q, answers)).length;
      shell(card, {
        progress: Math.round(((step + (isEmpty(q, answers) ? 0 : 1)) / steps.length) * 100),
        meta: `${answered} of ${total} answered`,
        bottom: el("div", { class: "row" },
          el("button", { class: "btn big back", "aria-label": "Back", onclick: () => step === 0 ? cover() : go(step - 1, -1) }, icon("back")),
          el("button", { class: "btn primary big", id: "nextBtn", onclick: next }, last ? (preview ? "Finish preview" : "Submit") : (q.type === "info" ? "Continue" : !q.required && isEmpty(q, answers) ? "Skip" : "Next"), last ? icon("check") : icon("next")))
      });
    }

    async function submit() {
      if (sending) return;
      if (preview) { finished(false, true); return; }
      const missing = steps.findIndex(s => validate(s.q));
      if (missing >= 0) { go(missing, -1); setTimeout(() => setErr(validate(steps[missing].q)), 60); return; }
      sending = true; const b = $("#nextBtn"); if (b) { b.disabled = true; b.textContent = "Sending…"; }
      try {
        await api("submit", { method: "POST", body: { id, answers } });
        store.del(draftKey); if (form.oneResponsePerDevice) store.set(doneKey, true);
        finished();
      } catch (e) {
        toast(e.message);
        if (e.status === 409) closed(form, root);
        else if (b) { b.disabled = false; b.textContent = "Submit"; }
      } finally { sending = false; }
    }

    function finished(already, wasPreview) {
      shell(el("div", { class: "done-card r-step" },
        el("div", { class: "check", html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${ICONS.check}</svg>` }),
        el("h1", {}, already ? "You've already answered" : "Thank you!"),
        el("p", {}, already ? "Your response to this form was already sent from this device." : wasPreview ? "This was a preview, so nothing was sent." : form.thankYou || "Your response has been sent."),
        el("div", { class: "row", style: "justify-content:center" },
          wasPreview && onExit ? el("button", { class: "btn primary", onclick: onExit }, "Close preview") : null,
          !already && !form.oneResponsePerDevice && !wasPreview ? el("button", { class: "btn", onclick: () => { answers = {}; cover(); } }, "Send another response") : null)), { progress: 100 });
    }

    document.addEventListener("keydown", function onKey(e) {
      if (!root.isConnected) { document.removeEventListener("keydown", onKey); return; }
      if (step < 0 || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target, typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName);
      if (e.key === "Enter" && !typing && t.tagName !== "BUTTON") { e.preventDefault(); next(); return; }
      if (!typing && /^[a-z]$/i.test(e.key)) {
        const opts = root.querySelectorAll(".r-body .opt"); const i = e.key.toUpperCase().charCodeAt(0) - 65;
        if (opts[i]) { e.preventDefault(); opts[i].click(); }
      }
    });
    cover();
  }

  function closed(info, root) {
    root.style.setProperty("--accent", info.theme || "#4C5FD5");
    root.replaceChildren(el("div", { class: "r-shell" }, el("div"), el("main", { class: "r-main wrap narrow" }, el("div", { class: "done-card r-step" },
      el("div", { class: "check", style: "background:var(--muted)", html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="stroke-dashoffset:0">${ICONS.lock}</svg>` }),
      el("h1", {}, "This form is closed"),
      el("p", {}, info.closedMessage || `"${info.title}" is no longer accepting responses. Thank you for your interest.`))), el("div", { class: "r-brand" }, "Made with Forms")));
  }

  async function respondent(id) {
    const root = $("#app");
    root.replaceChildren(el("div", { class: "loading" }, el("div", { class: "spin" }), "Loading…"));
    try {
      const r = await api("form", { query: { id } });
      document.title = r.title || (r.data && r.data.title) || "Form";
      if (r.closed) return closed(r, root);
      runForm(root, tidy(r.data), { id });
    } catch (e) {
      root.replaceChildren(el("div", { class: "r-shell" }, el("div"), el("main", { class: "r-main wrap narrow" }, el("div", { class: "done-card" },
        el("h1", {}, e.status === 404 ? "Form not found" : "Can't load the form"), el("p", {}, e.status === 404 ? "Please check the link you were given." : e.message),
        e.status === 404 ? null : el("button", { class: "btn primary", onclick: () => respondent(id) }, "Try again"))), el("div")));
    }
  }

  /* ================= analysis ================= */
  const STOP = new Set("the a an and or but of to in on at for with is are was were be been it this that i you we they he she my our your me us them as by from not no yes do does did so if more most very can could would should will just about also than then there their have has had what which who when where how all any some other into out up over too only own same such its it's i'm don't".split(" "));
  function analyze(q, responses) {
    const got = responses.filter(r => !isEmpty(q, r.answers)), n = got.length;
    const res = { q, answered: n, total: responses.length };
    const pct = c => n ? Math.round((c / n) * 1000) / 10 : 0;
    const otherTexts = () => q.other ? got.filter(r => [].concat(r.answers[q.id]).includes(q.other) && r.answers[q.id + "__other"]).map(r => ({ text: r.answers[q.id + "__other"], r })) : [];
    if (CHOICE.has(q.type) || q.type === "multiple") {
      const opts = q.type === "yesno" ? ["Yes", "No"] : q.options.concat(q.other ? [q.other] : []);
      const counts = new Map(opts.map(o => [o, 0]));
      for (const r of got) for (const v of [].concat(r.answers[q.id])) counts.set(v, (counts.get(v) || 0) + 1);
      res.items = [...counts].map(([label, count]) => ({ label, count, pct: pct(count) })).sort((a, b) => b.count - a.count || opts.indexOf(a.label) - opts.indexOf(b.label));
      res.kind = q.type === "multiple" ? "bars" : "donut"; res.others = otherTexts();
    } else if (q.type === "ranking") {
      const k = q.options.length;
      res.items = q.options.map(o => {
        let pts = 0, sum = 0, cnt = 0, first = 0;
        for (const r of got) { const i = r.answers[q.id].indexOf(o); if (i >= 0) { pts += k - i; sum += i + 1; cnt++; if (i === 0) first++; } }
        return { label: o, points: pts, avg: cnt ? sum / cnt : null, ranked: cnt, first };
      }).sort((a, b) => b.points - a.points);
      const top = Math.max(1, ...res.items.map(x => x.points)); res.items.forEach(x => x.pct = Math.round(x.points / top * 100));
      res.kind = "ranking";
    } else if (q.type === "scale" || q.type === "rating") {
      const lo = q.type === "rating" ? 1 : q.min, hi = q.max, vals = got.map(r => +r.answers[q.id]);
      res.items = []; for (let v = lo; v <= hi; v++) { const c = vals.filter(x => x === v).length; res.items.push({ label: String(v), value: v, count: c, pct: pct(c) }); }
      res.avg = n ? vals.reduce((a, b) => a + b, 0) / n : null; res.kind = "columns";
    } else if (q.type === "matrix") {
      res.rows = q.rows.map(row => {
        const rs = got.filter(r => r.answers[q.id][row]), m = rs.length;
        return { row, n: m, cells: q.columns.map(c => { const cnt = rs.filter(r => r.answers[q.id][row] === c).length; return { label: c, count: cnt, pct: m ? Math.round(cnt / m * 1000) / 10 : 0 }; }) };
      });
      res.kind = "matrix";
    } else if (q.type === "number") {
      const vals = got.map(r => +r.answers[q.id]).filter(Number.isFinite).sort((a, b) => a - b);
      res.stats = vals.length ? { avg: vals.reduce((a, b) => a + b, 0) / vals.length, min: vals[0], max: vals[vals.length - 1], median: vals[Math.floor(vals.length / 2)] } : null;
      res.texts = got.slice().reverse().map(r => ({ text: String(r.answers[q.id]), r })); res.kind = "text";
    } else if (q.type !== "info") {
      res.texts = got.slice().reverse().map(r => ({ text: String(r.answers[q.id]), r }));
      if (q.type === "long" || q.type === "short") {
        const freq = new Map();
        for (const t of res.texts) for (const w of new Set(fold(t.text).match(/[a-z0-9']{3,}/g) || [])) if (!STOP.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
        res.words = [...freq].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 12);
      }
      res.kind = "text";
    }
    return res;
  }

  const fmtNum = x => x == null ? "–" : (Math.round(x * 10) / 10).toLocaleString();
  // donut as an SVG string (numbers and colours only), used on screen and in the PDF
  function donutSvg(items, { size = 200, text = "currentColor", sub = "#9A9DAB", track = "rgba(127,127,127,.15)" } = {}) {
    const total = items.reduce((t, x) => t + x.count, 0);
    let off = 25, segs = "";
    items.forEach((x, i) => {
      if (!x.count) return;
      const len = (x.count / total) * 100, gap = items.filter(y => y.count).length > 1 ? .6 : 0;
      segs += `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${x.color || PALETTE[i % PALETTE.length]}" stroke-width="6.2" stroke-dasharray="${Math.max(0, len - gap)} ${100 - Math.max(0, len - gap)}" stroke-dashoffset="${off}"/>`;
      off -= len;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42" width="${size}" height="${size}"><circle cx="21" cy="21" r="15.915" fill="none" stroke="${track}" stroke-width="6.2"/>${segs}<text x="21" y="21.3" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="8.5" font-weight="800" fill="${text}">${total}</text><text x="21" y="27" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="3.2" font-weight="700" fill="${sub}">${total === 1 ? "ANSWER" : "ANSWERS"}</text></svg>`;
  }

  /* ================= admin ================= */
  const A = { forms: [], cur: null, tab: "summary", filter: null, search: "", timer: null };
  const root = () => $("#app");

  async function adminBoot() {
    document.title = "Forms";
    root().replaceChildren(el("div", { class: "loading" }, el("div", { class: "spin" })));
    let st;
    try { st = await api("status"); }
    catch (e) { root().replaceChildren(el("div", { class: "auth" }, el("div", { class: "card" }, el("h1", {}, "Can't connect"), el("p", { class: "muted" }, e.message), el("button", { class: "btn primary", onclick: adminBoot }, "Try again")))); return; }
    if (!st.admin) return authScreen(st.setup);
    window.onhashchange = adminRoute; adminRoute();
  }

  function authScreen(isSetup) {
    const pw = el("input", { class: "input", type: "password", autocomplete: isSetup ? "current-password" : "new-password", placeholder: "Password", "aria-label": "Password" });
    const pw2 = isSetup ? null : el("input", { class: "input", type: "password", autocomplete: "new-password", placeholder: "Type it again", "aria-label": "Repeat password" });
    const err = el("div", { class: "r-err", role: "alert" });
    const btn = el("button", { class: "btn primary big block", type: "submit" }, isSetup ? "Sign in" : "Create password");
    const formEl = el("form", { class: "card", onsubmit: async e => {
      e.preventDefault(); err.textContent = "";
      if (!isSetup && pw.value !== pw2.value) { err.textContent = "The two passwords are different."; return; }
      btn.disabled = true;
      try { const r = await api(isSetup ? "login" : "setup", { method: "POST", body: { password: pw.value } }); store.set(TOKEN_KEY, r.token); adminBoot(); }
      catch (x) { err.textContent = x.message; btn.disabled = false; pw.select(); }
    } },
      el("img", { src: "/forms/favicon.svg", alt: "", width: 48, height: 48 }),
      el("h1", {}, isSetup ? "Welcome back" : "Set up Forms"),
      el("p", { class: "muted", style: "margin:0" }, isSetup ? "Sign in to see your forms and answers." : "Choose a password. You'll use it to see your forms and answers on any device. People filling in your forms never need it."),
      pw, pw2, err, btn);
    root().replaceChildren(el("div", { class: "auth" }, formEl));
    setTimeout(() => pw.focus(), 50);
  }

  function topBar({ back, title, sub, actions = [] }) {
    const bar = el("header", { class: "a-top" }, el("div", { class: "wrap" },
      back ? el("button", { class: "btn icon ghost", "aria-label": "Back", onclick: back }, icon("back")) : el("button", { class: "brand", onclick: () => { location.hash = "#/"; } }, el("img", { src: "/forms/favicon.svg", alt: "" }), "Forms"),
      back ? el("div", { class: "a-title" }, el("h1", {}, title), sub ? el("small", {}, sub) : null) : el("span", { class: "spacer" }),
      actions));
    return bar;
  }
  const onScroll = () => { const t = $(".a-top"); if (t) t.classList.toggle("scrolled", scrollY > 4); };
  addEventListener("scroll", onScroll, { passive: true });

  function adminRoute() {
    clearInterval(A.timer);
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "new") return editorPage(null);
    if (h[0] === "f" && h[1]) return formPage(h[1], h[2] || "summary");
    return dashboard();
  }
  function handleAuthError(e) { if (e.status === 401) { store.del(TOKEN_KEY); authScreen(true); return true; } return false; }

  function menuButton(items) {
    const wrapEl = el("div", { style: "position:relative" });
    const btn = el("button", { class: "btn icon ghost", "aria-label": "More", "aria-haspopup": "menu", onclick: e => {
      e.stopPropagation(); const open = wrapEl.querySelector(".menu"); if (open) { open.remove(); return; }
      const m = el("div", { class: "menu", role: "menu" }, items.map(([label, fn, danger]) => el("button", { role: "menuitem", style: danger ? "color:var(--bad)" : "", onclick: () => { m.remove(); fn(); } }, label)));
      wrapEl.append(m); setTimeout(() => document.addEventListener("click", () => m.remove(), { once: true }), 0);
    } }, icon("more"));
    wrapEl.append(btn); return wrapEl;
  }

  async function dashboard() {
    document.title = "Forms";
    const top = topBar({ actions: [menuButton([["Change password", changePassword], ["Sign out", signOut]])] });
    const main = el("main", { class: "a-main wrap" }, el("div", { class: "loading" }, el("div", { class: "spin" })));
    root().replaceChildren(top, main);
    try { A.forms = (await api("list")).forms; } catch (e) { if (handleAuthError(e)) return; main.replaceChildren(el("div", { class: "empty" }, el("b", {}, e.message), el("button", { class: "btn", onclick: dashboard }, "Try again"))); return; }
    const total = A.forms.reduce((t, f) => t + (f.responses || 0), 0);
    main.replaceChildren(
      el("div", { class: "hello" }, el("h2", {}, "Your forms"), el("span", { class: "muted" }, A.forms.length ? `${plural(A.forms.length, "form")} · ${plural(total, "response")} in total` : "Create a form, share the link, watch the answers come in.")),
      A.forms.length ? el("div", { class: "f-list" }, A.forms.map(formCard)) :
        el("div", { class: "empty" }, el("span", { html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS.form}</svg>` }),
          el("h3", {}, "No forms yet"), el("p", { class: "muted", style: "margin:0;max-width:40ch" }, "Paste your questions as JSON, or start from the HAKID questionnaire and change it."),
          el("div", { class: "row", style: "justify-content:center" }, el("button", { class: "btn primary", onclick: () => { A.prefill = EXAMPLE; location.hash = "#/new"; } }, icon("sparkle"), "Start from HAKID example"), el("button", { class: "btn", onclick: () => { location.hash = "#/new"; } }, "Blank form"))));
    root().append(el("button", { class: "btn primary big fab", onclick: () => { location.hash = "#/new"; } }, icon("plus"), "New form"));
  }
  function formCard(f) {
    const open = () => { location.hash = `#/f/${f.id}/summary`; };
    return el("article", { class: "f-card", tabindex: 0, role: "link", "aria-label": f.data.title, onclick: open, onkeydown: e => { if (e.key === "Enter") open(); } },
      f.data.image ? el("img", { class: "f-thumb", src: f.data.image, alt: "", loading: "lazy", onerror: e => e.currentTarget.remove() }) : null,
      el("div", { class: "row" }, el("span", { class: "status" + (f.status === "open" ? "" : " closed") }, f.status === "open" ? "Open" : "Closed"), el("span", { class: "spacer" }),
        el("button", { class: "btn icon ghost", "aria-label": "Copy link", onclick: e => { e.stopPropagation(); copy(formUrl(f.id), "Link copied"); } }, icon("link"))),
      el("div", { class: "t" }, f.data.title),
      el("div", { class: "stats" }, el("div", { class: "n" }, String(f.responses || 0), el("small", {}, f.responses === 1 ? "response" : "responses")), el("span", { class: "spacer" }),
        el("span", { class: "muted", style: "font-size:13px;font-weight:600" }, f.lastResponse ? "Last " + rel(f.lastResponse) : "No answers yet")));
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg || "Copied"); }
    catch (e) { prompt("Copy this:", text); }
  }
  function signOut() { api("logout", { method: "POST" }).catch(() => {}); store.del(TOKEN_KEY); authScreen(true); }
  function changePassword() {
    const pw = el("input", { class: "input", type: "password", placeholder: "New password", autocomplete: "new-password" });
    const s = sheet("Change password", el("div", { class: "stack" }, el("p", { class: "muted", style: "margin:0" }, "Other devices will be signed out."), pw),
      [el("button", { class: "btn primary", onclick: async () => {
        try { const r = await api("password", { method: "POST", body: { password: pw.value } }); store.set(TOKEN_KEY, r.token); s.close(); toast("Password changed"); }
        catch (e) { toast(e.message); }
      } }, "Save")]);
    setTimeout(() => pw.focus(), 50);
  }

  function sheet(title, content, foot = [], { onClose } = {}) {
    const prev = document.activeElement;
    const close = () => { scrim.remove(); document.removeEventListener("keydown", esc); document.body.style.overflow = ""; if (onClose) onClose(); if (prev && prev.focus) prev.focus({ preventScroll: true }); };
    const esc = e => { if (e.key === "Escape") close(); };
    const sh = el("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title },
      el("div", { class: "grab" }),
      el("div", { class: "sh-head" }, el("h3", {}, title), el("button", { class: "btn icon ghost", "aria-label": "Close", onclick: () => close() }, icon("x"))),
      el("div", { class: "sh-body" }, content),
      foot.length ? el("div", { class: "sh-foot" }, foot) : el("div"));
    const scrim = el("div", { class: "scrim", onclick: e => { if (e.target === scrim) close(); } }, sh);
    document.body.append(scrim); document.body.style.overflow = "hidden"; document.addEventListener("keydown", esc);
    setTimeout(() => { const b = sh.querySelector(".sh-head .btn"); if (b) b.focus({ preventScroll: true }); }, 30);
    return { close, el: sh, body: sh.querySelector(".sh-body"), head: sh.querySelector(".sh-head h3") };
  }
  function confirmSheet(title, text, okLabel, fn) {
    const s = sheet(title, el("p", { style: "margin:0" }, text), [el("button", { class: "btn", onclick: () => s.close() }, "Cancel"), el("span", { class: "spacer" }), el("button", { class: "btn danger solid", onclick: async () => { s.close(); await fn(); } }, okLabel)]);
  }

  /* ---------- editor ---------- */
  function editorPage(existing) {
    const isNew = !existing;
    const start = isNew ? (A.prefill ? JSON.stringify(A.prefill, null, 2) : "") : JSON.stringify(existing.data, null, 2);
    A.prefill = null;
    const ta = el("textarea", { class: "input code", spellcheck: "false", autocapitalize: "off", autocomplete: "off", "aria-label": "Form JSON", placeholder: '{\n  "title": "My form",\n  "questions": [\n    { "type": "short", "title": "Your name" }\n  ]\n}' }, start);
    const status = el("div", { class: "ed-status", "aria-live": "polite" });
    let parsed = null;
    const check = () => {
      parsed = null; status.className = "ed-status"; status.replaceChildren();
      if (!ta.value.trim()) { status.textContent = "Paste your form JSON, fill in the example, or copy the AI prompt."; saveBtn.disabled = prevBtn.disabled = true; return; }
      try {
        const r = normalizeForm(parseLoose(ta.value)); parsed = r.form;
        status.classList.add("ok");
        add(status, `✓ Ready: "${r.form.title}", ${plural(r.count, "question")} in ${plural(r.form.sections.length, "section")}.`, r.warnings.length ? el("ul", {}, r.warnings.map(w => el("li", {}, w))) : null);
      } catch (e) {
        status.classList.add("bad");
        const list = [].concat(e);
        add(status, list.length > 1 ? "Fix these first:" : "", list.length > 1 ? el("ul", {}, list.map(w => el("li", {}, w))) : list[0]);
      }
      saveBtn.disabled = prevBtn.disabled = !parsed;
    };
    const prevBtn = el("button", { class: "btn", onclick: () => parsed && preview(parsed) }, icon("eye"), "Preview");
    const saveBtn = el("button", { class: "btn primary", onclick: async () => {
      if (!parsed) return; saveBtn.disabled = true;
      try {
        const r = await api("save", { method: "POST", body: { id: existing ? existing.id : undefined, data: parsed } });
        toast(isNew ? "Form created" : "Saved");
        if (isNew) location.hash = `#/f/${r.id}/share`; else { A.cur.form.data = parsed; location.hash = `#/f/${existing.id}/summary`; }
      } catch (e) { if (!handleAuthError(e)) toast(e.message); saveBtn.disabled = false; }
    } }, icon("check"), isNew ? "Create form" : "Save changes");
    ta.addEventListener("input", debounce(check, 250));
    ta.addEventListener("keydown", e => { if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("  ", s, ta.selectionEnd, "end"); } });
    const tools = el("div", { class: "row" },
      el("button", { class: "btn", onclick: () => copy(AI_PROMPT, "Prompt copied. Paste it into ChatGPT with your questionnaire.") }, icon("sparkle"), "Copy AI prompt"),
      el("button", { class: "btn", onclick: () => pickImage(url => {
        let o; try { o = parseLoose(ta.value); } catch (e) { toast("Fix the JSON first, then add the image"); return; }
        if (!o || typeof o !== "object" || Array.isArray(o)) { toast("Fix the JSON first, then add the image"); return; }
        const { title, description, ...rest } = o;
        ta.value = JSON.stringify({ title, description, image: url, ...rest, image: url }, null, 2); check(); toast("Header image added");
      }) }, icon("image"), "Add header image"),
      el("button", { class: "btn", onclick: () => { ta.value = JSON.stringify(EXAMPLE, null, 2); check(); } }, "Fill example"),
      el("button", { class: "btn", onclick: () => { try { ta.value = JSON.stringify(parseLoose(ta.value), null, 2); check(); } catch (e) { toast("Fix the JSON first"); } } }, "Tidy"));
    const help = el("details", { class: "help-box card" }, el("summary", {}, "How do I write a form?"),
      el("p", {}, "Give a title and a list of questions. Each question has a type and a title. Everything else is optional."),
      el("table", {}, el("tbody", {}, [["short / long", "Text answer, one line or a paragraph"], ["email / phone / number / date", "Checked answers"], ["single", 'Pick one. "options": [...], add "other": "Other" for a write-in'], ["multiple", 'Pick any (at least one). "max": 3 to limit, "optional": true to allow skipping'], ["dropdown", "Pick one from a long list (has search)"], ["yesno", "Yes or No"], ["scale", '"min": 1, "max": 5, "minLabel", "maxLabel"'], ["rating", 'Stars, "max": 5'], ["ranking", "Put options in order"], ["matrix", '"rows" and "columns" grid'], ["info", "Just text, no answer"]].map(([a, b]) => el("tr", {}, el("td", {}, el("code", {}, a)), el("td", {}, b))))),
      el("p", {}, 'Pictures: "image": "https://..." on the form shows a header picture (or press Add header image). "image" on a question shows a picture under it.'),
      el("p", {}, 'Form options: "description", "theme" (a colour like "#4C5FD5"), "thankYou", "anonymous": true, "oneResponsePerDevice": true, "closesAt": "2026-12-31", "slug" (the link name). Use "sections" to group questions.'),
      el("pre", {}, '{\n  "title": "Club survey",\n  "questions": [\n    { "type": "short", "title": "Your name", "required": true },\n    { "type": "single", "title": "Favourite day?",\n      "options": ["Saturday", "Sunday"], "other": "Other" },\n    { "type": "scale", "title": "How happy are you?",\n      "min": 1, "max": 5 }\n  ]\n}'));
    const top = topBar({ back: () => { if (existing) location.hash = `#/f/${existing.id}/summary`; else location.hash = "#/"; }, title: isNew ? "New form" : "Edit form", sub: isNew ? "Paste JSON to build your form" : existing.data.title });
    const content = el("div", { class: "stack" },
      isNew ? null : el("div", { class: "ed-status" }, A.cur && A.cur.responses.length ? `${plural(A.cur.responses.length, "person has", "people have")} answered. If you rename a question or option, their old answers keep the old name. Keep each "id" the same so answers stay matched.` : "Keep each question's \"id\" the same when you edit, so answers stay matched."),
      tools, ta, status, el("div", { class: "row" }, prevBtn, el("span", { class: "spacer" }), saveBtn), help,
      existing ? el("div", { class: "card stack" }, el("b", {}, "More"), el("div", { class: "row" },
        el("button", { class: "btn", onclick: async () => { try { const r = await api("save", { method: "POST", body: { data: { ...existing.data, slug: undefined, title: existing.data.title + " (copy)" } } }); toast("Copy made"); location.hash = `#/f/${r.id}/summary`; } catch (e) { toast(e.message); } } }, icon("copy"), "Duplicate"),
        el("button", { class: "btn danger", onclick: () => confirmSheet("Delete this form?", `"${existing.data.title}" and all ${plural(A.cur ? A.cur.responses.length : 0, "response")} will be deleted for good.`, "Delete form", async () => { try { await api("delete", { method: "POST", body: { id: existing.id } }); toast("Form deleted"); location.hash = "#/"; } catch (e) { toast(e.message); } }) }, icon("trash"), "Delete form"))) : null);
    if (existing) return { content, check };
    root().replaceChildren(top, el("main", { class: "a-main wrap narrow" }, content));
    check();
  }
  // choose a photo, shrink it on the phone, upload it, hand back its link
  function pickImage(done) {
    const inp = el("input", { type: "file", accept: "image/*", style: "display:none" });
    inp.onchange = async () => {
      const file = inp.files && inp.files[0]; inp.remove(); if (!file) return;
      toast("Uploading image…");
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fail(new Error("That file isn't an image we can read.")); i.src = url; });
        const scale = Math.min(1, 1600 / img.naturalWidth), c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
        const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        const data = c.toDataURL("image/jpeg", .85);
        const r = await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "form-" + Date.now() + ".jpg", contentType: "image/jpeg", data }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.url) throw new Error("The upload didn't work. Try a smaller image.");
        done(j.url);
      } catch (e) { toast(e.message); }
    };
    document.body.append(inp); inp.click();
  }
  function preview(form) {
    const holder = el("div");
    const frame = el("div", { class: "preview-frame" }, el("div", { class: "preview-bar" }, icon("eye"), "Preview", el("span", { class: "spacer" }), el("button", { class: "btn", onclick: () => close() }, "Close")), holder);
    const close = () => { frame.remove(); document.body.style.overflow = ""; };
    document.body.append(frame); document.body.style.overflow = "hidden";
    runForm(holder, form, { id: "preview", preview: true, onExit: close });
  }

  /* ---------- one form ---------- */
  async function formPage(id, tab) {
    A.tab = tab;
    const loadingMain = el("main", { class: "a-main wrap" }, el("div", { class: "loading" }, el("div", { class: "spin" })));
    if (!A.cur || A.cur.form.id !== id) { A.filter = null; A.search = ""; root().replaceChildren(topBar({ back: () => { location.hash = "#/"; }, title: "Loading…" }), loadingMain); await loadForm(id); if (!A.cur) return; }
    else if (["summary", "responses"].includes(tab) && Date.now() - (A.loadedAt || 0) > 4000) loadForm(id, true).then(() => { if (A.cur && A.cur.form.id === id && A.tab === tab && !$(".scrim")) renderForm(); });
    renderForm();
    A.timer = setInterval(async () => {
      if (document.hidden || $(".scrim") || $(".preview-frame") || !["summary", "responses"].includes(A.tab)) return;
      const before = A.cur.responses.length; await loadForm(id, true);
      if (A.cur && A.cur.responses.length !== before) { renderForm(); toast(`${plural(A.cur.responses.length - before, "new response")}`); }
    }, 30000);
  }
  async function loadForm(id, quiet) {
    try { const r = await api("responses", { query: { id } }); A.cur = r; r.form.data = tidy(r.form.data); A.loadedAt = Date.now(); document.title = r.form.data.title + " · Forms"; }
    catch (e) { if (handleAuthError(e)) return; if (!quiet) { toast(e.message); A.cur = null; location.hash = "#/"; } }
  }
  function renderForm() {
    const { form, responses } = A.cur, f = form.data;
    const tabs = [["summary", "Summary"], ["responses", "Responses", responses.length], ["share", "Share"], ["edit", "Edit"]];
    const top = topBar({ back: () => { location.hash = "#/"; }, title: f.title, sub: (form.status === "open" ? "Open" : "Closed") + " · " + plural(responses.length, "response"),
      actions: [el("button", { class: "btn icon ghost", "aria-label": "Refresh", onclick: async () => { await loadForm(form.id); renderForm(); toast("Up to date"); } }, icon("refresh")),
        el("button", { class: "btn icon ghost", "aria-label": "Share", onclick: () => { location.hash = `#/f/${form.id}/share`; } }, icon("share"))] });
    const seg = el("div", { class: "tabs" }, el("div", { class: "seg", role: "tablist" }, tabs.map(([k, label, n]) => el("button", { role: "tab", "aria-selected": A.tab === k ? "true" : "false", class: A.tab === k ? "on" : "", onclick: () => { location.hash = `#/f/${form.id}/${k}`; } }, label, n ? el("span", { class: "hide-sm" }, " " + n) : null))));
    const main = el("main", { class: "a-main wrap" + (A.tab === "edit" || A.tab === "share" ? " narrow" : "") });
    root().replaceChildren(top, el("div", { class: "wrap" + (A.tab === "edit" || A.tab === "share" ? " narrow" : "") }, seg), main);
    if (A.tab === "responses") responsesTab(main);
    else if (A.tab === "share") shareTab(main);
    else if (A.tab === "edit") { const r = editorPage(form); main.append(r.content); r.check(); }
    else summaryTab(main);
    onScroll();
  }

  function kpis(responses) {
    const now = Date.now(), day = 864e5, today = new Date(); today.setHours(0, 0, 0, 0);
    return el("div", { class: "kpis" },
      el("div", { class: "kpi" }, el("b", {}, String(responses.length)), el("span", {}, "Responses")),
      el("div", { class: "kpi" }, el("b", {}, String(responses.filter(r => r.createdAt >= today.getTime()).length)), el("span", {}, "Today")),
      el("div", { class: "kpi" }, el("b", {}, String(responses.filter(r => r.createdAt >= now - 7 * day).length)), el("span", {}, "Last 7 days")));
  }
  function timeline(responses) {
    const days = 14, start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
    const counts = Array(days).fill(0);
    for (const r of responses) { const i = Math.floor((r.createdAt - start.getTime()) / 864e5); if (i >= 0 && i < days) counts[i]++; }
    const max = Math.max(1, ...counts);
    const fmtD = d => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    return el("div", { class: "card" }, el("div", { class: "row", style: "margin-bottom:12px" }, el("b", {}, "Last 14 days"), el("span", { class: "spacer" }), el("span", { class: "muted", style: "font-size:13px;font-weight:600" }, plural(counts.reduce((a, b) => a + b, 0), "response"))),
      el("div", { class: "timeline", role: "img", "aria-label": "Responses per day over the last 14 days" }, counts.map((c, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return el("i", { class: c ? "" : "zero", style: `height:${c ? Math.max(8, c / max * 100) : 3}%`, title: `${fmtD(d)}: ${c}` }); })),
      el("div", { class: "row", style: "justify-content:space-between;font-size:12px;color:var(--muted);font-weight:600;margin-top:6px" }, el("span", {}, fmtD(start)), el("span", {}, "Today")));
  }

  function summaryTab(main) {
    const { form, responses } = A.cur, f = form.data, qs = answerable(f);
    if (!responses.length) {
      main.append(el("div", { class: "stack" }, kpis(responses), el("div", { class: "empty" }, el("span", { html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS.share}</svg>` }),
        el("h3", {}, "No responses yet"), el("p", { class: "muted", style: "margin:0;max-width:40ch" }, "Share the link or the QR code. Charts and rankings appear here as soon as people answer."),
        el("div", { class: "row", style: "justify-content:center" }, el("button", { class: "btn primary", onclick: () => { location.hash = `#/f/${form.id}/share`; } }, icon("share"), "Share the form"), el("button", { class: "btn", onclick: () => preview(f) }, icon("eye"), "Preview")))));
      return;
    }
    const exportCard = el("div", { class: "card row" }, el("div", { style: "flex:1;min-width:180px" }, el("b", {}, "Download"), el("div", { class: "muted", style: "font-size:14px" }, "All answers in Excel, or this summary as a PDF report.")),
      el("button", { class: "btn", onclick: e => run(e.currentTarget, () => exportExcel(A.cur)) }, icon("download"), "Excel"),
      el("button", { class: "btn primary", onclick: e => run(e.currentTarget, () => exportPdf(A.cur)) }, icon("file"), "PDF report"));
    let qn = 0;
    main.append(el("div", { class: "stack" }, kpis(responses), timeline(responses), exportCard, qs.map(q => questionCard(q, ++qn, responses))));
    requestAnimationFrame(() => requestAnimationFrame(() => main.querySelectorAll("[data-w]").forEach(x => { x.style.width = x.dataset.w; })));
    requestAnimationFrame(() => requestAnimationFrame(() => main.querySelectorAll("[data-h]").forEach(x => { x.style.height = x.dataset.h; })));
  }
  async function run(btn, fn) {
    const html = [...btn.childNodes]; btn.disabled = true; btn.replaceChildren(el("span", { class: "spin", style: "width:18px;height:18px;border-width:2px" }), "Preparing…");
    try { await fn(); } catch (e) { console.error(e); toast(e.message && /load/.test(e.message) ? "Couldn't download the tools. Check your internet." : "Something went wrong: " + e.message); }
    finally { btn.disabled = false; btn.replaceChildren(...html); }
  }
  const showFilter = (q, value) => { A.filter = { q: q.id, value }; A.search = ""; location.hash = `#/f/${A.cur.form.id}/responses`; };

  function barRow(x, i, q, { badge = false, value, color } = {}) {
    const clickable = q && x.count > 0;
    const c = color || (badge ? PALETTE[0] : PALETTE[i % PALETTE.length]);
    return el(clickable ? "button" : "div", { class: "bar-row", type: clickable ? "button" : null, onclick: clickable ? () => showFilter(q, x.filterValue ?? x.label) : null, title: clickable ? "See who chose this" : null },
      el("div", { class: "top" }, el("span", { class: "lbl" }, badge ? el("span", { class: "rank-badge" + (i === 0 && x.count ? " gold" : i === 1 && x.count ? " silver" : i === 2 && x.count ? " bronze" : "") }, String(i + 1)) : el("i", { style: `background:${c}` }), x.label),
        el("span", { class: "v" }, value ?? String(x.count), el("small", {}, `${fmtNum(x.pct)}%`))),
      el("div", { class: "track" }, el("i", { style: `--c:${c}`, "data-w": `${x.pct}%` })));
  }
  function questionCard(q, n, responses) {
    const a = analyze(q, responses);
    const head = [el("h3", {}, el("span", { class: "q-num" }, n + "."), q.title),
      el("div", { class: "q-meta" }, el("span", { class: "tag" }, TYPE_NAMES[q.type]), `${a.answered} of ${a.total} answered`, q.type === "multiple" && a.answered ? `· ${fmtNum(a.items.reduce((t, x) => t + x.count, 0) / a.answered)} choices each` : null)];
    let bodyEl;
    if (!a.answered) bodyEl = el("p", { class: "muted", style: "margin:0" }, "No answers yet.");
    else if (a.kind === "donut") {
      const items = a.items.map((x, i) => ({ ...x, color: PALETTE[i % PALETTE.length] }));
      bodyEl = el("div", { class: "donut-wrap" }, el("div", { html: donutSvg(items, { size: 180 }), role: "img", "aria-label": items.map(x => `${x.label}: ${x.count}`).join(", ") }),
        el("div", { class: "bars" }, items.map((x, i) => barRow(x, i, q, { color: x.color }))));
    } else if (a.kind === "bars") {
      bodyEl = el("div", { class: "bars" }, a.items.map((x, i) => barRow(x, i, q, { badge: true })));
    } else if (a.kind === "ranking") {
      bodyEl = el("div", { class: "stack" }, el("p", { class: "muted", style: "margin:0;font-size:14px" }, "Ranked by points: 1st place gets the most points. Tap an option to see who put it first."),
        el("div", { class: "bars" }, a.items.map((x, i) => barRow({ ...x, count: x.first, filterValue: x.label }, i, x.first ? q : null, { badge: true, value: `avg #${fmtNum(x.avg)}` }))));
      bodyEl.querySelectorAll(".bar-row .v small").forEach((s, i) => { s.textContent = `${a.items[i].first} × #1`; });
    } else if (a.kind === "columns") {
      const max = Math.max(1, ...a.items.map(x => x.count));
      bodyEl = el("div", {}, el("div", { class: "big-stat" }, el("b", {}, fmtNum(a.avg)), el("span", { class: "muted" }, `average out of ${q.max}`)),
        el("div", { class: "cols", role: "img", "aria-label": a.items.map(x => `${x.label}: ${x.count}`).join(", ") }, a.items.map(x => el("button", { class: "col", type: "button", style: "background:none;border:0;padding:0", disabled: !x.count, onclick: () => showFilter(q, x.value), title: "See who chose this" },
          el("span", { class: "cv" }, x.count ? String(x.count) : ""), el("div", { class: "h", "data-h": `${x.count / max * 100}%`, style: `height:0;opacity:${x.count ? 1 : .25}` }), el("small", {}, q.type === "rating" ? x.label + "★" : x.label)))),
        q.minLabel || q.maxLabel ? el("div", { class: "scale-labels", style: "margin-top:8px" }, el("span", {}, q.minLabel || ""), el("span", {}, q.maxLabel || "")) : null);
    } else if (a.kind === "matrix") {
      bodyEl = el("div", {}, el("div", { class: "stacked" }, a.rows.map(r => el("div", { class: "sr" }, el("div", { class: "lbl" }, r.row, el("span", { class: "muted", style: "font-weight:600;font-size:13px" }, r.n ? ` · most: ${r.cells.slice().sort((x, y) => y.count - x.count)[0].label}` : "")),
        el("div", { class: "track", role: "img", "aria-label": r.cells.map(c => `${c.label}: ${c.count}`).join(", ") }, r.cells.map((c, i) => c.count ? el("i", { style: `width:${c.pct}%;background:${PALETTE[i % PALETTE.length]}`, title: `${c.label}: ${c.count} (${fmtNum(c.pct)}%)` }) : null))))),
        el("div", { class: "legend" }, q.columns.map((c, i) => el("span", {}, el("i", { style: `background:${PALETTE[i % PALETTE.length]}` }), c))));
    } else if (a.kind === "text") {
      bodyEl = el("div", {}, a.stats ? el("div", { class: "kpis", style: "margin-bottom:12px" }, ["avg", "min", "max"].map(k => el("div", { class: "kpi" }, el("b", {}, fmtNum(a.stats[k])), el("span", {}, { avg: "Average", min: "Lowest", max: "Highest" }[k])))) : null,
        a.words && a.words.length ? el("div", {}, el("div", { class: "muted", style: "font-size:13px;font-weight:700;margin-bottom:6px" }, "Words people use most"), el("div", { class: "words" }, a.words.map(([w, c]) => el("span", {}, w, el("b", {}, String(c)))))) : null,
        textList(a.texts));
    }
    const others = a.others && a.others.length ? el("details", { class: "others" }, el("summary", {}, `${plural(a.others.length, "written answer")} for "${q.other}"`), el("div", { style: "margin-top:10px" }, textList(a.others))) : null;
    return el("section", { class: "card q-card" }, head, bodyEl, others);
  }
  function textList(items) {
    const nums = new Map(A.cur.responses.map((r, i) => [r.id, i + 1]));
    return el("div", { class: "texts" }, items.map(t => el("button", { class: "t", style: "text-align:left;cursor:pointer;font:inherit", type: "button", onclick: () => openResponse(t.r.id) }, t.text, el("small", {}, `#${nums.get(t.r.id)} · ${rel(t.r.createdAt)}`))));
  }

  /* ---------- responses ---------- */
  function respName(f, r, n) {
    const qs = answerable(f);
    const nameQ = qs.find(q => q.type === "short" && /name|isim|\bad\b|soyad/i.test(q.id + " " + q.title)) || qs.find(q => q.type === "email");
    const v = nameQ && r.answers[nameQ.id];
    return v ? String(v) : `Response #${n}`;
  }
  function respPreview(f, r) {
    return answerable(f).map(q => fmt(q, r.answers)).filter(Boolean).slice(0, 2).join(" · ") || "No answers";
  }
  function matchesFilter(r) {
    if (!A.filter) return true;
    const q = allQuestions(A.cur.form.data).find(x => x.id === A.filter.q); if (!q) return true;
    const v = r.answers[q.id];
    if (q.type === "ranking") return Array.isArray(v) && v[0] === A.filter.value;
    return [].concat(v ?? []).some(x => x === A.filter.value);
  }
  function highlight(text, term) {
    if (!term) return [text];
    const i = fold(text).indexOf(fold(term)); if (i < 0) return [text];
    const from = Math.max(0, i - 24), pre = (from ? "…" : "") + text.slice(from, i);
    return [pre, el("mark", {}, text.slice(i, i + term.length)), text.slice(i + term.length, i + term.length + 60)];
  }
  function responsesTab(main) {
    const { form, responses } = A.cur, f = form.data;
    const numbered = responses.map((r, i) => ({ r, n: i + 1 })).reverse();
    const list = el("div", { class: "r-list" }), count = el("div", { class: "muted", style: "font-size:13.5px;font-weight:600" });
    const draw = () => {
      const term = A.search.trim();
      const rows = numbered.filter(({ r, n }) => matchesFilter(r) && (!term || String(n) === term.replace(/^#/, "") || fold(answerable(f).map(q => fmt(q, r.answers)).join(" \n ")).includes(fold(term))));
      count.textContent = term || A.filter ? `${plural(rows.length, "match", "matches")} of ${responses.length}` : plural(responses.length, "response");
      put(list, rows.slice(0, 300).map(({ r, n }) => {
        const name = respName(f, r, n);
        let sub = respPreview(f, r);
        if (term) { const hit = answerable(f).map(q => fmt(q, r.answers)).find(t => fold(t).includes(fold(term))); if (hit) sub = hit; }
        return el("button", { class: "r-item", type: "button", onclick: () => openResponse(r.id) },
          el("span", { class: "av", style: `background:${PALETTE[(n - 1) % PALETTE.length]}` }, name.startsWith("Response #") ? "#" + n : name.trim()[0].toUpperCase()),
          el("span", { class: "who" }, el("b", {}, ...highlight(name, term)), el("span", {}, ...highlight(sub, term))),
          el("time", { datetime: new Date(r.createdAt).toISOString() }, rel(r.createdAt)));
      }), rows.length ? null : el("div", { class: "empty" }, el("b", {}, responses.length ? "Nobody matches" : "No responses yet"), el("span", { class: "muted" }, responses.length ? "Try another word, or clear the filter." : "Share the form to start collecting answers.")));
      if (rows.length > 300) list.append(el("p", { class: "muted", style: "text-align:center" }, "Showing the newest 300. Search to find others."));
    };
    const fq = A.filter && allQuestions(f).find(x => x.id === A.filter.q);
    const search = el("input", { class: "input", type: "search", placeholder: "Search names, answers or #number", value: A.search, "aria-label": "Search responses", oninput: debounce(e => { A.search = e.target.value; draw(); }, 120) });
    main.append(el("div", { class: "stack" },
      el("div", { class: "search" }, icon("search"), search),
      fq ? el("div", { style: "display:flex;min-width:0" }, el("span", { class: "filter-chip", title: `${fq.title}: ${A.filter.value}` }, el("span", {}, `${fq.type === "ranking" ? "#1: " : ""}${A.filter.value}`), el("button", { "aria-label": "Clear filter", onclick: () => { A.filter = null; renderForm(); } }, "×"))) : null,
      el("div", { class: "row" }, count, el("span", { class: "spacer" }),
        responses.length ? el("button", { class: "btn", onclick: e => run(e.currentTarget, () => exportExcel(A.cur)) }, icon("download"), "Excel") : null),
      list));
    draw();
  }
  function openResponse(rid) {
    const { form, responses } = A.cur, f = form.data;
    let idx = responses.findIndex(r => r.id === rid); if (idx < 0) return;
    const s = sheet("Response", el("div"), [el("span")]);
    const paint = () => {
      const r = responses[idx], n = idx + 1;
      s.head.textContent = respName(f, r, n) === `Response #${n}` ? `Response #${n}` : `#${n} · ${respName(f, r, n)}`;
      let k = 0;
      put(s.body, el("div", { class: "muted", style: "font-size:13.5px;font-weight:600;margin-bottom:4px" }, fullDate(r.createdAt)),
        ...f.sections.map(sec => [sec.title && f.sections.length > 1 ? el("div", { class: "r-eyebrow", style: "margin:16px 0 0" }, sec.title) : null,
          sec.questions.filter(q => q.type !== "info").map(q => { const t = fmt(q, r.answers); return el("div", { class: "qa" }, el("small", {}, `${++k}. ${q.title}`), el("div", { class: t ? "" : "none" }, t || "No answer")); })]));
      s.body.scrollTop = 0;
      s.el.querySelector(".sh-foot").replaceChildren(
        el("button", { class: "btn icon", "aria-label": "Newer response", disabled: idx >= responses.length - 1, onclick: () => { idx++; paint(); } }, icon("back")),
        el("button", { class: "btn icon", "aria-label": "Older response", disabled: idx <= 0, onclick: () => { idx--; paint(); } }, icon("chevron")),
        el("span", { class: "spacer" }),
        el("button", { class: "btn", onclick: e => run(e.currentTarget, () => exportResponsePdf(A.cur, r, n)) }, icon("file"), "PDF"),
        el("button", { class: "btn danger icon", "aria-label": "Delete response", onclick: () => confirmSheet("Delete this response?", `Response #${n} will be deleted for good.`, "Delete", async () => {
          try { await api("response-delete", { method: "POST", body: { id: r.id } }); A.cur.responses = responses.filter(x => x.id !== r.id); s.close(); renderForm(); toast("Response deleted"); } catch (e) { toast(e.message); }
        }) }, icon("trash")));
    };
    paint();
  }

  /* ---------- share ---------- */
  function shareTab(main) {
    const { form } = A.cur, url = formUrl(form.id), f = form.data;
    const canvas = el("canvas", { width: 600, height: 600, "aria-label": "QR code for the form link", role: "img" });
    const toggle = el("input", { type: "checkbox", checked: form.status === "open", "aria-label": "Accepting responses", onchange: async e => {
      const status = e.target.checked ? "open" : "closed";
      try { await api("status-set", { method: "POST", body: { id: form.id, status } }); form.status = status; toast(status === "open" ? "The form is open" : "The form is closed"); renderForm(); }
      catch (x) { e.target.checked = !e.target.checked; toast(x.message); }
    } });
    main.append(el("div", { class: "stack" },
      el("div", { class: "card stack" }, el("div", { class: "switch-row" }, el("div", { class: "txt" }, el("b", {}, form.status === "open" ? "Accepting responses" : "Closed"), el("span", {}, form.status === "open" ? (f.closesAt ? `Closes automatically on ${new Date(f.closesAt).toLocaleDateString()}` : "Anyone with the link can answer.") : "People who open the link see that the form is closed.")), el("label", { class: "tgl" }, toggle, el("i")))),
      el("div", { class: "card stack" }, el("b", {}, "Link"),
        el("div", { class: "share-link" }, el("code", {}, url.replace(/^https?:\/\//, "")), el("button", { class: "btn primary", onclick: () => copy(url, "Link copied") }, icon("copy"), "Copy")),
        el("div", { class: "row" }, navigator.share ? el("button", { class: "btn", onclick: () => navigator.share({ title: f.title, text: f.description ? f.description.slice(0, 120) : f.title, url }).catch(() => {}) }, icon("share"), "Share…") : null,
          el("a", { class: "btn", href: url, target: "_blank", rel: "noopener" }, icon("eye"), "Open the form"),
          el("button", { class: "btn", onclick: () => copy(`${f.title}\n${url}`, "Message copied") }, "Copy as message"))),
      el("div", { class: "card qr" }, el("b", { style: "justify-self:start" }, "QR code"), el("p", { class: "muted", style: "margin:0;justify-self:start;font-size:14px" }, "Show it on a screen or print it. People scan it with their phone camera."), canvas,
        el("button", { class: "btn", onclick: () => { const a = el("a", { href: canvas.toDataURL("image/png"), download: `${form.id}-qr.png` }); document.body.append(a); a.click(); a.remove(); } }, icon("download"), "Download QR code"))));
    loadScript(LIBS.qr).then(() => drawQr(canvas, url, f.theme || "#17181F")).catch(() => { canvas.replaceWith(el("p", { class: "muted" }, "The QR code couldn't load. Check your internet.")); });
  }
  function drawQr(canvas, text, color) {
    const qr = window.qrcode(0, "M"); qr.addData(text); qr.make();
    const n = qr.getModuleCount(), size = canvas.width, margin = 2, cell = size / (n + margin * 2), ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size); ctx.fillStyle = color;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect(Math.floor((c + margin) * cell), Math.floor((r + margin) * cell), Math.ceil(cell), Math.ceil(cell));
  }

  /* ================= exports ================= */
  const fileBase = f => (slugify(f.title) || "form") + "-" + new Date().toISOString().slice(0, 10);
  async function exportExcel({ form, responses }) {
    await loadScript(LIBS.xlsx);
    const XLSX = window.XLSX, f = form.data, qs = answerable(f);
    const cols = [];
    for (const q of qs) {
      if (q.type === "matrix") q.rows.forEach(row => cols.push({ h: `${q.title} [${row}]`, get: a => (a[q.id] || {})[row] || "" }));
      else if (q.type === "multiple") cols.push({ h: q.title, get: a => [].concat(a[q.id] || []).join("; ") });
      else if (q.type === "scale" || q.type === "rating" || q.type === "number") cols.push({ h: q.title, get: a => a[q.id] == null || a[q.id] === "" ? "" : (Number.isFinite(+a[q.id]) ? +a[q.id] : a[q.id]) });
      else cols.push({ h: q.title, get: a => q.type === "ranking" ? fmt(q, a) : (a[q.id] ?? "") });
      if (q.other) cols.push({ h: `${q.title} [${q.other}]`, get: a => a[q.id + "__other"] || "" });
    }
    const rows = [["#", "Submitted", ...cols.map(c => c.h)], ...responses.map((r, i) => [i + 1, new Date(r.createdAt), ...cols.map(c => c.get(r.answers))])];
    const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true, dateNF: "yyyy-mm-dd hh:mm" });
    for (let r = 1; r < rows.length; r++) { const c = ws[XLSX.utils.encode_cell({ r, c: 1 })]; if (c) c.z = "yyyy-mm-dd hh:mm"; }
    ws["!cols"] = [{ wch: 5 }, { wch: 17 }, ...cols.map(c => ({ wch: Math.min(48, Math.max(14, c.h.length * .8)) }))];
    ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: rows[0].length - 1 } }) };
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };
    const sum = [["Question", "Answer", "Count", "Percent of people who answered"]];
    for (const q of qs) {
      const a = analyze(q, responses);
      if (a.items && a.kind !== "ranking") a.items.forEach(x => sum.push([q.title, x.label, x.count, x.pct / 100]));
      else if (a.kind === "ranking") a.items.forEach((x, i) => sum.push([q.title, `#${i + 1} ${x.label} (avg position ${fmtNum(x.avg)})`, x.points, x.pct / 100]));
      else if (a.kind === "matrix") a.rows.forEach(r => r.cells.forEach(c => sum.push([`${q.title} [${r.row}]`, c.label, c.count, c.pct / 100])));
      else sum.push([q.title, "Written answers", a.answered, a.total ? a.answered / a.total : 0]);
      if (a.avg != null) sum.push([q.title, "Average", Math.round(a.avg * 100) / 100, ""]);
      sum.push([]);
    }
    const ws2 = XLSX.utils.aoa_to_sheet(sum);
    for (let r = 1; r < sum.length; r++) { const c = ws2[XLSX.utils.encode_cell({ r, c: 3 })]; if (c && typeof c.v === "number") c.z = "0.0%"; }
    ws2["!cols"] = [{ wch: 50 }, { wch: 44 }, { wch: 8 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses"); XLSX.utils.book_append_sheet(wb, ws2, "Summary");
    XLSX.writeFile(wb, fileBase(f) + ".xlsx");
    toast("Excel file downloaded");
  }

  let fontData = null;
  async function pdfDoc() {
    await loadScript(LIBS.jspdf); await loadScript(LIBS.autotable);
    if (!fontData) {
      const b64 = async u => { const r = await fetch(u); if (!r.ok) throw new Error("Could not load the font"); const bytes = new Uint8Array(await r.arrayBuffer()); let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
      fontData = await Promise.all([b64(LIBS.font), b64(LIBS.fontBold)]);
    }
    const doc = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
    doc.addFileToVFS("DejaVuSans.ttf", fontData[0]); doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    doc.addFileToVFS("DejaVuSans-Bold.ttf", fontData[1]); doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
    doc.setFont("DejaVu", "normal");
    return doc;
  }
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  function svgPng(svg, px) {
    return new Promise((ok, fail) => {
      const img = new Image();
      img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = px; c.getContext("2d").drawImage(img, 0, 0, px, px); ok(c.toDataURL("image/png")); };
      img.onerror = fail; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  function pdfFooter(doc, title) {
    const pages = doc.getNumberOfPages(), W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFont("DejaVu", "normal"); doc.setFontSize(8); doc.setTextColor(150); doc.text(title.slice(0, 80), 40, H - 22); doc.text(`${i} / ${pages}`, W - 40, H - 22, { align: "right" }); }
  }
  async function exportPdf({ form, responses }) {
    const doc = await pdfDoc(), f = form.data, accent = hexRgb(f.theme || "#4C5FD5");
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 40, CW = W - M * 2;
    let y = 0;
    const need = h => { if (y + h > H - 50) { doc.addPage(); y = 50; } };
    doc.setFillColor(...accent); doc.rect(0, 0, W, 120, "F");
    doc.setTextColor(255); doc.setFont("DejaVu", "bold"); doc.setFontSize(20);
    const tl = doc.splitTextToSize(f.title, CW); doc.text(tl.slice(0, 2), M, 50);
    doc.setFont("DejaVu", "normal"); doc.setFontSize(10); doc.text(`Summary report · ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}`, M, 50 + Math.min(2, tl.length) * 24);
    y = 150;
    const first = responses[0], last = responses[responses.length - 1];
    const boxes = [["Responses", String(responses.length)], ["First", first ? new Date(first.createdAt).toLocaleDateString() : "–"], ["Latest", last ? new Date(last.createdAt).toLocaleDateString() : "–"], ["Status", form.status === "open" ? "Open" : "Closed"]];
    const bw = (CW - 30) / 4;
    boxes.forEach(([k, v], i) => { const x = M + i * (bw + 10); doc.setFillColor(246, 245, 241); doc.roundedRect(x, y, bw, 54, 8, 8, "F"); doc.setTextColor(110); doc.setFontSize(8.5); doc.text(k.toUpperCase(), x + 12, y + 18); doc.setTextColor(23); doc.setFont("DejaVu", "bold"); doc.setFontSize(15); doc.text(v, x + 12, y + 40); doc.setFont("DejaVu", "normal"); });
    y += 84;
    let qn = 0;
    for (const q of answerable(f)) {
      const a = analyze(q, responses); qn++;
      const titleLines = doc.splitTextToSize(`${qn}. ${q.title}`, CW);
      need(titleLines.length * 15 + 60);
      doc.setFont("DejaVu", "bold"); doc.setFontSize(12); doc.setTextColor(23); doc.text(titleLines, M, y); y += titleLines.length * 15;
      doc.setFont("DejaVu", "normal"); doc.setFontSize(8.5); doc.setTextColor(120); doc.text(`${TYPE_NAMES[q.type]} · ${a.answered} of ${a.total} answered${a.avg != null ? ` · average ${fmtNum(a.avg)} / ${q.max}` : ""}`, M, y + 2); y += 16;
      if (!a.answered) { doc.setTextColor(150); doc.text("No answers yet.", M, y + 6); y += 26; continue; }
      const bars = (items, x0, width, colors, valueText) => {
        for (const [i, it] of items.entries()) {
          const lines = doc.splitTextToSize(it.label, width * .5); const h = Math.max(18, lines.length * 11 + 6);
          need(h);
          doc.setFontSize(9); doc.setTextColor(40); doc.text(lines, x0, y + 10);
          const bx = x0 + width * .52, bwid = width * .30;
          doc.setFillColor(238, 237, 232); doc.roundedRect(bx, y + 3, bwid, 8, 4, 4, "F");
          if (it.pct > 0) { doc.setFillColor(...hexRgb(colors ? colors[i % colors.length] : PALETTE[0])); doc.roundedRect(bx, y + 3, Math.max(8, bwid * Math.min(100, it.pct) / 100), 8, 4, 4, "F"); }
          doc.setTextColor(23); doc.setFont("DejaVu", "bold"); doc.text(valueText(it), x0 + width, y + 10, { align: "right" }); doc.setFont("DejaVu", "normal");
          y += h;
        }
      };
      if (a.kind === "donut") {
        const items = a.items.map((x, i) => ({ ...x, color: PALETTE[i % PALETTE.length] }));
        const img = await svgPng(donutSvg(items, { size: 400, text: "#17181F", sub: "#8A8D99", track: "#EEEDE8" }), 400);
        const blockH = Math.max(120, items.length * 20);
        need(blockH); const y0 = y;
        doc.addImage(img, "PNG", M, y, 110, 110);
        bars(items, M + 130, CW - 130, items.map(x => x.color), it => `${it.count}  ${fmtNum(it.pct)}%`);
        y = Math.max(y, y0 + 120);
      } else if (a.kind === "bars") {
        bars(a.items.map((x, i) => ({ ...x, label: `${i + 1}. ${x.label}` })), M, CW, [PALETTE[0]], it => `${it.count}  ${fmtNum(it.pct)}%`);
      } else if (a.kind === "ranking") {
        bars(a.items.map((x, i) => ({ ...x, label: `${i + 1}. ${x.label}` })), M, CW, [PALETTE[0]], it => `avg #${fmtNum(it.avg)} · ${it.first}× first`);
      } else if (a.kind === "columns") {
        bars(a.items.map(x => ({ ...x, label: q.type === "rating" ? `${x.label} star${x.label === "1" ? "" : "s"}` : x.label })), M, CW, [PALETTE[0]], it => `${it.count}  ${fmtNum(it.pct)}%`);
      } else if (a.kind === "matrix") {
        for (const r of a.rows) {
          const lines = doc.splitTextToSize(r.row, CW * .4); need(lines.length * 11 + 14);
          doc.setFontSize(9); doc.setTextColor(40); doc.text(lines, M, y + 10);
          let x = M + CW * .42; const tw = CW * .58;
          r.cells.forEach((c, i) => { if (!c.count) return; const w = tw * c.pct / 100; doc.setFillColor(...hexRgb(PALETTE[i % PALETTE.length])); doc.rect(x, y + 2, w, 11, "F"); if (w > 22) { doc.setTextColor(255); doc.setFontSize(7); doc.text(`${Math.round(c.pct)}%`, x + w / 2, y + 10, { align: "center" }); } x += w; });
          y += Math.max(18, lines.length * 11 + 6);
        }
        need(16); let lx = M; doc.setFontSize(8);
        q.columns.forEach((c, i) => { const w = doc.getTextWidth(c) + 22; if (lx + w > W - M) { lx = M; y += 12; } doc.setFillColor(...hexRgb(PALETTE[i % PALETTE.length])); doc.rect(lx, y + 2, 8, 8, "F"); doc.setTextColor(90); doc.text(c, lx + 12, y + 9); lx += w; });
        y += 18;
      } else if (a.kind === "text") {
        if (a.stats) { doc.setFontSize(9.5); doc.setTextColor(40); doc.text(`Average ${fmtNum(a.stats.avg)} · lowest ${fmtNum(a.stats.min)} · highest ${fmtNum(a.stats.max)}`, M, y + 8); y += 18; }
        if (a.words && a.words.length) { doc.setFontSize(8.5); doc.setTextColor(...accent); const wl = doc.splitTextToSize("Most used words: " + a.words.map(([w, c]) => `${w} (${c})`).join(", "), CW); need(wl.length * 11 + 6); doc.text(wl, M, y + 8); y += wl.length * 11 + 6; }
        const nums = new Map(responses.map((r, i) => [r.id, i + 1]));
        doc.autoTable({ startY: y, margin: { left: M, right: M, bottom: 50 }, head: [["#", "Answer"]], body: a.texts.map(t => [String(nums.get(t.r.id)), t.text]),
          styles: { font: "DejaVu", fontSize: 8.5, cellPadding: 5, textColor: 40, lineColor: 230, lineWidth: .5 }, headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold" }, columnStyles: { 0: { cellWidth: 30 } }, alternateRowStyles: { fillColor: [250, 249, 246] } });
        y = doc.lastAutoTable.finalY + 6;
      }
      if (a.others && a.others.length) {
        need(30); doc.setFontSize(9); doc.setTextColor(90); doc.text(`Written answers for "${q.other}":`, M, y + 10); y += 14;
        doc.autoTable({ startY: y, margin: { left: M, right: M, bottom: 50 }, body: a.others.map(t => [t.text]), styles: { font: "DejaVu", fontSize: 8.5, cellPadding: 4, textColor: 40 }, theme: "plain" });
        y = doc.lastAutoTable.finalY;
      }
      y += 22;
    }
    pdfFooter(doc, f.title);
    doc.save(fileBase(f) + "-report.pdf");
    toast("PDF report downloaded");
  }
  async function exportResponsePdf({ form }, r, n) {
    const doc = await pdfDoc(), f = form.data, accent = hexRgb(f.theme || "#4C5FD5"), W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...accent); doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(255); doc.setFont("DejaVu", "bold"); doc.setFontSize(16); doc.text(doc.splitTextToSize(f.title, W - 80).slice(0, 2), 40, 40);
    doc.setFont("DejaVu", "normal"); doc.setFontSize(10); doc.text(`Response #${n} · ${fullDate(r.createdAt)}`, 40, 72);
    let k = 0;
    doc.autoTable({ startY: 110, margin: { left: 40, right: 40, bottom: 50 }, head: [["Question", "Answer"]],
      body: answerable(f).map(q => [`${++k}. ${q.title}`, fmt(q, r.answers) || "—"]),
      styles: { font: "DejaVu", fontSize: 9.5, cellPadding: 7, textColor: 30, lineColor: 230, lineWidth: .5, valign: "top" }, headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold" }, columnStyles: { 0: { cellWidth: 200, textColor: 90 } } });
    pdfFooter(doc, f.title);
    doc.save(`${fileBase(f)}-response-${n}.pdf`);
  }

  /* ================= start ================= */
  function start() {
    let path = location.pathname.replace(/\/+$/, "");
    if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
    const seg = path.split("/").filter(Boolean);
    if (!seg.length || seg[0] === "admin") { if (!seg.length && !location.hash) history.replaceState(null, "", BASE + "/admin"); adminBoot(); }
    else respondent(decodeURIComponent(seg[0]));
  }
  start();
})();
