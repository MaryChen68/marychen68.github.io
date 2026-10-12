# marychen68.github.io — Backlog

> **Goals**
>
> 1. Show my skills: a recruiter can tell I can build a complete product on my own
> 2. Truly learn how websites are built: frontend, backend, database, testing, deployment
> 3. Prepare for the next goal: ship an app on the App Store
>
> **Principle: Complexity is the biggest enemy.**
> Don't add a library or feature until a real problem needs it.
>
> **Pace:** 4 weeks, ~10–12 hours/week. Every week ends with something live and demoable.
>
> **How to use:** Change `[ ]` to `[x]` when done. An item is done only when its ✅ is met.

---

## Tech Stack

| Layer    | Tech                                            | Why                                             |
| -------- | ----------------------------------------------- | ----------------------------------------------- |
| Language | **TypeScript**                                  | One language for web, API, and app              |
| Frontend | **Vite + React + React Router**                 | Industry standard; carries over to React Native |
| Styling  | **Tailwind CSS** (+ a few shadcn/ui components) | Consistent, professional UI, fast               |
| Motion   | **Framer Motion**                               | One library is enough for polish                |
| Backend  | **Hono on Cloudflare Workers**                  | Light and free; the app can reuse the same API  |
| Database | **Cloudflare D1 (SQLite)**, raw SQL             | No ORM; learn SQL itself first                  |
| Testing  | **Vitest** (+ one Playwright test)              | Enough, not more                                |
| CI/CD    | **GitHub Actions**                              | Auto check and deploy on push                   |

**Repo layout** (one repo, two folders):

```
marychen68.github.io/
├── web/   # React frontend → GitHub Pages
└── api/   # Hono API → Cloudflare Workers
```

**Deliberately not using:** Lenis, TanStack Query, Drizzle, React Hook Form, Sentry, R2, monorepo tooling.
Add one only when it's truly needed and you can explain why.

---

## Week 1 — Foundations & Setup ✅

**Deliverable:** A React skeleton site that auto-deploys to `marychen68.github.io` on every push.

- [x] **1.1 HTML / CSS / JavaScript Basics** — skipped (concepts only)
  - Learn: semantic tags, box model, Flexbox, Grid, media queries; JS variables, functions, `map`/`filter`, objects, `async/await`, `fetch`
  - Why: React and Tailwind both end up as HTML/CSS/JS

- [x] **1.2 TypeScript Basics** — skipped (concepts only)
  - Learn: basic types, `type`, arrays and objects, optional fields, typed function params

- [x] **1.3 Git Workflow**
  - Learn: `status / add / commit / push / pull`, branches, pull requests, clear commit messages
  - Do: every feature goes new branch → PR → merge to `main`
  - Why: the standard team workflow; your commit history is part of your portfolio
  - ✅ At least one PR opened and merged

- [x] **1.4 Create the React Project**
  - Do: scaffold React + TS in `web/` with Vite; add Prettier (the template ships with oxlint)
  - Learn: what `package.json`, `node_modules`, `src/` vs `public/`, and `dev` vs `build` mean
  - ✅ Dev server works, build succeeds, files format on save

- [x] **1.5 Auto-Deploy with GitHub Actions**
  - Learn: what CI/CD is; how a workflow YAML is structured
  - Do: on push to `main`, run lint → format check → build → deploy to GitHub Pages
  - ✅ Change a line → push → site updates in minutes

- [x] **1.6 README**
  - Do: intro, tech stack, how to run locally
  - ✅ Someone else can run the project from the README alone

---

## Week 2 — Frontend: Complete Static Site

**Deliverable:** All pages done, mobile-friendly, with dark mode (content lives in code for now).

- [ ] **2.1 React Core**
  - Learn: components, JSX, props, `useState`, `useEffect`, lists and `key`, conditional rendering
  - Do: build `Navbar`, `Footer`, `ProjectCard`, and `Section` components
  - Why: components are the core of both React and React Native
  - ✅ Home page is built from components, with no copy-pasted markup

- [ ] **2.2 Separate Content from UI**
  - Do: put bio, projects, and experience in `web/src/content.ts`; components only display them
  - ✅ Adding a project = adding one object to `content.ts`

- [ ] **2.3 Routing**
  - Learn: React Router, dynamic routes (`/projects/:slug`), 404 page
  - Do: `/`, `/projects`, `/projects/:slug`, `/about`, 404
  - Note: GitHub Pages doesn't know client-side routes; add a `404.html` fallback or refreshes will 404
  - ✅ All pages link up; refreshing any page works

