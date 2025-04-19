import { Link } from 'react-router-dom';

export function NotFoundContent() {
  return (
    // DefaultLayoutのコンテンツエリアに収まるようにスタイルを調整
    <div className="flex flex-col items-center justify-center h-full text-center py-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">ページが見つかりませんでした。</p>
      <p className="text-gray-500 mb-8">お探しのページは存在しないか、移動された可能性があります。</p>
      {/* ログイン後のユーザー向けにホームに戻るリンク */}
      <Link to="/" className="text-blue-600 hover:underline text-lg">
        ホームに戻る
      </Link>
    </div>
  );
}