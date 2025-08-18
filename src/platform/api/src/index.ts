import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import userRoutes from "./infrastructure/routes/UserRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";

const server = fastify();

server.register(jwt, { secret: 'secret' });

server.register(userRoutes, { prefix: '/api' });

server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.url === '/api/register' || request.url === '/api/login')
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
