import { create } from "zustand";

export const useProgressionStore = create((set) => ({
  villagerCheckpointPassed: false,
  setVillagerCheckpointPassed: (passed) =>
    set({ villagerCheckpointPassed: passed }),
  isHoveringVillager: false,
  setIsHoveringVillager: (hovering) => set({ isHoveringVillager: hovering }),
}));
