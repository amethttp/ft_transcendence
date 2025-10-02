import fastify from 'fastify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import fs from 'fs';
import { randomBytes } from 'crypto';

const server = fastify({
  https: {
    key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
    cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt'),
  },
});

// server.register(fastifySocketIO, {
//   cors: {
//     origin: `${process.env.CLIENT_HOST}`,
//     credentials: true
//   },
//   transports: ["websocket", "polling"],
//   pingInterval: 10000,
//   pingTimeout: 5000,  
// });

const io = new SocketIOServer(server.server, {
  cors: {
    origin: `${process.env.CLIENT_HOST}`,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 10000,
  pingInterval: 5000,
});

let waitingClient: Socket | null = null;

io.on('connection', (socket: Socket) => {
  console.log(`\nClient: ${socket.id} connected`);
  socket.on('joinMatch', (token) => {
    console.log("Trying to join match...", token);
    if (waitingClient) {
      const roomId = `match_${token}`; 
      waitingClient.join(roomId);
      socket.join(roomId);

      io.to(roomId).emit('handshake', { roomId, message: 'Success??' }); // TODO; emitwithAck??
      console.log("Players connected successfully:", waitingClient.id, socket.id);
      waitingClient = null;
    } else {
      waitingClient = socket;
      console.log(`Player ${waitingClient.id} is waiting for a match.`);
    }
  });

  socket.on('helloWorld', (token) => {
    socket.broadcast.emit("message", "Hello broadcast");
    socket.emit("message", "Hello emit");
    io.to(`match_${token}`).emit("message", "server emit");
  });

  socket.on('disconnect', (reason: string) => {
    console.log(`Client: ${socket.id} disconnected | ${reason}`);
    if (waitingClient === socket) {
      waitingClient = null;
    } else {
      io.emit(`${socket.id} left`);
    }
  });
});

server.listen({ port: 443, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});