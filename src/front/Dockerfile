FROM alpine:3.22.1

RUN apk add --no-cache nodejs npm

COPY --chmod=700 ./tools/init_front.sh /root/

COPY --chmod=777 ./app /home/app

WORKDIR /home/app

EXPOSE 5173
EXPOSE 4173

ENTRYPOINT [ "/root/init_front.sh" ]
CMD [ "tail", "-f", "/dev/null" ]