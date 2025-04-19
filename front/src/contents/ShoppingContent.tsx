import { useEffect, useState } from "react";
import { PlusCircle, Check, RotateCcw, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useControlBoxState from "../stores/ControlStore";
import useShoppingMasterStore from "../stores/ShoppingMasterStore";
import useShoppingListStore from "../stores/ShoppingListStore";

/* 1行表示用のサブコンポーネント */
function Row({
  item,
  onToggle,
}: {
  item: ReturnType<typeof useShoppingListStore.getState>["items"][number];
  onToggle: () => void;
}) {
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div
      className="flex items-center gap-2 p-3 border-b last:border-0 cursor-pointer hover:bg-gray-50"
      onClick={onToggle}
    >
      <span className="text-2xl">{item.icon?.icon ?? "📝"}</span>
      <span className="flex-1">
        {item.name}
        {item.quantity > 1 && ` ×${item.quantity}`}
        <div className="text-xs text-gray-500 mt-0.5 leading-tight">
          追加: {fmt.format(item.addedAt)}
          {item.status === "archived" && item.archivedAt && (
            <>
              <br />
              購入: {fmt.format(item.archivedAt)}
            </>
          )}
        </div>
      </span>
      {item.status === "pending" ? (
        <Check className="text-green-600" />
      ) : (
        <RotateCcw className="text-gray-500" />
      )}
    </div>
  );
}

export function ShoppingContent() {
  const navigate = useNavigate();
  const { setButtons } = useControlBoxState();

  /* master → list 追加用 */
  const { data: masters, isLoading: loadingMasters } = useShoppingMasterStore();
  const { items, addItem, toggleArchived, clearArchived } =
    useShoppingListStore();

  /* ControlBox */
  useEffect(() => {
    setButtons([
      {
        display: "商品リスト管理",
        icon: <span>🍏📝</span>,
        onClick: () => navigate("/shopping/manage"),
      },
    ]);
  }, [setButtons, navigate]);

  /* 追加 UI の簡易実装（プルダウン） */
  const [selectedMasterId, setSelectedMasterId] = useState<number | "">("");

  const handleAdd = () => {
    const master = masters.find((m) => m.id === selectedMasterId);
    if (master) {
      addItem(master);
      setSelectedMasterId("");
    }
  };

  const pending = items.filter((i) => i.status === "pending");
  const archived = items
    .filter((i) => i.status === "archived")
    .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));

  return (
    <div className="max-w-lg mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">買い物リスト</h1>

      {/* ─── 追加フォーム ─── */}
      <div className="flex gap-2 mb-6">
        <select
          value={selectedMasterId}
          onChange={(e) =>
            setSelectedMasterId(e.target.value ? Number(e.target.value) : "")
          }
          className="flex-1 border px-3 py-2 rounded-md"
        >
          <option value="">商品を選択...</option>
          {masters.map((m) => (
            <option key={m.id} value={m.id}>
              {m.icon?.icon} {m.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={selectedMasterId === "" || loadingMasters}
          className="px-4 rounded-md bg-blue-600 text-white flex items-center gap-1 disabled:opacity-40"
        >
          <PlusCircle size={18} />
          追加
        </button>
      </div>

      {/* ─── 未購入 ─── */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">🛒 買うもの</h2>
        {pending.length === 0 && (
          <p className="text-gray-500 text-sm">まだありません。</p>
        )}
        {pending.map((i) => (
          <Row key={i.id} item={i} onToggle={() => toggleArchived(i.id)} />
        ))}
      </section>

      {/* ─── アーカイブ ─── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">📦 購入済み</h2>
          {archived.length > 0 && (
            <button
              onClick={clearArchived}
              className="text-xs text-gray-500 flex items-center gap-1 hover:underline"
            >
              <Archive size={14} />
              クリア
            </button>
          )}
        </div>
        {archived.length === 0 && (
          <p className="text-gray-500 text-sm">まだありません。</p>
        )}
        {archived.map((i) => (
          <Row key={i.id} item={i} onToggle={() => toggleArchived(i.id)} />
        ))}
      </section>
    </div>
  );
}
