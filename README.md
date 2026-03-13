# ft_transcendence

Surprise.

## Safe update workflow (without losing volumes)

The project uses bind-mounted volumes in `volumes/`, so data is preserved as long as you avoid destructive commands (`fdown`, `fclean`, `re`).

### Development

```bash
make update
```

This executes:
- `git pull --ff-only`
- `docker compose up -d --build --remove-orphans` (dev stack)

### Production

```bash
make update-prod
```

This executes the same flow using `docker-compose.prod.yml`.

### Manual safe rebuild (no pull)

```bash
make rebuild
make rebuild-prod
```

### Important

- `make down` stops containers but keeps data.
- `make fdown`, `make fclean`, and `make re` remove volumes/data.

## Automatic deploy (GitHub Actions)

On every push to `main`, GitHub Actions can deploy to your server via SSH using:

```bash
make update-prod
```

Workflow file: `.github/workflows/deploy-prod.yml`

Required repository secrets:
- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_SSH_PASSPHRASE` (optional)
- `DEPLOY_PATH`
