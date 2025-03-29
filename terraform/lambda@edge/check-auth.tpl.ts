const COGNITO_LOGIN_URL = "https://${cloudfront_domain}/login";
const COGNITO_CLIENT_ID = "${cognito_client_id}";
const COGNITO_ISSUER = "${cognito_issuer}";
const COGNITO_JWKS = JSON.parse('${cognito_jwks}');

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

  const headerAndPayload = globalThis.Buffer.from(parts[0]+ "." + parts[1]);
  const signature = globalThis.Buffer.from(parts[2], "base64");

  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signature,
    headerAndPayload
  );
};

/**
 * JWT の公開鍵を取得
 */
const getPublicKey = async (kid: string): Promise<CryptoKey> => {
  const jwk = COGNITO_JWKS.keys.find((key: any) => key.kid === kid);
  if (!jwk) {
    throw new Error("Key ID not found");
  }
  return await convertJwkToCryptoKey(jwk);
};

/**
 * handler
 * @param event 
 * @returns 
 */
export async function handler(event: any) {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  if (!headers.authorization || !headers.authorization[0].value) {
    return {
      status: "302",
      headers: {
        location: [
          {
            key: "Location",
            value: COGNITO_LOGIN_URL,
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
      decodedPayload.iss !== COGNITO_ISSUER ||
      decodedPayload.aud !== COGNITO_CLIENT_ID
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
        location: [{ key: "Location", value: COGNITO_LOGIN_URL }],
      },
    };
  }
}
