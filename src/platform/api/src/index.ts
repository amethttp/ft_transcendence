import fastify from "fastify";
import UserController from "./presentation/controllers/UserController";

const server = fastify();

server.get("/test", async (request, reply) => {
  const uc = new UserController();
  await uc.test(request, reply);
  console.log("AfterTest");
  return "OK\n";
});

server.post("/user", async (request, reply) => {
  const uc = new UserController();
  uc.register(request, reply);
  return "pong\n";
});

server.get("/pings", async (request, reply) => {
  return "pong\n";
});

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  "h-Custom": string;
}

interface IReply {
  200: { success: boolean };
  302: { url: string };
  "4xx": { error: string };
}

server.get("/auth", async (request, reply) => {
  const { username, password } = request.query as IQuerystring;
  const customerHeader = request.headers["h-Custom"];
  // do something with request data

  // chaining .statusCode/.code calls with .send allows type narrowing. For example:
  // this works

  // reply.code(200).send({ success: true });
  // but this gives a type error
  reply.code(200).send("uh-oh");
  // it even works for wildcards
  reply.code(404).send({ error: "Not found" });
  return `logged in!`;
});

server.listen({ port: 443, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
