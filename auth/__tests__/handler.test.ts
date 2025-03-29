import { webcrypto } from 'crypto';
globalThis.crypto = webcrypto as unknown as Crypto;

import { createHandler, Config } from "../src/check-auth.tpl"; // 適宜パスを調整

// ヘルパー関数: base64url エンコード
function base64urlEncode(buffer: ArrayBuffer): string {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlEncodeStr(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

describe("handler function with real crypto operations", () => {
  let testConfig: Config;
  let handler: ReturnType<typeof createHandler>;
  let privateKey: CryptoKey;

  beforeAll(async () => {
    // RSA キーペアを生成（RSASSA-PKCS1-v1_5, SHA-256）
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: "SHA-256" },
      },
      true,
      ["sign", "verify"]
    );
    privateKey = keyPair.privateKey;
    const publicKey = keyPair.publicKey;

    // 公開鍵を JWK としてエクスポート
    const jwk = await crypto.subtle.exportKey("jwk", publicKey);
    // kid を設定（後で JWT のヘッダーと合わせる）
    const kid = "test-key";
    (jwk as any).kid = kid;

    // テスト用設定を作成
    testConfig = {
      cognitoLoginUrl: "https://test.domain/login",
      cognitoClientId: "test-client-id",
      cognitoIssuer: "https://test.issuer",
      cognitoJwks: JSON.stringify({
        keys: [jwk],
      }),
    };

    // createHandler によりハンドラを生成
    handler = createHandler(testConfig);
  });

  // ヘルパー関数: JWT を生成（実際にプライベートキーで署名）
  async function signToken(
    headerObj: any,
    payloadObj: any,
    privateKey: CryptoKey
  ): Promise<string> {
    const headerStr = JSON.stringify(headerObj);
    const payloadStr = JSON.stringify(payloadObj);
    const headerBase64 = base64urlEncodeStr(headerStr);
    const payloadBase64 = base64urlEncodeStr(payloadStr);
    const signingInput = `${headerBase64}.${payloadBase64}`;
    const data = new TextEncoder().encode(signingInput);
    const signatureBuffer = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, data);
    const signatureBase64 = base64urlEncode(signatureBuffer);
    return `${headerBase64}.${payloadBase64}.${signatureBase64}`;
  }

  it("should return the original request for a valid AWS Cognito Bearer Token", async () => {
    // JWT ヘッダー（kid が testConfig の jwks と一致する）
    const header = { alg: "RS256", kid: "test-key", typ: "JWT" };
    // ペイロードは issuer, audience など必要な項目を設定
    const payload = {
      iss: testConfig.cognitoIssuer,
      aud: testConfig.cognitoClientId,
      token_use: "access",
      exp: Math.floor(Date.now() / 1000) + 3600, // 1時間後まで有効
    };

    const token = await signToken(header, payload, privateKey);
    const request = {
      headers: {
        authorization: [{ key: "authorization", value: "Bearer " + token }],
      },
    };

    const event = {
      Records: [
        {
          cf: {
            request,
          },
        },
      ],
    };

    const result = await handler(event);
    // 有効なトークンの場合、リクエストオブジェクトがそのまま返るはず
    expect(result).toEqual(request);
  });

  it("should redirect if token signature is invalid", async () => {
    // 正しいトークンを生成した後、署名部分を改ざん
    const header = { alg: "RS256", kid: "test-key", typ: "JWT" };
    const payload = {
      iss: testConfig.cognitoIssuer,
      aud: testConfig.cognitoClientId,
      token_use: "access",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    let token = await signToken(header, payload, privateKey);
    // トークンをドットで分割し、署名部分を改ざん
    const parts = token.split(".");
    // 署名の最後の1文字を変更
    parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === "A" ? "B" : "A");
    token = parts.join(".");

    const request = {
      headers: {
        authorization: [{ key: "authorization", value: "Bearer " + token }],
      },
    };

    const event = {
      Records: [
        {
          cf: { request },
        },
      ],
    };

    const result = await handler(event);
    // 改ざんされているので、認証失敗となりリダイレクト（302）が返る
    expect(result).toHaveProperty("status", "302");
    expect(result.headers.location[0].value).toBe(testConfig.cognitoLoginUrl);
  });
});