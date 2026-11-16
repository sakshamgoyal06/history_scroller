# Security and multi-user readiness review

Date: 2026-11-16. Scope: `main`, open PRs #27 (Polity decks), #28 (schema v1 + RLS), #29 (email sign-in),
#22 (Railway hosting), every branch's git history, and the live Supabase project `curiosity`
(ref `ijjtwurgkmxwwakkvfep`). Read-only: nothing live was changed.

Not verified: the live Vercel site and its dashboard settings (this review's sandbox cannot reach
`*.vercel.app`), the OpenAI account, and Supabase Auth settings (not readable through the tools used).
Items that depend on them are marked **(check)**.

## Summary

No real secrets are exposed. The repository is **public**, so everything in it, including all history, is
world-readable; a scan of all 79 commits on all branches found only the Supabase **publishable** key, which is
designed to be public. The database is in good shape: row-level security is on for all 13 tables, grants are
minimal and match the migrations, the Supabase security advisor reports no issues (re-run today), and there are
0 users and 0 storage buckets.

The real risks for opening the app to others are:

1. **The two AI endpoints are open to the whole internet and spend your OpenAI money** with only a weak,
   per-server-instance throttle.
2. **Sign-in will not work for other people yet** (Site URL, redirect URLs, email sender), and nothing stops
   someone using the sign-in form to spam arbitrary email addresses.
3. **Preview builds, local dev and forks all talk to the production database** because the code falls back to
   the production project.
