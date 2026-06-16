# Launch Checklist

Things to do before / when launching. Built up during planning conversations.

---

## Before You Write Any Code

- [ ] Add the `public.users` trigger in Supabase so a row is auto-created when someone signs up via Auth
  - Handles both email/password and Google OAuth signups
  - See: `handle_new_user()` trigger function

---

## Before You Go Live

- [ ] **Set up a keep-alive cron job** so your free Supabase project doesn't pause after 7 days of inactivity
  - Use [cron-job.org](https://cron-job.org) (free, no code) or a GitHub Actions scheduled workflow
  - Ping your Supabase project URL every 3–4 days
  - Note: when you can afford $25/month, just upgrade to Supabase Pro and skip this

- [ ] **Set up automated database backups** (free tier has no built-in backups — if something goes wrong, you have nothing)
  - Use `pg_dump` in a scheduled GitHub Actions workflow
  - Store backup files somewhere free: Cloudflare R2, Google Drive, or even a private GitHub repo
  - Run daily

- [ ] **Point your domain through Cloudflare** (free)
  - Gives you automatic DDoS protection at no cost
  - Takes ~10 minutes: create a Cloudflare account, add your domain, update your domain registrar's nameservers to point at Cloudflare
  - Do this before you announce the app publicly

- [ ] **Add Cloudflare Turnstile to user submission forms** (free)
  - Invisible CAPTCHA alternative — no "click the traffic lights" friction for real users
  - Protects against spam bots submitting resources
  - Get a Turnstile site key from the Cloudflare dashboard and add the widget to your submission form

---

## Ongoing / Nice To Have

- [ ] Set up Row Level Security (RLS) policies in Supabase
- [ ] Upgrade to Supabase Pro ($25/mo) when you have real users — removes the pause risk and adds daily backups
