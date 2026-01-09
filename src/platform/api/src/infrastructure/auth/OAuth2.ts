import { OAuth2Client } from "google-auth-library";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";

export type GoogleTokenBody = {
  idToken?: string;
};

export type GooglePayload = {
  sub: string;
  name: string;
  email: string;
  avatar?: string;
};

export class OAuth2Service {
  static async getGooglePayloadFromBody(googleTokenBody?: GoogleTokenBody): Promise<GooglePayload> {
    try {
      if (!googleTokenBody || !googleTokenBody.idToken) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }

      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      const ticket = await client.verifyIdToken({ idToken: googleTokenBody.idToken, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.name || !payload.email) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
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
};
