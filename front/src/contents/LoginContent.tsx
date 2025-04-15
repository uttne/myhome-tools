import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signIn,
  SignInInput,
  SignInOutput,
} from "aws-amplify/auth"; // ✅ v6 modular Auth API
import { refreshAccessToken } from "../utils/auth";
import { useLocation, useNavigate } from "react-router-dom";

export function LoginContent() {
  // ---------------- Local state ----------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------- auth status ---------------------
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ---------------- Hooks ----------------------
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Check auth status once on mount
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!checkingAuth && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [checkingAuth, isAuthenticated, from, navigate]);

  // ---------------- Handlers -------------------
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔑 Modular API call
      const { isSignedIn, nextStep }: SignInOutput = await signIn({
        username: email,
        password,
      } as SignInInput);

      if (isSignedIn) {
        // 🎫 Immediately refresh tokens to ensure we have fresh JWTs
        const accessToken = await refreshAccessToken();
        console.log("Refreshed AccessToken JWT:", accessToken);
        console.log("from:", from);

        // ✅ Success — redirect or update global auth state here
        navigate(from, { replace: true });
      }
      else if(nextStep && nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"){
        navigate("/newpassword", {state: {username: email, from: from}});
      }
      else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
    } catch (err: unknown) {
      // Narrow unknown → Error to satisfy TS18046
      if (err instanceof Error) {
        // Amplify v6 errors extend Error but include name/code
        const errorName = err?.name;
        switch (errorName) {
          case "UserNotConfirmedException":
            setError("ユーザーが未確認です。メールをチェックしてください。");
            break;
          case "NotAuthorizedException":
            setError("メールアドレスまたはパスワードが間違っています。");
            break;
          default:
            setError(err.message);
            setError(err.message);
        }
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------- UI rendering ---------------
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        認証状態を確認中...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-center mb-6">ログイン</h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white font-semibold text-lg"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        {/* <p className="mt-6 text-sm text-center">
        アカウントをお持ちでないですか？{' '}
        <a href="/signup" className="text-indigo-600 hover:underline">
          新規登録
        </a>
      </p> */}
      </div>
    </div>
  );
}
