import fastify from 'fastify';
import fs from 'fs';
import fastifySocketIO from 'fastify-socket.io';
import { AuthenticatedSocket } from './match/models/AuthenticatedSocket';
import { ApiClient } from './HttpClient/ApiClient/ApiClient';
import { RoomService } from './match/services/RoomService';
import { registerConnectionHandlers } from './socket/registerConnectionHandlers';

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
      registerConnectionHandlers(server.io, roomService);
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
