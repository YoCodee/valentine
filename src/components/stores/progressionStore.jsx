import { create } from "zustand";

export const useProgressionStore = create((set) => ({
  villagerCheckpointPassed: false,
  setVillagerCheckpointPassed: (passed) =>
    set({ villagerCheckpointPassed: passed }),
  isHoveringVillager: false,
  setIsHoveringVillager: (hovering) => set({ isHoveringVillager: hovering }),
  giftImage: null,
  setGiftImage: (image) => set({ giftImage: image }),
  isHoveringChest: false,
  setIsHoveringChest: (hovering) => set({ isHoveringChest: hovering }),
}));
