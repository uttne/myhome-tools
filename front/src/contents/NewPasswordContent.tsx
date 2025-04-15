// src/contents/NewPasswordContent.tsx
import { useState } from "react";
import { confirmSignIn } from "aws-amplify/auth";
import { useLocation, useNavigate } from "react-router-dom";

export function NewPasswordContent() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // LoginContent から渡された state を受け取る
  const from = location.state?.from || "/";

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      console.log("New password set successfully. Redirecting...");
      // パスワード設定成功後、元の遷移先へリダイレクト
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Error confirming sign in with new password:", err);
      if (err instanceof Error) {
        // エラーメッセージを具体的に表示（Cognitoからのメッセージを利用）
        setError(err.message || "パスワードの設定に失敗しました。要件を確認してください。");
      } else {
        setError("パスワードの設定に失敗しました。");
      }
      setLoading(false);
    }
  };

  return (
    // LoginContent と同様のレイアウトとスタイルを適用
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          新しいパスワードの設定
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          初回ログインのため、新しいパスワードを設定してください。
        </p>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <form onSubmit={handleSetNewPassword} className="grid gap-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-1"
            >
              新しいパスワード
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="新しいパスワードを入力"
              autoComplete="new-password" // ブラウザのパスワード管理機能へのヒント
            />
             {/* パスワードポリシーに関する注意書きを追加するとより親切 */}
             {/* <p className="mt-1 text-xs text-gray-500">8文字以上で設定してください。</p> */}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white font-semibold text-lg"
          >
            {loading ? "設定中..." : "パスワードを設定"}
          </button>
        </form>
      </div>
    </div>
  );
}