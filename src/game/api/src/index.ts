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
    if (err) throw err;
    server.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`\nClient: ${socket.username} connected`);

      socket.on("joinMatch", (token) => { // TODO: fix user rejoining on inverted order visual bug
        try {
          const existingRoom = roomService.getRoom(token);
          if (existingRoom) {
            existingRoom.joinPlayer(socket);
            console.log("Players connected successfully:", existingRoom.players);
          } else {
            const newRoom = roomService.newRoom(token);
            newRoom.addPlayer(socket);
            console.log(`Player ${socket.username} is waiting for a match.`);
          }
        } catch (error) {
          console.log(error);
          socket.disconnect();
        }
      });

      socket.on("ready", (token) => {
        const room = roomService.getRoom(token);
        if (room.playersAmount() === 1) { return; }
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
            roomService.playerDisconnect(socket, room)
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
