import { fetchAuthSession } from 'aws-amplify/auth'; // ✅ v6 modular Auth API

// -----------------------------------------------------------
// Utility: get the current (possibly cached) access token (JWT)
// -----------------------------------------------------------
export async function getAccessToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession();
    const token = tokens?.accessToken?.toString() ?? null;

    if(!token){
      return null;
    }

    const parts = token.split('.');
    if(parts.length !== 3){
      return null;
    }

    const payloadJson = atob(parts[1]);
    const payload = JSON.parse(payloadJson);

    // exp は通常 Unix タイムスタンプ（秒単位）で格納されるため、
    // 現在時刻（ミリ秒）と比較するには 1000 倍する
    if(payload.exp && payload.exp * 1000 < Date.now()){
      // トークンの期限切れ
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------
// Utility: **refresh** tokens using the Refresh Token
// `fetchAuthSession({ forceRefresh: true })` forces Amplify to call the
// Cognito "token" endpoint with the stored refresh token and update the
// local session. It returns the *new* tokens.
// -----------------------------------------------------------
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession({ forceRefresh: true });
    return tokens?.accessToken?.toString() ?? null;
  } catch(err) {
    // Refresh token may be expired / revoked → require re‑login
    console.error('Error refreshing access token:', err);
    return null;
  }
}

export async function getOrRefreshAccessToken(): Promise<string | null> {
  const token = await getAccessToken();
  if (token) {
    return token;
  }
  return refreshAccessToken();
}