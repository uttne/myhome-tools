import { fetchAuthSession } from 'aws-amplify/auth'; // ✅ v6 modular Auth API

// -----------------------------------------------------------
// Utility: get the current (possibly cached) access token (JWT)
// -----------------------------------------------------------
export async function getAccessToken(): Promise<string | null> {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens?.accessToken?.toString() ?? null;
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
  } catch {
    // Refresh token may be expired / revoked → require re‑login
    return null;
  }
}
