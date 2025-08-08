import fastify from "fastify";

const server = fastify();

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

server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
