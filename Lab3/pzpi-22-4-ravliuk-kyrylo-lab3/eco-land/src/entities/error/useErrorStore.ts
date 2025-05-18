import { create } from "zustand";

interface ErrorStore {
  error: string;
  setError: (message: string) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorStore>((set) => ({
  error: "",
  setError: (message: string) => set({ error: message }),
  clearError: () => set({ error: "" }),
}));
