# CodePilot AI — Frontend (Phase 2) ⚡

The complete frontend for **CodePilot AI**, an enterprise-grade AI-powered codebase assistant designed to help engineering teams understand, explore, analyze, and modify complex software repositories.

---

## 🚀 Key Features Implemented

1. **Intelligent Application Shell & Navigation**:
   - Collapsible desktop sidebar and mobile responsive drawer.
   - Global command palette search modal (`⌘K` / `Ctrl+K`) for instantaneous codebase traversal.
   - Breadcrumb navigation, notification menu, dark/light theme toggle, and workspace selector.

2. **Interactive Developer Marketing Page (`/`)**:
   - High-impact hero section, product UI preview window, multi-column feature breakdown, and 5-stage architecture workflow explanation.

3. **Authentication Interface (`/login`, `/signup`)**:
   - Accessible forms built with **React Hook Form** and **Zod** schema validation.
   - Explicitly labeled demo mode and quick demo credentials fill.

4. **Engineering Dashboard (`/app`)**:
   - Real-time telemetry cards, interactive activity area charts via **Recharts**, recent repositories and AI discussions, background indexing status, and an onboarding checklist.

5. **Repository Management & Exploration (`/app/repositories`, `/app/repositories/:id`)**:
   - Multi-language filtering, indexing health badges, search bar, and custom repository import modal with pre-configured sample projects.
   - Language breakdown distribution bars, commit/branch metrics, and quick navigation.

6. **Monaco Code Viewer (`/app/repositories/:id/files`)**:
   - Responsive 3-panel developer workspace:
     1. Nested, collapsible directory file tree with file-type icons and search filter.
     2. Integrated **Monaco Editor** in read-only mode with syntax highlighting, line numbers, copy, and download actions.
     3. Context metadata panel with line count, file size, and quick "Ask AI" exploration prompts.

7. **AI Coding Assistant Workspace (`/app/assistant`, `/app/assistant/:id`)**:
   - Conversation management (create, select, rename, delete with confirmation).
   - Context-aware chat thread supporting Markdown formatting, syntax-highlighted code blocks, copy-to-clipboard, file reference chips, and suggested prompt shortcuts.
   - Deterministic mock assistant engine providing architectural explanations and clearly labeled simulated fallbacks.

8. **Code Review & Diff Interface (`/app/reviews`, `/app/reviews/:id`)**:
   - Side-by-side and inline visual diff comparison using Monaco's `DiffEditor`.
   - Additions (`+`) and deletions (`-`) metrics, change audit comments, and demo-level Accept/Reject state management with confirmation modals.

9. **Background Jobs & Indexing Pipelines (`/app/jobs`, `/app/jobs/:id`)**:
   - Pipeline table with live progress bars, detailed event timelines, failure diagnostics, simulated retry triggers, and standard output terminal logs.

10. **Testing & Reliability Dashboard (`/app/testing`)**:
    - Pass/fail analytics, historical trend bar chart, test suite breakdowns, failure trace inspector drawer, and simulated test execution runner.

11. **Settings & Profile (`/app/settings`, `/app/profile`)**:
    - Customizable editor font size, tab spacing, default programming language, layout preferences, and editable developer profile with local session persistence.

---

## 🛠 Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Custom Dark Developer Design System)
- **Routing**: React Router v7 (`createBrowserRouter`)
- **State Management**: TanStack Query (`@tanstack/react-query`) + React Context API
- **Icons**: Lucide React
- **Charts**: Recharts
- **Code Viewing & Diffs**: Monaco Editor (`@monaco-editor/react`)
- **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **Notifications**: React Hot Toast
- **Testing**: Vitest + React Testing Library + jsdom

---

## 💻 Local Development & Scripts

Inside the `frontend/` directory:

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run automated Vitest test suite
npm run test

# Run ESLint validation
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment Configuration

The repository includes a ready-to-deploy Netlify configuration in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔌 Phase 3 Integration Readiness

- Centralized API client located in `src/services/api.js` configured with `VITE_API_BASE_URL`.
- Clean separation between presentation components and service handlers (`repositoryService`, `assistantService`, `reviewService`, `jobService`, `testService`).
- Simulated local delay and storage adapters can be seamlessly transitioned to remote Express/MongoDB endpoints without rewriting page views.
