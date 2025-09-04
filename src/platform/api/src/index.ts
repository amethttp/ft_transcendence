import fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fs from 'fs';
import userRoutes from "./infrastructure/routes/UserRoutes";
import { JwtAuth } from "./infrastructure/auth/JwtAuth";
import authRoutes from "./infrastructure/routes/AuthRoutes";
import AuthController from "./infrastructure/controllers/AuthController";
import { AuthService } from "./application/services/AuthService";
import { SQLiteAuthRepository } from "./infrastructure/repositories/sqlite/SQLiteAuthRepository";
import { UserService } from "./application/services/UserService";
import { SQLiteUserRepository } from "./infrastructure/repositories/sqlite/SQLiteUserRepository";
import { PasswordService } from "./application/services/PasswordService";
import { SQLitePasswordRepository } from "./infrastructure/repositories/sqlite/SQLitePasswordRepository";
import { UserRegistrationRequest } from "./application/models/UserRegistrationRequest";

const server = fastify({
  https: {
    key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
    cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt')
  }
});

const publicRoutes = ['/auth/register', '/auth/login', '/auth/refresh'];

server.register(cors, {
  origin: ['https://localhost:4321', 'http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
})

server.register(jwt, { secret: process.env.JWT_SECRET || "" });
server.register(cookie);

server.register(userRoutes, { prefix: '/user' });
server.register(authRoutes, { prefix: '/auth' });

server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  if (publicRoutes.includes(request.url))
    return;

  await JwtAuth.validateRequest(request, reply);
});

const authController = new AuthController(new AuthService(new SQLiteAuthRepository(), new UserService(new SQLiteUserRepository()), new PasswordService(new SQLitePasswordRepository)));

const testUsers: UserRegistrationRequest[] = [
  {
    username: "vperez-f",
    email: "vperez-f@gmail.com",
    password: "Pepito.1234"
  },
  {
    username: "arcanava",
    email: "arzelcanavate@gmail.com",
    password: "Pepito.1234"
  },
  {
    username: "cfidalgo",
    email: "cfidalgo@gmail.com",
    password: "12dummud21"
  }
]

const createUsers = async () => {
  for (const user of testUsers) {
    try {
      await authController.register({body: user} as FastifyRequest, {} as FastifyReply);
    }
    catch (e) {
      // Do nothing
    }
  }
}

createUsers();



server.listen({ port: 443, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
