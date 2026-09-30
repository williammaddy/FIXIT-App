import { create } from 'zustand';
import { Worker, Service } from '../types';

interface DraftBooking {
  worker: Worker | null;
  service: Service | null;
}

interface BookingStoreState {
  draft: DraftBooking;
  setDraft: (worker: Worker, service: Service) => void;
  clearDraft: () => void;
}

export const useBookingStore = create<BookingStoreState>((set) => ({
  draft: {
    worker: null,
    service: null,
  },
  setDraft: (worker: Worker, service: Service) => {
    set({ draft: { worker, service } });
  },
  clearDraft: () => {
    set({ draft: { worker: null, service: null } });
  },
}));
