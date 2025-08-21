import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fs from 'fs';
import userRoutes from "./infrastructure/routes/UserRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";
import authRoutes from "./infrastructure/routes/AuthRoutes";

const server = fastify({
  https: {
    key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
    cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt')
  }
});
const publicRoutes = ['/register', '/login', '/refresh'];

server.register(cors, {
  origin: ['https://localhost:4321'],
  credentials: true
})

server.register(jwt, { secret: 'secret' });
server.register(cookie);

server.register(userRoutes);
server.register(authRoutes);

server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  if (publicRoutes.includes(request.url))
    return;

  await JwtAuth.validateRequest(request, reply);
});

server.listen({ port: 443, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
