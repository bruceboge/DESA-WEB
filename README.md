# DESA — Dedan Kimathi University Engineering Students Association Web Portal

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://esa-dekut.vercel.app)

The official web platform of the **Dedan Kimathi University of Technology Engineering Students Association (DESA)** in Nyeri, Kenya. 

This portal serves as the unified digital hub for engineering students, faculty, and industry partners across all five engineering disciplines at DeKUT: **Mechatronic**, **Mechanical**, **Electrical & Electronic**, **Civil**, and **Chemical Engineering**.

Live URL: [https://esa-dekut.vercel.app](https://esa-dekut.vercel.app)

---

## 🚀 Key Features & Modules

- **🏛️ Homepage & Live Pulse Ticker**: Dynamic banner announcing upcoming workshops, symposiums, student project spotlights, and secretariat notices.
- **🎓 Membership Portal (`/membership`)**: 
  - New member registration and renewals.
  - Public membership status lookup by registration number, with rate limiting and masked identity details.
  - Digital membership card/badge preview.
- **💡 Innovations & Technical Dispatches (`/innovations`)**:
  - Showcase for student-led hardware/software prototypes, engineering research, and project writeups.
  - Rich markdown rendering with support for code highlighting, diagrams, and callouts.
- **📅 News & Events Calendar (`/news-events`)**:
  - Detailed schedule of engineering symposia, hackathons, industrial visits, and webinars.
  - Past event archives and downloadable recaps.
- **👔 Annual Engineering Gala Portal (`/gala`)**:
  - Dedicated event microsite for ticketing, dress code guidelines, award nominations, and partner sponsorships.
  - Integrated registration workflow stored in Supabase.
- **📸 Media Gallery (`/gallery`)**:
  - High-resolution photo galleries from design summits, robotics showcases, competitions, and community outreach.
- **📋 General Assembly Digital Roll Call (`/roll-call`)**:
  - Quick, paperless attendance capture for association meetings and committee sessions.
- **📬 Helpdesk & Contact Center (`/contact`)**:
  - Direct inquiry submission with automated tracking ticket generation.
- **️ Built-in Anti-Spam & Security**:
  - Multi-tier honeypot validation, cryptographic challenge verification, and rate limiting to prevent bot submissions.
- **🔍 SEO & OpenGraph Optimized**:
  - Dynamic OpenGraph cards (`/api/og`), sitemap generator (`sitemap.ts`), and schema.org structured data for maximum discoverability.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Primary storage** | [Supabase](https://supabase.com/) Postgres + Supabase Storage |
| **Sheets mirror** | Supabase Edge Function + [Google Apps Script](https://developers.google.com/apps-script) (database outbox, retryable delivery) |
| **Analytics & Telemetry** | [@vercel/analytics](https://vercel.com/analytics) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 📂 Project Architecture

```plaintext
DESA WEB/
├── content/                    # Static content, articles & initial datasets
│   ├── data/                   # JSON seed records (innovations, events, gallery)
│   └── posts/                  # Markdown files for historical posts & updates
├── google-apps-script-desa-portal.js  # Google Sheets mirror sink; Supabase remains the source of truth
├── supabase/functions/         # Edge Functions, including asynchronous Sheets delivery
├── supabase/migrations/        # Database, RLS, storage bucket and sync outbox setup
├── scripts/                    # Initial content seeding script
├── public/                     # Static public assets (logos, icons, images)
├── src/
│   ├── app/                    # Next.js App Router routes & API endpoints
│   │   ├── (legal)/            # Privacy, terms, cookies, refund policies
│   │   ├── about/              # About DESA, history, mission & constitution
│   │   ├── admin/              # Secretariat administrative dashboard
│   │   ├── api/                # Backend API routes (membership, gala, contact, upload, etc.)
│   │   ├── contact/            # Support ticket & contact form
│   │   ├── departments/        # Departmental overviews & student reps
│   │   ├── gala/               # Annual Gala portal & registration
│   │   ├── gallery/            # Interactive photo & multimedia gallery
│   │   ├── innovations/        # Student project showcases & tech blogs
│   │   ├── leadership/         # Executive council directory
│   │   ├── membership/         # Membership registration & verification
│   │   ├── news-events/        # Events listing & article detail pages
│   │   ├── roll-call/          # Assembly attendance logging
│   │   ├── layout.tsx          # Root layout with TopBar, Navbar, Footer, CookieConsent
│   │   └── page.tsx            # Main landing page
│   ├── components/             # Reusable UI components (Hero, Navbar, Footer, RichEditor, etc.)
│   ├── data/                   # Program definitions and academic constants
│   └── lib/                    # Core utilities (dataStore, antiSpam, imageOptimization, posts)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and set these values. The Supabase service-role key must stay server-side: never prefix it with `NEXT_PUBLIC_`, commit it, or expose it in browser code. `ADMIN_EMAILS` is a comma-separated allowlist of verified Supabase Auth accounts permitted to access the admin console.
The site can still serve its normal pages without Supabase, but database-backed content and form submissions require these settings. When news cannot be read from Supabase, the site uses its committed Markdown posts; other database-dependent features show an unavailable message or return an API error instead of claiming the operation succeeded.

```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="server-only-service-role-key"
ADMIN_EMAILS="secretariat@example.com"
```

---

## 🏃 Getting Started

### Prerequisites

- **Node.js** (v20.9 or newer)
- **npm**, **pnpm**, or **yarn**

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/bruceboge/DESA-WEB.git
cd DESA-WEB
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`, then add the actual secret values:

```bash
cp .env.example .env.local  # If .env.example is available, or create manually
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## ☁️ Supabase Setup

Supabase is the source of truth for admin content, member forms, contact inquiries, Gala registrations, innovations submissions, and roll-call entries. All writes are server-side using the service-role key. Row Level Security is enabled with no public access to `portal_records` or the Sheets sync queue. Public pages only receive the specific published content they need through server routes.

1. Create a Supabase project and copy its project URL, **anon** key, and **service_role** key into `.env.local` and Vercel Environment Variables. Keep the service-role key server-only.
2. In **Authentication > Users**, create or invite a separate verified Supabase Auth account for each administrator. Use a unique strong password for each account. Set `ADMIN_EMAILS` to the comma-separated list of those exact email addresses. Accounts not on this server-side allowlist cannot access admin APIs.
3. In the Supabase SQL Editor, run the migrations in order: [`20261020001_initial_portal_storage.sql`](./supabase/migrations/20261020001_initial_portal_storage.sql), [`20261020002_remove_membership_sync_secret.sql`](./supabase/migrations/20261020002_remove_membership_sync_secret.sql), [`20261023001_member_registration_integrity.sql`](./supabase/migrations/20261023001_member_registration_integrity.sql), [`20261024001_meetings_and_record_trash.sql`](./supabase/migrations/20261024001_meetings_and_record_trash.sql), [`20261024002_admin_security_and_references.sql`](./supabase/migrations/20261024002_admin_security_and_references.sql), and [`20261026001_enforce_meeting_day_roll_call.sql`](./supabase/migrations/20261026001_enforce_meeting_day_roll_call.sql). These create private record tables and the retryable Sheets outbox, remove any previously stored membership sync secret, enforce unique registration numbers across member records, add meeting-based attendance plus reversible Trash, enable admin session controls and sequential public references, and enforce the scheduled-day rule inside the attendance database function.
4. Run `npm run supabase:seed` once to import the committed article and gallery starter records. Existing Google Sheet history is not automatically imported; import the historical rows into Supabase before relying on the database for those records. All current application queries, including membership lookup, read Supabase only.
5. In the admin console, use the **Meetings & roll call** main tab to create and publish a meeting in one step. It is listed publicly for check-in only on its scheduled date; both the API and database reject attendance outside that Nairobi calendar day. Select a meeting title in the same tab to view its attendees, or close it to stop check-in. Past attendance remains linked to its meeting. Use Trash to restore records or permanently delete them; a meeting with attendance history cannot be permanently deleted.

### Importing historical member and Gala CSV files

The one-time importer accepts the legacy `Members` and `GalaRegistrations` CSV headers, inserts records into `portal_records`, and never overwrites a record with the same import ID. It is a local dry run by default. It keeps the first member row when normalized registration numbers repeat, retains all Gala rows, and checks existing Supabase member registrations before writing.

1. Apply the migrations above and back up the database and Sheet.
2. Pause the `desa-sheets-sync` cron job before a committed import. Imported records enter the durable outbox automatically; allowing the job to run before linking their IDs to existing Sheet rows can append duplicate-looking rows.
3. Run a dry run, passing the two CSV paths:

   ```powershell
   npm run supabase:import-history -- --members "C:\path\Members.csv" --gala "C:\path\GalaRegistrations.csv"
   ```

4. Review the aggregate counts. To commit, include a private manifest path; the manifest contains record type, CSV source row, and generated record ID, but no personal fields:

   ```powershell
   npm run supabase:import-history -- --members "C:\path\Members.csv" --gala "C:\path\GalaRegistrations.csv" --manifest "C:\private\desa-history-import-manifest.csv" --commit
   ```

   The command uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`. Keep that file and the manifest private. If a registration already exists in Supabase, the importer stops without writing; review that conflict rather than merging automatically.
5. In the existing `Members` and `GalaRegistrations` tabs, add each imported record ID from the manifest to the matching row under `SupabaseRecordID`. Match by source row only if the Sheet row ordering still matches the exported CSV; otherwise match and verify records carefully. Do not assign an ID to the duplicate member row that the importer skipped.
6. Deploy a new Apps Script version from [`google-apps-script-desa-portal.js`](./google-apps-script-desa-portal.js). It writes Gala mirrors to `GalaRegistrations` and adds missing mirror headers to existing tabs without replacing their current data. Resume the cron job only after the IDs are linked, then verify a sample in Supabase, the admin page, the member lookup, and both Sheet tabs.

## ☁️ Google Apps Script Sheets Mirror Setup

Supabase is the only application database. Database triggers add changes to a private, durable outbox; the Supabase `sync-sheets` Edge Function claims those events and calls Apps Script. Apps Script is only a mirror sink: it does not serve application lookups or accept form submissions. If Sheets is unavailable, records remain saved in Supabase and the outbox retries with backoff.

1. Open the master Google Sheet, choose **Extensions > Apps Script**, and replace the script with [`google-apps-script-desa-portal.js`](./google-apps-script-desa-portal.js). Meeting records sync to a `Meetings` tab; the `RollCall` tab now includes each attendance record's meeting ID. The script creates these tabs and headers when needed.
2. Generate a high-entropy secret. Set it as `SHARED_SECRET` in Apps Script **Project Settings > Script Properties**.
3. Deploy Apps Script as a **Web app** (execute as you; access: anyone). Copy its `/exec` URL.
4. Configure the Supabase Edge Function secrets (do not add these to Vercel or `.env.local`):

   ```bash
   supabase secrets set --project-ref <project-ref> APPS_SCRIPT_URL="https://script.google.com/macros/s/<deployment-id>/exec" APPS_SCRIPT_SECRET="<same-high-entropy-secret>" SHEETS_SYNC_FUNCTION_SECRET="<different-high-entropy-secret>"
   supabase functions deploy sync-sheets --project-ref <project-ref>
   ```

5. In Supabase Vault, store two secrets: `sheets_sync_function_url` (the full `https://<project-ref>.supabase.co/functions/v1/sync-sheets` URL) and `sheets_sync_function_secret` (the same secret set as `SHEETS_SYNC_FUNCTION_SECRET`). The function disables gateway JWT verification but rejects every request without this separate high-entropy header secret. Enable the `pg_cron` and `pg_net` extensions in Supabase if needed, then schedule the Edge Function from the SQL Editor:

   ```sql
   select cron.schedule(
     'desa-sheets-sync',
     '* * * * *',
     $$
     select net.http_post(
       url := (select decrypted_secret from vault.decrypted_secrets where name = 'sheets_sync_function_url'),
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-sync-secret',
           (select decrypted_secret from vault.decrypted_secrets where name = 'sheets_sync_function_secret')
       ),
       body := jsonb_build_object('scheduled_at', now())
     );
     $$
   );
   ```

6. Confirm a new form submission appears in `portal_records` and `sheet_sync_outbox`, then verify the corresponding spreadsheet tab. Form responses indicate successful database storage only; they do not wait for Sheets.

When Apps Script code or secrets change, deploy a **new version** and confirm `APPS_SCRIPT_URL` points to the current deployment. `APPS_SCRIPT_SECRET` in Supabase and `SHARED_SECRET` in Apps Script must match exactly. If delivery fails, inspect the Edge Function logs and `sheet_sync_outbox.last_error`; the database write is not rolled back and the queue retries. Remove the former `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`, and `CRON_SECRET` values from Vercel and `.env.local`.

## 🚀 Vercel Deployment Setup

Import the project into Vercel from GitHub using the repository root as the Root Directory and the detected Next.js framework/build settings. Keep the package lockfile in Git so Vercel installs the locked dependencies. The project requires Node.js 20.9 or newer.

Set these variables in Vercel **Project Settings > Environment Variables** for each environment where the app will run (Production, and Preview/Development if needed):

- `SUPABASE_URL` — the project URL.
- `SUPABASE_ANON_KEY` — the Supabase anon/public API key, used server-side for admin authentication.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key used for database operations. Never prefix it with `NEXT_PUBLIC_`.
- `ADMIN_EMAILS` — comma-separated list of verified Supabase Auth administrator emails.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — optional Google Search Console verification token. This is public metadata, not a secret.

Use real values only in Vercel’s encrypted environment-variable settings or your private local `.env.local`; do not put values in GitHub, source files, or build logs. After setting or changing variables, redeploy. Vercel is not responsible for Sheets synchronization; the Edge Function and its secrets are configured in Supabase separately.

If admin sign-in reports missing Supabase Auth configuration, set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ADMIN_EMAILS` in the same environment where the app is running and restart/redeploy it. These are separate from the server-only `SUPABASE_SERVICE_ROLE_KEY`.

Admin sign-in uses confirmed Supabase Auth accounts on the `ADMIN_EMAILS` allowlist and a password. The server registers each successful login as an application session. Every privileged API request checks the Supabase user and that session’s server-side record; logout revokes that session. Sessions expire after 15 minutes without activity and have an 8-hour maximum lifetime, though the Supabase access-token expiry may end a session sooner. The token is kept in an HttpOnly, Secure-in-production, SameSite=Strict cookie. Passwords and the service-role key are never stored in browser storage. Admin mutations and uploads write actor/action metadata to the private audit table; sign-in attempts are rate-limited in shared database storage. Human-facing member, contact, and roll-call references are issued sequentially; internal database keys remain unique opaque IDs. Public membership lookup is intentionally limited to registration-number lookup with rate limiting and masked names; it is not identity verification, so someone who knows a valid registration number may see the returned status summary. If this exposure is not acceptable, use email verification before enabling public lookup.

---


## 🤝 Contributing

We welcome contributions from DeKUT students, alumni, and open-source enthusiasts:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'Add amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

Please follow code linting standards before submitting:

```bash
npm run lint
```

---

## 📄 License & Credits

- Maintained by the **DESA Executive Council & Tech Committee** at [Dedan Kimathi University of Technology](https://www.dkut.ac.ke).
- Designed for the advancement of engineering students across Kenya.