- [ ] **2.4 Design: Your Own Style**
  - Do: pick 1 background, 1 text, and 1 accent color, plus a heading font and a body font; put them in the Tailwind theme
  - Why: polish comes from consistency; borrow ideas, but make it yours
  - ✅ No hard-coded colors anywhere

- [ ] **2.5 Tailwind + Responsive Layout**
  - Learn: utility classes, `sm:` `md:` `lg:` breakpoints, mobile-first
  - ✅ Looks good at 375px, 768px, and 1440px, with no horizontal scroll

- [ ] **2.6 Dark Mode**
  - Do: follow the system setting by default; add a toggle that remembers the choice
  - ✅ Every page is readable in both modes

- [ ] **2.7 Real Content**
  - Home: intro, "now" cards (current work / education / looking for), featured projects, contact
  - Project page: context → what I did → challenges → results → links/screenshots
  - About: experience, education
  - Images go in `web/public/`
  - ✅ No placeholder text left

---

## Week 3 — Backend: API + Database

**Deliverable:** A live API on Cloudflare powering the contact form and page views.

**Why:** A static site can only display, not remember. When someone sends you a message, where does it go? This week is the "back" half of full-stack.

- [ ] **3.1 Backend Concepts**
  - Learn: client vs server, HTTP methods, status codes (200 / 201 / 400 / 401 / 404 / 500), JSON, REST
  - Do: watch real requests in the DevTools Network tab
  - ✅ Can explain what happens after clicking Submit

- [ ] **3.2 Hono API**
  - Do: create a Hono project in `api/`, add `GET /health`, deploy to Cloudflare Workers
  - Learn: routing, middleware, environment variables
  - ✅ `<API>/health` returns `{"ok": true}`

- [ ] **3.3 Database: D1 + SQL**
  - Learn: tables, primary keys, indexes; `SELECT` `INSERT` `UPDATE` `DELETE`; migrations
  - Do: create `messages` and `page_views` tables, managed with `.sql` migration files
  - ✅ Can explain every table and column

- [ ] **3.4 Two Endpoints**
  - `POST /messages`: validate → save → return 201
  - `GET` / `POST /views/:slug`: page views
  - Validate with a simple function (or Zod); return 400 with a clear message on bad input
  - ✅ curl tests pass for both good and bad input

- [ ] **3.5 Security Basics**
  - Learn: CORS, secrets, SQL injection (always use parameterized queries)
  - Do: CORS allows only your site; secrets live only in environment variables
  - ✅ No secrets in the repo; requests from other origins are blocked

- [ ] **3.6 Connect Frontend to API**
  - Do: handle loading / error / success with `fetch` + `useState`
  - ✅ Friendly message on errors, never a blank page

- [ ] **3.7 Auto-Deploy the API**
  - Do: add API deploy to GitHub Actions
  - ✅ Backend changes go live on push

---

## Week 4 — Motion, Tests & Launch

**Deliverable:** A polished, tested version ready for your résumé.

- [ ] **4.1 Motion with Framer Motion**
  - Do: scroll fade-ins, card hover, page transitions; keep it restrained
  - Respect `prefers-reduced-motion`
  - ✅ Smooth; animations turn off with reduced motion enabled

- [ ] **4.2 Testing**
  - Vitest: validation and every API endpoint
  - Playwright: one end-to-end test: home → project page → submit contact form
  - Why: tests are the clearest gap between students and engineers
  - ✅ Tests run in CI; failures block deploy

- [ ] **4.3 Performance + SEO + Accessibility**
  - Do: WebP + lazy-loaded images; per-page title and description; Open Graph share image; alt text; good contrast; keyboard-only navigation works
  - ✅ All four Lighthouse scores ≥ 90; link preview shows on LinkedIn

- [ ] **4.4 Analytics**
  - Do: add Cloudflare Web Analytics (one script tag)
  - ✅ Visit data shows up

- [ ] **4.5 (Optional) Custom Domain**
  - ✅ Site is reachable on your own domain over HTTPS

- [ ] **4.6 Launch**
  - Do: add an architecture diagram and screenshots to the README; update résumé and LinkedIn; get feedback from 3 people
  - ✅ Site is live and linked on your résumé

---

## Next: App Store

| Learned here       | Used in the app                           |
| ------------------ | ----------------------------------------- |
| TypeScript + React | → **React Native + Expo**                 |
| Hono API + D1      | → same backend                            |
| Tests + CI/CD      | → **EAS Build** auto-builds to TestFlight |

New for the app: user login (Sign in with Apple).

Prepare: Apple Developer Program ($99/year), read the App Review Guidelines, and decide what problem the app solves.

> It gets its own backlog later.
