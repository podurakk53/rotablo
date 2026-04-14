import { create } from 'zustand';

export interface AppState {
  hasCompletedOnboarding: boolean;
  activeRouteSessionId: string | null;
  pendingCompletionIds: string[];
  completeOnboarding: () => void;
  queueCompletion: (entityId: string) => void;
  clearCompletionQueue: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  activeRouteSessionId: null,
  pendingCompletionIds: [],

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),

  queueCompletion: (entityId: string) =>
    set((state) => ({
      pendingCompletionIds: [...state.pendingCompletionIds, entityId],
    })),

  clearCompletionQueue: () => set({ pendingCompletionIds: [] }),
}));
