import { FastifyInstance, FastifyRequest } from "fastify";
import UserStatusController from "../controllers/UserStatusController";
import { UserStatusService } from "../../application/services/UserStatusService";
import { SQLiteUserStatusRepository } from "../repositories/sqlite/SQLiteUserStatusRepository";

export default async function UserRelationRoutes(server: FastifyInstance) {
  const userStatusRepository = new SQLiteUserStatusRepository();
  const userStatusService = new UserStatusService(userStatusRepository);
  const userStatusController = new UserStatusController(userStatusService);

  server.get('', async (request: FastifyRequest, reply) => {
    await userStatusController.getUserStatus(request, reply);
  });
}
