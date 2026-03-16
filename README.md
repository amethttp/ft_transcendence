<div align="center">

### ft_transcendence – AmethPong

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/amethttp/ft_transcendence)

</div>

---

### Table of contents

- [Overview](#overview)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Project Layout (High Level)](#project-layout-high-level)
- [Running the Project](#running-the-project)
  - [Prerequisites](#prerequisites)
  - [Development Environment](#development-environment)
  - [Production Environment](#production-environment)
- [Deployment (GitHub Actions)](#deployment-github-actions)
- [License](#license)

---

### Overview

`ft_transcendence` is a full‑stack real‑time Pong platform built for the 42 curriculum (subject version **18.0**).  
It combines a custom TypeScript SPA, Fastify microservices and a PostgreSQL database to deliver competitive online matches, tournaments, statistics and social features.

The goal of this project is not only to re‑implement Pong, but to design a **secure, production‑ready web platform**: HTTPS everywhere, JWT‑based auth, optional 2FA, OAuth login, tournament matchmaking, live game engine over WebSockets and a privacy‑aware user data model.

---

### Architecture Overview

- **Frontend**
  - Single‑Page Application written in **TypeScript** with a custom component system (`AmethComponent`) and router.
  - DOM is managed manually (no React/Vue/Angular) using small framework utilities for routing, forms, alerts and layout.
  - Styling is done with **Tailwind CSS** plus a set of project‑specific utility classes.
  - Game UI (Pong) is rendered on an HTML5 canvas with a responsive overlay for status, prompts and full‑screen mode.

- **Backend**
  - **Platform API (Fastify + TypeScript)**  
    - User management, authentication, OAuth2, 2FA, avatars and friend system.  
    - Match history, rankings, stats dashboard and GDPR‑compliant data export / account deletion.  
    - Exposes REST endpoints consumed by the SPA and the Game API.
  - **Game API (Fastify + `fastify-socket.io`)**  
    - Real‑time match engine and matchmaking over secure WebSockets (WSS).  
    - Handles remote players, AI opponent logic and local two‑player keyboard matches.  
    - Responsible for pausing/resuming matches on disconnect and safely persisting final scores to the Platform API.

- **Database**
  - **PostgreSQL** as the single source of truth for users, sessions, matches, tournaments, stats and social relationships.
  - Strict separation between user identity data and gameplay history to support GDPR‑compliant anonymisation.

- **Infrastructure**
  - **Docker**‑based environment with separate services for frontend, Platform API, Game API, database and reverse proxy.
  - **Nginx** configured as a reverse proxy for HTTPS and secure WebSockets, with separate routes for platform and game traffic.
  - Optional **GitHub Actions** pipeline for continuous deployment to a remote server.

---

### Key Features

- **Real‑Time Pong Engine**
  - Deterministic physics engine running on the server with snapshots broadcast over WebSockets.
  - Support for **online 1v1**, **local two‑player** mode (shared keyboard) and **AI opponent** mode.
  - AI is intentionally imperfect: it simulates “human‑like” vision and reaction time instead of perfect prediction.

- **Tournaments & Matchmaking**
  - Automatic tournament bracket generation and progression (rounds, matches, winners/losers).
  - Public and private tournaments with invitation links.
  - Automatic matchmaking for regular public matches with fair, symmetric rules.

- **User & Social Layer**
  - Accounts with avatars (upload + default avatars), profile pages and game history.
  - Friend system with online/offline presence, friend requests and blocked users.
  - **OAuth2** login (e.g. 42 / Google) on top of the internal authentication.
  - Optional **2FA** using time‑based one‑time passwords to protect logins.

- **Security & Privacy**
  - Passwords hashed with modern algorithms (bcrypt/argon2 on the Platform API side).  
  - JWT‑based authentication with `HttpOnly`, `Secure` and `SameSite` cookies for session handling.
  - Input validation and output escaping in the SPA (`DOMHelper.sanitizeHTML`, safe `textContent` usage) to defend against XSS.
  - ORM/query‑builder and parameterised queries to avoid SQL injection in the APIs.
  - Account deletion anonymises the user (e.g. renaming to “DeletedUser”) while preserving match records and rivals’ stats.
  - Endpoint for exporting all personal data as JSON to satisfy **GDPR** requirements.

---

### Project Layout (High Level)

- `src/front/app/` – TypeScript SPA (AmethComponent framework, router, layouts, pages and widgets).
  - `framework/` – Router, core component base class, form helpers, alerts, socket client, etc.
  - `PublicLayout/` – Landing, login, registration, password recovery, OAuth callback, privacy page.
  - `PrivateLayout/` – Home, play area, matches, tournaments, friends, user profile, stats, settings.
  - `styles/` – Tailwind CSS config and custom component utilities.
- `src/platform/api/` – Platform API (Fastify + TypeScript).
  - Controllers, services, entities, repositories, validation and security middleware (auth, 2FA, JWT).
- `src/game/api/` – Game API (Fastify + Socket.IO).
  - Match engine, room management, AI opponent, WebSocket handlers and match persistence.
- `docker-compose.yml` / `docker-compose.prod.yml` – Development and production orchestration stacks.
- `nginx/` – Reverse proxy configuration for HTTPS, WSS and routing between Platform/Game/Frontend.
- `.github/workflows/` – CI/CD pipelines, including production deployment workflow.

---

### Running the Project

#### Prerequisites

- Docker and Docker Compose installed.
- A recent version of `make`.
- Optional: a domain name and TLS certificates if you intend to run in production with HTTPS.

#### Development Environment

The project uses bind‑mounted volumes in `volumes/`, so your data is preserved as long as you avoid destructive targets (`fdown`, `fclean`, `re`).

- **Start / update the dev stack safely**

```bash
make update
```

This will:

- Run `git pull --ff-only`.
- Build and start the development Docker stack via:
  - `docker compose up -d --build --remove-orphans`

#### Production Environment

- **Update and (re)deploy the production stack**

```bash
make update-prod
```

This follows the same flow using `docker-compose.prod.yml` and is designed to be safe for volumes.

#### Manual Safe Rebuild (no `git pull`)

```bash
make rebuild
make rebuild-prod
```

Use these targets when you want to rebuild containers without touching the Git history.

#### Important Make Targets

- `make down` – Stop containers but **keep volumes and data**.
- `make fdown` – Stop containers and remove volumes (**data loss**).
- `make fclean` – Full clean of containers, images and volumes (**data loss**).
- `make re` – Clean and rebuild the entire stack (**data loss**).

---

### Deployment (GitHub Actions)

On every push to `main`, GitHub Actions can deploy the latest version to your server over SSH by running:

```bash
make update-prod
```

- Workflow file: `.github/workflows/deploy-prod.yml`
- Required repository secrets:
  - `DEPLOY_HOST`
  - `DEPLOY_PORT`
  - `DEPLOY_USER`
  - `DEPLOY_SSH_KEY`
  - `DEPLOY_SSH_PASSPHRASE` (optional)
  - `DEPLOY_PATH`

---

### License

This project is developed in the context of the 42 school `ft_transcendence` assignment.  
If you intend to reuse or redistribute it outside that context, please check with the original authors and your campus rules first.
