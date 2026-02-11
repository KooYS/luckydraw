import { create } from "zustand";

interface StockDrawerState {
  open: boolean;
  pinned: boolean;
  isLandscape: boolean;
  /** 핀 고정 시 메인 콘텐츠가 피해야 할 여백 (px) */
  inset: { right: number; bottom: number };

  setOpen: (open: boolean) => void;
  setPinned: (pinned: boolean) => void;
  setIsLandscape: (landscape: boolean) => void;
  setInset: (inset: { right: number; bottom: number }) => void;
  close: () => void;
}

export const useStockDrawerStore = create<StockDrawerState>((set) => ({
  open: false,
  pinned: false,
  isLandscape: false,
  inset: { right: 0, bottom: 0 },

  setOpen: (open) => {
    if (!open) set({ open, inset: { right: 0, bottom: 0 } });
    else set({ open });
  },
  setPinned: (pinned) => {
    if (!pinned) set({ pinned, inset: { right: 0, bottom: 0 } });
    else set({ pinned });
  },
  setIsLandscape: (isLandscape) => set({ isLandscape }),
  setInset: (inset) => set({ inset }),
  close: () => set({ open: false, pinned: false, inset: { right: 0, bottom: 0 } }),
}));
