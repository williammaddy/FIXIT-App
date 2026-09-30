import { create } from 'zustand';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
  isLoading: boolean;
  errorMsg: string | null;
  setLocation: (lat: number, lng: number, address?: string) => void;
  requestCurrentLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: 11.1085,
  longitude: 77.3411,
  address: 'Tiruppur Central, Tamil Nadu',
  isLoading: false,
  errorMsg: null,

  setLocation: (latitude: number, longitude: number, address?: string) => {
    set({
      latitude,
      longitude,
      address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      errorMsg: null,
    });
  },

  requestCurrentLocation: async () => {
    set({ isLoading: true, errorMsg: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({
          errorMsg: 'Permission to access location was denied. Using default location.',
          isLoading: false,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      let addressStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const parts = [item.name, item.street, item.city, item.region].filter(Boolean);
          if (parts.length > 0) {
            addressStr = parts.join(', ');
          }
        }
      } catch (e) {}

      set({
        latitude,
        longitude,
        address: addressStr,
        isLoading: false,
        errorMsg: null,
      });
    } catch (error: any) {
      set({
        errorMsg: error.message || 'Failed to get location',
        isLoading: false,
      });
    }
  },
}));
