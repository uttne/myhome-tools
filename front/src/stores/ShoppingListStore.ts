import { create } from "zustand";
import { ShoppingMasterItem } from "./ShoppingMasterStore";

/* ───────── 型 ───────── */
export type ShoppingListItemStatus = "pending" | "archived";

export interface ShoppingListItem {
  id: number;                       // ユニーク ID
  masterId: number;                 // ShoppingMasterItem.id
  name: string;                     // 表示用（マスター名をコピー）
  icon?: ShoppingMasterItem["icon"]; // 絵文字など
  quantity: number;
  addedAt: number;
  status: ShoppingListItemStatus;
  archivedAt?: number;              // unixtime (ms)
}

/* ───────── store ───────── */
interface ShoppingListState {
  items: ShoppingListItem[];
  addItem: (master: ShoppingMasterItem, qty?: number) => void;
  toggleArchived: (id: number) => void;
  clearArchived: () => void;
}

const useShoppingListStore = create<ShoppingListState>((set) => ({
  items: [],

  addItem: (master, qty = 1) =>
    set((state) => {
      const nextId = Math.max(0, ...state.items.map((i) => i.id)) + 1;
      return {
        items: [
          ...state.items,
          {
            id: nextId,
            masterId: master.id,
            name: master.name,
            icon: master.icon,
            quantity: qty,
            status: "pending",
            addedAt: Date.now(),
          },
        ],
      };
    }),

  toggleArchived: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? {
              ...i,
              status: i.status === "pending" ? "archived" : "pending",
              archivedAt:
                i.status === "pending" ? Date.now() : undefined,
            }
          : i
      ),
    })),

  clearArchived: () =>
    set((state) => ({
      items: state.items.filter((i) => i.status !== "archived"),
    })),
}));

export default useShoppingListStore;