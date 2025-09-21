import { FastifyInstance, FastifyRequest } from "fastify";

export default async function UserRelationRoutes(server: FastifyInstance) {
  server.get('', async (request: FastifyRequest, reply) => {
    console.log(request, reply);
  });
}
