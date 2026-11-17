# English

English lessons with Ramadan: the lessons page, the class games and Commute Prep.

- **Lessons page:** https://ramykaz.github.io/english/
- **Class Games:** https://ramykaz.github.io/english/games/ (Jeopardy-style boards, plus word games for each unit: Unit 1, A2 Unit 1, Fun English 1 and 2, Unit 1 Revision, Exam Prep Units 1–3 and B1 Vocabulary)
- **Commute Prep:** https://ramykaz.github.io/english/prep/ (TOEFL and GRE vocabulary with audio cards, spaced review and quizzes; installs on a phone and works offline)

Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages.

## Sync for games (one time, about 2 minutes)

Games and game packs you make are kept in the browser and also saved online, so every device shows the same ones.

1. Open your project at [supabase.com](https://supabase.com). The same project can also hold Ka-Who? and Forms.
2. **SQL Editor → New query**: paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. Put the **Project URL** and the **publishable (anon)** key in [`config.js`](config.js).

The browser can only use the `cg_sync` function; the table itself is locked.

## Deploy

`.github/workflows/pages.yml` deploys every push to `main`. One-time setup: **Settings → Pages → Source: GitHub Actions**. When you change Commute Prep, bump `CACHE` in `prep/sw.js` so installed copies update.
