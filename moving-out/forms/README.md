# Forms

Make a form, share a link or QR code, and see the answers as charts, a table, Excel or PDF.

- **Admin:** https://ramykaz.github.io/forms/admin
- **A form:** https://ramykaz.github.io/forms/your-form-name

Question types: short answer, paragraph, email, phone, number, date, single and multiple choice, dropdown, scale, rating, yes/no, ranking and grid. Forms can be pasted as JSON (there is a prompt to have an AI write it), opened or closed, and given a closing date.

Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages. The data lives in Supabase.

## Set up the database (one time, about 3 minutes)

1. Open your project at [supabase.com](https://supabase.com) (or create a free one). The same project can also hold Ka-Who? and the English site.
2. **SQL Editor → New query**: paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. **Project Settings → API**: copy the **Project URL** and the **publishable (anon)** key into [`config.js`](config.js).
4. Open `/forms/admin` and choose your admin password.

How it works: the browser calls one database function, `fm_api`. The tables are locked (row-level security on, no policies). Anyone with a link can read that one form and send answers. Everything else needs the admin password, which is stored as a bcrypt hash.

## Deploy

`.github/workflows/pages.yml` deploys every push to `main`. One-time setup: **Settings → Pages → Source: GitHub Actions**. `404.html` is a copy of `index.html`, so links like `/forms/my-form` open the form.
