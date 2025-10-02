import fastify from 'fastify';
import fs from 'fs';
import type { Socket } from 'socket.io';
import fastifySocketIO from 'fastify-socket.io';
import { Room } from './match/models/Room';
import { Player } from './match/models/Player';

const server = fastify({
  https: {
    key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
    cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt'),
  },
});

const main = async () => {
  await server.register(fastifySocketIO as any, {
    cors: {
      origin: `${process.env.CLIENT_HOST}`,
      credentials: true
    },
    transports: ["websocket", "polling"],
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  let matchRooms: Record<string, Room> = {};
  server.ready((err) => {
    if (err) throw err;
    server.io.on("connection", (socket: Socket) => {
      console.log(`\nClient: ${socket.id} connected`);
      const player: Player = { state: "IDLE" };
      socket.on("joinMatch", (token) => {
        console.log("Trying to join match:", token);
        if (matchRooms[token]) {
          socket.join(token);
          matchRooms[token].players[socket.id] = player;
          console.log("Players connected successfully:", matchRooms[token].players);
          server.io.to(token).emit("handshake", { token, message: "GAME FULL | PRESS READY TO PLAY" }); // TODO; emitwithAck??
        } else {
          const room = new Room();
          room.players[socket.id] = player;
          matchRooms[token] = room;
          socket.join(token);
          console.log(`Player ${socket.id} is waiting for a match.`);
        }
      });

      socket.on("ready", (token) => {
        if (matchRooms[token].players[socket.id].state === "READY") { return; }
        matchRooms[token].players[socket.id].state = "READY";
        server.io.to(`${token}`).emit("message", `${socket.id} is ready to play!`);
        if (Object.keys(matchRooms[token].players).length > 1) {
          if (matchRooms[token].allPlayersReady()) {
            console.log("Starting match...");
            server.io.to(`${token}`).emit("message", `${matchRooms[token]} Are ready! || Starting Match in 3...`);
            // startMatch();
          }
        }
      });

      socket.on("disconnecting", (reason: string) => {
        console.log(`Client: ${socket.id} disconnected | ${reason}`);
        const activeRooms = socket.rooms;
        for (const room of activeRooms.values()) {
          socket.leave(room);
          server.io.to(room).emit("message", `${socket.id} left`);
          if (matchRooms[room]) {
            if (matchRooms[room].players[socket.id]) {
              delete matchRooms[room].players[socket.id];
            }
            if (Object.keys(matchRooms[room].players).length === 0) {
              delete matchRooms[room];
            }
            console.log(matchRooms);
          }
        }
      });

      socket.on("disconnect", (reason: string) => {
        console.log(`Client: ${socket.id} disconnected | ${reason}`);
        server.io.emit("message", `${socket.id} disconnected`);
      });
    });
  });

  server.listen({ port: 443, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main();
