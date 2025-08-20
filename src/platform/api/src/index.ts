import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import userRoutes from "./infrastructure/routes/UserRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";
import authRoutes from "./infrastructure/routes/AuthRoutes";

const server = fastify();
const publicRoutes = ['/register', '/login', '/refresh'];

server.register(cors, {
  origin: ['http://localhost:4321', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
})

server.register(jwt, { secret: 'secret' });
server.register(cookie);

server.register(userRoutes, {prefix: '/user'});
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
