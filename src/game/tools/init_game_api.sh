#! /bin/sh

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

create_https_certificates

npm ci

exec "$@"
