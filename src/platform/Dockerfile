FROM alpine:3.22.1

RUN apk add --no-cache nodejs npm sqlite openssl

COPY --chmod=600 ./conf/sqlite.conf /root/.sqliterc
COPY --chmod=700 ./tools/init_platform_api.sh /root/
COPY --chmod=600 ./tools/amethpong_script.sql /root/

COPY --chmod=777 ./api /home/app

WORKDIR /home/app

EXPOSE 443
EXPOSE 8080

ENTRYPOINT [ "/root/init_platform_api.sh" ]
CMD [ "tail", "-f", "/dev/null" ]
