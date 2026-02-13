import fastify from 'fastify';
import fs from 'fs';
import fastifySocketIO from 'fastify-socket.io';
import { AuthenticatedSocket } from './match/models/AuthenticatedSocket';
import { ApiClient } from './HttpClient/ApiClient/ApiClient';
import { RoomService } from './match/services/RoomService';
import { PlayerState } from './match/models/PlayerState';

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
      socket.cookie = socket.handshake.headers.cookie;
      opts.headers = { cookie: socket.handshake.headers.cookie };
      const user = (await apiClient.get("/user", undefined, opts)) as any;
      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (error) {
      console.log(error);
      next(new Error("Invalid JWT"));
    }
  });

  const roomService = new RoomService(server.io, apiClient);
  server.ready((err) => {
    try {
      if (err) throw err;
      server.io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`\nClient: ${socket.username} connected`);

        socket.on("joinMatch", async (token) => {
          try {
            let gameRoom = roomService.getRoom(token);
            if (gameRoom) {
              gameRoom.joinPlayer(socket);
              gameRoom.resetPlayersState();
              socket.broadcast.to(gameRoom.token).emit("reset");
              console.log("Players connected successfully:", gameRoom.players);
            } else {
              gameRoom = await roomService.newRoom(socket.cookie, token);
              gameRoom.addHumanPlayer(socket);
              console.log(`Player ${socket.username} is waiting for a match.`);
            }
            if (gameRoom.gameEnded()) {
              server.io.to(socket.id).emit("end", gameRoom.matchScore);
              gameRoom.deletePlayer(socket.id);
              throw "Game already ended";
            }
          } catch (error) {
            console.log(error);
            socket.disconnect();
          }
        });

        socket.on("ready", (token) => {
          const room = roomService.getRoom(token);
          if (!room || room.playersAmount() === 1 || room.gameEnded()) { return; }
          const player = room.getPlayer(socket.id);
          if (player.state === PlayerState.READY) { return; }

          player.state = PlayerState.READY;
          server.io.to(socket.id).emit("ready");
          socket.broadcast.to(room.token).emit("message", `${socket.username} is ready to play!`);
          if (room.allPlayersReady()) {
            console.log("Starting match...");
            roomService.startMatch(socket, room);
          }
        });

        socket.on("local", (data) => {
          const room = roomService.getRoom(data.token);
          roomService.goLocal(socket, room);
          room.addLocalPlayer();
          room.resetPlayersState();
          server.io.to(socket.id).emit("reset");
        });

        socket.on("ai", (data) => {
          const room = roomService.getRoom(data.token);
          roomService.goLocal(socket, room);
          room.addAIPlayer();
          room.resetPlayersState();
          server.io.to(socket.id).emit("reset");
        });

        socket.on("paddleChange", (data) => {
          const room = roomService.getRoom(data.token);
          room.setPaddleChange(socket, data.key, data.isPressed);
        });

        socket.on("disconnecting", async (reason: string) => {
          console.log(`Client: ${socket.id} is disconnecting | ${reason}`);
          const activeRooms = socket.rooms;
          for (const token of activeRooms.values()) {
            const room = roomService.getRoom(token);
            if (room) {
              roomService.playerDisconnect(socket, room);
            } else {
              socket.leave(token);
            }
          }
        });

        socket.on("disconnect", (reason: string) => {
          socket._cleanup();
          socket.disconnect(true);
          console.log(`Client: ${socket.id} disconnected | ${reason}`);
        });
      });
    } catch (error) {
      console.log(error);
    }
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
