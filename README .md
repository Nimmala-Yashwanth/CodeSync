<div align="center">

# ⚡ CodeSync

### A real-time collaborative code editor for distributed development teams

**React · TypeScript · Monaco Editor · Yjs · WebSockets · Node.js · PostgreSQL · Docker**

![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white) ![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white) ![License](https://img.shields.io/badge/License-See%20LICENSE-lightgrey)

**Collaborate on code in the browser — with shared workspaces, live edits, and team presence.**

</div>

---

## Overview

CodeSync is a full-stack, browser-based collaborative IDE. Multiple authenticated users can work on the same source file in real time. It combines the Monaco editor with Yjs CRDT synchronization and a WebSocket backend, while Express and PostgreSQL manage accounts, workspaces, invitations, and file metadata.

> **Project scope:** Portfolio / local-development application. It has not been production deployed or security audited. The optional Docker code runner is experimental and disabled by default.

## Highlights

- **Real-time editing:** Shared document updates using Yjs and WebSockets.
- **Browser IDE:** Monaco editor with syntax highlighting and file explorer.
- **Authentication:** Register and sign in; protected workspace APIs.
- **Workspace sharing:** Owner-issued, email-restricted, single-use invitation tokens that expire after 24 hours. Invitations are copied/shared manually; the project does not send emails.
- **Collaborator presence:** Connected-user display and best-effort remote cursor markers.
- **File operations:** Create, rename, and delete workspace files.
- **Storage:** PostgreSQL-backed workspace data when `DATABASE_URL` is configured; otherwise an in-memory development fallback.
- **Experimental execution:** Opt-in JavaScript/Python execution using Docker restrictions. **Do not expose to untrusted users.**
- **Developer tooling:** npm workspaces, automated backend tests, Docker Compose, and GitHub Actions.

## Architecture

```mermaid
flowchart TD
  BrowserA[Browser A: React + Monaco + Yjs] <-->|WebSocket sync| API[Node.js API + WebSocket]
  BrowserB[Browser B: React + Monaco + Yjs] <-->|WebSocket sync| API
  BrowserA -->|REST| API
  BrowserB -->|REST| API
  API --> DB[(PostgreSQL 16)]
  API -.->|optional, local only| Runner[Docker JS / Python sandbox]
```

For design notes and limitations, see [Architecture](docs/ARCHITECTURE.md).

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Monaco Editor |
| Collaboration | Yjs, y-websocket, y-monaco, WebSocket |
| API | Node.js 22+, Express, Zod, Helmet |
| Data | PostgreSQL 16, `pg` |
| Infrastructure | Docker Desktop, Docker Compose |
| Quality | Node.js test runner, GitHub Actions, npm audit |

## Quick start (macOS / Apple Silicon or Intel)

**Prerequisites:** Node.js 22+, npm, and Docker Desktop running. Docker Desktop is only required for PostgreSQL or optional local code execution.

```bash
# 1. Clone the repository after uploading it to GitHub
# git clone https://github.com/YOUR_USERNAME/CodeSync.git
# cd CodeSync

# 2. Install dependencies
npm install

# 3. Create local configuration
cp .env.example .env

# 4. Generate an authentication secret
openssl rand -hex 32
# Paste the generated value into AUTH_SECRET in .env

# 5. Start PostgreSQL
docker compose up -d db

# 6. Validate the project
npm test
npm run build
npm audit

# 7. Start both dev servers
npm run dev
```

Open **http://localhost:5173**. The API runs at **http://localhost:4000**.

**Database:** `.env.example` uses the development credentials in `docker-compose.yml`. Keep `DATABASE_URL=postgres://codesync:codesync_dev_only@localhost:5432/codesync` for the local PostgreSQL container. The application loads `.env` from the project root. Never use these example credentials in a public environment.

**No Docker?** Comment out `DATABASE_URL` in `.env` for temporary in-memory development. Data durability is not guaranteed in this mode.

### Test two-account collaboration

1. Register **Account A** in a normal browser window and create a workspace.
2. Register **Account B** with a different email in an incognito window.
3. In A's workspace, invite B's registered email and copy the invitation token/link.
4. Sign in as B, accept the invitation using the token/link, and open the shared workspace.
5. Open the same file in both windows; edit from each side and observe updates.
6. Move the cursor in one window to check the remote presence marker in the other.

**Note:** Copying a workspace URL alone does not grant permission to another account.

## Project layout

```text
CodeSync/
├── apps/
│   ├── api/
│   │   ├── src/            # Express API, auth, store, WebSocket, runner
│   │   └── test/           # Backend tests
│   └── web/
│       └── src/            # React editor and UI
├── docs/
│   ├── ARCHITECTURE.md
│   └── TESTING.md
├── .github/workflows/ci.yml
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install workspace dependencies |
| `npm run dev` | Run frontend and API in development |
| `npm test` | Run backend tests |
| `npm run build` | Build frontend |
| `npm audit` | Check known dependency advisories |
| `docker compose up -d db` | Start local PostgreSQL |
| `docker compose ps` | Check database health |
| `docker compose down` | Stop Compose containers (preserves volumes) |

## Verification and limitations

The project has been exercised locally for live editing, two-window collaboration, and Docker PostgreSQL startup. Earlier backend test runs and npm audit output were reported as passing. **This GitHub packaging pass does not independently rerun dependency installation, builds, or end-to-end tests**; run the commands above on your own machine before publishing.

- The Docker code runner is **off by default** (`ENABLE_CODE_EXECUTION=false`). Its current timeout kills the Docker CLI process, which does **not guarantee** removal of the underlying container. Keep execution disabled until cleanup, concurrency limits, and isolation have been independently reviewed. See [Architecture](docs/ARCHITECTURE.md).
- Cursor presence is best-effort, not a full multi-server presence system.
- There are no full browser end-to-end tests or live PostgreSQL integration tests in this version.
- Local Compose development credentials must be replaced for any shared environment.
- This is not a production-hosted service and has no live demo URL.

## Screenshots

Screenshots are intentionally omitted from the source ZIP to avoid publishing personal account information. After running locally, add sanitized screenshots under `assets/` and reference them here.

## Roadmap

- [x] Shared Monaco editor with Yjs collaboration
- [x] Authentication and workspace APIs
- [x] File CRUD and invitation workflow
- [x] Local PostgreSQL and Docker setup
- [ ] Harden code-execution cleanup and abuse controls
- [ ] PostgreSQL integration and browser E2E test coverage
- [ ] Better error states and accessibility review
- [ ] Optional production deployment

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and improvements are welcome.

## Security

Do not commit `.env`, passwords, invitation tokens, or database dumps. See [SECURITY.md](SECURITY.md) before enabling experimental execution.

## License

See [LICENSE](LICENSE) for the repository license terms.
