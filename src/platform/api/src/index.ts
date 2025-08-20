import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import userRoutes from "./infrastructure/routes/UserRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";
import authRoutes from "./infrastructure/routes/AuthRoutes";

const server = fastify();

server.register(jwt, { secret: 'secret' });

server.register(userRoutes);
server.register(authRoutes);

server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.url === '/register' || request.url === '/login' || request.url === '/refresh')
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
