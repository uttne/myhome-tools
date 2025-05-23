import { CognitoJwtVerifier } from "aws-jwt-verify";

export interface Config {
  cognitoClientId: string;
  cognitoUserPoolId: string;
}

/**
 * Lambda@Edge Viewer Request 用 JWT 検証ハンドラを生成します。
 * aws‑jwt‑verify が JWKS を自動取得・キャッシュするため、
 * コールドスタート時に 1 回だけ hydrate() を呼び出しておきます。
 */
export async function createHandler(config: Config) {
  const { cognitoClientId, cognitoUserPoolId } = config;

  // verifier は POP ごとに 1 インスタンスだけ作成される
  const verifier = CognitoJwtVerifier.create({
    userPoolId: cognitoUserPoolId,
    tokenUse: "access",
    clientId: cognitoClientId,
  });

  // ★ コールドスタート時に JWKS をプリロード（数 KB / 数十 ms）
  await verifier.hydrate();

  return async function handler(event: any) {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    // Authorization ヘッダーが無ければ 401
    if (!headers.authorization || !headers.authorization[0]?.value) {
      return {
        status: "401",
        statusDescription: "Unauthorized",
        body: "Unauthorized: Invalid or expired token",
        headers: {
          "www-authenticate": [
            {
              key: "WWW-Authenticate",
              value:
                'Bearer realm="Access to the resource", error="invalid_token"',
            },
          ],
          "content-type": [
            {
              key: "Content-Type",
              value: "text/plain",
            },
          ],
        },
      };
    }

    const token = headers.authorization[0].value.replace(/^Bearer\s+/i, "");

    try {
      await verifier.verify(token);
      // 検証成功 → リクエストをそのままオリジンへ
      return request;
    } catch (err) {
      console.error("JWT Verification Failed:", err);
      return {
        status: "401",
        statusDescription: "Unauthorized",
        body: "Unauthorized: Invalid or expired token",
        headers: {
          "www-authenticate": [
            {
              key: "WWW-Authenticate",
              value:
                'Bearer realm="Access to the resource", error="invalid_token"',
            },
          ],
          "content-type": [
            {
              key: "Content-Type",
              value: "text/plain",
            },
          ],
        },
      };
    }
  };
}

// ────────────────────────────────────────────────────────────────
// エントリーポイント（Lambda ハンドラ）
// ────────────────────────────────────────────────────────────────
let _handler: any = null;
export async function handler(event: any) {
  if (!_handler) {
    const config: Config = {
      cognitoClientId: "__COGNITO_CLIENT_ID__",
      cognitoUserPoolId: "__COGNITO_USER_POOL_ID__",
    };
    _handler = await createHandler(config);
  }
  return _handler(event);
}
