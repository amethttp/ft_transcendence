# GitHub Actions CI/CD

Este proyecto está configurado con dos workflows de GitHub Actions para validar la calidad del código:

## Workflows

### 1. **Test & Build** (`.github/workflows/test.yml`)
Se ejecuta en:
- Push a `main`, `develop` o ramas `feature/**`
- Pull requests a `main` o `develop`

**Ejecuta para cada módulo:**
- Frontend (`src/front/app`)
- Platform API (`src/platform/api`)
- Game API (`src/game/api`)

**Validaciones:**
✅ `npm ci` - Instala dependencias exactas  
✅ `npm run lint:format` - Verifica formato de código (Prettier)  
✅ `npm run build` - Compila TypeScript y genera artefactos

### 2. **Docker Build Check** (`.github/workflows/docker-build.yml`)
Se ejecuta en:
- Push/PR que modifiquen archivos en `src/front`, `src/platform`, `src/game`, `src/nginx` o `docker-compose*.yml`

**Validaciones:**
✅ Construye todas las imágenes Docker sin hacerlas push  
✅ Verifica que los Dockerfiles sean válidos

## Status en el Repositorio

Puedes ver el estado de los workflows en:
- **Actions tab**: https://github.com/amethttp/amethpong/actions
- **En PRs**: Aparecerá un checkmark o X indicando si pasaron/fallaron

## Ejecutar localmente

Para simular lo que hace el CI localmente:

### Frontend
```bash
cd src/front/app
npm ci
npm run lint:format
npm run build
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

## Agregar más validaciones

Para agregar más checks (tests, linters, etc.), edita los archivos YAML en `.github/workflows/`

Ejemplos:
- **ESLint**: Agregar `npm run lint` si configuras ESLint
- **Unit tests**: Agregar `npm test` si configuras Jest/Vitest
- **E2E tests**: Agregar paso para tests end-to-end
