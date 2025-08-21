FROM alpine:3.22.1

RUN apk add --no-cache nodejs npm openssl

COPY --chmod=700 ./tools/init_game_api.sh /root

ENTRYPOINT [ "/root/init_game_api.sh" ]
CMD [ "tail", "-f", "/dev/null" ]
