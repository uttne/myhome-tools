import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth"; // Amplify Auth v6 の signOut をインポート
import { useNavigate } from "react-router-dom"; // ページ遷移のために useNavigate をインポート
import useControlBoxState from "../stores/ControlStore";

const LoaddingIcon = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export function SettingsContent() {
  const { setButtons } = useControlBoxState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // ローディング状態
  const [error, setError] = useState(""); // エラーメッセージ状態

  // SettingsContent が表示されたら ControlBox のボタンをクリアする
  useEffect(() => {
    setButtons([]);
  }, [setButtons]);

  // ログアウト処理
  const handleSignOut = async () => {
    setLoading(true); // ローディング開始
    setError(""); // エラーメッセージをクリア
    try {
      // Amplify Auth の signOut 関数を呼び出す (デフォルトはローカルサインアウト)
      await signOut();
      console.log("Sign out successful. Redirecting to login page...");
      // ログアウト成功後、ログインページに遷移 (replace: true で履歴に残さない)
      navigate("/login", { replace: true });
      // 注意: ページ遷移後に setLoading(false) を呼ぶ必要はないことが多いですが、
      // エラー発生時や遷移しないケースを考慮する場合は finally ブロックが適切です。
    } catch (err) {
      console.error("Error signing out: ", err);
      if (err instanceof Error) {
        setError(`ログアウトに失敗しました: ${err.message}`);
      } else {
        setError("ログアウト中に不明なエラーが発生しました。");
      }
      setLoading(false); // エラー発生時にローディング解除
    }
  };

  return (
    // Tailwind CSS で基本的なスタイリング
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">設定</h1>

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* ログアウトボタン */}
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
      >
        {loading ? (
          <>
            {/* ローディングスピナー (Tailwindで簡易的に表現) */}
            <div className="-ml-1 mr-3">
              <LoaddingIcon />
            </div>
            処理中...
          </>
        ) : (
          "ログアウト"
        )}
      </button>

      {/* 他の設定項目があればここに追加 */}
      {/*
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900">アカウント設定</h2>
        <p className="mt-1 text-sm text-gray-500">アカウントに関する設定を行います。</p>
        {/* 例: パスワード変更ボタンなど *}
      </div>
      */}
    </div>
  );
}
