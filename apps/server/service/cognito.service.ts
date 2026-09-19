import { CognitoJwtVerifier } from "aws-jwt-verify";
import * as jwt from "jsonwebtoken";
import { getConfigValue, requireConfigValue } from "../utils/config";

interface CognitoTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface CognitoIdentity {
  sub: string;
  email?: string;
  phone_number?: string;
  "cognito:username"?: string;
  [claim: string]: unknown;
}

class CognitoService {
  private idTokenVerifier: any = null;

  private getSettings() {
    const userPoolId = getConfigValue(
      "AWS_COGNITO_USER_POOL_ID",
      "mock-user-pool",
    );
    const clientId = getConfigValue("AWS_COGNITO_CLIENT_ID", "mock-client-id");
    const clientSecret = getConfigValue("AWS_COGNITO_CLIENT_SECRET");
    const domain = getConfigValue(
      "AWS_COGNITO_DOMAIN",
      "https://mock.auth.us-east-1.amazoncognito.com",
    );
    const redirectUri = getConfigValue(
      "AWS_COGNITO_REDIRECT_URI",
      "http://localhost:8000/api/v1/auth/cognito/callback",
    );

    return {
      userPoolId,
      clientId,
      clientSecret,
      redirectUri,
      tokenEndpoint: `${domain}/oauth2/token`,
    };
  }

  private getIdTokenVerifier() {
    if (this.idTokenVerifier) {
      return this.idTokenVerifier;
    }

    const { userPoolId, clientId } = this.getSettings();

    try {
      this.idTokenVerifier = CognitoJwtVerifier.create({
        userPoolId,
        clientId,
        tokenUse: "id",
      } as any);
    } catch (error) {
      throw new Error(`Unable to create Cognito verifier: ${error}`);
    }

    return this.idTokenVerifier;
  }

  async exchangeCode(code: string): Promise<CognitoTokens> {
    const { clientId, clientSecret, redirectUri, tokenEndpoint } =
      this.getSettings();
    const body = new URLSearchParams();

    body.set("grant_type", "authorization_code");
    body.set("client_id", clientId);
    body.set("code", code);
    body.set("redirect_uri", redirectUri);

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (clientSecret) {
      const credentials = Buffer.from(
        `${clientId}:${clientSecret}`,
        "utf8",
      ).toString("base64");

      headers["Authorization"] = `Basic ${credentials}`;
    }

    console.log("Cognito token endpoint:", tokenEndpoint);
    console.log("Cognito redirect URI:", redirectUri);
    console.log("Cognito client ID:", clientId);

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("Cognito token response:", responseText);

      throw new Error(
        `Cognito token exchange failed: ${response.status} ${responseText}`,
      );
    }

    return JSON.parse(responseText) as CognitoTokens;
  }
  async getIdentity(tokens: CognitoTokens) {
    if (!tokens?.id_token) {
      throw new Error("Cognito ID token is missing");
    }

    return this.getIdTokenVerifier().verify(
      tokens.id_token,
    ) as Promise<CognitoIdentity>;
  }

  generateApplicationToken(userId: string) {
    const secret = requireConfigValue("JWT_SECRET");

    if (!secret) {
      throw new Error("APPLICATION_JWT_SECRET or JWT_SECRET is required");
    }

    return jwt.sign(
      {
        user_id: userId,
      },
      secret,
      {
        expiresIn: "15d",
      },
    );
  }
}

export default new CognitoService();
