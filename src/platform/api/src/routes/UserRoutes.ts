import { FastifyInstance } from "fastify";
import UserController from "../controllers/UserController";

async function userRoutes(server: FastifyInstance) {
  server.get('/user/:userId', UserController.pingUser);

  server.post("/user", (request, reply) => {
    const uc = new UserController();
    uc.register(request, reply);
    return "pong\n";
  });
}

export default userRoutes;
