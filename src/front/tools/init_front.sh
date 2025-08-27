#! /bin/sh

npm ci && npm run build

exec "$@"
