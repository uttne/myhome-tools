import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const API_V1 = "/api/v1";

async function fetchMe(): Promise<User | null> {
  const response = await fetch(`${API_V1}/me`, { credentials: "include" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }
  return response.json();
}

function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">{children}</Card>
    </main>
  );
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
      const response = await fetch(`${API_V1}/auth/logout`, {
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
    <AuthCard>
      <CardHeader>
        <CardDescription>myhome-tools</CardDescription>
        <CardTitle>ログアウト中</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">ログアウト処理を実行しています。</p>
        {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
      </CardContent>
    </AuthCard>
  );
}

function HomePage() {
  const navigate = useNavigate();
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

    const response = await fetch(`${API_V1}/auth/login`, {
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
    navigate("/logout");
  }

  if (authState.status === "loading") {
    return (
      <AuthCard>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading...
        </CardContent>
      </AuthCard>
    );
  }

  if (authState.status === "authenticated") {
    return (
      <AuthCard>
        <CardHeader>
          <CardDescription>myhome-tools</CardDescription>
          <CardTitle>ログイン済み</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{authState.user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Role</p>
            <p>{authState.user.role}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Provider</p>
            <p>{authState.user.auth_provider}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={handleLogout}>
            ログアウト
          </Button>
        </CardFooter>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardHeader>
        <CardDescription>myhome-tools</CardDescription>
        <CardTitle>ローカルログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">
          Cloudflare Access を通らない場合は、ローカルアカウントでログインします。
        </p>
        <form className="grid gap-4" onSubmit={handleLogin}>
          <div className="grid gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <Button className="w-full" type="submit">
            ログイン
          </Button>
        </form>
      </CardContent>
    </AuthCard>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
