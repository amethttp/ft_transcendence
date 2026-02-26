#! /bin/sh

npm ci

if [ "$ENV" = "dev" ];
then
    npm run build;
fi


exec "$@"
