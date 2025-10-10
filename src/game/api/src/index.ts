import fastify from 'fastify';
import fs from 'fs';
import fastifySocketIO from 'fastify-socket.io';
import { Room } from './match/models/Room';
import { Player } from './match/models/Player';
import { AuthenticatedSocket } from './match/models/AuthenticatedSocket';
import { ApiClient } from './HttpClient/ApiClient/ApiClient';

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

  const apiClient = new ApiClient();

  server.io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      if (!socket.handshake.headers.cookie) {
        throw "Invalid JWT";
      }
      const opts: RequestInit = {};
      opts.headers = { cookie: socket.handshake.headers.cookie };
      const user = (await apiClient.get("/user", undefined, opts)) as any;
      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error("Invalid JWT"));
    }
  });

  let matchRooms: Record<string, Room> = {};
  server.ready((err) => {
    if (err) throw err;
    server.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`\nClient: ${socket.id} connected`);
      socket.on("joinMatch", (token) => {
        const player: Player = { name: socket.username || "NONE", state: "IDLE" };
        console.log("Trying to join match:", token);
        const room = matchRooms[token];
        if (room) {
          const opponent = room.getOpponent(socket.id);
          if (socket.username === opponent.player.name) { return socket.disconnect(); }
          socket.join(token);
          room.players[socket.id] = player;
          console.log("Players connected successfully:", room.players);
          server.io.to(opponent.id).emit("message", `New Opponent: ${player.name}(${socket.id}) found!`);
          server.io.to(opponent.id).emit("handshake", socket.userId);
        } else {
          const newRoom = new Room();
          newRoom.players[socket.id] = player;
          matchRooms[token] = newRoom;
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
            server.io.to(`${token}`).emit("message", "Players are ready! || Starting Match in 3...");
            matchRooms[token].interval = setInterval(() => {
              const room = matchRooms[token];
              if (!room) {
                return;
              }

              server.io.to(token).emit("message", "TOKEN: " + token + " || " + + performance.now());
            }, (1000 / 20));
            // startMatch();
          }
        }
      });

      socket.on("disconnecting", (reason: string) => {
        console.log(`Client: ${socket.id} disconnected | ${reason} | ing`);
        const activeRooms = socket.rooms;
        for (const room of activeRooms.values()) {
          socket.leave(room);
          server.io.to(room).emit("message", `${socket.id} left`);
          if (matchRooms[room]) {
            clearInterval(matchRooms[room].interval);
            if (matchRooms[room].players[socket.id]) {
              delete matchRooms[room].players[socket.id];
            }
            if (Object.keys(matchRooms[room].players).length === 0) {
              delete matchRooms[room];
            }
          }
        }
        socket._cleanup();
      });

      socket.on("disconnect", (reason: string) => {
        socket._cleanup();
        socket.disconnect(true);
        console.log(`Client: ${socket.id} disconnected | ${reason}`);
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
