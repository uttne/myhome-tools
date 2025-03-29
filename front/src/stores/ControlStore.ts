import {create} from 'zustand';

export type ControlBoxButtonData = {
  display: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

type ControlBoxState = {
  buttons: ControlBoxButtonData[];
  setButtons: (buttons: ControlBoxButtonData[]) => void;
  addButton: (button: ControlBoxButtonData) => void;
}

const useControlBoxState = create<ControlBoxState>((set)=>({
  buttons: [],
  setButtons: (buttons: ControlBoxButtonData[]) => set({ buttons }),
  addButton: (button: ControlBoxButtonData) => set((state) => ({ buttons: [...state.buttons, button] })),
}));

export default useControlBoxState;