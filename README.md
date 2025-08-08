## Resume Builder

A simple resume builder with a clean UI and LaTeX-backed PDF generation.

### Features
- Form-based editor for Basics, Links, Summary, Experience, Education, Projects
- Technical Skills section (multiple groups with labeled items)
- One-click PDF render and preview

### Tech
- Frontend: Next.js (React), TypeScript
- Backend: Fastify (TypeScript), Nunjucks, Tectonic (LaTeX → PDF)

### Requirements
- Node.js 18+
- Tectonic (LaTeX engine) — macOS: `brew install tectonic`

### Quick start
```
# install
cd backend && npm install
cd ../frontend && npm install

# run backend (http://127.0.0.1:3001)
cd ../backend
npm run dev

# run frontend (http://localhost:3000)
cd ../frontend
npm run dev
```

### Future scope
- Resume score
- Resume review by AI


