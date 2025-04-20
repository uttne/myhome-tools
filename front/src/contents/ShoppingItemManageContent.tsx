import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useShoppingMasterStore, {
  ShoppingMasterItem,
} from "../stores/ShoppingMasterStore"; // ストアから型とアクションをインポート
import useControlBoxState from "../stores/ControlStore"; // ControlBoxをクリアするためにインポート

import data from "@emoji-mart/data"; // 絵文字データ
import Picker from "@emoji-mart/react"; // Pickerコンポーネント
import { DeleteButtonBox } from "../layouts/DeleteButtonBox";
import { ConfirmDialog } from "../parts/ConfirmDialog";
import { useSelectedMode } from "../hooks/useSelectedMode";

// 詳細編集ダイアログ用のコンポーネント（簡易版）
interface EditDialogProps {
  item: ShoppingMasterItem;
  onSave: (item: ShoppingMasterItem) => void;
  onClose: () => void;
}

function EditDialog({ item, onSave, onClose }: EditDialogProps) {
  const [editedName, setEditedName] = useState(item.name);
  const [editedIcon, setEditedIcon] = useState(item.icon || undefined);
  // TODO: 他のプロパティがあればここに追加

  const handleSave = () => {
    // TODO: 入力値のバリデーション
    onSave({
      ...item,
      name: editedName,
      icon: editedIcon || undefined, // 空文字の場合は undefined に戻す
      // TODO: 他のプロパティも更新
    });
  };

  const handleClearIcon = () => {
    setEditedIcon(undefined); // State を undefined に設定
  };

  return (
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">商品詳細を編集</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前
          </label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            アイコン
          </label>
          {/* 現在選択されている絵文字を表示 */}
          {/* editedIcon が undefined の場合はテキストを表示 */}
          <div className="text-2xl mb-2">
            {editedIcon
              ? `現在のアイコン: ${editedIcon.icon}`
              : "アイコンを選択してください"}
          </div>
          {editedIcon && ( // editedIcon が undefined でない場合のみボタンを表示
            <button
              type="button" // フォーム送信を防ぐために type="button" を指定
              onClick={handleClearIcon}
              className="px-2 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              クリア
            </button>
          )}
          {/* 絵文字ピッカーを配置 */}
          <Picker
            data={data} // 絵文字データセットを渡す
            // 絵文字が選択された時のコールバック // emoji オブジェクトの native プロパティに絵文字の文字列が入っている
            onEmojiSelect={(emoji: { native: string }) => {
              // 型を指定
              setEditedIcon(
                emoji.native
                  ? { icon: emoji.native, iconType: "emoji" }
                  : undefined
              );
            }}
            // Picker の表示オプション
            locale="ja" // 日本語化 (任意)
            theme="light" // テーマ (light, dark, auto)
            previewPosition="bottom" // 選択中の絵文字プレビューの位置
            searchPosition="sticky" // 検索バーの位置
            navPosition="sticky" // カテゴリナビゲーションの位置
            // その他、perLine, maxFrequentRows などで表示を調整可能
            perLine={7} // 例: 1行に表示する絵文字数
          />{" "}
        </div>
        {/* TODO: 他の編集フィールド */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShoppingItemManageContent() {
  // Zustand ストアから状態とアクションを取得
  const { data, isLoading, error, fetchData, addItem, updateItem, removeItem } =
    useShoppingMasterStore();
  const { setButtons } = useControlBoxState(); // ControlBoxをクリア

  // ローカルState
  const [newItemName, setNewItemName] = useState("");
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 削除確認ダイアログ表示状態
  const [showEditDialog, setShowEditDialog] = useState(false); // 詳細編集ダイアログ表示状態
  const [itemToEdit, setItemToEdit] = useState<ShoppingMasterItem | null>(null); // 編集中アイテム

  const LONG_PRESS_THRESHOLD = 500; // ms

  const {isSelectMode, selectedItemIds, exitSelectMode, selectPressStart, selectPressEnd, selectClick} = useSelectedMode(LONG_PRESS_THRESHOLD);

  // ControlBox ボタンをクリア
  useEffect(() => {
    setButtons([]);
    // コンポーネントマウント時にデータをフェッチ（必要であれば）
    // fetchData(); // ストア側で初回フェッチを制御する場合は不要
  }, [setButtons, fetchData]);


  // 長押し開始ハンドラ
  const handleCardPressStart = (itemId: number) => {
    selectPressStart(`${itemId}`); // 長押し開始
  };

  // 長押し終了ハンドラ (指を離した/マウスアップ)
  const handleCardPressEnd = () => {
    selectPressEnd();
  };

  // カードクリックハンドラ (タップ)
  const handleCardClick = (item: ShoppingMasterItem) => {
    selectClick(`${item.id}`); // クリックイベントを処理

    if (!isSelectMode) {
      // 通常モードの場合は詳細編集ダイアログを開く
      setItemToEdit(item);
      setShowEditDialog(true);
    }
  };

  // 新規アイテム追加ハンドラ
  const handleAddItem = async () => {
    if (!newItemName.trim()) return; // 空白のみの場合は追加しない

    const newItem = {
      name: newItemName.trim(),
      // icon は編集ダイアログで設定する想定
      // notes, quantity などもあれば初期値を設定
    };

    await addItem(newItem); // ストアのアクションを呼び出し
    setNewItemName(""); // 入力フィールドをクリア
  };

  // 削除ボタン押下ハンドラ
  const handleDeleteButtonClick = () => {
    if (selectedItemIds.size > 0) {
      setShowConfirmDialog(true); // 確認ダイアログを表示
    }
  };

  // 削除確認ダイアログ - 削除実行
  const confirmDelete = async () => {
    for (const _id of Array.from(selectedItemIds)) {
      await removeItem(parseInt(_id)); // ストアのアクションを呼び出し
    } // 選択中のIDリストを渡して削除実行
    setShowConfirmDialog(false); // ダイアログを閉じる
    exitSelectMode(); // 選択モードを終了
  };

  // 削除確認ダイアログ - キャンセル
  const cancelDelete = () => {
    setShowConfirmDialog(false); // ダイアログを閉じる
    // 削除モードは終了しない（継続して他のアイテムを選択/解除できるように）
  };

  // 詳細編集ダイアログ - 保存
  const handleEditSave = (updatedItem: ShoppingMasterItem) => {
    updateItem(updatedItem); // ストアのアクションを呼び出し
    setShowEditDialog(false); // ダイアログを閉じる
    setItemToEdit(null); // 編集中アイテムをクリア
  };

  // 詳細編集ダイアログ - キャンセル
  const closeEditDialog = () => {
    setShowEditDialog(false); // ダイアログを閉じる
    setItemToEdit(null); // 編集中アイテムをクリア
  };

  // --- レンダリング ---
  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="p-4 pb-0">
        <Link
          to="/shopping"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &lt; 戻る
        </Link>
        <h1 className="text-2xl font-bold mb-2">買い物の商品管理</h1>
        <p className="text-gray-600 text-sm">
          買い物のリストに追加する商品を管理します
        </p>

        {/* 新規アイテム追加フォーム */}
        <div className="mt-4 mb-6 flex gap-2">
          <input
            type="text"
            placeholder="新しい商品名を入力"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyUp={(e) => {
              // Enter キーで追加
              if (e.key === "Enter") {
                handleAddItem();
              }
            }}
            className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemName.trim()} // 入力がない場合は無効化
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>

        {/* ローディング/エラー表示（必要に応じてスタイル調整） */}
        {isLoading && (
          <div className="text-center text-gray-500">読み込み中...</div>
        )}
        {error && (
          <div className="text-center text-red-600">エラー: {error}</div>
        )}
      </div>

      {/* アイテムリスト（カード形式） */}
      {/* overflow-auto を親要素（ContentArea）かここに適用してスクロール可能にする */}
      {/* DefaultLayout の ContentArea に overflow-auto があるため、ここでは不要か、またはカードグリッドを囲む div に適用 */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {" "}
        {/* このdivでリスト部分をスクロール可能に */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((item) => {
            const isSelected = selectedItemIds.has(`${item.id}`);
            return (
              <div
                key={item.id}
                className={`
                  relative
                  border rounded-lg shadow-sm p-4 flex flex-col items-center text-center
                  cursor-pointer transition-transform duration-100 active:scale-98
                  select-none
                  ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
                      : "border-gray-200 hover:shadow-md"
                  }
                  ${
                    !item.icon
                      ? "justify-center"
                      : "" /* アイコンがない場合は中央寄せ */
                  } 
                 `}
                // タッチイベントとマウスイベントの両方に対応
                onTouchStart={() => handleCardPressStart(item.id)}
                onTouchEnd={handleCardPressEnd}
                onMouseDown={() => handleCardPressStart(item.id)}
                onMouseUp={handleCardPressEnd}
                onMouseLeave={handleCardPressEnd} // カードからマウスが外れたらタイマー解除
                onClick={() => handleCardClick(item)} // クリックイベント
              >
                {/* 削除モード中のチェックマークオーバーレイ */}
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

                {/* アイコン表示 */}
                {item.icon ? (
                  <>
                    <div className="text-4xl mb-2">{item.icon.icon}</div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {item.name}
                    </h3>
                  </>
                ) : (
                  // アイコンがない場合のプレースホルダーなど
                  <>
                    {/* <div className="text-4xl mb-2 text-gray-400">?</div> */}
                    {/* サイズを調整、色と太さを設定 */}
                    <div className="text-xl mb-2 text-gray-800 font-semibold">
                      {item.name}
                    </div>
                  </>
                )}

                {/* 他の詳細プロパティを表示する場合 */}
                {/* <p className="text-sm text-gray-600">{item.notes}</p> */}
              </div>
            );
          })}
        </div>
      </div>

      {/* 削除ボタンバー (選択中のアイテムがある場合に表示) */}
      {selectedItemIds.size > 0 && (
        <DeleteButtonBox
          display={`${selectedItemIds.size}件選択中`}
          disableDeleteButton={selectedItemIds.size === 0}
          deleteButtonClick={handleDeleteButtonClick}
          exitDeleteMode={exitSelectMode} 
        />
      )}

      {/* 詳細編集ダイアログ */}
      {showEditDialog && itemToEdit && (
        <EditDialog
          item={itemToEdit}
          onSave={handleEditSave}
          onClose={closeEditDialog}
        />
      )}

      {/* 削除確認ダイアログ */}
      {showConfirmDialog && (
        <ConfirmDialog
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        >
          <h2 className="text-xl font-bold mb-4">削除の確認</h2>
          <p className="mb-6">{selectedItemIds.size}件の商品を削除してもよろしいですか？</p>
        </ConfirmDialog>
      )}
    </div>
  );
}
