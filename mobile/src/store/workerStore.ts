import { create } from 'zustand';
import { Worker } from '../types';

interface WorkerStoreState {
  profile: Worker | null;
  setProfile: (profile: Worker | null) => void;
  updateAvailability: (isAvailable: boolean) => void;
}

export const useWorkerStore = create<WorkerStoreState>((set) => ({
  profile: null,
  setProfile: (profile: Worker | null) => set({ profile }),
  updateAvailability: (isAvailable: boolean) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, isAvailable } : null,
    })),
}));
