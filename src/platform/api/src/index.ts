import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fs from 'fs';
import userRoutes from "./infrastructure/routes/UserRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";
import authRoutes from "./infrastructure/routes/AuthRoutes";
import { createDummyUsers } from "./spec/createDummyUsers";
import mailerPlugin from "./infrastructure/plugins/mailerPlugin";
import fastifyRateLimit from "@fastify/rate-limit";


const main = async () => {
  const server = fastify({
    https: {
      key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
      cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt')
    }
  });

  const publicRoutes = ['/auth/register', '/auth/login', '/auth/refresh', '/user/check/email', '/user/check/username', '/auth/recover'];

  server.register(cors, {
    origin: ['https://localhost:4321', 'http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
  })

  await server.register(fastifyRateLimit);
  await server.register(fastifyRateLimit, {
    max: 1000,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip + req.headers['user-agent'] || 'unknown'
  });
  await server.register(jwt, { secret: process.env.JWT_SECRET || "", prefix: "" });
  await server.register(cookie);
  await server.register(mailerPlugin);

  await server.register(userRoutes, { prefix: '/user' });
  await server.register(authRoutes, { prefix: '/auth' });

  server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // TODO: Do it in a more secure way!!!
    for (const route of publicRoutes) {
      if (request.url.startsWith(route))
        return;
    }
    await JwtAuth.validateRequest(request, reply);
  });

  try {
    await createDummyUsers();
  }
  catch (e) {
    // Do nothing
  }

  server.listen({ port: 443, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main();
