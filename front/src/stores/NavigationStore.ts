import {create} from 'zustand';

export type NavigationData = {
  display: string;
  icon: React.ReactNode;
  path: string;
}

type NavigationState = {
  navigations: NavigationData[];
  setNavigations: (buttons: NavigationData[]) => void;
  addNavigation: (button: NavigationData) => void;
}

const useNavigationState = create<NavigationState>((set)=>({
  navigations: [],
  setNavigations: (buttons: NavigationData[]) => set({ navigations: buttons }),
  addNavigation: (button: NavigationData) => set((state) => ({ navigations: [...state.navigations, button] })),
}));

export default useNavigationState;