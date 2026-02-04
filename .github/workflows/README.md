# GitHub Actions CI/CD

This project is configured with GitHub Actions workflows to validate code quality, build artifacts, and run automated tests.

## Workflows

### 1. **Test & Build** (`.github/workflows/test.yml`)

**Triggers:**
- Pull requests to `main` or `develop`

**Executes for each module in parallel:**
- Frontend (`src/front/app`)
- Platform API (`src/platform/api`)
- Game API (`src/game/api`)

**Validations:**

| Module | Steps |
|--------|-------|
| Frontend | ✅ `npm ci` – Install exact dependencies<br>✅ `npm run lint:format` – Verify code formatting (Prettier)<br>✅ `npm test` – Run memory leak prevention tests (Vitest)<br>✅ `npm run build` – Compile TypeScript and generate build artifacts |
| Platform API | ✅ `npm ci`<br>✅ `npm run lint:format`<br>✅ `npm run build` |
| Game API | ✅ `npm ci`<br>✅ `npm run lint:format`<br>✅ `npm run build` |

### 2. **Docker Build Check** (`.github/workflows/docker-build.yml`)

**Triggers:**
- Push/PR that modify files in `src/front`, `src/platform`, `src/game`, `src/nginx`, or `docker-compose*.yml`

**Validations:**
✅ Builds Frontend Docker image (without pushing)
✅ Builds Platform API Docker image (without pushing)
✅ Builds Game API Docker image (without pushing)
✅ Builds Nginx Docker image (without pushing)

## Recent Changes

### Memory Leak Prevention (Frontend)
The frontend application underwent a comprehensive memory leak audit and remediation:

- **Fixed memory leaks** in 8 critical components:
  - `MatchEngineComponent` – ResizeObserver and fullscreenchange listener cleanup
  - `UserStatsComponent` – Chartist chart detachment and animation timeout tracking
  - `FriendsBlockedComponent` & `FriendsRequestsComponent` – Profile component lifecycle management
  - `MatchComponent`, `Canvas.ts`, `RoundsSliderComponent`, `UserComponent` – Eliminated redundant cleanup code

- **Test Coverage**: 25 passing tests in `src/front/app/__tests__/memory-leaks.test.ts`
  - Tests verify AbortController usage, EventEmitter cleanup, Observer disconnection, and nested component destruction
  - All tests passing (100%) with zero warnings

## Repository Status

View workflow status at:
- **Actions Tab**: https://github.com/amethttp/amethpong/actions
- **Pull Requests**: Each PR shows a checkmark (✅) or X (❌) indicating pass/fail status

## Run Locally

To simulate CI checks locally:

### Frontend
```bash
cd src/front/app
npm ci
npm run lint:format
npm run build
npm test
```

### Platform API
```bash
cd src/platform/api
npm ci
npm run lint:format
npm run build
```

### Game API
```bash
cd src/game/api
npm ci
npm run lint:format
npm run build
```

## Adding Validation Steps

To add additional checks (new tests, linters, etc.), edit the YAML files in `.github/workflows/`:

Examples:
- **ESLint**: Add `npm run lint` step (configure eslintrc)
- **Unit tests**: Add `npm test` (Vitest is already configured for frontend)
- **E2E tests**: Add end-to-end testing step
- **Performance checks**: Add performance benchmarking
