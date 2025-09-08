import fp from "fastify-plugin";
import nodemailer, { Transporter } from "nodemailer";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    mailer: Transporter;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.amethpong.fun',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  fastify.decorate("mailer", transporter);
});
