import { OAuth2Client, OAuth2ClientOptions } from "google-auth-library";
import { ErrorParams, ResponseError } from "../../application/errors/ResponseError";
import { GoogleTicketPayload } from "../../application/models/GoogleTicketPayload";
import { GoogleCodeRequestBody } from "../../application/models/GoogleCodeRequestBody";

export class OAuth2Service {
  private googleClient: OAuth2Client;

  constructor() {
    const options: OAuth2ClientOptions = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    };

    this.googleClient = new OAuth2Client(options);
  }

  async getGooglePayloadFromBody(googleCodeBody: GoogleCodeRequestBody): Promise<GoogleTicketPayload> {
    try {
      if (!googleCodeBody || !googleCodeBody.code) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }

      const { tokens } = await this.googleClient.getToken(googleCodeBody.code);
      if (!tokens || !tokens.id_token) {
        throw new ResponseError(ErrorParams.LOGIN_FAILED);
      }

      const ticket = await this.googleClient.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
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

  generateGoogleAuthUrl(): string {
    const url = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile']
    });

    return url;
  }
};
