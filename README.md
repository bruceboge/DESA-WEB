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

- **🏛️ Homepage & Live Pulse Ticker**: Dynamic banner announcing upcoming workshops, symposiums, student project spotlights, and real-time secretariat notices.
- **🎓 Membership Portal (`/membership`)**: 
  - New member registration and renewals.
  - Member verification and lookup with privacy masking (e.g. `Dedan Kimathi.`).
  - Digital membership card/badge preview.
- **💡 Innovations & Technical Dispatches (`/innovations`)**:
  - Showcase for student-led hardware/software prototypes, engineering research, and project writeups.
  - Rich markdown rendering with support for code highlighting, diagrams, and callouts.
- **📅 News & Events Calendar (`/news-events`)**:
  - Detailed schedule of engineering symposia, hackathons, industrial visits, and webinars.
  - Past event archives and downloadable recaps.
- **👔 Annual Engineering Gala Portal (`/gala`)**:
  - Dedicated event microsite for ticketing, dress code guidelines, award nominations, and partner sponsorships.
  - Integrated registration workflow powered by Google Apps Script.
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
| **Database & Forms Backend** | [Google Apps Script](https://developers.google.com/apps-script) + Google Sheets (Serverless Webhook API) |
| **Analytics & Telemetry** | [@vercel/analytics](https://vercel.com/analytics) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 📂 Project Architecture

```plaintext
DESA WEB/
├── content/                    # Static content, articles & initial datasets
│   ├── data/                   # JSON seed records (innovations, events, gallery)
│   └── posts/                  # Markdown files for historical posts & updates
├── google-apps-script-desa-portal.js  # Unified Google Apps Script (Members, Tickets, Notices, RollCall, Innovations)
├── google-apps-script-gala.js         # Dedicated Gala ticketing & registration script
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

Create a `.env.local` file in the root directory and populate the required keys:

```bash
# Unified Google Apps Script Webhook (Master Database: Members, Tickets, Notices, RollCall, Innovations)
APPS_SCRIPT_URL="https://script.google.com/macros/s/<YOUR_DEPLOYMENT_ID>/exec"
APPS_SCRIPT_SECRET="your-shared-apps-script-secret"

# Administrative Portal Passcode
ADMIN_SECRET="your-admin-secret-passphrase"

# Annual Gala Registration Webhook
GALA_SCRIPT_SECRET="your-gala-shared-secret"
GALA_SCRIPT_URL="https://script.google.com/macros/s/<YOUR_GALA_DEPLOYMENT_ID>/exec"
```

---

## 🏃 Getting Started

### Prerequisites

- **Node.js** (v18.18 or newer recommended, v20+ preferred)
- **npm**, **pnpm**, or **yarn**

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/bruceboge/DESA-WEB.git
cd DESA-WEB
npm install
```

### 2. Configure Environment

Copy sample variables or create `.env.local`:

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

## ☁️ Google Apps Script Backend Setup

The platform uses two lightweight Google Apps Script backends linked to Google Sheets for database operations:

1. **Master Portal Database (`google-apps-script-desa-portal.js`)**:
   - Manages `Members`, `Tickets`, `Opportunities`, `Notices`, and `RollCall` sheets.
   - Open your Master Google Sheet > **Extensions** > **Apps Script**, paste the code from `google-apps-script-desa-portal.js`.
   - Under **Project Settings** > **Script Properties**, set `SHARED_SECRET` matching `APPS_SCRIPT_SECRET`.
   - Deploy as a **Web App** (Execute as: *Me*, Access: *Anyone*).
   - Copy the published `/exec` URL into `APPS_SCRIPT_URL` in `.env.local`.

2. **Gala Ticketing Script (`google-apps-script-gala.js`)**:
   - Manages Gala attendee records, payment verification references, and ticket allocation.
   - Deploy as a Web App with `SHARED_SECRET` matching `GALA_SCRIPT_SECRET` and paste URL into `GALA_SCRIPT_URL`.

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
