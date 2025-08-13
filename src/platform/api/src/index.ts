import fastify from "fastify";
import userRoutes from "./routes/UserRoutes";

const server = fastify();

server.register(userRoutes, { prefix: '/api' });

server.listen({ port: 443, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
