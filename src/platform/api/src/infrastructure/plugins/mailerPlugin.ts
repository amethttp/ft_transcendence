import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { Mailer } from "./Mailer";

declare module "fastify" {
  interface FastifyInstance {
    mailer: Mailer;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const resendApiUrl = process.env.RESEND_API_URL || "https://api.resend.com/emails";
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || '"AmethPong" <info@amethpong.fun>';

  const mailer: Mailer = {
    async sendMail(options) {
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured");
      }

      const to = Array.isArray(options.to) ? options.to : [options.to];
      const response = await fetch(resendApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from || resendFrom,
          to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Resend API error ${response.status}: ${details}`);
      }
    },
  };

  fastify.decorate("mailer", mailer);
});
