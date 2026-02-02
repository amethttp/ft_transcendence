import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fs from 'fs';
import userRoutes from "./infrastructure/routes/userRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";
import authRoutes from "./infrastructure/routes/authRoutes";
import { createDummyUsers } from "./spec/createDummyUsers";
import mailerPlugin from "./infrastructure/plugins/mailerPlugin";
import fastifyRateLimit from "@fastify/rate-limit";
import userRelationRoutes from "./infrastructure/routes/userRelationRoutes";
import userStatusRoutes from "./infrastructure/routes/userStatusRoutes";
import searchRoutes from "./infrastructure/routes/searchRoutes";
import matchRoutes from "./infrastructure/routes/matchRoutes";
import tournamentRoutes from "./infrastructure/routes/tournamentRoutes";


const main = async () => {
  const server = fastify({
    https: {
      key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
      cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt')
    }
  });

  const publicRoutes = ['/auth/register', '/auth/login', '/auth/google', '/auth/refresh', '/user/check/email', '/user/check/username', '/auth/recover', '/user/download/'];

  await server.register(cors, {
    origin: [`${process.env.CLIENT_HOST}`],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
  })

  await server.register(fastifyRateLimit, {
    max: 100000,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip + req.headers['user-agent'] || 'unknown'
  });

  await server.register(jwt, { secret: process.env.JWT_SECRET || "", prefix: "" });
  await server.register(cookie);
  await server.register(mailerPlugin);

  await server.register(userRoutes, { prefix: '/user' });
  await server.register(authRoutes, { prefix: '/auth' });
  await server.register(userRelationRoutes, { prefix: '/relation' });
  await server.register(userStatusRoutes, { prefix: '/status' });
  await server.register(searchRoutes, { prefix: '/search' });
  await server.register(matchRoutes, { prefix: '/match' });
  await server.register(tournamentRoutes, { prefix: '/tournament' });

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
