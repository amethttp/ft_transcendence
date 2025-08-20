import { FastifyInstance } from "fastify";
import AuthController from "../controllers/AuthController";

async function authRoutes(server: FastifyInstance) {
  server.post('/refresh', async (request, reply) => {
    await AuthController.refresh(request, reply, server.jwt);
  });
}

export default authRoutes;
