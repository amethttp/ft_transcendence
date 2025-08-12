#! /bin/sh

sqlite3 /home/db/amethpong.db < /home/db/amethpong_script.sql
chmod 600 /home/db/amethpong.db

exec "$@"
