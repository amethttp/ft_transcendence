import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import fastifySocketIO from "fastify-socket.io";

const socketPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifySocketIO as any,  {
    cors: {
      origin: `${process.env.CLIENT_HOST}`,
      credentials: true
    },
    transports: ["websocket", "polling"],
    pingInterval: 10000,
    pingTimeout: 5000,  
  });
};

export default fp(socketPlugin);