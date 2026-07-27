import { create } from "zustand";

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
}

const TOAST_MS = 3500;

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message });
    hideTimer = setTimeout(() => set({ message: null }), TOAST_MS);
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message: null });
  },
}));
