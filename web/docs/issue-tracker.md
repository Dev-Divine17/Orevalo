# Orevalo Issues and Errors

Use this document to track reported bugs and operational errors, including what
has been tried and whether the underlying problem is actually resolved.

## Statuses

- **Open** — reported, not yet investigated.
- **In progress** — someone is actively investigating or fixing it.
- **Blocked** — waiting on access, information, or an external dependency.
- **Resolved** — the cause was fixed and the result was verified.
- **Closed** — no further action is needed, for example when a report cannot be
  reproduced or is a duplicate.

Do not mark an issue **Resolved** just because a code change was made. Verify the
original problem no longer occurs, and note how it was verified.

## Issue list

| ID | Status | Issue | Reported |
| --- | --- | --- | --- |
| ORE-001 | Open | Email signup fails with a generic error; root cause not yet identified | 2026-11-10 |
| ORE-002 | Open | Internship feed includes unsuitable jobs and has inaccurate categories | 2026-11-14 |
| ORE-003 | Open | Scholarship details are incomplete and apply links must be official | 2026-11-14 |
| ORE-004 | Open | Bulk-reject the 235 existing pending internship listings | 2026-11-14 |
| ORE-005 | Open | Pause cron writes until internship filters are ready | 2026-11-14 |

## ORE-001 — Email signup fails with a generic error

- **Status:** Open
- **Reported:** 2026-11-10
- **Area:** Signup / Supabase Auth
- **Observed:** The signup form displays “We could not create that account. Try
  signing in instead.” The displayed message alone does not establish why
  signup failed.
- **Investigation so far:** The signup action now distinguishes duplicate
  account errors from other failures and logs non-sensitive Supabase error
  details on the server. Other signup failures receive a generic temporary
  failure message. This makes diagnosis easier but does not confirm the
  underlying signup problem is fixed.
- **Relevant code:** [`auth-actions.ts`](../src/app/auth-actions.ts)
- **Next steps:**
  1. Reproduce the signup failure and check the server logs for
     `[auth] Sign-up failed`.
  2. Use the error code/message to investigate the corresponding Supabase Auth
     logs and configuration.
  3. If the error indicates a profile insert or trigger failure, verify the
     `handle_new_user` function and `on_auth_user_created` trigger from
     [`0001_listings_and_profiles.sql`](../supabase/migrations/0001_listings_and_profiles.sql)
     exist in the Supabase project.
  4. Retry signup after addressing the cause, then update this entry with the
     verification result before changing its status to **Resolved**.

## ORE-002 — Internship feed includes unsuitable jobs

- **Status:** Open
- **Reported:** 2026-11-14
- **Area:** Internship sources, scraper filtering, and listing categories
- **Observed:** The pending queue reportedly contains 235 listings, most of
  which are experienced or senior jobs rather than internships or graduate
  roles. Examples include Chief Operating Officer, Chief Financial Officer,
  Head of Pharmacy, Registered Nurses, Teachers, Drivers, and Welders.
  Categories are also inaccurate (for example, Hotel Cook as Healthcare and
  Teachers as Technology).
- **Requested behavior:** Import only MyJobMag internship and graduate sections
  and Opportunity Desk internships. Reject senior roles and listings requiring
  years of experience. Assign categories based on the actual role, not broad or
  incorrect guesses. Keep Apply now links pointed at the employer's application
  page.
- **Investigation so far:** In
  [`scraper-sources.mjs`](../scripts/scraper-sources.mjs), MyJobMag is enabled
  at the general `/jobs` URL, while Opportunity Desk is enabled at its
  internships RSS feed. The MyJobMag source is therefore broader than
  requested. The repository confirms Opportunity Desk is configured on; it
  does not confirm the currently deployed Vercel configuration or recent
  successful imports.
- **Example to assess:** Julius Berger Electrical Engineer Graduate Trainee
  Programme 2026, with the supplied 0–1 year requirement. Verify the programme
  and an official Julius Berger application URL before accepting it.
- **Acceptance criteria:**
  1. MyJobMag is limited to its internship and graduate sections.
  2. Opportunity Desk imports internships only.
  3. Senior titles and requirements for years of experience are rejected.
  4. Categories accurately reflect each role.
  5. Apply now goes to the employer, not an aggregator.
  6. Dry-run results include representative accepted and rejected examples
     before scraper writes resume.
- **Relevant code:** [`scraper-sources.mjs`](../scripts/scraper-sources.mjs),
  [`scrape-opportunities.mjs`](../scripts/scrape-opportunities.mjs)

## ORE-003 — Scholarship details and application links are incomplete

- **Status:** Open
- **Reported:** 2026-11-14
- **Area:** Scholarship extraction and application links
- **Observed:** The Uppsala scholarship listing reportedly contains only a
  header and “Read More,” omitting information present on the source page.
  Its Apply now button points to Scholars4Dev rather than the university.
- **Requested behavior:** Extract the full structured scholarship description,
  including award amount, number of awards, eligible countries, eligibility,
  and application steps. Link Apply now directly to the university's official
  application page.
- **Acceptance criteria:** The Uppsala listing shows the available source
  details in readable fields or description text, and its application button
  links to the official university page. Do not publish a listing with an
  aggregator link presented as the official application link.
- **Relevant code:** [`scrape-opportunities.mjs`](../scripts/scrape-opportunities.mjs)

## ORE-004 — Bulk-reject the existing pending internship listings

- **Status:** Open
- **Reported:** 2026-11-14
- **Area:** Admin listing review / existing pending data
- **Observed:** The pending internship queue reportedly contains 235 unsuitable
  listings that would otherwise need to be rejected individually.
- **Requested behavior:** Reject the pending internship listings in one
  operation rather than deleting them, so the review history is retained.
- **Next steps:** Confirm the live pending-list count and that the bulk action
  targets listings only (not pending scholarships or already published
  listings), then reject the matching rows and verify the resulting count.

## ORE-005 — Pause scraper writes until filters are ready

- **Status:** Open
- **Reported:** 2026-11-14
- **Area:** Scheduled scraper / Vercel configuration
- **Requested behavior:** Stop new scraper entries until ORE-002's filters are
  ready.
- **Investigation so far:** The scheduled route reads
  `SCRAPER_CRON_DRY_RUN`; setting it to the exact string `true` makes the cron
  fetch and audit enabled sources without inserting records. It still runs the
  sources, so it pauses database writes, not scraper requests. The local
  `scrape:all` command is also dry-run by default and only writes when invoked
  with `--write`. Repository code cannot confirm whether the Vercel variable is
  currently set.
- **Next steps:** Set `SCRAPER_CRON_DRY_RUN=true` in the Vercel environment(s)
  used by the scheduled deployment, redeploy if required, and verify a cron
  response reports `"dryRun": true` and `"inserted": 0`. Keep it enabled until
  ORE-002 is verified.
- **Relevant code:** [`route.ts`](../src/app/api/cron/scrape/route.ts),
  [`scrape-all.mjs`](../scripts/scrape-all.mjs)

## Adding an issue

Copy this template and add a row to the issue list:

```markdown
## ORE-NNN — Short description

- **Status:** Open
- **Reported:** YYYY-MM-DD
- **Area:** Page, feature, or service
- **Observed:** What happened and what was expected.
- **Investigation so far:** Checks performed and their results.
- **Relevant code:** Links to related files, if known.
- **Next steps:** The next concrete action(s).
- **Resolution / verification:** Add when resolved; state how the original
  problem was confirmed fixed.
```

Never put passwords, API keys, access tokens, private user data, or full
authentication links in this tracker. Reference a secure log location instead.
