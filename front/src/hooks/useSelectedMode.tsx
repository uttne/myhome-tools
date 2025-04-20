import { useRef, useState } from "react";

export function useSelectedMode(longPressThreshold: number = 500){
  
  // ローカルState
  const [isSelectMode, setIsSelectMode] = useState(false); // 削除モード状態
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  ); // 選択中のアイテムID

  // 長押し検出用の参照とタイマーID
  const pressTimerRef = useRef<number | null>(null);
  const LONG_PRESS_THRESHOLD = longPressThreshold; // ms

  // 長押し検出後にクリックイベントを無視するためのフラグ
  const isLongPressDetectedRef = useRef(false);

  // 削除モードを終了する関数
  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedItemIds(new Set());
  };

  // 長押し開始ハンドラ
  const selectPressStart = (itemId: string) => {
    // 既に削除モードの場合は何もしない（タップで選択切り替えになるため）
    if (isSelectMode) return;

    // 念のため、長押し検出フラグをリセット
    isLongPressDetectedRef.current = false;
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    // タイマーを設定
    pressTimerRef.current = window.setTimeout(() => {
      // 設定時間経過したら長押しと判定
      setIsSelectMode(true); // 削除モード開始
      setSelectedItemIds(new Set([itemId])); // そのアイテムを選択状態にする
      isLongPressDetectedRef.current = true; // 長押しが検出されたことを記録
      pressTimerRef.current = null; // タイマーIDをクリア
    }, LONG_PRESS_THRESHOLD);
  };

  // 長押し終了ハンドラ (指を離した/マウスアップ)
  const selectPressEnd = () => {
    // 設定されていたタイマーがあればクリア（長押し未満だった場合）
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // カードクリックハンドラ (タップ)
  const selectClick = (itemId: string) => {
    // 長押しタイマーが完了していたら、これは長押しの結果のクリックなので何もしない
    // または、長押し終了ハンドラで preventDefault を使うなどするが、今回はシンプルにタイマーで判定
    // もしくは、長押し後にクリックイベントが発生しないように制御する
    // より正確な実装には複雑なタッチ/マウスイベントハンドリングが必要になります。
    // ここでは、簡単のため「長押しモード中か？」で判定します。

    // 長押し検出フラグが立っている場合は処理をスキップしフラグをリセット★
    if (isLongPressDetectedRef.current) {
      isLongPressDetectedRef.current = false; // フラグをリセット
      console.log("Long press detected, ignoring click.");
      return; // クリックイベントのこれ以上の処理を中止
    }

    if (isSelectMode) {
      // 削除モード中の場合は選択状態を切り替える
      setSelectedItemIds((prevSelectedIds) => {
        const newSelectedIds = new Set(prevSelectedIds);
        if (newSelectedIds.has(itemId)) {
          newSelectedIds.delete(itemId);
          // 選択が全て解除されたら削除モードを終了
          if (newSelectedIds.size === 0) {
            exitSelectMode();
          }
        } else {
          newSelectedIds.add(itemId);
        }
        return newSelectedIds;
      });
    }
  };

  return {isSelectMode, selectedItemIds, exitSelectMode, selectPressStart, selectPressEnd, selectClick};
}