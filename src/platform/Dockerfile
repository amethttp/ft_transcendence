FROM alpine:3.22.1

RUN apk add --no-cache nodejs npm sqlite

RUN mkdir -p /home/db

COPY --chmod=700 ./tools/init_database.sh /home/db
COPY --chmod=600 ./tools/amethpong_script.sql /home/db

ENTRYPOINT [ "/home/db/init_database.sh" ]
CMD [ "tail", "-f", "/dev/null" ]
