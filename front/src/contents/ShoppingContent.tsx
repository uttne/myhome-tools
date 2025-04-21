import { useEffect, useState } from "react";
import { PlusCircle, Check, Archive, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useControlBoxState from "../stores/ControlStore";
import useShoppingMasterStore from "../stores/ShoppingMasterStore";
import useShoppingListStore from "../stores/ShoppingListStore";
import { useSelectedMode } from "../hooks/useSelectedMode";
import { ConfirmDialog } from "../parts/ConfirmDialog";
import { DeleteButtonBox } from "../layouts/DeleteButtonBox";

/* 1行表示用のサブコンポーネント */
function Row({
  item,
  onToggle,
  onPressStart,
  onPressEnd,
  isSelectMode,
  isSelected,
}: {
  item: ReturnType<typeof useShoppingListStore.getState>["items"][number];
  onToggle: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
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
      className="flex items-center gap-2 p-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 select-none relative"
      onClick={onToggle}
      onTouchStart={onPressStart}
      onTouchEnd={onPressEnd}
      onMouseDown={onPressStart}
      onMouseUp={onPressEnd}
    >
      {isSelectMode && (
        <div
          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
        >
          {isSelected && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}
        </div>
      )}
      {item.status === "pending" ? <></> : <Check className="text-green-600" />}
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
    </div>
  );
}

export function ShoppingContent() {
  const navigate = useNavigate();
  const { setButtons } = useControlBoxState();

  const {
    isSelectMode,
    exitSelectMode,
    selectClick,
    selectPressEnd,
    selectPressStart,
    selectedItemIds,
  } = useSelectedMode();

  /* master → list 追加用 */
  const { data: masters, isLoading: loadingMasters } = useShoppingMasterStore();
  const { items, addItem, deleteItem, toggleArchived, clearArchived } =
    useShoppingListStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 削除確認ダイアログ表示状態

  /* アコーディオン開閉状態 */
  const [isPendingOpen, setPendingOpen] = useState(true); // "買うもの" はデフォルト開く
  const [isArchivedOpen, setArchivedOpen] = useState(false); // "購入済み" はデフォルト閉じる

  /* ControlBox */
  useEffect(() => {
    if (isSelectMode) {
      setButtons([]);
    } else {
      setButtons([
        {
          display: "商品リスト管理",
          icon: <span>🍏📝</span>,
          onClick: () => navigate("/shopping/manage"),
        },
      ]);
    }
  }, [setButtons, navigate, isSelectMode]);

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

  const onToggle = (id: number) => {
    if (isSelectMode) {
      selectClick(`${id}`);
    } else {
      toggleArchived(id);
    }
  };

  // 削除確認ダイアログ - 削除実行
  const confirmDelete = async () => {
    for (const _id of Array.from(selectedItemIds)) {
      await deleteItem(parseInt(_id)); // ストアのアクションを呼び出し
    } // 選択中のIDリストを渡して削除実行
    setShowConfirmDialog(false); // ダイアログを閉じる
    exitSelectMode(); // 選択モードを終了
  };

  // 削除確認ダイアログ - キャンセル
  const cancelDelete = () => {
    setShowConfirmDialog(false); // ダイアログを閉じる
    // 削除モードは終了しない（継続して他のアイテムを選択/解除できるように）
  };

  // 削除ボタン押下ハンドラ
  const handleDeleteButtonClick = () => {
    if (selectedItemIds.size > 0) {
      setShowConfirmDialog(true); // 確認ダイアログを表示
    }
  };

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
      <section className="mb-4">
        <button
          className="w-full flex items-center justify-between py-2 font-semibold"
          onClick={() => setPendingOpen((prev) => !prev)}
        >
          <span>🛒 買うもの</span>
          <ChevronDown
            className={`transition-transform ${
              isPendingOpen ? "rotate-180" : "routate-0"
            }`}
          />
        </button>
        {isPendingOpen && (
          <div className="mt-2">
            {pending.length === 0 && (
              <p className="text-gray-500 text-sm">まだありません。</p>
            )}
            {pending.map((i) => (
              <Row
                key={i.id}
                item={i}
                onToggle={() => onToggle(i.id)}
                onPressStart={() => selectPressStart(`${i.id}`)}
                onPressEnd={selectPressEnd}
                isSelectMode={isSelectMode}
                isSelected={selectedItemIds.has(`${i.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── アーカイブ ─── */}
      <section>
        <button
          className="w-full flex items-center justify-between py-2 font-semibold"
          onClick={() => setArchivedOpen((prev) => !prev)}
        >
          <span>📦 購入済み</span>
          <div className="flex items-center gap-2">
            {archived.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearArchived();
                }}
                className="text-xs text-gray-500 flex items-center gap-1 hover:underline mr-2"
              >
                <Archive size={14} />
                クリア
              </button>
            )}
            <ChevronDown
              className={`transition-transform ${
                isArchivedOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </button>
        {isArchivedOpen && (
          <div className="mt-2">
            {archived.length === 0 && (
              <p className="text-gray-500 text-sm">まだありません。</p>
            )}
            {archived.map((i) => (
              <Row
                key={i.id}
                item={i}
                onToggle={() => onToggle(i.id)}
                onPressStart={() => selectPressStart(`${i.id}`)}
                onPressEnd={selectPressEnd}
                isSelectMode={isSelectMode}
                isSelected={selectedItemIds.has(`${i.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 削除ボタンバー (選択中のアイテムがある場合に表示) */}
      {selectedItemIds.size > 0 && (
        <DeleteButtonBox
          display={`${selectedItemIds.size}件選択中`}
          disableDeleteButton={selectedItemIds.size === 0}
          deleteButtonClick={handleDeleteButtonClick}
          exitDeleteMode={exitSelectMode}
        />
      )}
      {/* 削除確認ダイアログ */}
      {showConfirmDialog && (
        <ConfirmDialog onConfirm={confirmDelete} onCancel={cancelDelete}>
          <h2 className="text-xl font-bold mb-4">削除の確認</h2>
          <p className="mb-6">
            {selectedItemIds.size}件の商品を削除してもよろしいですか？
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
