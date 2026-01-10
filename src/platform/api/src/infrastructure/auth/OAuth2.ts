import { OAuth2Client } from "google-auth-library";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";

export type GoogleCodeBody = {
  code?: string;
};

export type GooglePayload = {
  sub: string;
  name: string;
  email: string;
  avatar?: string;
};

export class OAuth2Service {
  static async getGooglePayloadFromBody(googleCodeBody: GoogleCodeBody): Promise<GooglePayload> {
    try {
      if (!googleCodeBody || !googleCodeBody.code) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }

      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      const { tokens } = await client.getToken(googleCodeBody.code);
      if (!tokens || !tokens.id_token) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }

      const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.name || !payload.email) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }

      if (!payload.email_verified) {
        throw new ResponseError(ErrorParams.EMAIL_NOT_VERIFIED);
      }

      return {
        sub: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
      };
    } catch (err) {
      console.error(err);
      throw new ResponseError(ErrorParams.LOGIN_FAILED);
    }
  }

  static generateGoogleAuthUrl(): string {
    // TODO: Check deprecation of parameters
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const url = client.generateAuthUrl({
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile']
    });

    return url;
  }
};
