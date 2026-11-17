# Ka-Who?

Live quiz games for the classroom. The host shows questions on the projector; players join on their phones with a 6-digit PIN.

- **Play:** https://ramykaz.github.io/kawho/
- **Host studio:** https://ramykaz.github.io/kawho/host

Question types: quiz, true/false, pick all correct, type the answer, slider, put in order, poll and word cloud. Points depend on speed, with streak bonuses, a leaderboard after each question and a podium at the end. Results download as Excel. Hosts sign in with a username and password; the first account is the owner and can add accounts for friends. Each host sees only their own quizzes.

Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages. The data lives in Supabase.

## Set up the database (one time, about 3 minutes)

1. Open your project at [supabase.com](https://supabase.com) (or create a free one). One project can hold Ka-Who?, Forms and the English site together, because each uses its own tables.
2. **SQL Editor → New query**: paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. **Project Settings → API**: copy the **Project URL** and the **publishable (anon)** key into [`config.js`](config.js).
4. Open `/kawho/host`. The first account you make is the owner.

How it works: the browser calls one database function, `kw_api`. The tables are locked (row-level security on, no policies), so the only way in is through that function. Correct answers, timing and scores stay in the database and never reach the players' phones. Pictures go to a public Storage bucket called `uploads`.

## Run locally

Run this in the folder that contains the `kawho` folder, then open http://localhost:8000/kawho/

```bash
python3 -m http.server 8000
```

## Deploy

`.github/workflows/pages.yml` deploys every push to `main`. One-time setup: **Settings → Pages → Source: GitHub Actions**. `404.html` is a copy of `index.html`, so links like `/kawho/123456` open the game.
