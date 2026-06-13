import { FormEvent, useEffect, useRef, useState } from "react";

type User = {
  id: string;
  email: string;
  display_name: string | null;
  role: "admin" | "user";
  auth_provider: "cloudflare" | "local";
};

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "anonymous" };

type LogoutResponse = {
  message: string;
  logout_url: string | null;
};

async function fetchMe(): Promise<User | null> {
  const response = await fetch("/api/me", { credentials: "include" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }
  return response.json();
}

function LogoutPage() {
  const didStartLogout = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (didStartLogout.current) {
      return;
    }
    didStartLogout.current = true;

    async function logout() {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      const result = (await response.json()) as LogoutResponse;
      window.location.assign(result.logout_url || "/");
    }

    logout().catch(() => {
      setErrorMessage("ログアウトに失敗しました。時間をおいて再度お試しください。");
    });
  }, []);

  return (
    <main className="card">
      <p className="eyebrow">myhome-tools</p>
      <h1>ログアウト中</h1>
      <p>ログアウト処理を実行しています。</p>
      {errorMessage ? <p className="error">{errorMessage}</p> : null}
    </main>
  );
}

function HomePage() {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then((user) => {
        setAuthState(user ? { status: "authenticated", user } : { status: "anonymous" });
      })
      .catch(() => {
        setAuthState({ status: "anonymous" });
        setErrorMessage("認証状態の確認に失敗しました。");
      });
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setErrorMessage("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    const user = (await response.json()) as User;
    setAuthState({ status: "authenticated", user });
    setPassword("");
  }

  function handleLogout() {
    window.location.assign("/logout");
  }

  if (authState.status === "loading") {
    return <main className="card">Loading...</main>;
  }

  if (authState.status === "authenticated") {
    return (
      <main className="card">
        <p className="eyebrow">myhome-tools</p>
        <h1>ログイン済み</h1>
        <dl>
          <dt>Email</dt>
          <dd>{authState.user.email}</dd>
          <dt>Role</dt>
          <dd>{authState.user.role}</dd>
          <dt>Provider</dt>
          <dd>{authState.user.auth_provider}</dd>
        </dl>
        <button type="button" onClick={handleLogout}>
          ログアウト
        </button>
      </main>
    );
  }

  return (
    <main className="card">
      <p className="eyebrow">myhome-tools</p>
      <h1>ローカルログイン</h1>
      <p>Cloudflare Access を通らない場合は、ローカルアカウントでログインします。</p>
      <form onSubmit={handleLogin}>
        <label>
          メールアドレス
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          パスワード
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
        <button type="submit">ログイン</button>
      </form>
    </main>
  );
}

export function App() {
  if (window.location.pathname === "/logout") {
    return <LogoutPage />;
  }

  return <HomePage />;
}