4. **Launch basics for real users are missing**: privacy policy and account deletion (India's DPDP Act), an age
   decision, and the Supabase free tier pausing the database after a week without traffic.

## Findings by priority

### P0: fix before sharing the link with anyone

**S-01. Paid AI endpoints are unauthenticated.** `api/plan-learning-path.js` and `api/generate-lesson.js` call
OpenAI (the lesson route also uses the paid `web_search` tool and may run up to 300 s per call) for any caller.
The only guard is `checkThrottle` in `lib/serverUtils.js`: 12 requests per minute per IP, held **in memory per
serverless instance**, so it resets on every cold start, multiplies with each instance, and is bypassed by
rotating IPs. The Learn feature that calls these routes is live in `src/App.jsx`. Anyone who finds the URL can
script calls and run up the OpenAI and Vercel bills. (Already engineering P0 in `docs/ENGINEERING_REVIEW.md`,
BUILD_PLAN M0.1, still open.)
- *Your hands:* in the OpenAI dashboard, give this app its own project and key with a hard monthly budget
  limit; in Vercel, set spend management. **(check)** whether `OPENAI_API_KEY` is set in Vercel today and for
  which environments.
- *Code (recommended):* add a server-side kill switch (`AI_ENABLED`) and turn AI off in production until the
  next two land; then require a signed-in user (verify the Supabase JWT on the server), move the limiter to
  Upstash (shared across instances) and add a per-user daily quota. PRD v2 parks open-ended AI paths anyway, so
  switching it off costs little.

**S-02. Sign-in links will not reach other users correctly.** Supabase Auth Site URL and redirect URLs are not
set (per `docs/DATABASE.md` on PR #29). Until they are, magic links open the default Site URL
(`localhost`). The app sends `emailRedirectTo = window.location.origin + pathname`, so production, `/upsc` and
each preview origin must be on the allow-list.
- *Your hands:* Supabase → Authentication → URL Configuration: Site URL = production address; redirect URLs =
  production, production `/upsc`, and the preview pattern in `docs/DATABASE.md`.

**S-03. Built-in email sender cannot serve real users.** Supabase's default sender allows only a few emails an
hour and is meant for testing. Real users will hit "Too many sign-in emails".
- *Your hands:* pick an email provider (for example Resend, Postmark or Amazon SES), verify a sending domain
  (SPF, DKIM, DMARC), add it under Authentication → SMTP Settings, then raise the email rate limit under
  Authentication → Rate Limits. This needs a domain you own.

**S-04. Sign-in form can be used to spam any inbox.** `sendSignInLink` uses `shouldCreateUser: true` with no
CAPTCHA, so a script can send sign-in emails to arbitrary addresses and create unlimited accounts. That annoys
strangers and damages your sending domain's reputation once SMTP is set up.
- *Your hands:* enable CAPTCHA protection in Supabase Auth (Cloudflare Turnstile is free) and keep the per-hour
  OTP limits low.
- *Code:* render Turnstile in `AccountSection.jsx` and pass `captchaToken` to `signInWithOtp`.

### P1: fix before or during the first public alpha

**S-05. Every environment uses the production database.** `src/account/auth.js` falls back to the production
Supabase URL and key when the `VITE_SUPABASE_*` variables are unset. Local dev, every Vercel preview and any
fork of this public repo will create real accounts and write real rows in production.
- *Your hands:* create a second Supabase project (`curiosity-staging`), and in Vercel set `VITE_SUPABASE_*`
  per environment (Production → prod project, Preview and Development → staging).
- *Code:* remove the hard-coded fallback (or keep it only for production builds) and document it.

**S-06. Vercel previews may be public and share production secrets. (check)** Each branch push gets a preview
URL. If Deployment Protection is off, unreviewed branches are reachable by anyone, and if `OPENAI_API_KEY` is
scoped to Preview too, each preview is another open AI endpoint.
- *Your hands:* Vercel → Settings → Deployment Protection → Standard Protection (Vercel Authentication) on
  previews; Settings → Environment Variables → scope `OPENAI_*` to Production only.

**S-07. Sign-in uses the implicit flow (tokens in the URL).** `captureSignInFromUrl` accepts any
`#access_token=…&refresh_token=…` and calls `setSession`. Someone can send a victim a link carrying the
attacker's own tokens and silently sign the victim into the attacker's account (anything the victim then saves
goes to the attacker). Tokens in URLs can also leak through history and logs.
- *Code:* switch supabase-js to `flowType: 'pkce'` and finish sign-in with `exchangeCodeForSession(code)`; the
  code is bound to the browser that asked for the link.

**S-08. Free-tier limits will bite real users.** Supabase free projects pause after about a week without
activity and have no point-in-time recovery. A paused project means every user's sign-in fails.
- *Your hands:* move `curiosity` to the Pro plan before launch (daily backups, no pausing), or accept the risk
  for a closed alpha. Same for Vercel Hobby, whose terms do not allow commercial use.

**S-09. Legal basics for collecting user data (India).** Sign-in stores email addresses and reading history,
which makes you a data fiduciary under the DPDP Act 2023. Needed: a privacy policy and terms page, a way to
delete an account and its data (all user tables already `on delete cascade` from `auth.users`, so this is one
server call with the service role), and a decision on minors (D-AGE): users under 18 need verifiable parental
consent, which most apps avoid by stating 18+.
- *Your hands:* decide D-AGE and approve policy text. *Code:* account-deletion endpoint and a link to the
  policy from the sign-in screen.

**S-10. Hosting is undecided.** PR #22 moves hosting to Railway (decided 2026-10-24) but newer docs (PR #29)
assume Vercel. Every setup step above differs by host. Railway's server also has a `cors: true` mode that sends
`Access-Control-Allow-Origin: *`; keep it off in production.
- *Your hands:* confirm the host, then close or merge PR #22.

**S-11. Repository settings.** The repo is public. That is fine for secrets today, but it also publishes the
PRD and strategy docs, and 4 early commits carry your personal email address.
- *Your hands:* decide public or private; turn on branch protection for `main` (require CI, block force push);
  turn on GitHub secret scanning and push protection (free for public repos); set
  "Keep my email addresses private" in GitHub settings.

**S-12. No Content Security Policy.** `vercel.json` sets good baseline headers but no CSP. A CSP limiting
scripts to the site itself and connections to Supabase, `youtube-nocookie.com` frames and the API would contain
any future XSS.
- *Code:* add a CSP header (report-only first).

### P2: hardening, can follow launch

- **S-13. Lessons can be attached to another user's path.** The `own lessons` policy checks `owner = auth.uid()`
  but not that `path_id` belongs to that user, so someone who knows a path UUID can insert rows into it and
  squat `(path_id, position)`. Low risk while UUIDs stay private, but `paths.share_token` suggests sharing is
  coming. Add `exists (select 1 from paths p where p.id = path_id and p.owner = auth.uid())` to the check.
- **S-14. Unbounded per-user writes.** Users can insert unlimited `user_item_events` and store large JSON in
  `recall_state.history`, `paths.request/plan` and `lessons.content`. Add size checks and rate limits when
  these tables start being written by the app.
- **S-15. `recall_items` are readable even when their parent item is unpublished.** Tie the read policy to a
  published `content_items` row, or keep unpublished recall items out of the table.
- **S-16. Source links accept any URL scheme.** `lib/learningPathSchemas.js` uses `z.string().url()`, which
  accepts `javascript:`. React 19 already blocks these in `href`, but restrict to `http`/`https` anyway.
- **S-17. `handle_new_user` uses `search_path = public`.** It is `security definer`; set `search_path = ''`
  (it already schema-qualifies the table).
- **S-18. Doc mismatch.** `docs/DATABASE.md` step 4 says `VITE_SUPABASE_ANON_KEY`; the code reads
  `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **S-19. Dependencies.** Production dependencies: 0 advisories. Dev dependencies: moderate advisories in
  `glob`/`minimatch`/`deepmerge`. Dependabot PRs #18, #19 and #23 are waiting.
- **S-20. Monitoring.** No error tracking or alerting yet (Sentry and PostHog are in D-STACK). Add Sentry and an
  OpenAI usage alert before inviting users, so abuse is seen within hours, not at the end of the month.

## What is already right

- No secrets in any commit on any branch; `.env*` is git-ignored; the OpenAI key is only read server-side
  (`lib/serverUtils.js`); no `VITE_*` variable holds a secret; the service-role key is not used anywhere.
- RLS enabled on all 13 tables; content is read-only and published-only for users; user tables are owner-only;
  users cannot change their own `plan`; trigger functions are not callable through the API (live database
  checked 2026-11-16, matches migrations).
- Server errors return safe messages with a request id; request bodies are capped at 32 KB and validated with
  zod; security headers and `no-store` on `/api`.
- CI runs lint, tests, build and `npm audit` and uses no secrets or `pull_request_target`.

## Checklist: what only you can do

| # | Where | Action | Finding |
|---|---|---|---|
| 1 | OpenAI | Separate project + key for Curiosity, hard monthly budget | S-01 |
| 2 | Vercel | Check `OPENAI_*` vars, scope to Production; spend limit | S-01, S-06 |
| 3 | Supabase Auth | Site URL + redirect URLs | S-02 |
| 4 | Domain + email provider | Verify domain, add custom SMTP, raise rate limit | S-03 |
| 5 | Supabase Auth | Enable CAPTCHA (Turnstile) | S-04 |
| 6 | Supabase | Create staging project; set per-environment vars in Vercel | S-05 |
| 7 | Vercel | Deployment Protection on previews | S-06 |
| 8 | Supabase / Vercel billing | Pro plans before public launch | S-08 |
| 9 | Decision | D-AGE; approve privacy policy and terms | S-09 |
| 10 | Decision | Vercel or Railway (PR #22) | S-10 |
| 11 | GitHub | Public/private; branch protection; secret scanning; private email | S-11 |

## Code changes Claude can make (after your go-ahead)

1. AI kill switch, then auth + Upstash limiter + per-user quota on the AI routes (S-01).
2. Turnstile on the sign-in form (S-04) and PKCE sign-in (S-07), on top of PR #29.
3. Remove the production fallback for Supabase config (S-05).
4. Account deletion endpoint and policy links (S-09).
5. CSP header (S-12) and the P2 database/schema fixes as one migration (S-13, S-15, S-17).
