import { create } from "zustand";

export const useAudioStore = create((set) => ({
  isAudioEnabled: true,
  setIsAudioEnabled: (state) => set({ isAudioEnabled: state }),
}));
