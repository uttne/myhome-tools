import { create } from "zustand";

export type ShoppingMasterItemIconEmoji ={
  icon: string;
  iconType: "emoji";
}

// データの型定義（例）
export interface ShoppingMasterItem {
  id: number;
  name: string;
  icon?: ShoppingMasterItemIconEmoji;
  labels?: string[];
}

export type ShoppingMasterAddItem = Omit<ShoppingMasterItem, "id">;

// ストアのStateの型定義
interface ShoppingMasterItemState {
  data: ShoppingMasterItem[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>; // データを取得する非同期アクション
  clearData: () => void; // データをクリアするアクション（任意）
  addItem: (item: ShoppingMasterAddItem) => Promise<void>; // アイテムを追加するアクション（任意）
  removeItem: (id: number) => Promise<void>; // アイテムを削除するアクション（任意）
  updateItem: (item: ShoppingMasterItem) => Promise<void>; // アイテムを更新するアクション（任意）
}

// ストアの作成
const useShoppingMasterStore = create<ShoppingMasterItemState>((set) => ({
  // 初期状態
  data: [],
  isLoading: false,
  error: null,

  // データをフェッチする非同期アクション
  fetchData: async () => {
    set({ isLoading: true, error: null }); // ローディング開始、エラーをクリア

    try {
      // ここでAPI呼び出しを行う
      // 例: JSONPlaceholderから投稿を取得
      // const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10'); // ダミーAPI

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // const result: ShoppingMasterItem[] = await response.json();

      const result: ShoppingMasterItem[] = []; // ダミーデータ

      // 取得成功: データをセットし、ローディングを終了
      set({ data: result, isLoading: false });
    } catch (err: unknown) {
      // 取得失敗: エラーをセットし、ローディングを終了
      console.error("Failed to fetch data:", err);

      if (err instanceof Error) {
        set({
          error: err.message || "データの取得に失敗しました",
          isLoading: false,
          data: [],
        }); // エラー時はデータをクリアするか保持するかは要件による
      } else {
        set({
          error: "不明なエラーが発生しました",
          isLoading: false,
          data: [],
        }); // エラー時はデータをクリアするか保持するかは要件による
      }
    }
  },

  // データをクリアするアクション（例）
  clearData: () => {
    set({ data: [], isLoading: false, error: null });
  },
  // アイテムを追加するアクション（例）
  addItem: async (item: ShoppingMasterAddItem) => {
    set((state) => ({
      data: [
        ...state.data,
        { id: Math.max(0, ...state.data.map((d) => d.id)) + 1, ...item },
      ], // 新しいアイテムを追加
    }));
  },
  // アイテムを削除するアクション（例）
  removeItem: async (id: number) => {
    set((state) => ({
      data: state.data.filter((item) => item.id !== id), // 指定したIDのアイテムを削除
    }));
  },
  // アイテムを更新するアクション（例）
  updateItem: async (item: ShoppingMasterItem) => {
    set((state) => ({
      data: state.data.map((i) => (i.id === item.id ? item : i)), // 指定したIDのアイテムを更新
    }));
  },
}));

export default useShoppingMasterStore;
