FROM alpine:3.22.1

RUN apk add --no-cache nginx openssl

RUN unlink /etc/nginx/http.d/default.conf
COPY ./conf/transcendence.conf /etc/nginx/http.d/transcendence.conf

COPY --chmod=700 ./tools/init_nginx.sh /root/

EXPOSE 80
EXPOSE 443
EXPOSE 4321

WORKDIR /var/www/html

ENTRYPOINT [ "/root/init_nginx.sh" ]
CMD [ "nginx", "-g", "daemon off;" ]
