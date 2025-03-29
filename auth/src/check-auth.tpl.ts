// const COGNITO_LOGIN_URL = "https://${cloudfront_domain}/login";
// const COGNITO_CLIENT_ID = "${cognito_client_id}";
// const COGNITO_ISSUER = "${cognito_issuer}";
// const COGNITO_JWKS = JSON.parse("${cognito_jwks}");
import { webcrypto } from 'crypto';
globalThis.crypto = webcrypto as unknown as Crypto;

export interface Config {
  cognitoLoginUrl: string;
  cognitoClientId: string;
  cognitoIssuer: string;
  cognitoJwks: string;
}

/**
 * JWK 形式のキーを PEM 形式に変換
 */
const convertJwkToCryptoKey = async (jwk: any): Promise<CryptoKey> => {
  if (!jwk.n || !jwk.e) {
    throw new Error("Invalid JWK format");
  }

  return await crypto.subtle.importKey(
    "jwk",
    {
      kty: "RSA",
      e: jwk.e,
      n: jwk.n,
      alg: "RS256",
      ext: true,
    },
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" },
    },
    false,
    ["verify"]
  );
};

/**
 * JWT のヘッダーをデコード
 */
const decodeJwtHeader = (token: string): any => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  return JSON.parse(
    globalThis.Buffer.from(parts[0], "base64").toString("utf-8")
  );
};

/**
 * JWT のペイロードをデコード
 */
const decodeJwtPayload = (token: string): any => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  return JSON.parse(
    globalThis.Buffer.from(parts[1], "base64").toString("utf-8")
  );
};

/**
 * JWT の署名を検証
 */
const verifyJwtSignature = async (
  token: string,
  publicKey: CryptoKey
): Promise<boolean> => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  const headerAndPayload = globalThis.Buffer.from(parts[0] + "." + parts[1]);
  const signature = globalThis.Buffer.from(parts[2], "base64");

  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    headerAndPayload
  );
};

export function createHandler(config: Config) {
  const cognitoLoginUrl = config.cognitoLoginUrl;
  const cognitoClientId = config.cognitoClientId;
  const cognitoIssuer = config.cognitoIssuer;
  console.log(config.cognitoJwks);
  const cognitoJwks = JSON.parse(config.cognitoJwks);

  /**
   * JWT の公開鍵を取得
   */
  const getPublicKey = async (kid: string): Promise<CryptoKey> => {
    const jwk = cognitoJwks.keys.find((key: any) => key.kid === kid);
    if (!jwk) {
      throw new Error("Key ID not found");
    }
    return await convertJwkToCryptoKey(jwk);
  };

  return async function handler(event: any) {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    if (!headers.authorization || !headers.authorization[0].value) {
      return {
        status: "302",
        headers: {
          location: [
            {
              key: "Location",
              value: cognitoLoginUrl,
            },
          ],
        },
      };
    }

    const token = headers.authorization[0].value.replace("Bearer ", "");

    try {
      // JWT のヘッダーとペイロードをデコード
      const decodedHeader = decodeJwtHeader(token);
      const decodedPayload = decodeJwtPayload(token);

      if (!decodedHeader.kid) {
        throw new Error("Invalid token: Missing kid");
      }

      if (
        decodedPayload.iss !== cognitoIssuer ||
        decodedPayload.aud !== cognitoClientId
      ) {
        throw new Error("Invalid token: Issuer or Audience mismatch");
      }

      // Cognito の公開鍵を取得し、JWT を検証
      const publicKey = await getPublicKey(decodedHeader.kid);
      const isValid = await verifyJwtSignature(token, publicKey);

      if (!isValid) {
        throw new Error("Invalid JWT signature");
      }
      console.log("JWT Verified:", decodedPayload);

      // 認証成功ならそのままリクエストを通す
      return request;
    } catch (err) {
      console.error("JWT Verification Failed:", err);
      return {
        status: "302",
        headers: {
          location: [{ key: "Location", value: cognitoLoginUrl }],
        },
      };
    }
  };
}

let _handler: any = null;
export async function handler(event: any) {
  if (!_handler) {
    const config: Config = {
      cognitoLoginUrl: "https://${cloudfront_domain}/login",
      cognitoClientId: "${cognito_client_id}",
      cognitoIssuer: "${cognito_issuer}",
      // prettier-ignore
      cognitoJwks: '${cognito_jwks}',
    };
    _handler = createHandler(config);
  }
  return await _handler(event);
}