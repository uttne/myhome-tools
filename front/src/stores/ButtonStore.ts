import {create} from 'zustand';

export type ControlButtonData = {
  display: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

type ButtonStoreState = {
  buttons: ControlButtonData[];
  setButtons: (buttons: ControlButtonData[]) => void;
  addButton: (button: ControlButtonData) => void;
}

const useButtonStore = create<ButtonStoreState>((set)=>({
  buttons: [],
  setButtons: (buttons: ControlButtonData[]) => set({ buttons }),
  addButton: (button: ControlButtonData) => set((state) => ({ buttons: [...state.buttons, button] })),
}));

export default useButtonStore;