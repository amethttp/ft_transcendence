#! /bin/sh

install_database()
{
    sqlite3 /home/db/amethpong.db < /root/amethpong_script.sql
    chmod 600 /home/db/amethpong.db
}

create_https_certificates()
{
    if [ -f /etc/ssl/certs/transcendence.crt ] && [ -f /etc/ssl/private/transcendence.key ]; then return 0; fi;

    openssl req -x509 \
                -nodes \
                -days 365 \
                -newkey rsa:4096 \
                -keyout /etc/ssl/private/transcendence.key \
                -out /etc/ssl/certs/transcendence.crt \
                -subj "/C=SP/ST=Barcelona/L=Barcelona/O=42bcn/OU=42bcn/CN=amethpong.com/emailAddress=amethtystTeam@gmail.com"
}

install_database
create_https_certificates

npm ci && npm run build

exec "$@"
