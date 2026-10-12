# marychen68.github.io

My personal website: [marychen68.github.io](https://marychen68.github.io)

## Tech stack

- **Frontend:** Vite, React, TypeScript, React Router, Tailwind CSS
- **Deploy:** GitHub Actions → GitHub Pages

## Run locally

Requires [Node.js](https://nodejs.org) 22+.

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

Run inside `web/`:

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with live reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run lint` | Check code for common mistakes |
| `npm run format` | Auto-format all files |

## Project structure

```
.github/workflows/  # CI/CD: lint, build, deploy on every push to main
web/                # React frontend
  public/           # Static files served as-is (favicon, images)
  src/
    content.ts      # All site text: edit this to change content
    components/     # Reusable UI pieces (navbar, cards, ...)
    pages/          # One file per page
```

## Deployment

Every push to `main` runs lint, format check and build, then deploys to GitHub Pages.
Pull requests run the same checks without deploying.
