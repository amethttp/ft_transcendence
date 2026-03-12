#! /bin/sh

install_tls_from_letsencrypt()
{
    CERT_NAME="${CERT_NAME:-amethpong.fun}"
    LE_CERT="/etc/letsencrypt/live/${CERT_NAME}/fullchain.pem"
    LE_KEY="/etc/letsencrypt/live/${CERT_NAME}/privkey.pem"

    if [ ! -f "$LE_CERT" ] || [ ! -f "$LE_KEY" ]; then return 1; fi;

    cp "$LE_CERT" /etc/ssl/certs/transcendence.crt
    cp "$LE_KEY" /etc/ssl/private/transcendence.key
    chmod 600 /etc/ssl/private/transcendence.key
    return 0
}

create_tls_cert()
{
    if install_tls_from_letsencrypt; then return 0; fi;

    if [ -f /etc/ssl/certs/transcendence.crt ] && [ -f /etc/ssl/private/transcendence.key ]; then return 0; fi;

    openssl req -x509 \
                -nodes \
                -days 365 \
                -newkey rsa:4096 \
                -keyout /etc/ssl/private/transcendence.key \
                -out /etc/ssl/certs/transcendence.crt \
                -subj "/C=SP/ST=Barcelona/L=Barcelona/O=42bcn/OU=42bcn/CN=amethpong.com/emailAddress=amethtystTeam@gmail.com"
}

create_tls_cert
exec "$@"
