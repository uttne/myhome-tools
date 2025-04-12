/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';

// ─── ① aws‑jwt‑verify を先にモック ───────────────────────────────
const verifyMock  = jest.fn();
const hydrateMock = jest.fn().mockResolvedValue(undefined as never); // hydrate() は成功を模擬

jest.unstable_mockModule('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn(() => ({ verify: verifyMock, hydrate: hydrateMock })),
  },
}));

// ─── ② mock 完了後に動的 import で被テストコードを読み込む ────────
import { Config } from "../src/check-auth.tpl";
const { createHandler } = await import('../src/check-auth.tpl');

// ─── CloudFront イベントを生成するヘルパー ────────────────────
function makeEvent(authHeader?: string) {
  return {
    Records: [
      {
        cf: {
          request: {
            headers: authHeader
              ? { authorization: [{ key: "authorization", value: authHeader }] }
              : {},
          },
        },
      },
    ],
  };
}

// ─── テスト本体 ────────────────────────────────────────────────
describe("check-auth handler", () => {
  const config: Config = {
    cognitoLoginUrl: "https://example.com/login",
    cognitoClientId: "my-client-id",
    cognitoUserPoolId: "ap-northeast-1_ABC123",
  };

  let handler: (event: any) => Promise<any>;

  beforeAll(async () => {
    // createHandler は非同期（hydrate を待つ）なので await
    handler = await createHandler(config);
  });

  beforeEach(() => {
    verifyMock.mockReset(); // テストごとにモックをリセット
  });

  test("Authorization ヘッダーが無い場合は 302 でリダイレクト", async () => {
    const res = await handler(makeEvent());

    expect(res).toEqual({
      status: "302",
      headers: {
        location: [{ key: "Location", value: config.cognitoLoginUrl }],
      },
    });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  test("トークンが有効ならリクエストをそのまま通す", async () => {
    verifyMock.mockResolvedValue({ sub: "user-123" } as never); // 検証成功を模擬

    const token = "header.payload.signature";
    const event = makeEvent(`Bearer ${token}`);
    const req = event.Records[0].cf.request;

    const res = await handler(event);

    expect(res).toBe(req);
    expect(verifyMock).toHaveBeenCalledWith(token);
  });

  test("トークンが無効なら 302 でリダイレクト", async () => {
    verifyMock.mockRejectedValue(new Error("invalid token") as never); // 検証失敗を模擬

    const token = "bad.token";
    const res = await handler(makeEvent(`Bearer ${token}`));

    expect(res.status).toBe("302");
    expect(res.headers.location[0].value).toBe(config.cognitoLoginUrl);
    expect(verifyMock).toHaveBeenCalledWith(token);
  });
});
